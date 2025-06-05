// src/app/api/audits/[id]/compare/route.ts
// API route for comparing audit results

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { ComparativeAnalysisService } from '@/lib/services/comparative-analysis-service';

/**
 * Compare current audit with another audit
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const auditId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const compareWithId = searchParams.get('compareWithId');
    
    // Verify current audit exists and belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: user.id,
      },
      include: {
        website: true,
      },
    });
    
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    const analysisService = new ComparativeAnalysisService(prisma);
    
    // If compareWithId is provided, compare with that specific audit
    if (compareWithId) {
      // Verify the comparison audit exists and belongs to the user
      const compareAudit = await prisma.audit.findFirst({
        where: {
          id: compareWithId,
          userId: user.id,
        },
      });
      
      if (!compareAudit) {
        return NextResponse.json(
          { error: 'Comparison audit not found or you do not have permission to access it' },
          { status: 404 }
        );
      }
      
      const comparison = await analysisService.compareAudits(auditId, compareWithId);
      return NextResponse.json(comparison);
    } 
    // Otherwise, compare with the previous audit for the same website
    else {
      const websiteId = audit.websiteId;
      
      // Get the previous audit for this website
      const previousAudit = await prisma.audit.findFirst({
        where: {
          websiteId,
          userId: user.id,
          id: { not: auditId },
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      if (!previousAudit) {
        return NextResponse.json(
          { error: 'No previous audit found for comparison' },
          { status: 404 }
        );
      }
      
      const comparison = await analysisService.compareAudits(auditId, previousAudit.id);
      return NextResponse.json(comparison);
    }
  } catch (error) {
    console.error('Error comparing audits:', error);
    return NextResponse.json(
      { error: `Failed to compare audits: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});
