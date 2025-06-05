// src/lib/services/monitoring-service.ts
// Service for handling website monitoring functionality

import { PrismaClient, AlertSeverity, ScheduleFrequency } from '@prisma/client';
import { addDays, addWeeks, addMonths, format } from 'date-fns';
import { NotificationService } from './notification-service';

const prisma = new PrismaClient();

export interface MonitoringThreshold {
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
}

export interface MonitoringAlert {
  websiteId: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  metric?: string;
  threshold?: number;
  value?: number;
}

export class MonitoringService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Check a website's metrics against configured thresholds
   * @param websiteId The ID of the website to check
   */
  async checkWebsiteMetrics(websiteId: string): Promise<MonitoringAlert[]> {
    try {
      // Get the monitoring configuration for the website
      const config = await prisma.monitoringConfig.findUnique({
        where: { websiteId },
        include: { website: true }
      });

      if (!config || !config.enabled) {
        return [];
      }

      // Get the most recent completed audit
      const latestAudit = await prisma.audit.findFirst({
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

      if (!latestAudit || !latestAudit.summary) {
        return [];
      }

      // Get the previous audit for comparison
      const previousAudit = await prisma.audit.findFirst({
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

      const alerts: MonitoringAlert[] = [];

      // Check metrics against thresholds
      for (const metric of config.metrics) {
        const currentValue = latestAudit.summary[metric as keyof typeof latestAudit.summary] as number;
        
        if (currentValue === undefined || currentValue === null) {
          continue;
        }

        // Check for significant drops in scores
        if (previousAudit && previousAudit.summary) {
          const previousValue = previousAudit.summary[metric as keyof typeof previousAudit.summary] as number;
          
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
                value: percentChange
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
            value: currentValue
          });
        }
      }

      // Create alerts in the database
      if (alerts.length > 0) {
        await prisma.alert.createMany({
          data: alerts.map(alert => ({
            ...alert,
            updatedAt: new Date()
          }))
        });

        // Send notifications if enabled
        if (config.emailNotifications) {
          await this.sendAlertNotifications(alerts, config.website.name, config.website.url);
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking website metrics:', error);
      throw error;
    }
  }

  /**
   * Schedule the next monitoring check
   * @param websiteId The ID of the website
   */
  async scheduleNextCheck(websiteId: string): Promise<Date | null> {
    try {
      const config = await prisma.monitoringConfig.findUnique({
        where: { websiteId }
      });

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

      // Update the website's monitoring configuration
      await prisma.monitoringConfig.update({
        where: { websiteId },
        data: {
          updatedAt: now
        }
      });

      return nextCheckDate;
    } catch (error) {
      console.error('Error scheduling next monitoring check:', error);
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
      const existingConfig = await prisma.monitoringConfig.findUnique({
        where: { websiteId }
      });

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
      console.error('Error toggling monitoring:', error);
      throw error;
    }
  }

  /**
   * Update monitoring configuration for a website
   * @param websiteId The ID of the website
   * @param config The monitoring configuration
   */
  async updateMonitoringConfig(
    websiteId: string,
    config: {
      enabled?: boolean;
      frequency?: ScheduleFrequency;
      alertThreshold?: number;
      metrics?: string[];
      emailNotifications?: boolean;
      slackWebhook?: string;
    }
  ): Promise<boolean> {
    try {
      const existingConfig = await prisma.monitoringConfig.findUnique({
        where: { websiteId }
      });

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
      console.error('Error updating monitoring config:', error);
      throw error;
    }
  }

  /**
   * Get monitoring alerts for a website
   * @param websiteId The ID of the website
   * @param options Options for filtering alerts
   */
  async getAlerts(
    websiteId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    try {
      const { unreadOnly = false, limit = 10, offset = 0 } = options;

      const alerts = await prisma.alert.findMany({
        where: {
          websiteId,
          ...(unreadOnly ? { read: false } : {})
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      return alerts;
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Mark alerts as read
   * @param alertIds The IDs of the alerts to mark as read
   */
  async markAlertsAsRead(alertIds: string[]): Promise<boolean> {
    try {
      await prisma.alert.updateMany({
        where: {
          id: {
            in: alertIds
          }
        },
        data: {
          read: true,
          updatedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      throw error;
    }
  }

  /**
   * Send notifications for alerts
   * @param alerts The alerts to send notifications for
   * @param websiteName The name of the website
   * @param websiteUrl The URL of the website
   */
  private async sendAlertNotifications(
    alerts: MonitoringAlert[],
    websiteName: string,
    websiteUrl: string
  ): Promise<void> {
    try {
      if (alerts.length === 0) {
        return;
      }

      const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL');
      const errorAlerts = alerts.filter(alert => alert.severity === 'ERROR');
      const warningAlerts = alerts.filter(alert => alert.severity === 'WARNING');

      let subject = `Website Monitoring Alert: ${websiteName}`;
      let urgency = 'normal';

      if (criticalAlerts.length > 0) {
        subject = `CRITICAL Alert: ${websiteName} has performance issues`;
        urgency = 'high';
      } else if (errorAlerts.length > 0) {
        subject = `ERROR Alert: ${websiteName} has performance issues`;
        urgency = 'medium';
      }

      const message = `
        <h2>Website Monitoring Alert</h2>
        <p><strong>Website:</strong> ${websiteName} (${websiteUrl})</p>
        <p><strong>Date:</strong> ${format(new Date(), 'PPpp')}</p>
        <p><strong>Total Alerts:</strong> ${alerts.length}</p>
        
        <h3>Alert Details:</h3>
        <ul>
          ${alerts.map(alert => `
            <li>
              <strong>${alert.severity}:</strong> ${alert.message}
            </li>
          `).join('')}
        </ul>
        
        <p>Please log in to the AutomatIQ dashboard to view more details and take action.</p>
      `;

      await this.notificationService.sendEmail({
        subject,
        message,
        urgency
      });
    } catch (error) {
      console.error('Error sending alert notifications:', error);
    }
  }

  /**
   * Determine severity level based on score drop percentage
   * @param percentDrop The percentage drop in score
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
   * Determine severity level based on absolute score value
   * @param score The score value
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
}
