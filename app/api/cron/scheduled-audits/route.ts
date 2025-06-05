// src/app/api/cron/scheduled-audits/route.ts
// API route for processing scheduled audits via cron job

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service';

/**
 * Process all scheduled audits that are due to run
 * This endpoint should be called by a cron job at regular intervals (e.g., every 15 minutes)
 * It is protected by a secret key to prevent unauthorized access
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify the request has the correct authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Process scheduled audits
    const scheduledAuditService = new ScheduledAuditService(prisma);
    const result = await scheduledAuditService.processScheduledAudits();
    
    return NextResponse.json({
      message: 'Scheduled audits processed successfully',
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      nextScheduled: result.nextScheduled
    });
  } catch (error) {
    console.error('Error processing scheduled audits:', error);
    return NextResponse.json(
      { error: `Failed to process scheduled audits: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for the cron job
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify the request has the correct authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get count of pending scheduled audits
    const pendingCount = await prisma.auditSchedule.count({
      where: {
        enabled: true,
        nextScheduledAt: {
          lte: new Date()
        }
      }
    });
    
    // Get count of all scheduled audits
    const totalCount = await prisma.auditSchedule.count({
      where: {
        enabled: true
      }
    });
    
    return NextResponse.json({
      status: 'healthy',
      pendingAudits: pendingCount,
      totalEnabledAudits: totalCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking scheduled audits health:', error);
    return NextResponse.json(
      { error: `Failed to check scheduled audits health: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
