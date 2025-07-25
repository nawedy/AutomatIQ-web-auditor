// __tests__/app/api/audit-categories/[categoryId]/checks/route.test.ts
// Tests for the audit checks API route

// Import common mocks
import '../../../../../setup/next-mocks';
import { mockUser } from '../../../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/audit-categories/[categoryId]/checks/route';
import { prisma } from '@/lib/db';

describe('Audit Checks API Route', () => {
  const mockAdminUser = { id: 'admin-123', email: 'admin@example.com', role: 'ADMIN' };
  const mockCategoryId = 'cat-1';
  const mockParams = { categoryId: mockCategoryId };

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/audit-categories/[categoryId]/checks', () => {
    it('should return all checks for a category', async () => {
      // Mock data
      const mockChecks = [
        {
          id: 'check-1',
          name: 'Title Check',
          description: 'Checks if the page has a title tag',
          weight: 10,
          categoryId: mockCategoryId,
        },
        {
          id: 'check-2',
          name: 'Meta Description Check',
          description: 'Checks if the page has a meta description',
          weight: 8,
          categoryId: mockCategoryId,
        },
      ];

      // Mock dependencies
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue({
        id: mockCategoryId,
        name: 'SEO',
      });
      (prisma.auditCheck.findMany as jest.Mock).mockResolvedValue(mockChecks);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ checks: mockChecks });
      expect(prisma.auditCategory.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prisma.auditCheck.findMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
        orderBy: { weight: 'desc' },
      });
    });

    it('should return 404 if category not found', async () => {
      // Mock dependencies
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Category not found' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.auditCategory.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch audit checks' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/audit-categories/[categoryId]/checks', () => {
    const validRequestBody = {
      name: 'Robots.txt Check',
      description: 'Checks if the website has a robots.txt file',
      weight: 7,
    };

    it('should create a new check when user is admin', async () => {
      // Mock data
      const mockCheck = {
        id: 'check-3',
        name: 'Robots.txt Check',
        description: 'Checks if the website has a robots.txt file',
        weight: 7,
        categoryId: mockCategoryId,
      };

      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue({
        id: mockCategoryId,
        name: 'SEO',
      });
      (prisma.auditCheck.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditCheck.create as jest.Mock).mockResolvedValue(mockCheck);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ check: mockCheck });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { role: true },
      });
      expect(prisma.auditCategory.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prisma.auditCheck.findFirst).toHaveBeenCalledWith({
        where: {
          categoryId: mockCategoryId,
          name: validRequestBody.name,
        },
      });
      expect(prisma.auditCheck.create).toHaveBeenCalledWith({
        data: {
          ...validRequestBody,
          categoryId: mockCategoryId,
          severity: "medium",
        },
      });
    });

    it('should return 403 when user is not admin', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized. Admin access required' });
    });

    it('should return 404 if category not found', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Category not found' });
    });

    it('should return 409 when check with name already exists in category', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue({
        id: mockCategoryId,
        name: 'SEO',
      });
      (prisma.auditCheck.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-check',
        name: validRequestBody.name,
        categoryId: mockCategoryId,
      });

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data).toEqual({ error: 'Check with this name already exists in this category' });
    });

    it('should return 400 for invalid request data', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);

      // Create mock request with invalid data (missing description)
      const invalidRequestBody = {
        name: 'Robots.txt Check',
        // Missing description
        weight: 7,
      };

      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(invalidRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid request data');
      expect(data).toHaveProperty('details');
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findUnique as jest.Mock).mockResolvedValue({
        id: mockCategoryId,
        name: 'SEO',
      });
      (prisma.auditCheck.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditCheck.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audit-categories/${mockCategoryId}/checks`, {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create audit check' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
