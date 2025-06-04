// __tests__/app/api/audits/[id]/pages/route.test.ts
// Tests for the audit pages API route

// Import common mocks
import '../../../../../setup/next-mocks';
import { mockUser } from '../../../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Import the handler after mocking
import { GET } from '@/app/api/audits/[id]/pages/route';

describe('Audit Pages API Route', () => {
  const mockAuditId = 'audit-123';
  const mockParams = { id: mockAuditId };

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/audits/[id]/pages', () => {
    it('should return pages with pagination and filtering', async () => {
      // Mock data
      const mockPages = [
        {
          id: 'page-1',
          url: 'https://example.com/about',
          title: 'About Us',
          status: 'completed',
          depth: 1,
          auditId: mockAuditId,
          pageAuditResults: [],
        },
        {
          id: 'page-2',
          url: 'https://example.com/contact',
          title: 'Contact Us',
          status: 'completed',
          depth: 1,
          auditId: mockAuditId,
          pageAuditResults: [],
        },
      ];
      
      const mockStatusStats = [
        { status: 'completed', _count: { id: 15 } },
        { status: 'pending', _count: { id: 3 } },
        { status: 'error', _count: { id: 2 } },
      ];
      
      const mockStatusCodeStats = [
        { statusCode: 200, _count: { id: 18 } },
        { statusCode: 404, _count: { id: 2 } },
      ];

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue({
        id: mockAuditId,
        websiteId: 'website-123',
        website: { userId: mockUser.id },
      });
      
      (prisma.page.findMany as jest.Mock).mockResolvedValue(mockPages);
      (prisma.page.count as jest.Mock).mockResolvedValue(20);
      
      // Mock status groupBy
      (prisma.page.groupBy as jest.Mock).mockImplementation((params) => {
        if (params.by[0] === 'status') {
          return Promise.resolve(mockStatusStats);
        } else if (params.by[0] === 'statusCode') {
          return Promise.resolve(mockStatusCodeStats);
        }
        return Promise.resolve([]);
      });

      // Create mock request with filter params
      const request = new NextRequest(
        `http://localhost:3000/api/audits/${mockAuditId}/pages?url=example&status=completed&page=1&pageSize=10&sortBy=url&sortOrder=asc`
      );

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        pages: mockPages,
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount: 20,
          totalPages: 2,
        },
        stats: {
          statuses: mockStatusStats,
          statusCodes: mockStatusCodeStats,
        },
      });
      
      expect(prisma.page.findMany).toHaveBeenCalledWith({
        where: {
          auditId: mockAuditId,
          url: {
            contains: 'example',
            mode: 'insensitive',
          },
          status: 'completed',
        },
        skip: 0,
        take: 10,
        orderBy: {
          url: 'asc',
        },
        include: {
          pageAuditResults: {
            include: {
              check: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return 404 if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/pages`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Audit not found' });
    });

    it('should return 404 if audit does not belong to user', async () => {
      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/pages`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Audit not found' });
    });

    it('should use default pagination and sorting when not specified', async () => {
      // Mock data
      const mockPages = [
        {
          id: 'page-1',
          url: 'https://example.com/',
          title: 'Home',
          status: 'completed',
          depth: 0,
          auditId: mockAuditId,
          pageAuditResults: [],
        },
      ];
      
      const mockStatusStats = [
        { status: 'completed', _count: { id: 1 } },
      ];
      
      const mockStatusCodeStats = [
        { statusCode: 200, _count: { id: 1 } },
      ];

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue({
        id: mockAuditId,
        websiteId: 'website-123',
        website: { userId: mockUser.id },
      });
      
      (prisma.page.findMany as jest.Mock).mockResolvedValue(mockPages);
      (prisma.page.count as jest.Mock).mockResolvedValue(1);
      
      // Mock status groupBy
      (prisma.page.groupBy as jest.Mock).mockImplementation((params) => {
        if (params.by[0] === 'status') {
          return Promise.resolve(mockStatusStats);
        } else if (params.by[0] === 'statusCode') {
          return Promise.resolve(mockStatusCodeStats);
        }
        return Promise.resolve([]);
      });

      // Create mock request with no query params
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/pages`);

      // Execute
      const response = await GET(request, { params: mockParams });
      
      // Assert
      expect(response.status).toBe(200);
      expect(prisma.page.findMany).toHaveBeenCalledWith({
        where: {
          auditId: mockAuditId,
        },
        skip: 0,
        take: 50, // Default pageSize
        orderBy: {
          url: 'asc', // Default sort
        },
        include: {
          pageAuditResults: {
            include: {
              check: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.audit.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/pages`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch audit pages' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
