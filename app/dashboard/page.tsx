"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  BarChart3,
  Shield,
  Zap,
  Users,
} from "lucide-react"

export default function Dashboard() {
  const [websites] = useState([
    {
      id: 1,
      url: "example.com",
      status: "completed",
      lastAudit: "2 hours ago",
      score: 85,
      issues: { critical: 2, warning: 5, info: 8 },
      metrics: { seo: 92, performance: 78, security: 88, ux: 82 },
    },
    {
      id: 2,
      url: "mystore.com",
      status: "in-progress",
      lastAudit: "Running...",
      score: 0,
      issues: { critical: 0, warning: 0, info: 0 },
      metrics: { seo: 0, performance: 0, security: 0, ux: 0 },
    },
    {
      id: 3,
      url: "portfolio.dev",
      status: "completed",
      lastAudit: "1 day ago",
      score: 94,
      issues: { critical: 0, warning: 2, info: 3 },
      metrics: { seo: 96, performance: 91, security: 95, ux: 94 },
    },
  ])

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>
          <Button className="shimmer text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Websites</CardTitle>
                <Globe className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">3</div>
                <p className="text-xs text-gray-400">+1 from last month</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Avg Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">89.5</div>
                <p className="text-xs text-green-400">+5.2% from last week</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">2</div>
                <p className="text-xs text-red-400">Needs attention</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Audits This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">12</div>
                <p className="text-xs text-purple-400">+3 from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Websites List */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Websites</CardTitle>
              <CardDescription className="text-gray-300">Manage and monitor your website audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {websites.map((website) => (
                  <div key={website.id} className="neomorphism rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{website.url}</h3>
                          <p className="text-gray-400 text-sm">Last audit: {website.lastAudit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(website.status)}>
                          {website.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {website.status}
                        </Badge>
                        {website.status === "completed" && (
                          <div className={`text-2xl font-bold ${getScoreColor(website.score)}`}>{website.score}</div>
                        )}
                      </div>
                    </div>

                    {website.status === "completed" && (
                      <>
                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <BarChart3 className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-300">SEO</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{website.metrics.seo}</div>
                            <Progress value={website.metrics.seo} className="h-1 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-gray-300">Performance</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{website.metrics.performance}</div>
                            <Progress value={website.metrics.performance} className="h-1 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-gray-300">Security</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{website.metrics.security}</div>
                            <Progress value={website.metrics.security} className="h-1 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-gray-300">UX</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{website.metrics.ux}</div>
                            <Progress value={website.metrics.ux} className="h-1 mt-1" />
                          </div>
                        </div>

                        {/* Issues Summary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm text-gray-300">{website.issues.critical} Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-sm text-gray-300">{website.issues.warning} Warning</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-gray-300">{website.issues.info} Info</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Report
                            </Button>
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

                    {website.status === "in-progress" && (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300">Analyzing your website...</p>
                        <p className="text-gray-400 text-sm">This usually takes 2-5 minutes</p>
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
