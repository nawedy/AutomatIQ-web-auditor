"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"

interface TrendAnalysisProps {
  timeRange: string
}

const trendData = [
  { date: "Jan", issues: 45, resolved: 12, new: 8 },
  { date: "Feb", issues: 38, resolved: 18, new: 11 },
  { date: "Mar", issues: 32, resolved: 22, new: 16 },
  { date: "Apr", issues: 28, resolved: 25, new: 21 },
  { date: "May", issues: 23, resolved: 30, new: 25 },
  { date: "Jun", issues: 19, resolved: 35, new: 30 },
]

export function TrendAnalysis({ timeRange }: TrendAnalysisProps) {
  const trends = [
    {
      metric: "Overall Score",
      current: 84.2,
      previous: 78.4,
      change: 5.8,
      trend: "up",
      description: "Consistent improvement across all categories",
    },
    {
      metric: "Critical Issues",
      current: 23,
      previous: 34,
      change: -11,
      trend: "down",
      description: "32% reduction in critical issues",
    },
    {
      metric: "Page Load Time",
      current: 2.1,
      previous: 2.8,
      change: -0.7,
      trend: "down",
      description: "25% improvement in load times",
    },
    {
      metric: "SEO Score",
      current: 87.5,
      previous: 82.1,
      change: 5.4,
      trend: "up",
      description: "Strong SEO optimization progress",
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-green-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string, isPositive: boolean) => {
    if (trend === "up" && isPositive) return "text-green-400"
    if (trend === "down" && !isPositive) return "text-green-400"
    if (trend === "up" && !isPositive) return "text-red-400"
    if (trend === "down" && isPositive) return "text-red-400"
    return "text-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Trend Metrics */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Trend Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">Key metrics trends over the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map((trend, index) => (
              <div key={index} className="neomorphism p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{trend.metric}</span>
                  {getTrendIcon(trend.trend)}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{trend.current}</div>
                <div className="flex items-center gap-1 mb-2">
                  <span
                    className={`text-sm font-semibold ${getTrendColor(
                      trend.trend,
                      trend.metric !== "Critical Issues" && trend.metric !== "Page Load Time",
                    )}`}
                  >
                    {trend.change > 0 ? "+" : ""}
                    {trend.change}
                  </span>
                  <span className="text-xs text-gray-400">vs previous</span>
                </div>
                <p className="text-xs text-gray-400">{trend.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issue Resolution Trend */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Issue Resolution Trends</CardTitle>
          <CardDescription className="text-gray-300">Track how issues are being resolved over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
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
                <Area
                  type="monotone"
                  dataKey="issues"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Total Issues"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Resolved"
                />
                <Area
                  type="monotone"
                  dataKey="new"
                  stackId="3"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="New Issues"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend Insights */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Trend Insights</CardTitle>
          <CardDescription className="text-gray-300">Key observations from your data trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="neomorphism p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Positive Momentum</h3>
                  <p className="text-gray-300 text-sm">
                    Your overall scores have been consistently improving over the past 3 months, with SEO showing the
                    strongest gains.
                  </p>
                </div>
              </div>
            </div>

            <div className="neomorphism p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Issue Resolution Acceleration</h3>
                  <p className="text-gray-300 text-sm">
                    The rate of issue resolution has increased by 40% compared to the previous period, indicating more
                    efficient optimization processes.
                  </p>
                </div>
              </div>
            </div>

            <div className="neomorphism p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <Minus className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Performance Plateau</h3>
                  <p className="text-gray-300 text-sm">
                    Performance scores have plateaued in recent weeks. Consider focusing on Core Web Vitals optimization
                    for the next improvement cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
