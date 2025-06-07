// src/__tests__/components/notifications/notification-center.test.tsx
// Unit tests for the Notification Center component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { NotificationService } from '@/lib/services/notification-service';

// Mock dependencies
jest.mock('@/lib/services/notification-service', () => ({
  NotificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Audit Completed',
      message: 'Your website audit has completed successfully',
      type: 'success',
      createdAt: '2023-06-01T12:00:00Z',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Alert Triggered',
      message: 'Performance score dropped below threshold',
      type: 'warning',
      createdAt: '2023-05-31T10:00:00Z',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Scheduled Audit',
      message: 'Your next scheduled audit will run tomorrow',
      type: 'info',
      createdAt: '2023-05-30T09:00:00Z',
      read: true,
    },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service methods
    (NotificationService.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (NotificationService.markAsRead as jest.Mock).mockResolvedValue({ success: true });
    (NotificationService.markAllAsRead as jest.Mock).mockResolvedValue({ success: true });
    (NotificationService.deleteNotification as jest.Mock).mockResolvedValue({ success: true });
  });

  it('renders notification button with badge count', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      // Check that the notification button is rendered with correct badge count (2 unread)
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('opens notification panel when clicked', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Click notification button
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Check that notification panel is displayed
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Audit Completed')).toBeInTheDocument();
    expect(screen.getByText('Alert Triggered')).toBeInTheDocument();
    expect(screen.getByText('Scheduled Audit')).toBeInTheDocument();
  });

  it('marks notification as read when clicked', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Click on a notification
    fireEvent.click(screen.getByText('Audit Completed'));
    
    // Verify notification was marked as read
    await waitFor(() => {
      expect(NotificationService.markAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('marks all notifications as read', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Click "Mark all as read" button
    fireEvent.click(screen.getByText('Mark all as read'));
    
    // Verify all notifications were marked as read
    await waitFor(() => {
      expect(NotificationService.markAllAsRead).toHaveBeenCalled();
    });
    
    // Check that badge count is updated
    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });
  });

  it('deletes notification when delete button is clicked', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Find and click delete button for first notification
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Verify notification was deleted
    await waitFor(() => {
      expect(NotificationService.deleteNotification).toHaveBeenCalledWith('notif-1');
    });
  });

  it('filters notifications by type', async () => {
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Click on filter dropdown
    fireEvent.click(screen.getByText('All'));
    
    // Select "Warning" filter
    fireEvent.click(screen.getByText('Warning'));
    
    // Verify only warning notifications are shown
    expect(screen.getByText('Alert Triggered')).toBeInTheDocument();
    expect(screen.queryByText('Audit Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Scheduled Audit')).not.toBeInTheDocument();
  });

  it('handles empty notifications state', async () => {
    // Mock empty notifications
    (NotificationService.getNotifications as jest.Mock).mockResolvedValue([]);
    
    render(<NotificationCenter />);
    
    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Check for empty state message
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock service error
    (NotificationService.getNotifications as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch notifications')
    );
    
    render(<NotificationCenter />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    
    // Check for error message
    expect(screen.getByText(/error loading notifications/i)).toBeInTheDocument();
  });

  it('refreshes notifications periodically', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    render(<NotificationCenter />);
    
    // Wait for initial notifications to load
    await waitFor(() => {
      expect(NotificationService.getNotifications).toHaveBeenCalledTimes(1);
    });
    
    // Fast-forward 60 seconds
    jest.advanceTimersByTime(60000);
    
    // Verify notifications are refreshed
    expect(NotificationService.getNotifications).toHaveBeenCalledTimes(2);
    
    // Clean up
    jest.useRealTimers();
  });
});
