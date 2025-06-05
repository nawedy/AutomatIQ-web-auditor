"use client"

// src/components/monitoring/monitoring-trends.tsx
// Component for displaying website monitoring trends and metrics

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays, subMonths } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, TrendingDown, Minus, BarChart2, RefreshCw, AlertTriangle } from "lucide-react"

interface Trend {
  date: string
  [key: string]: number | string
}

interface MonitoringData {
  trends: Trend[]
  latestAudit: {
    date: string
    scores: {
      [key: string]: number
    }
  }
  previousAudit: {
    date: string
    scores: {
      [key: string]: number
    }
  } | null
}

interface MonitoringTrendsProps {
  websiteId: string
}

const METRICS = [
  { id: "overallScore", label: "Overall Score", color: "#4f46e5" },
  { id: "seoScore", label: "SEO Score", color: "#10b981" },
  { id: "performanceScore", label: "Performance Score", color: "#f59e0b" },
  { id: "accessibilityScore", label: "Accessibility Score", color: "#6366f1" },
  { id: "bestPracticesScore", label: "Best Practices Score", color: "#8b5cf6" },
  { id: "securityScore", label: "Security Score", color: "#ec4899" }
]

const TIME_RANGES = [
  { id: "7days", label: "Last 7 Days" },
  { id: "30days", label: "Last 30 Days" },
  { id: "3months", label: "Last 3 Months" },
  { id: "6months", label: "Last 6 Months" }
]

export function MonitoringTrends({ websiteId }: MonitoringTrendsProps) {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30days")
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["overallScore", "seoScore", "performanceScore"])
  const { toast } = useToast()

  const fetchMonitoringData = async () => {
    if (!websiteId) return
    
    setLoading(true)
    setError(null)
    
    // Calculate date range based on selected time range
    let startDate
    switch (timeRange) {
      case "7days":
        startDate = format(subDays(new Date(), 7), "yyyy-MM-dd")
        break
      case "30days":
        startDate = format(subDays(new Date(), 30), "yyyy-MM-dd")
        break
      case "3months":
        startDate = format(subMonths(new Date(), 3), "yyyy-MM-dd")
        break
      case "6months":
        startDate = format(subMonths(new Date(), 6), "yyyy-MM-dd")
        break
      default:
        startDate = format(subDays(new Date(), 30), "yyyy-MM-dd")
    }
    
    try {
      const metricsParam = activeMetrics.join(',')
      const response = await fetch(
        `/api/monitor/continuous?websiteId=${websiteId}&startDate=${startDate}&metrics=${metricsParam}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch monitoring data: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Format the data for the chart
      const formattedData = {
        trends: data.trends.map((trend: any) => ({
          date: format(new Date(trend.date), "MMM dd"),
          ...trend.scores
        })),
        latestAudit: {
          date: data.latestAudit?.date ? format(new Date(data.latestAudit.date), "MMM dd, yyyy") : "N/A",
          scores: data.latestAudit?.scores || {}
        },
        previousAudit: data.previousAudit ? {
          date: format(new Date(data.previousAudit.date), "MMM dd, yyyy"),
          scores: data.previousAudit.scores
        } : null
      }
      
      setMonitoringData(formattedData)
    } catch (err) {
      setError(`Error fetching monitoring data: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to load monitoring data: ${(err as Error).message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleMetric = (metricId: string) => {
    if (activeMetrics.includes(metricId)) {
      // Don't remove if it's the last active metric
      if (activeMetrics.length > 1) {
        setActiveMetrics(activeMetrics.filter(id => id !== metricId))
      }
    } else {
      setActiveMetrics([...activeMetrics, metricId])
    }
  }

  const getScoreChange = (metricId: string) => {
    if (!monitoringData || !monitoringData.previousAudit) return null
    
    const current = monitoringData.latestAudit.scores[metricId] || 0
    const previous = monitoringData.previousAudit.scores[metricId] || 0
    const change = current - previous
    
    return {
      value: change,
      percentage: previous > 0 ? (change / previous) * 100 : 0
    }
  }

  const getScoreChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  useEffect(() => {
    if (websiteId) {
      fetchMonitoringData()
    }
  }, [websiteId, timeRange, activeMetrics])

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-yellow-400" />
            Performance Trends
          </CardTitle>
          <CardDescription className="text-gray-300">
            Monitor your website's performance metrics over time
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => fetchMonitoringData()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="chart">Trend Chart</TabsTrigger>
            <TabsTrigger value="comparison">Score Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            {loading ? (
              <div className="w-full h-[300px]">
                <Skeleton className="w-full h-full" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400 h-[300px] flex flex-col items-center justify-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>{error}</p>
              </div>
            ) : !monitoringData || monitoringData.trends.length === 0 ? (
              <div className="p-8 text-center text-gray-400 h-[300px] flex flex-col items-center justify-center">
                <BarChart2 className="h-12 w-12 mb-3 text-gray-500" />
                <p className="text-lg font-medium">No trend data available</p>
                <p className="text-sm mt-1">
                  Continuous monitoring data will appear here after multiple audits have been run.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {METRICS.map((metric) => (
                    <Button
                      key={metric.id}
                      variant={activeMetrics.includes(metric.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMetric(metric.id)}
                      className="h-7 text-xs"
                      style={{
                        backgroundColor: activeMetrics.includes(metric.id) ? `${metric.color}20` : '',
                        borderColor: activeMetrics.includes(metric.id) ? metric.color : '',
                        color: activeMetrics.includes(metric.id) ? metric.color : ''
                      }}
                    >
                      {metric.label}
                    </Button>
                  ))}
                </div>
                
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monitoringData.trends}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f1f1f', 
                          borderColor: '#333', 
                          color: '#fff' 
                        }}
                      />
                      <Legend />
                      {METRICS.filter(metric => activeMetrics.includes(metric.id)).map((metric) => (
                        <Line
                          key={metric.id}
                          type="monotone"
                          dataKey={metric.id}
                          name={metric.label}
                          stroke={metric.color}
                          activeDot={{ r: 6 }}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="comparison">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-white/10 rounded-md">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : !monitoringData || !monitoringData.latestAudit ? (
              <div className="p-8 text-center text-gray-400">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-lg font-medium">No comparison data available</p>
                <p className="text-sm mt-1">
                  Score comparison will appear here after at least one audit has been run.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 border border-white/10 rounded-md bg-white/5">
                    <p className="text-sm text-gray-400">Latest Audit</p>
                    <p className="text-lg font-medium text-white">{monitoringData.latestAudit.date}</p>
                  </div>
                  <div className="p-3 border border-white/10 rounded-md bg-white/5">
                    <p className="text-sm text-gray-400">Previous Audit</p>
                    <p className="text-lg font-medium text-white">
                      {monitoringData.previousAudit?.date || "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {METRICS.map((metric) => {
                    const currentScore = monitoringData.latestAudit.scores[metric.id] || 0
                    const change = getScoreChange(metric.id)
                    
                    return (
                      <div 
                        key={metric.id} 
                        className="flex items-center justify-between p-3 border border-white/10 rounded-md hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: metric.color }}
                          />
                          <span className="text-white">{metric.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{currentScore.toFixed(1)}</span>
                          {change !== null && (
                            <div className={`flex items-center gap-1 ${
                              change.value > 0 ? 'text-green-500' : 
                              change.value < 0 ? 'text-red-500' : 'text-gray-400'
                            }`}>
                              {getScoreChangeIcon(change.value)}
                              <span className="text-sm">
                                {change.value > 0 ? '+' : ''}{change.value.toFixed(1)} 
                                ({change.value > 0 ? '+' : ''}{change.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
