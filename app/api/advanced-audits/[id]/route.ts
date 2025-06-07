// app/api/advanced-audits/[id]/route.ts
// API route for managing a specific advanced audit

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '../../../../lib/prisma';
import { ServerOnlyAuditService } from '@/lib/services/server-only/advanced-audit-service';
import { AuditStatus } from '../../../../types/audit';

/**
 * Get a specific audit by ID
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const auditId = params.id;

    // Get the audit with website info for ownership check
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        website: {
          select: {
            name: true,
            url: true,
            userId: true
          }
        }
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check ownership via website.userId
    if (!audit.website || audit.website.userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get audit results
    const auditResults = await prisma.auditResult.findMany({
      where: { auditId }
    });
    
    // Get audit summary
    const auditSummary = await prisma.auditSummary.findUnique({
      where: { auditId }
    });
    
    // Parse summaryReport if it exists
    const summaryReport = auditSummary?.summaryReport ? 
      (typeof auditSummary.summaryReport === 'string' ? 
        JSON.parse(auditSummary.summaryReport) : auditSummary.summaryReport) : {};

    return NextResponse.json({
      audit,
      results: auditResults,
      summary: {
        ...auditSummary,
        summaryReport
      }
    });
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit details' },
      { status: 500 }
    );
  }
});

/**
 * Delete an audit
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const auditId = params.id;

    // Check if audit exists and get website for ownership check
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { website: true }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check ownership via website.userId
    if (!audit.website || audit.website.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete audit and related data in a transaction
    await prisma.$transaction([
      prisma.auditResult.deleteMany({ where: { auditId } }),
      prisma.auditSummary.deleteMany({ where: { auditId } }),
      prisma.audit.delete({ where: { id: auditId } })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Audit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
});

/**
 * Update an audit (e.g., rerun or cancel)
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const auditId = params.id;
    const { action, categories: requestCategories } = await request.json();

    // Check if audit exists and get website for ownership check
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { website: true }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check ownership via website.userId
    if (!audit.website || audit.website.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get the website URL for audit
    const websiteUrl = audit.website.url;
    
    // Get audit summary to extract categories if needed
    const auditSummary = await prisma.auditSummary.findUnique({
      where: { auditId }
    });
    
    // Parse summaryReport if it exists to get categories
    const summaryReport = auditSummary?.summaryReport ? 
      (typeof auditSummary.summaryReport === 'string' ? 
        JSON.parse(auditSummary.summaryReport) : auditSummary.summaryReport) : {};
    
    // Use categories from request, or from summary, or default
    const categories = requestCategories || 
      (summaryReport.categories || ['performance', 'accessibility', 'seo', 'best-practices']);

    // Handle different actions
    switch (action) {
      case 'rerun':
        // Update audit status
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: 'queued' as AuditStatus,
            updatedAt: new Date()
          }
        });
        
        // Update summary report with categories if it exists
        if (auditSummary) {
          const updatedSummaryReport = {
            ...summaryReport,
            categories
          };
          
          await prisma.auditSummary.update({
            where: { auditId },
            data: {
              summaryReport: updatedSummaryReport
            }
          });
        }

        // Start the audit asynchronously using ServerOnlyAuditService
        const auditService = new ServerOnlyAuditService();
        await auditService.runAudit(auditId, websiteUrl, categories);

        return NextResponse.json({
          success: true,
          message: 'Audit rerun started successfully'
        });

      case 'cancel':
        // Only allow cancellation if audit is queued or running
        if (audit.status !== 'queued' && audit.status !== 'running') {
          return NextResponse.json(
            { error: 'Cannot cancel an audit that is not in progress' },
            { status: 400 }
          );
        }

        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: 'failed' as AuditStatus,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Audit cancelled successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json(
      { error: 'Failed to update audit' },
      { status: 500 }
    );
  }
});
