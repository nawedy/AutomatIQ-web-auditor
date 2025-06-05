// src/lib/export/export-service.ts
// Service for exporting audit reports in different formats

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Parser } from 'json2csv';
import { format } from 'date-fns';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types for export data
export interface AuditExportData {
  id: string;
  websiteName: string;
  websiteUrl: string;
  createdAt: Date;
  completedAt?: Date;
  overallScore?: number;
  categories: CategoryExportData[];
  pages?: PageExportData[];
}

export interface CategoryExportData {
  name: string;
  score?: number;
  issues: IssueExportData[];
}

export interface IssueExportData {
  title: string;
  description: string;
  severity: string;
  impact: string;
  recommendation?: string;
}

export interface PageExportData {
  url: string;
  title?: string;
  score?: number;
  issues: IssueExportData[];
}

/**
 * Export audit report as PDF
 */
export async function exportAuditToPdf(data: AuditExportData): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add header with logo and title
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('Website Audit Report', pageWidth / 2, 20, { align: 'center' });
  
  // Website info
  doc.setFontSize(14);
  doc.text(data.websiteName, pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.websiteUrl, pageWidth / 2, 35, { align: 'center' });
  
  // Date and score
  const dateStr = format(new Date(data.createdAt), 'MMMM d, yyyy');
  doc.setFontSize(10);
  doc.setTextColor(33, 33, 33);
  doc.text(`Generated on: ${dateStr}`, 14, 45);
  
  if (data.overallScore !== undefined) {
    const scoreColor = data.overallScore >= 90 ? [0, 128, 0] : 
                      data.overallScore >= 70 ? [255, 165, 0] : [255, 0, 0];
    doc.setTextColor(...scoreColor);
    doc.text(`Overall Score: ${data.overallScore}`, pageWidth - 14, 45, { align: 'right' });
  }
  
  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Summary', 14, 55);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 57, pageWidth - 14, 57);
  
  // Add category scores as a table
  const categoryData = data.categories.map(category => [
    category.name,
    category.score !== undefined ? category.score.toString() : 'N/A',
    category.issues.length.toString()
  ]);
  
  doc.autoTable({
    startY: 60,
    head: [['Category', 'Score', 'Issues']],
    body: categoryData,
    headStyles: {
      fillColor: [41, 65, 148],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
    },
    margin: { top: 60, right: 14, bottom: 20, left: 14 },
  });
  
  // Add issues by category
  let yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPos > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Issues by Category', 14, yPos);
  doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
  yPos += 10;
  
  // Loop through categories and add issues
  for (const category of data.categories) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(41, 65, 148);
    doc.text(`${category.name}${category.score !== undefined ? ` - Score: ${category.score}` : ''}`, 14, yPos);
    yPos += 5;
    
    // Add issues table for this category
    if (category.issues.length > 0) {
      const issueData = category.issues.map(issue => [
        issue.title,
        issue.severity,
        issue.description,
        issue.recommendation || 'N/A',
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Issue', 'Severity', 'Description', 'Recommendation']],
        body: issueData,
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: [33, 33, 33],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
        },
        margin: { top: yPos, right: 14, bottom: 20, left: 14 },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('No issues found', 14, yPos);
      yPos += 10;
    }
  }
  
  // Add footer with page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} | AutomatIQ Website Auditor`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
}

/**
 * Export audit report as CSV
 */
export async function exportAuditToCsv(data: AuditExportData): Promise<string> {
  // Flatten the data structure for CSV
  const flattenedIssues = data.categories.flatMap(category => 
    category.issues.map(issue => ({
      websiteName: data.websiteName,
      websiteUrl: data.websiteUrl,
      auditDate: format(new Date(data.createdAt), 'yyyy-MM-dd'),
      overallScore: data.overallScore || 'N/A',
      category: category.name,
      categoryScore: category.score || 'N/A',
      issueTitle: issue.title,
      issueSeverity: issue.severity,
      issueDescription: issue.description,
      issueImpact: issue.impact,
      recommendation: issue.recommendation || '',
    }))
  );
  
  // If there are no issues, add a single row with website info
  if (flattenedIssues.length === 0) {
    flattenedIssues.push({
      websiteName: data.websiteName,
      websiteUrl: data.websiteUrl,
      auditDate: format(new Date(data.createdAt), 'yyyy-MM-dd'),
      overallScore: data.overallScore || 'N/A',
      category: 'N/A',
      categoryScore: 'N/A',
      issueTitle: 'No issues found',
      issueSeverity: 'N/A',
      issueDescription: 'No issues found',
      issueImpact: 'N/A',
      recommendation: '',
    });
  }
  
  // Define fields for CSV
  const fields = [
    'websiteName',
    'websiteUrl',
    'auditDate',
    'overallScore',
    'category',
    'categoryScore',
    'issueTitle',
    'issueSeverity',
    'issueDescription',
    'issueImpact',
    'recommendation',
  ];
  
  // Create parser with options
  const json2csvParser = new Parser({ fields });
  
  // Parse data to CSV
  return json2csvParser.parse(flattenedIssues);
}

/**
 * Get audit data from API for export
 */
export async function getAuditDataForExport(auditId: string): Promise<AuditExportData> {
  // Fetch audit data from API
  const response = await fetch(`/api/audits/${auditId}/export`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit data for export');
  }
  
  return response.json();
}
