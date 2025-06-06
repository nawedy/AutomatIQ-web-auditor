#!/usr/bin/env ts-node
/**
 * Test script for monitoring endpoint
 * 
 * This script tests the monitoring API endpoint by sending requests with proper authorization
 * and verifying the responses. It can be used to test both local and production environments.
 */

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { Logger } from '../lib/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('test-monitoring-endpoint');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  logger.error('CRON_SECRET environment variable is not set');
  process.exit(1);
}

/**
 * Send a request to the monitoring endpoint
 */
async function testMonitoringEndpoint(method: 'GET' | 'POST' | 'HEAD', path: string = '') {
  const url = `${BASE_URL}/api/cron/run-monitoring-checks${path}`;
  
  logger.info(`Testing ${method} ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`Status: ${response.status}`);
    
    if (method !== 'HEAD') {
      const data = await response.json();
      logger.info('Response:', data);
      return { status: response.status, data };
    }
    
    return { status: response.status };
  } catch (error) {
    logger.error('Error testing monitoring endpoint:', error);
    return { status: 500, error };
  }
}

/**
 * Test all monitoring endpoint methods
 */
async function runTests() {
  logger.info('=== Testing Monitoring Endpoint ===');
  
  // Test GET endpoint (health check)
  logger.info('\n--- Testing GET endpoint (health check) ---');
  await testMonitoringEndpoint('GET');
  
  // Test HEAD endpoint (health check)
  logger.info('\n--- Testing HEAD endpoint (health check) ---');
  await testMonitoringEndpoint('HEAD');
  
  // Test POST endpoint (run checks)
  logger.info('\n--- Testing POST endpoint (run checks) ---');
  await testMonitoringEndpoint('POST');
  
  logger.info('\n=== Tests completed ===');
}

// Run the tests
runTests().catch(error => {
  logger.error('Error running tests:', error);
  process.exit(1);
});
