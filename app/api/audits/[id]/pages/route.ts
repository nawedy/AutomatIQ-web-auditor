// src/app/api/audits/[id]/pages/route.ts
// API route for managing pages discovered during an audit

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth-utils";

/**
 * GET /api/audits/[id]/pages
 * Get pages discovered during a specific audit with pagination and filtering
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { id } = params;

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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "url";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build the where clause for filtering
    const whereClause: any = {
      auditId: id,
    };

    if (url) {
      whereClause.url = {
        contains: url,
        mode: "insensitive",
      };
    }

    if (status) {
      whereClause.status = status;
    }

    // Validate sort parameters
    const validSortFields = ["url", "status", "statusCode", "createdAt", "updatedAt"];
    const validSortOrders = ["asc", "desc"];
    
    const orderBy: any = {};
    orderBy[validSortFields.includes(sortBy) ? sortBy : "url"] = 
      validSortOrders.includes(sortOrder as any) ? sortOrder : "asc";

    // Get pages with filtering and pagination
    const [pages, totalCount] = await Promise.all([
      prisma.page.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
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
      }),
      prisma.page.count({
        where: whereClause,
      }),
    ]);

    // Get status statistics
    const statusStats = await prisma.page.groupBy({
      by: ["status"],
      where: {
        auditId: id,
      },
      _count: {
        id: true,
      },
    });

    // Get status code statistics
    const statusCodeStats = await prisma.page.groupBy({
      by: ["statusCode"],
      where: {
        auditId: id,
      },
      _count: {
        id: true,
      },
    });

    // Format the response
    return NextResponse.json({
      pages,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      stats: {
        statuses: statusStats,
        statusCodes: statusCodeStats,
      },
    });
  } catch (error) {
    console.error(`Error fetching pages for audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch audit pages" },
      { status: 500 }
    );
  }
});

