// src/app/api/audits/[id]/route.ts
// API route for managing a specific audit

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuditService } from "@/lib/services/audit-service";
import { withAuth } from "@/lib/auth-utils";

const auditService = new AuditService();

/**
 * GET /api/audits/[id]
 * Get details of a specific audit
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const { id } = params;

    // Get audit details, ensuring it belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id,
        website: {
          userId: user.id,
        },
      },
      include: {
        website: true,
        summary: true,
        auditResults: {
          include: {
            check: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // If the audit is still in progress, get the latest progress
    if (audit.status === "pending" || audit.status === "running") {
      // This would need to be adapted based on how you're tracking progress
      const progress = await auditService.getAuditProgress(id);
      return NextResponse.json({ audit, progress });
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error(`Error fetching audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch audit details" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/audits/[id]
 * Delete a specific audit
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const { id } = params;

    // Check if audit exists and belongs to user
    const audit = await prisma.audit.findFirst({
      where: {
        id,
        website: {
          userId: user.id,
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Delete the audit and all related data
    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 }
    );
  }
});
