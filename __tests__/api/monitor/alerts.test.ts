// __tests__/api/monitor/alerts.test.ts
// Unit tests for monitoring alerts API routes

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/monitor/alerts/route';
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
    alert: {
      count: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
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
      getAlerts: jest.fn(),
      markAlertsAsRead: jest.fn(),
    }))
  };
});

describe('Monitoring Alerts API', () => {
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
      url: 'https://example.com/api/monitor/alerts?websiteId=test-website-id',
      json: jest.fn(),
    } as unknown as NextRequest;
  });
  
  describe('GET handler', () => {
    test('should return 400 if websiteId is missing', async () => {
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/alerts'
      } as unknown as NextRequest;
      
      const response = await GET(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Website ID is required');
    });
    
    test('should return 400 if websiteId is invalid UUID', async () => {
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/alerts?websiteId=invalid-uuid'
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
    
    test('should return 400 if pagination parameters are invalid', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/alerts?websiteId=test-website-id&limit=-5'
      } as unknown as NextRequest;
      
      const response = await GET(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Limit must be a positive number');
    });
    
    test('should return alerts with pagination', async () => {
      const mockAlerts = [
        { id: 'alert-1', message: 'Test alert 1', severity: 'WARNING', read: false },
        { id: 'alert-2', message: 'Test alert 2', severity: 'ERROR', read: true }
      ];
      
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockMonitoringService.getAlerts.mockResolvedValue(mockAlerts);
      mockPrisma.alert.count.mockResolvedValue(10);
      
      const response = await GET(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.alerts).toEqual(mockAlerts);
      expect(data.pagination).toEqual({
        total: 10,
        limit: 10,
        offset: 0,
        hasMore: true
      });
      expect(mockMonitoringService.getAlerts).toHaveBeenCalledWith(
        'test-website-id',
        expect.objectContaining({
          unreadOnly: false,
          limit: 10,
          offset: 0
        })
      );
    });
    
    test('should filter unread alerts when unreadOnly=true', async () => {
      const mockAlerts = [
        { id: 'alert-1', message: 'Test alert 1', severity: 'WARNING', read: false }
      ];
      
      const req = {
        ...mockRequest,
        url: 'https://example.com/api/monitor/alerts?websiteId=test-website-id&unreadOnly=true'
      } as unknown as NextRequest;
      
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockMonitoringService.getAlerts.mockResolvedValue(mockAlerts);
      mockPrisma.alert.count.mockResolvedValue(1);
      
      const response = await GET(req, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.alerts).toEqual(mockAlerts);
      expect(mockMonitoringService.getAlerts).toHaveBeenCalledWith(
        'test-website-id',
        expect.objectContaining({
          unreadOnly: true
        })
      );
    });
  });
  
  describe('POST handler', () => {
    const validBody = {
      alertIds: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
      websiteId: 'test-website-id'
    };
    
    beforeEach(() => {
      mockRequest.json = jest.fn().mockResolvedValue(validBody);
    });
    
    test('should return 400 if alertIds is missing or empty', async () => {
      mockRequest.json = jest.fn().mockResolvedValue({ websiteId: 'test-website-id' });
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Alert IDs are required');
    });
    
    test('should return 400 if websiteId is missing', async () => {
      mockRequest.json = jest.fn().mockResolvedValue({ alertIds: ['alert-1'] });
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Website ID is required');
    });
    
    test('should return 400 if alert IDs are invalid', async () => {
      mockRequest.json = jest.fn().mockResolvedValue({
        alertIds: ['invalid-uuid'],
        websiteId: 'test-website-id'
      });
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid alert ID format');
    });
    
    test('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.mockResolvedValue(null);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toContain('Website not found');
    });
    
    test('should return 400 if alerts do not belong to website', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockPrisma.alert.count.mockResolvedValue(1); // Only 1 of 2 alerts belongs to website
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Some alerts do not exist or do not belong to the specified website');
    });
    
    test('should return 500 if marking alerts as read fails', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockPrisma.alert.count.mockResolvedValue(2); // Both alerts belong to website
      mockMonitoringService.markAlertsAsRead.mockResolvedValue(false);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to mark alerts as read');
    });
    
    test('should return success if marking alerts as read succeeds', async () => {
      mockPrisma.website.findFirst.mockResolvedValue({ id: 'test-website-id' });
      mockPrisma.alert.count.mockResolvedValue(2); // Both alerts belong to website
      mockMonitoringService.markAlertsAsRead.mockResolvedValue(true);
      
      const response = await POST(mockRequest, {});
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Alerts marked as read successfully');
      expect(mockMonitoringService.markAlertsAsRead).toHaveBeenCalledWith(validBody.alertIds);
    });
  });
});
