// src/lib/services/monitoring-service-adapter.ts
// Adapter for MonitoringService to work with the existing database schema

import { PrismaClient } from '@prisma/client';
import { addDays, addWeeks, addMonths } from 'date-fns';
import pRetry from 'p-retry';
import { Logger } from '../logger';
import { MonitoringService } from './monitoring-service';

const prisma = new PrismaClient();
const logger = new Logger('monitoring-service-adapter');

// Retry options for database operations
const retryOptions = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 3000,
  onRetry: (error: Error, attempt: number) => {
    logger.warn(`Retry attempt ${attempt} due to error:`, error);
  }
};

// Temporary in-memory storage for monitoring data
type MonitoringCheckRecord = {
  websiteId: string;
  timestamp: Date;
  status: string;
  results?: any;
};

const monitoringChecks: MonitoringCheckRecord[] = [];

/**
 * Adapter for MonitoringService to work with the existing database schema
 * This adapter provides methods for scheduled monitoring checks without requiring schema changes
 */
type StorageType = 'in-memory' | 'database';

type AdapterOptions = {
  storage?: StorageType;
};

export class MonitoringServiceAdapter {
  private monitoringService: MonitoringService;
  private storageType: StorageType;
  
  constructor(options?: AdapterOptions) {
    this.monitoringService = new MonitoringService();
    this.storageType = options?.storage || 'in-memory';
  }
  
  /**
   * Run monitoring checks for all websites
   * @returns Promise resolving to the number of websites checked
   */
  async runScheduledChecks(): Promise<number> {
    try {
      // Get all websites
      const websites = await pRetry(async () => {
        return await prisma.website.findMany({
          include: {
            auditSchedule: true
          }
        });
      }, retryOptions);
      
      logger.info(`Found ${websites.length} websites`);
      
      let checkedCount = 0;
      const now = new Date();
      
      // Check each website that has audit scheduling enabled
      for (const website of websites) {
        try {
          // Use audit schedule as a proxy for monitoring schedule
          if (website.auditSchedule?.enabled) {
            // Find the most recent check for this website
            const lastCheck = monitoringChecks
              .filter(check => check.websiteId === website.id)
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
            
            // Determine if a check is due based on audit frequency
            const frequency = website.auditSchedule.frequency;
            const isDue = !lastCheck || this.isCheckDue(frequency, lastCheck.timestamp);
            
            if (isDue) {
              logger.info(`Running check for website ${website.id} (${website.name})`);
              
              // Record the check start
              const checkRecord: MonitoringCheckRecord = {
                websiteId: website.id,
                timestamp: new Date(),
                status: 'RUNNING'
              };
              monitoringChecks.push(checkRecord);
              
              // Run the check using the monitoring service
              try {
                await this.monitoringService.runScheduledChecks();
                
                // Update the check record
                checkRecord.status = 'COMPLETED';
                checkRecord.results = { success: true };
                
                checkedCount++;
                logger.info(`Completed monitoring check for website ${website.id}`);
              } catch (error) {
                const runError = error as Error;
                checkRecord.status = 'FAILED';
                checkRecord.results = { error: runError.message || 'Unknown error' };
                logger.error(`Failed monitoring check for website ${website.id}:`, runError);
              }
            } else {
              logger.debug(`Skipping check for website ${website.id}, not due yet`);
            }
          }
        } catch (checkError) {
          logger.error(`Error processing website ${website.id}:`, checkError);
        }
      }
      
      return checkedCount;
    } catch (error) {
      logger.error('Error running scheduled checks:', error);
      return 0;
    }
  }
  
  /**
   * Determine if a check is due based on frequency and last check date
   * @param frequency The check frequency (DAILY, WEEKLY, etc.)
   * @param lastCheckDate The date of the last check
   * @returns True if a check is due, false otherwise
   */
  private isCheckDue(frequency: string, lastCheckDate?: Date): boolean {
    if (!lastCheckDate) {
      return true; // No previous check, so it's due
    }
    
    const now = new Date();
    let nextDueDate: Date;
    
    // Calculate when the next check should be based on frequency
    switch (frequency) {
      case 'DAILY':
        nextDueDate = addDays(lastCheckDate, 1);
        break;
      case 'WEEKLY':
        nextDueDate = addWeeks(lastCheckDate, 1);
        break;
      case 'BIWEEKLY':
        nextDueDate = addWeeks(lastCheckDate, 2);
        break;
      case 'MONTHLY':
        nextDueDate = addMonths(lastCheckDate, 1);
        break;
      case 'QUARTERLY':
        nextDueDate = addMonths(lastCheckDate, 3);
        break;
      default:
        nextDueDate = addWeeks(lastCheckDate, 1); // Default to weekly
    }
    
    return now >= nextDueDate;
  }
  
  /**
   * Get websites due for a monitoring check
   * @returns Promise resolving to an array of website IDs due for a check
   */
  async getWebsitesDueForCheck(): Promise<string[]> {
    try {
      // Get all websites with audit scheduling enabled
      const websites = await pRetry(async () => {
        return await prisma.website.findMany({
          where: {
            auditSchedule: {
              enabled: true
            }
          },
          include: {
            auditSchedule: true
          }
        });
      }, retryOptions);
      
      const dueWebsites: string[] = [];
      
      // Check each website based on its audit frequency and last monitoring check
      for (const website of websites) {
        // Find the most recent check for this website
        const lastCheck = monitoringChecks
          .filter(check => check.websiteId === website.id)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        
        // Determine if a check is due based on frequency
        const frequency = website.auditSchedule?.frequency || 'WEEKLY';
        const isDue = !lastCheck || this.isCheckDue(frequency, lastCheck.timestamp);
        
        if (isDue) {
          dueWebsites.push(website.id);
        }
      }
      
      return dueWebsites;
    } catch (error) {
      logger.error('Error getting websites due for check:', error);
      return [];
    }
  }
}
