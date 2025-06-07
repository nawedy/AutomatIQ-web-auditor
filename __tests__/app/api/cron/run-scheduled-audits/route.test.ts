// __tests__/app/api/cron/run-scheduled-audits/route.test.ts
// Unit tests for the run-scheduled-audits API route

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/cron/run-scheduled-audits/route';
import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service';
import { PrismaClient } from '@prisma/client';

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

jest.mock('@/lib/services/scheduled-audit-service', () => ({
  ScheduledAuditService: jest.fn().mockImplementation(() => ({
    processScheduledAudits: jest.fn().mockResolvedValue({
      processed: 5,
      succeeded: 4,
      failed: 1
    })
  }))
}));

jest.mock('@/lib/auth-utils', () => ({
  withAuth: jest.fn((handler) => handler)
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('2025-06-06 15:00:00')
}));

// Mock environment variables
const originalEnv = process.env;

describe('Run Scheduled Audits API Routes', () => {
  let mockRequest: any;
  let mockUser: any;
  let mockContext: any;
  let scheduledAuditService: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup environment
    process.env = { ...originalEnv };
    process.env.CRON_SECRET = 'test-cron-secret';
    
    // Setup request mock
    mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('Bearer test-cron-secret')
      }
    };
    
    // Setup user mock for GET endpoint
    mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      role: 'ADMIN'
    };
    
    mockContext = {};
    
    // Setup prisma mock
    global.prisma = {
      website: {
        count: jest.fn().mockResolvedValue(10),
        findFirst: jest.fn().mockResolvedValue({
          id: 'website-123',
          name: 'Example Website',
          url: 'https://example.com',
          nextScheduledAuditAt: new Date('2025-06-07T10:00:00Z'),
          auditSchedule: {
            frequency: 'DAILY'
          }
        })
      },
      audit: {
        count: jest.fn().mockImplementation((query) => {
          if (query?.where?.status?.in?.includes('QUEUED')) {
            return Promise.resolve(2); // 2 pending audits
          }
          if (query?.where?.status === 'COMPLETED') {
            return Promise.resolve(15); // 15 completed audits
          }
          if (query?.where?.status === 'FAILED') {
            return Promise.resolve(3); // 3 failed audits
          }
          if (query?.where?.type === 'SCHEDULED') {
            return Promise.resolve(20); // 20 total scheduled audits
          }
          if (query?.where?.createdAt) {
            return Promise.resolve(5); // 5 audits processed today
          }
          return Promise.resolve(0);
        })
      },
      $transaction: jest.fn((callback) => callback(global.prisma)),
      $disconnect: jest.fn()
    };
    
    // Setup service mock
    scheduledAuditService = new ScheduledAuditService(global.prisma as unknown as PrismaClient);
  });
  
  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });
  
  describe('POST handler', () => {
    it('should return 401 if no authorization header is provided', async () => {
      mockRequest.headers.get.mockReturnValueOnce(null);
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    });
    
    it('should return 401 if token does not match CRON_SECRET', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Bearer wrong-token');
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    });
    
    it('should process scheduled audits and return success response', async () => {
      await POST(mockRequest);
      
      expect(ScheduledAuditService).toHaveBeenCalledWith(expect.any(Object));
      expect(scheduledAuditService.processScheduledAudits).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Scheduled audits processed successfully',
        timestamp: expect.any(String),
        stats: {
          totalScheduled: expect.any(Number),
          processedToday: expect.any(Number),
          pendingAudits: expect.any(Number)
        }
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      (ScheduledAuditService as jest.Mock).mockImplementationOnce(() => ({
        processScheduledAudits: jest.fn().mockRejectedValue(new Error('Processing error'))
      }));
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Failed to process scheduled audits',
          message: 'Processing error',
          timestamp: expect.any(String)
        },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client after processing', async () => {
      await POST(mockRequest);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
  
  describe('GET handler', () => {
    it('should return 403 if user is not an admin', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };
      
      await GET(mockRequest, mockContext, nonAdminUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    });
    
    it('should return system statistics for admin users', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$transaction).toHaveBeenCalled();
      expect(global.prisma.website.count).toHaveBeenCalled();
      expect(global.prisma.audit.count).toHaveBeenCalledTimes(4);
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        stats: {
          totalWebsites: 10,
          scheduledWebsites: 10,
          scheduledAudits: 20,
          completedAudits: 15,
          failedAudits: 3,
          nextScheduled: expect.any(Object),
          systemTime: expect.any(String)
        }
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      global.prisma.$transaction = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await GET(mockRequest, mockContext, mockUser);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Failed to fetch scheduled audits status',
          message: 'Database error'
        },
        { status: 500 }
      );
    });
    
    it('should disconnect prisma client after processing', async () => {
      await GET(mockRequest, mockContext, mockUser);
      
      expect(global.prisma.$disconnect).toHaveBeenCalled();
    });
  });
});
