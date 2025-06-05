// src/lib/services/monitoring-service.ts
// Service for handling website monitoring functionality

import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification-service';
import { MonitoringCache } from '../cache/monitoring-cache';
import { v4 as uuidv4 } from 'uuid';
import pRetry from 'p-retry';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

// Define types for AlertSeverity and ScheduleFrequency enums
export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// Define Alert type since it's not exported from Prisma
export interface Alert {
  id: string;
  websiteId: string;
  title?: string;
  message: string;
  severity: AlertSeverity;
  category?: string;
  url?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define AuditSummary interface for type safety
export interface AuditSummary {
  overallScore?: number;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  bestPracticesScore?: number;
  [key: string]: number | undefined;
}

// Define Audit interface for type safety
export interface Audit {
  id: string;
  websiteId: string;
  status: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  summary?: AuditSummary;
}

export const AlertSeverity = {
  INFO: 'INFO' as AlertSeverity,
  WARNING: 'WARNING' as AlertSeverity,
  ERROR: 'ERROR' as AlertSeverity,
  CRITICAL: 'CRITICAL' as AlertSeverity
};

// Define interface for monitoring alerts
export interface MonitoringAlert {
  websiteId: string;
  type?: string;
  severity: AlertSeverity;
  message: string;
  title?: string;
  category?: string;
  url?: string | null;
  metric?: string;
  threshold?: number;
  value?: number;
  timestamp?: Date;
}

// Define interface for monitoring configuration
export interface MonitoringConfig {
  id?: string;
  websiteId: string;
  enabled: boolean;
  frequency: string;
  alertThreshold: number;
  metrics: string[];
  emailNotifications: boolean;
  slackWebhook?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export enum ScheduleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM'
}

const prisma = new PrismaClient();

// Maximum number of retries for database operations
const MAX_RETRIES = 3;

// Retry options
const retryOptions = {
  retries: MAX_RETRIES,
  onFailedAttempt: (error: Error & { attemptNumber?: number }) => {
    console.error(`Database operation failed (attempt ${error.attemptNumber || 0}/${MAX_RETRIES + 1}):`, error.message);
  }
};

export interface MonitoringThreshold {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
}

export class MonitoringService {
  private notificationService: NotificationService;
  private prisma: PrismaClient;
  private logger: any; // Replace with proper logger type if available

  /**
   * Initialize the monitoring service
   * @param prismaInstance Optional Prisma instance to use (for testing/DI)
   */
  constructor(prismaInstance?: PrismaClient) {
    this.prisma = prismaInstance || prisma;
    this.notificationService = new NotificationService(this.prisma);
    this.logger = console; // Replace with proper logger if available
  }

