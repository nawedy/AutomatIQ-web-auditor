// src/__tests__/api/scheduled-audit.test.ts
// Unit tests for scheduled audit API routes

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/websites/[id]/schedule/route';
import { GET as getHistory } from '@/app/api/websites/[id]/schedule/history/route';
import { GET as getCronHealth, POST as processCron } from '@/app/api/cron/scheduled-audits/route';
import { prisma } from '@/lib/prisma';

// Mock NextAuth
jest.mock('next-auth');
import { getServerSession } from 'next-auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    website: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    auditSchedule: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    audit: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

// Mock environment variables
process.env.CRON_SECRET = 'test-cron-secret';

describe('Scheduled Audit API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    });
  });

  describe('GET /api/websites/[id]/schedule', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/websites/123/schedule');
      const response = await GET(request, { params: { id: '123' } });
      
      expect(response.status).toBe(401);
    });

    it('should return 404 if website not found', async () => {
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/websites/123/schedule');
      const response = await GET(request, { params: { id: '123' } });
      
      expect(response.status).toBe(404);
    });

    it('should return schedule if found', async () => {
      const mockWebsite = { id: '123', userId: 'user-123' };
      const mockSchedule = { 
        id: 'schedule-123',
        websiteId: '123',
        enabled: true,
        frequency: 'WEEKLY',
        categories: ['SEO', 'PERFORMANCE'],
      };
      
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(mockWebsite);
      (prisma.auditSchedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);
      
      const request = new NextRequest('http://localhost:3000/api/websites/123/schedule');
      const response = await GET(request, { params: { id: '123' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockSchedule);
    });
  });

  describe('POST /api/websites/[id]/schedule', () => {
    it('should create a new schedule if none exists', async () => {
      const mockWebsite = { id: '123', userId: 'user-123' };
      const mockScheduleData = {
        enabled: true,
        frequency: 'WEEKLY',
        categories: ['SEO', 'PERFORMANCE'],
        dayOfWeek: 1,
      };
      const mockCreatedSchedule = { 
        id: 'schedule-123',
        websiteId: '123',
        ...mockScheduleData,
      };
      
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(mockWebsite);
      (prisma.auditSchedule.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditSchedule.create as jest.Mock).mockResolvedValue(mockCreatedSchedule);
      
      const request = new NextRequest(
        'http://localhost:3000/api/websites/123/schedule',
        {
          method: 'POST',
          body: JSON.stringify(mockScheduleData),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCreatedSchedule);
      expect(prisma.auditSchedule.create).toHaveBeenCalledWith({
        data: {
          websiteId: '123',
          ...mockScheduleData,
          nextScheduledAt: expect.any(Date),
        },
      });
    });

    it('should update an existing schedule', async () => {
      const mockWebsite = { id: '123', userId: 'user-123' };
      const mockExistingSchedule = {
        id: 'schedule-123',
        websiteId: '123',
        enabled: false,
        frequency: 'MONTHLY',
        categories: ['SEO'],
      };
      const mockScheduleData = {
        enabled: true,
        frequency: 'WEEKLY',
        categories: ['SEO', 'PERFORMANCE'],
        dayOfWeek: 1,
      };
      const mockUpdatedSchedule = { 
        id: 'schedule-123',
        websiteId: '123',
        ...mockScheduleData,
      };
      
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(mockWebsite);
      (prisma.auditSchedule.findFirst as jest.Mock).mockResolvedValue(mockExistingSchedule);
      (prisma.auditSchedule.update as jest.Mock).mockResolvedValue(mockUpdatedSchedule);
      
      const request = new NextRequest(
        'http://localhost:3000/api/websites/123/schedule',
        {
          method: 'POST',
          body: JSON.stringify(mockScheduleData),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedSchedule);
      expect(prisma.auditSchedule.update).toHaveBeenCalledWith({
        where: { id: 'schedule-123' },
        data: {
          ...mockScheduleData,
          nextScheduledAt: expect.any(Date),
        },
      });
    });
  });

  describe('DELETE /api/websites/[id]/schedule', () => {
    it('should delete an existing schedule', async () => {
      const mockWebsite = { id: '123', userId: 'user-123' };
      const mockSchedule = { id: 'schedule-123', websiteId: '123' };
      
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(mockWebsite);
      (prisma.auditSchedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);
      (prisma.auditSchedule.delete as jest.Mock).mockResolvedValue(mockSchedule);
      
      const request = new NextRequest(
        'http://localhost:3000/api/websites/123/schedule',
        { method: 'DELETE' }
      );
      
      const response = await DELETE(request, { params: { id: '123' } });
      
      expect(response.status).toBe(200);
      expect(prisma.auditSchedule.delete).toHaveBeenCalledWith({
        where: { id: 'schedule-123' },
      });
    });
  });

  describe('GET /api/websites/[id]/schedule/history', () => {
    it('should return paginated audit history', async () => {
      const mockWebsite = { id: '123', userId: 'user-123' };
      const mockAudits = [
        { id: 'audit-1', websiteId: '123', createdAt: new Date() },
        { id: 'audit-2', websiteId: '123', createdAt: new Date() },
      ];
      
      (prisma.website.findFirst as jest.Mock).mockResolvedValue(mockWebsite);
      (prisma.audit.findMany as jest.Mock).mockResolvedValue(mockAudits);
      (prisma.audit.count as jest.Mock).mockResolvedValue(10);
      
      const request = new NextRequest(
        'http://localhost:3000/api/websites/123/schedule/history?page=1&pageSize=10'
      );
      
      const response = await getHistory(request, { params: { id: '123' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({
        audits: mockAudits,
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('GET /api/cron/scheduled-audits', () => {
    it('should return 401 without proper authorization', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/scheduled-audits');
      const response = await getCronHealth(request);
      
      expect(response.status).toBe(401);
    });

    it('should return health status with proper authorization', async () => {
      (prisma.auditSchedule.count as jest.Mock).mockResolvedValue(5);
      
      const request = new NextRequest(
        'http://localhost:3000/api/cron/scheduled-audits',
        {
          headers: { 'Authorization': 'Bearer test-cron-secret' },
        }
      );
      
      const response = await getCronHealth(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('scheduledAuditsCount', 5);
    });
  });

  describe('POST /api/cron/scheduled-audits', () => {
    it('should process scheduled audits with proper authorization', async () => {
      const mockSchedules = [
        { 
          id: 'schedule-1', 
          websiteId: '123',
          website: { id: '123', url: 'https://example.com', name: 'Example' },
          enabled: true,
          categories: ['SEO', 'PERFORMANCE'],
        },
      ];
      
      (prisma.auditSchedule.findMany as jest.Mock).mockResolvedValue(mockSchedules);
      (prisma.audit.create as jest.Mock).mockResolvedValue({ id: 'new-audit-1' });
      (prisma.auditSchedule.update as jest.Mock).mockResolvedValue({});
      
      const request = new NextRequest(
        'http://localhost:3000/api/cron/scheduled-audits',
        {
          method: 'POST',
          headers: { 'Authorization': 'Bearer test-cron-secret' },
        }
      );
      
      const response = await processCron(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('processed');
      expect(data.processed).toBe(1);
      expect(prisma.audit.create).toHaveBeenCalledTimes(1);
      expect(prisma.auditSchedule.update).toHaveBeenCalledTimes(1);
    });
  });
});
