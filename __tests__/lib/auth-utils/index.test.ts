// __tests__/lib/auth-utils/index.test.ts
// Tests for the authentication utilities

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    $use: jest.fn(),
  },
}));

describe('Auth Utilities', () => {
  describe('withAuth middleware', () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      return NextResponse.json({ success: true });
    });
    
    const mockRequest = new NextRequest('http://localhost:3000/api/test');
    const mockContext = { params: {} };
    
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call the handler with user when authenticated', async () => {
      // Mock data
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      };
      
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      };

      // Mock dependencies
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Create wrapped handler
      const wrappedHandler = withAuth(mockHandler);

      // Execute
      const response = await wrappedHandler(mockRequest, mockContext);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(getServerSession).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockSession.user.id },
      });
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockContext, mockUser);
      expect(prisma.$use).toHaveBeenCalled();
    });

    it('should return 401 when no session exists', async () => {
      // Mock dependencies
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create wrapped handler
      const wrappedHandler = withAuth(mockHandler);

      // Execute
      const response = await wrappedHandler(mockRequest, mockContext);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when session exists but user not found in database', async () => {
      // Mock data
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      };

      // Mock dependencies
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Create wrapped handler
      const wrappedHandler = withAuth(mockHandler);

      // Execute
      const response = await wrappedHandler(mockRequest, mockContext);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should set up Prisma middleware for Row-Level Security', async () => {
      // Mock data
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
      };
      
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      };

      // Mock dependencies
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Create wrapped handler
      const wrappedHandler = withAuth(mockHandler);

      // Execute
      await wrappedHandler(mockRequest, mockContext);

      // Assert
      expect(prisma.$use).toHaveBeenCalled();
      
      // Get the middleware function that was passed to $use
      const middlewareFunction = (prisma.$use as jest.Mock).mock.calls[0][0];
      
      // Test the middleware function with a params object for a model with userId field
      const paramsWithUserId = {
        model: 'Website',
        action: 'findMany',
        args: { where: {} },
      };
      
      const resultWithUserId = middlewareFunction(paramsWithUserId);
      
      // The middleware should add userId filter for models with userId field
      expect(resultWithUserId.args.where.userId).toBe(mockUser.id);
      
      // Test the middleware function with a params object for a model without userId field
      const paramsWithoutUserId = {
        model: 'AuditCategory',
        action: 'findMany',
        args: { where: {} },
      };
      
      const resultWithoutUserId = middlewareFunction(paramsWithoutUserId);
      
      // The middleware should not modify args for models without userId field
      expect(resultWithoutUserId.args.where.userId).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (getServerSession as jest.Mock).mockRejectedValue(new Error('Authentication error'));

      // Create wrapped handler
      const wrappedHandler = withAuth(mockHandler);

      // Execute
      const response = await wrappedHandler(mockRequest, mockContext);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});
