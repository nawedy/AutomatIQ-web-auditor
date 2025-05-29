import { type NextRequest, NextResponse } from "next/server"

// Mock database
const audits = new Map()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const audit = audits.get(params.id)
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: audit,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const audit = audits.get(params.id)
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Only allow deletion of completed or failed audits
    if (audit.status === "running" || audit.status === "queued") {
      return NextResponse.json({ error: "Cannot delete running audit" }, { status: 400 })
    }

    audits.delete(params.id)

    return NextResponse.json({
      message: "Audit deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
