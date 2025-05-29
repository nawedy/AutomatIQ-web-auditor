import { type NextRequest, NextResponse } from "next/server"
import { notificationQueries } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const userId = "mock-user-id" // Replace with actual user ID from token

    const notifications = await notificationQueries.findByUserId(userId)
    const unreadCount = await notificationQueries.getUnreadCount(userId)

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = "mock-user-id" // Replace with actual user ID from token
    const body = await request.json()

    const notification = await notificationQueries.create({
      user_id: userId,
      ...body,
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
