// src/components/audit/export-audit-button.tsx
// Component for exporting audit reports in different formats

"use client";

import { useState } from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAuditDataForExport, 
  exportAuditToPdf, 
  exportAuditToCsv 
} from "@/lib/export/export-service";

interface ExportAuditButtonProps {
  auditId: string;
  websiteName: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportAuditButton({
  auditId,
  websiteName,
  className,
  variant = "outline",
  size = "default",
}: ExportAuditButtonProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setIsExporting("pdf");
      
      // Get audit data
      const data = await getAuditDataForExport(auditId);
      
      // Generate PDF
      const pdfBlob = await exportAuditToPdf(data);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${websiteName.replace(/\s+/g, "-").toLowerCase()}-audit-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: "Export successful",
        description: "Your audit report has been exported as PDF",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: (error as Error).message || "Failed to export audit report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  // Handle export to CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting("csv");
      
      // Get audit data
      const data = await getAuditDataForExport(auditId);
      
      // Generate CSV
      const csvContent = await exportAuditToCsv(data);
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${websiteName.replace(/\s+/g, "-").toLowerCase()}-audit-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: "Export successful",
        description: "Your audit report has been exported as CSV",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export failed",
        description: (error as Error).message || "Failed to export audit report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={!!isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleExportPdf}
          disabled={isExporting === "pdf"}
          className="cursor-pointer"
        >
          {isExporting === "pdf" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportCsv}
          disabled={isExporting === "csv"}
          className="cursor-pointer"
        >
          {isExporting === "csv" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-2" />
          )}
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
