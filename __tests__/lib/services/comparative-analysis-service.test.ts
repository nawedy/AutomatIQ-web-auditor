// src/__tests__/lib/services/comparative-analysis-service.test.ts
// Unit tests for the Comparative Analysis Service

import { ComparativeAnalysisService } from '@/lib/services/comparative-analysis-service';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ComparativeAnalysisService', () => {
  let comparativeAnalysisService: ComparativeAnalysisService;
  
  const mockCurrentAudit = {
    id: 'current-audit-id',
    websiteId: 'website-id',
    createdAt: new Date('2025-06-01').toISOString(),
    completedAt: new Date('2025-06-01').toISOString(),
    overallScore: 85,
    seoScore: 90,
    performanceScore: 80,
    accessibilityScore: 85,
    securityScore: 95,
    mobileScore: 75,
    contentScore: 85,
    results: [
      {
        id: 'result-1',
        category: 'SEO',
        check: 'Meta Description',
        status: 'PASS',
        score: 100,
      },
      {
        id: 'result-2',
        category: 'PERFORMANCE',
        check: 'Image Optimization',
        status: 'FAIL',
        score: 60,
      },
    ],
  };
  
  const mockPreviousAudit = {
    id: 'previous-audit-id',
    websiteId: 'website-id',
    createdAt: new Date('2025-05-01').toISOString(),
    completedAt: new Date('2025-05-01').toISOString(),
    overallScore: 80,
    seoScore: 85,
    performanceScore: 75,
    accessibilityScore: 80,
    securityScore: 90,
    mobileScore: 70,
    contentScore: 80,
    results: [
      {
        id: 'result-1-prev',
        category: 'SEO',
        check: 'Meta Description',
        status: 'PASS',
        score: 95,
      },
      {
        id: 'result-2-prev',
        category: 'PERFORMANCE',
        check: 'Image Optimization',
        status: 'FAIL',
        score: 55,
      },
    ],
  };

  beforeEach(() => {
    comparativeAnalysisService = new ComparativeAnalysisService();
    
    // Reset and setup mocks
    (fetch as jest.Mock).mockReset();
  });

  describe('compareAudits', () => {
    beforeEach(() => {
      // Mock the fetchAudit method
      jest.spyOn(comparativeAnalysisService, 'fetchAudit')
        .mockImplementation((auditId) => {
          if (auditId === 'current-audit-id') {
            return Promise.resolve(mockCurrentAudit);
          } else if (auditId === 'previous-audit-id') {
            return Promise.resolve(mockPreviousAudit);
          }
          return Promise.reject(new Error('Audit not found'));
        });
    });

    it('should compare two audits correctly', async () => {
      const comparison = await comparativeAnalysisService.compareAudits(
        'current-audit-id',
        'previous-audit-id'
      );
      
      // Verify the comparison contains the correct data
      expect(comparison).toHaveProperty('currentAudit', mockCurrentAudit);
      expect(comparison).toHaveProperty('previousAudit', mockPreviousAudit);
      expect(comparison).toHaveProperty('timeDifference');
      expect(comparison).toHaveProperty('overallScoreChange', 5); // 85 - 80
      expect(comparison).toHaveProperty('categoryScoreChanges');
      
      // Verify category score changes
      const { categoryScoreChanges } = comparison;
      expect(categoryScoreChanges).toHaveProperty('SEO');
      expect(categoryScoreChanges.SEO.change).toBe(5); // 90 - 85
      expect(categoryScoreChanges.SEO.percentChange).toBe(5.88); // (5 / 85) * 100 = 5.88%
      
      // Verify improvements and declines
      expect(comparison).toHaveProperty('improvements');
      expect(comparison).toHaveProperty('declines');
      expect(comparison.improvements.length).toBeGreaterThan(0);
      expect(comparison.improvements[0]).toHaveProperty('category');
      expect(comparison.improvements[0]).toHaveProperty('change');
    });

    it('should handle missing previous audit gracefully', async () => {
      // Mock fetchAudit to return null for previous audit
      jest.spyOn(comparativeAnalysisService, 'fetchAudit')
        .mockImplementation((auditId) => {
          if (auditId === 'current-audit-id') {
            return Promise.resolve(mockCurrentAudit);
          }
          return Promise.resolve(null);
        });
      
      const comparison = await comparativeAnalysisService.compareAudits(
        'current-audit-id',
        'non-existent-audit-id'
      );
      
      // Verify the comparison shows no changes
      expect(comparison).toHaveProperty('currentAudit', mockCurrentAudit);
      expect(comparison).toHaveProperty('previousAudit', null);
      expect(comparison).toHaveProperty('overallScoreChange', 0);
      expect(comparison.categoryScoreChanges).toEqual({});
      expect(comparison.improvements).toEqual([]);
      expect(comparison.declines).toEqual([]);
    });

    it('should throw an error when current audit cannot be fetched', async () => {
      // Mock fetchAudit to throw an error for current audit
      jest.spyOn(comparativeAnalysisService, 'fetchAudit')
        .mockImplementation((auditId) => {
          if (auditId === 'current-audit-id') {
            return Promise.reject(new Error('Failed to fetch current audit'));
          }
          return Promise.resolve(mockPreviousAudit);
        });
      
      await expect(comparativeAnalysisService.compareAudits(
        'current-audit-id',
        'previous-audit-id'
      )).rejects.toThrow('Failed to fetch current audit');
    });
  });

  describe('getAuditHistory', () => {
    it('should fetch audit history for a website', async () => {
      const mockHistoryResponse = {
        audits: [mockCurrentAudit, mockPreviousAudit],
        total: 2,
      };
      
      // Mock fetch to return history data
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistoryResponse),
      });
      
      const websiteId = 'website-id';
      const timeRange = '30d';
      const history = await comparativeAnalysisService.getAuditHistory(websiteId, timeRange);
      
      expect(fetch).toHaveBeenCalledWith(
        `/api/websites/${websiteId}/audits/history?timeRange=${timeRange}`,
        expect.any(Object)
      );
      
      expect(history).toEqual(mockHistoryResponse);
    });

    it('should throw an error when fetch fails', async () => {
      // Mock fetch to fail
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      
      await expect(comparativeAnalysisService.getAuditHistory('website-id', '30d'))
        .rejects.toThrow('Failed to fetch audit history: 404 Not Found');
    });
  });

  describe('analyzeScoreTrends', () => {
    it('should analyze score trends correctly', () => {
      const mockAudits = [
        {
          ...mockCurrentAudit,
          createdAt: new Date('2025-06-01').toISOString(),
        },
        {
          ...mockPreviousAudit,
          createdAt: new Date('2025-05-15').toISOString(),
          overallScore: 82,
        },
        {
          ...mockPreviousAudit,
          id: 'older-audit',
          createdAt: new Date('2025-05-01').toISOString(),
          overallScore: 80,
        },
      ];
      
      const trends = comparativeAnalysisService.analyzeScoreTrends(mockAudits);
      
      expect(trends).toHaveProperty('overallTrend');
      expect(trends).toHaveProperty('categoryTrends');
      expect(trends.overallTrend).toHaveProperty('trend', 'improving');
      expect(trends.overallTrend).toHaveProperty('rateOfChange');
      
      // Verify category trends
      expect(trends.categoryTrends).toHaveProperty('SEO');
      expect(trends.categoryTrends.SEO).toHaveProperty('trend');
      expect(trends.categoryTrends.SEO).toHaveProperty('rateOfChange');
    });

    it('should handle single audit case', () => {
      const mockAudits = [mockCurrentAudit];
      
      const trends = comparativeAnalysisService.analyzeScoreTrends(mockAudits);
      
      expect(trends.overallTrend.trend).toBe('stable');
      expect(trends.overallTrend.rateOfChange).toBe(0);
      
      Object.values(trends.categoryTrends).forEach(categoryTrend => {
        expect(categoryTrend.trend).toBe('stable');
        expect(categoryTrend.rateOfChange).toBe(0);
      });
    });
  });

  describe('calculatePercentChange', () => {
    it('should calculate percent change correctly', () => {
      expect(comparativeAnalysisService.calculatePercentChange(80, 100)).toBe(25);
      expect(comparativeAnalysisService.calculatePercentChange(100, 80)).toBe(-20);
      expect(comparativeAnalysisService.calculatePercentChange(0, 50)).toBe(Infinity);
      expect(comparativeAnalysisService.calculatePercentChange(50, 50)).toBe(0);
    });
  });

  describe('fetchAudit', () => {
    it('should fetch audit data by ID', async () => {
      // Mock fetch to return audit data
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCurrentAudit),
      });
      
      const audit = await comparativeAnalysisService.fetchAudit('current-audit-id');
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/audits/current-audit-id',
        expect.any(Object)
      );
      
      expect(audit).toEqual(mockCurrentAudit);
    });

    it('should return null when audit is not found', async () => {
      // Mock fetch to return 404
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });
      
      const audit = await comparativeAnalysisService.fetchAudit('non-existent-id');
      
      expect(audit).toBeNull();
    });

    it('should throw an error for non-404 errors', async () => {
      // Mock fetch to return 500
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      
      await expect(comparativeAnalysisService.fetchAudit('audit-id'))
        .rejects.toThrow('Failed to fetch audit: 500 Internal Server Error');
    });
  });
});
