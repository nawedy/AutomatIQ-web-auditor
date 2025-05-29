"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  Clock,
  Globe,
  BarChart3,
  Zap,
  Shield,
  Users,
  AlertTriangle,
  Info,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react"
import Link from "next/link"
import { ReportChart } from "@/components/report-chart"
import { RecommendationCard } from "@/components/recommendation-card"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real app, this would be fetched based on params.id
  const report = {
    id: params.id,
    website: "example.com",
    url: "https://example.com",
    date: "2024-03-15",
    duration: "3m 24s",
    pages: 45,
    score: 85,
    previousScore: 78,
    metrics: {
      seo: { score: 92, previous: 88, issues: 3 },
      performance: { score: 78, previous: 72, issues: 8 },
      security: { score: 88, previous: 85, issues: 2 },
      ux: { score: 82, previous: 79, issues: 5 },
    },
    issues: {
      critical: [
        {
          category: "Performance",
          title: "Large Cumulative Layout Shift (CLS)",
          description: "Your page has a CLS score of 0.25, which is above the recommended threshold of 0.1.",
          impact: "High",
          effort: "Medium",
          pages: ["Homepage", "Product Page"],
          recommendation: "Optimize image dimensions and reserve space for dynamic content",
        },
        {
          category: "SEO",
          title: "Missing Meta Descriptions",
          description: "15 pages are missing meta descriptions, which can impact search engine rankings.",
          impact: "High",
          effort: "Low",
          pages: ["About", "Contact", "Blog Posts"],
          recommendation: "Add unique, descriptive meta descriptions to all pages",
        },
      ],
      warning: [
        {
          category: "Performance",
          title: "Unoptimized Images",
          description: "Several images could be compressed or converted to modern formats.",
          impact: "Medium",
          effort: "Low",
          pages: ["Homepage", "Gallery"],
          recommendation: "Use WebP format and implement lazy loading",
        },
        {
          category: "Security",
          title: "Missing Security Headers",
          description: "Some security headers like X-Frame-Options are not configured.",
          impact: "Medium",
          effort: "Medium",
          pages: ["All pages"],
          recommendation: "Configure security headers in your web server",
        },
      ],
      info: [
        {
          category: "SEO",
          title: "Alt Text Optimization",
          description: "Some images have generic alt text that could be more descriptive.",
          impact: "Low",
          effort: "Low",
          pages: ["Product Pages"],
          recommendation: "Write descriptive alt text for better accessibility and SEO",
        },
      ],
    },
    performanceMetrics: {
      fcp: { value: 1.2, threshold: 1.8, status: "good" },
      lcp: { value: 2.8, threshold: 2.5, status: "needs-improvement" },
      cls: { value: 0.25, threshold: 0.1, status: "poor" },
      fid: { value: 45, threshold: 100, status: "good" },
      ttfb: { value: 0.8, threshold: 0.8, status: "good" },
    },
    seoMetrics: {
      titleTags: { score: 95, issues: 1 },
      metaDescriptions: { score: 70, issues: 15 },
      headings: { score: 88, issues: 3 },
      internalLinks: { score: 92, issues: 2 },
      imageAlt: { score: 85, issues: 8 },
    },
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreChange = (current: number, previous: number) => {
    const change = current - previous
    if (change > 0) return { icon: TrendingUp, color: "text-green-400", text: `+${change}` }
    if (change < 0) return { icon: TrendingDown, color: "text-red-400", text: `${change}` }
    return { icon: Minus, color: "text-gray-400", text: "0" }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPerformanceStatus = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400"
      case "needs-improvement":
        return "text-yellow-400"
      case "poor":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{report.website} - Audit Report</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="shimmer text-white font-semibold">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-6">
            {/* Report Header */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl">{report.website}</CardTitle>
                      <div className="flex items-center gap-4 text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400"
                          >
                            {report.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{report.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{report.duration}</span>
                        </div>
                        <span>{report.pages} pages analyzed</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(report.score)}`}>{report.score}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {(() => {
                        const change = getScoreChange(report.score, report.previousScore)
                        return (
                          <>
                            <change.icon className={`w-4 h-4 ${change.color}`} />
                            <span className={change.color}>{change.text} from last audit</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { key: "seo", icon: BarChart3, label: "SEO", color: "text-green-400" },
                { key: "performance", icon: Zap, label: "Performance", color: "text-yellow-400" },
                { key: "security", icon: Shield, label: "Security", color: "text-blue-400" },
                { key: "ux", icon: Users, label: "UX", color: "text-purple-400" },
              ].map((metric) => {
                const data = report.metrics[metric.key as keyof typeof report.metrics]
                const change = getScoreChange(data.score, data.previous)
                return (
                  <Card key={metric.key} className="glass-card border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">{metric.label}</CardTitle>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>{data.score}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <change.icon className={`w-3 h-3 ${change.color}`} />
                          <span className={change.color}>{change.text}</span>
                        </div>
                        <span className="text-xs text-gray-400">{data.issues} issues</span>
                      </div>
                      <Progress value={data.score} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-black/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/20">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-blue-500/20">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-500/20">
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Issues Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Critical Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-400 mb-2">{report.issues.critical.length}</div>
                      <p className="text-gray-400 text-sm">Require immediate attention</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Warning Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">{report.issues.warning.length}</div>
                      <p className="text-gray-400 text-sm">Should be addressed soon</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        Info Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-400 mb-2">{report.issues.info.length}</div>
                      <p className="text-gray-400 text-sm">Minor improvements</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Trend Chart */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Score Trends</CardTitle>
                    <CardDescription className="text-gray-300">
                      Track your website's performance over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Core Web Vitals */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Core Web Vitals</CardTitle>
                    <CardDescription className="text-gray-300">
                      Key metrics that Google uses to measure user experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {Object.entries(report.performanceMetrics).map(([key, metric]) => (
                        <div key={key} className="text-center">
                          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">{key.toUpperCase()}</div>
                          <div className={`text-2xl font-bold ${getPerformanceStatus(metric.status)}`}>
                            {metric.value}
                            {key === "fid" ? "ms" : key === "cls" ? "" : "s"}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Threshold: {metric.threshold}
                            {key === "fid" ? "ms" : key === "cls" ? "" : "s"}
                          </div>
                          <Badge
                            className={`mt-2 ${
                              getPerformanceStatus(metric.status) === "text-green-400"
                                ? "bg-green-500/20 text-green-400"
                                : getPerformanceStatus(metric.status) === "text-yellow-400"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {metric.status.replace("-", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Issues */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...report.issues.critical, ...report.issues.warning]
                        .filter((issue) => issue.category === "Performance")
                        .map((issue, index) => (
                          <RecommendationCard key={index} issue={issue} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                {/* SEO Metrics */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">SEO Analysis</CardTitle>
                    <CardDescription className="text-gray-300">
                      Search engine optimization metrics and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {Object.entries(report.seoMetrics).map(([key, metric]) => (
                        <div key={key} className="text-center">
                          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>{metric.score}</div>
                          <div className="text-xs text-gray-400 mt-1">{metric.issues} issues found</div>
                          <Progress value={metric.score} className="h-1 mt-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Issues */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">SEO Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...report.issues.critical, ...report.issues.warning, ...report.issues.info]
                        .filter((issue) => issue.category === "SEO")
                        .map((issue, index) => (
                          <RecommendationCard key={index} issue={issue} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {/* Priority Recommendations */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      Priority Recommendations
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Start with these high-impact improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.issues.critical.map((issue, index) => (
                        <RecommendationCard key={index} issue={issue} priority />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* All Recommendations */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">All Recommendations</CardTitle>
                    <CardDescription className="text-gray-300">
                      Complete list of optimization opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...report.issues.warning, ...report.issues.info].map((issue, index) => (
                        <RecommendationCard key={index} issue={issue} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
