// __tests__/lib/auth-utils.test.ts
// Tests for the authentication middleware

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('next-auth/next', () => ({
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

describe('Auth Middleware', () => {
  const mockUser = { 
    id: 'user-123', 
    email: 'user@example.com',
    name: 'Test User',
    role: 'user'
  };
  
  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  };
  
  const mockRequest = new NextRequest('http://localhost:3000/api/test');
  const mockParams = { id: 'test-123' };
  const mockContext = { params: mockParams };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should pass authenticated user to handler', async () => {
    // Mock session with authenticated user
    (getServerSession as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Create a mock handler
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );
    
    // Wrap handler with withAuth middleware
    const wrappedHandler = withAuth(mockHandler);
    
    // Execute
    const response = await wrappedHandler(mockRequest, mockContext);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(getServerSession).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(mockHandler).toHaveBeenCalledWith(
      mockRequest,
      mockContext,
      mockUser
    );
    expect(prisma.$use).toHaveBeenCalled();
  });
  
  it('should return 401 if user is not authenticated', async () => {
    // Mock session without user
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Create a mock handler
    const mockHandler = jest.fn();
    
    // Wrap handler with withAuth middleware
    const wrappedHandler = withAuth(mockHandler);
    
    // Execute
    const response = await wrappedHandler(mockRequest, mockContext);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(getServerSession).toHaveBeenCalled();
    expect(mockHandler).not.toHaveBeenCalled();
  });
  
  it('should return 401 if user is not found in database', async () => {
    // Mock session with user but user not found in database
    (getServerSession as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Create a mock handler
    const mockHandler = jest.fn();
    
    // Wrap handler with withAuth middleware
    const wrappedHandler = withAuth(mockHandler);
    
    // Execute
    const response = await wrappedHandler(mockRequest, mockContext);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(getServerSession).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });
  
  it('should set up Prisma middleware for Row-Level Security', async () => {
    // Mock session with authenticated user
    (getServerSession as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Create a mock handler
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );
    
    // Wrap handler with withAuth middleware
    const wrappedHandler = withAuth(mockHandler);
    
    // Execute
    await wrappedHandler(mockRequest, mockContext);
    
    // Assert that Prisma middleware was set up
    expect(prisma.$use).toHaveBeenCalled();
    
    // Get the middleware function
    const middlewareFunction = (prisma.$use as jest.Mock).mock.calls[0][0];
    
    // Test the middleware with a query that should be filtered
    const mockParams = {
      model: 'Website',
      action: 'findMany',
      args: {},
    };
    
    const result = await middlewareFunction(mockParams, () => Promise.resolve([]));
    
    // The middleware should have added a where clause with userId
    expect(mockParams.args).toEqual({
      where: {
        userId: mockUser.id,
      },
    });
  });
  
  it('should handle admin role correctly', async () => {
    // Mock session with admin user
    (getServerSession as jest.Mock).mockResolvedValue({
      user: mockAdmin,
    });
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
    
    // Create a mock handler that requires admin role
    const mockHandler = jest.fn().mockImplementation((req, ctx, user) => {
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    });
    
    // Wrap handler with withAuth middleware
    const wrappedHandler = withAuth(mockHandler);
    
    // Execute
    const response = await wrappedHandler(mockRequest, mockContext);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockHandler).toHaveBeenCalledWith(
      mockRequest,
      mockContext,
      mockAdmin
    );
  });
  
  it('should handle errors gracefully', async () => {
    // Mock session to throw error
    (getServerSession as jest.Mock).mockRejectedValue(new Error('Session error'));
    
    // Create a mock handler
    const mockHandler = jest.fn();
    
    // Wrap handler with withAuth middleware
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
