// lib/types/notification.ts
// Types for notifications in the AutomatIQ platform

/**
 * Notification types
 */
export enum NotificationType {
  AUDIT_COMPLETED = 'AUDIT_COMPLETED',
  SCORE_ALERT = 'SCORE_ALERT',
  SCORE_DROP = 'SCORE_DROP',
  CATEGORY_DROP = 'CATEGORY_DROP',
  CRITICAL_ISSUE = 'CRITICAL_ISSUE',
  MONITORING_ALERT = 'MONITORING_ALERT',
  SYSTEM = 'SYSTEM'
}

/**
 * Notification channels
 */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK'
}

/**
 * Notification priorities
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Notification model
 */
export interface Notification {
  id: string;
  userId: string;
  websiteId: string;
  auditId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  read: boolean;
  readAt?: Date;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create notification input
 */
export interface CreateNotificationInput {
  userId: string;
  websiteId: string;
  auditId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  data?: any;
}

/**
 * Notification filter options
 */
export interface NotificationFilterOptions {
  userId: string;
  websiteId?: string;
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
}
