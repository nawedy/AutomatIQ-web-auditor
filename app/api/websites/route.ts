// src/app/api/websites/route.ts
// API routes for managing websites

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/auth-utils"
import { z } from "zod"

// Schema for website creation and update
const websiteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL format"),
  description: z.string().optional(),
  audit_frequency: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  notifications: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
})

/**
 * GET /api/websites
 * Get all websites for the authenticated user
 */
export const GET = withAuth(async (request: NextRequest, context, user) => {
  try {
    // Get all websites for the user with audit statistics
    const websites = await prisma.website.findMany({
      where: { userId: user.id },
      include: {
        audits: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            summary: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    // Format the response
    const websitesWithStats = websites.map((website: any) => ({
      id: website.id,
      name: website.name,
      url: website.url,
      description: website.description,
      audit_frequency: website.auditFrequency,
      notifications: website.notifications,
      tags: website.tags,
      created_at: website.createdAt,
      updated_at: website.updatedAt,
      last_audit: website.audits[0] || null,
      average_score: website.audits[0]?.summary?.overallScore || null,
    }))

    // Return the websites
    return NextResponse.json({ websites: websitesWithStats })
  } catch (error) {
    console.error("Error fetching websites:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

/**
 * POST /api/websites
 * Create a new website for the authenticated user
 */
export const POST = withAuth(async (request: NextRequest, context, user) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = websiteSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { name, url, description, audit_frequency, notifications, tags } = validationResult.data

    // Create the website
    const website = await prisma.website.create({
      data: {
        userId: user.id,
        name,
        url,
        description,
        auditFrequency: audit_frequency,
        notifications,
        tags,
      },
    })

    return NextResponse.json({ website }, { status: 201 })
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
