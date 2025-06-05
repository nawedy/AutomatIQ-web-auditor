// src/scripts/verify-monitoring-cron.ts
// Script to verify the monitoring cron functionality directly

import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import { MonitoringService } from '../lib/services/monitoring-service';
import { Logger } from '../lib/logger';

// Initialize logger and Prisma client
const logger = new Logger('verify-monitoring-cron');
const prisma = new PrismaClient();

/**
 * Set up test data for monitoring verification
 */
async function setupTestData() {
  logger.info('Setting up test data for monitoring verification...');
  
  try {
    // Find a test website or create one if it doesn't exist
    let website = await prisma.website.findFirst({
      where: {
        name: { contains: 'Test' }
      }
    });
    
    if (!website) {
      logger.info('Creating test website...');
      website = await prisma.website.create({
        data: {
          name: 'Test Website for Monitoring',
          url: 'https://example.com',
          userId: 'test-user-id', // Replace with a valid user ID from your database
          status: 'ACTIVE'
        }
      });
    }
    
    // Check if monitoring config exists for this website
    let monitoringConfig = await prisma.monitoringConfig.findUnique({
      where: {
        websiteId: website.id
      }
    });
    
    // Create or update monitoring config to be due for a check
    const now = new Date();
    const pastDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    
    if (monitoringConfig) {
      logger.info(`Updating existing monitoring config for website ${website.id}...`);
      monitoringConfig = await prisma.monitoringConfig.update({
        where: {
          websiteId: website.id
        },
        data: {
          enabled: true,
          frequency: 'DAILY',
          nextCheckAt: pastDate,
          metrics: ['PERFORMANCE', 'SEO', 'ACCESSIBILITY'],
          alertThreshold: 10
        }
      });
    } else {
      logger.info(`Creating new monitoring config for website ${website.id}...`);
      monitoringConfig = await prisma.monitoringConfig.create({
        data: {
          websiteId: website.id,
          enabled: true,
          frequency: 'DAILY',
          nextCheckAt: pastDate,
          metrics: ['PERFORMANCE', 'SEO', 'ACCESSIBILITY'],
          alertThreshold: 10
        }
      });
    }
    
    logger.info(`Test data setup complete. Website ID: ${website.id}, Config ID: ${monitoringConfig.id}`);
    return { website, monitoringConfig };
    
  } catch (error) {
    logger.error('Error setting up test data:', error);
    throw error;
  }
}

/**
 * Run the monitoring service directly
 */
async function runMonitoringService() {
  logger.info('Running monitoring service directly...');
  
  try {
    const monitoringService = new MonitoringService();
    
    // Get count of websites due for a check
    const dueConfigs = await prisma.monitoringConfig.findMany({
      where: {
        enabled: true,
        nextCheckAt: {
          lte: new Date()
        }
      },
      include: {
        website: true
      }
    });
    
    logger.info(`Found ${dueConfigs.length} websites due for a check`);
    
    // Run scheduled checks
    const checkedCount = await monitoringService.runScheduledChecks();
    logger.info(`Completed checks for ${checkedCount} websites`);
    
    // Verify next check dates were updated
    const updatedConfigs = await prisma.monitoringConfig.findMany({
      where: {
        websiteId: {
          in: dueConfigs.map(config => config.websiteId)
        }
      }
    });
    
    const now = new Date();
    const allUpdated = updatedConfigs.every(config => config.nextCheckAt > now);
    
    if (allUpdated) {
      logger.info('All next check dates were updated successfully');
    } else {
      logger.error('Some next check dates were not updated properly');
    }
    
    return {
      dueCount: dueConfigs.length,
      checkedCount,
      allUpdated
    };
  } catch (error) {
    logger.error('Error running monitoring service:', error);
    throw error;
  }
}

/**
 * Run the verification process
 */
async function run() {
  try {
    // Setup test data
    await setupTestData();
    
    // Run monitoring service
    const result = await runMonitoringService();
    
    // Log results
    logger.info('\n==== VERIFICATION RESULTS ====');
    logger.info(`Websites due for check: ${result.dueCount}`);
    logger.info(`Websites checked: ${result.checkedCount}`);
    logger.info(`All next check dates updated: ${result.allUpdated}`);
    logger.info('===============================\n');
    
    // Overall verification result
    const success = result.checkedCount > 0 && result.allUpdated;
    logger.info(`Overall verification ${success ? 'PASSED' : 'FAILED'}`);
    
    return success;
  } catch (error) {
    logger.error('Verification failed with error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
run()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
