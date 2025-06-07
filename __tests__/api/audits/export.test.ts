// src/__tests__/api/audits/export.test.ts
// Integration tests for the audit export API routes

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/audits/[id]/export/route';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { ExportService } from '@/lib/services/export-service';

// Mock dependencies
jest.mock('@/lib/auth-utils', () => ({
  withAuth: jest.fn((handler) => handler),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    audit: {
      findUnique: jest.fn(),
    },
    website: {
      findUnique: jest.fn(),
    },
    auditResult: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/export-service', () => ({
  ExportService: jest.fn().mockImplementation(() => ({
    exportToPdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
    exportToCsv: jest.fn().mockResolvedValue('mock,csv,content'),
  })),
}));

describe('Audit Export API Routes', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockAuditId = 'audit-123';
  const mockWebsiteId = 'website-123';
  
  const mockAudit = {
    id: mockAuditId,
    websiteId: mockWebsiteId,
    userId: mockUser.id,
    url: 'https://example.com',
    createdAt: new Date(),
    completedAt: new Date(),
    overallScore: 85,
    seoScore: 90,
    performanceScore: 80,
    accessibilityScore: 85,
    securityScore: 95,
    mobileScore: 75,
    contentScore: 85,
  };
  
  const mockWebsite = {
    id: mockWebsiteId,
    name: 'Example Website',
    url: 'https://example.com',
    userId: mockUser.id,
  };
  
  const mockResults = [
    {
      id: 'result-1',
      auditId: mockAuditId,
      category: 'SEO',
      check: 'Meta Description',
      status: 'PASS',
      score: 100,
      details: 'Meta description is properly set',
      recommendation: 'No action needed',
    },
    {
      id: 'result-2',
      auditId: mockAuditId,
      category: 'PERFORMANCE',
      check: 'Image Optimization',
      status: 'FAIL',
      score: 60,
      details: 'Some images are not optimized',
      recommendation: 'Optimize images to improve load time',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock responses
    prisma.audit.findUnique.mockResolvedValue(mockAudit);
    prisma.website.findUnique.mockResolvedValue(mockWebsite);
    prisma.auditResult.findMany.mockResolvedValue(mockResults);
  });

  describe('GET handler', () => {
    it('should return audit export data', async () => {
      // Create mock request
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`)
      );
      
      // Call the handler
      const response = await GET(request, { params: { id: mockAuditId } }, mockUser);
      const responseData = await response.json();
      
      // Verify database queries
      expect(prisma.audit.findUnique).toHaveBeenCalledWith({
        where: { id: mockAuditId, userId: mockUser.id },
      });
      
      expect(prisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: mockWebsite.id },
      });
      
      expect(prisma.auditResult.findMany).toHaveBeenCalledWith({
        where: { auditId: mockAuditId },
      });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('id', mockAuditId);
      expect(responseData).toHaveProperty('website', mockWebsite);
      expect(responseData).toHaveProperty('results', mockResults);
    });

    it('should return 404 when audit not found', async () => {
      // Mock audit not found
      prisma.audit.findUnique.mockResolvedValue(null);
      
      // Create mock request
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/non-existent/export`)
      );
      
      // Call the handler
      const response = await GET(request, { params: { id: 'non-existent' } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Audit not found');
    });

    it('should return 403 when user does not own the audit', async () => {
      // Mock audit with different user ID
      prisma.audit.findUnique.mockResolvedValue({
        ...mockAudit,
        userId: 'different-user',
      });
      
      // Create mock request
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`)
      );
      
      // Call the handler
      const response = await GET(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(403);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Not authorized to access this audit');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      prisma.audit.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Create mock request
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`)
      );
      
      // Call the handler
      const response = await GET(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Failed to retrieve audit data for export');
    });
  });

  describe('POST handler', () => {
    it('should generate and return PDF export', async () => {
      // Create mock request with PDF format
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`),
        {
          method: 'POST',
          body: JSON.stringify({
            format: 'pdf',
            options: {
              includeBranding: true,
              includeRecommendations: true,
            },
          }),
        }
      );
      
      // Call the handler
      const response = await POST(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify ExportService was called correctly
      expect(ExportService).toHaveBeenCalled();
      const exportServiceInstance = (ExportService as jest.Mock).mock.instances[0];
      expect(exportServiceInstance.exportToPdf).toHaveBeenCalledWith(
        mockAuditId,
        {
          includeBranding: true,
          includeRecommendations: true,
        }
      );
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="audit-');
      expect(response.headers.get('Content-Disposition')).toContain('.pdf"');
      
      // Verify response body
      const buffer = await response.arrayBuffer();
      expect(Buffer.from(buffer)).toEqual(Buffer.from('mock-pdf-content'));
    });

    it('should generate and return CSV export', async () => {
      // Create mock request with CSV format
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`),
        {
          method: 'POST',
          body: JSON.stringify({
            format: 'csv',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify ExportService was called correctly
      expect(ExportService).toHaveBeenCalled();
      const exportServiceInstance = (ExportService as jest.Mock).mock.instances[0];
      expect(exportServiceInstance.exportToCsv).toHaveBeenCalledWith(mockAuditId);
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="audit-');
      expect(response.headers.get('Content-Disposition')).toContain('.csv"');
      
      // Verify response body
      const text = await response.text();
      expect(text).toBe('mock,csv,content');
    });

    it('should return 400 for invalid format', async () => {
      // Create mock request with invalid format
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`),
        {
          method: 'POST',
          body: JSON.stringify({
            format: 'invalid',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Invalid export format. Supported formats: pdf, csv');
    });

    it('should return 400 for missing format', async () => {
      // Create mock request with missing format
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`),
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );
      
      // Call the handler
      const response = await POST(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Export format is required');
    });

    it('should handle export service errors gracefully', async () => {
      // Mock export service error
      const exportServiceInstance = (ExportService as jest.Mock).mock.instances[0];
      exportServiceInstance.exportToPdf.mockRejectedValue(new Error('Export failed'));
      
      // Create mock request
      const request = new NextRequest(
        new URL(`https://example.com/api/audits/${mockAuditId}/export`),
        {
          method: 'POST',
          body: JSON.stringify({
            format: 'pdf',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(request, { params: { id: mockAuditId } }, mockUser);
      
      // Verify response
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error', 'Failed to generate export: Export failed');
    });
  });
});
