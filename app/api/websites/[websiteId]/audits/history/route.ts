// src/app/api/websites/[websiteId]/audits/history/route.ts
// API route for retrieving audit history for comparative analysis

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * GET handler for retrieving audit history for a website
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: { websiteId: string } },
  user: { id: string; email: string; role?: string }
) => {
  try {
    const { websiteId } = context.params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all';
    
    // Validate website access
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
    
    // Determine date filter based on time range
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
      case 'all':
      default:
        // No date filter for 'all'
        break;
    }
    
    // Fetch audit history
    const audits = await prisma.audit.findMany({
      where: {
        websiteId,
        status: 'COMPLETED', // Only include completed audits
        ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {})
      },
      select: {
        id: true,
        createdAt: true,
        completedAt: true,
        overallScore: true,
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        securityScore: true,
        mobileScore: true,
        contentScore: true
      },
      orderBy: {
        completedAt: 'asc'
      },
      take: 50 // Limit to 50 audits for performance
    });
    
    // Get website stats
    const auditCount = await prisma.audit.count({
      where: {
        websiteId,
        status: 'COMPLETED'
      }
    });
    
    const firstAudit = await prisma.audit.findFirst({
      where: {
        websiteId,
        status: 'COMPLETED'
      },
      orderBy: {
        completedAt: 'asc'
      },
      select: {
        completedAt: true,
        overallScore: true
      }
    });
    
    const latestAudit = await prisma.audit.findFirst({
      where: {
        websiteId,
        status: 'COMPLETED'
      },
      orderBy: {
        completedAt: 'desc'
      },
      select: {
        completedAt: true,
        overallScore: true
      }
    });
    
    // Calculate improvement if we have multiple audits
    let improvement = null;
    if (firstAudit && latestAudit && firstAudit.completedAt !== latestAudit.completedAt) {
      const firstScore = firstAudit.overallScore || 0;
      const latestScore = latestAudit.overallScore || 0;
      const diff = latestScore - firstScore;
      const percentage = firstScore > 0 ? Math.round((diff / firstScore) * 100) : 0;
      
      improvement = {
        diff,
        percentage,
        improved: diff > 0
      };
    }
    
    return NextResponse.json({
      audits,
      stats: {
        totalAudits: auditCount,
        firstAudit,
        latestAudit,
        improvement
      }
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    return NextResponse.json(
      { error: `Failed to fetch audit history: ${(error as Error).message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
