// src/app/api/audit-categories/[categoryId]/checks/route.ts
// API route for managing audit checks within a category

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth-utils";
import { z } from "zod";

// Schema for check creation
const createCheckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  weight: z.number().int().min(1).max(100),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
});

/**
 * GET /api/audit-categories/[categoryId]/checks
 * Get all checks for a specific category
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { categoryId: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { categoryId } = params;

    // Check if category exists
    const category = await prisma.auditCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get all checks for this category
    const checks = await prisma.auditCheck.findMany({
      where: { categoryId },
      orderBy: { weight: "desc" },
    });

    return NextResponse.json({ checks });
  } catch (error) {
    console.error(`Error fetching checks for category ${params.categoryId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch audit checks" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/audit-categories/[categoryId]/checks
 * Create a new audit check in a category (admin only)
 */
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: { categoryId: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { categoryId } = params;

    // Check if user is admin
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

    // Check if category exists
    const category = await prisma.auditCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCheckSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, weight, severity } = validationResult.data;

    // Check if check with this name already exists in this category
    const existingCheck = await prisma.auditCheck.findFirst({
      where: { 
        categoryId,
        name
      },
    });

    if (existingCheck) {
      return NextResponse.json(
        { error: "Check with this name already exists in this category" },
        { status: 409 }
      );
    }

    // Create check
    const check = await prisma.auditCheck.create({
      data: {
        name,
        description,
        weight,
        severity,
        categoryId,
      },
    });

    return NextResponse.json({ check }, { status: 201 });
  } catch (error) {
    console.error(`Error creating check for category ${params.categoryId}:`, error);
    return NextResponse.json(
      { error: "Failed to create audit check" },
      { status: 500 }
    );
  }
});
