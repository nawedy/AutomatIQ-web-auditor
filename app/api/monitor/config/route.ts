// src/app/api/monitor/config/route.ts
// API route for managing website monitoring configuration

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { withRateLimit } from '@/lib/rate-limit';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '@/lib/services/monitoring-service';
import { isValidUUID, isValidWebhookURL } from '@/lib/validation-utils';
import { validateWebsiteAccess, safeDisconnect } from '@/lib/monitoring-validation';
import { sanitizeString, sanitizeObject, sanitizeUrl } from '@/lib/sanitization-utils';

const prisma = new PrismaClient();
const monitoringService = new MonitoringService();

/**
 * GET handler for retrieving monitoring configuration
 */
export const GET = withRateLimit(
  withAuth(async (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role?: string }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const websiteId = searchParams.get('websiteId');
      
      // Validate required parameters
      if (!websiteId) {
        return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
      }
      
      // Verify user has access to the website
      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          OR: [
            { userId: user.id },
            { user: { role: 'ADMIN' } } // Admins can access all websites
          ]
        }
      });
      
      if (!website) {
        return NextResponse.json(
          { error: 'Website not found or you do not have permission to access it' },
          { status: 404 }
        );
      }
      
      // Get monitoring configuration
      const config = await prisma.monitoringConfig.findUnique({
        where: { websiteId }
      });
      
      // If no config exists, return default values
      if (!config) {
        return NextResponse.json({
          websiteId,
          enabled: false,
          frequency: 'WEEKLY',
          alertThreshold: 10,
          metrics: ['overallScore', 'seoScore', 'performanceScore'],
          emailNotifications: true,
          slackWebhook: null
        });
      }
      
      return NextResponse.json(config);
    } catch (error) {
      console.error('Error fetching monitoring config:', error);
      return NextResponse.json(
        { error: `Failed to fetch monitoring configuration: ${(error as Error).message}` },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }),
  {
    requestsPerWindow: 20,
    window: '60 s'
  }
);

/**
 * POST handler for updating monitoring configuration
 */
export const POST = withRateLimit(
  withAuth(async (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role?: string }
  ) => {
    try {
      // Parse and sanitize request body
      const rawData = await request.json();
      const data = sanitizeObject(rawData);
      const { websiteId, enabled, frequency, alertThreshold, metrics, emailNotifications, slackWebhook } = data;

      // Validate required fields
      if (!websiteId) {
        return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
      }

      if (!isValidUUID(websiteId)) {
        return NextResponse.json({ error: 'Invalid website ID format' }, { status: 400 });
      }

      // Sanitize and validate webhook URL if provided
      const sanitizedWebhook = slackWebhook ? sanitizeUrl(slackWebhook) : null;
      if (slackWebhook && !isValidWebhookURL(sanitizedWebhook)) {
        return NextResponse.json({ 
          error: 'Slack webhook URL must use HTTPS protocol' 
        }, { status: 400 });
      }

      // Verify user has access to the website
      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          OR: [
            { userId: user.id },
            { user: { role: 'ADMIN' } } // Admins can access all websites
          ]
        }
      });
      
      if (!website) {
        return NextResponse.json(
          { error: 'Website not found or you do not have permission to access it' },
          { status: 404 }
        );
      }
      
      // Update monitoring configuration with sanitized data
      const success = await monitoringService.updateMonitoringConfig(websiteId, {
        enabled,
        frequency,
        alertThreshold,
        metrics: Array.isArray(metrics) ? metrics : [],
        emailNotifications,
        slackWebhook: sanitizedWebhook || undefined
      });
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update monitoring configuration' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring configuration updated successfully'
      });
    } catch (error) {
      console.error('Error updating monitoring config:', error);
      return NextResponse.json(
        { error: `Failed to update monitoring configuration: ${(error as Error).message}` },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }),
  {
    requestsPerWindow: 10,
    window: '60 s'
  }
);

/**
 * DELETE handler for disabling monitoring
 */
export const DELETE = withRateLimit(
  withAuth(async (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role?: string }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const websiteId = searchParams.get('websiteId');
      
      // Validate required parameters
      if (!websiteId) {
        return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
      }
      
      // Verify user has access to the website
      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          OR: [
            { userId: user.id },
            { user: { role: 'ADMIN' } } // Admins can access all websites
          ]
        }
      });
      
      if (!website) {
        return NextResponse.json(
          { error: 'Website not found or you do not have permission to access it' },
          { status: 404 }
        );
      }
      
      // Disable monitoring
      const success = await monitoringService.toggleMonitoring(websiteId, false);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to disable monitoring' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Monitoring disabled successfully'
      });
    } catch (error) {
      console.error('Error disabling monitoring:', error);
      return NextResponse.json(
        { error: `Failed to disable monitoring: ${(error as Error).message}` },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }),
  {
    requestsPerWindow: 10,
    window: '60 s'
  }
);
