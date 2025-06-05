"use client"

// src/components/admin/audit-metrics.tsx
// Component for displaying audit metrics and statistics across all clients

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, AlertCircle, RefreshCw, Loader2, Calendar } from "lucide-react"

// Type definitions for audit metrics data
interface CategoryScore {
  category: string
  average: number
  highest: number
  lowest: number
}

interface DailyIssue {
  date: string
  critical: number
  warning: number
  info: number
}

interface AuditMetricsData {
  totalAudits: number
  completedAudits: number
  failedAudits: number
  averageAuditDuration: number
  categoryScores: CategoryScore[]
  issuesByDay: DailyIssue[]
  issuesBySeverity: {
    critical: number
    warning: number
    info: number
  }
  issuesByCategory: {
    category: string
    count: number
  }[]
  auditsByDay: {
    date: string
    count: number
  }[]
  averageScores: {
    overall: number
    previousPeriod: number
    change: number
  }
  issuesFixed: {
    count: number
    rate: number
    change: number
  }
}

interface AuditMetricsProps {
  refreshInterval?: number // in milliseconds, default is 60000 (1 minute)
  initialLoad?: boolean // whether to load data on mount, default is true
  timeRange?: string // time range for metrics, default is "week"
}

export function AdminAuditMetrics({ 
  refreshInterval = 60000, 
  initialLoad = true,
  timeRange = "week" 
}: AuditMetricsProps = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoad)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [metricsData, setMetricsData] = useState<AuditMetricsData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange)
  
  // Fetch audit metrics data from API
  const fetchAuditMetrics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/audit-metrics?timeRange=${selectedTimeRange}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setMetricsData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch audit metrics data:', err)
      setError('Failed to load audit metrics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Change time range and refetch data
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
  }
  
  // Initial data fetch and refresh interval
  useEffect(() => {
    if (initialLoad) {
      fetchAuditMetrics()
    }
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchAuditMetrics()
    }, refreshInterval)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [refreshInterval, initialLoad])
  
  // Refetch data when time range changes
  useEffect(() => {
    fetchAuditMetrics()
  }, [selectedTimeRange])
  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Audit Metrics
            </CardTitle>
            <CardDescription className="text-gray-300">
              Aggregate audit statistics across all client websites
              {lastUpdated && (
                <span className="ml-2 text-xs opacity-70">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
              <Button 
                variant={selectedTimeRange === "week" ? "default" : "ghost"}
                size="sm"
                className={selectedTimeRange === "week" ? "" : "text-gray-400 hover:text-white"}
                onClick={() => handleTimeRangeChange("week")}
              >
                Week
              </Button>
              <Button 
                variant={selectedTimeRange === "month" ? "default" : "ghost"}
                size="sm"
                className={selectedTimeRange === "month" ? "" : "text-gray-400 hover:text-white"}
                onClick={() => handleTimeRangeChange("month")}
              >
                Month
              </Button>
              <Button 
                variant={selectedTimeRange === "quarter" ? "default" : "ghost"}
                size="sm"
                className={selectedTimeRange === "quarter" ? "" : "text-gray-400 hover:text-white"}
                onClick={() => handleTimeRangeChange("quarter")}
              >
                Quarter
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/10 hover:bg-white/10"
              onClick={fetchAuditMetrics}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && !metricsData ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-gray-300">Loading audit metrics data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
            <Button 
              variant="outline" 
              className="mt-4 border-white/10 hover:bg-white/10"
              onClick={fetchAuditMetrics}
            >
              Retry
            </Button>
          </div>
        ) : metricsData ? (
          <>
        {/* Score Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Score Distribution by Category</h3>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              All Clients
            </Badge>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData.categoryScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="average" fill="#3b82f6" name="Average Score" />
                <Bar dataKey="highest" fill="#10b981" name="Highest Score" />
                <Bar dataKey="lowest" fill="#f59e0b" name="Lowest Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Trends */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">
              {selectedTimeRange === "week" ? "Weekly" : 
               selectedTimeRange === "month" ? "Monthly" : "Quarterly"} Issue Trends
            </h3>
            <div className="flex items-center gap-1">
              {metricsData.issuesFixed.change > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">-{metricsData.issuesFixed.change}% Critical Issues</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-yellow-400 rotate-180" />
                  <span className="text-xs text-yellow-400">+{Math.abs(metricsData.issuesFixed.change)}% Critical Issues</span>
                </>
              )}
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData.issuesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
                <Bar dataKey="info" stackId="a" fill="#3b82f6" name="Info" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="neomorphism p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">Total Audits</div>
            <div className="text-xl font-bold text-white">{metricsData.totalAudits.toLocaleString()}</div>
            <div className="text-xs text-green-400">
              {metricsData.completedAudits} completed / {metricsData.failedAudits} failed
            </div>
          </div>
          <div className="neomorphism p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">Avg. Score</div>
            <div className="text-xl font-bold text-white">{metricsData.averageScores.overall.toFixed(1)}</div>
            <div className="text-xs text-green-400">
              {metricsData.averageScores.change > 0 ? '+' : ''}
              {metricsData.averageScores.change.toFixed(1)} vs previous {selectedTimeRange}
            </div>
          </div>
          <div className="neomorphism p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">Issues Fixed</div>
            <div className="text-xl font-bold text-white">{metricsData.issuesFixed.count.toLocaleString()}</div>
            <div className="text-xs text-green-400">
              {metricsData.issuesFixed.rate.toFixed(0)}% resolution rate
            </div>
          </div>
        </div>
        
        {/* Audit Volume Trend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Audit Volume Trend</h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">
                {selectedTimeRange === "week" ? "Last 7 days" : 
                 selectedTimeRange === "month" ? "Last 30 days" : "Last 90 days"}
              </span>
            </div>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData.auditsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="Audits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
