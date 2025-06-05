// src/app/api/websites/[id]/schedule/route.ts
// API route for managing scheduled audits for a website

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service';

// Define the schedule frequency type to match Prisma schema
type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';

/**
 * Get scheduled audit configuration for a website
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    
    // Verify website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    const scheduledAuditService = new ScheduledAuditService(prisma);
    const scheduleInfo = await scheduledAuditService.getAuditSchedule(websiteId);
    
    return NextResponse.json(scheduleInfo);
  } catch (error) {
    console.error('Error getting scheduled audit configuration:', error);
    return NextResponse.json(
      { error: `Failed to get scheduled audit configuration: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});

/**
 * Create or update scheduled audit configuration for a website
 */
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    
    // Verify website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { enabled, frequency, categories, dayOfWeek, dayOfMonth } = await request.json() as {
      enabled: boolean;
      frequency?: ScheduleFrequency;
      categories?: string[];
      dayOfWeek?: number | null;
      dayOfMonth?: number | null;
    };
    
    const scheduledAuditService = new ScheduledAuditService(prisma);
    
    if (enabled) {
      // Enable scheduled audits with the provided configuration
      if (frequency) {
        await scheduledAuditService.updateAuditSchedule(
          websiteId,
          frequency,
          categories || ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT'],
          dayOfWeek,
          dayOfMonth
        );
        
        await scheduledAuditService.enableScheduledAudits(
          websiteId,
          frequency,
          categories || ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT']
        );
      } else {
        // Use default configuration if not provided
        await scheduledAuditService.enableScheduledAudits(websiteId);
      }
      
      return NextResponse.json({ 
        message: 'Scheduled audits enabled successfully',
        enabled: true
      });
    } else {
      // Disable scheduled audits
      await scheduledAuditService.disableScheduledAudits(websiteId);
      
      return NextResponse.json({ 
        message: 'Scheduled audits disabled successfully',
        enabled: false
      });
    }
  } catch (error) {
    console.error('Error updating scheduled audit configuration:', error);
    return NextResponse.json(
      { error: `Failed to update scheduled audit configuration: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});

/**
 * Delete scheduled audit configuration for a website
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const websiteId = params.id;
    
    // Verify website exists and belongs to the user
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: user.id,
      },
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    const scheduledAuditService = new ScheduledAuditService(prisma);
    await scheduledAuditService.disableScheduledAudits(websiteId);
    
    // Delete the schedule configuration
    await prisma.auditSchedule.deleteMany({
      where: { websiteId },
    });
    
    return NextResponse.json({ 
      message: 'Scheduled audit configuration deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting scheduled audit configuration:', error);
    return NextResponse.json(
      { error: `Failed to delete scheduled audit configuration: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});
