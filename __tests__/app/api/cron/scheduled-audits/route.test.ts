// __tests__/app/api/cron/scheduled-audits/route.test.ts
// Unit tests for scheduled audits cron API route

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/cron/scheduled-audits/route';
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
      failed: 1,
      nextScheduled: '2023-07-15T10:00:00.000Z'
    })
  }))
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    auditSchedule: {
      count: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

// Mock environment variables
const originalEnv = process.env;

describe('Scheduled Audits API Routes', () => {
  let mockRequest: any;
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
    
    // Setup prisma mock
    global.prisma = {
      auditSchedule: {
        count: jest.fn().mockImplementation((query) => {
          if (query?.where?.nextScheduledAt) {
            return Promise.resolve(3); // 3 pending audits
          }
          return Promise.resolve(10); // 10 total audits
        })
      },
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Basic test-token');
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 401 if token does not match CRON_SECRET', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Bearer wrong-token');
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid token' },
        { status: 401 }
      );
    });
    
    it('should return 401 if CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid token' },
        { status: 401 }
      );
    });
    
    it('should process scheduled audits and return success response', async () => {
      await POST(mockRequest);
      
      expect(scheduledAuditService.processScheduledAudits).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({
        message: 'Scheduled audits processed successfully',
        processed: 5,
        succeeded: 4,
        failed: 1,
        nextScheduled: '2023-07-15T10:00:00.000Z'
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      (ScheduledAuditService as jest.Mock).mockImplementationOnce(() => ({
        processScheduledAudits: jest.fn().mockRejectedValue(new Error('Processing error'))
      }));
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to process scheduled audits') },
        { status: 500 }
      );
    });
  });
  
  describe('GET handler', () => {
    it('should return 401 if no authorization header is provided', async () => {
      mockRequest.headers.get.mockReturnValueOnce(null);
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Basic test-token');
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 401 if token does not match CRON_SECRET', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Bearer wrong-token');
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid token' },
        { status: 401 }
      );
    });
    
    it('should return health status with pending and total audit counts', async () => {
      await GET(mockRequest);
      
      expect(global.prisma.auditSchedule.count).toHaveBeenCalledTimes(2);
      expect(NextResponse.json).toHaveBeenCalledWith({
        status: 'healthy',
        pendingAudits: 3,
        totalEnabledAudits: 10,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      global.prisma.auditSchedule.count = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Failed to check scheduled audits health') },
        { status: 500 }
      );
    });
  });
});
