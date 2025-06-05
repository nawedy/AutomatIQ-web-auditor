// src/app/api/audits/[id]/export/route.ts
// API route for exporting audit reports

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { ExportService, ExportOptions } from '@/lib/services/export-service';
import { AuditExportData } from '@/lib/export/export-service';

/**
 * Get audit data for export
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const auditId = params.id;
    
    // Verify audit exists and belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: user.id,
      },
      include: {
        website: true,
        auditResults: {
          include: {
            category: true,
            check: true
          }
        },
        pages: {
          include: {
            pageAuditResults: true
          }
        },
        auditSummary: true
      }
    });
    
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found or you do not have permission to access it' },
        { status: 404 }
      );
    }

    // Format data for export
    const exportData: AuditExportData = {
      id: audit.id,
      websiteName: audit.website.name,
      websiteUrl: audit.website.url,
      createdAt: audit.createdAt,
      completedAt: audit.completedAt || undefined,
      overallScore: audit.overallScore || undefined,
      categories: []
    };
    
    // Group results by category
    const categoriesMap = new Map<string, {
      name: string;
      score: number;
      issues: Array<{
        title: string;
        description: string;
        severity: string;
        impact: string;
        recommendation?: string;
      }>;
    }>();
    
    audit.auditResults.forEach((result: any) => {
      const categoryName = result.category.name;
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          name: categoryName,
          score: 0,
          issues: []
        });
      }
      
      const category = categoriesMap.get(categoryName)!;
      
      // Add issue if it's a failure or warning
      if (result.status === 'FAILURE' || result.status === 'WARNING') {
        category.issues.push({
          title: result.check.name,
          description: result.details || 'No details provided',
          severity: result.status === 'FAILURE' ? 'High' : 'Medium',
          impact: result.impact || 'Unknown',
          recommendation: result.recommendations || undefined
        });
      }
      
      // Update category score if available
      if (result.category.name === 'SEO' && audit.seoScore) {
        category.score = audit.seoScore;
      } else if (result.category.name === 'Performance' && audit.performanceScore) {
        category.score = audit.performanceScore;
      } else if (result.category.name === 'Accessibility' && audit.accessibilityScore) {
        category.score = audit.accessibilityScore;
      } else if (result.category.name === 'Security' && audit.securityScore) {
        category.score = audit.securityScore;
      } else if (result.category.name === 'Mobile' && audit.mobileScore) {
        category.score = audit.mobileScore;
      } else if (result.category.name === 'Content' && audit.contentScore) {
        category.score = audit.contentScore;
      }
    });
    
    // Convert map to array and add to export data
    exportData.categories = Array.from(categoriesMap.values());
    
    // Add page data if available
    if (audit.pages && audit.pages.length > 0) {
      exportData.pages = audit.pages.map((page: any) => ({
        url: page.url,
        title: page.title || undefined,
        score: page.score || undefined,
        issues: page.pageAuditResults
          .filter((result: any) => result.status === 'FAILURE' || result.status === 'WARNING')
          .map((result: any) => ({
            title: result.checkName || 'Unknown check',
            description: result.details || 'No details provided',
            severity: result.status === 'FAILURE' ? 'High' : 'Medium',
            impact: result.impact || 'Unknown',
            recommendation: result.recommendations || undefined
          }))
      }));
    }
    
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error preparing audit data for export:', error);
    return NextResponse.json(
      { error: `Failed to prepare audit data: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});

/**
 * Export audit report to PDF or CSV
 */
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
) => {
  try {
    const auditId = params.id;
    
    // Verify audit exists and belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: user.id,
      },
    });
    
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Parse request body for export options
    const { format, options } = await request.json() as {
      format: 'pdf' | 'csv';
      options?: ExportOptions;
    };
    
    // Initialize export service
    const exportService = new ExportService(prisma);
    
    // Generate export based on format
    if (format === 'pdf') {
      const pdfBuffer = await exportService.exportToPdf(auditId, options);
      
      // Return PDF file
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="audit-report-${auditId}.pdf"`,
        },
      });
    } else if (format === 'csv') {
      const csvContent = await exportService.exportToCsv(auditId);
      
      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-report-${auditId}.csv"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid export format. Supported formats: pdf, csv' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting audit report:', error);
    return NextResponse.json(
      { error: `Failed to export audit report: ${(error as Error).message}` },
      { status: 500 }
    );
  }
});
