import { type NextRequest, NextResponse } from "next/server"
import { websiteQueries } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const websites = await websiteQueries.findByUserId(userId)
    return NextResponse.json({ websites })
  } catch (error) {
    console.error("Error fetching websites:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, description, audit_frequency, notifications, tags } = body

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

    const website = await websiteQueries.create({
      user_id: userId,
      name,
      url,
      description,
      audit_frequency: audit_frequency || "weekly",
      notifications: notifications ?? true,
      tags: tags || [],
    })

    return NextResponse.json({ website }, { status: 201 })
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
