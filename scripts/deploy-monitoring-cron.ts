// src/scripts/deploy-monitoring-cron.ts
// Script to deploy and verify the monitoring cron job in production

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Logger } from '../lib/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

const execAsync = promisify(exec);
const logger = new Logger('deploy-monitoring-cron');

// Environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PRODUCTION_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-url.com';
const CRON_SECRET = process.env.CRON_SECRET;

// Validation
if (!VERCEL_TOKEN) {
  logger.error('VERCEL_TOKEN environment variable is not set');
  logger.error('Please add VERCEL_TOKEN to your .env.local file');
  process.exit(1);
}

if (!CRON_SECRET) {
  logger.error('CRON_SECRET environment variable is not set');
  logger.error('Please add CRON_SECRET to your .env.local file');
  process.exit(1);
}

/**
 * Deploy the monitoring cron job to production
 */
async function deployMonitoringCron() {
  try {
    logger.info('Deploying monitoring cron job to production...');
    
    // Check if Vercel CLI is installed
    try {
      await execAsync('vercel --version');
      logger.info('Vercel CLI is installed');
    } catch (error) {
      logger.error('Vercel CLI is not installed. Please install it with: npm i -g vercel');
      process.exit(1);
    }
    
    // Ensure vercel.json exists
    const vercelJsonPath = './vercel.json';
    if (!fs.existsSync(vercelJsonPath)) {
      logger.error('vercel.json does not exist. Please run the setup-cron-job.ts script first.');
      process.exit(1);
    }
    
    // Deploy to production
    logger.info('Deploying to production...');
    try {
      const { stdout, stderr } = await execAsync('vercel --prod');
      logger.info('Deployment output:', stdout);
      if (stderr) {
        logger.warn('Deployment stderr:', stderr);
      }
    } catch (error) {
      logger.error('Failed to deploy to production:', error);
      process.exit(1);
    }
    
    logger.info('Deployment completed successfully');
    return true;
  } catch (error) {
    logger.error('Error deploying monitoring cron job:', error);
    return false;
  }
}

/**
 * Verify the monitoring cron job is working in production
 */
async function verifyMonitoringCron() {
  logger.info('Verifying monitoring cron job in production...');
  
  try {
    // Test health check endpoint
    logger.info('Testing monitoring cron health check endpoint...');
    const healthCheckResponse = await fetch(`${PRODUCTION_URL}/api/cron/run-monitoring-checks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    const healthCheckData = await healthCheckResponse.json();
    logger.info('Health check response:', healthCheckData);
    
    if (!healthCheckResponse.ok) {
      logger.error(`Health check failed with status ${healthCheckResponse.status}`);
      return false;
    }
    
    // Test cron execution
    logger.info('Testing monitoring cron execution endpoint...');
    const cronResponse = await fetch(`${PRODUCTION_URL}/api/cron/run-monitoring-checks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    const cronData = await cronResponse.json();
    logger.info('Cron execution response:', cronData);
    
    if (!cronResponse.ok) {
      logger.error(`Cron execution failed with status ${cronResponse.status}`);
      return false;
    }
    
    logger.info('Monitoring cron job verification completed successfully');
    return true;
  } catch (error) {
    logger.error('Error verifying monitoring cron job:', error);
    return false;
  }
}

/**
 * Run the deployment and verification process
 */
async function run() {
  try {
    // Deploy monitoring cron job
    const deployResult = await deployMonitoringCron();
    if (!deployResult) {
      logger.error('Deployment failed');
      process.exit(1);
    }
    
    // Wait for deployment to propagate
    logger.info('Waiting for deployment to propagate (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verify monitoring cron job
    const verifyResult = await verifyMonitoringCron();
    if (!verifyResult) {
      logger.error('Verification failed');
      process.exit(1);
    }
    
    logger.info('\n✅ Monitoring cron job deployed and verified successfully!');
    logger.info('\n📋 Next steps:');
    logger.info('1. Monitor logs for any errors or issues');
    logger.info('2. Check that alerts are being generated correctly');
    logger.info('3. Verify that notifications are being sent');
    logger.info('4. Test the monitoring dashboard in production');
    
    process.exit(0);
  } catch (error) {
    logger.error('Unhandled error:', error);
    process.exit(1);
  }
}

// Run the deployment and verification process
run();
