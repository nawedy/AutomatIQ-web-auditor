// src/app/api/admin/recent-activity/route.ts
// Admin API route for fetching recent activity across the platform

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

// GET handler for fetching recent activity (admin only)
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
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get("limit") || "10", 10)
    
    // Get recent audits
    const recentAudits = await prisma.audit.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        website: {
          select: {
            url: true,
            name: true,
            client: {
              select: {
                name: true,
                id: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            id: true
          }
        }
      }
    })
    
    // Get recent user logins
    const recentLogins = await prisma.session.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true,
            role: true
          }
        }
      }
    })
    
    // Get recent client registrations
    const recentClients = await prisma.client.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        status: true,
        websites: {
          select: {
            id: true
          }
        },
        users: {
          select: {
            id: true
          }
        }
      }
    })
    
    // Get recent system alerts/errors
    const recentAlerts = await prisma.systemAlert.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        type: true,
        message: true,
        severity: true,
        createdAt: true,
        resolved: true
      }
    })
    
    // Format the data for the frontend
    const formattedAudits = recentAudits.map(audit => ({
      id: audit.id,
      type: "audit",
      title: `Audit for ${audit.website.name || audit.website.url}`,
      clientName: audit.website.client.name,
      clientId: audit.website.client.id,
      status: audit.status,
      user: audit.user ? {
        id: audit.user.id,
        name: audit.user.name || audit.user.email
      } : null,
      timestamp: audit.createdAt,
      timeAgo: formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true }),
      details: {
        websiteUrl: audit.website.url,
        duration: audit.completedAt && audit.startedAt ? 
          (new Date(audit.completedAt).getTime() - new Date(audit.startedAt).getTime()) / 1000 : null
      }
    }))
    
    const formattedLogins = recentLogins.map(session => ({
      id: session.id,
      type: "login",
      title: `User login: ${session.user.name || session.user.email}`,
      user: {
        id: session.user.id,
        name: session.user.name || session.user.email,
        role: session.user.role
      },
      timestamp: session.createdAt,
      timeAgo: formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }),
      details: {
        userAgent: session.userAgent || "Unknown device",
        ipAddress: session.ipAddress || "Unknown location"
      }
    }))
    
    const formattedClients = recentClients.map(client => ({
      id: client.id,
      type: "client",
      title: `New client: ${client.name}`,
      status: client.status,
      timestamp: client.createdAt,
      timeAgo: formatDistanceToNow(new Date(client.createdAt), { addSuffix: true }),
      details: {
        websiteCount: client.websites.length,
        userCount: client.users.length
      }
    }))
    
    const formattedAlerts = recentAlerts.map(alert => ({
      id: alert.id,
      type: "alert",
      title: alert.message,
      severity: alert.severity,
      timestamp: alert.createdAt,
      timeAgo: formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }),
      resolved: alert.resolved,
      details: {
        alertType: alert.type
      }
    }))
    
    // Combine all activities and sort by timestamp
    const allActivities = [
      ...formattedAudits,
      ...formattedLogins,
      ...formattedClients,
      ...formattedAlerts
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Take only the most recent activities up to the limit
    const recentActivity = allActivities.slice(0, limit)
    
    return NextResponse.json({
      recentActivity,
      counts: {
        audits: formattedAudits.length,
        logins: formattedLogins.length,
        clients: formattedClients.length,
        alerts: formattedAlerts.length
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
