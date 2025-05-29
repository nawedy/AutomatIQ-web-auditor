import { type NextRequest, NextResponse } from "next/server"

// Mock database
const websites = new Map()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  try {
    // Validate API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    if (!apiKey.startsWith("ak_live_")) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 401 })
    }

    const allWebsites = Array.from(websites.values())
    const paginatedWebsites = allWebsites.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginatedWebsites,
      pagination: {
        total: allWebsites.length,
        limit,
        offset,
        has_more: offset + limit < allWebsites.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    if (!apiKey.startsWith("ak_live_")) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, description, audit_frequency = "weekly", notifications = true, tags = [] } = body

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Create website
    const websiteId = `website_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const website = {
      id: websiteId,
      name,
      url,
      description: description || "",
      audit_frequency,
      notifications,
      tags,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_audit: null,
      next_audit: calculateNextAudit(audit_frequency),
      total_audits: 0,
      average_score: null,
    }

    websites.set(websiteId, website)

    return NextResponse.json(
      {
        data: website,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateNextAudit(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1)
      break
    case "weekly":
      now.setDate(now.getDate() + 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() + 1)
      break
    default:
      return ""
  }
  return now.toISOString()
}
