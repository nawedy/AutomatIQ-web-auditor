// __tests__/api/monitor/config.test.ts
// Unit tests for monitoring configuration API routes

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/monitor/config/route';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '@/lib/services/monitoring-service';

// Mock dependencies
jest.mock('@/lib/auth-utils', () => ({
  withAuth: (handler: any) => async (req: any, context: any) => {
    // Mock authenticated user
    return handler(req, context, { id: 'test-user-id', email: 'test@example.com', role: 'USER' });
  }
}));

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: any) => handler
}));

jest.mock('@/lib/validation-utils', () => {
  return require('../../mocks/validation-utils');
});

jest.mock('@/lib/monitoring-validation', () => {
  return require('../../mocks/monitoring-validation');
});

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    website: {
      findFirst: jest.fn(),
    },
    monitoringConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

jest.mock('@/lib/services/monitoring-service', () => {
  return {
    MonitoringService: jest.fn().mockImplementation(() => ({
      updateMonitoringConfig: jest.fn(),
      toggleMonitoring: jest.fn(),
    }))
  };
});

describe('Monitoring Config API', () => {
  let mockPrisma: any;
  let mockMonitoringService: any;
  let mockRequest: NextRequest;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get mock instances
    mockPrisma = new PrismaClient();
    mockMonitoringService = new MonitoringService();
    
    // Create mock request
    mockRequest = {
      url: 'https://example.com/api/monitor/config?websiteId=test-website-id',
      json: jest.fn(),
    } as unknown as NextRequest;
  });
  
  describe('GET handler', () => {
    test('should return 400 if websiteId is missing', async () => {
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/config'
      } as unknown as NextRequest;
      
      const response = await GET(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Website ID is required');
    });
    
    test('should return 400 if websiteId is invalid UUID', async () => {
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/config?websiteId=invalid-uuid'
      } as unknown as NextRequest;
      
      const response = await GET(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid website ID format');
    });
    
    test('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.mockResolvedValue(null);
      
      const response = await GET(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toContain('Website not found');
    });
    
    test('should return default config if no config exists', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(null);
      
      const response = await GET(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({
        websiteId: 'test-website-id',
        enabled: false,
        frequency: 'WEEKLY',
        alertThreshold: 10,
        metrics: ['overallScore', 'seoScore', 'performanceScore'],
        emailNotifications: true,
        slackWebhook: null
      });
    });
    
    test('should return existing config if found', async () => {
      const mockConfig = {
        websiteId: 'test-website-id',
        enabled: true,
        frequency: 'DAILY',
        alertThreshold: 5,
        metrics: ['seoScore'],
        emailNotifications: false,
        slackWebhook: 'https://hooks.slack.com/test'
      };
      
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      
      const response = await GET(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockConfig);
    });
  });
  
  describe('POST handler', () => {
    const validConfig = {
      websiteId: '123e4567-e89b-12d3-a456-426614174000',
      enabled: true,
      frequency: 'WEEKLY',
      alertThreshold: 15,
      metrics: ['overallScore', 'seoScore'],
      emailNotifications: true,
      slackWebhook: null
    };
    
    beforeEach(() => {
      mockRequest.json = jest.fn().mockResolvedValue(validConfig);
    });
    
    test('should return 400 if input validation fails', async () => {
      const invalidConfig = {
        ...validConfig,
        websiteId: 'invalid-uuid'
      };
      
      mockRequest.json = jest.fn().mockResolvedValue(invalidConfig);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });
    
    test('should return 400 if slack webhook is not HTTPS', async () => {
      const insecureConfig = {
        ...validConfig,
        slackWebhook: 'http://insecure-webhook.com/test'
      };
      
      mockRequest.json = jest.fn().mockResolvedValue(insecureConfig);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('HTTPS protocol');
    });
    
    test('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.mockResolvedValue(null);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toContain('Website not found');
    });
    
    test('should return 500 if update fails', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: validConfig.websiteId });
      mockMonitoringService.updateMonitoringConfig.mockResolvedValue(false);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to update');
    });
    
    test('should return success if update succeeds', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: validConfig.websiteId });
      mockMonitoringService.updateMonitoringConfig.mockResolvedValue(true);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockMonitoringService.updateMonitoringConfig).toHaveBeenCalledWith(
        validConfig.websiteId,
        expect.objectContaining({
          enabled: validConfig.enabled,
          frequency: validConfig.frequency,
          alertThreshold: validConfig.alertThreshold,
          metrics: validConfig.metrics,
          emailNotifications: validConfig.emailNotifications,
          slackWebhook: validConfig.slackWebhook
        })
      );
    });
  });
  
  describe('DELETE handler', () => {
    test('should return 400 if websiteId is missing', async () => {
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/config'
      } as unknown as NextRequest;
      
      const response = await DELETE(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Website ID is required');
    });
    
    test('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.mockResolvedValue(null);
      
      const response = await DELETE(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toContain('Website not found');
    });
    
    test('should return 500 if disabling fails', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockMonitoringService.toggleMonitoring.mockResolvedValue(false);
      
      const response = await DELETE(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to disable');
    });
    
    test('should return success if disabling succeeds', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockMonitoringService.toggleMonitoring.mockResolvedValue(true);
      
      const response = await DELETE(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockMonitoringService.toggleMonitoring).toHaveBeenCalledWith(
        'test-website-id',
        false
      );
    });
  });
});
