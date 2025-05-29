import { type NextRequest, NextResponse } from "next/server"
import { scheduleQueries } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const schedule = await scheduleQueries.update(params.id, body)

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await scheduleQueries.delete(params.id)
    return NextResponse.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
