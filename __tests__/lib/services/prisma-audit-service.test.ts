// __tests__/lib/services/prisma-audit-service.test.ts
// Unit tests for PrismaAuditService

import { PrismaAuditService } from '@/lib/services/prisma-audit-service';
import { prisma } from '@/lib/db';
import { WebCrawler } from '@/lib/services/crawler';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    website: {
      findUnique: jest.fn(),
    },
    audit: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    auditCategory: {
      findMany: jest.fn(),
    },
    auditCheck: {
      findMany: jest.fn(),
    },
    auditResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    page: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    auditSummary: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    auditCategoryScore: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/crawler', () => ({
  WebCrawler: {
    normalizeUrl: jest.fn(),
    isValidUrl: jest.fn(),
  },
}));

jest.mock('@/lib/services/seo-analyzer', () => ({
  SEOAnalyzer: jest.fn().mockImplementation(() => ({
    analyze: jest.fn(),
  })),
}));

jest.mock('@/lib/services/performance-analyzer', () => ({
  PerformanceAnalyzer: jest.fn().mockImplementation(() => ({
    analyze: jest.fn(),
  })),
}));

jest.mock('@/lib/services/accessibility-analyzer', () => ({
  AccessibilityAnalyzer: jest.fn().mockImplementation(() => ({
    analyze: jest.fn(),
  })),
}));

describe('PrismaAuditService', () => {
  let auditService: PrismaAuditService;
  const mockUuid = '12345678-1234-1234-1234-123456789012';
  
  beforeEach(() => {
    jest.clearAllMocks();
    auditService = new PrismaAuditService();
    
    // Mock uuid generation
    jest.mock('uuid', () => ({
      v4: jest.fn().mockReturnValue(mockUuid),
    }));
  });

  describe('startAudit', () => {
    const websiteId = 'website-123';
    const userId = 'user-123';
    const websiteUrl = 'https://example.com';
    const options = {
      seo: true,
      performance: true,
      accessibility: true,
      security: false,
      bestPractices: true,
      mobile: false,
      content: true,
    };

    it('should start an audit successfully', async () => {
      // Mock dependencies
      (WebCrawler.normalizeUrl as jest.Mock).mockReturnValue(websiteUrl);
      (WebCrawler.isValidUrl as jest.Mock).mockReturnValue(true);
      
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({
        id: websiteId,
        url: websiteUrl,
        userId,
      });
      
      (prisma.audit.create as jest.Mock).mockResolvedValue({
        id: mockUuid,
        websiteId,
        status: 'pending',
        startedAt: expect.any(Date),
      });

      // Mock processAudit to avoid actually running it
      const processAuditSpy = jest.spyOn(auditService as any, 'processAudit')
        .mockImplementation(() => Promise.resolve());

      // Execute
      const result = await auditService.startAudit(websiteId, options);

      // Assert
      expect(result).toBe(mockUuid);
      expect(prisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
      expect(WebCrawler.normalizeUrl).toHaveBeenCalledWith(websiteUrl);
      expect(WebCrawler.isValidUrl).toHaveBeenCalledWith(websiteUrl);
      expect(prisma.audit.create).toHaveBeenCalledWith({
        data: {
          id: mockUuid,
          websiteId,
          status: 'pending',
          startedAt: expect.any(Date),
        },
      });
      expect(processAuditSpy).toHaveBeenCalledWith(mockUuid, websiteUrl, options);
    });

    it('should throw an error if website not found', async () => {
      // Mock dependencies
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(auditService.startAudit(websiteId, options))
        .rejects.toThrow('Failed to start audit: Website not found');
    });

    it('should throw an error if URL is invalid', async () => {
      // Mock dependencies
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({
        id: websiteId,
        url: 'invalid-url',
        userId,
      });
      
      (WebCrawler.normalizeUrl as jest.Mock).mockReturnValue('invalid-url');
      (WebCrawler.isValidUrl as jest.Mock).mockReturnValue(false);

      // Execute & Assert
      await expect(auditService.startAudit(websiteId, options))
        .rejects.toThrow('Failed to start audit: Invalid URL provided');
    });
  });

  describe('getAuditProgress', () => {
    const auditId = 'audit-123';

    it('should return audit progress for a pending audit', async () => {
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue({
        id: auditId,
        status: 'pending',
        startedAt: new Date(),
        completedAt: null,
        summary: null,
      });

      // Execute
      const result = await auditService.getAuditProgress(auditId);

      // Assert
      expect(result).toEqual({
        id: auditId,
        status: 'pending',
        progress: 0,
        startedAt: expect.any(Date),
        completedAt: null,
        summary: null,
      });
    });

    it('should return audit progress for a running audit', async () => {
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue({
        id: auditId,
        status: 'running',
        startedAt: new Date(),
        completedAt: null,
        summary: null,
      });

      // Execute
      const result = await auditService.getAuditProgress(auditId);

      // Assert
      expect(result).toEqual({
        id: auditId,
        status: 'running',
        progress: 50,
        startedAt: expect.any(Date),
        completedAt: null,
        summary: null,
      });
    });

    it('should return audit progress for a completed audit', async () => {
      const completedAt = new Date();
      const summary = { overallScore: 85 };
      
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue({
        id: auditId,
        status: 'completed',
        startedAt: new Date(),
        completedAt,
        summary,
      });

      // Execute
      const result = await auditService.getAuditProgress(auditId);

      // Assert
      expect(result).toEqual({
        id: auditId,
        status: 'completed',
        progress: 100,
        startedAt: expect.any(Date),
        completedAt,
        summary,
      });
    });

    it('should return null if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute
      const result = await auditService.getAuditProgress(auditId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getAuditResults', () => {
    const auditId = 'audit-123';
    const mockAudit = {
      id: auditId,
      website: { id: 'website-123', url: 'https://example.com' },
      summary: { overallScore: 85 },
      auditResults: [
        {
          id: 'result-1',
          status: 'passed',
          severity: 'low',
          check: {
            id: 'check-1',
            name: 'Title Check',
            category: { id: 'cat-1', name: 'SEO' },
          },
        },
      ],
    };

    it('should return audit results', async () => {
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue(mockAudit);

      // Execute
      const result = await auditService.getAuditResults(auditId);

      // Assert
      expect(result).toEqual(mockAudit);
      expect(prisma.audit.findUnique).toHaveBeenCalledWith({
        where: { id: auditId },
        include: {
          website: true,
          summary: true,
          auditResults: {
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

    it('should return null if audit not found', async () => {
      // Mock dependencies
      (prisma.audit.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute
      const result = await auditService.getAuditResults(auditId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
