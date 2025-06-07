// __tests__/app/api/cron/run-monitoring-checks/route.test.ts
// Unit tests for the run-monitoring-checks API route

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/cron/run-monitoring-checks/route';
import { MonitoringServiceAdapter } from '@/lib/services/monitoring-service-adapter';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@/lib/logger';

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

jest.mock('@/lib/services/monitoring-service-adapter', () => ({
  MonitoringServiceAdapter: jest.fn().mockImplementation(() => ({
    runScheduledChecks: jest.fn().mockResolvedValue(5),
    getWebsitesDueForCheck: jest.fn().mockResolvedValue(['website-1', 'website-2', 'website-3'])
  }))
}));

jest.mock('@/lib/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('Run Monitoring Checks API Routes', () => {
  let mockRequest: any;
  
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
        count: jest.fn().mockResolvedValue(10)
      },
      $disconnect: jest.fn()
    };
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
    
    it('should return 401 if token does not match CRON_SECRET', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Bearer wrong-token');
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should run scheduled monitoring checks and return success response', async () => {
      await POST(mockRequest);
      
      expect(MonitoringServiceAdapter).toHaveBeenCalledWith({ storage: 'in-memory' });
      const mockAdapter = (MonitoringServiceAdapter as jest.Mock).mock.instances[0];
      expect(mockAdapter.runScheduledChecks).toHaveBeenCalled();
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        checkedCount: 5,
        timestamp: expect.any(String),
        message: 'Successfully ran monitoring checks for 5 websites'
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      (MonitoringServiceAdapter as jest.Mock).mockImplementationOnce(() => ({
        runScheduledChecks: jest.fn().mockRejectedValue(new Error('Processing error'))
      }));
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Failed to run scheduled monitoring checks',
          message: 'Processing error',
          timestamp: expect.any(String)
        },
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
    
    it('should return 401 if token does not match CRON_SECRET', async () => {
      mockRequest.headers.get.mockReturnValueOnce('Bearer wrong-token');
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return monitoring health check data', async () => {
      await GET(mockRequest);
      
      expect(global.prisma.auditSchedule.count).toHaveBeenCalledWith({
        where: { enabled: true }
      });
      
      expect(MonitoringServiceAdapter).toHaveBeenCalled();
      const mockAdapter = (MonitoringServiceAdapter as jest.Mock).mock.instances[0];
      expect(mockAdapter.getWebsitesDueForCheck).toHaveBeenCalled();
      
      expect(NextResponse.json).toHaveBeenCalledWith({
        status: 'healthy',
        enabledConfigsCount: 10,
        dueWebsitesCount: 3,
        timestamp: expect.any(String),
        message: 'Monitoring cron job is properly configured'
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      global.prisma.auditSchedule.count = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await GET(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Failed to perform health check',
          message: 'Database error'
        },
        { status: 500 }
      );
    });
  });
});
