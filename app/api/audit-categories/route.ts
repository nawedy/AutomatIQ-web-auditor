// src/app/api/audit-categories/route.ts
// API route for managing audit categories

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth-utils";
import { z } from "zod";

// Schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/, {
    message: "Slug must contain only lowercase letters, numbers, and underscores",
  }),
});

/**
 * GET /api/audit-categories
 * Get all audit categories
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    // Get all categories
    const categories = await prisma.auditCategory.findMany({
      include: {
        checks: {
          select: {
            id: true,
            name: true,
            description: true,
            weight: true,
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching audit categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit categories" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/audit-categories
 * Create a new audit category (admin only)
 */
export const POST = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    // Check if user is admin (you would need to implement this check)
    const isAdmin = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!isAdmin || isAdmin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCategorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, slug } = validationResult.data;

    // Check if category with this slug already exists
    const existingCategory = await prisma.auditCategory.findFirst({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    // Create category
    const category = await prisma.auditCategory.create({
      data: {
        name,
        description,
        slug,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit category:", error);
    return NextResponse.json(
      { error: "Failed to create audit category" },
      { status: 500 }
    );
  }
});
