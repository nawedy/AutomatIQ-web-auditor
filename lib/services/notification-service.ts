// src/lib/services/notification-service.ts
// Service for sending notifications about audit results and issues

import { PrismaClient } from '@prisma/client';
import { ComprehensiveAuditResult } from '@/lib/types/advanced-audit';
import type { Notification, CreateNotificationInput } from '@/lib/types/notification';
import { NotificationType, NotificationChannel, NotificationPriority } from '@/lib/types/notification';
import emailService from '@/lib/email';
import { WebhookService } from './webhook-service';

export class NotificationService {
  private prisma: PrismaClient;
  private webhookService: WebhookService;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.webhookService = new WebhookService(prisma);
  }

  /**
   * Send a real-time alert via email
   */
  async sendRealTimeAlert({
    email,
    userName,
    websiteName,
    websiteUrl,
    subject,
    message,
    priority,
    auditId
  }: {
    email: string;
    userName: string;
    websiteName: string;
    websiteUrl: string;
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    auditId: string;
  }): Promise<void> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const auditUrl = `${appUrl}/audit/${auditId}`;
      
      // Create HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${this.getPriorityColor(priority)}; color: white; padding: 15px; text-align: center;">
            <h2 style="margin: 0;">${subject}</h2>
            <p style="margin: 5px 0 0 0;">Priority: ${priority.toUpperCase()}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${userName},</p>
            <p>${message}</p>
            <p>Website: <a href="${websiteUrl}" target="_blank">${websiteName}</a></p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${auditUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Audit Details</a>
            </div>
            <p>This is an automated notification from AutomatIQ Website Auditor.</p>
          </div>
        </div>
      `;
      
      // Send the email
      await emailService.sendEmail({
        to: email,
        subject: subject,
        html: htmlContent
      });
      
      console.log(`Real-time alert sent to ${email} for audit ${auditId}`);
    } catch (error) {
      console.error('Error sending real-time alert:', error);
    }
  }
  
  /**
   * Get color for priority level
   */
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return '#d32f2f'; // Red
      case 'urgent':
        return '#f57c00'; // Orange
      case 'high':
        return '#f9a825'; // Amber
      case 'medium':
        return '#1976d2'; // Blue
      case 'low':
      default:
        return '#388e3c'; // Green
    }
  }
  
  /**
   * Create notifications based on audit results
   */
  /**
   * Create notifications based on audit results
   */
  async createAuditNotifications(
    auditId: string,
    websiteId: string,
    userId: string,
    previousAuditId: string | null,
    auditResult: ComprehensiveAuditResult,
    sendRealTimeAlerts: boolean = true
  ): Promise<void> {
    try {
      // Get user notification preferences
      const userPreferences = await this.prisma.userNotificationPreference.findFirst({
        where: { userId },
      });
      
      // If no preferences found, use default settings
      const minScoreThreshold = userPreferences?.minScoreThreshold ?? 70;
      const minScoreDrop = userPreferences?.minScoreDrop ?? 5;
      
      // Get previous audit result if available
      let previousResult: { 
        overallScore: number; 
        categoryScores: Record<string, number>;
      } | null = null;
      
      if (previousAuditId) {
        const previousAudit = await this.prisma.audit.findUnique({
          where: { id: previousAuditId },
          select: {
            overallScore: true,
            seoScore: true,
            performanceScore: true,
            accessibilityScore: true,
            securityScore: true,
            mobileScore: true,
            contentScore: true,
          },
        });
        
        if (previousAudit) {
          previousResult = {
            overallScore: previousAudit.overallScore || 0,
            categoryScores: {
              seo: previousAudit.seoScore || 0,
              performance: previousAudit.performanceScore || 0,
              accessibility: previousAudit.accessibilityScore || 0,
              security: previousAudit.securityScore || 0,
              mobile: previousAudit.mobileScore || 0,
              content: previousAudit.contentScore || 0,
            },
          };
        }
      }
      
      // Get website details for notification context
      const website = await this.prisma.website.findUnique({
        where: { id: websiteId },
        select: { name: true, url: true },
      });
      
      // Get user details for notification delivery
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      
      // Create notifications based on current results and comparison with previous results
      const notifications: Array<Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'readAt'>> = [];
      
      // Check overall score
      if (auditResult.score < minScoreThreshold) {
        const notification = {
          userId,
          websiteId,
          auditId,
          type: NotificationType.SCORE_ALERT,
          title: `Low overall score: ${auditResult.score}`,
          message: `Your website's overall audit score is below the threshold of ${minScoreThreshold}`,
          priority: NotificationPriority.HIGH,
          channel: NotificationChannel.IN_APP,
          read: false,
        };
        
        notifications.push(notification);
        
        // Send real-time alert if enabled
        if (sendRealTimeAlerts && user?.email && website) {
          await this.sendRealTimeAlert({
            email: user.email,
            userName: user.name || 'User',
            websiteName: website.name,
            websiteUrl: website.url,
            subject: `[ALERT] Low score detected for ${website.name}`,
            message: `Your website ${website.name} (${website.url}) has a low overall audit score of ${auditResult.score}, which is below your threshold of ${minScoreThreshold}.`,
            priority: 'high',
            auditId,
          });
        }
      }
      
      // Check score drops compared to previous audit
      if (previousResult) {
        const scoreDrop = previousResult.overallScore - auditResult.score;
        
        if (scoreDrop >= minScoreDrop) {
          const notification = {
            userId,
            websiteId,
            auditId,
            type: NotificationType.SCORE_DROP,
            title: `Score dropped by ${scoreDrop.toFixed(1)} points`,
            message: `Your website's overall score dropped from ${previousResult.overallScore} to ${auditResult.score}`,
            priority: NotificationPriority.HIGH,
            channel: NotificationChannel.IN_APP,
            read: false,
          };
          
          notifications.push(notification);
          
          // Send real-time alert for significant score drops
          if (sendRealTimeAlerts && user?.email && website && scoreDrop >= 10) {
            await this.sendRealTimeAlert({
              email: user.email,
              userName: user.name || 'User',
              websiteName: website.name,
              websiteUrl: website.url,
              subject: `[URGENT] Significant score drop for ${website.name}`,
              message: `Your website ${website.name} (${website.url}) has experienced a significant drop in overall score from ${previousResult.overallScore} to ${auditResult.score} (${scoreDrop.toFixed(1)} points).`,
              priority: 'urgent',
              auditId,
            });
          }
        }
        
        // Check each category for score drops
        for (const category of Object.keys(auditResult)) {
          // Skip non-category properties
          if (!auditResult[category as keyof ComprehensiveAuditResult] || 
              typeof auditResult[category as keyof ComprehensiveAuditResult] !== 'object') {
            continue;
          }
          
          const currentScore = auditResult[category as keyof ComprehensiveAuditResult].score || 0;
          const previousScore = previousResult.categoryScores[category as keyof ComprehensiveAuditResult] || 0;
          const categoryDrop = previousScore - currentScore;
          
          if (categoryDrop >= minScoreDrop) {
            notifications.push({
              userId,
              websiteId,
              auditId,
              type: NotificationType.CATEGORY_DROP,
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} score dropped by ${categoryDrop.toFixed(1)} points`,
              message: `Your website's ${category.charAt(0).toUpperCase() + category.slice(1)} score dropped from ${previousScore} to ${currentScore}`,
              priority: NotificationPriority.MEDIUM,
              channel: NotificationChannel.IN_APP,
              read: false,
            });
          }
        }
      }
      
      // Check for critical issues
      const criticalIssues = this.extractCriticalIssues(auditResult);
      
      if (criticalIssues.length > 0) {
        const notification = {
          userId,
          websiteId,
          auditId,
          type: NotificationType.CRITICAL_ISSUE,
          title: `${criticalIssues.length} critical issues detected`,
          message: `Critical issues found: ${criticalIssues.slice(0, 3).join(', ')}${criticalIssues.length > 3 ? '...' : ''}`,
          priority: NotificationPriority.URGENT,
          channel: NotificationChannel.IN_APP,
          read: false,
        };
        
        notifications.push(notification);
        
        // Always send real-time alerts for critical issues
        if (sendRealTimeAlerts && user?.email && website) {
          await this.sendRealTimeAlert({
            email: user.email,
            userName: user.name || 'User',
            websiteName: website.name,
            websiteUrl: website.url,
            subject: `[CRITICAL] Security issues detected on ${website.name}`,
            message: `Your website ${website.name} (${website.url}) has ${criticalIssues.length} critical issues that require immediate attention:\n\n- ${criticalIssues.join('\n- ')}`,
            priority: 'critical',
            auditId,
          });
          
          // Also trigger webhooks for critical issues
          await this.webhookService.triggerWebhook(userId, websiteId, {
            event: 'critical_issue_detected',
            website: website,
            auditId: auditId,
            issues: criticalIssues,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      // Insert all notifications into the database
      if (notifications.length > 0) {
        await this.prisma.notification.createMany({
          data: notifications,
        });
        
        // Update user's unread notification count
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            unreadNotificationCount: {
              increment: notifications.length
            }
          }
        });
      }  
      console.log(`Created ${notifications.length} notifications for audit ${auditId}`);
    } catch (error) {
      console.error('Error creating audit notifications:', error);
    }
  }
  
  /**
   * Extract critical issues from audit result
   */
  private extractCriticalIssues(auditResult: ComprehensiveAuditResult): string[] {
    const criticalIssues: string[] = [];
    
    // SSL/TLS issues
    if (auditResult.security?.ssl?.issues && auditResult.security.ssl.issues.length > 0) {
      criticalIssues.push('SSL/TLS configuration issues');
    }
    
    // Vulnerabilities
    if (auditResult.security?.vulnerabilities && auditResult.security.vulnerabilities.length > 0) {
      criticalIssues.push(...auditResult.security.vulnerabilities.map(issue => (
        `Vulnerability: ${issue.description || issue.name || 'Security vulnerability detected'}`
      )));
    }
    
    // Performance issues with Core Web Vitals
    if (auditResult.performance?.coreWebVitals) {
      const { lcp, fid, cls } = auditResult.performance.coreWebVitals;
      
      if (lcp && lcp.score < 50) {
        criticalIssues.push('Poor Largest Contentful Paint (LCP) performance');
      }
      
      if (fid && fid.score < 50) {
        criticalIssues.push('Poor First Input Delay (FID) performance');
      }
      
      if (cls && cls.score < 50) {
        criticalIssues.push('Poor Cumulative Layout Shift (CLS) performance');
      }
    }
    
    // Accessibility issues
    if (auditResult.accessibility?.violations) {
      const criticalViolations = auditResult.accessibility.violations.filter(v => v.impact === 'critical');
      if (criticalViolations.length > 0) {
        criticalIssues.push(`${criticalViolations.length} critical accessibility violations`);
      }
    }
    
    // Mobile viewport issues
    if (auditResult.mobile?.viewport?.issues && auditResult.mobile.viewport.issues.length > 0) {
      criticalIssues.push('Missing or improper viewport configuration');
    }
    
    return criticalIssues;
  }
  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Update the notification
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId, // Ensure user owns this notification
          readAt: null
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
      
      // Update user's unread count
      await this.updateUnreadCount(userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
  
  /**
   * Mark multiple notifications as read
   */
  async markNotificationsAsRead(notificationIds: string[], userId: string): Promise<void> {
    try {
      // Update the notifications
      await this.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId, // Ensure user owns these notifications
          readAt: null
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
      
      // Update user's unread count
      await this.updateUnreadCount(userId);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      // Update all unread notifications for this user
      await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          readAt: null
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
      
      // Set unread count to 0
      await this.prisma.user.update({
        where: { id: userId },
        data: { unreadNotificationCount: 0 }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
  
  /**
   * Get notifications for a user with filtering and pagination
   */
  async getNotifications({
    userId,
    websiteId,
    read,
    type,
    priority,
    page = 1,
    limit = 20
  }: {
    userId: string;
    websiteId?: string;
    read?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    try {
      // Build the where clause
      const where: any = { userId };
      
      if (websiteId) where.websiteId = websiteId;
      if (read !== undefined) where.read = read;
      if (type) where.type = type;
      if (priority) where.priority = priority;
      
      // Get total count
      const total = await this.prisma.notification.count({ where });
      
      // Get unread count
      const unread = await this.prisma.notification.count({
        where: { ...where, read: false }
      });
      
      // Get paginated notifications
      const skip = (page - 1) * limit;
      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          website: {
            select: { name: true, url: true }
          },
          audit: {
            select: { id: true, createdAt: true, completedAt: true }
          }
        }
      });
      
      return { notifications, total, unread };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { notifications: [], total: 0, unread: 0 };
    }
  }
  
  /**
   * Update user's unread notification count
   */
  private async updateUnreadCount(userId: string): Promise<void> {
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { unreadNotificationCount: unreadCount }
    });
  }
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: userId // Ensure user owns this notification
        }
      });
      
      // Update user's unread count
      await this.updateUnreadCount(userId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }
  
  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      await this.prisma.notification.deleteMany({
        where: { userId }
      });
      
      // Set unread count to 0
      await this.prisma.user.update({
        where: { id: userId },
        data: { unreadNotificationCount: 0 }
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }

  /**
   * Detect performance degradation by comparing recent audits
   */
  async detectPerformanceDegradation(websiteId: string, userId: string): Promise<void> {
    try {
      // Get the last 5 audits for this website
      const audits = await this.prisma.audit.findMany({
        where: {
          websiteId,
          userId,
          status: 'COMPLETED'
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          completedAt: true,
          performanceScore: true,
          website: {
            select: {
              name: true,
              url: true
            }
          }
        }
      });
      
      if (audits.length < 3) {
        // Not enough data for trend analysis
        return;
      }
      
      // Calculate the average performance score of the previous audits (excluding the most recent)
      const previousAudits = audits.slice(1);
      const avgPreviousScore = previousAudits.reduce(
        (sum: number, audit: any) => sum + (audit.performanceScore || 0), 
        0
      ) / previousAudits.length;
      
      const latestAudit = audits[0];
      const latestScore = latestAudit.performanceScore || 0;
      
      // Detect significant performance degradation (10% or more)
      const degradationThreshold = 0.1; // 10%
      const degradationPercentage = (avgPreviousScore - latestScore) / avgPreviousScore;
      
      if (degradationPercentage >= degradationThreshold) {
        // Create a notification for performance degradation
        await this.prisma.notification.create({
          data: {
            userId,
            websiteId,
            auditId: latestAudit.id,
            type: NotificationType.PERFORMANCE_DEGRADATION,
            title: `Performance degradation detected`,
            message: `Your website's performance score has dropped by ${(degradationPercentage * 100).toFixed(1)}% compared to the average of previous audits.`,
            priority: NotificationPriority.HIGH,
            channel: NotificationChannel.IN_APP,
            read: false,
          }
        });
        
        // Get user email for alert
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });
        
        if (user?.email && latestAudit.website) {
          // Send real-time alert for performance degradation
          await this.sendRealTimeAlert({
            email: user.email,
            userName: user.name || 'User',
            websiteName: latestAudit.website.name,
            websiteUrl: latestAudit.website.url,
            subject: `[ALERT] Performance degradation detected for ${latestAudit.website.name}`,
            message: `Your website's performance score has dropped by ${(degradationPercentage * 100).toFixed(1)}% compared to the average of previous audits (from ${avgPreviousScore.toFixed(1)} to ${latestScore}).`,
            priority: 'high',
            auditId: latestAudit.id,
          });
        }
      }
    } catch (error: any) {
      console.error('Error detecting performance degradation:', error);
    }
  }
}
