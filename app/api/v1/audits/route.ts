import { type NextRequest, NextResponse } from "next/server"

// Mock database
const audits = new Map()
const websites = new Map()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const websiteId = searchParams.get("website_id")
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

    // Filter audits
    let filteredAudits = Array.from(audits.values())
    if (websiteId) {
      filteredAudits = filteredAudits.filter((audit) => audit.website_id === websiteId)
    }

    // Paginate
    const paginatedAudits = filteredAudits.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginatedAudits,
      pagination: {
        total: filteredAudits.length,
        limit,
        offset,
        has_more: offset + limit < filteredAudits.length,
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
    const { url, website_id, options = {} } = body

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Create audit
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const audit = {
      id: auditId,
      url,
      website_id: website_id || null,
      status: "queued",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: {
        include_seo: options.include_seo !== false,
        include_performance: options.include_performance !== false,
        include_security: options.include_security !== false,
        include_ux: options.include_ux !== false,
        ...options,
      },
    }

    audits.set(auditId, audit)

    // Simulate audit processing
    setTimeout(() => {
      const updatedAudit = {
        ...audit,
        status: "running",
        updated_at: new Date().toISOString(),
      }
      audits.set(auditId, updatedAudit)

      // Complete audit after delay
      setTimeout(() => {
        const completedAudit = {
          ...updatedAudit,
          status: "completed",
          updated_at: new Date().toISOString(),
          results: {
            overall_score: Math.floor(Math.random() * 40) + 60,
            seo_score: Math.floor(Math.random() * 40) + 60,
            performance_score: Math.floor(Math.random() * 40) + 60,
            security_score: Math.floor(Math.random() * 40) + 60,
            ux_score: Math.floor(Math.random() * 40) + 60,
            issues: {
              critical: Math.floor(Math.random() * 5),
              warning: Math.floor(Math.random() * 10),
              info: Math.floor(Math.random() * 15),
            },
            metrics: {
              first_contentful_paint: (Math.random() * 2 + 0.5).toFixed(1),
              largest_contentful_paint: (Math.random() * 3 + 1).toFixed(1),
              cumulative_layout_shift: (Math.random() * 0.3).toFixed(3),
              first_input_delay: Math.floor(Math.random() * 100 + 20),
            },
          },
        }
        audits.set(auditId, completedAudit)

        // Send webhook if configured
        sendWebhook(completedAudit)
      }, 5000)
    }, 1000)

    return NextResponse.json(
      {
        data: audit,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendWebhook(audit: any) {
  // Mock webhook sending
  console.log("Sending webhook for audit:", audit.id)

  const webhookUrl = "https://example.com/webhook" // This would come from user settings

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AuditPro-Webhook/1.0",
      },
      body: JSON.stringify({
        event: "audit.completed",
        data: audit,
      }),
    })
  } catch (error) {
    console.error("Webhook failed:", error)
  }
}
