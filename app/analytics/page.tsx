"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Shield,
  Users,
  Globe,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { PerformanceChart } from "@/components/analytics/performance-chart"
import { ComparisonChart } from "@/components/analytics/comparison-chart"
import { HeatmapChart } from "@/components/analytics/heatmap-chart"
import { MetricsDistribution } from "@/components/analytics/metrics-distribution"
import { TrendAnalysis } from "@/components/analytics/trend-analysis"
import { CompetitorComparison } from "@/components/analytics/competitor-comparison"
import { IssueBreakdown } from "@/components/analytics/issue-breakdown"
import { PerformanceInsights } from "@/components/analytics/performance-insights"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedWebsites, setSelectedWebsites] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  const websites = [
    { id: "all", name: "All Websites" },
    { id: "example.com", name: "example.com" },
    { id: "mystore.com", name: "mystore.com" },
    { id: "portfolio.dev", name: "portfolio.dev" },
  ]

  const overviewStats = [
    {
      title: "Total Audits",
      value: "247",
      change: "+12%",
      trend: "up",
      icon: BarChart3,
      color: "text-blue-400",
      description: "vs last period",
    },
    {
      title: "Avg Score",
      value: "84.2",
      change: "+5.8",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-400",
      description: "points improvement",
    },
    {
      title: "Critical Issues",
      value: "23",
      change: "-31%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-400",
      description: "issues resolved",
    },
    {
      title: "Pages Analyzed",
      value: "1,847",
      change: "+18%",
      trend: "up",
      icon: Globe,
      color: "text-purple-400",
      description: "total pages",
    },
  ]

  const categoryPerformance = [
    {
      category: "SEO",
      current: 87.5,
      previous: 82.1,
      trend: "up",
      icon: BarChart3,
      color: "text-green-400",
      issues: { resolved: 15, new: 3, total: 8 },
    },
    {
      category: "Performance",
      current: 76.8,
      previous: 71.2,
      trend: "up",
      icon: Zap,
      color: "text-yellow-400",
      issues: { resolved: 12, new: 7, total: 18 },
    },
    {
      category: "Security",
      current: 91.3,
      previous: 89.7,
      trend: "up",
      icon: Shield,
      color: "text-blue-400",
      issues: { resolved: 8, new: 2, total: 4 },
    },
    {
      category: "UX",
      current: 83.2,
      previous: 85.1,
      trend: "down",
      icon: Users,
      color: "text-purple-400",
      issues: { resolved: 6, new: 9, total: 12 },
    },
  ]

  const topIssues = [
    {
      title: "Large Cumulative Layout Shift",
      category: "Performance",
      frequency: 78,
      impact: "High",
      trend: "increasing",
      affectedSites: 12,
    },
    {
      title: "Missing Meta Descriptions",
      category: "SEO",
      frequency: 65,
      impact: "Medium",
      trend: "decreasing",
      affectedSites: 8,
    },
    {
      title: "Unoptimized Images",
      category: "Performance",
      frequency: 52,
      impact: "Medium",
      trend: "stable",
      affectedSites: 15,
    },
    {
      title: "Missing Alt Text",
      category: "UX",
      frequency: 43,
      impact: "Medium",
      trend: "decreasing",
      affectedSites: 9,
    },
    {
      title: "Slow Server Response",
      category: "Performance",
      frequency: 38,
      impact: "High",
      trend: "increasing",
      affectedSites: 6,
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case "down":
        return <ArrowDownRight className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
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

  const getIssueTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-400" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Advanced Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 neomorphism border-0 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedWebsites} onValueChange={setSelectedWebsites}>
              <SelectTrigger className="w-40 neomorphism border-0 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {websites.map((website) => (
                  <SelectItem key={website.id} value={website.id}>
                    {website.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="shimmer text-white font-semibold">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <Card key={index} className="glass-card border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm ${getTrendColor(stat.trend)}`}>{stat.change}</span>
                      <span className="text-xs text-gray-400 ml-1">{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-black/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/20">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/20">
                  Trends
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-500/20">
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500/20">
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Category Performance */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Category Performance</CardTitle>
                    <CardDescription className="text-gray-300">
                      Track improvements across all audit categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {categoryPerformance.map((category, index) => (
                        <div key={index} className="neomorphism p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <category.icon className={`w-5 h-5 ${category.color}`} />
                              <span className="text-white font-semibold">{category.category}</span>
                            </div>
                            {getTrendIcon(category.trend)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-2xl font-bold ${category.color}`}>{category.current}</span>
                              <span className="text-sm text-gray-400">
                                {category.trend === "up" ? "+" : ""}
                                {(category.current - category.previous).toFixed(1)}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-green-400 font-semibold">{category.issues.resolved}</div>
                                <div className="text-gray-400">Resolved</div>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-400 font-semibold">{category.issues.new}</div>
                                <div className="text-gray-400">New</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-400 font-semibold">{category.issues.total}</div>
                                <div className="text-gray-400">Total</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Score Trends Over Time</CardTitle>
                    <CardDescription className="text-gray-300">
                      Track your website scores across all categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart timeRange={timeRange} />
                  </CardContent>
                </Card>

                {/* Top Issues */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Most Common Issues</CardTitle>
                    <CardDescription className="text-gray-300">
                      Issues found most frequently across your websites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topIssues.map((issue, index) => (
                        <div key={index} className="neomorphism p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-white font-semibold">{issue.title}</h3>
                                <Badge className={getImpactColor(issue.impact)}>{issue.impact} Impact</Badge>
                                <Badge variant="outline" className="border-white/20 text-gray-300">
                                  {issue.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Found in {issue.affectedSites} websites</span>
                                <span>{issue.frequency}% frequency</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getIssueTrendIcon(issue.trend)}
                              <span className="text-sm text-gray-400 capitalize">{issue.trend}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${issue.frequency}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Performance Metrics Distribution */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics Distribution</CardTitle>
                    <CardDescription className="text-gray-300">
                      Distribution of Core Web Vitals across all audited pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MetricsDistribution />
                  </CardContent>
                </Card>

                {/* Performance Heatmap */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Heatmap</CardTitle>
                    <CardDescription className="text-gray-300">
                      Visual representation of performance across different pages and time periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HeatmapChart />
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <PerformanceInsights />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                {/* Trend Analysis */}
                <TrendAnalysis timeRange={timeRange} />

                {/* Issue Breakdown */}
                <IssueBreakdown />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                {/* Website Comparison */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Website Comparison</CardTitle>
                    <CardDescription className="text-gray-300">
                      Compare performance across your different websites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComparisonChart />
                  </CardContent>
                </Card>

                {/* Competitor Comparison */}
                <CompetitorComparison />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {/* AI-Powered Insights */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      AI-Powered Insights
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Intelligent recommendations based on your audit data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="neomorphism p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Performance Improvement Opportunity</h3>
                            <p className="text-gray-300 text-sm mb-2">
                              Your SEO scores have improved by 15% over the last month. Consider focusing on performance
                              optimization next, as it shows the highest potential for improvement.
                            </p>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Potential +12 point score increase
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="neomorphism p-4 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Critical Issue Pattern Detected</h3>
                            <p className="text-gray-300 text-sm mb-2">
                              Large Cumulative Layout Shift issues are appearing across 78% of your audits. This
                              suggests a systematic problem that could be addressed with a single fix.
                            </p>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              High impact fix available
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="neomorphism p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Benchmark Achievement</h3>
                            <p className="text-gray-300 text-sm mb-2">
                              Your security scores are now in the top 10% of websites in your industry. Consider
                              showcasing this achievement to build trust with your users.
                            </p>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Top 10% performer</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="neomorphism p-4 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Optimization Schedule Recommendation</h3>
                            <p className="text-gray-300 text-sm mb-2">
                              Based on your audit frequency, we recommend running audits every 2 weeks to catch issues
                              early and maintain your current improvement trajectory.
                            </p>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Optimal frequency: Bi-weekly
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ROI Calculator */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Optimization ROI Calculator</CardTitle>
                    <CardDescription className="text-gray-300">
                      Estimated impact of your website optimizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center neomorphism p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">+23%</div>
                        <div className="text-sm text-gray-300">Estimated Traffic Increase</div>
                        <div className="text-xs text-gray-400 mt-1">Based on SEO improvements</div>
                      </div>
                      <div className="text-center neomorphism p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">+15%</div>
                        <div className="text-sm text-gray-300">Conversion Rate Boost</div>
                        <div className="text-xs text-gray-400 mt-1">From UX enhancements</div>
                      </div>
                      <div className="text-center neomorphism p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">-18%</div>
                        <div className="text-sm text-gray-300">Bounce Rate Reduction</div>
                        <div className="text-xs text-gray-400 mt-1">Performance optimizations</div>
                      </div>
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
