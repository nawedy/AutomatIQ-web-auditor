// src/app/api/monitor/alerts/route.ts
// API route for managing monitoring alerts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { withRateLimit } from '@/lib/rate-limit';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '@/lib/services/monitoring-service';
import { isValidUUID } from '@/lib/validation-utils';
import { validateWebsiteAccess, validatePaginationParams, validateAlertIds, safeDisconnect } from '@/lib/monitoring-validation';
import { sanitizeString, sanitizeObject, sanitizeArray } from '@/lib/sanitization-utils';

const prisma = new PrismaClient();
const monitoringService = new MonitoringService();

/**
 * GET handler for retrieving monitoring alerts
 */
export const GET = withRateLimit(
  withAuth(async (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role?: string }
  ) => {
    try {
      // Extract and sanitize query params
      const { searchParams } = new URL(request.url);
      const websiteId = sanitizeString(searchParams.get('websiteId'));
      const unreadOnly = searchParams.get('unreadOnly') === 'true';
      const limit = sanitizeString(searchParams.get('limit'));
      const offset = sanitizeString(searchParams.get('offset'));

      // Validate website access
      const accessValidation = await validateWebsiteAccess(
        websiteId,
        user.id,
        user.role === 'ADMIN'
      );
      
      if (!accessValidation.isValid) {
        return accessValidation.response;
      }
      
      // Validate pagination parameters
      const paginationValidation = validatePaginationParams(
        limit,
        offset
      );
      
      if (!paginationValidation.isValid) {
        return paginationValidation.response;
      }
      
      const { limit: sanitizedLimit, offset: sanitizedOffset } = paginationValidation;
      
      // Get alerts
      const alerts = await monitoringService.getAlerts(websiteId, {
        unreadOnly,
        limit: sanitizedLimit,
        offset: sanitizedOffset
      });
      
      // Get total count for pagination
      const totalCount = await prisma.alert.count({
        where: {
          websiteId,
          ...(unreadOnly ? { read: false } : {})
        }
      });
      
      return NextResponse.json({
        alerts,
        pagination: {
          total: totalCount,
          limit: sanitizedLimit,
          offset: sanitizedOffset,
          hasMore: sanitizedOffset + sanitizedLimit < totalCount
        }
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: `Failed to fetch alerts: ${(error as Error).message}` },
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
 * POST handler for marking alerts as read
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
      const { alertIds: rawAlertIds, websiteId } = data;
      
      // Sanitize alert IDs
      const alertIds = Array.isArray(rawAlertIds) ? sanitizeArray(rawAlertIds) : [];

      // Validate required fields
      if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
        return NextResponse.json({ error: 'Alert IDs are required' }, { status: 400 });
      }

      if (!websiteId) {
        return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
      }

      // Validate website access
      const accessValidation = await validateWebsiteAccess(
        websiteId,
        user.id,
        user.role === 'ADMIN'
      );
      
      if (!accessValidation.isValid) {
        return accessValidation.response;
      }
      
      // Validate alert IDs
      const alertIdsValidation = validateAlertIds(alertIds);
      if (!alertIdsValidation.isValid) {
        return alertIdsValidation.response;
      }
      
      // Verify all alerts belong to the specified website
      const alertCount = await prisma.alert.count({
        where: {
          id: {
            in: alertIds
          },
          websiteId
        }
      });
      
      if (alertCount !== alertIds.length) {
        return NextResponse.json(
          { error: 'Some alerts do not exist or do not belong to the specified website' },
          { status: 400 }
        );
      }
      
      // Mark alerts as read
      const success = await monitoringService.markAlertsAsRead(alertIds);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to mark alerts as read' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Alerts marked as read successfully'
      });
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      return NextResponse.json(
        { error: `Failed to mark alerts as read: ${(error as Error).message}` },
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
