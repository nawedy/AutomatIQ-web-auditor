"use client"

// src/components/admin/system-health.tsx
// Component for displaying system health metrics and performance indicators

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Server, Clock, Database, Activity, AlertCircle, RefreshCw, Loader2 } from "lucide-react"

interface SystemHealthProps {
  refreshInterval?: number // in milliseconds, default is 30000 (30 seconds)
  initialLoad?: boolean // whether to load data on mount, default is true
}

// Type definitions for system health data
interface SystemMetric {
  name: string
  value: number
  unit: string
  icon: React.ReactNode
  status: string
  statusText: string
  threshold: number
}

interface SystemAlert {
  title: string
  timestamp: string
  message: string
  severity: "critical" | "warning" | "info" | "success"
}

interface PerformanceDataPoint {
  time: string
  api: number
  db: number
  cpu: number
  memory: number
}

interface SystemHealthData {
  apiResponseTime: number
  dbQueryTime: number
  cpuUsage: number
  memoryUsage: number
  uptime: string
  databaseStats: {
    totalUsers: number
    totalWebsites: number
    totalAudits: number
  }
  recentErrors: number
  performanceData: PerformanceDataPoint[]
  alerts: SystemAlert[]
}

export function AdminSystemHealth({ refreshInterval = 30000, initialLoad = true }: SystemHealthProps) {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoad)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  
  // Fetch system health data from API
  const fetchSystemHealth = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/system-health')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setHealthData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch system health data:', err)
      setError('Failed to load system health data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data fetch and refresh interval
  useEffect(() => {
    if (initialLoad) {
      fetchSystemHealth()
    }
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchSystemHealth()
    }, refreshInterval)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [refreshInterval, initialLoad])
  // Helper function to determine status color
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (value <= thresholds.warning) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  // Helper function to determine status text
  const getStatusText = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "Good"
    if (value <= thresholds.warning) return "Warning"
    return "Critical"
  }

  // Generate system metrics from health data
  const systemMetrics: SystemMetric[] = healthData ? [
    {
      name: "API Response Time",
      value: healthData.apiResponseTime,
      unit: "ms",
      icon: <Clock className="w-4 h-4" />,
      status: getStatusColor(healthData.apiResponseTime, { good: 100, warning: 150 }),
      statusText: getStatusText(healthData.apiResponseTime, { good: 100, warning: 150 }),
      threshold: 200,
    },
    {
      name: "DB Query Time",
      value: healthData.dbQueryTime,
      unit: "ms",
      icon: <Database className="w-4 h-4" />,
      status: getStatusColor(healthData.dbQueryTime, { good: 80, warning: 120 }),
      statusText: getStatusText(healthData.dbQueryTime, { good: 80, warning: 120 }),
      threshold: 150,
    },
    {
      name: "CPU Usage",
      value: healthData.cpuUsage,
      unit: "%",
      icon: <Activity className="w-4 h-4" />,
      status: getStatusColor(healthData.cpuUsage, { good: 50, warning: 70 }),
      statusText: getStatusText(healthData.cpuUsage, { good: 50, warning: 70 }),
      threshold: 80,
    },
    {
      name: "Memory Usage",
      value: healthData.memoryUsage,
      unit: "%",
      icon: <Server className="w-4 h-4" />,
      status: getStatusColor(healthData.memoryUsage, { good: 60, warning: 75 }),
      statusText: getStatusText(healthData.memoryUsage, { good: 60, warning: 75 }),
      threshold: 80,
    },
  ] : []

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-green-400" />
              System Health
            </CardTitle>
            <CardDescription className="text-gray-300">
              Real-time performance metrics and system status
              {lastUpdated && (
                <span className="ml-2 text-xs opacity-70">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/10 hover:bg-white/10"
            onClick={fetchSystemHealth}
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
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && !healthData ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-gray-300">Loading system health data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
            <Button 
              variant="outline" 
              className="mt-4 border-white/10 hover:bg-white/10"
              onClick={fetchSystemHealth}
            >
              Retry
            </Button>
          </div>
        ) : healthData ? (
        {/* Current Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="neomorphism p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{metric.icon}</span>
                  <span className="text-sm text-gray-300">{metric.name}</span>
                </div>
                <Badge className={metric.status}>
                  {metric.statusText}
                </Badge>
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {metric.value} <span className="text-sm text-gray-400">{metric.unit}</span>
              </div>
              <Progress 
                value={(metric.value / metric.threshold) * 100} 
                className="h-1"
                color={metric.status.includes("green") ? "bg-green-500" : 
                       metric.status.includes("yellow") ? "bg-yellow-500" : "bg-red-500"}
              />
            </div>
          ))}
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="neomorphism p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-1">Total Users</div>
            <div className="text-xl font-bold text-white">{healthData.databaseStats.totalUsers}</div>
          </div>
          <div className="neomorphism p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-1">Total Websites</div>
            <div className="text-xl font-bold text-white">{healthData.databaseStats.totalWebsites}</div>
          </div>
          <div className="neomorphism p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-1">Total Audits</div>
            <div className="text-xl font-bold text-white">{healthData.databaseStats.totalAudits}</div>
          </div>
        </div>

        {/* System Info */}
        <div className="neomorphism p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-300 mb-1">System Uptime</div>
              <div className="text-lg font-bold text-white">{healthData.uptime}</div>
            </div>
            <div>
              <div className="text-sm text-gray-300 mb-1">Recent Errors (24h)</div>
              <div className="text-lg font-bold text-white">{healthData.recentErrors}</div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div>
          <h3 className="text-sm font-medium text-white mb-4">24-Hour Performance Trends</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="api" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="API Response (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="db" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  name="DB Query (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU Usage (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory Usage (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Alerts */}
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Recent System Alerts</h3>
          <div className="space-y-2">
            {healthData.alerts.length > 0 ? (
              healthData.alerts.map((alert, index) => {
                const borderColor = 
                  alert.severity === "critical" ? "border-red-500" :
                  alert.severity === "warning" ? "border-yellow-500" :
                  alert.severity === "success" ? "border-green-500" : "border-blue-500";
                
                return (
                  <div key={index} className={`neomorphism p-3 rounded-lg border-l-4 ${borderColor}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{alert.title}</span>
                      <span className="text-xs text-gray-400">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No recent alerts
              </div>
            )}
          </div>
        </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
