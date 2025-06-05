// app/api/advanced-audits/[id]/route.ts
// API route for managing a specific advanced audit

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '../../../../lib/prisma';
import { AdvancedAuditOrchestrator } from '@/lib/services/advanced-audit-orchestrator';
import { AuditStatus } from '@/lib/types/advanced-audit';

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

    // Get the audit with results
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
        userId: user.id
      },
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        }
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found or access denied' },
        { status: 404 }
      );
    }

    // Get detailed audit results
    const orchestrator = new AdvancedAuditOrchestrator(prisma);
    const auditResults = await orchestrator.getAuditResult(auditId);

    // Get audit issues
    const issues = await prisma.auditIssue.findMany({
      where: { auditId },
      orderBy: { severity: 'desc' }
    });

    return NextResponse.json({
      audit,
      results: auditResults,
      issues
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

    // Check if audit exists and belongs to user
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
        userId: user.id
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (audit.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete audit and related data in a transaction
    await prisma.$transaction([
      prisma.auditIssue.deleteMany({ where: { auditId } }),
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
    const { action, categories } = await request.json();

    // Check if audit exists and belongs to user
    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
        userId: user.id
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (audit.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'rerun':
        // Update audit status
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: 'queued' as AuditStatus,
            categories: categories || audit.categories,
            updatedAt: new Date()
          }
        });

        // Start the audit asynchronously
        setTimeout(async () => {
          try {
            const orchestrator = new AdvancedAuditOrchestrator(prisma);
            await orchestrator.runAudit(auditId, audit.url, categories || audit.categories as string[]);
          } catch (error) {
            console.error('Error rerunning audit:', error);
            await prisma.audit.update({
              where: { id: auditId },
              data: {
                status: 'failed' as AuditStatus,
                updatedAt: new Date(),
              }
            });
          }
        }, 0);

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
