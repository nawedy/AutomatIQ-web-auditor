// src/__tests__/lib/services/export-service.test.ts
// Unit tests for the Export Service

import { ExportService } from '@/lib/services/export-service';
import { jsPDF } from 'jspdf';
import { Parser } from 'json2csv';

// Mock dependencies
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      addImage: jest.fn(),
      text: jest.fn(),
      setFillColor: jest.fn(),
      rect: jest.fn(),
      setDrawColor: jest.fn(),
      line: jest.fn(),
      addPage: jest.fn(),
      output: jest.fn().mockReturnValue(Buffer.from('mock-pdf-content')),
      internal: {
        pageSize: {
          width: 210,
          height: 297,
        },
      },
      autoTable: jest.fn(),
    })),
  };
});

jest.mock('json2csv', () => {
  return {
    Parser: jest.fn().mockImplementation(() => ({
      parse: jest.fn().mockReturnValue('mock,csv,content'),
    })),
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ExportService', () => {
  let exportService: ExportService;
  const mockAuditId = 'mock-audit-id';
  
  const mockAuditData = {
    id: mockAuditId,
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    overallScore: 85,
    seoScore: 90,
    performanceScore: 80,
    accessibilityScore: 85,
    securityScore: 95,
    mobileScore: 75,
    contentScore: 85,
    website: {
      name: 'Example Website',
      url: 'https://example.com',
    },
    results: [
      {
        category: 'SEO',
        check: 'Meta Description',
        status: 'PASS',
        score: 100,
        details: 'Meta description is properly set',
        recommendation: 'No action needed',
      },
      {
        category: 'PERFORMANCE',
        check: 'Image Optimization',
        status: 'FAIL',
        score: 60,
        details: 'Some images are not optimized',
        recommendation: 'Optimize images to improve load time',
      },
    ],
  };

  beforeEach(() => {
    exportService = new ExportService();
    
    // Reset and setup mocks
    (fetch as jest.Mock).mockReset();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAuditData),
    });
  });

  describe('getExportData', () => {
    it('should fetch audit data for export', async () => {
      const result = await exportService.getExportData(mockAuditId);
      
      expect(fetch).toHaveBeenCalledWith(`/api/audits/${mockAuditId}/export`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(result).toEqual(mockAuditData);
    });

    it('should throw an error when fetch fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(exportService.getExportData(mockAuditId)).rejects.toThrow(
        'Failed to fetch export data: 404 Not Found'
      );
    });
  });

  describe('exportToPdf', () => {
    it('should generate a PDF with audit data', async () => {
      // Mock getExportData to return our test data
      jest.spyOn(exportService, 'getExportData').mockResolvedValue(mockAuditData);
      
      const options = {
        includeBranding: true,
        includeRecommendations: true,
        includeDetails: true,
      };
      
      const result = await exportService.exportToPdf(mockAuditId, options);
      
      expect(exportService.getExportData).toHaveBeenCalledWith(mockAuditId);
      expect(jsPDF).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle options correctly', async () => {
      // Mock getExportData to return our test data
      jest.spyOn(exportService, 'getExportData').mockResolvedValue(mockAuditData);
      
      const options = {
        includeBranding: false,
        includeRecommendations: false,
        includeDetails: false,
      };
      
      await exportService.exportToPdf(mockAuditId, options);
      
      // Verify branding was not added when includeBranding is false
      const mockJsPdfInstance = (jsPDF as jest.Mock).mock.results[0].value;
      expect(mockJsPdfInstance.addImage).not.toHaveBeenCalled();
    });

    it('should throw an error when export data cannot be retrieved', async () => {
      // Mock getExportData to throw an error
      jest.spyOn(exportService, 'getExportData').mockRejectedValue(new Error('Failed to fetch data'));
      
      await expect(exportService.exportToPdf(mockAuditId)).rejects.toThrow('Failed to fetch data');
    });
  });

  describe('exportToCsv', () => {
    it('should generate a CSV with audit data', async () => {
      // Mock getExportData to return our test data
      jest.spyOn(exportService, 'getExportData').mockResolvedValue(mockAuditData);
      
      const result = await exportService.exportToCsv(mockAuditId);
      
      expect(exportService.getExportData).toHaveBeenCalledWith(mockAuditId);
      expect(Parser).toHaveBeenCalled();
      expect(result).toBe('mock,csv,content');
    });

    it('should format data correctly for CSV', async () => {
      // Mock getExportData to return our test data
      jest.spyOn(exportService, 'getExportData').mockResolvedValue(mockAuditData);
      
      await exportService.exportToCsv(mockAuditId);
      
      // Get the Parser instance and check if it was called with properly formatted data
      const parserInstance = (Parser as jest.Mock).mock.instances[0];
      expect(parserInstance.parse).toHaveBeenCalled();
      
      // Verify the parse method was called with data containing the expected fields
      const parseCall = parserInstance.parse.mock.calls[0][0];
      expect(parseCall).toBeInstanceOf(Array);
      expect(parseCall.length).toBe(mockAuditData.results.length);
      
      // Check that each row has the expected fields
      parseCall.forEach((row: any, index: number) => {
        const resultItem = mockAuditData.results[index];
        expect(row).toHaveProperty('Website');
        expect(row).toHaveProperty('URL');
        expect(row).toHaveProperty('Audit Date');
        expect(row).toHaveProperty('Category', resultItem.category);
        expect(row).toHaveProperty('Check', resultItem.check);
        expect(row).toHaveProperty('Status', resultItem.status);
        expect(row).toHaveProperty('Score', resultItem.score);
        expect(row).toHaveProperty('Details', resultItem.details);
        expect(row).toHaveProperty('Recommendation', resultItem.recommendation);
      });
    });

    it('should throw an error when export data cannot be retrieved', async () => {
      // Mock getExportData to throw an error
      jest.spyOn(exportService, 'getExportData').mockRejectedValue(new Error('Failed to fetch data'));
      
      await expect(exportService.exportToCsv(mockAuditId)).rejects.toThrow('Failed to fetch data');
    });
  });

  describe('saveFile', () => {
    it('should trigger file download with correct parameters', () => {
      // Mock document.createElement and other DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn(),
      };
      
      document.createElement = jest.fn().mockReturnValue(mockLink);
      URL.createObjectURL = jest.fn().mockReturnValue('mock-blob-url');
      
      // Create a mock blob
      const mockData = 'test data';
      const mockType = 'application/pdf';
      const mockFilename = 'test-file.pdf';
      
      exportService.saveFile(mockData, mockType, mockFilename);
      
      // Verify the link was created and clicked
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.href).toBe('mock-blob-url');
      expect(mockLink.download).toBe(mockFilename);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });
  });
});