  /**
   * Check a website's metrics against configured thresholds
   * @param websiteId The ID of the website to check
   * @returns Promise resolving to an array of monitoring alerts
   */
  /**
   * Check a website's metrics against configured thresholds
   * @param websiteId The ID of the website to check
   * @returns Promise resolving to an array of monitoring alerts
   */
  async checkWebsiteMetrics(websiteId: string): Promise<MonitoringAlert[]> {
    try {
      // Get the monitoring configuration for the website
      const config = await this.getMonitoringConfig(websiteId) as MonitoringConfig;

      if (!config || !config.enabled) {
        return [];
      }

      // Get the most recent completed audit with retry logic
      const latestAudit = await pRetry(async () => {
        return await prisma.audit.findFirst({
          where: {
            websiteId,
            status: 'COMPLETED'
          },
          orderBy: {
            completedAt: 'desc'
          },
          include: {
            summary: true
          }
        });
      }, retryOptions);

      if (!latestAudit || !latestAudit.summary) {
        return [];
      }

      // Get the previous audit for comparison with retry logic
      const previousAudit = await pRetry(async () => {
        return await prisma.audit.findFirst({
          where: {
            websiteId,
            status: 'COMPLETED',
            completedAt: {
              lt: latestAudit.completedAt
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          include: {
            summary: true
          }
        });
      }, retryOptions);

      const alerts: MonitoringAlert[] = [];

      // Check metrics against thresholds
      for (const metric of config.metrics) {
        const currentValue = latestAudit.summary[metric] as number | undefined;
        
        if (currentValue === undefined || currentValue === null) {
          continue;
        }

        // Check for significant drops in scores
        if (previousAudit && previousAudit.summary) {
          const previousValue = previousAudit.summary[metric] as number | undefined;
          
          if (previousValue !== undefined && previousValue !== null) {
            const difference = currentValue - previousValue;
            const percentChange = (difference / previousValue) * 100;
            
            // Alert if score dropped by more than the threshold percentage
            if (difference < 0 && Math.abs(percentChange) >= config.alertThreshold) {
              alerts.push({
                websiteId,
                type: 'SCORE_DROP',
                severity: this.getSeverityForScoreDrop(Math.abs(percentChange)),
                message: `${metric} dropped by ${Math.abs(percentChange).toFixed(1)}% (from ${previousValue} to ${currentValue})`,
                metric,
                threshold: config.alertThreshold,
                value: percentChange,
                timestamp: new Date()
              });
            }
          }
        }

        // Check for low absolute scores
        if (currentValue < 50) {
          alerts.push({
            websiteId,
            type: 'LOW_SCORE',
            severity: this.getSeverityForLowScore(currentValue),
            message: `${metric} is critically low at ${currentValue}`,
            metric,
            value: currentValue,
            timestamp: new Date()
          });
        }
      }

      // Create alerts in the database
      if (alerts.length > 0) {
        for (const alert of alerts) {
          await this.createAlert(websiteId, alert);
        }

        // Send notifications if configured
        if (config.emailNotifications) {
          await this.notificationService.sendAlertNotifications(websiteId, alerts);
        }
      }

      return alerts;
    } catch (error) {
      this.logger.error('Error checking website metrics:', error);
      throw error;
    }
  }

  /**
   * Schedule the next monitoring check based on frequency settings
   * @param websiteId The ID of the website
   * @returns Promise resolving to the next check date or null if monitoring is disabled
   */
  async scheduleNextCheck(websiteId: string): Promise<Date | null> {
    try {
      const config = await this.getMonitoringConfig(websiteId);

      if (!config || !config.enabled) {
        return null;
      }

      const now = new Date();
      let nextCheckDate: Date;

      // Calculate next check date based on frequency
      switch (config.frequency) {
        case 'DAILY':
          nextCheckDate = addDays(now, 1);
          break;
        case 'WEEKLY':
          nextCheckDate = addWeeks(now, 1);
          break;
        case 'BIWEEKLY':
          nextCheckDate = addWeeks(now, 2);
          break;
        case 'MONTHLY':
          nextCheckDate = addMonths(now, 1);
          break;
        case 'QUARTERLY':
          nextCheckDate = addMonths(now, 3);
          break;
        default:
          nextCheckDate = addWeeks(now, 1); // Default to weekly
      }

      // Update the website's monitoring configuration with retry logic
      await pRetry(async () => {
        await prisma.monitoringConfig.update({
          where: { websiteId },
          data: {
            updatedAt: now,
            nextCheckAt: nextCheckDate
          }
        });
      }, retryOptions);

      return nextCheckDate;
    } catch (error) {
      this.logger.error('Error scheduling next monitoring check:', error);
      throw error;
    }
  }

  /**
   * Enable or disable monitoring for a website
   * @param websiteId The ID of the website
   * @param enabled Whether monitoring should be enabled
   */
  async toggleMonitoring(websiteId: string, enabled: boolean): Promise<boolean> {
    try {
      // Check if monitoring config exists
      const existingConfig = await this.getMonitoringConfig(websiteId);

      if (existingConfig) {
        // Update existing config
        await prisma.monitoringConfig.update({
          where: { websiteId },
          data: {
            enabled,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new config with defaults
        await prisma.monitoringConfig.create({
          data: {
            websiteId,
            enabled,
            frequency: 'WEEKLY',
            alertThreshold: 10,
            metrics: ['overallScore', 'seoScore', 'performanceScore'],
            emailNotifications: true,
            updatedAt: new Date()
          }
        });
      }

      // Update the website's monitoring flag
      await prisma.website.update({
        where: { id: websiteId },
        data: {
          monitoringEnabled: enabled,
          updatedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      this.logger.error('Error toggling monitoring:', error);
      throw error;
    }
  }

  /**
   * Update monitoring configuration for a website
   * @param websiteId The ID of the website
   * @param config The monitoring configuration
   * @returns Promise resolving to boolean indicating success
   */
  async updateMonitoringConfig(
    websiteId: string,
    config: {
      enabled?: boolean;
      frequency?: string;
      alertThreshold?: number;
      metrics?: string[];
      emailNotifications?: boolean;
      slackWebhook?: string;
    }
  ): Promise<boolean> {
    try {
      const existingConfig = await this.getMonitoringConfig(websiteId);

      if (existingConfig) {
        await prisma.monitoringConfig.update({
          where: { websiteId },
          data: {
            ...config,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.monitoringConfig.create({
          data: {
            websiteId,
            ...config,
            updatedAt: new Date()
          }
        });
      }

      // Update the website's monitoring flag if enabled status is provided
      if (config.enabled !== undefined) {
        await prisma.website.update({
          where: { id: websiteId },
          data: {
            monitoringEnabled: config.enabled,
            updatedAt: new Date()
          }
        });
      }

      return true;
    } catch (error) {
      this.logger.error('Error updating monitoring config:', error);
      return false;
    }
  }

  /**
   * Get monitoring configuration for a website
   * @param websiteId The ID of the website
   * @returns Promise resolving to the monitoring configuration or null if not found
   */
  async getMonitoringConfig(websiteId: string): Promise<MonitoringConfig | null> {
    try {
      // Try to get from cache first
      const cachedConfig = await MonitoringCache.getConfig(websiteId);
      if (cachedConfig) {
        return cachedConfig;
      }

      // If not in cache, get from database with retry logic
      const config = await pRetry(async () => {
        return await prisma.monitoringConfig.findFirst({
          where: { websiteId }
        });
      }, retryOptions);

      // Cache the result if config exists
      if (config) {
        await MonitoringCache.setConfig(websiteId, config);
      }

      return config;
    } catch (error) {
      this.logger.error('Error getting monitoring config:', error);
      return null;
    }
  }

  /**
   * Get alerts from cache or database with pagination and filtering options
   * @param websiteId The ID of the website
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 10)
   * @param unreadOnly Whether to return only unread alerts (default: false)
   * @returns Promise resolving to an array of alerts
   */
  async getAlertsFromCacheOrDatabase(
    websiteId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false
  ): Promise<Alert[]> {
    try {
      // Calculate offset from page and limit
      const offset = (page - 1) * limit;
      
      // Try to get from cache first
      const cachedAlerts = await MonitoringCache.getAlerts(websiteId, {
        limit,
        offset,
        unreadOnly
      });
      
      if (cachedAlerts && cachedAlerts.length > 0) {
        return cachedAlerts;
      }

      // If not in cache, get from database with retry logic
      const alerts = await pRetry(
        async () => {
          return await prisma.alert.findMany({
            where: {
              websiteId,
              ...(unreadOnly ? { read: false } : {})
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit
          });
        },
        retryOptions
      );
      
      // Cache the results
      await MonitoringCache.setAlerts(websiteId, alerts, {
        limit,
        offset,
        unreadOnly
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Get total count of alerts for a website
   * @param websiteId The ID of the website
   * @param unreadOnly Whether to count only unread alerts
   * @returns Promise resolving to the number of alerts
   */
  async getAlertsCount(websiteId: string, unreadOnly: boolean = false): Promise<number> {
    try {
      // Try to get count from cache first
      const cachedCount = await MonitoringCache.getAlertsCount(websiteId, unreadOnly);
      if (cachedCount !== null) {
        return cachedCount;
      }

      // If not in cache, fetch from database with retry mechanism
      const count = await pRetry(async () => {
        return await prisma.alert.count({
          where: {
            websiteId,
            ...(unreadOnly ? { read: false } : {}),
          },
        });
      }, retryOptions);

      // Cache the count
      await MonitoringCache.setAlertsCount(websiteId, count, unreadOnly);

      return count;
    } catch (error) {
      this.logger.error('Error counting alerts:', error);
      return 0;
    }
  }

  /**
   * Mark alerts as read
   * @param websiteId The ID of the website
   * @param alertIds The IDs of the alerts to mark as read
   * @returns Promise resolving to boolean indicating success
   */
  async markAlertsAsRead(websiteId: string, alertIds: string[]): Promise<boolean> {
    try {
      // Update alerts with retry mechanism
      await pRetry(async () => {
        await prisma.alert.updateMany({
          where: {
            id: { in: alertIds },
            websiteId,
          },
          data: {
            read: true,
            updatedAt: new Date(),
          },
        });
      }, retryOptions);

      // Invalidate cache for this website's alerts
      await MonitoringCache.invalidateAlertsCache(websiteId);

      return true;
    } catch (error) {
      this.logger.error('Error marking alerts as read:', error);
      return false;
    }
  }

  /**
   * Create an alert in the database
   * @param websiteId The ID of the website
   * @param alert The alert to create
   * @returns Promise resolving to the created alert
   */
  async createAlert(websiteId: string, alert: MonitoringAlert): Promise<Alert> {
    try {
      // Create alert with retry mechanism
      const createdAlert = await pRetry(async () => {
        return await prisma.alert.create({
          data: {
            id: uuidv4(),
            websiteId,
            title: alert.title || alert.message.substring(0, 100), // Use message as title if not provided
            message: alert.message,
            severity: alert.severity,
            category: alert.category || alert.type || 'GENERAL',
            url: alert.url || null,
            read: false,
            createdAt: alert.timestamp || new Date(),
            updatedAt: new Date(),
          },
        });
      }, retryOptions);

      // Invalidate cache for this website's alerts
      await MonitoringCache.invalidateAlertsCache(websiteId);

      return createdAlert;
    } catch (error) {
      this.logger.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Determine severity level based on score drop percentage
   * @param percentDrop The percentage drop in score
   * @returns The appropriate alert severity level
   */
  private getSeverityForScoreDrop(percentDrop: number): AlertSeverity {
    if (percentDrop >= 30) {
      return 'CRITICAL';
    } else if (percentDrop >= 20) {
      return 'ERROR';
    } else if (percentDrop >= 10) {
      return 'WARNING';
    } else {
      return 'INFO';
    }
  }

  /**
   * Determine severity level based on absolute score
   * @param score The absolute score value
   * @returns The appropriate alert severity level
   */
  private getSeverityForLowScore(score: number): AlertSeverity {
    if (score < 30) {
      return 'CRITICAL';
    } else if (score < 40) {
      return 'ERROR';
    } else if (score < 50) {
      return 'WARNING';
    } else {
      return 'INFO';
    }
  }

  /**
   * Delete alerts for a website
   * @param websiteId The ID of the website
   * @param olderThan Optional date to delete alerts older than
   * @returns Promise resolving to the number of deleted alerts
   */
  async deleteAlerts(websiteId: string, olderThan?: Date): Promise<number> {
    try {
      // Delete alerts with retry mechanism
      const result = await pRetry(async () => {
        return await prisma.alert.deleteMany({
          where: {
            websiteId,
            ...(olderThan ? { createdAt: { lt: olderThan } } : {})
          }
        });
      }, retryOptions);

      // Invalidate cache for this website's alerts
      await MonitoringCache.invalidateAlertsCache(websiteId);

      return result.count;
    } catch (error) {
      this.logger.error('Error deleting alerts:', error);
      return 0;
    }
  }

  /**
   * Get all unread alerts for a website
   * @param websiteId The ID of the website
   * @returns Promise resolving to an array of unread alerts
   */
  async getUnreadAlerts(websiteId: string): Promise<Alert[]> {
    return this.getAlertsFromCacheOrDatabase(websiteId, 1, 100, true);
  }

  /**
   * Mark all alerts as read for a website
   * @param websiteId The ID of the website
   * @returns Promise resolving to boolean indicating success
   */
  async markAllAlertsAsRead(websiteId: string): Promise<boolean> {
    try {
      // Update all alerts with retry mechanism
      await pRetry(async () => {
        await prisma.alert.updateMany({
          where: {
            websiteId,
            read: false
          },
          data: {
            read: true,
            updatedAt: new Date()
          }
        });
      }, retryOptions);

      // Invalidate cache for this website's alerts
      await MonitoringCache.invalidateAlertsCache(websiteId);

      return true;
    } catch (error) {
      this.logger.error('Error marking all alerts as read:', error);
      return false;
    }
  }

  /**
   * Run monitoring checks for all websites that are due for a check
   * @returns Promise resolving to the number of websites checked
   */
  async runScheduledChecks(): Promise<number> {
    try {
      const now = new Date();
      
      // Find all websites due for a check
      const dueConfigs = await pRetry(async () => {
        return await prisma.monitoringConfig.findMany({
          where: {
            enabled: true,
            nextCheckAt: {
              lte: now
            }
          },
          include: {
            website: true
          }
        });
      }, retryOptions);

      let checkedCount = 0;

      // Run checks for each website
      for (const config of dueConfigs) {
        try {
          // Check metrics
          const alerts = await this.checkWebsiteMetrics(config.websiteId);
          
          // Schedule next check
          await this.scheduleNextCheck(config.websiteId);
          
          checkedCount++;
          
          this.logger.info(`Completed monitoring check for website ${config.websiteId}, found ${alerts.length} alerts`);
        } catch (checkError) {
          this.logger.error(`Error running check for website ${config.websiteId}:`, checkError);
        }
      }

      return checkedCount;
    } catch (error) {
      this.logger.error('Error running scheduled checks:', error);
      return 0;
    }
  }
}

