// src/app/api/websites/[id]/audits/history/route.ts
// API route for retrieving website audit history for comparative analysis

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

/**
 * Get audit history for a website
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    
    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'all';
    
    // Verify website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Determine date filter based on time range
    let dateFilter: any = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        dateFilter = {
          gte: subDays(now, 7),
        };
        break;
      case '30days':
        dateFilter = {
          gte: subDays(now, 30),
        };
        break;
      case '90days':
        dateFilter = {
          gte: subDays(now, 90),
        };
        break;
      default:
        // All time, no filter
        break;
    }
    
    // Get completed audits for the website
    const audits = await prisma.audit.findMany({
      where: {
        websiteId,
        userId: user.id,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
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
        contentScore: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
    
    return NextResponse.json({ audits });
  } catch (error) {
    console.error('Error retrieving audit history:', error);
    return NextResponse.json(
      { error: `Failed to retrieve audit history: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});
