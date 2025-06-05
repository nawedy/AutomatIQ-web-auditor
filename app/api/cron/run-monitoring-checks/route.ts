// src/app/api/cron/run-monitoring-checks/route.ts
// API route for running scheduled monitoring checks via cron job

import { NextRequest, NextResponse } from 'next/server';
import { MonitoringServiceAdapter } from '@/lib/services/monitoring-service-adapter';
import { Logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('cron-monitoring-checks');
const prisma = new PrismaClient();

/**
 * Verify if the request is authorized via CRON_SECRET
 * @param request The NextRequest object
 * @returns Boolean indicating if the request is authorized
 */
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    logger.error('Unauthorized cron job attempt with invalid secret');
    return false;
  }
  
  return true;
}

/**
 * Run scheduled monitoring checks for all websites that are due
 * This endpoint should be called by a cron job at regular intervals (e.g., every 15 minutes)
 * It is protected by a secret key to prevent unauthorized access
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    try {
      // Verify authorization
      if (!isAuthorized(request)) {
        logger.warn('Unauthorized attempt to run monitoring checks');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      logger.info('Running scheduled monitoring checks');
      
      // Create monitoring service adapter instance with in-memory storage
      const monitoringAdapter = new MonitoringServiceAdapter({ storage: 'in-memory' });
      
      // Run scheduled checks
      const checkedCount = await monitoringAdapter.runScheduledChecks();
      
      logger.info(`Completed monitoring checks for ${checkedCount} websites`);
      
      return NextResponse.json({
        success: true,
        checkedCount,
        timestamp: new Date().toISOString(),
        message: `Successfully ran monitoring checks for ${checkedCount} websites`
      });
    } catch (error) {
      logger.error('Error running scheduled monitoring checks:', error);
      return NextResponse.json(
        { 
          error: 'Failed to run scheduled monitoring checks',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error running scheduled monitoring checks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run scheduled monitoring checks',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for the monitoring cron job
 * This can be used to verify the cron job is properly configured
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    try {
      // Verify authorization
      if (!isAuthorized(request)) {
        logger.warn('Unauthorized attempt to access monitoring health check');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      logger.info('Processing monitoring health check');
      
      // Get count of websites with audit scheduling enabled
      const enabledConfigsCount = await prisma.auditSchedule.count({
        where: {
          enabled: true
        }
      });
      
      // Get websites due for a check using the adapter
      const monitoringAdapter = new MonitoringServiceAdapter();
      const dueWebsites = await monitoringAdapter.getWebsitesDueForCheck();
      const dueWebsitesCount = dueWebsites.length;
      
      logger.info(`Found ${enabledConfigsCount} enabled monitoring configs, ${dueWebsitesCount} due for checks`);
      
      return NextResponse.json({
        status: 'healthy',
        enabledConfigsCount,
        dueWebsitesCount,
        timestamp: new Date().toISOString(),
        message: 'Monitoring cron job is properly configured'
      });
    } catch (error) {
      logger.error('Error in monitoring cron health check:', error);
      return NextResponse.json(
        { 
          error: 'Failed to perform health check',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error in monitoring cron health check:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform health check',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
