// src/lib/monitoring-validation.ts
// Specialized validation utilities for monitoring API routes

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isValidUUID } from './validation-utils';

const prisma = new PrismaClient();

/**
 * Validates website ID and user access
 * @returns Object with validation result and response if validation fails
 */
export async function validateWebsiteAccess(
  websiteId: string | null,
  userId: string,
  isAdmin: boolean
): Promise<{ 
  isValid: boolean; 
  error?: string;
  response?: NextResponse; 
  website?: any;
}> {
  // Check if websiteId is provided
  if (!websiteId) {
    return {
      isValid: false,
      error: 'Website ID is required',
      response: NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    };
  }

  // Validate UUID format
  if (!isValidUUID(websiteId)) {
    return {
      isValid: false,
      error: 'Invalid website ID format',
      response: NextResponse.json(
        { error: 'Invalid website ID format' },
        { status: 400 }
      )
    };
  }

  // Verify user has access to the website
  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        OR: [
          { userId },
          ...(isAdmin ? [{ id: { not: '' } }] : []) // If admin, allow access to all websites
        ]
      }
    });

    if (!website) {
      return {
        isValid: false,
        error: 'Website not found or you do not have permission to access it',
        response: NextResponse.json(
          { error: 'Website not found or you do not have permission to access it' },
          { status: 404 }
        )
      };
    }

    return {
      isValid: true,
      website
    };
  } catch (error) {
    console.error('Error validating website access:', error);
    return {
      isValid: false,
      error: `Failed to validate website access: ${(error as Error).message}`,
      response: NextResponse.json(
        { error: `Failed to validate website access: ${(error as Error).message}` },
        { status: 500 }
      )
    };
  }
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(
  limitParam: string | null,
  offsetParam: string | null
): { 
  limit: number; 
  offset: number;
  isValid: boolean;
  error?: string;
  response?: NextResponse;
} {
  let limit = 10;
  let offset = 0;
  
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return {
        limit,
        offset,
        isValid: false,
        error: 'Limit must be a positive number',
        response: NextResponse.json(
          { error: 'Limit must be a positive number' },
          { status: 400 }
        )
      };
    }
    
    // Cap the limit to prevent excessive queries
    limit = Math.min(parsedLimit, 100);
  }
  
  if (offsetParam) {
    const parsedOffset = parseInt(offsetParam, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return {
        limit,
        offset,
        isValid: false,
        error: 'Offset must be a non-negative number',
        response: NextResponse.json(
          { error: 'Offset must be a non-negative number' },
          { status: 400 }
        )
      };
    }
    offset = parsedOffset;
  }
  
  return {
    limit,
    offset,
    isValid: true
  };
}

/**
 * Validates alert IDs
 */
export function validateAlertIds(
  alertIds: any
): {
  success: boolean;
  error?: string;
  response?: NextResponse;
} {
  // Check if alertIds is provided and is an array
  if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
    return {
      success: false,
      error: 'Alert IDs are required and must be a non-empty array',
      response: NextResponse.json(
        { error: 'Alert IDs are required and must be a non-empty array' },
        { status: 400 }
      )
    };
  }
  
  // Validate each alert ID is a valid UUID
  for (const alertId of alertIds) {
    if (!isValidUUID(alertId)) {
      return {
        success: false,
        error: `Invalid alert ID format: ${alertId}`,
        response: NextResponse.json(
          { error: `Invalid alert ID format: ${alertId}` },
          { status: 400 }
        )
      };
    }
  }
  
  return {
    success: true
  };
}

/**
 * Safely disconnects Prisma client
 */
export async function safeDisconnect(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}
