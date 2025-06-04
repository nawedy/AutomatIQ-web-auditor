// src/app/api/audits/[id]/pages/[pageId]/route.ts
// API route for managing specific page details and results from an audit

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * GET /api/audits/[id]/pages/[pageId]
 * Get detailed information about a specific page from an audit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  try {
    const { id, pageId } = params;

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the audit belongs to the user
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

    // Get the page details
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
        auditId: id,
      },
      include: {
        pageAuditResults: {
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

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Get query parameters for filtering results
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    // Build the where clause for filtering
    const whereClause: any = {
      pageId,
    };

    if (categoryId) {
      whereClause.check = {
        categoryId,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    // Get page audit results with filtering
    const results = await prisma.pageAuditResult.findMany({
      where: whereClause,
      include: {
        check: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Get category statistics
    const categoryStats = await prisma.pageAuditResult.groupBy({
      by: ["status"],
      where: {
        pageId,
      },
      _count: {
        id: true,
      },
    });

    // Get severity statistics
    const severityStats = await prisma.pageAuditResult.groupBy({
      by: ["severity"],
      where: {
        pageId,
      },
      _count: {
        id: true,
      },
    });

    // Format the response
    return NextResponse.json({
      page,
      results,
      stats: {
        categories: categoryStats,
        severities: severityStats,
      },
    });
  } catch (error) {
    console.error(`Error fetching page ${params.pageId} for audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch page details" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audits/[id]/pages/[pageId]
 * Delete a specific page and its results from an audit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  try {
    const { id, pageId } = params;

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the audit belongs to the user
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

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
        auditId: id,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete the page and all related data (cascade delete will handle related records)
    await prisma.page.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting page ${params.pageId} for audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
