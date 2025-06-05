// src/app/api/export/bulk/route.ts
// API route for bulk exporting multiple audit reports

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { withRateLimit } from '@/lib/rate-limit';
import { PrismaClient } from '@prisma/client';
import { ExportService } from '@/lib/services/export-service';
import { createReadStream } from 'fs';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, rm } from 'fs/promises';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * POST handler for bulk exporting multiple audit reports
 * Rate limited to 5 requests per minute to prevent abuse
 */
export const POST = withRateLimit(
  withAuth(async (
  request: NextRequest,
  context: any,
  user: { id: string; email: string; role?: string }
) => {
  try {
    // Parse request body
    const { auditIds, format, options } = await request.json() as {
      auditIds: string[];
      format: 'pdf' | 'csv' | 'zip';
      options?: {
        includeDetails: boolean;
        includeSummary: boolean;
        includeRecommendations: boolean;
        includeBranding: boolean;
        customLogo?: string;
        customColor?: string;
      };
    };

    // Validate request
    if (!auditIds || !Array.isArray(auditIds) || auditIds.length === 0) {
      return NextResponse.json({ error: 'No audit IDs provided' }, { status: 400 });
    }

    if (!format || !['pdf', 'csv', 'zip'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported formats: pdf, csv, zip' }, { status: 400 });
    }

    // Verify user has access to all audits
    const audits = await prisma.audit.findMany({
      where: {
        id: { in: auditIds },
        OR: [
          { userId: user.id },
          { user: { role: 'ADMIN' } } // Admins can access all audits
        ]
      },
      include: {
        website: true
      }
    });

    // Check if all audits were found and accessible
    if (audits.length !== auditIds.length) {
      return NextResponse.json(
        { error: 'One or more audits not found or you do not have permission to access them' },
        { status: 403 }
      );
    }

    // Initialize export service
    const exportService = new ExportService(prisma);

    // Handle different export formats
    if (format === 'zip') {
      // Create temporary directory for exports
      const tempDir = join(tmpdir(), `audit-export-${uuidv4()}`);
      await mkdir(tempDir, { recursive: true });
      
      // Create a zip file
      const zipPath = join(tempDir, 'audit-reports.zip');
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      // Process each audit
      for (const audit of audits) {
        try {
          // Generate PDF
          const pdfBuffer = await exportService.exportToPdf(audit.id, options);
          const sanitizedName = audit.website.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
          const fileName = `${sanitizedName}-audit-${audit.id.substring(0, 8)}.pdf`;
          
          // Add PDF to zip
          archive.append(pdfBuffer, { name: fileName });
          
          // Generate CSV
          const csvContent = await exportService.exportToCsv(audit.id);
          const csvFileName = `${sanitizedName}-audit-${audit.id.substring(0, 8)}.csv`;
          
          // Add CSV to zip
          archive.append(csvContent, { name: csvFileName });
        } catch (error) {
          console.error(`Error processing audit ${audit.id}:`, error);
          // Continue with other audits
        }
      }
      
      // Finalize zip
      await new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));
        archive.finalize();
      });
      
      // Read the zip file
      const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(zipPath);
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
      
      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
      
      // Return zip file
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="audit-reports.zip"`,
        },
      });
    } else if (format === 'pdf' || format === 'csv') {
      // For single format exports, we'll still create a zip with all files
      const tempDir = join(tmpdir(), `audit-export-${uuidv4()}`);
      await mkdir(tempDir, { recursive: true });
      
      const zipPath = join(tempDir, 'audit-reports.zip');
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      // Process each audit
      for (const audit of audits) {
        try {
          if (format === 'pdf') {
            const pdfBuffer = await exportService.exportToPdf(audit.id, options);
            const sanitizedName = audit.website.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const fileName = `${sanitizedName}-audit-${audit.id.substring(0, 8)}.pdf`;
            
            archive.append(pdfBuffer, { name: fileName });
          } else {
            const csvContent = await exportService.exportToCsv(audit.id);
            const sanitizedName = audit.website.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const fileName = `${sanitizedName}-audit-${audit.id.substring(0, 8)}.csv`;
            
            archive.append(csvContent, { name: fileName });
          }
        } catch (error) {
          console.error(`Error processing audit ${audit.id}:`, error);
          // Continue with other audits
        }
      }
      
      // Finalize zip
      await new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));
        archive.finalize();
      });
      
      // Read the zip file
      const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(zipPath);
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
      
      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
      
      // Return zip file
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="audit-reports-${format}.zip"`,
        },
      });
    }
    
    // Should never reach here due to format validation
    return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk export:', error);
    return NextResponse.json(
      { error: `Failed to bulk export reports: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}),
{
  requestsPerWindow: 5,
  window: '60 s',
  identifierFn: (req) => {
    // Use user ID from session if available, otherwise fall back to IP
    const session = req.headers.get('x-session-user');
    if (session) {
      try {
        const user = JSON.parse(session);
        return `user_${user.id}`;
      } catch (e) {
        // Fall back to IP if session parsing fails
      }
    }
    // NextRequest doesn't have an ip property directly, use headers instead
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'anonymous';
    return `ip_${ip}`;
  }
}
);
