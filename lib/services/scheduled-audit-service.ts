// src/lib/services/scheduled-audit-service.ts
// Service for managing scheduled recurring audits

import { PrismaClient, Prisma } from '@prisma/client';
import { AdvancedAuditOrchestrator } from './advanced-audit-orchestrator';
import { NotificationService } from './notification-service';

// Define types based on Prisma schema
type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';

// Define interfaces for type safety
interface Website {
  id: string;
  userId: string;
  url: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuditSchedule {
  id: string;
  websiteId: string;
  enabled: boolean;
  frequency: ScheduleFrequency;
  categories: string[];
  lastRunAt: Date | null;
  nextScheduledAt: Date | null;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduledAuditService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.notificationService = new NotificationService(prisma);
  }
  
  /**
   * Process all websites due for scheduled audits
   */
  async processScheduledAudits(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all websites with scheduled audits due for next run
      const websites = await this.prisma.website.findMany({
        where: {
          auditScheduleEnabled: true,
          nextScheduledAuditAt: {
            lte: now,
          },
        },
        include: {
          auditSchedule: true,
          user: true,
        },
      });
      
      console.log(`Found ${websites.length} websites due for scheduled audits`);
      
      // Process each website
      for (const website of websites) {
        await this.runScheduledAudit(website);
      }
    } catch (error) {
      console.error('Error processing scheduled audits:', error);
    }
  }
  
  /**
   * Run a scheduled audit for a specific website
   */
  async runScheduledAudit(website: Website & { auditSchedule: AuditSchedule | null }): Promise<void> {
    try {
      const { id: websiteId, url, userId, auditSchedule } = website;
      
      // Default to weekly audits if no schedule is set
      const scheduleFrequency = auditSchedule?.frequency || 'WEEKLY';
      const categories = auditSchedule?.categories || ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT'];
      
      console.log(`Running scheduled audit for website ${websiteId} (${url}) with frequency ${scheduleFrequency}`);
      
      // Create a new audit
      const newAudit = await this.prisma.audit.create({
        data: {
          websiteId,
          userId,
          type: 'SCHEDULED',
          status: 'QUEUED',
          categories,
          url,
        },
      });
      
      // Run the audit
      const orchestrator = new AdvancedAuditOrchestrator(this.prisma);
      const auditResult = await orchestrator.runAudit(newAudit.id, url, categories);
      
      // Find the most recent previous audit for this website
      const mostRecentPreviousAudit = await this.prisma.audit.findFirst({
        where: { 
          websiteId,
          id: { not: newAudit.id }
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Create notifications based on the audit results
      await this.notificationService.createAuditNotifications(
        newAudit.id,
        websiteId,
        userId,
        mostRecentPreviousAudit?.id || null,
        auditResult
      );
      
      // Update the next scheduled audit time
      await this.updateNextScheduledAuditTime(website);
      
      console.log(`Completed scheduled audit for website ${websiteId}`);
    } catch (error) {
      console.error(`Error running scheduled audit for website ${website.id}:`, error);
      
      // Update the next scheduled audit time even if there was an error
      await this.updateNextScheduledAuditTime(website);
    }
  }
  
  /**
   * Update the next scheduled audit time based on the frequency
   */
  private async updateNextScheduledAuditTime(website: Website & { auditSchedule: AuditSchedule | null }): Promise<void> {
    const now = new Date();
    const frequency = website.auditSchedule?.frequency || 'WEEKLY';
    
    // Calculate next scheduled audit time
    let nextScheduledAuditAt: Date;
    
    switch (frequency) {
      case 'DAILY':
        nextScheduledAuditAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'WEEKLY':
        nextScheduledAuditAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'BIWEEKLY':
        nextScheduledAuditAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        break;
      case 'MONTHLY':
        // Add 30 days
        nextScheduledAuditAt = new Date(now);
        nextScheduledAuditAt.setDate(nextScheduledAuditAt.getDate() + 30);
        break;
      case 'QUARTERLY':
        // Add 90 days
        nextScheduledAuditAt = new Date(now);
        nextScheduledAuditAt.setDate(nextScheduledAuditAt.getDate() + 90);
        break;
      default:
        nextScheduledAuditAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to weekly
    }
    
    // Update the website
    await this.prisma.website.update({
      where: { id: website.id },
      data: {
        lastScheduledAuditAt: now,
        nextScheduledAuditAt,
      },
    });
  }
  
  /**
   * Enable scheduled audits for a website
   */
  async enableScheduledAudits(
    websiteId: string,
    frequency: ScheduleFrequency = 'WEEKLY',
    categories: string[] = ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT']
  ): Promise<void> {
    const now = new Date();
    let nextScheduledAuditAt: Date;
    
    // Calculate first scheduled audit time (start tomorrow)
    nextScheduledAuditAt = new Date(now);
    nextScheduledAuditAt.setDate(now.getDate() + 1);
    nextScheduledAuditAt.setHours(3, 0, 0, 0); // 3:00 AM
    
    // Update the website and create/update audit schedule
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        auditScheduleEnabled: true,
        nextScheduledAuditAt,
        auditSchedule: {
          upsert: {
            create: {
              frequency,
              categories,
              dayOfWeek: frequency === 'WEEKLY' || frequency === 'BIWEEKLY' ? 1 : null, // Monday
              dayOfMonth: frequency === 'MONTHLY' || frequency === 'QUARTERLY' ? 1 : null, // 1st day
            },
            update: {
              frequency,
              categories,
              dayOfWeek: frequency === 'WEEKLY' || frequency === 'BIWEEKLY' ? 1 : null,
              dayOfMonth: frequency === 'MONTHLY' || frequency === 'QUARTERLY' ? 1 : null,
            },
          },
        },
      },
    });
  }
  
  /**
   * Disable scheduled audits for a website
   */
  async disableScheduledAudits(websiteId: string): Promise<void> {
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        auditScheduleEnabled: false,
        nextScheduledAuditAt: null,
      },
    });
  }
  
  /**
   * Update audit schedule for a website
   */
  async updateAuditSchedule(
    websiteId: string,
    frequency: ScheduleFrequency,
    categories: string[],
    dayOfWeek?: number | null,
    dayOfMonth?: number | null
  ): Promise<void> {
    // Validate day of week/month based on frequency
    if ((frequency === 'WEEKLY' || frequency === 'BIWEEKLY') && !dayOfWeek) {
      dayOfWeek = 1; // Default to Monday
    }
    
    if ((frequency === 'MONTHLY' || frequency === 'QUARTERLY') && !dayOfMonth) {
      dayOfMonth = 1; // Default to 1st day
    }
    
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        auditSchedule: {
          upsert: {
            create: {
              frequency,
              categories,
              dayOfWeek,
              dayOfMonth,
            },
            update: {
              frequency,
              categories,
              dayOfWeek,
              dayOfMonth,
            },
          },
        },
      },
    });
    
    // Recalculate next scheduled audit time
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        auditSchedule: true,
      },
    });
    
    if (website) {
      await this.updateNextScheduledAuditTime(website);
    }
  }
  
  /**
   * Get audit schedule for a website
   */
  async getAuditSchedule(websiteId: string): Promise<{
    enabled: boolean;
    schedule: AuditSchedule | null;
    lastScheduledAuditAt: Date | null;
    nextScheduledAuditAt: Date | null;
  }> {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        auditSchedule: true,
      },
    });
    
    if (!website) {
      throw new Error(`Website with ID ${websiteId} not found`);
    }
    
    return {
      enabled: website.auditScheduleEnabled,
      schedule: website.auditSchedule,
      lastScheduledAuditAt: website.lastScheduledAuditAt,
      nextScheduledAuditAt: website.nextScheduledAuditAt,
    };
  }
  
  /**
   * Get scheduled audit history for a website
   */
  async getScheduledAuditHistory(
    websiteId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    audits: any[];
    total: number;
  }> {
    const skip = (page - 1) * pageSize;
    
    const [audits, total] = await Promise.all([
      this.prisma.audit.findMany({
        where: {
          websiteId,
          type: 'SCHEDULED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          completedAt: true,
          status: true,
          overallScore: true,
          seoScore: true,
          performanceScore: true,
          accessibilityScore: true,
          securityScore: true,
          mobileScore: true,
          contentScore: true,
        },
      }),
      this.prisma.audit.count({
        where: {
          websiteId,
          type: 'SCHEDULED',
        },
      }),
    ]);
    
    return { audits, total };
  }
}
