// src/app/api/cron/run-scheduled-audits/route.ts
// API route for running scheduled audits via cron job

import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service'
import { withAuth } from '@/lib/auth-utils'
import { format } from 'date-fns'

// Secure API route for cron jobs that can only be accessed with proper authorization
export const POST = async (request: NextRequest) => {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader
    
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.error('Unauthorized cron job attempt with invalid secret')
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }
    
    // Initialize Prisma client and scheduled audit service
    const prisma = new PrismaClient()
    const scheduledAuditService = new ScheduledAuditService(prisma)
    
    console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Starting scheduled audits processing`)
    
    // Process all scheduled audits
    await scheduledAuditService.processScheduledAudits()
    
    // Get statistics for the response
    const stats = await prisma.$transaction(async (tx) => {
      const totalScheduled = await tx.auditSchedule.count({
        where: { enabled: true }
      })
      
      const processedToday = await tx.audit.count({
        where: {
          type: 'SCHEDULED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
      
      const pendingAudits = await tx.audit.count({
        where: {
          status: { in: ['QUEUED', 'RUNNING'] },
          type: 'SCHEDULED'
        }
      })
      
      return { totalScheduled, processedToday, pendingAudits }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: "Scheduled audits processed successfully",
      timestamp: new Date().toISOString(),
      stats
    })
  } catch (error) {
    console.error("Error processing scheduled audits:", error)
    return NextResponse.json(
      { 
        error: "Failed to process scheduled audits", 
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// GET endpoint to check the status of the scheduled audit system
export const GET = withAuth(async (request: NextRequest, context: any, user: { id: string; email: string; role?: string }) => {
  // Only allow admin users to check the status
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
  }
  
  try {
    const prisma = new PrismaClient()
    
    // Get system statistics
    const stats = await prisma.$transaction(async (tx) => {
      const totalWebsites = await tx.website.count()
      
      const scheduledWebsites = await tx.website.count({
        where: { auditScheduleEnabled: true }
      })
      
      const scheduledAudits = await tx.audit.count({
        where: { type: 'SCHEDULED' }
      })
      
      const completedAudits = await tx.audit.count({
        where: { 
          type: 'SCHEDULED',
          status: 'COMPLETED'
        }
      })
      
      const failedAudits = await tx.audit.count({
        where: { 
          type: 'SCHEDULED',
          status: 'FAILED'
        }
      })
      
      const nextScheduled = await tx.website.findFirst({
        where: { auditScheduleEnabled: true },
        orderBy: { nextScheduledAuditAt: 'asc' },
        select: {
          id: true,
          name: true,
          url: true,
          nextScheduledAuditAt: true,
          auditSchedule: true
        }
      })
      
      return {
        totalWebsites,
        scheduledWebsites,
        scheduledAudits,
        completedAudits,
        failedAudits,
        nextScheduled,
        systemTime: new Date().toISOString()
      }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Error fetching scheduled audits status:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch scheduled audits status", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    )
  }
})
