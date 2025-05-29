"use client"
import { BarChart3, CheckCircle, AlertTriangle } from "lucide-react"

interface PDFPreviewProps {
  settings: any
  reportId: string
}

export function PDFPreview({ settings, reportId }: PDFPreviewProps) {
  const mockData = {
    website: "example.com",
    date: "March 15, 2024",
    overallScore: 85,
    metrics: {
      seo: 92,
      performance: 78,
      security: 88,
      ux: 82,
    },
    issues: {
      critical: 2,
      warning: 5,
      info: 8,
    },
  }

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          aspectRatio: settings.orientation === "portrait" ? "210/297" : "297/210",
          maxHeight: "600px",
        }}
      >
        <div className="h-full overflow-hidden text-black text-xs p-4 space-y-3">
          {/* Cover Page Preview */}
          {settings.includeCoverPage && (
            <div className="text-center space-y-2 border-b pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                {settings.branding === "custom" && settings.customLogo ? (
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                ) : (
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: settings.customColors.primary }}
                  >
                    A
                  </div>
                )}
                <span className="font-bold text-lg">
                  {settings.branding === "custom" ? "Custom Brand" : "AuditPro"}
                </span>
              </div>
              <h1 className="text-xl font-bold">Website Audit Report</h1>
              <div className="text-gray-600">
                <div>{mockData.website}</div>
                <div>{mockData.date}</div>
              </div>
            </div>
          )}

          {/* Executive Summary Preview */}
          {settings.includeExecutiveSummary && (
            <div className="space-y-2 border-b pb-3">
              <h2 className="font-bold text-sm" style={{ color: settings.customColors.primary }}>
                Executive Summary
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold">{mockData.overallScore}</div>
                  <div className="text-xs text-gray-600">Overall Score</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-red-600">{mockData.issues.critical}</div>
                  <div className="text-xs text-gray-600">Critical Issues</div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Preview */}
          {settings.includeDetailedAnalysis && (
            <div className="space-y-2 border-b pb-3">
              <h2 className="font-bold text-sm" style={{ color: settings.customColors.primary }}>
                Performance Metrics
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mockData.metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-1 bg-gray-50 rounded">
                    <span className="capitalize text-xs">{key}</span>
                    <span className="font-semibold text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Preview */}
          {settings.includeCharts && (
            <div className="space-y-2 border-b pb-3">
              <h2 className="font-bold text-sm" style={{ color: settings.customColors.primary }}>
                Performance Charts
              </h2>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 ml-2">Chart Placeholder</span>
              </div>
            </div>
          )}

          {/* Recommendations Preview */}
          {settings.includeRecommendations && (
            <div className="space-y-2">
              <h2 className="font-bold text-sm" style={{ color: settings.customColors.primary }}>
                Key Recommendations
              </h2>
              <div className="space-y-1">
                <div className="flex items-start gap-2 p-1 bg-red-50 rounded">
                  <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-medium">Optimize Core Web Vitals</div>
                    <div className="text-gray-600">Improve LCP and CLS scores</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-1 bg-green-50 rounded">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-medium">SEO Performance Excellent</div>
                    <div className="text-gray-600">Continue current strategy</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Watermark */}
          {settings.watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-4xl font-bold opacity-10 rotate-45" style={{ color: settings.customColors.primary }}>
                DRAFT
              </div>
            </div>
          )}

          {/* Page Numbers */}
          {settings.pageNumbers && <div className="absolute bottom-2 right-2 text-xs text-gray-400">Page 1 of 12</div>}
        </div>
      </div>

      {/* Preview Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="neomorphism p-3 rounded-lg">
          <div className="text-gray-400 mb-1">Format</div>
          <div className="text-white">
            {settings.format.toUpperCase()} - {settings.orientation}
          </div>
        </div>
        <div className="neomorphism p-3 rounded-lg">
          <div className="text-gray-400 mb-1">Estimated Pages</div>
          <div className="text-white">
            {settings.includeCoverPage ? 1 : 0} +{" "}
            {(settings.includeExecutiveSummary ? 2 : 0) +
              (settings.includeDetailedAnalysis ? 6 : 0) +
              (settings.includeRecommendations ? 3 : 0) +
              (settings.includeAppendix ? 2 : 0)}{" "}
            pages
          </div>
        </div>
      </div>
    </div>
  )
}
