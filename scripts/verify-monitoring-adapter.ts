// src/scripts/verify-monitoring-adapter.ts
// Script to verify the MonitoringServiceAdapter implementation with existing schema

import { PrismaClient } from '@prisma/client';
import { MonitoringServiceAdapter } from '../lib/services/monitoring-service-adapter.js';
import { Logger } from '../lib/logger.js';

// Initialize logger and Prisma client
const logger = new Logger('verify-monitoring-adapter');
const prisma = new PrismaClient();

/**
 * Ensure at least one website has audit scheduling enabled
 */
async function ensureAuditSchedulingEnabled() {
  logger.info('Ensuring at least one website has audit scheduling enabled...');
  
  try {
    // Find any website
    const website = await prisma.website.findFirst();
    
    if (!website) {
      logger.error('No websites found in the database');
      throw new Error('No websites found in the database');
    }
    
    // Check if audit schedule exists for this website
    let auditSchedule = await prisma.auditSchedule.findUnique({
      where: {
        websiteId: website.id
      }
    });
    
    // Create or update audit schedule
    if (auditSchedule) {
      logger.info(`Updating existing audit schedule for website ${website.id}...`);
      auditSchedule = await prisma.auditSchedule.update({
        where: {
          websiteId: website.id
        },
        data: {
          enabled: true,
          frequency: 'DAILY',
          categories: ['SEO', 'PERFORMANCE', 'ACCESSIBILITY']
        }
      });
    } else {
      logger.info(`Creating new audit schedule for website ${website.id}...`);
      auditSchedule = await prisma.auditSchedule.create({
        data: {
          websiteId: website.id,
          enabled: true,
          frequency: 'DAILY',
          categories: ['SEO', 'PERFORMANCE', 'ACCESSIBILITY']
        }
      });
    }
    
    logger.info(`Audit scheduling enabled for website ${website.id}`);
    return { website, auditSchedule };
    
  } catch (error) {
    logger.error('Error ensuring audit scheduling:', error);
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
    
    return {
      dueWebsitesCount: dueWebsites.length,
      checkedCount
    };
  } catch (error) {
    logger.error('Error testing monitoring adapter:', error);
    throw error;
  }
}

/**
 * Run the verification
 */
async function run() {
  try {
    // Ensure at least one website has audit scheduling enabled
    await ensureAuditSchedulingEnabled();
    
    // Test the adapter
    const result = await testMonitoringAdapter();
    
    // Log results
    logger.info('\n==== TEST RESULTS ====');
    logger.info(`Websites due for check: ${result.dueWebsitesCount}`);
    logger.info(`Websites checked: ${result.checkedCount}`);
    logger.info('=======================\n');
    
    // Overall test result
    const success = result.dueWebsitesCount > 0;
    logger.info(`Overall test ${success ? 'PASSED' : 'FAILED'}`);
    
    return success;
  } catch (error) {
    logger.error('Test failed with error:', error);
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
