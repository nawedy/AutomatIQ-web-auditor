// app/api/notifications/route.ts
// API route for managing user notifications

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '../../../lib/prisma';
import { NotificationService } from '@/lib/services/notification-service';

/**
 * Get notifications for the authenticated user
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const websiteId = searchParams.get('websiteId');
    const onlyUnread = searchParams.get('unread') === 'true';
    
    const notificationService = new NotificationService(prisma);
    
    // Get notifications with pagination
    const notifications = await notificationService.getNotifications(
      user.id,
      page,
      limit,
      websiteId || undefined,
      onlyUnread
    );
    
    // Get unread count
    const unreadCount = await notificationService.getUnreadCount(user.id);
    
    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        total: notifications.length,
        page,
        limit,
        totalPages: Math.ceil(notifications.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
});

/**
 * Mark notifications as read
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { notificationIds, markAll } = await request.json();
    
    const notificationService = new NotificationService(prisma);
    
    if (markAll) {
      // Mark all notifications as read
      await notificationService.markAllAsRead(user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Notification(s) marked as read'
      });
    } else if (notificationIds?.length) {
      // Mark specific notifications as read
      await notificationService.markAsRead(notificationIds, user.id);
      
      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) marked as read`
      });
    }
    
    return NextResponse.json(
      { error: 'No notification IDs provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
});

/**
 * Delete notifications
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { notificationIds, deleteAll } = await request.json();
    
    const notificationService = new NotificationService(prisma);
    
    if (deleteAll) {
      // Delete all notifications for the user
      await notificationService.deleteAllNotifications(user.id);
      
      return NextResponse.json({
        success: true,
        message: 'All notifications deleted'
      });
    } else if (notificationIds?.length) {
      // Delete specific notifications
      await notificationService.deleteNotifications(notificationIds, user.id);
      
      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) deleted`
      });
    }
    
    return NextResponse.json(
      { error: 'No notification IDs provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
});
