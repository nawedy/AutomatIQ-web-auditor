// src/lib/services/continuous-monitoring-service.ts
// Service for continuous website monitoring and scheduled audits

import { PrismaClient, Website, MonitoringSchedule, MonitoringType } from '@prisma/client';
import { NotificationService } from './notification-service';
import { AdvancedAuditOrchestrator } from './advanced-audit-orchestrator';
import { ComprehensiveAuditResult } from '../types/advanced-audit';

export class ContinuousMonitoringService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.notificationService = new NotificationService(prisma);
  }
  
  /**
   * Process all websites due for monitoring
   */
  async processScheduledMonitoring(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all websites with monitoring enabled and due for next check
      const websites = await this.prisma.website.findMany({
        where: {
          monitoringEnabled: true,
          nextMonitoringAt: {
            lte: now,
          },
        },
        include: {
          monitoringSchedule: true,
          user: true,
        },
      });
      
      console.log(`Found ${websites.length} websites due for monitoring`);
      
      // Process each website
      for (const website of websites) {
        await this.monitorWebsite(website);
      }
    } catch (error) {
      console.error('Error processing scheduled monitoring:', error);
    }
  }
  
  /**
   * Monitor a specific website
   */
  async monitorWebsite(website: Website & { monitoringSchedule: MonitoringSchedule | null }): Promise<void> {
    try {
      const { id: websiteId, url, userId, monitoringSchedule } = website;
      
      // Default to daily monitoring if no schedule is set
      const monitoringType = monitoringSchedule?.type || 'DAILY';
      const monitoringCategories = monitoringSchedule?.categories || ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY'];
      
      console.log(`Monitoring website ${websiteId} (${url}) with type ${monitoringType}`);
      
      // Find the most recent audit for this website
      const mostRecentAudit = await this.prisma.audit.findFirst({
        where: { websiteId },
        orderBy: { createdAt: 'desc' },
      });
      
      // Create a new audit
      const newAudit = await this.prisma.audit.create({
        data: {
          websiteId,
          userId,
          type: 'MONITORING',
          status: 'QUEUED',
          categories: monitoringCategories,
          url,
        },
      });
      
      // Run the audit
      const orchestrator = new AdvancedAuditOrchestrator(this.prisma);
      const auditResult = await orchestrator.runAudit(newAudit.id, url, monitoringCategories);
      
      // Create notifications based on the audit results
      await this.notificationService.createAuditNotifications(
        newAudit.id,
        websiteId,
        userId,
        mostRecentAudit?.id || null,
        auditResult
      );
      
      // Update the next monitoring time
      await this.updateNextMonitoringTime(website);
      
      console.log(`Completed monitoring for website ${websiteId}`);
    } catch (error) {
      console.error(`Error monitoring website ${website.id}:`, error);
      
      // Update the next monitoring time even if there was an error
      await this.updateNextMonitoringTime(website);
    }
  }
  
  /**
   * Update the next monitoring time based on the schedule
   */
  private async updateNextMonitoringTime(website: Website & { monitoringSchedule: MonitoringSchedule | null }): Promise<void> {
    const now = new Date();
    const monitoringType = website.monitoringSchedule?.type || 'DAILY';
    
    // Calculate next monitoring time
    let nextMonitoringAt: Date;
    
    switch (monitoringType) {
      case 'HOURLY':
        nextMonitoringAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
        break;
      case 'DAILY':
        nextMonitoringAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        break;
      case 'WEEKLY':
        nextMonitoringAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'MONTHLY':
        // Add 30 days
        nextMonitoringAt = new Date(now);
        nextMonitoringAt.setDate(nextMonitoringAt.getDate() + 30);
        break;
      default:
        nextMonitoringAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
    
    // Update the website
    await this.prisma.website.update({
      where: { id: website.id },
      data: {
        lastMonitoredAt: now,
        nextMonitoringAt,
      },
    });
  }
  
  /**
   * Enable monitoring for a website
   */
  async enableMonitoring(
    websiteId: string,
    type: MonitoringType = 'DAILY',
    categories: string[] = ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY']
  ): Promise<void> {
    const now = new Date();
    let nextMonitoringAt: Date;
    
    // Calculate first monitoring time (start in 1 hour)
    nextMonitoringAt = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Update the website and create/update monitoring schedule
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        monitoringEnabled: true,
        nextMonitoringAt,
        monitoringSchedule: {
          upsert: {
            create: {
              type,
              categories,
            },
            update: {
              type,
              categories,
            },
          },
        },
      },
    });
  }
  
  /**
   * Disable monitoring for a website
   */
  async disableMonitoring(websiteId: string): Promise<void> {
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        monitoringEnabled: false,
        nextMonitoringAt: null,
      },
    });
  }
  
  /**
   * Update monitoring schedule for a website
   */
  async updateMonitoringSchedule(
    websiteId: string,
    type: MonitoringType,
    categories: string[]
  ): Promise<void> {
    await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        monitoringSchedule: {
          upsert: {
            create: {
              type,
              categories,
            },
            update: {
              type,
              categories,
            },
          },
        },
      },
    });
  }
  
  /**
   * Get monitoring status for a website
   */
  async getMonitoringStatus(websiteId: string): Promise<{
    enabled: boolean;
    schedule: MonitoringSchedule | null;
    lastMonitoredAt: Date | null;
    nextMonitoringAt: Date | null;
  }> {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        monitoringSchedule: true,
      },
    });
    
    if (!website) {
      throw new Error(`Website with ID ${websiteId} not found`);
    }
    
    return {
      enabled: website.monitoringEnabled,
      schedule: website.monitoringSchedule,
      lastMonitoredAt: website.lastMonitoredAt,
      nextMonitoringAt: website.nextMonitoringAt,
    };
  }
  
  /**
   * Get monitoring history for a website
   */
  async getMonitoringHistory(
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
          type: 'MONITORING',
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
          type: 'MONITORING',
        },
      }),
    ]);
    
    return { audits, total };
  }
}
