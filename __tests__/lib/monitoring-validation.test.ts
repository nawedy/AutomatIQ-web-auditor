// __tests__/lib/monitoring-validation.test.ts
// Unit tests for monitoring validation utilities

import { NextResponse } from 'next/server';
import { validateWebsiteAccess, validatePaginationParams, validateAlertIds, safeDisconnect } from '@/lib/monitoring-validation';
import { PrismaClient } from '@prisma/client';

// Mock Next.js response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      options,
      headers: new Map()
    }))
  }
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    website: {
      findFirst: jest.fn()
    },
    $disconnect: jest.fn().mockResolvedValue(undefined)
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock validation-utils
jest.mock('@/lib/validation-utils', () => ({
  isValidUUID: jest.fn((uuid) => {
    // Simple UUID validation for testing
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  })
}));

describe('Monitoring Validation Utilities', () => {
  let prisma: any;
  
  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });
  
  describe('validateWebsiteAccess', () => {
    it('should return invalid if websiteId is not provided', async () => {
      const result = await validateWebsiteAccess(null, 'user-123', false);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Website ID is required');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    });
    
    it('should return invalid if websiteId is not a valid UUID', async () => {
      const result = await validateWebsiteAccess('not-a-uuid', 'user-123', false);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid website ID format');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid website ID format' },
        { status: 400 }
      );
    });
    
    it('should return invalid if website is not found', async () => {
      prisma.website.findFirst.mockResolvedValue(null);
      
      const result = await validateWebsiteAccess(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-123',
        false
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Website not found or you do not have permission to access it');
      expect(prisma.website.findFirst).toHaveBeenCalledWith({
        where: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          OR: [{ userId: 'user-123' }]
        }
      });
    });
    
    it('should return valid if website is found for regular user', async () => {
      const mockWebsite = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test Website' };
      prisma.website.findFirst.mockResolvedValue(mockWebsite);
      
      const result = await validateWebsiteAccess(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-123',
        false
      );
      
      expect(result.isValid).toBe(true);
      expect(result.website).toBe(mockWebsite);
      expect(prisma.website.findFirst).toHaveBeenCalledWith({
        where: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          OR: [{ userId: 'user-123' }]
        }
      });
    });
    
    it('should allow admin to access any website', async () => {
      const mockWebsite = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test Website' };
      prisma.website.findFirst.mockResolvedValue(mockWebsite);
      
      const result = await validateWebsiteAccess(
        '123e4567-e89b-12d3-a456-426614174000',
        'admin-123',
        true
      );
      
      expect(result.isValid).toBe(true);
      expect(result.website).toBe(mockWebsite);
      expect(prisma.website.findFirst).toHaveBeenCalledWith({
        where: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          OR: [{ userId: 'admin-123' }, { id: { not: '' } }]
        }
      });
    });
  });
  
  describe('validatePaginationParams', () => {
    it('should use default values if no params provided', () => {
      const result = validatePaginationParams(null, null);
      
      expect(result.isValid).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });
    
    it('should return invalid if limit is not a positive number', () => {
      const result = validatePaginationParams('-5', null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Limit must be a positive number');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Limit must be a positive number' },
        { status: 400 }
      );
    });
    
    it('should return invalid if offset is negative', () => {
      const result = validatePaginationParams('10', '-5');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Offset must be a non-negative number');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Offset must be a non-negative number' },
        { status: 400 }
      );
    });
    
    it('should cap limit to 100', () => {
      const result = validatePaginationParams('500', '0');
      
      expect(result.isValid).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });
    
    it('should parse valid pagination params', () => {
      const result = validatePaginationParams('20', '40');
      
      expect(result.isValid).toBe(true);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
    });
  });
  
  describe('validateAlertIds', () => {
    it('should return invalid if alertIds is not provided', () => {
      const result = validateAlertIds(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Alert IDs are required and must be a non-empty array');
    });
    
    it('should return invalid if alertIds is not an array', () => {
      const result = validateAlertIds('not-an-array');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Alert IDs are required and must be a non-empty array');
    });
    
    it('should return invalid if alertIds is an empty array', () => {
      const result = validateAlertIds([]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Alert IDs are required and must be a non-empty array');
    });
    
    it('should return invalid if any alertId is not a valid UUID', () => {
      const result = validateAlertIds([
        '123e4567-e89b-12d3-a456-426614174000',
        'not-a-uuid'
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid alert ID format: not-a-uuid');
    });
    
    it('should return valid for valid alert IDs', () => {
      const result = validateAlertIds([
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174000'
      ]);
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('safeDisconnect', () => {
    it('should disconnect Prisma client safely', async () => {
      await safeDisconnect();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
    
    it('should handle disconnect errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      prisma.$disconnect.mockRejectedValue(new Error('Disconnect error'));
      
      await safeDisconnect();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error disconnecting from database:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});
