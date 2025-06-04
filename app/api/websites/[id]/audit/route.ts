import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/auth-utils"
import { PrismaAuditService } from "@/lib/services/prisma-audit-service"
import { z } from "zod"

// Request body schema
const auditOptionsSchema = z.object({
  seo: z.boolean().default(true),
  performance: z.boolean().default(true),
  accessibility: z.boolean().default(true),
  bestPractices: z.boolean().default(true),
  mobile: z.boolean().default(true),
  security: z.boolean().default(true),
});

/**
 * POST /api/websites/[id]/audit
 * Start a new audit for a website
 */
export const POST = withAuth(async (
  request: NextRequest, 
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const { success, data: options } = auditOptionsSchema.safeParse(body);
    
    if (!success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Check if website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Initialize audit service
    const auditService = new PrismaAuditService();
    
    // Start audit
    const auditId = await auditService.startAudit(websiteId, options);

    return NextResponse.json({ 
      auditId,
      message: "Audit started successfully",
      status: "pending"
    }, { status: 201 });
  } catch (error) {
    console.error("Error starting audit:", error);
    return NextResponse.json({ 
      error: "Failed to start audit", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
});

/**
 * GET /api/websites/[id]/audit
 * Get all audits for a website
 */
export const GET = withAuth(async (
  request: NextRequest, 
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;

    // Check if website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Get all audits for this website
    const audits = await prisma.audit.findMany({
      where: {
        websiteId,
      },
      include: {
        summary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error("Error fetching website audits:", error);
    return NextResponse.json({ error: "Failed to fetch website audits" }, { status: 500 });
  }
});
