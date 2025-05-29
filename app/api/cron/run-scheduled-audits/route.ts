import { type NextRequest, NextResponse } from "next/server"
import { scheduleQueries, auditQueries, websiteQueries, userQueries } from "@/lib/database"
import { emailService } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get("authorization")?.replace("Bearer ", "")
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get due schedules
    const dueSchedules = await scheduleQueries.findDueSchedules()
    console.log(`Found ${dueSchedules.length} due schedules`)

    const results = []

    for (const schedule of dueSchedules) {
      try {
        // Get website and user info
        const website = await websiteQueries.findById(schedule.website_id)
        const user = await userQueries.findById(schedule.user_id)

        if (!website || !user) {
          console.error(`Missing website or user for schedule ${schedule.id}`)
          continue
        }

        // Create audit
        const audit = await auditQueries.create({
          website_id: schedule.website_id,
          user_id: schedule.user_id,
          status: "queued",
        })

        // Process audit in background
        processScheduledAudit(audit.id, website.url, user.email, website.name)

        // Update schedule next run time
        let nextRunAt: string
        if (schedule.type === "one_time") {
          // Disable one-time schedules after execution
          await scheduleQueries.toggle(schedule.id, false)
          nextRunAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Far future
        } else {
          // Calculate next run for recurring schedules
          const now = new Date()
          switch (schedule.frequency) {
            case "daily":
              nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
              break
            case "weekly":
              nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
              break
            case "monthly":
              nextRunAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
              break
            default:
              nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
          }
        }

        await scheduleQueries.updateNextRun(schedule.id, nextRunAt)

        results.push({
          scheduleId: schedule.id,
          auditId: audit.id,
          websiteName: website.name,
          status: "started",
        })
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error)
        results.push({
          scheduleId: schedule.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${dueSchedules.length} scheduled audits`,
      results,
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processScheduledAudit(auditId: string, url: string, userEmail: string, websiteName: string) {
  try {
    // Update status to running
    await auditQueries.updateStatus(auditId, "running")

    // Simulate audit process
    await new Promise((resolve) => setTimeout(resolve, 10000)) // 10 seconds

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

    // Send email notification
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reports/${auditId}`
    await emailService.sendAuditCompleteEmail(
      userEmail,
      websiteName,
      results.overall_score,
      results.issues_critical + results.issues_warning + results.issues_info,
      reportUrl,
    )

    console.log(`Scheduled audit completed for ${websiteName}`)
  } catch (error) {
    console.error("Error processing scheduled audit:", error)

    // Mark audit as failed
    await auditQueries.updateStatus(auditId, "failed", {
      error_message: "Scheduled audit processing failed",
    })
  }
}
