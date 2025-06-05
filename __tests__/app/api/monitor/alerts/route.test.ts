// __tests__/app/api/monitor/alerts/route.test.ts
// Unit tests for monitoring alerts API route

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/monitor/alerts/route';
import { MonitoringService } from '@/lib/services/monitoring-service';
import * as monitoringValidation from '@/lib/monitoring-validation';
import * as sanitizationUtils from '@/lib/sanitization-utils';

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
    getAlerts: jest.fn(),
    getAlertsCount: jest.fn(),
    markAlertsAsRead: jest.fn()
  }))
}));

jest.mock('@/lib/monitoring-validation', () => ({
  validateWebsiteAccess: jest.fn(),
  validatePaginationParams: jest.fn(),
  validateAlertIds: jest.fn(),
  safeDisconnect: jest.fn()
}));

jest.mock('@/lib/sanitization-utils', () => ({
  sanitizeString: jest.fn((str) => str),
  sanitizeObject: jest.fn((obj) => obj),
  sanitizeArray: jest.fn((arr) => arr)
}));

jest.mock('@/lib/validation-utils', () => ({
  isValidUUID: jest.fn(() => true)
}));

describe('Monitoring Alerts API Routes', () => {
  let mockRequest: any;
  let mockContext: any;
  let mockUser: any;
  let monitoringService: any;
  
  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/monitor/alerts?websiteId=123&limit=10&offset=0&unreadOnly=false',
      json: jest.fn()
    };
    mockContext = {};
    mockUser = { id: 'user123', email: 'user@example.com', role: 'USER' };
    monitoringService = new MonitoringService();
    jest.clearAllMocks();
  });
  
  describe('GET handler', () => {
    it('should return 400 if website ID is not provided', async () => {
      mockRequest.url = 'http://localhost:3000/api/monitor/alerts';
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    });
    
    it('should validate website access', async () => {
      const mockValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockValidation);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.validateWebsiteAccess).toHaveBeenCalledWith(
        '123',
        'user123',
        false
      );
    });
    
    it('should return 403 if website access is invalid', async () => {
      const mockValidation = {
        isValid: false,
        error: 'Access denied',
        response: NextResponse.json({ error: 'Access denied' }, { status: 403 })
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockValidation);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Access denied' },
        { status: 403 }
      );
    });
    
    it('should validate pagination parameters', async () => {
      const mockAccessValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      const mockPaginationValidation = {
        isValid: true,
        limit: 10,
        offset: 0
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockAccessValidation);
      (monitoringValidation.validatePaginationParams as jest.Mock).mockReturnValue(mockPaginationValidation);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.validatePaginationParams).toHaveBeenCalled();
    });
    
    it('should return alerts with pagination', async () => {
      const mockAccessValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      const mockPaginationValidation = {
        isValid: true,
        limit: 10,
        offset: 0
      };
      
      const mockAlerts = [
        { id: 'alert1', message: 'Test Alert 1' },
        { id: 'alert2', message: 'Test Alert 2' }
      ];
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockAccessValidation);
      (monitoringValidation.validatePaginationParams as jest.Mock).mockReturnValue(mockPaginationValidation);
      monitoringService.getAlerts.mockResolvedValue(mockAlerts);
      monitoringService.getAlertsCount.mockResolvedValue(2);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(monitoringService.getAlerts).toHaveBeenCalledWith(
        '123',
        {
          limit: 10,
          offset: 0,
          unreadOnly: false
        }
      );
      
      expect(monitoringService.getAlertsCount).toHaveBeenCalledWith('123', false);
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        alerts: mockAlerts,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      });
    });
    
    it('should handle errors gracefully', async () => {
      monitoringService.getAlerts.mockRejectedValue(new Error('Test error'));
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch monitoring alerts' },
        { status: 500 }
      );
    });
    
    it('should disconnect Prisma client in finally block', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.safeDisconnect).toHaveBeenCalled();
    });
  });
  
  describe('POST handler', () => {
    beforeEach(() => {
      mockRequest.json.mockResolvedValue({
        alertIds: ['alert1', 'alert2'],
        websiteId: '123'
      });
    });
    
    it('should validate required fields', async () => {
      mockRequest.json.mockResolvedValue({});
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Alert IDs are required' },
        { status: 400 }
      );
    });
    
    it('should validate website access', async () => {
      const mockValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockValidation);
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.validateWebsiteAccess).toHaveBeenCalledWith(
        '123',
        'user123',
        false
      );
    });
    
    it('should validate alert IDs', async () => {
      const mockAccessValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      const mockAlertIdsValidation = {
        success: true
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockAccessValidation);
      (monitoringValidation.validateAlertIds as jest.Mock).mockReturnValue(mockAlertIdsValidation);
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.validateAlertIds).toHaveBeenCalledWith(['alert1', 'alert2']);
    });
    
    it('should mark alerts as read', async () => {
      const mockAccessValidation = {
        isValid: true,
        website: { id: '123', name: 'Test Website' }
      };
      
      const mockAlertIdsValidation = {
        success: true
      };
      
      (monitoringValidation.validateWebsiteAccess as jest.Mock).mockResolvedValue(mockAccessValidation);
      (monitoringValidation.validateAlertIds as jest.Mock).mockReturnValue(mockAlertIdsValidation);
      monitoringService.markAlertsAsRead.mockResolvedValue(true);
      
      // Mock Prisma findMany
      global.prisma = {
        alert: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'alert1' },
            { id: 'alert2' }
          ])
        }
      };
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(monitoringService.markAlertsAsRead).toHaveBeenCalledWith(
        '123',
        ['alert1', 'alert2']
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });
    
    it('should handle errors gracefully', async () => {
      mockRequest.json.mockRejectedValue(new Error('Test error'));
      
      await POST(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to mark alerts as read' },
        { status: 500 }
      );
    });
    
    it('should disconnect Prisma client in finally block', async () => {
      await POST(mockRequest, mockContext, mockUser);
      
      expect(monitoringValidation.safeDisconnect).toHaveBeenCalled();
    });
  });
});
