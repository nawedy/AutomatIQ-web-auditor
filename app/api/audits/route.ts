// src/app/api/audits/route.ts
// API routes for managing website audits

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaAuditService } from "@/lib/services/prisma-audit-service";
import { withAuth } from "@/lib/auth-utils";
import { z } from "zod";

const auditService = new PrismaAuditService();

// Schema for audit creation
const createAuditSchema = z.object({
  websiteId: z.string().uuid(),
  url: z.string().url(),
  options: z.object({
    seo: z.boolean().default(true),
    performance: z.boolean().default(true),
    accessibility: z.boolean().default(true),
    security: z.boolean().default(true),
    bestPractices: z.boolean().default(true),
    mobileUx: z.boolean().default(true),
    content: z.boolean().default(true),
  }).optional(),
});

/**
 * GET /api/audits
 * Get all audits for the authenticated user
 */
export const GET = withAuth(async (request: NextRequest, context: any, user: { id: string; email: string }) => {
  try {

    // Get website ID from query params if provided
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    // Get all audits for the user, optionally filtered by website
    const audits = await prisma.audit.findMany({
      where: {
        website: {
          userId: user.id,
          ...(websiteId ? { id: websiteId } : {}),
        },
      },
      include: {
        website: true,
        summary: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/audits
 * Create a new audit for a website
 */
export const POST = withAuth(async (request: NextRequest, context: any, user: { id: string; email: string }) => {
  try {

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createAuditSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { websiteId, url, options } = validationResult.data;

    // Check if website exists and belongs to user
    const website = await prisma.website.findUnique({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found or not owned by user" },
        { status: 404 }
      );
    }

    // Create audit record in database
    const audit = await prisma.audit.create({
      data: {
        websiteId,
        status: "pending",
      },
    });

    // Start the audit process
    const auditOptions = {
      seo: options?.seo || false,
      performance: options?.performance || false,
      accessibility: options?.accessibility || false,
      security: options?.security || false,
      bestPractices: options?.bestPractices || false,
      mobile: options?.mobileUx || false, 
      content: options?.content || false
    };
    
    // Start the audit asynchronously
    await auditService.startAudit(websiteId, auditOptions);

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit:", error);
    return NextResponse.json(
      { error: "Failed to create audit" },
      { status: 500 }
    );
  }
});
