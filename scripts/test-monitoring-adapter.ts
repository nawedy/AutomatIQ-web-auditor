// src/scripts/test-monitoring-adapter.ts
// Script to test the MonitoringServiceAdapter implementation

import { PrismaClient } from '@prisma/client';
import { MonitoringServiceAdapter } from '../lib/services/monitoring-service-adapter';
import { Logger } from '../lib/logger';

// Initialize logger and Prisma client
const logger = new Logger('test-monitoring-adapter');
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
      // Find any user to associate with the test website
      const user = await prisma.user.findFirst();
      
      if (!user) {
        logger.error('No users found in the database');
        throw new Error('No users found in the database');
      }
      
      logger.info('Creating test website...');
      website = await prisma.website.create({
        data: {
          name: 'Test Website for Monitoring',
          url: 'https://example.com',
          userId: user.id
        }
      });
    }
    
    // Check if monitoring config exists for this website
    let monitoringConfig = await prisma.monitoringConfig.findUnique({
      where: {
        websiteId: website.id
      }
    });
    
    // Create or update monitoring config
    if (monitoringConfig) {
      logger.info(`Updating existing monitoring config for website ${website.id}...`);
      monitoringConfig = await prisma.monitoringConfig.update({
        where: {
          websiteId: website.id
        },
        data: {
          enabled: true,
          frequency: 'DAILY',
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
          metrics: ['PERFORMANCE', 'SEO', 'ACCESSIBILITY'],
          alertThreshold: 10
        }
      });
    }
    
    // Create a monitoring check record that's old enough to trigger a new check
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 2); // 2 days ago
    
    await prisma.monitoringCheck.create({
      data: {
        websiteId: website.id,
        startedAt: oldDate,
        completedAt: oldDate,
        status: 'COMPLETED',
        results: { alertCount: 0 }
      }
    });
    
    logger.info(`Test data setup complete. Website ID: ${website.id}, Config ID: ${monitoringConfig.id}`);
    return { website, monitoringConfig };
    
  } catch (error) {
    logger.error('Error setting up test data:', error);
    throw error;
  }
}

/**
 * Test the MonitoringServiceAdapter
 */
async function testMonitoringAdapter() {
  logger.info('Testing MonitoringServiceAdapter...');
  
  try {
    const adapter = new MonitoringServiceAdapter();
    
    // Get websites due for a check
    const dueWebsites = await adapter.getWebsitesDueForCheck();
    logger.info(`Found ${dueWebsites.length} websites due for a check`);
    
    // Run scheduled checks
    const checkedCount = await adapter.runScheduledChecks();
    logger.info(`Completed checks for ${checkedCount} websites`);
    
    // Verify that checks were created
    const recentChecks = await prisma.monitoringCheck.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60000) // Created in the last minute
        }
      }
    });
    
    logger.info(`Found ${recentChecks.length} recent monitoring checks`);
    
    return {
      dueWebsitesCount: dueWebsites.length,
      checkedCount,
      recentChecksCount: recentChecks.length
    };
  } catch (error) {
    logger.error('Error testing monitoring adapter:', error);
    throw error;
  }
}

/**
 * Run the test
 */
async function run() {
  try {
    // Setup test data
    await setupTestData();
    
    // Test the adapter
    const result = await testMonitoringAdapter();
    
    // Log results
    logger.info('\n==== TEST RESULTS ====');
    logger.info(`Websites due for check: ${result.dueWebsitesCount}`);
    logger.info(`Websites checked: ${result.checkedCount}`);
    logger.info(`Recent checks created: ${result.recentChecksCount}`);
    logger.info('=======================\n');
    
    // Overall test result
    const success = result.checkedCount > 0 && result.recentChecksCount > 0;
    logger.info(`Overall test ${success ? 'PASSED' : 'FAILED'}`);
    
    return success;
  } catch (error) {
    logger.error('Test failed with error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
run()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
