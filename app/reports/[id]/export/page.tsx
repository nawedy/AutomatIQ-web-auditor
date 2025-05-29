"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  FileText,
  Eye,
  Share2,
  Mail,
  Calendar,
  CheckCircle,
  Palette,
  Layout,
  FileSpreadsheet,
  Database,
} from "lucide-react"
import Link from "next/link"
import { PDFPreview } from "@/components/export/pdf-preview"
import { ExportProgress } from "@/components/export/export-progress"

export default function ExportPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  // PDF Export Settings
  const [pdfSettings, setPdfSettings] = useState({
    format: "a4",
    orientation: "portrait",
    includeCharts: true,
    includeCoverPage: true,
    includeExecutiveSummary: true,
    includeDetailedAnalysis: true,
    includeRecommendations: true,
    includeAppendix: true,
    branding: "default",
    customLogo: "",
    customColors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
    },
    watermark: false,
    pageNumbers: true,
    tableOfContents: true,
  })

  // Data Export Settings
  const [dataSettings, setDataSettings] = useState({
    format: "csv",
    includeRawData: true,
    includeMetrics: true,
    includeIssues: true,
    includeRecommendations: true,
    includeTimestamps: true,
    dateRange: "all",
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    recipients: "",
    subject: `Website Audit Report - ${params.id}`,
    message: "Please find the attached website audit report.",
    includeLink: true,
    scheduleDelivery: false,
    deliveryDate: "",
  })

  const handlePDFExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const progressSteps = [
      { step: "Generating cover page...", progress: 10 },
      { step: "Creating executive summary...", progress: 25 },
      { step: "Rendering charts and graphs...", progress: 45 },
      { step: "Compiling detailed analysis...", progress: 65 },
      { step: "Adding recommendations...", progress: 80 },
      { step: "Finalizing PDF...", progress: 95 },
      { step: "Export complete!", progress: 100 },
    ]

    for (const step of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setExportProgress(step.progress)
    }

    setIsExporting(false)
    setExportComplete(true)
  }

  const handleDataExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    const progressSteps = [
      { step: "Extracting audit data...", progress: 20 },
      { step: "Processing metrics...", progress: 40 },
      { step: "Formatting data...", progress: 60 },
      { step: "Generating file...", progress: 80 },
      { step: "Export complete!", progress: 100 },
    ]

    for (const step of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setExportProgress(step.progress)
    }

    setIsExporting(false)
    setExportComplete(true)
  }

  const handleEmailSend = async () => {
    setIsExporting(true)
    setExportProgress(0)

    const progressSteps = [
      { step: "Generating report...", progress: 30 },
      { step: "Preparing email...", progress: 60 },
      { step: "Sending email...", progress: 90 },
      { step: "Email sent successfully!", progress: 100 },
    ]

    for (const step of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 700))
      setExportProgress(step.progress)
    }

    setIsExporting(false)
    setExportComplete(true)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <Link href={`/reports/${params.id}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Report
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Export Report</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-6">
            {/* Export Options */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Export Options</CardTitle>
                <CardDescription className="text-gray-300">
                  Choose how you want to export and share your audit report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 bg-black/20">
                    <TabsTrigger value="pdf" className="data-[state=active]:bg-blue-500/20">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF Report
                    </TabsTrigger>
                    <TabsTrigger value="data" className="data-[state=active]:bg-blue-500/20">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Data Export
                    </TabsTrigger>
                    <TabsTrigger value="email" className="data-[state=active]:bg-blue-500/20">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Report
                    </TabsTrigger>
                  </TabsList>

                  {/* PDF Export Tab */}
                  <TabsContent value="pdf" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* PDF Settings */}
                      <div className="space-y-6">
                        {/* Format Settings */}
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Layout className="w-5 h-5 text-blue-400" />
                              Format Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white">Page Size</Label>
                                <Select
                                  value={pdfSettings.format}
                                  onValueChange={(value) => setPdfSettings({ ...pdfSettings, format: value })}
                                >
                                  <SelectTrigger className="neomorphism border-0 text-white mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-white/10">
                                    <SelectItem value="a4">A4</SelectItem>
                                    <SelectItem value="letter">Letter</SelectItem>
                                    <SelectItem value="legal">Legal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-white">Orientation</Label>
                                <Select
                                  value={pdfSettings.orientation}
                                  onValueChange={(value) => setPdfSettings({ ...pdfSettings, orientation: value })}
                                >
                                  <SelectTrigger className="neomorphism border-0 text-white mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-white/10">
                                    <SelectItem value="portrait">Portrait</SelectItem>
                                    <SelectItem value="landscape">Landscape</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Content Settings */}
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <FileText className="w-5 h-5 text-green-400" />
                              Content Sections
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {[
                              { key: "includeCoverPage", label: "Cover Page" },
                              { key: "includeExecutiveSummary", label: "Executive Summary" },
                              { key: "includeDetailedAnalysis", label: "Detailed Analysis" },
                              { key: "includeRecommendations", label: "Recommendations" },
                              { key: "includeCharts", label: "Charts & Graphs" },
                              { key: "includeAppendix", label: "Technical Appendix" },
                              { key: "tableOfContents", label: "Table of Contents" },
                              { key: "pageNumbers", label: "Page Numbers" },
                            ].map((option) => (
                              <div key={option.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option.key}
                                  checked={pdfSettings[option.key as keyof typeof pdfSettings] as boolean}
                                  onCheckedChange={(checked) =>
                                    setPdfSettings({ ...pdfSettings, [option.key]: checked })
                                  }
                                />
                                <Label htmlFor={option.key} className="text-gray-300">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Branding Settings */}
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Palette className="w-5 h-5 text-purple-400" />
                              Branding & Customization
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-white">Branding Style</Label>
                              <Select
                                value={pdfSettings.branding}
                                onValueChange={(value) => setPdfSettings({ ...pdfSettings, branding: value })}
                              >
                                <SelectTrigger className="neomorphism border-0 text-white mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10">
                                  <SelectItem value="default">AuditPro Default</SelectItem>
                                  <SelectItem value="minimal">Minimal</SelectItem>
                                  <SelectItem value="corporate">Corporate</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {pdfSettings.branding === "custom" && (
                              <>
                                <div>
                                  <Label className="text-white">Custom Logo URL</Label>
                                  <Input
                                    value={pdfSettings.customLogo}
                                    onChange={(e) => setPdfSettings({ ...pdfSettings, customLogo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <Label className="text-white text-sm">Primary Color</Label>
                                    <Input
                                      type="color"
                                      value={pdfSettings.customColors.primary}
                                      onChange={(e) =>
                                        setPdfSettings({
                                          ...pdfSettings,
                                          customColors: { ...pdfSettings.customColors, primary: e.target.value },
                                        })
                                      }
                                      className="neomorphism border-0 h-10 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white text-sm">Secondary Color</Label>
                                    <Input
                                      type="color"
                                      value={pdfSettings.customColors.secondary}
                                      onChange={(e) =>
                                        setPdfSettings({
                                          ...pdfSettings,
                                          customColors: { ...pdfSettings.customColors, secondary: e.target.value },
                                        })
                                      }
                                      className="neomorphism border-0 h-10 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white text-sm">Accent Color</Label>
                                    <Input
                                      type="color"
                                      value={pdfSettings.customColors.accent}
                                      onChange={(e) =>
                                        setPdfSettings({
                                          ...pdfSettings,
                                          customColors: { ...pdfSettings.customColors, accent: e.target.value },
                                        })
                                      }
                                      className="neomorphism border-0 h-10 mt-1"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="watermark"
                                checked={pdfSettings.watermark}
                                onCheckedChange={(checked) =>
                                  setPdfSettings({ ...pdfSettings, watermark: checked as boolean })
                                }
                              />
                              <Label htmlFor="watermark" className="text-gray-300">
                                Add watermark
                              </Label>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* PDF Preview */}
                      <div className="space-y-6">
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-400" />
                              Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <PDFPreview settings={pdfSettings} reportId={params.id} />
                          </CardContent>
                        </Card>

                        {/* Export Actions */}
                        <Card className="neomorphism border-white/10">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <Button
                                onClick={handlePDFExport}
                                disabled={isExporting}
                                className="w-full shimmer text-white font-semibold"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {isExporting ? "Generating PDF..." : "Download PDF Report"}
                              </Button>

                              <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </Button>
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Link
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Data Export Tab */}
                  <TabsContent value="data" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Data Export Settings */}
                      <div className="space-y-6">
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Database className="w-5 h-5 text-green-400" />
                              Export Format
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-white">File Format</Label>
                              <Select
                                value={dataSettings.format}
                                onValueChange={(value) => setDataSettings({ ...dataSettings, format: value })}
                              >
                                <SelectTrigger className="neomorphism border-0 text-white mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10">
                                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                                  <SelectItem value="json">JSON</SelectItem>
                                  <SelectItem value="xml">XML</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white">Date Range</Label>
                              <Select
                                value={dataSettings.dateRange}
                                onValueChange={(value) => setDataSettings({ ...dataSettings, dateRange: value })}
                              >
                                <SelectTrigger className="neomorphism border-0 text-white mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10">
                                  <SelectItem value="all">All Data</SelectItem>
                                  <SelectItem value="30d">Last 30 Days</SelectItem>
                                  <SelectItem value="90d">Last 90 Days</SelectItem>
                                  <SelectItem value="1y">Last Year</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white">Data Sections</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {[
                              { key: "includeRawData", label: "Raw Audit Data" },
                              { key: "includeMetrics", label: "Performance Metrics" },
                              { key: "includeIssues", label: "Issues & Recommendations" },
                              { key: "includeRecommendations", label: "Detailed Recommendations" },
                              { key: "includeTimestamps", label: "Timestamps & Metadata" },
                            ].map((option) => (
                              <div key={option.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option.key}
                                  checked={dataSettings[option.key as keyof typeof dataSettings] as boolean}
                                  onCheckedChange={(checked) =>
                                    setDataSettings({ ...dataSettings, [option.key]: checked })
                                  }
                                />
                                <Label htmlFor={option.key} className="text-gray-300">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Data Preview */}
                      <div className="space-y-6">
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white">Data Preview</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="neomorphism p-4 rounded-lg bg-black/20">
                              <pre className="text-gray-300 text-sm overflow-x-auto">
                                {dataSettings.format === "json"
                                  ? `{
  "audit_id": "${params.id}",
  "website": "example.com",
  "timestamp": "2024-03-15T10:30:00Z",
  "overall_score": 85,
  "metrics": {
    "seo": 92,
    "performance": 78,
    "security": 88,
    "ux": 82
  },
  "issues": [
    {
      "category": "Performance",
      "severity": "critical",
      "title": "Large CLS",
      "description": "..."
    }
  ]
}`
                                  : dataSettings.format === "csv"
                                    ? `audit_id,website,timestamp,overall_score,seo_score,performance_score
${params.id},example.com,2024-03-15T10:30:00Z,85,92,78
${params.id},example.com,2024-03-14T10:30:00Z,82,89,75`
                                    : `<?xml version="1.0" encoding="UTF-8"?>
<audit>
  <id>${params.id}</id>
  <website>example.com</website>
  <timestamp>2024-03-15T10:30:00Z</timestamp>
  <overall_score>85</overall_score>
</audit>`}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="neomorphism border-white/10">
                          <CardContent className="pt-6">
                            <Button
                              onClick={handleDataExport}
                              disabled={isExporting}
                              className="w-full shimmer text-white font-semibold"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {isExporting ? "Exporting Data..." : `Export ${dataSettings.format.toUpperCase()}`}
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Email Tab */}
                  <TabsContent value="email" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Email Settings */}
                      <div className="space-y-6">
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Mail className="w-5 h-5 text-blue-400" />
                              Email Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-white">Recipients</Label>
                              <Textarea
                                value={emailSettings.recipients}
                                onChange={(e) => setEmailSettings({ ...emailSettings, recipients: e.target.value })}
                                placeholder="Enter email addresses separated by commas"
                                className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label className="text-white">Subject</Label>
                              <Input
                                value={emailSettings.subject}
                                onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                                className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                              />
                            </div>

                            <div>
                              <Label className="text-white">Message</Label>
                              <Textarea
                                value={emailSettings.message}
                                onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                                className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                                rows={4}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeLink"
                                checked={emailSettings.includeLink}
                                onCheckedChange={(checked) =>
                                  setEmailSettings({ ...emailSettings, includeLink: checked as boolean })
                                }
                              />
                              <Label htmlFor="includeLink" className="text-gray-300">
                                Include link to online report
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="scheduleDelivery"
                                checked={emailSettings.scheduleDelivery}
                                onCheckedChange={(checked) =>
                                  setEmailSettings({ ...emailSettings, scheduleDelivery: checked as boolean })
                                }
                              />
                              <Label htmlFor="scheduleDelivery" className="text-gray-300">
                                Schedule delivery
                              </Label>
                            </div>

                            {emailSettings.scheduleDelivery && (
                              <div>
                                <Label className="text-white">Delivery Date & Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={emailSettings.deliveryDate}
                                  onChange={(e) => setEmailSettings({ ...emailSettings, deliveryDate: e.target.value })}
                                  className="neomorphism border-0 text-white mt-2"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Email Preview */}
                      <div className="space-y-6">
                        <Card className="neomorphism border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white">Email Preview</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="neomorphism p-4 rounded-lg space-y-3">
                              <div className="border-b border-white/10 pb-3">
                                <div className="text-sm text-gray-400">To:</div>
                                <div className="text-white">{emailSettings.recipients || "recipients@example.com"}</div>
                              </div>
                              <div className="border-b border-white/10 pb-3">
                                <div className="text-sm text-gray-400">Subject:</div>
                                <div className="text-white">{emailSettings.subject}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-2">Message:</div>
                                <div className="text-gray-300 whitespace-pre-wrap">{emailSettings.message}</div>
                                {emailSettings.includeLink && (
                                  <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                    <div className="text-blue-400 text-sm">
                                      🔗 View online report: https://auditpro.com/reports/{params.id}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="neomorphism border-white/10">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <Button
                                onClick={handleEmailSend}
                                disabled={isExporting || !emailSettings.recipients}
                                className="w-full shimmer text-white font-semibold"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                {isExporting ? "Sending Email..." : "Send Email Report"}
                              </Button>

                              {emailSettings.scheduleDelivery && emailSettings.deliveryDate && (
                                <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
                                  <Calendar className="w-4 h-4" />
                                  <span>Scheduled for {new Date(emailSettings.deliveryDate).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Export Progress */}
            {isExporting && (
              <ExportProgress progress={exportProgress} type={activeTab} onComplete={() => setExportComplete(true)} />
            )}

            {/* Export Complete */}
            {exportComplete && (
              <Card className="glass-card border-white/10 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <h3 className="text-xl font-semibold text-white">Export Complete!</h3>
                    <p className="text-gray-300">
                      Your {activeTab === "pdf" ? "PDF report" : activeTab === "data" ? "data export" : "email"} has
                      been {activeTab === "email" ? "sent" : "generated"} successfully.
                    </p>
                    <div className="flex gap-2 justify-center">
                      {activeTab !== "email" && (
                        <Button className="shimmer text-white font-semibold">
                          <Download className="w-4 h-4 mr-2" />
                          Download File
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setExportComplete(false)}
                      >
                        Export Another
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
