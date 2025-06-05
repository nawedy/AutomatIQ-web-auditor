// src/lib/services/webhook-service.ts
// Service for sending webhook notifications to external services

import { PrismaClient } from '@prisma/client';
import { ComprehensiveAuditResult } from '@/lib/types/advanced-audit';

interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

export class WebhookService {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  /**
   * Send a webhook notification to all configured endpoints for a user
   */
  async sendWebhook(
    userId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      // Get all webhook configurations for this user
      const webhookConfigs = await this.prisma.webhookConfiguration.findMany({
        where: { 
          userId,
          active: true,
          events: {
            has: event
          }
        }
      });
      
      if (!webhookConfigs || webhookConfigs.length === 0) {
        return; // No webhooks configured for this event
      }
      
      const payload: WebhookPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };
      
      // Send to all configured endpoints
      const sendPromises = webhookConfigs.map(config => {
        // Add signature if secret is configured
        const finalPayload = { ...payload };
        if (config.secret) {
          finalPayload.signature = this.generateSignature(JSON.stringify(payload), config.secret);
        }
        
        return this.sendToEndpoint(config.url, finalPayload, config.id);
      });
      
      await Promise.allSettled(sendPromises);
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }
  
  /**
   * Send webhook notification for critical audit issues
   */
  async sendCriticalIssuesWebhook(
    userId: string,
    websiteId: string,
    websiteName: string,
    websiteUrl: string,
    auditId: string,
    issues: string[]
  ): Promise<void> {
    if (!issues || issues.length === 0) {
      return; // No issues to report
    }
    
    await this.sendWebhook(userId, 'audit.critical_issues', {
      auditId,
      websiteId,
      websiteName,
      websiteUrl,
      issueCount: issues.length,
      issues,
      detailsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/audits/${auditId}`
    });
  }
  
  /**
   * Send webhook notification for performance degradation
   */
  async sendPerformanceDegradationWebhook(
    userId: string,
    websiteId: string,
    websiteName: string,
    websiteUrl: string,
    auditId: string,
    currentScore: number,
    previousScore: number,
    degradationPercentage: number
  ): Promise<void> {
    await this.sendWebhook(userId, 'audit.performance_degradation', {
      auditId,
      websiteId,
      websiteName,
      websiteUrl,
      currentScore,
      previousScore,
      degradationPercentage,
      detailsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/audits/${auditId}`
    });
  }
  
  /**
   * Send webhook notification for low audit score
   */
  async sendLowScoreWebhook(
    userId: string,
    websiteId: string,
    websiteName: string,
    websiteUrl: string,
    auditId: string,
    score: number,
    threshold: number
  ): Promise<void> {
    await this.sendWebhook(userId, 'audit.low_score', {
      auditId,
      websiteId,
      websiteName,
      websiteUrl,
      score,
      threshold,
      detailsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/audits/${auditId}`
    });
  }
  
  /**
   * Send a webhook payload to a specific endpoint
   */
  private async sendToEndpoint(
    url: string,
    payload: WebhookPayload,
    configId: string
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AutomatIQ-Webhook/1.0',
        },
        body: JSON.stringify(payload),
      });
      
      // Log the webhook delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookConfigurationId: configId,
          event: payload.event,
          payload: JSON.stringify(payload),
          statusCode: response.status,
          success: response.ok,
          response: response.ok ? await response.text() : 'Failed to deliver',
        }
      });
      
      if (!response.ok) {
        console.error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error delivering webhook:', error);
      
      // Log the failed delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookConfigurationId: configId,
          event: payload.event,
          payload: JSON.stringify(payload),
          statusCode: 0,
          success: false,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      });
    }
  }
  
  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}
