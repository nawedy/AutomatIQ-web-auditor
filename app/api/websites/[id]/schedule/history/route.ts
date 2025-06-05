// src/app/api/websites/[id]/schedule/history/route.ts
// API route for retrieving scheduled audit history for a website

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service';

/**
 * Get scheduled audit history for a website
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    
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
    
    const scheduledAuditService = new ScheduledAuditService(prisma);
    const history = await scheduledAuditService.getScheduledAuditHistory(websiteId, page, pageSize);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error getting scheduled audit history:', error);
    return NextResponse.json(
      { error: `Failed to get scheduled audit history: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});
