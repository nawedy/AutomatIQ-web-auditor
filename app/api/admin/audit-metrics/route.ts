// src/app/api/admin/audit-metrics/route.ts
// Admin API route for aggregated audit metrics

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { addDays, subDays, subMonths, subQuarters, format } from "date-fns"

// GET handler for fetching aggregated audit metrics (admin only)
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string; role?: string }
) => {
  // Check if user has admin role
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    )
  }

  try {
    // Get time range from query parameters (default to "week")
    const url = new URL(request.url)
    const timeRange = url.searchParams.get("timeRange") || "week"
    
    // Calculate start date based on time range
    const now = new Date()
    let startDate = new Date()
    let days = 7
    
    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7)
        days = 7
        break
      case "month":
        startDate = subMonths(now, 1)
        days = 30
        break
      case "quarter":
        startDate = subQuarters(now, 1)
        days = 90
        break
      default:
        startDate = subDays(now, 7)
        days = 7
    }
    
    // Get total audits in the time range
    const totalAudits = await prisma.audit.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })
    
    // Get completed audits in the time range
    const completedAudits = await prisma.audit.count({
      where: {
        createdAt: {
          gte: startDate
        },
        status: "completed"
      }
    })
    
    // Get failed audits in the time range
    const failedAudits = await prisma.audit.count({
      where: {
        createdAt: {
          gte: startDate
        },
        status: "failed"
      }
    })
    
    // Get average audit duration
    const audits = await prisma.audit.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        status: "completed",
        startedAt: { not: null },
        completedAt: { not: null }
      },
      select: {
        startedAt: true,
        completedAt: true
      }
    })
    
    let totalDuration = 0
    audits.forEach(audit => {
      if (audit.startedAt && audit.completedAt) {
        const duration = audit.completedAt.getTime() - audit.startedAt.getTime()
        totalDuration += duration
      }
    })
    
    const averageDuration = audits.length > 0 ? totalDuration / audits.length : 0
    
    // Get audit results by severity
    const auditResults = await prisma.auditResult.groupBy({
      by: ["severity"],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })
    
    const resultsBySeverity = auditResults.reduce((acc, item) => {
      acc[item.severity] = item._count.id
      return acc
    }, {
      error: 0,
      warning: 0,
      info: 0,
      success: 0
    })
    
    // Get audit results by category
    const auditResultsByCategory = await prisma.auditResult.groupBy({
      by: ["categoryId"],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })
    
    // Get category names
    const categories = await prisma.auditCategory.findMany({
      select: {
        id: true,
        name: true
      }
    })
    
    const categoryMap = categories.reduce((acc, category) => {
      acc[category.id] = category.name
      return acc
    }, {})
    
    const resultsByCategory = auditResultsByCategory.map(item => ({
      category: categoryMap[item.categoryId] || "Unknown",
      count: item._count.id
    }))
    
    // Get daily audit counts for the time range
    const dailyAudits = []
    const dailyIssues = []
    
    // Format date labels based on time range
    const getDateLabel = (date: Date) => {
      if (timeRange === "week") {
        return format(date, "EEE") // Mon, Tue, etc.
      } else if (timeRange === "month") {
        return format(date, "MMM d") // Jan 1, Jan 2, etc.
      } else {
        return format(date, "MMM") // Jan, Feb, etc. for quarterly view
      }
    }
    
    // Group by day for week, by week for month, by month for quarter
    const groupingFactor = timeRange === "week" ? 1 : timeRange === "month" ? 3 : 10
    const groupCount = timeRange === "week" ? 7 : timeRange === "month" ? 10 : 9
    
    for (let i = 0; i < groupCount; i++) {
      const groupEndDate = subDays(now, i * groupingFactor)
      const groupStartDate = subDays(groupEndDate, groupingFactor - 1)
      groupStartDate.setHours(0, 0, 0, 0)
      groupEndDate.setHours(23, 59, 59, 999)
      
      // Count audits for this group
      const groupAudits = await prisma.audit.count({
        where: {
          createdAt: {
            gte: groupStartDate,
            lte: groupEndDate
          }
        }
      })
      
      // Count issues by severity for this group
      const criticalIssues = await prisma.auditResult.count({
        where: {
          createdAt: {
            gte: groupStartDate,
            lte: groupEndDate
          },
          severity: "error"
        }
      })
      
      const warningIssues = await prisma.auditResult.count({
        where: {
          createdAt: {
            gte: groupStartDate,
            lte: groupEndDate
          },
          severity: "warning"
        }
      })
      
      const infoIssues = await prisma.auditResult.count({
        where: {
          createdAt: {
            gte: groupStartDate,
            lte: groupEndDate
          },
          severity: "info"
        }
      })
      
      const dateLabel = getDateLabel(groupStartDate)
      
      dailyAudits.push({
        date: dateLabel,
        count: groupAudits
      })
      
      dailyIssues.push({
        date: dateLabel,
        critical: criticalIssues,
        warning: warningIssues,
        info: infoIssues
      })
    }
    
    // Get average scores by category
    const auditSummaries = await prisma.auditSummary.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        securityScore: true,
        bestPracticesScore: true
      }
    })
    
    let totalSeo = 0
    let totalPerformance = 0
    let totalAccessibility = 0
    let totalSecurity = 0
    let totalBestPractices = 0
    
    auditSummaries.forEach(summary => {
      totalSeo += summary.seoScore || 0
      totalPerformance += summary.performanceScore || 0
      totalAccessibility += summary.accessibilityScore || 0
      totalSecurity += summary.securityScore || 0
      totalBestPractices += summary.bestPracticesScore || 0
    })
    
    const count = auditSummaries.length
    
    // Get previous period data for comparison
    const previousPeriodStartDate = new Date(startDate)
    previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - days)
    
    const previousPeriodSummaries = await prisma.auditSummary.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStartDate,
          lt: startDate
        }
      },
      select: {
        seoScore: true,
        performanceScore: true,
        accessibilityScore: true,
        securityScore: true,
        bestPracticesScore: true
      }
    })
    
    let previousTotalScore = 0
    previousPeriodSummaries.forEach(summary => {
      previousTotalScore += (
        (summary.seoScore || 0) + 
        (summary.performanceScore || 0) + 
        (summary.accessibilityScore || 0) + 
        (summary.securityScore || 0) + 
        (summary.bestPracticesScore || 0)
      ) / 5
    })
    
    const previousPeriodAverage = previousPeriodSummaries.length > 0 ? 
      previousTotalScore / previousPeriodSummaries.length : 0
    
    const currentAverage = count > 0 ? 
      (totalSeo + totalPerformance + totalAccessibility + totalSecurity + totalBestPractices) / (count * 5) : 0
    
    const averageScoreChange = previousPeriodAverage > 0 ? 
      currentAverage - previousPeriodAverage : 0
    
    // Format category scores for the frontend
    const categoryScores = [
      { category: "SEO", average: count > 0 ? totalSeo / count : 0, highest: 100, lowest: 0 },
      { category: "Performance", average: count > 0 ? totalPerformance / count : 0, highest: 100, lowest: 0 },
      { category: "Accessibility", average: count > 0 ? totalAccessibility / count : 0, highest: 100, lowest: 0 },
      { category: "Security", average: count > 0 ? totalSecurity / count : 0, highest: 100, lowest: 0 },
      { category: "Best Practices", average: count > 0 ? totalBestPractices / count : 0, highest: 100, lowest: 0 }
    ]
    
    // Calculate issues fixed in current period vs previous period
    const currentPeriodIssuesFixed = await prisma.auditResult.count({
      where: {
        createdAt: {
          gte: startDate
        },
        status: "fixed"
      }
    })
    
    const previousPeriodIssuesFixed = await prisma.auditResult.count({
      where: {
        createdAt: {
          gte: previousPeriodStartDate,
          lt: startDate
        },
        status: "fixed"
      }
    })
    
    const totalIssues = await prisma.auditResult.count({
      where: {
        createdAt: {
          gte: startDate
        },
        severity: {
          in: ["error", "warning"]
        }
      }
    })
    
    const issueFixRate = totalIssues > 0 ? (currentPeriodIssuesFixed / totalIssues) * 100 : 0
    const issueFixChange = previousPeriodIssuesFixed > 0 ? 
      ((currentPeriodIssuesFixed - previousPeriodIssuesFixed) / previousPeriodIssuesFixed) * 100 : 0
    
    // Compile audit metrics in the format expected by the frontend
    const auditMetrics = {
      totalAudits,
      completedAudits,
      failedAudits,
      averageAuditDuration: averageDuration,
      categoryScores,
      issuesByDay: dailyIssues.reverse(), // Most recent last
      issuesBySeverity: {
        critical: resultsBySeverity.error || 0,
        warning: resultsBySeverity.warning || 0,
        info: resultsBySeverity.info || 0
      },
      issuesByCategory: resultsByCategory,
      auditsByDay: dailyAudits.reverse(), // Most recent last
      averageScores: {
        overall: currentAverage,
        previousPeriod: previousPeriodAverage,
        change: averageScoreChange
      },
      issuesFixed: {
        count: currentPeriodIssuesFixed,
        rate: issueFixRate,
        change: issueFixChange
      }
    }
    
    return NextResponse.json(auditMetrics)
  } catch (error) {
    console.error("Error fetching audit metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch audit metrics" },
      { status: 500 }
    )
  }
})
