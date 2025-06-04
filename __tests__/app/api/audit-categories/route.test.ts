// __tests__/app/api/audit-categories/route.test.ts
// Tests for the audit categories API route

// Import common mocks
import '../../../setup/next-mocks';
import { mockUser } from '../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/audit-categories/route';
import { prisma } from '@/lib/db';

describe('Audit Categories API Route', () => {
  const mockAdminUser = { id: 'admin-123', email: 'admin@example.com', role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/audit-categories', () => {
    it('should return all categories with their checks', async () => {
      // Mock data
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'SEO',
          description: 'Search Engine Optimization checks',
          slug: 'seo',
          checks: [
            {
              id: 'check-1',
              name: 'Title Check',
              description: 'Checks if the page has a title tag',
              weight: 10,
            },
            {
              id: 'check-2',
              name: 'Meta Description Check',
              description: 'Checks if the page has a meta description',
              weight: 8,
            },
          ],
        },
        {
          id: 'cat-2',
          name: 'Performance',
          description: 'Website performance checks',
          slug: 'performance',
          checks: [
            {
              id: 'check-3',
              name: 'Image Optimization',
              description: 'Checks if images are optimized',
              weight: 9,
            },
          ],
        },
      ];

      // Mock dependencies
      (prisma.auditCategory.findMany as jest.Mock).mockResolvedValue(mockCategories);

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories');

      // Execute
      const response = await GET(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ categories: mockCategories });
      expect(prisma.auditCategory.findMany).toHaveBeenCalledWith({
        include: {
          checks: {
            select: {
              id: true,
              name: true,
              description: true,
              weight: true,
            },
          },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.auditCategory.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories');

      // Execute
      const response = await GET(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch audit categories' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/audit-categories', () => {
    const validRequestBody = {
      name: 'Security',
      description: 'Website security checks',
      slug: 'security',
    };

    it('should create a new category when user is admin', async () => {
      // Mock data
      const mockCategory = {
        id: 'cat-3',
        name: 'Security',
        description: 'Website security checks',
        slug: 'security',
      };

      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditCategory.create as jest.Mock).mockResolvedValue(mockCategory);

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ category: mockCategory });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { role: true },
      });
      expect(prisma.auditCategory.findFirst).toHaveBeenCalledWith({
        where: { slug: validRequestBody.slug },
      });
      expect(prisma.auditCategory.create).toHaveBeenCalledWith({
        data: validRequestBody,
      });
    });

    it('should return 403 when user is not admin', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized. Admin access required' });
    });

    it('should return 409 when category with slug already exists', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-cat',
        slug: validRequestBody.slug,
      });

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data).toEqual({ error: 'Category with this slug already exists' });
    });

    it('should return 400 for invalid request data', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);

      // Create mock request with invalid data (missing description)
      const invalidRequestBody = {
        name: 'Security',
        // Missing description
        slug: 'security',
      };

      const request = new NextRequest('http://localhost:3000/api/audit-categories', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
      });

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid request data');
      expect(data).toHaveProperty('details');
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.auditCategory.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.auditCategory.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audit-categories', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create audit category' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
