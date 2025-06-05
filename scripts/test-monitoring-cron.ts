// src/scripts/test-monitoring-cron.ts
// Script to test the monitoring cron job functionality

import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import { Logger } from '../lib/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

const logger = new Logger('test-monitoring-cron');
const prisma = new PrismaClient();
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  logger.error('CRON_SECRET environment variable is not set');
  logger.error('Please add CRON_SECRET to your .env.local file');
  process.exit(1);
}

/**
 * Set up test data for monitoring cron job
 */
async function setupTestData() {
  logger.info('Setting up test data for monitoring cron job...');
  
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
 * Test the monitoring cron job health check endpoint
 */
async function testHealthCheck() {
  logger.info('Testing monitoring cron health check endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/cron/run-monitoring-checks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    const data = await response.json();
    logger.info('Health check response:', data);
    
    if (!response.ok) {
      logger.error(`Health check failed with status ${response.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Error testing health check endpoint:', error);
    return false;
  }
}

/**
 * Test the monitoring cron job execution
 */
async function testCronExecution() {
  logger.info('Testing monitoring cron execution endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/cron/run-monitoring-checks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    const data = await response.json();
    logger.info('Cron execution response:', data);
    
    if (!response.ok) {
      logger.error(`Cron execution failed with status ${response.status}`);
      return false;
    }
    
    return data.checkedCount > 0;
  } catch (error) {
    logger.error('Error testing cron execution endpoint:', error);
    return false;
  }
}

/**
 * Verify that the monitoring config was updated after cron execution
 */
async function verifyConfigUpdated(websiteId: string) {
  logger.info(`Verifying monitoring config was updated for website ${websiteId}...`);
  
  try {
    const config = await prisma.monitoringConfig.findUnique({
      where: {
        websiteId
      }
    });
    
    if (!config) {
      logger.error('Monitoring config not found');
      return false;
    }
    
    const now = new Date();
    
    // Check if nextCheckAt was updated to a future date
    if (config.nextCheckAt && config.nextCheckAt > now) {
      logger.info(`Config updated successfully. Next check scheduled for ${config.nextCheckAt}`);
      return true;
    } else {
      logger.error(`Config not updated properly. Next check date: ${config.nextCheckAt}`);
      return false;
    }
  } catch (error) {
    logger.error('Error verifying config update:', error);
    return false;
  }
}

/**
 * Run the complete test suite
 */
async function runTests() {
  try {
    // Setup test data
    const { website, monitoringConfig } = await setupTestData();
    
    // Test health check endpoint
    const healthCheckResult = await testHealthCheck();
    logger.info(`Health check test ${healthCheckResult ? 'PASSED' : 'FAILED'}`);
    
    // Test cron execution
    const cronExecutionResult = await testCronExecution();
    logger.info(`Cron execution test ${cronExecutionResult ? 'PASSED' : 'FAILED'}`);
    
    // Verify config was updated
    const configUpdateResult = await verifyConfigUpdated(website.id);
    logger.info(`Config update verification ${configUpdateResult ? 'PASSED' : 'FAILED'}`);
    
    // Overall test result
    const overallResult = healthCheckResult && cronExecutionResult && configUpdateResult;
    logger.info(`\n==== OVERALL TEST RESULT: ${overallResult ? 'PASSED' : 'FAILED'} ====\n`);
    
    return overallResult;
  } catch (error) {
    logger.error('Error running tests:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests()
  .then(result => {
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
