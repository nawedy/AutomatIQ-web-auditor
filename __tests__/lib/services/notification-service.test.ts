// src/__tests__/lib/services/notification-service.test.ts
// Unit tests for the Notification Service

import { NotificationService } from '@/lib/services/notification-service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    website: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(callback => callback()),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock email service
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock webhook service
jest.mock('@/lib/services/webhook-service', () => ({
  WebhookService: {
    sendWebhookNotification: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('NotificationService', () => {
  const mockPrisma = new PrismaClient() as unknown as jest.Mocked<PrismaClient>;
  const mockUserId = 'user-123';
  const mockWebsiteId = 'website-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(mockPrisma);
  });

  describe('getNotifications', () => {
    it('should retrieve notifications for a user', async () => {
      // Mock notification data
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: mockUserId,
          title: 'Audit Completed',
          message: 'Your website audit has completed successfully',
          type: 'success',
          createdAt: new Date('2023-06-01T12:00:00Z'),
          read: false,
          metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
        },
        {
          id: 'notif-2',
          userId: mockUserId,
          title: 'Alert Triggered',
          message: 'Performance score dropped below threshold',
          type: 'warning',
          createdAt: new Date('2023-05-31T10:00:00Z'),
          read: false,
          metadata: { alertId: 'alert-123', websiteId: mockWebsiteId },
        },
      ];
      
      // Mock Prisma response
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      
      // Call the service method
      const result = await NotificationService.getNotifications(mockUserId, { limit: 10 });
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // Verify result
      expect(result).toEqual(mockNotifications);
    });

    it('should filter notifications by type', async () => {
      // Mock notification data
      const mockNotifications = [
        {
          id: 'notif-2',
          userId: mockUserId,
          title: 'Alert Triggered',
          message: 'Performance score dropped below threshold',
          type: 'warning',
          createdAt: new Date('2023-05-31T10:00:00Z'),
          read: false,
          metadata: { alertId: 'alert-123', websiteId: mockWebsiteId },
        },
      ];
      
      // Mock Prisma response
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      
      // Call the service method with type filter
      const result = await NotificationService.getNotifications(mockUserId, { 
        limit: 10,
        type: 'warning',
      });
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, type: 'warning' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // Verify result
      expect(result).toEqual(mockNotifications);
    });

    it('should filter notifications by read status', async () => {
      // Mock notification data
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: mockUserId,
          title: 'Audit Completed',
          message: 'Your website audit has completed successfully',
          type: 'success',
          createdAt: new Date('2023-06-01T12:00:00Z'),
          read: false,
          metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
        },
      ];
      
      // Mock Prisma response
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      
      // Call the service method with read filter
      const result = await NotificationService.getNotifications(mockUserId, { 
        limit: 10,
        read: false,
      });
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // Verify result
      expect(result).toEqual(mockNotifications);
    });

    it('should handle errors when retrieving notifications', async () => {
      // Mock Prisma error
      mockPrisma.notification.findMany.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.getNotifications(mockUserId, { limit: 10 }))
        .rejects.toThrow('Failed to retrieve notifications: Database error');
    });
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      // Mock notification data
      const mockNotification = {
        id: 'notif-1',
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        read: false,
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      };
      
      // Mock Prisma response
      mockPrisma.notification.create.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await NotificationService.createNotification({
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      });
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: 'Audit Completed',
          message: 'Your website audit has completed successfully',
          type: 'success',
          read: false,
          metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
        },
      });
      
      // Verify result
      expect(result).toEqual(mockNotification);
    });

    it('should handle errors when creating a notification', async () => {
      // Mock Prisma error
      mockPrisma.notification.create.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.createNotification({
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
      })).rejects.toThrow('Failed to create notification: Database error');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      // Mock notification data
      const mockNotification = {
        id: 'notif-1',
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        read: true,
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      };
      
      // Mock Prisma response
      mockPrisma.notification.update.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await NotificationService.markAsRead('notif-1', mockUserId);
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: mockUserId },
        data: { read: true },
      });
      
      // Verify result
      expect(result).toEqual(mockNotification);
    });

    it('should handle errors when marking a notification as read', async () => {
      // Mock Prisma error
      mockPrisma.notification.update.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.markAsRead('notif-1', mockUserId))
        .rejects.toThrow('Failed to mark notification as read: Database error');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      // Mock Prisma response
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 2 });
      
      // Call the service method
      const result = await NotificationService.markAllAsRead(mockUserId);
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, read: false },
        data: { read: true },
      });
      
      // Verify result
      expect(result).toEqual({ count: 2 });
    });

    it('should handle errors when marking all notifications as read', async () => {
      // Mock Prisma error
      mockPrisma.notification.updateMany.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.markAllAsRead(mockUserId))
        .rejects.toThrow('Failed to mark all notifications as read: Database error');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      // Mock notification data
      const mockNotification = {
        id: 'notif-1',
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        read: false,
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      };
      
      // Mock Prisma response
      mockPrisma.notification.delete.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await NotificationService.deleteNotification('notif-1', mockUserId);
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: mockUserId },
      });
      
      // Verify result
      expect(result).toEqual(mockNotification);
    });

    it('should handle errors when deleting a notification', async () => {
      // Mock Prisma error
      mockPrisma.notification.delete.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.deleteNotification('notif-1', mockUserId))
        .rejects.toThrow('Failed to delete notification: Database error');
    });
  });

  describe('sendNotification', () => {
    it('should send a notification via multiple channels', async () => {
      // Mock user data with notification preferences
      const mockUser = {
        id: mockUserId,
        email: 'user@example.com',
        notificationPreferences: {
          email: true,
          inApp: true,
          webhook: true,
        },
        webhookUrl: 'https://example.com/webhook',
      };
      
      // Mock website data
      const mockWebsite = {
        id: mockWebsiteId,
        name: 'Example Website',
        url: 'https://example.com',
      };
      
      // Mock notification data
      const mockNotification = {
        id: 'notif-1',
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        read: false,
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      };
      
      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite as any);
      mockPrisma.notification.create.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await NotificationService.sendNotification({
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        metadata: { auditId: 'audit-123', websiteId: mockWebsiteId },
      });
      
      // Verify user and website data was fetched
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      
      expect(mockPrisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: mockWebsiteId },
      });
      
      // Verify notification was created
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      
      // Verify email was sent
      expect(require('@/lib/email').sendEmail).toHaveBeenCalled();
      
      // Verify webhook was called
      expect(require('@/lib/services/webhook-service').WebhookService.sendWebhookNotification).toHaveBeenCalled();
      
      // Verify result
      expect(result).toEqual({
        success: true,
        notification: mockNotification,
        channels: ['inApp', 'email', 'webhook'],
      });
    });

    it('should respect user notification preferences', async () => {
      // Mock user data with limited notification preferences
      const mockUser = {
        id: mockUserId,
        email: 'user@example.com',
        notificationPreferences: {
          email: false,
          inApp: true,
          webhook: false,
        },
      };
      
      // Mock notification data
      const mockNotification = {
        id: 'notif-1',
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        createdAt: new Date('2023-06-01T12:00:00Z'),
        read: false,
        metadata: { auditId: 'audit-123' },
      };
      
      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrisma.notification.create.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await NotificationService.sendNotification({
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
        metadata: { auditId: 'audit-123' },
      });
      
      // Verify notification was created
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      
      // Verify email was NOT sent
      expect(require('@/lib/email').sendEmail).not.toHaveBeenCalled();
      
      // Verify webhook was NOT called
      expect(require('@/lib/services/webhook-service').WebhookService.sendWebhookNotification).not.toHaveBeenCalled();
      
      // Verify result
      expect(result).toEqual({
        success: true,
        notification: mockNotification,
        channels: ['inApp'],
      });
    });

    it('should handle errors when sending a notification', async () => {
      // Mock Prisma error
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.sendNotification({
        userId: mockUserId,
        title: 'Audit Completed',
        message: 'Your website audit has completed successfully',
        type: 'success',
      })).rejects.toThrow('Failed to send notification: Database error');
    });
  });

  describe('getUnreadCount', () => {
    it('should get the count of unread notifications for a user', async () => {
      // Mock Prisma response
      mockPrisma.notification.count.mockResolvedValue(5);
      
      // Call the service method
      const result = await NotificationService.getUnreadCount(mockUserId);
      
      // Verify Prisma was called correctly
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, read: false },
      });
      
      // Verify result
      expect(result).toEqual(5);
    });

    it('should handle errors when getting unread count', async () => {
      // Mock Prisma error
      mockPrisma.notification.count.mockRejectedValue(new Error('Database error'));
      
      // Call the service method and expect it to throw
      await expect(NotificationService.getUnreadCount(mockUserId))
        .rejects.toThrow('Failed to get unread notification count: Database error');
    });
  });
});
