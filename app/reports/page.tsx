"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Globe,
  BarChart3,
  Zap,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const reports = [
    {
      id: 1,
      website: "example.com",
      date: "2024-03-15",
      status: "completed",
      score: 85,
      issues: { critical: 2, warning: 5, info: 8 },
      metrics: { seo: 92, performance: 78, security: 88, ux: 82 },
      pages: 45,
      duration: "3m 24s",
    },
    {
      id: 2,
      website: "mystore.com",
      date: "2024-03-14",
      status: "completed",
      score: 94,
      issues: { critical: 0, warning: 2, info: 3 },
      metrics: { seo: 96, performance: 91, security: 95, ux: 94 },
      pages: 23,
      duration: "2m 15s",
    },
    {
      id: 3,
      website: "portfolio.dev",
      date: "2024-03-13",
      status: "completed",
      score: 72,
      issues: { critical: 4, warning: 8, info: 12 },
      metrics: { seo: 68, performance: 65, security: 82, ux: 74 },
      pages: 12,
      duration: "1m 45s",
    },
    {
      id: 4,
      website: "blog.example.com",
      date: "2024-03-12",
      status: "in-progress",
      score: 0,
      issues: { critical: 0, warning: 0, info: 0 },
      metrics: { seo: 0, performance: 0, security: 0, ux: 0 },
      pages: 0,
      duration: "Running...",
    },
    {
      id: 5,
      website: "shop.demo.com",
      date: "2024-03-11",
      status: "failed",
      score: 0,
      issues: { critical: 0, warning: 0, info: 0 },
      metrics: { seo: 0, performance: 0, security: 0, ux: 0 },
      pages: 0,
      duration: "Failed",
    },
  ]

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.website.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Audit Reports</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{reports.length}</div>
                <p className="text-xs text-gray-400">+2 from last week</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Avg Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">83.7</div>
                <p className="text-xs text-green-400">+4.2% improvement</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">6</div>
                <p className="text-xs text-red-400">Across all sites</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pages Audited</CardTitle>
                <Globe className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">80</div>
                <p className="text-xs text-purple-400">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by website..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 neomorphism border-0 text-white placeholder-gray-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 neomorphism border-0 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 neomorphism border-0 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="score">Score (Highest)</SelectItem>
                    <SelectItem value="website">Website (A-Z)</SelectItem>
                    <SelectItem value="issues">Issues (Most)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Reports</CardTitle>
              <CardDescription className="text-gray-300">View and manage your website audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="neomorphism rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{report.website}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{report.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{report.duration}</span>
                            </div>
                            {report.status === "completed" && <span>{report.pages} pages</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status}</span>
                        </Badge>
                        {report.status === "completed" && (
                          <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>{report.score}</div>
                        )}
                      </div>
                    </div>

                    {report.status === "completed" && (
                      <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <BarChart3 className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-300">SEO</span>
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(report.metrics.seo)}`}>
                              {report.metrics.seo}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-gray-300">Performance</span>
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(report.metrics.performance)}`}>
                              {report.metrics.performance}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-gray-300">Security</span>
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(report.metrics.security)}`}>
                              {report.metrics.security}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-gray-300">UX</span>
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(report.metrics.ux)}`}>
                              {report.metrics.ux}
                            </div>
                          </div>
                        </div>

                        {/* Issues Summary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm text-gray-300">{report.issues.critical} Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-sm text-gray-300">{report.issues.warning} Warning</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-gray-300">{report.issues.info} Info</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/reports/${report.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {report.status === "in-progress" && (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300">Analyzing your website...</p>
                        <p className="text-gray-400 text-sm">This usually takes 2-5 minutes</p>
                      </div>
                    )}

                    {report.status === "failed" && (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                        <p className="text-gray-300">Audit failed</p>
                        <p className="text-gray-400 text-sm">Please try running the audit again</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 mt-4"
                        >
                          Retry Audit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </div>
  )
}
