// __tests__/app/api/monitor/config/route.test.ts
// Unit tests for monitoring configuration API route

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/monitor/config/route';
import { MonitoringService } from '@/lib/services/monitoring-service';
import * as monitoringValidation from '@/lib/monitoring-validation';
import * as sanitizationUtils from '@/lib/sanitization-utils';
import * as validationUtils from '@/lib/validation-utils';

// Mock dependencies
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      options,
      headers: new Map()
    }))
  }
}));

jest.mock('@/lib/auth-utils', () => ({
  withAuth: jest.fn((handler) => handler),
  withRateLimit: jest.fn((handler) => handler)
}));

jest.mock('@/lib/services/monitoring-service', () => ({
  MonitoringService: jest.fn().mockImplementation(() => ({
    getMonitoringConfig: jest.fn(),
    updateMonitoringConfig: jest.fn()
  }))
}));

jest.mock('@/lib/monitoring-validation', () => ({
  validateWebsiteAccess: jest.fn(),
  safeDisconnect: jest.fn()
}));

jest.mock('@/lib/sanitization-utils', () => ({
  sanitizeString: jest.fn((str) => str),
  sanitizeObject: jest.fn((obj) => obj),
  sanitizeArray: jest.fn((arr) => arr),
  sanitizeUrl: jest.fn((url) => url)
}));

jest.mock('@/lib/validation-utils', () => ({
  isValidUUID: jest.fn(() => true),
  isValidWebhookURL: jest.fn(() => true)
}));

describe('Monitoring Configuration API Routes', () => {
  let mockRequest: any;
  let mockContext: any;
  let mockUser: any;
  let monitoringService: any;
  
  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/monitor/config?websiteId=123',
      json: jest.fn()
    };
    mockContext = {};
    mockUser = { id: 'user123', email: 'user@example.com', role: 'USER' };
    monitoringService = new MonitoringService();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock global prisma client
    global.prisma = {
      website: {
        findFirst: jest.fn().mockResolvedValue({
          id: '123',
          name: 'Test Website',
          url: 'https://example.com',
          userId: 'user123'
        })
      },
      $disconnect: jest.fn()
    };
  });
  
  describe('GET handler', () => {
    it('should return 400 if website ID is not provided', async () => {
      mockRequest.url = 'http://localhost:3000/api/monitor/config';
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    });
    
    it('should return 404 if website is not found', async () => {
      global.prisma.website.findFirst = jest.fn().mockResolvedValue(null);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    });
    
    it('should return default config if no config exists', async () => {
      monitoringService.getMonitoringConfig.mockResolvedValue(null);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        websiteId: '123',
        enabled: false,
        frequency: 'WEEKLY',
        alertThreshold: 10,
        metrics: ['overallScore', 'seoScore', 'performanceScore'],
        emailNotifications: true,
        slackWebhook: null
      });
    });
    
    it('should return existing config if found', async () => {
      const mockConfig = {
        websiteId: '123',
        enabled: true,
        frequency: 'DAILY',
        alertThreshold: 5,
        metrics: ['overallScore', 'seoScore'],
        emailNotifications: false,
        slackWebhook: 'https://hooks.slack.com/services/123'
      };
      
      monitoringService.getMonitoringConfig.mockResolvedValue(mockConfig);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(mockConfig);
    });
    
    it('should handle errors when fetching config', async () => {
      monitoringService.getMonitoringConfig.mockRejectedValue(new Error('Database error'));
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to fetch monitoring configuration') },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client in finally block', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
  
  describe('POST handler', () => {
    beforeEach(() => {
      mockRequest.json.mockResolvedValue({
        websiteId: '123',
        enabled: true,
        frequency: 'DAILY',
        alertThreshold: 5,
        metrics: ['overallScore', 'seoScore'],
        emailNotifications: true,
        slackWebhook: 'https://hooks.slack.com/services/123'
      });
    });
    
    it('should return 400 if website ID is not provided', async () => {
      mockRequest.json.mockResolvedValue({});
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    });
    
    it('should return 400 if website ID is invalid', async () => {
      (validationUtils.isValidUUID as jest.Mock).mockReturnValueOnce(false);
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid website ID format' },
        { status: 400 }
      );
    });
    
    it('should return 400 if webhook URL is invalid', async () => {
      (validationUtils.isValidWebhookURL as jest.Mock).mockReturnValueOnce(false);
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Slack webhook URL must use HTTPS protocol' },
        { status: 400 }
      );
    });
    
    it('should return 404 if website is not found', async () => {
      global.prisma.website.findFirst = jest.fn().mockResolvedValue(null);
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    });
    
    it('should update monitoring config with sanitized data', async () => {
      await POST(mockRequest, mockContext, mockUser);
      
      expect(sanitizationUtils.sanitizeObject).toHaveBeenCalled();
      expect(sanitizationUtils.sanitizeUrl).toHaveBeenCalled();
      expect(monitoringService.updateMonitoringConfig).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          enabled: true,
          frequency: 'DAILY',
          alertThreshold: 5,
          metrics: ['overallScore', 'seoScore'],
          emailNotifications: true
        })
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Monitoring configuration updated successfully'
      });
    });
    
    it('should handle errors when updating config', async () => {
      monitoringService.updateMonitoringConfig.mockRejectedValue(new Error('Update error'));
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to update monitoring configuration') },
        { status: 500 }
      );
    });
    
    it('should handle general errors', async () => {
      mockRequest.json.mockRejectedValue(new Error('JSON parse error'));
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to update monitoring configuration') },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client in finally block', async () => {
      await POST(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
  
  describe('DELETE handler', () => {
    it('should return 400 if website ID is not provided', async () => {
      mockRequest.url = 'http://localhost:3000/api/monitor/config';
      
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    });
    
    it('should return 404 if website is not found', async () => {
      global.prisma.website.findFirst = jest.fn().mockResolvedValue(null);
      
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website not found or you do not have permission to access it' },
        { status: 404 }
      );
    });
    
    it('should disable monitoring by updating config', async () => {
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(monitoringService.updateMonitoringConfig).toHaveBeenCalledWith(
        '123',
        { enabled: false }
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Monitoring disabled successfully'
      });
    });
    
    it('should handle errors when disabling monitoring', async () => {
      monitoringService.updateMonitoringConfig.mockRejectedValue(new Error('Disable error'));
      
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to disable monitoring') },
        { status: 500 }
      );
    });
    
    it('should handle general errors', async () => {
      global.prisma.website.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to disable monitoring') },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client in finally block', async () => {
      await DELETE(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
});
