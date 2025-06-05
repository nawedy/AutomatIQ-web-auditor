"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Globe, AlertCircle, Loader2, FileText, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AuditReport {
  id: string
  website: string
  date: string
  score: number
  status: string
}

interface BulkExportProps {
  reports: AuditReport[]
  onExportComplete?: () => void
}

export function BulkExport({ reports, onExportComplete }: BulkExportProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map((r) => r.id))
    }
  }

  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleBulkExport = async () => {
    try {
      setIsExporting(true)
      setExportProgress(0)
      setError(null)
      
      // Start progress indicator
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          // Don't go to 100% until we're done
          return prev < 90 ? prev + 5 : prev;
        });
      }, 500);
      
      // Call the bulk export API
      const response = await fetch('/api/export/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditIds: selectedReports,
          format: exportFormat,
          options: {
            includeDetails: true,
            includeSummary: true,
            includeRecommendations: true,
            includeBranding: true
          }
        }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export reports');
      }
      
      // Set progress to 100%
      setExportProgress(100);
      
      // Get the file as blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-reports-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: "Export successful",
        description: `${selectedReports.length} reports have been exported successfully`,
        variant: "default",
      });
      
      // Call the onExportComplete callback if provided
      if (onExportComplete) {
        onExportComplete();
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : 'Failed to export reports',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          Bulk Export
        </CardTitle>
        <CardDescription className="text-gray-300">Export multiple reports at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="neomorphism border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="pdf">PDF Reports</SelectItem>
                <SelectItem value="zip">ZIP Archive</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
                <SelectItem value="xlsx">Excel Workbook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={selectedReports.length === 0 || isExporting}
                  className="w-full shimmer text-white font-semibold"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isExporting ? "Exporting..." : `Export ${selectedReports.length} Reports`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-white/10">
                <DropdownMenuItem 
                  onClick={() => {
                    setExportFormat('pdf');
                    handleBulkExport();
                  }}
                  disabled={isExporting || selectedReports.length === 0}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setExportFormat('csv');
                    handleBulkExport();
                  }}
                  disabled={isExporting || selectedReports.length === 0}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setExportFormat('zip');
                    handleBulkExport();
                  }}
                  disabled={isExporting || selectedReports.length === 0}
                  className="cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as ZIP (PDF + CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Exporting reports...</span>
              <span className="text-white">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Export failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Report Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Select Reports</h3>
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-white/20 text-white">
              {selectedReports.length === reports.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`neomorphism p-3 rounded-lg cursor-pointer transition-all ${
                  selectedReports.includes(report.id) ? "ring-2 ring-blue-500/50" : ""
                }`}
                onClick={() => handleSelectReport(report.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{report.website}</span>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{report.score}</div>
                        <div className="text-xs text-gray-400">{report.date}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        {selectedReports.length > 0 && (
          <div className="neomorphism p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Export Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Selected Reports</div>
                <div className="text-white font-semibold">{selectedReports.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Export Format</div>
                <div className="text-white font-semibold">{exportFormat.toUpperCase()}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
