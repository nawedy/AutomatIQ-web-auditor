// app/api/monitoring/route.ts
// API route for managing continuous website monitoring

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '../../../lib/prisma';
import { ContinuousMonitoringService } from '@/lib/services/continuous-monitoring-service';
import { NotificationService } from '@/lib/services/notification-service';

/**
 * Set up continuous monitoring for a website
 */
export const POST = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { websiteId, scheduleType, categories, alertThreshold } = await request.json();

    if (!websiteId || !scheduleType) {
      return NextResponse.json(
        { error: 'Website ID and schedule type are required' },
        { status: 400 }
      );
    }

    // Check if website belongs to user
    const website = await prisma.website.findUnique({
      where: {
        id: websiteId,
        userId: user.id
      }
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      );
    }

    // Create the monitoring configuration
    const monitoringConfig = await prisma.monitoringConfiguration.create({
      data: {
        websiteId,
        userId: user.id,
        scheduleType,
        categories: categories || [],
        alertThreshold: alertThreshold || 0
      }
    });

    return NextResponse.json({
      success: true,
      monitoring: monitoringConfig,
      message: 'Continuous monitoring enabled successfully'
    });
  } catch (error) {
    console.error('Error setting up monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to set up monitoring' },
      { status: 500 }
    );
  }
});

/**
 * Get monitoring configurations for user's websites
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    
    // Build query filters
    const where: any = { 
      website: {
        userId: user.id
      }
    };
    
    if (websiteId) {
      where.websiteId = websiteId;
    }

    // Get monitoring configurations
    const monitoringConfigs = await prisma.websiteMonitoring.findMany({
      where,
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        }
      }
    });

    // Get audits for the website
    const audits = await prisma.audit.findMany({
      where: {
        websiteId,
        userId: user.id,
        type: 'MONITORING'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    return NextResponse.json({
      audits: audits,
      total: audits.length
    });
  } catch (error) {
    console.error('Error fetching monitoring configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring configurations' },
      { status: 500 }
    );
  }
});

/**
 * Process scheduled monitoring tasks (to be called by a cron job)
 * This endpoint is protected by an API key instead of user authentication
 */
export async function POST_CRON(request: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    // Check API key (in a real app, this would be stored securely)
    if (apiKey !== process.env.MONITORING_CRON_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process scheduled monitoring
    const monitoringService = new ContinuousMonitoringService(prisma);
    const notificationService = new NotificationService(prisma);
    
    // Process all due monitoring tasks
    const processedTasks = await monitoringService.processScheduledMonitoring();
    
    // Create notifications for any issues found
    let processedCount = 0;
    if (Array.isArray(processedTasks) && processedTasks.length > 0) {
      processedCount = processedTasks.length;
      
      // Process each task result and create notifications
      for (const task of processedTasks) {
        if (task.auditId && task.websiteId && task.userId) {
          // Create a simple monitoring notification instead of using audit results
          await prisma.notification.create({
            data: {
              userId: task.userId,
              websiteId: task.websiteId,
              auditId: task.auditId,
              title: 'Monitoring Alert',
              message: 'New issues detected in your website monitoring',
              type: 'MONITORING_ALERT',
              priority: 'HIGH',
              channel: 'IN_APP',
              read: false,
              data: JSON.stringify(task.results || {})
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      message: 'Monitoring tasks processed successfully'
    });
  } catch (error) {
    console.error('Error processing scheduled monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled monitoring' },
      { status: 500 }
    );
  }
}
