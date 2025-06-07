// src/__tests__/lib/services/monitoring-service.test.ts
// Unit tests for the Monitoring Service

import { MonitoringService } from '@/lib/services/monitoring-service';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '@/lib/services/notification-service';

// Mock dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      monitoringAlert: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      monitoringConfig: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      website: {
        findUnique: jest.fn(),
      },
      audit: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback()),
    })),
  };
});

jest.mock('@/lib/services/notification-service', () => {
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      sendNotification: jest.fn().mockResolvedValue(true),
    })),
  };
});

// Mock MonitoringCache
jest.mock('@/lib/cache/monitoring-cache', () => {
  return {
    MonitoringCache: {
      getAlerts: jest.fn(),
      setAlerts: jest.fn(),
      invalidateAlerts: jest.fn(),
    },
  };
});

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  let mockPrisma: any;
  let mockNotificationService: any;
  
  const mockUserId = 'user-123';
  const mockWebsiteId = 'website-123';
  
  const mockAlerts = [
    {
      id: 'alert-1',
      websiteId: mockWebsiteId,
      userId: mockUserId,
      title: 'Performance Drop',
      message: 'Website performance score dropped by 15 points',
      severity: 'WARNING',
      category: 'PERFORMANCE',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'alert-2',
      websiteId: mockWebsiteId,
      userId: mockUserId,
      title: 'Security Issue',
      message: 'Critical security vulnerability detected',
      severity: 'CRITICAL',
      category: 'SECURITY',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  const mockConfig = {
    id: 'config-1',
    websiteId: mockWebsiteId,
    userId: mockUserId,
    performanceThreshold: 10,
    seoThreshold: 10,
    accessibilityThreshold: 10,
    securityThreshold: 5,
    mobileThreshold: 10,
    contentThreshold: 10,
    enableEmailAlerts: true,
    enableInAppAlerts: true,
    monitorPerformance: true,
    monitorSEO: true,
    monitorAccessibility: true,
    monitorSecurity: true,
    monitorMobile: true,
    monitorContent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock Prisma client
    mockPrisma = new PrismaClient();
    mockNotificationService = new NotificationService(mockPrisma);
    
    // Create monitoring service instance
    monitoringService = new MonitoringService(mockPrisma);
    
    // Set the notification service
    (monitoringService as any).notificationService = mockNotificationService;
  });

  describe('getAlerts', () => {
    it('should return cached alerts when available', async () => {
      // Setup mock for cache hit
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      MonitoringCache.getAlerts.mockReturnValue(mockAlerts);
      
      const result = await monitoringService.getAlerts(mockUserId, mockWebsiteId);
      
      expect(MonitoringCache.getAlerts).toHaveBeenCalledWith(mockUserId, mockWebsiteId);
      expect(mockPrisma.monitoringAlert.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockAlerts);
    });

    it('should fetch alerts from database when not cached', async () => {
      // Setup mock for cache miss
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      MonitoringCache.getAlerts.mockReturnValue(null);
      
      // Setup mock for database query
      mockPrisma.monitoringAlert.findMany.mockResolvedValue(mockAlerts);
      
      const result = await monitoringService.getAlerts(mockUserId, mockWebsiteId);
      
      expect(MonitoringCache.getAlerts).toHaveBeenCalledWith(mockUserId, mockWebsiteId);
      expect(mockPrisma.monitoringAlert.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          websiteId: mockWebsiteId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(MonitoringCache.setAlerts).toHaveBeenCalledWith(mockUserId, mockWebsiteId, mockAlerts);
      expect(result).toEqual(mockAlerts);
    });

    it('should handle unread only filter', async () => {
      // Setup mock for cache miss
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      MonitoringCache.getAlerts.mockReturnValue(null);
      
      // Setup mock for database query
      mockPrisma.monitoringAlert.findMany.mockResolvedValue([mockAlerts[0]]);
      
      const result = await monitoringService.getAlerts(mockUserId, mockWebsiteId, true);
      
      expect(mockPrisma.monitoringAlert.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          websiteId: mockWebsiteId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockAlerts[0]]);
    });

    it('should handle errors gracefully', async () => {
      // Setup mock for cache miss
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      MonitoringCache.getAlerts.mockReturnValue(null);
      
      // Setup mock for database error
      const error = new Error('Database error');
      mockPrisma.monitoringAlert.findMany.mockRejectedValue(error);
      
      await expect(monitoringService.getAlerts(mockUserId, mockWebsiteId))
        .rejects.toThrow('Failed to retrieve monitoring alerts');
    });
  });

  describe('markAlertAsRead', () => {
    it('should mark an alert as read', async () => {
      // Setup mock for update
      mockPrisma.monitoringAlert.update.mockResolvedValue({
        ...mockAlerts[0],
        read: true,
      });
      
      const alertId = 'alert-1';
      const result = await monitoringService.markAlertAsRead(alertId, mockUserId);
      
      expect(mockPrisma.monitoringAlert.update).toHaveBeenCalledWith({
        where: {
          id: alertId,
          userId: mockUserId,
        },
        data: {
          read: true,
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual({
        ...mockAlerts[0],
        read: true,
      });
      
      // Verify cache was invalidated
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      expect(MonitoringCache.invalidateAlerts).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an error when alert not found', async () => {
      // Setup mock for not found
      mockPrisma.monitoringAlert.update.mockRejectedValue(new Error('Alert not found'));
      
      await expect(monitoringService.markAlertAsRead('non-existent', mockUserId))
        .rejects.toThrow('Failed to mark alert as read');
    });
  });

  describe('getMonitoringConfig', () => {
    it('should return monitoring configuration', async () => {
      // Setup mock for database query
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(mockConfig);
      
      const result = await monitoringService.getMonitoringConfig(mockWebsiteId, mockUserId);
      
      expect(mockPrisma.monitoringConfig.findUnique).toHaveBeenCalledWith({
        where: {
          websiteId_userId: {
            websiteId: mockWebsiteId,
            userId: mockUserId,
          },
        },
      });
      
      expect(result).toEqual(mockConfig);
    });

    it('should return default config when none exists', async () => {
      // Setup mock for database query returning null
      mockPrisma.monitoringConfig.findUnique.mockResolvedValue(null);
      
      const result = await monitoringService.getMonitoringConfig(mockWebsiteId, mockUserId);
      
      expect(result).toHaveProperty('performanceThreshold', 10);
      expect(result).toHaveProperty('enableEmailAlerts', true);
      expect(result).toHaveProperty('monitorPerformance', true);
    });

    it('should handle errors gracefully', async () => {
      // Setup mock for database error
      mockPrisma.monitoringConfig.findUnique.mockRejectedValue(new Error('Database error'));
      
      await expect(monitoringService.getMonitoringConfig(mockWebsiteId, mockUserId))
        .rejects.toThrow('Failed to retrieve monitoring configuration');
    });
  });

  describe('updateMonitoringConfig', () => {
    it('should update monitoring configuration', async () => {
      // Setup mock for database upsert
      mockPrisma.monitoringConfig.upsert.mockResolvedValue({
        ...mockConfig,
        performanceThreshold: 15,
      });
      
      const configUpdate = {
        performanceThreshold: 15,
      };
      
      const result = await monitoringService.updateMonitoringConfig(
        mockWebsiteId,
        mockUserId,
        configUpdate
      );
      
      expect(mockPrisma.monitoringConfig.upsert).toHaveBeenCalledWith({
        where: {
          websiteId_userId: {
            websiteId: mockWebsiteId,
            userId: mockUserId,
          },
        },
        update: {
          ...configUpdate,
          updatedAt: expect.any(Date),
        },
        create: expect.objectContaining({
          websiteId: mockWebsiteId,
          userId: mockUserId,
          performanceThreshold: 15,
        }),
      });
      
      expect(result).toEqual({
        ...mockConfig,
        performanceThreshold: 15,
      });
    });

    it('should handle errors gracefully', async () => {
      // Setup mock for database error
      mockPrisma.monitoringConfig.upsert.mockRejectedValue(new Error('Database error'));
      
      await expect(monitoringService.updateMonitoringConfig(
        mockWebsiteId,
        mockUserId,
        { performanceThreshold: 15 }
      )).rejects.toThrow('Failed to update monitoring configuration');
    });
  });

  describe('createAlert', () => {
    it('should create a new alert', async () => {
      // Setup mock for create
      mockPrisma.monitoringAlert.create.mockResolvedValue(mockAlerts[0]);
      
      const alertData = {
        title: 'Performance Drop',
        message: 'Website performance score dropped by 15 points',
        severity: 'WARNING',
        category: 'PERFORMANCE',
      };
      
      const result = await monitoringService.createAlert(
        mockWebsiteId,
        mockUserId,
        alertData.title,
        alertData.message,
        alertData.severity as any,
        alertData.category as any
      );
      
      expect(mockPrisma.monitoringAlert.create).toHaveBeenCalledWith({
        data: {
          websiteId: mockWebsiteId,
          userId: mockUserId,
          title: alertData.title,
          message: alertData.message,
          severity: alertData.severity,
          category: alertData.category,
          read: false,
        },
      });
      
      expect(result).toEqual(mockAlerts[0]);
      
      // Verify cache was invalidated
      const { MonitoringCache } = require('@/lib/cache/monitoring-cache');
      expect(MonitoringCache.invalidateAlerts).toHaveBeenCalledWith(mockUserId);
      
      // Verify notification was sent
      expect(mockNotificationService.sendNotification).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Setup mock for database error
      mockPrisma.monitoringAlert.create.mockRejectedValue(new Error('Database error'));
      
      await expect(monitoringService.createAlert(
        mockWebsiteId,
        mockUserId,
        'Test Alert',
        'Test Message',
        'WARNING',
        'PERFORMANCE'
      )).rejects.toThrow('Failed to create monitoring alert');
    });
  });

  describe('checkMetricThresholds', () => {
    beforeEach(() => {
      // Setup mocks for required methods
      jest.spyOn(monitoringService, 'getMonitoringConfig').mockResolvedValue(mockConfig);
      jest.spyOn(monitoringService, 'createAlert').mockResolvedValue(mockAlerts[0]);
      
      // Mock audit data
      mockPrisma.audit.findFirst.mockResolvedValueOnce({
        id: 'previous-audit',
        overallScore: 90,
        performanceScore: 95,
        seoScore: 90,
        accessibilityScore: 85,
        securityScore: 95,
        mobileScore: 85,
        contentScore: 90,
      });
      
      mockPrisma.audit.findFirst.mockResolvedValueOnce({
        id: 'current-audit',
        overallScore: 80,
        performanceScore: 75, // 20 point drop, above threshold
        seoScore: 85, // 5 point drop, below threshold
        accessibilityScore: 80, // 5 point drop, below threshold
        securityScore: 85, // 10 point drop, above threshold
        mobileScore: 80, // 5 point drop, below threshold
        contentScore: 85, // 5 point drop, below threshold
      });
    });

    it('should detect metrics exceeding thresholds', async () => {
      await monitoringService.checkMetricThresholds(mockWebsiteId, mockUserId);
      
      // Should create alerts for performance and security (above threshold)
      expect(monitoringService.createAlert).toHaveBeenCalledTimes(2);
      
      // Check performance alert
      expect(monitoringService.createAlert).toHaveBeenCalledWith(
        mockWebsiteId,
        mockUserId,
        'Performance Score Drop',
        expect.stringContaining('dropped by 20 points'),
        'WARNING',
        'PERFORMANCE'
      );
      
      // Check security alert
      expect(monitoringService.createAlert).toHaveBeenCalledWith(
        mockWebsiteId,
        mockUserId,
        'Security Score Drop',
        expect.stringContaining('dropped by 10 points'),
        'CRITICAL', // Security issues are critical
        'SECURITY'
      );
    });

    it('should respect monitoring configuration settings', async () => {
      // Update config to disable performance monitoring
      jest.spyOn(monitoringService, 'getMonitoringConfig').mockResolvedValue({
        ...mockConfig,
        monitorPerformance: false,
        monitorSecurity: true,
      });
      
      await monitoringService.checkMetricThresholds(mockWebsiteId, mockUserId);
      
      // Should only create alert for security (performance monitoring disabled)
      expect(monitoringService.createAlert).toHaveBeenCalledTimes(1);
      expect(monitoringService.createAlert).toHaveBeenCalledWith(
        mockWebsiteId,
        mockUserId,
        'Security Score Drop',
        expect.stringContaining('dropped by 10 points'),
        'CRITICAL',
        'SECURITY'
      );
    });

    it('should handle case with no previous audit', async () => {
      // Mock no previous audit
      mockPrisma.audit.findFirst.mockReset();
      mockPrisma.audit.findFirst.mockResolvedValueOnce(null); // No previous audit
      mockPrisma.audit.findFirst.mockResolvedValueOnce({
        id: 'current-audit',
        overallScore: 80,
      });
      
      await monitoringService.checkMetricThresholds(mockWebsiteId, mockUserId);
      
      // Should not create any alerts without a previous audit for comparison
      expect(monitoringService.createAlert).not.toHaveBeenCalled();
    });
  });
});
