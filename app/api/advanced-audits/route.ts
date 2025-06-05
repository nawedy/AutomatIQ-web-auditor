// app/api/advanced-audits/route.ts
// API route for running and managing advanced audits

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { AdvancedAuditOrchestrator } from '@/lib/services/advanced-audit-orchestrator';
import { AuditStatus } from '@/lib/types/advanced-audit';

/**
 * Start a new advanced audit
 */
export const POST = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { websiteId, url, categories } = await request.json();

    if (!websiteId || !url) {
      return NextResponse.json(
        { error: 'Website ID and URL are required' },
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

    // Create a new audit record
    const audit = await prisma.audit.create({
      data: {
        websiteId,
        url,
        userId: user.id,
        status: 'queued' as AuditStatus,
        categories: categories || ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT', 'CROSS_BROWSER', 'ANALYTICS', 'CHATBOT'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Start the audit asynchronously
    // In a production environment, this would be handled by a queue system
    setTimeout(async () => {
      try {
        const orchestrator = new AdvancedAuditOrchestrator(prisma);
        await orchestrator.runAudit(audit.id, url, audit.categories as string[]);
      } catch (error) {
        console.error('Error running audit:', error);
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: 'failed' as AuditStatus,
            updatedAt: new Date(),
          }
        });
      }
    }, 0);

    return NextResponse.json({ 
      success: true, 
      auditId: audit.id,
      message: 'Audit started successfully'
    });
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 }
    );
  }
});

/**
 * Get all advanced audits for the authenticated user
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query filters
    const where: any = { userId: user.id };
    
    if (websiteId) {
      where.websiteId = websiteId;
    }
    
    if (status) {
      where.status = status;
    }

    // Get audits with pagination
    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          website: {
            select: {
              name: true,
              url: true
            }
          }
        }
      }),
      prisma.audit.count({ where })
    ]);

    return NextResponse.json({
      audits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
});
