// __tests__/app/api/audits/[id]/results/route.test.ts
// Tests for the audit results API route

// Import common mocks
import '../../../../../setup/next-mocks';
import { mockUser } from '../../../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { PrismaAuditService } from '@/lib/services/prisma-audit-service';

// Import the handler after mocking
import { GET } from '@/app/api/audits/[id]/results/route';

describe('Audit Results API Route', () => {
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

  describe('GET /api/audits/[id]/results', () => {
    it('should return audit progress when progress=true query param is provided', async () => {
      // Mock data
      const mockProgress = {
        status: 'running',
        progress: 50,
        startedAt: new Date(),
        completedAt: null,
      };

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue({
        id: mockAuditId,
        websiteId: 'website-123',
        website: { userId: mockUser.id },
      });
      
      // Create a mock instance of PrismaAuditService with getAuditProgress method
      const mockGetAuditProgress = jest.fn().mockResolvedValue(mockProgress);
      const mockAuditServiceInstance = { getAuditProgress: mockGetAuditProgress };
      (PrismaAuditService as jest.Mock).mockImplementation(() => mockAuditServiceInstance);

      // Create mock request with progress=true query param
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/results?progress=true`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockProgress);
      expect(prisma.audit.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockAuditId,
          website: {
            userId: mockUser.id,
          },
        },
      });
      expect(PrismaAuditService).toHaveBeenCalled();
      expect(mockGetAuditProgress).toHaveBeenCalledWith(mockAuditId);
    });

    it('should return filtered audit results with pagination', async () => {
      // Mock data
      const mockResults = [
        {
          id: 'result-1',
          status: 'failed',
          severity: 'high',
          message: 'Missing title tag',
          check: {
            id: 'check-1',
            name: 'Title Check',
            category: { id: 'cat-1', name: 'SEO' },
          },
        },
      ];
      
      const totalCount = 18;
      
      const mockCategoryStats = [
        { status: 'passed', _count: { id: 10 } },
        { status: 'failed', _count: { id: 5 } },
        { status: 'warning', _count: { id: 3 } },
      ];
      
      const mockSeverityStats = [
        { severity: 'high', _count: { id: 5 } },
        { severity: 'medium', _count: { id: 8 } },
        { severity: 'low', _count: { id: 5 } },
      ];

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue({
        id: mockAuditId,
        websiteId: 'website-123',
        website: { userId: mockUser.id },
      });
      
      (prisma.auditResult.findMany as jest.Mock).mockResolvedValue(mockResults);
      (prisma.auditResult.count as jest.Mock).mockResolvedValue(totalCount);
      
      // First call for category stats, second for severity stats
      (prisma.auditResult.groupBy as jest.Mock)
        .mockResolvedValueOnce(mockCategoryStats)
        .mockResolvedValueOnce(mockSeverityStats);

      // Create mock request with filter params
      const request = new NextRequest(
        `http://localhost:3000/api/audits/${mockAuditId}/results?categoryId=cat-1&status=failed&severity=high&page=1&pageSize=10`
      );

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        results: mockResults,
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount,
          totalPages: Math.ceil(totalCount / 10),
        },
        stats: {
          categories: mockCategoryStats,
          severities: mockSeverityStats,
        },
      });
      
      // Check that the where clause is constructed correctly
      const whereClause = {
        auditId: mockAuditId,
        check: {
          categoryId: 'cat-1',
        },
        status: 'failed',
        severity: 'high',
      };
      
      expect(prisma.auditResult.findMany).toHaveBeenCalledWith({
        where: whereClause,
        include: {
          check: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'asc' },
        ],
        skip: 0,
        take: 10,
      });
      
      expect(prisma.auditResult.count).toHaveBeenCalledWith({
        where: whereClause,
      });
    });

    it('should return 404 if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/results`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Audit not found' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.audit.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/results`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to process audit request' });
    });
  });
});
