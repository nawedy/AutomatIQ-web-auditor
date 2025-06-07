// src/__tests__/lib/services/webhook-service.test.ts
// Unit tests for the Webhook Service

import { WebhookService } from '@/lib/services/webhook-service';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());

describe('WebhookService', () => {
  const mockWebhookUrl = 'https://example.com/webhook';
  const mockPayload = {
    event: 'alert',
    data: {
      title: 'Performance Drop',
      message: 'Website performance score dropped by 15 points',
      severity: 'WARNING',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWebhookNotification', () => {
    it('should successfully send a webhook notification', async () => {
      // Mock successful fetch response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await WebhookService.sendWebhookNotification(
        mockWebhookUrl,
        mockPayload
      );

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockPayload),
        })
      );

      // Verify result
      expect(result).toEqual({
        success: true,
        status: 200,
      });
    });

    it('should handle webhook endpoint returning error status', async () => {
      // Mock error response
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid payload' }),
      });

      const result = await WebhookService.sendWebhookNotification(
        mockWebhookUrl,
        mockPayload
      );

      // Verify result contains error information
      expect(result).toEqual({
        success: false,
        status: 400,
        error: 'Bad Request',
      });
    });

    it('should handle network errors when sending webhook', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await WebhookService.sendWebhookNotification(
        mockWebhookUrl,
        mockPayload
      );

      // Verify result contains error information
      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle invalid webhook URLs', async () => {
      // Test with invalid URL
      const result = await WebhookService.sendWebhookNotification(
        'invalid-url',
        mockPayload
      );

      // Verify result contains error information
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Invalid URL'),
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle empty webhook URL', async () => {
      // Test with empty URL
      const result = await WebhookService.sendWebhookNotification(
        '',
        mockPayload
      );

      // Verify result contains error information
      expect(result).toEqual({
        success: false,
        error: 'Webhook URL is required',
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle null or undefined webhook URL', async () => {
      // Test with null URL
      const result1 = await WebhookService.sendWebhookNotification(
        null as any,
        mockPayload
      );

      // Verify result contains error information
      expect(result1).toEqual({
        success: false,
        error: 'Webhook URL is required',
      });

      // Test with undefined URL
      const result2 = await WebhookService.sendWebhookNotification(
        undefined as any,
        mockPayload
      );

      // Verify result contains error information
      expect(result2).toEqual({
        success: false,
        error: 'Webhook URL is required',
      });

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle empty payload', async () => {
      // Test with empty payload
      const result = await WebhookService.sendWebhookNotification(
        mockWebhookUrl,
        {} as any
      );

      // Mock successful fetch response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Verify fetch was called with empty object
      expect(fetch).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          body: '{}',
        })
      );
    });

    it('should handle JSON parsing errors in response', async () => {
      // Mock response with JSON parsing error
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      const result = await WebhookService.sendWebhookNotification(
        mockWebhookUrl,
        mockPayload
      );

      // Verify result
      expect(result).toEqual({
        success: true,
        status: 200,
        // No response body due to JSON parsing error
      });
    });
  });

  describe('validateWebhookUrl', () => {
    it('should validate correct webhook URLs', () => {
      // Test with valid URLs
      expect(WebhookService.validateWebhookUrl('https://example.com/webhook')).toBe(true);
      expect(WebhookService.validateWebhookUrl('https://api.service.com/v1/hooks/123')).toBe(true);
      expect(WebhookService.validateWebhookUrl('http://localhost:3000/api/webhook')).toBe(true);
    });

    it('should reject invalid webhook URLs', () => {
      // Test with invalid URLs
      expect(WebhookService.validateWebhookUrl('invalid-url')).toBe(false);
      expect(WebhookService.validateWebhookUrl('ftp://example.com')).toBe(false);
      expect(WebhookService.validateWebhookUrl('javascript:alert(1)')).toBe(false);
      expect(WebhookService.validateWebhookUrl('')).toBe(false);
      expect(WebhookService.validateWebhookUrl(null as any)).toBe(false);
      expect(WebhookService.validateWebhookUrl(undefined as any)).toBe(false);
    });
  });

  describe('formatWebhookPayload', () => {
    it('should format notification data into webhook payload', () => {
      const notification = {
        id: 'notif-123',
        title: 'Performance Alert',
        message: 'Performance score dropped',
        type: 'warning',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        metadata: {
          websiteId: 'website-123',
          auditId: 'audit-456',
        },
      };

      const website = {
        id: 'website-123',
        name: 'Example Website',
        url: 'https://example.com',
      };

      const result = WebhookService.formatWebhookPayload(notification, website);

      expect(result).toEqual({
        event: 'notification',
        timestamp: expect.any(String),
        notification: {
          id: 'notif-123',
          title: 'Performance Alert',
          message: 'Performance score dropped',
          type: 'warning',
          createdAt: '2023-06-01T12:00:00.000Z',
        },
        website: {
          id: 'website-123',
          name: 'Example Website',
          url: 'https://example.com',
        },
        metadata: {
          websiteId: 'website-123',
          auditId: 'audit-456',
        },
      });
    });

    it('should handle missing website data', () => {
      const notification = {
        id: 'notif-123',
        title: 'System Alert',
        message: 'System maintenance',
        type: 'info',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        metadata: {},
      };

      const result = WebhookService.formatWebhookPayload(notification);

      expect(result).toEqual({
        event: 'notification',
        timestamp: expect.any(String),
        notification: {
          id: 'notif-123',
          title: 'System Alert',
          message: 'System maintenance',
          type: 'info',
          createdAt: '2023-06-01T12:00:00.000Z',
        },
        metadata: {},
      });
    });
  });
});
