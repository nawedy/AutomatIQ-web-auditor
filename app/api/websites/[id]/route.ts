import { type NextRequest, NextResponse } from "next/server"
import { websiteQueries } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const website = await websiteQueries.findById(params.id)

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 })
    }

    return NextResponse.json({ website })
  } catch (error) {
    console.error("Error fetching website:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const website = await websiteQueries.update(params.id, body)

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 })
    }

    return NextResponse.json({ website })
  } catch (error) {
    console.error("Error updating website:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await websiteQueries.delete(params.id)
    return NextResponse.json({ message: "Website deleted successfully" })
  } catch (error) {
    console.error("Error deleting website:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
