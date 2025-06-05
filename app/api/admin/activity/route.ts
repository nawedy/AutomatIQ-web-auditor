// src/app/api/admin/activity/route.ts
// Admin API route for recent platform activity

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

// GET handler for fetching recent platform activity (admin only)
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
    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get("limit") || "20", 10)
    const activityType = url.searchParams.get("type") || null
    
    // Calculate start date (default to last 7 days)
    const days = parseInt(url.searchParams.get("days") || "7", 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Fetch recent audits (as one type of activity)
    const recentAudits = await prisma.audit.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      take: activityType === "audit" ? limit : Math.floor(limit / 3),
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
        website: {
          select: {
            id: true,
            url: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    // Fetch recent user logins (as another type of activity)
    // Note: This assumes you have a session or login tracking table
    // If not, you can use user creation or updates as a proxy
    const recentUserActivity = await prisma.user.findMany({
      where: {
        updatedAt: {
          gte: startDate
        }
      },
      take: activityType === "user" ? limit : Math.floor(limit / 3),
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
        lastActive: true
      }
    })
    
    // Fetch recent website additions (as another type of activity)
    const recentWebsites = await prisma.website.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      take: activityType === "website" ? limit : Math.floor(limit / 3),
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        url: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Transform audit data into activity format
    const auditActivities = recentAudits.map(audit => ({
      id: `audit-${audit.id}`,
      type: "audit",
      action: audit.status === "completed" ? "completed" : 
              audit.status === "failed" ? "failed" : "started",
      timestamp: audit.completedAt || audit.createdAt,
      details: {
        auditId: audit.id,
        websiteId: audit.website.id,
        websiteUrl: audit.website.url,
        status: audit.status
      },
      user: {
        id: audit.website.user.id,
        name: audit.website.user.name,
        email: audit.website.user.email
      }
    }))
    
    // Transform user data into activity format
    const userActivities = recentUserActivity.map(user => ({
      id: `user-${user.id}-${user.updatedAt.getTime()}`,
      type: "user",
      action: user.lastActive ? "login" : "update",
      timestamp: user.lastActive || user.updatedAt,
      details: {
        userId: user.id
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }))
    
    // Transform website data into activity format
    const websiteActivities = recentWebsites.map(website => ({
      id: `website-${website.id}`,
      type: "website",
      action: "created",
      timestamp: website.createdAt,
      details: {
        websiteId: website.id,
        websiteUrl: website.url
      },
      user: {
        id: website.user.id,
        name: website.user.name,
        email: website.user.email
      }
    }))
    
    // Combine all activities
    let allActivities = []
    
    if (activityType) {
      // Filter by activity type if specified
      switch (activityType) {
        case "audit":
          allActivities = auditActivities
          break
        case "user":
          allActivities = userActivities
          break
        case "website":
          allActivities = websiteActivities
          break
        default:
          allActivities = [...auditActivities, ...userActivities, ...websiteActivities]
      }
    } else {
      // Combine all activities if no type filter
      allActivities = [...auditActivities, ...userActivities, ...websiteActivities]
    }
    
    // Sort by timestamp (most recent first)
    allActivities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    
    // Limit to requested number
    const limitedActivities = allActivities.slice(0, limit)
    
    return NextResponse.json({
      activities: limitedActivities,
      total: allActivities.length,
      timeRange: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    )
  }
})
