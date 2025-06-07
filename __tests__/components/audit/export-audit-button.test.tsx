// src/__tests__/components/audit/export-audit-button.test.tsx
// Unit tests for the Export Audit Button component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExportAuditButton } from '@/components/audit/export-audit-button';
import { ExportService } from '@/lib/export/export-service';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/export/export-service', () => ({
  ExportService: {
    exportToPdf: jest.fn(),
    exportToCsv: jest.fn(),
    saveFile: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExportAuditButton', () => {
  const mockAuditId = 'audit-123';
  const mockWebsiteName = 'Example Website';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button correctly', () => {
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Check that the button is rendered
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', () => {
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Click the export button
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    
    // Check that dropdown options are displayed
    expect(screen.getByText('PDF Report')).toBeInTheDocument();
    expect(screen.getByText('CSV Data')).toBeInTheDocument();
  });

  it('exports to PDF when PDF option is clicked', async () => {
    // Mock successful PDF export
    (ExportService.exportToPdf as jest.Mock).mockResolvedValue('mock-pdf-data');
    
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Open dropdown and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    fireEvent.click(screen.getByText('PDF Report'));
    
    // Wait for export to complete
    await waitFor(() => {
      // Verify export function was called
      expect(ExportService.exportToPdf).toHaveBeenCalledWith(
        mockAuditId,
        expect.objectContaining({
          includeBranding: true,
          includeRecommendations: true,
          includeDetails: true,
        })
      );
      
      // Verify file was saved
      expect(ExportService.saveFile).toHaveBeenCalledWith(
        'mock-pdf-data',
        'application/pdf',
        expect.stringContaining(`${mockWebsiteName.toLowerCase().replace(/\s+/g, '-')}-audit-report.pdf`)
      );
      
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('PDF export completed successfully');
    });
  });

  it('exports to CSV when CSV option is clicked', async () => {
    // Mock successful CSV export
    (ExportService.exportToCsv as jest.Mock).mockResolvedValue('mock,csv,data');
    
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Open dropdown and click CSV option
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    fireEvent.click(screen.getByText('CSV Data'));
    
    // Wait for export to complete
    await waitFor(() => {
      // Verify export function was called
      expect(ExportService.exportToCsv).toHaveBeenCalledWith(mockAuditId);
      
      // Verify file was saved
      expect(ExportService.saveFile).toHaveBeenCalledWith(
        'mock,csv,data',
        'text/csv',
        expect.stringContaining(`${mockWebsiteName.toLowerCase().replace(/\s+/g, '-')}-audit-data.csv`)
      );
      
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('CSV export completed successfully');
    });
  });

  it('shows error toast when PDF export fails', async () => {
    // Mock failed PDF export
    (ExportService.exportToPdf as jest.Mock).mockRejectedValue(new Error('Export failed'));
    
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Open dropdown and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    fireEvent.click(screen.getByText('PDF Report'));
    
    // Wait for export to fail
    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Failed to export PDF: Export failed');
    });
  });

  it('shows error toast when CSV export fails', async () => {
    // Mock failed CSV export
    (ExportService.exportToCsv as jest.Mock).mockRejectedValue(new Error('Export failed'));
    
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Open dropdown and click CSV option
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    fireEvent.click(screen.getByText('CSV Data'));
    
    // Wait for export to fail
    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Failed to export CSV: Export failed');
    });
  });

  it('disables button during export', async () => {
    // Mock slow PDF export
    (ExportService.exportToPdf as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve('mock-pdf-data'), 100);
      });
    });
    
    render(
      <ExportAuditButton 
        auditId={mockAuditId} 
        websiteName={mockWebsiteName} 
      />
    );
    
    // Open dropdown and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    fireEvent.click(screen.getByText('PDF Report'));
    
    // Check that button is disabled during export
    expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled();
    
    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).not.toBeDisabled();
    });
  });
});
