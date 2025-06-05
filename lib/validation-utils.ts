// src/lib/validation-utils.ts
// Utility functions for input validation

import { z } from 'zod';

/**
 * Validates a UUID string
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validates a URL string
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validates a webhook URL (must be HTTPS)
 */
export const isValidWebhookURL = (url: string | null | undefined): boolean => {
  if (!url) return true; // null/undefined is valid (no webhook)
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
};

/**
 * Monitoring config validation schema
 */
export const monitoringConfigSchema = z.object({
  websiteId: z.string().uuid({ message: "Invalid website ID format" }),
  enabled: z.boolean(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']),
  alertThreshold: z.number().int().min(1).max(100),
  metrics: z.array(z.string()).min(1).max(10),
  emailNotifications: z.boolean(),
  slackWebhook: z.string().url().nullable().optional()
});

/**
 * Alert IDs validation schema
 */
export const alertIdsSchema = z.object({
  alertIds: z.array(z.string().uuid({ message: "Invalid alert ID format" })).min(1),
  websiteId: z.string().uuid({ message: "Invalid website ID format" })
});

/**
 * Pagination parameters validation schema
 */
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0)
});

/**
 * Validate monitoring config input
 */
export const validateMonitoringConfig = (data: unknown) => {
  try {
    return { 
      success: true, 
      data: monitoringConfigSchema.parse(data) 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { 
      success: false, 
      error: 'Invalid input data' 
    };
  }
};

/**
 * Validate alert IDs input
 */
export const validateAlertIds = (data: unknown) => {
  try {
    return { 
      success: true, 
      data: alertIdsSchema.parse(data) 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { 
      success: false, 
      error: 'Invalid input data' 
    };
  }
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (limit?: string, offset?: string) => {
  const parsedLimit = limit ? parseInt(limit, 10) : 10;
  const parsedOffset = offset ? parseInt(offset, 10) : 0;
  
  try {
    return { 
      success: true, 
      data: paginationSchema.parse({ limit: parsedLimit, offset: parsedOffset }) 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { 
      success: false, 
      error: 'Invalid pagination parameters' 
    };
  }
};
