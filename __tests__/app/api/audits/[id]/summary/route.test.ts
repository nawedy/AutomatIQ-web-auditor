// __tests__/app/api/audits/[id]/summary/route.test.ts
// Tests for the audit summary API route

// Import common mocks
import '../../../../../setup/next-mocks';
import { mockUser } from '../../../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Import the handler after mocking
import { GET, POST } from '@/app/api/audits/[id]/summary/route';

describe('Audit Summary API Route', () => {
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

  describe('GET /api/audits/[id]/summary', () => {
    it('should return audit summary with category scores', async () => {
      // Mock data
      const mockAudit = {
        id: mockAuditId,
        websiteId: 'website-123',
        website: { 
          userId: mockUser.id,
          url: 'https://example.com',
          name: 'Example Website'
        },
      };

      const mockSummary = {
        id: 'summary-123',
        auditId: mockAuditId,
        overallScore: 85,
        totalPages: 20,
        totalIssues: 15,
        highSeverityIssues: 3,
        mediumSeverityIssues: 7,
        lowSeverityIssues: 5,
        completedAt: new Date(),
      };

      const mockCategoryScores = [
        {
          id: 'score-1',
          auditSummaryId: 'summary-123',
          categoryId: 'cat-1',
          score: 90,
          issueCount: 3,
          passedCount: 12,
          warningCount: 1,
          errorCount: 2,
          category: { id: 'cat-1', name: 'SEO', slug: 'seo' },
        },
        {
          id: 'score-2',
          auditSummaryId: 'summary-123',
          categoryId: 'cat-2',
          score: 75,
          issueCount: 5,
          passedCount: 8,
          warningCount: 2,
          errorCount: 3,
          category: { id: 'cat-2', name: 'Performance', slug: 'performance' },
        },
      ];

      const mockIssueCounts = [
        { severity: 'high', _count: { id: 3 } },
        { severity: 'medium', _count: { id: 7 } },
        { severity: 'low', _count: { id: 5 } },
      ];

      const mockPageCounts = [
        { status: 'completed', _count: { id: 18 } },
        { status: 'error', _count: { id: 2 } },
      ];

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
      (prisma.auditSummary.findUnique as jest.Mock).mockResolvedValue(mockSummary);
      (prisma.auditCategoryScore.findMany as jest.Mock).mockResolvedValue(mockCategoryScores);
      (prisma.auditResult.groupBy as jest.Mock).mockResolvedValue(mockIssueCounts);
      (prisma.page.groupBy as jest.Mock).mockResolvedValue(mockPageCounts);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        audit: mockAudit,
        summary: {
          ...mockSummary,
          categoryScores: mockCategoryScores,
          issueCounts: mockIssueCounts,
          pageCounts: mockPageCounts,
        },
      });
      
      expect(prisma.audit.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockAuditId,
          website: {
            userId: mockUser.id,
          },
        },
        include: {
          website: true,
        },
      });
    });

    it('should return 404 if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`);

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
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch audit summary' });
    });
  });

  describe('POST /api/audits/[id]/summary', () => {
    it('should generate or update an audit summary', async () => {
      // Mock data
      const mockAudit = {
        id: mockAuditId,
        websiteId: 'website-123',
        website: { userId: mockUser.id },
      };

      const mockCategories = [
        { id: 'cat-1', name: 'SEO', slug: 'seo' },
        { id: 'cat-2', name: 'Performance', slug: 'performance' },
      ];

      const mockAuditResults = [
        { 
          id: 'result-1', 
          status: 'passed', 
          severity: 'low',
          check: { 
            id: 'check-1', 
            categoryId: 'cat-1',
            category: { id: 'cat-1', name: 'SEO', slug: 'seo' } 
          } 
        },
        { 
          id: 'result-2', 
          status: 'failed', 
          severity: 'high',
          check: { 
            id: 'check-2', 
            categoryId: 'cat-2',
            category: { id: 'cat-2', name: 'Performance', slug: 'performance' } 
          } 
        },
      ];

      const mockPages = [
        { id: 'page-1', url: 'https://example.com/' },
        { id: 'page-2', url: 'https://example.com/about' },
      ];

      const mockSummary = {
        id: 'summary-123',
        auditId: mockAuditId,
        overallScore: 75,
        totalPages: 2,
        totalIssues: 1,
        highSeverityIssues: 1,
        mediumSeverityIssues: 0,
        lowSeverityIssues: 0,
        completedAt: expect.any(Date),
      };

      const mockUpdatedSummary = {
        ...mockSummary,
        categoryScores: [
          {
            auditSummaryId: 'summary-123',
            categoryId: 'cat-1',
            score: 100,
            issueCount: 0,
            passedCount: 1,
            warningCount: 0,
            errorCount: 0,
            category: { id: 'cat-1', name: 'SEO', slug: 'seo' },
          },
          {
            auditSummaryId: 'summary-123',
            categoryId: 'cat-2',
            score: 50,
            issueCount: 1,
            passedCount: 0,
            warningCount: 0,
            errorCount: 1,
            category: { id: 'cat-2', name: 'Performance', slug: 'performance' },
          },
        ],
      };

      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(mockAudit);
      (prisma.auditCategory.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.auditResult.findMany as jest.Mock).mockResolvedValue(mockAuditResults);
      (prisma.page.findMany as jest.Mock).mockResolvedValue(mockPages);
      (prisma.auditSummary.upsert as jest.Mock).mockResolvedValue(mockSummary);
      (prisma.auditSummary.findUnique as jest.Mock).mockResolvedValue(mockUpdatedSummary);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`, {
        method: 'POST',
      });

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ summary: mockUpdatedSummary });
      
      expect(prisma.audit.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockAuditId,
          website: {
            userId: mockUser.id,
          },
        },
      });
      
      expect(prisma.auditSummary.upsert).toHaveBeenCalled();
      expect(prisma.audit.update).toHaveBeenCalledWith({
        where: { id: mockAuditId },
        data: { 
          status: 'completed',
          completedAt: expect.any(Date),
        },
      });
    });

    it('should return 404 if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findFirst as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`, {
        method: 'POST',
      });

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Audit not found' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.audit.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/audits/${mockAuditId}/summary`, {
        method: 'POST',
      });

      // Execute
      const response = await POST(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to generate audit summary' });
    });
  });
});
