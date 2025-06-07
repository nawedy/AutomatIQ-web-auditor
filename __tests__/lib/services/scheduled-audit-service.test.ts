// src/__tests__/lib/services/scheduled-audit-service.test.ts
// Unit tests for the Scheduled Audit Service

import { ScheduledAuditService } from '@/lib/services/scheduled-audit-service';
import { PrismaClient } from '@prisma/client';
import { AuditService } from '@/lib/services/audit-service';

// Mock dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      scheduledAudit: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      website: {
        findUnique: jest.fn(),
      },
      audit: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback()),
    })),
  };
});

jest.mock('@/lib/services/audit-service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => ({
      startAudit: jest.fn().mockResolvedValue({ id: 'new-audit-id' }),
    })),
  };
});

describe('ScheduledAuditService', () => {
  let scheduledAuditService: ScheduledAuditService;
  let mockPrisma: any;
  let mockAuditService: any;
  
  const mockUserId = 'user-123';
  const mockWebsiteId = 'website-123';
  
  const mockScheduledAudit = {
    id: 'schedule-1',
    websiteId: mockWebsiteId,
    userId: mockUserId,
    frequency: 'WEEKLY',
    dayOfWeek: 1, // Monday
    enabled: true,
    lastRunAt: new Date('2025-05-30T12:00:00Z'),
    nextRunAt: new Date('2025-06-06T12:00:00Z'),
    createdAt: new Date('2025-05-01T12:00:00Z'),
    updatedAt: new Date('2025-05-01T12:00:00Z'),
  };
  
  const mockWebsite = {
    id: mockWebsiteId,
    name: 'Example Website',
    url: 'https://example.com',
    userId: mockUserId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Prisma client
    mockPrisma = new PrismaClient();
    mockAuditService = new AuditService(mockPrisma);
    
    // Create service instance
    scheduledAuditService = new ScheduledAuditService(mockPrisma);
    
    // Set the audit service
    (scheduledAuditService as any).auditService = mockAuditService;
    
    // Mock Date.now to return a fixed date for testing
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2025-06-06T15:00:00Z').getTime());
  });

  describe('getScheduledAudits', () => {
    it('should return scheduled audits for a website', async () => {
      // Setup mock for database query
      mockPrisma.scheduledAudit.findMany.mockResolvedValue([mockScheduledAudit]);
      
      const result = await scheduledAuditService.getScheduledAudits(mockWebsiteId, mockUserId);
      
      expect(mockPrisma.scheduledAudit.findMany).toHaveBeenCalledWith({
        where: {
          websiteId: mockWebsiteId,
          userId: mockUserId,
        },
      });
      
      expect(result).toEqual([mockScheduledAudit]);
    });

    it('should handle errors gracefully', async () => {
      // Setup mock for database error
      mockPrisma.scheduledAudit.findMany.mockRejectedValue(new Error('Database error'));
      
      await expect(scheduledAuditService.getScheduledAudits(mockWebsiteId, mockUserId))
        .rejects.toThrow('Failed to retrieve scheduled audits');
    });
  });

  describe('createSchedule', () => {
    it('should create a new audit schedule', async () => {
      // Setup mock for website query
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      
      // Setup mock for create
      mockPrisma.scheduledAudit.create.mockResolvedValue(mockScheduledAudit);
      
      const scheduleData = {
        frequency: 'WEEKLY',
        dayOfWeek: 1,
      };
      
      const result = await scheduledAuditService.createSchedule(
        mockWebsiteId,
        mockUserId,
        scheduleData.frequency as any,
        scheduleData.dayOfWeek
      );
      
      // Verify website ownership check
      expect(mockPrisma.website.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockWebsiteId,
          userId: mockUserId,
        },
      });
      
      // Verify schedule creation
      expect(mockPrisma.scheduledAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          websiteId: mockWebsiteId,
          userId: mockUserId,
          frequency: scheduleData.frequency,
          dayOfWeek: scheduleData.dayOfWeek,
          enabled: true,
          nextRunAt: expect.any(Date),
        }),
      });
      
      expect(result).toEqual(mockScheduledAudit);
    });

    it('should throw an error when user does not own the website', async () => {
      // Setup mock for website not found
      mockPrisma.website.findUnique.mockResolvedValue(null);
      
      await expect(scheduledAuditService.createSchedule(
        mockWebsiteId,
        mockUserId,
        'WEEKLY',
        1
      )).rejects.toThrow('Website not found or you do not have permission');
    });

    it('should calculate next run date correctly for weekly schedule', async () => {
      // Setup mocks
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.scheduledAudit.create.mockImplementation((args) => args.data);
      
      const result = await scheduledAuditService.createSchedule(
        mockWebsiteId,
        mockUserId,
        'WEEKLY',
        1 // Monday
      );
      
      // Current mock date is Friday (2025-06-06)
      // Next Monday should be 2025-06-09
      const expectedNextRun = new Date('2025-06-09T00:00:00Z');
      expect(new Date(result.nextRunAt).getDay()).toBe(1); // Monday
      expect(new Date(result.nextRunAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('should calculate next run date correctly for monthly schedule', async () => {
      // Setup mocks
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.scheduledAudit.create.mockImplementation((args) => args.data);
      
      const result = await scheduledAuditService.createSchedule(
        mockWebsiteId,
        mockUserId,
        'MONTHLY',
        15 // 15th day of month
      );
      
      // Current mock date is June 6, 2025
      // Next 15th should be June 15, 2025
      const nextRunDate = new Date(result.nextRunAt);
      expect(nextRunDate.getDate()).toBe(15);
      expect(nextRunDate.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('updateSchedule', () => {
    it('should update an existing schedule', async () => {
      // Setup mock for findUnique
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue(mockScheduledAudit);
      
      // Setup mock for update
      const updatedSchedule = {
        ...mockScheduledAudit,
        frequency: 'DAILY',
        dayOfWeek: null,
      };
      mockPrisma.scheduledAudit.update.mockResolvedValue(updatedSchedule);
      
      const updateData = {
        frequency: 'DAILY',
      };
      
      const result = await scheduledAuditService.updateSchedule(
        'schedule-1',
        mockUserId,
        updateData
      );
      
      // Verify schedule ownership check
      expect(mockPrisma.scheduledAudit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
          userId: mockUserId,
        },
      });
      
      // Verify update
      expect(mockPrisma.scheduledAudit.update).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
        },
        data: expect.objectContaining({
          frequency: 'DAILY',
          nextRunAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
      
      expect(result).toEqual(updatedSchedule);
    });

    it('should throw an error when schedule not found', async () => {
      // Setup mock for schedule not found
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue(null);
      
      await expect(scheduledAuditService.updateSchedule(
        'non-existent',
        mockUserId,
        { frequency: 'DAILY' }
      )).rejects.toThrow('Schedule not found or you do not have permission');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      // Setup mock for findUnique
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue(mockScheduledAudit);
      
      // Setup mock for delete
      mockPrisma.scheduledAudit.delete.mockResolvedValue(mockScheduledAudit);
      
      await scheduledAuditService.deleteSchedule('schedule-1', mockUserId);
      
      // Verify schedule ownership check
      expect(mockPrisma.scheduledAudit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
          userId: mockUserId,
        },
      });
      
      // Verify delete
      expect(mockPrisma.scheduledAudit.delete).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
        },
      });
    });

    it('should throw an error when schedule not found', async () => {
      // Setup mock for schedule not found
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue(null);
      
      await expect(scheduledAuditService.deleteSchedule(
        'non-existent',
        mockUserId
      )).rejects.toThrow('Schedule not found or you do not have permission');
    });
  });

  describe('enableSchedule', () => {
    it('should enable a disabled schedule', async () => {
      // Setup mock for findUnique
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue({
        ...mockScheduledAudit,
        enabled: false,
      });
      
      // Setup mock for update
      const updatedSchedule = {
        ...mockScheduledAudit,
        enabled: true,
      };
      mockPrisma.scheduledAudit.update.mockResolvedValue(updatedSchedule);
      
      const result = await scheduledAuditService.enableSchedule('schedule-1', mockUserId);
      
      // Verify update
      expect(mockPrisma.scheduledAudit.update).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
        },
        data: {
          enabled: true,
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual(updatedSchedule);
    });
  });

  describe('disableSchedule', () => {
    it('should disable an enabled schedule', async () => {
      // Setup mock for findUnique
      mockPrisma.scheduledAudit.findUnique.mockResolvedValue(mockScheduledAudit);
      
      // Setup mock for update
      const updatedSchedule = {
        ...mockScheduledAudit,
        enabled: false,
      };
      mockPrisma.scheduledAudit.update.mockResolvedValue(updatedSchedule);
      
      const result = await scheduledAuditService.disableSchedule('schedule-1', mockUserId);
      
      // Verify update
      expect(mockPrisma.scheduledAudit.update).toHaveBeenCalledWith({
        where: {
          id: 'schedule-1',
        },
        data: {
          enabled: false,
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual(updatedSchedule);
    });
  });

  describe('processDueAudits', () => {
    it('should process audits that are due to run', async () => {
      // Setup mock for findMany to return due audits
      mockPrisma.scheduledAudit.findMany.mockResolvedValue([mockScheduledAudit]);
      
      // Setup mock for website
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      
      // Setup mock for audit creation
      mockAuditService.startAudit.mockResolvedValue({ id: 'new-audit-id' });
      
      // Setup mock for schedule update
      mockPrisma.scheduledAudit.update.mockResolvedValue({
        ...mockScheduledAudit,
        lastRunAt: expect.any(Date),
        nextRunAt: expect.any(Date),
      });
      
      const result = await scheduledAuditService.processDueAudits();
      
      // Verify query for due audits
      expect(mockPrisma.scheduledAudit.findMany).toHaveBeenCalledWith({
        where: {
          enabled: true,
          nextRunAt: {
            lte: expect.any(Date), // Current time
          },
        },
      });
      
      // Verify audit was started
      expect(mockAuditService.startAudit).toHaveBeenCalledWith(
        mockWebsite.url,
        mockUserId,
        mockWebsiteId
      );
      
      // Verify schedule was updated
      expect(mockPrisma.scheduledAudit.update).toHaveBeenCalledWith({
        where: {
          id: mockScheduledAudit.id,
        },
        data: {
          lastRunAt: expect.any(Date),
          nextRunAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual({
        processed: 1,
        succeeded: 1,
        failed: 0,
      });
    });

    it('should handle errors during audit processing', async () => {
      // Setup mock for findMany to return due audits
      mockPrisma.scheduledAudit.findMany.mockResolvedValue([mockScheduledAudit]);
      
      // Setup mock for website
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      
      // Setup mock for audit creation to fail
      mockAuditService.startAudit.mockRejectedValue(new Error('Failed to start audit'));
      
      const result = await scheduledAuditService.processDueAudits();
      
      // Verify result shows the failure
      expect(result).toEqual({
        processed: 1,
        succeeded: 0,
        failed: 1,
      });
    });
  });
});
