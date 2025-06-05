// src/app/api/monitor/continuous/route.ts
// API route for continuous website monitoring

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { withRateLimit } from '@/lib/rate-limit';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * GET handler for retrieving continuous monitoring data
 * Rate limited to 20 requests per minute
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
      const timeRange = searchParams.get('timeRange') || '30days';
      const metrics = searchParams.get('metrics') || 'overallScore,seoScore,performanceScore,accessibilityScore';
      
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
      
      // Determine date range based on timeRange parameter
      let dateFilter: any = {};
      switch (timeRange) {
        case '7days':
          dateFilter = { gte: subDays(new Date(), 7) };
          break;
        case '30days':
          dateFilter = { gte: subDays(new Date(), 30) };
          break;
        case '90days':
          dateFilter = { gte: subDays(new Date(), 90) };
          break;
        case '365days':
          dateFilter = { gte: subDays(new Date(), 365) };
          break;
        case 'all':
        default:
          // No date filter for 'all'
          break;
      }
      
      // Parse metrics to include in the response
      const metricsList = metrics.split(',');
      
      // Get audit history for the website
      const auditHistory = await prisma.audit.findMany({
        where: {
          websiteId,
          status: 'COMPLETED',
          ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {})
        },
        select: {
          id: true,
          createdAt: true,
          completedAt: true,
          overallScore: metricsList.includes('overallScore'),
          seoScore: metricsList.includes('seoScore'),
          performanceScore: metricsList.includes('performanceScore'),
          accessibilityScore: metricsList.includes('accessibilityScore'),
          securityScore: metricsList.includes('securityScore'),
          mobileScore: metricsList.includes('mobileScore'),
          contentScore: metricsList.includes('contentScore'),
          issueCount: true
        },
        orderBy: {
          completedAt: 'asc'
        }
      });
      
      // Get alerts and issues
      const alerts = await prisma.alert.findMany({
        where: {
          websiteId,
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Limit to 10 most recent alerts
      });
      
      // Calculate trends and changes
      let trends = {};
      if (auditHistory.length >= 2) {
        const firstAudit = auditHistory[0];
        const lastAudit = auditHistory[auditHistory.length - 1];
        
        trends = metricsList.reduce((acc: any, metric) => {
          if (firstAudit[metric as keyof typeof firstAudit] !== undefined && 
              lastAudit[metric as keyof typeof lastAudit] !== undefined) {
            const firstValue = firstAudit[metric as keyof typeof firstAudit] as number;
            const lastValue = lastAudit[metric as keyof typeof lastAudit] as number;
            const diff = lastValue - firstValue;
            const percentage = firstValue > 0 ? Math.round((diff / firstValue) * 100) : 0;
            
            acc[metric] = {
              diff,
              percentage,
              improved: diff > 0
            };
          }
          return acc;
        }, {});
      }
      
      // Get monitoring configuration
      const monitoringConfig = await prisma.monitoringConfig.findFirst({
        where: {
          websiteId
        }
      });
      
      return NextResponse.json({
        websiteId,
        websiteName: website.name,
        websiteUrl: website.url,
        timeRange,
        auditHistory,
        alerts,
        trends,
        monitoringConfig: monitoringConfig || {
          enabled: false,
          frequency: 'WEEKLY',
          alertThreshold: 10,
          metrics: ['overallScore', 'seoScore', 'performanceScore']
        }
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      return NextResponse.json(
        { error: `Failed to fetch monitoring data: ${(error as Error).message}` },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }),
  {
    requestsPerWindow: 20,
    window: '60 s',
    identifierFn: (req) => {
      // Use website ID as part of the rate limit key
      const url = new URL(req.url);
      const websiteId = url.searchParams.get('websiteId') || 'unknown';
      
      // Get user ID from session if available
      const session = req.headers.get('x-session-user');
      let userId = 'anonymous';
      if (session) {
        try {
          const user = JSON.parse(session);
          userId = user.id;
        } catch (e) {
          // Fall back to IP if session parsing fails
        }
      }
      
      // Use forwarded IP as fallback
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
      
      return `monitor_${websiteId}_${userId}_${ip}`;
    }
  }
);
