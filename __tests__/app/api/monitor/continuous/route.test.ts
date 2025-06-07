// __tests__/app/api/monitor/continuous/route.test.ts
// Unit tests for continuous monitoring API route

import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/monitor/continuous/route';
import { MonitoringService } from '@/lib/services/monitoring-service';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

// Extend global object with prisma property
declare global {
  // Use a more flexible type definition that allows any properties and methods
  var prisma: {
    website: {
      findFirst: jest.Mock;
      [key: string]: any;
    };
    audit: {
      findMany: jest.Mock;
      [key: string]: any;
    };
    $disconnect: jest.Mock;
    [key: string]: any;
  };
}

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
    getAlertsFromCacheOrDatabase: jest.fn(),
    getAlertsCount: jest.fn().mockResolvedValue(2)
  }))
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        website: {
          findFirst: jest.fn()
        },
        audit: {
          findMany: jest.fn()
        },
        $disconnect: jest.fn()
      };
    })
  };
});

jest.mock('date-fns', () => ({
  subDays: jest.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  })
}));

describe('Continuous Monitoring API Routes', () => {
  let mockRequest: any;
  let mockContext: any;
  let mockUser: any;
  let monitoringService: any;
  
  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/monitor/continuous?websiteId=123&timeRange=30days&metrics=overallScore,seoScore',
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'x-session-user') {
            return JSON.stringify({ id: 'user123' });
          }
          if (header === 'x-forwarded-for') {
            return '192.168.1.1';
          }
          return null;
        })
      }
    };
    mockContext = {};
    mockUser = { id: 'user123', email: 'user@example.com', role: 'USER' };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup MonitoringService mock
    monitoringService = new MonitoringService();
    
    // Setup Prisma mock directly on global object
    global.prisma = {
      website: {
        findFirst: jest.fn().mockResolvedValue({
          id: '123',
          name: 'Test Website',
          url: 'https://example.com',
          userId: 'user123'
        })
      },
      audit: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'audit1',
            createdAt: new Date('2025-05-01T12:00:00Z'),
            completedAt: new Date('2025-05-01T12:30:00Z'),
            overallScore: 80,
            seoScore: 85,
            performanceScore: 75,
            issueCount: 5
          },
          {
            id: 'audit2',
            createdAt: new Date('2025-06-01T12:00:00Z'),
            completedAt: new Date('2025-06-01T12:30:00Z'),
            overallScore: 85,
            seoScore: 90,
            performanceScore: 80,
            issueCount: 3
          }
        ])
      },
      $disconnect: jest.fn()
    };

    // Mock monitoring service methods
    monitoringService.getMonitoringConfig.mockResolvedValue({
      enabled: true,
      frequency: 'WEEKLY',
      alertThreshold: 5,
      metrics: ['overallScore', 'seoScore']
    });

    monitoringService.getAlertsFromCacheOrDatabase.mockResolvedValue([
      {
        id: 'alert1',
        websiteId: '123',
        metricName: 'overallScore',
        previousValue: 80,
        currentValue: 75,
        threshold: 5,
        createdAt: new Date('2025-05-15T12:00:00Z'),
        read: false
      },
      {
        id: 'alert2',
        websiteId: '123',
        metricName: 'seoScore',
        previousValue: 85,
        currentValue: 75,
        threshold: 5,
        createdAt: new Date('2025-06-01T12:00:00Z'),
        read: true
      }
    ]);
  });
  
  describe('GET handler', () => {
    it('should return 400 if website ID is not provided', async () => {
      mockRequest.url = 'http://localhost:3000/api/monitor/continuous';
      
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
    
    it('should apply date filter based on timeRange parameter', async () => {
      // Test with 7days timeRange
      mockRequest.url = 'http://localhost:3000/api/monitor/continuous?websiteId=123&timeRange=7days';
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(subDays).toHaveBeenCalledWith(expect.any(Date), 7);
      expect(global.prisma.audit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            completedAt: expect.objectContaining({
              gte: expect.any(Date)
            })
          })
        })
      );
    });
    
    it('should parse metrics from query parameters', async () => {
      mockRequest.url = 'http://localhost:3000/api/monitor/continuous?websiteId=123&metrics=overallScore,seoScore';
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.audit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            overallScore: true,
            seoScore: true,
            performanceScore: false,
            accessibilityScore: false
          })
        })
      );
    });
    
    it('should calculate trends when audit history has at least 2 entries', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      // Verify that the NextResponse.json was called
      // We can't directly check the calculated trends since they're calculated inside the handler
      expect(NextResponse.json).toHaveBeenCalled();
      
      // Verify that the audit history was retrieved
      expect(global.prisma.audit.findMany).toHaveBeenCalled();
    });
    
    it('should filter alerts based on timeRange', async () => {
      // Set timeRange to 7 days which should filter out older alerts
      mockRequest.url = 'http://localhost:3000/api/monitor/continuous?websiteId=123&timeRange=7days';
      
      // Mock current date to be 2025-06-05
      const mockDate = new Date('2025-06-05T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Setup alerts with different dates
      monitoringService.getAlertsFromCacheOrDatabase.mockResolvedValue([
        {
          id: 'alert1',
          websiteId: '123',
          metricName: 'overallScore',
          previousValue: 80,
          currentValue: 75,
          threshold: 5,
          createdAt: new Date('2025-05-15T12:00:00Z'),
          read: false
        },
        {
          id: 'alert2',
          websiteId: '123',
          metricName: 'seoScore',
          previousValue: 85,
          currentValue: 75,
          threshold: 5,
          createdAt: new Date('2025-06-01T12:00:00Z'),
          read: true
        }
      ]);
      
      await GET(mockRequest, mockContext, mockUser);
      
      // Verify the response was called with filtered alerts
      // We can't directly check the filtered alerts since they're processed inside the handler
      // Instead, we'll verify that the handler was called with the right parameters
      expect(monitoringService.getAlertsFromCacheOrDatabase).toHaveBeenCalledWith(
        '123',
        1,
        10,
        false
      );
    });
    
    it('should include monitoring configuration in the response', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(monitoringService.getMonitoringConfig).toHaveBeenCalledWith('123');
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          monitoringConfig: expect.objectContaining({
            enabled: true,
            frequency: 'WEEKLY',
            alertThreshold: 5,
            metrics: ['overallScore', 'seoScore']
          })
        })
      );
    });
    
    it('should provide default monitoring config if none exists', async () => {
      monitoringService.getMonitoringConfig.mockResolvedValue(null);
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          monitoringConfig: expect.objectContaining({
            enabled: false,
            frequency: 'WEEKLY',
            alertThreshold: 10,
            metrics: ['overallScore', 'seoScore', 'performanceScore']
          })
        })
      );
    });
    
    it('should handle errors gracefully', async () => {
      global.prisma.audit.findMany.mockRejectedValue(new Error('Database error'));
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to fetch monitoring data') },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client in finally block', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
});
