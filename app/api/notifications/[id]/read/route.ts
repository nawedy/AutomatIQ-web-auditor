import { type NextRequest, NextResponse } from "next/server"
import { notificationQueries } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notification = await notificationQueries.markAsRead(params.id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
