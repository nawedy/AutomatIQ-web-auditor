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
// Initialize MonitoringService with the prisma instance for better testability
const monitoringService = new MonitoringService(prisma);

/**
 * GET handler for retrieving monitoring alerts
 */
export const GET = withRateLimit(
  withAuth(async (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role?: string }
  ): Promise<NextResponse> => {
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
        return accessValidation.response || NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      // Validate pagination parameters
      const paginationValidation = validatePaginationParams(
        limit,
        offset
      );
      
      if (!paginationValidation.isValid) {
        return NextResponse.json({ error: paginationValidation.error }, { status: 400 });
      }
      
      const { limit: sanitizedLimit, offset: sanitizedOffset } = paginationValidation;
      const sanitizedWebsiteId = sanitizeString(websiteId);
      
      // Get alerts with pagination
      const page = Math.floor(sanitizedOffset / sanitizedLimit) + 1;
      const alerts = await monitoringService.getAlertsFromCacheOrDatabase(
        sanitizedWebsiteId,
        page,
        sanitizedLimit,
        unreadOnly
      );
      
      // Get total count for pagination
      const totalCount = await monitoringService.getAlertsCount(sanitizedWebsiteId, unreadOnly);
      
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
      console.error('Error fetching monitoring alerts:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch monitoring alerts', 
        message: (error as Error).message 
      }, { status: 500 });
    } finally {
      await safeDisconnect();
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
  ): Promise<NextResponse> => {
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
      const sanitizedWebsiteId = sanitizeString(websiteId);
      const accessValidation = await validateWebsiteAccess(
        sanitizedWebsiteId,
        user.id,
        user.role === 'ADMIN'
      );
      
      if (!accessValidation.isValid) {
        return NextResponse.json({ error: accessValidation.error || 'Access denied' }, { status: 403 });
      }
      
      // Validate alert IDs
      const alertIdsValidation = validateAlertIds(alertIds);
      if (!alertIdsValidation.success) {
        return NextResponse.json({ error: alertIdsValidation.error }, { status: 400 });
      }
      
      // Verify alerts exist and belong to the website
      const existingAlerts = await prisma.alert.findMany({
        where: {
          id: {
            in: alertIds
          },
          websiteId: sanitizedWebsiteId
        },
        select: {
          id: true
        }
      });
      
      if (existingAlerts.length !== alertIds.length) {
        return NextResponse.json(
          { error: 'Some alerts do not exist or do not belong to the specified website' },
          { status: 400 }
        );
      }
      
      // Mark alerts as read
      const success = await monitoringService.markAlertsAsRead(sanitizedWebsiteId, alertIds);
      
      if (!success) {
        return NextResponse.json({ error: 'Failed to mark alerts as read' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      return NextResponse.json({ 
        error: 'Failed to mark alerts as read', 
        message: (error as Error).message 
      }, { status: 500 });
    } finally {
      await safeDisconnect();
    }
  }),
  {
    requestsPerWindow: 10,
    window: '60 s'
  }
);
