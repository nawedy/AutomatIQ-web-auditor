"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWebSocket } from "@/components/real-time/websocket-provider"
import { Activity, Globe, AlertTriangle, TrendingUp, Clock } from "lucide-react"

interface RealTimeStats {
  activeAudits: number
  totalWebsites: number
  criticalIssues: number
  avgScore: number
  lastUpdate: string
}

export function RealTimeStats() {
  const { isConnected, subscribe } = useWebSocket()
  const [stats, setStats] = useState<RealTimeStats>({
    activeAudits: 3,
    totalWebsites: 12,
    criticalIssues: 7,
    avgScore: 82,
    lastUpdate: new Date().toISOString(),
  })

  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string
      type: string
      message: string
      timestamp: string
      severity: "info" | "warning" | "error"
    }>
  >([
    {
      id: "1",
      type: "audit_complete",
      message: "Audit completed for example.com (Score: 85)",
      timestamp: new Date().toISOString(),
      severity: "info",
    },
    {
      id: "2",
      type: "issue_detected",
      message: "Critical performance issue detected on mystore.com",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      severity: "error",
    },
    {
      id: "3",
      type: "website_added",
      message: "New website added: blog.example.com",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      severity: "info",
    },
  ])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeAuditComplete = subscribe("audit_complete", (data) => {
      setStats((prev) => ({
        ...prev,
        activeAudits: Math.max(0, prev.activeAudits - 1),
        lastUpdate: new Date().toISOString(),
      }))

      setRecentActivity((prev) => [
        {
          id: `activity_${Date.now()}`,
          type: "audit_complete",
          message: `Audit completed for website (Score: ${data.score})`,
          timestamp: new Date().toISOString(),
          severity: "info",
        },
        ...prev.slice(0, 9),
      ])
    })

    const unsubscribeIssueDetected = subscribe("issue_detected", (data) => {
      setStats((prev) => ({
        ...prev,
        criticalIssues: prev.criticalIssues + (data.severity === "critical" ? 1 : 0),
        lastUpdate: new Date().toISOString(),
      }))

      setRecentActivity((prev) => [
        {
          id: `activity_${Date.now()}`,
          type: "issue_detected",
          message: `${data.severity} ${data.type} issue: ${data.message}`,
          timestamp: new Date().toISOString(),
          severity: data.severity === "critical" ? "error" : "warning",
        },
        ...prev.slice(0, 9),
      ])
    })

    const unsubscribeAuditProgress = subscribe("audit_progress", (data) => {
      // Update active audits count if needed
      setStats((prev) => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
      }))
    })

    return () => {
      unsubscribeAuditComplete()
      unsubscribeIssueDetected()
      unsubscribeAuditProgress()
    }
  }, [subscribe])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
        <span className="text-sm text-gray-400">{isConnected ? "Real-time updates active" : "Connecting..."}</span>
        <span className="text-xs text-gray-500">Last update: {new Date(stats.lastUpdate).toLocaleTimeString()}</span>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Audits</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeAudits}</div>
            <p className="text-xs text-blue-400">Running now</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Websites</CardTitle>
            <Globe className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalWebsites}</div>
            <p className="text-xs text-green-400">Monitored</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.criticalIssues}</div>
            <p className="text-xs text-red-400">Need attention</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
            <p className="text-xs text-purple-400">Overall health</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-300">Live updates from your website audits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between neomorphism p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
                <Badge className={getSeverityColor(activity.severity)}>{activity.severity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
