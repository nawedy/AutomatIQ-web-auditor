// src/app/api/audits/[id]/results/route.ts
// API route for managing audit results and progress

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth-utils";
import { PrismaAuditService } from "@/lib/services/prisma-audit-service";

/**
 * GET /api/audits/[id]/results
 * Get detailed results for a specific audit
 * Can also return progress information with ?progress=true
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { id: auditId } = params;
    const { searchParams } = new URL(request.url);
    const includeProgress = searchParams.get("progress") === "true";
    
    // Verify the audit belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        website: {
          userId: user.id,
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    
    // If we only need progress information
    if (includeProgress) {
      const auditService = new PrismaAuditService();
      const progress = await auditService.getAuditProgress(auditId);
      
      if (!progress) {
        return NextResponse.json({ error: "Failed to get audit progress" }, { status: 500 });
      }
      
      return NextResponse.json(progress);
    }
    
    // Otherwise, get detailed results
    // Get query parameters for filtering
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build the where clause for filtering
    const whereClause: any = {
      auditId,
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

    // Get audit results with filtering and pagination
    const [results, totalCount] = await Promise.all([
      prisma.auditResult.findMany({
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
        skip,
        take: pageSize,
      }),
      prisma.auditResult.count({
        where: whereClause,
      }),
    ]);

    // Get category statistics
    const categoryStats = await prisma.auditResult.groupBy({
      by: ["status"],
      where: {
        auditId,
      },
      _count: {
        id: true,
      },
    });

    // Get severity statistics
    const severityStats = await prisma.auditResult.groupBy({
      by: ["severity"],
      where: {
        auditId,
      },
      _count: {
        id: true,
      },
    });

    // Format the response
    return NextResponse.json({
      results,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      stats: {
        categories: categoryStats,
        severities: severityStats,
      },
    });
  } catch (error) {
    console.error(`Error handling audit request for ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to process audit request" },
      { status: 500 }
    );
  }
});
