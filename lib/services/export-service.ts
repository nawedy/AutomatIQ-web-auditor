// src/lib/services/export-service.ts
// Service for exporting audit reports to PDF and CSV formats

import { PrismaClient } from '@prisma/client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Parser } from 'json2csv';
import { ComprehensiveAuditResult } from '../types/advanced-audit';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportOptions {
  includeDetails: boolean;
  includeSummary: boolean;
  includeRecommendations: boolean;
  includeBranding: boolean;
  customLogo?: string;
  customColor?: string;
}

export class ExportService {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  /**
   * Export audit report to PDF
   */
  async exportToPdf(auditId: string, options: ExportOptions = {
    includeDetails: true,
    includeSummary: true,
    includeRecommendations: true,
    includeBranding: true
  }): Promise<Buffer> {
    try {
      // Get audit data with related website
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          website: true,
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      });
      
      if (!audit) {
        throw new Error(`Audit with ID ${auditId} not found`);
      }
      
      // Get audit results
      const auditResults = await this.prisma.auditResult.findMany({
        where: { auditId },
        include: {
          category: true,
          check: true,
        },
      });
      
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Add branding if enabled
      if (options.includeBranding) {
        // Add logo
        const logoPath = options.customLogo || path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.addImage(logoPath, 'PNG', 10, 10, 40, 15);
        }
        
        // Add title with custom color
        const brandColor = options.customColor || '#4F46E5'; // Default indigo color
        doc.setTextColor(brandColor);
        doc.setFontSize(22);
        doc.text('AutomatIQ Website Audit Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
      } else {
        // Add simple title
        doc.setFontSize(22);
        doc.text('Website Audit Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
      }
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add audit information
      doc.setFontSize(12);
      doc.text(`Website: ${audit.website.name} (${audit.website.url})`, 10, yPos);
      yPos += 8;
      doc.text(`Audit Date: ${audit.completedAt ? new Date(audit.completedAt).toLocaleDateString() : 'In progress'}`, 10, yPos);
      yPos += 8;
      doc.text(`Audit Type: ${audit.type}`, 10, yPos);
      yPos += 15;
      
      // Add summary section if enabled
      if (options.includeSummary) {
        doc.setFontSize(16);
        doc.text('Audit Summary', 10, yPos);
        yPos += 10;
        
        // Create summary table
        doc.autoTable({
          startY: yPos,
          head: [['Category', 'Score']],
          body: [
            ['Overall', `${audit.overallScore || 0}/100`],
            ['SEO', `${audit.seoScore || 0}/100`],
            ['Performance', `${audit.performanceScore || 0}/100`],
            ['Accessibility', `${audit.accessibilityScore || 0}/100`],
            ['Security', `${audit.securityScore || 0}/100`],
            ['Mobile', `${audit.mobileScore || 0}/100`],
            ['Content', `${audit.contentScore || 0}/100`]
          ],
          theme: 'striped',
          headStyles: { fillColor: options.customColor || [79, 70, 229] },
          margin: { top: 10 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Add detailed results if enabled
      if (options.includeDetails) {
        doc.setFontSize(16);
        doc.text('Detailed Results', 10, yPos);
        yPos += 10;
        
        // Group results by category
        const resultsByCategory: Record<string, any[]> = {};
        
        auditResults.forEach(result => {
          const categoryName = result.category.name;
          if (!resultsByCategory[categoryName]) {
            resultsByCategory[categoryName] = [];
          }
          
          resultsByCategory[categoryName].push({
            check: result.check.name,
            status: result.status,
            score: result.score,
            details: result.details
          });
        });
        
        // Add each category
        for (const [category, results] of Object.entries(resultsByCategory)) {
          // Add page if needed
          if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(14);
          doc.text(category, 10, yPos);
          yPos += 8;
          
          // Create table for this category
          const tableData = results.map(r => [
            r.check,
            r.status,
            `${r.score}/100`,
            r.details?.substring(0, 50) || ''
          ]);
          
          doc.autoTable({
            startY: yPos,
            head: [['Check', 'Status', 'Score', 'Details']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: options.customColor || [79, 70, 229] },
            margin: { top: 10 },
          });
          
          yPos = (doc as any).lastAutoTable.finalY + 15;
        }
      }
      
      // Add recommendations if enabled
      if (options.includeRecommendations) {
        // Add page if needed
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.text('Recommendations', 10, yPos);
        yPos += 10;
        
        // Get recommendations from results
        const recommendations: string[] = [];
        auditResults.forEach(result => {
          if (result.recommendations) {
            const recs = Array.isArray(result.recommendations) 
              ? result.recommendations 
              : [result.recommendations];
            
            recs.forEach(rec => {
              if (rec && !recommendations.includes(rec)) {
                recommendations.push(rec);
              }
            });
          }
        });
        
        // Add recommendations
        doc.setFontSize(12);
        recommendations.forEach(recommendation => {
          // Add page if needed
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = 20;
          }
          
          const lines = doc.splitTextToSize(recommendation, pageWidth - 20);
          doc.text(lines, 10, yPos);
          yPos += lines.length * 7 + 5;
        });
      }
      
      // Add footer with date and page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      // Return the PDF as a buffer
      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error generating PDF export:', error);
      throw new Error(`Failed to export audit to PDF: ${(error as Error).message}`);
    }
  }
  
  /**
   * Export audit report to CSV
   */
  async exportToCsv(auditId: string): Promise<string> {
    try {
      // Get audit data
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          website: true,
        }
      });
      
      if (!audit) {
        throw new Error(`Audit with ID ${auditId} not found`);
      }
      
      // Get audit results
      const auditResults = await this.prisma.auditResult.findMany({
        where: { auditId },
        include: {
          category: true,
          check: true,
        },
      });
      
      // Format data for CSV
      const csvData = auditResults.map(result => ({
        website: audit.website.name,
        url: audit.website.url,
        auditDate: audit.completedAt ? new Date(audit.completedAt).toISOString() : 'In progress',
        category: result.category.name,
        check: result.check.name,
        status: result.status,
        score: result.score,
        details: result.details?.replace(/\n/g, ' ') || '',
        recommendations: Array.isArray(result.recommendations) 
          ? result.recommendations.join('; ') 
          : result.recommendations || '',
      }));
      
      // Generate CSV
      const fields = [
        'website', 
        'url', 
        'auditDate', 
        'category', 
        'check', 
        'status', 
        'score', 
        'details', 
        'recommendations'
      ];
      
      const parser = new Parser({ fields });
      return parser.parse(csvData);
    } catch (error) {
      console.error('Error generating CSV export:', error);
      throw new Error(`Failed to export audit to CSV: ${(error as Error).message}`);
    }
  }
  
  /**
   * Save export to a temporary file and return the file path
   */
  async saveExportToFile(data: Buffer | string, extension: 'pdf' | 'csv'): Promise<string> {
    const tempDir = os.tmpdir();
    const fileName = `audit-export-${Date.now()}.${extension}`;
    const filePath = path.join(tempDir, fileName);
    
    if (extension === 'pdf') {
      fs.writeFileSync(filePath, data as Buffer);
    } else {
      fs.writeFileSync(filePath, data as string, 'utf8');
    }
    
    return filePath;
  }
}
