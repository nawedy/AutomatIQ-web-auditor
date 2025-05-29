import { type NextRequest, NextResponse } from "next/server"
import { auditQueries, websiteQueries, notificationQueries } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = "mock-user-id" // Replace with actual user ID from token

    // Check if website exists
    const website = await websiteQueries.findById(params.id)
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 })
    }

    // Create new audit
    const audit = await auditQueries.create({
      website_id: params.id,
      user_id: userId,
      status: "queued",
    })

    // Start audit process (in background)
    processAudit(audit.id, website.url, userId)

    return NextResponse.json({ audit }, { status: 201 })
  } catch (error) {
    console.error("Error starting audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processAudit(auditId: string, url: string, userId: string) {
  try {
    // Update status to running
    await auditQueries.updateStatus(auditId, "running")

    // Simulate audit process
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Generate mock results
    const results = {
      overall_score: Math.floor(Math.random() * 40) + 60,
      seo_score: Math.floor(Math.random() * 40) + 60,
      performance_score: Math.floor(Math.random() * 40) + 60,
      security_score: Math.floor(Math.random() * 40) + 60,
      ux_score: Math.floor(Math.random() * 40) + 60,
      issues_critical: Math.floor(Math.random() * 5),
      issues_warning: Math.floor(Math.random() * 10),
      issues_info: Math.floor(Math.random() * 15),
      metrics: {
        first_contentful_paint: (Math.random() * 2 + 0.5).toFixed(1),
        largest_contentful_paint: (Math.random() * 3 + 1).toFixed(1),
        cumulative_layout_shift: (Math.random() * 0.3).toFixed(3),
        first_input_delay: Math.floor(Math.random() * 100 + 20),
      },
      recommendations: {
        performance: ["Optimize images", "Minify CSS and JavaScript"],
        seo: ["Add meta descriptions", "Improve heading structure"],
        security: ["Enable HTTPS", "Update dependencies"],
      },
    }

    // Update audit with results
    await auditQueries.updateStatus(auditId, "completed", results)

    // Create notification
    await notificationQueries.create({
      user_id: userId,
      audit_id: auditId,
      type: "audit_complete",
      title: "Audit Completed",
      message: `Website audit completed with score: ${results.overall_score}`,
      priority: "medium",
      action_url: `/reports/${auditId}`,
    })
  } catch (error) {
    console.error("Error processing audit:", error)

    // Mark audit as failed
    await auditQueries.updateStatus(auditId, "failed", {
      error_message: "Audit processing failed",
    })

    // Create error notification
    await notificationQueries.create({
      user_id: userId,
      audit_id: auditId,
      type: "system",
      title: "Audit Failed",
      message: "Website audit failed to complete",
      priority: "high",
    })
  }
}
