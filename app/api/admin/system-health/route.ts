// src/app/api/admin/system-health/route.ts
// Admin API route for system health monitoring

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import os from "os"

// GET handler for fetching system health metrics (admin only)
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
    // Start timing for API response time
    const startTime = process.hrtime()
    
    // Get basic system metrics
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsage = process.memoryUsage()
    const cpuUsage = os.loadavg()
    const uptime = os.uptime()
    
    // Get database metrics
    const dbStartTime = process.hrtime()
    
    // Count total users
    const userCount = await prisma.user.count()
    
    // Count total websites
    const websiteCount = await prisma.website.count()
    
    // Count total audits
    const auditCount = await prisma.audit.count()
    
    // Count audits in the last 24 hours
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    const recentAuditsCount = await prisma.audit.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    })
    
    // Get recent errors
    const recentErrors = await prisma.auditResult.findMany({
      where: {
        severity: "error",
        createdAt: {
          gte: oneDayAgo
        }
      },
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        message: true,
        severity: true,
        createdAt: true,
        audit: {
          select: {
            id: true,
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
        }
      }
    })
    
    // Calculate DB query time
    const dbElapsed = process.hrtime(dbStartTime)
    const dbQueryTime = (dbElapsed[0] * 1000 + dbElapsed[1] / 1000000).toFixed(2)
    
    // Generate performance metrics for the last 24 hours (simulated for now)
    const performanceMetrics = generatePerformanceMetrics()
    
    // Calculate API response time
    const elapsed = process.hrtime(startTime)
    const responseTime = (elapsed[0] * 1000 + elapsed[1] / 1000000).toFixed(2)
    
    // Compile system health data
    const systemHealth = {
      timestamp: new Date().toISOString(),
      responseTime: parseFloat(responseTime),
      dbQueryTime: parseFloat(dbQueryTime),
      system: {
        uptime,
        cpuUsage: {
          loadAvg1: cpuUsage[0],
          loadAvg5: cpuUsage[1],
          loadAvg15: cpuUsage[2]
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usedPercentage: (usedMemory / totalMemory * 100).toFixed(2),
          processUsage: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external
          }
        }
      },
      database: {
        userCount,
        websiteCount,
        auditCount,
        recentAuditsCount,
        recentErrors: recentErrors.map(error => ({
          id: error.id,
          message: error.message,
          severity: error.severity,
          createdAt: error.createdAt,
          websiteUrl: error.audit.website.url,
          clientName: error.audit.website.user.name,
          clientEmail: error.audit.website.user.email
        }))
      },
      performance: performanceMetrics
    }
    
    return NextResponse.json(systemHealth)
  } catch (error) {
    console.error("Error fetching system health:", error)
    return NextResponse.json(
      { error: "Failed to fetch system health metrics" },
      { status: 500 }
    )
  }
})

// Helper function to generate performance metrics for the last 24 hours
function generatePerformanceMetrics() {
  const metrics = []
  const now = new Date()
  
  // Generate 24 hourly data points
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now)
    timestamp.setHours(now.getHours() - i)
    
    metrics.push({
      timestamp: timestamp.toISOString(),
      apiResponseTime: Math.random() * 100 + 50, // 50-150ms
      dbQueryTime: Math.random() * 30 + 10, // 10-40ms
      cpuUsage: Math.random() * 30 + 10, // 10-40%
      memoryUsage: Math.random() * 40 + 30, // 30-70%
      activeUsers: Math.floor(Math.random() * 50) + 5, // 5-55 users
      requestsPerMinute: Math.floor(Math.random() * 100) + 20 // 20-120 requests
    })
  }
  
  return metrics
}
