import { type NextRequest, NextResponse } from "next/server"
import { scheduleQueries } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schedules = await scheduleQueries.findByUserId(userId)
    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Error fetching schedules:", error)
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
    const { website_id, type, frequency, scheduled_at, time_of_day, timezone } = body

    // Validate required fields
    if (!website_id || !type) {
      return NextResponse.json({ error: "Website ID and type are required" }, { status: 400 })
    }

    if (type === "one_time" && !scheduled_at) {
      return NextResponse.json({ error: "Scheduled time is required for one-time audits" }, { status: 400 })
    }

    if (type === "recurring" && !frequency) {
      return NextResponse.json({ error: "Frequency is required for recurring audits" }, { status: 400 })
    }

    const schedule = await scheduleQueries.create({
      website_id,
      user_id: userId,
      type,
      frequency,
      scheduled_at,
      time_of_day: time_of_day || "09:00:00",
      timezone: timezone || "UTC",
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
