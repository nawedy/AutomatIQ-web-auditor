"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { AlertTriangle, Info, Clock } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend)

const issueCategories = [
  {
    category: "Performance",
    total: 45,
    critical: 12,
    warning: 23,
    info: 10,
    resolved: 28,
    color: "#f59e0b",
  },
  {
    category: "SEO",
    total: 32,
    critical: 5,
    warning: 15,
    info: 12,
    resolved: 24,
    color: "#10b981",
  },
  {
    category: "Security",
    total: 18,
    critical: 8,
    warning: 7,
    info: 3,
    resolved: 12,
    color: "#06b6d4",
  },
  {
    category: "UX",
    total: 28,
    critical: 3,
    warning: 18,
    info: 7,
    resolved: 15,
    color: "#8b5cf6",
  },
]

const severityData = {
  labels: ["Critical", "Warning", "Info", "Resolved"],
  datasets: [
    {
      data: [28, 63, 32, 79],
      backgroundColor: ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"],
      borderColor: ["#dc2626", "#d97706", "#0891b2", "#059669"],
      borderWidth: 2,
    },
  ],
}

export function IssueBreakdown() {
  const getResolutionRate = (resolved: number, total: number) => {
    return Math.round((resolved / total) * 100)
  }

  const getResolutionColor = (rate: number) => {
    if (rate >= 80) return "text-green-400"
    if (rate >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Issue Overview */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Issue Breakdown Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Detailed analysis of issues by category and severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Distribution Chart */}
            <div className="neomorphism p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4 text-center">Issues by Severity</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={severityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "rgba(255,255,255,0.8)",
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0,0,0,0.8)",
                        titleColor: "white",
                        bodyColor: "white",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Issues by Category</h3>
              {issueCategories.map((category, index) => {
                const resolutionRate = getResolutionRate(category.resolved, category.total)
                return (
                  <div key={index} className="neomorphism p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="text-white font-semibold">{category.category}</span>
                      </div>
                      <Badge className={`${getResolutionColor(resolutionRate)} bg-opacity-20`}>
                        {resolutionRate}% resolved
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                      <div className="text-center">
                        <div className="text-red-400 font-semibold">{category.critical}</div>
                        <div className="text-gray-400">Critical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-semibold">{category.warning}</div>
                        <div className="text-gray-400">Warning</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">{category.info}</div>
                        <div className="text-gray-400">Info</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{category.resolved}</div>
                        <div className="text-gray-400">Resolved</div>
                      </div>
                    </div>
                    <Progress value={resolutionRate} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Timeline */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Resolution Timeline
          </CardTitle>
          <CardDescription className="text-gray-300">Track issue resolution progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="neomorphism p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">28</div>
                <div className="text-sm text-gray-300">Active Critical</div>
                <div className="text-xs text-gray-400 mt-1">Avg resolution: 3.2 days</div>
              </div>
              <div className="neomorphism p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">63</div>
                <div className="text-sm text-gray-300">Active Warnings</div>
                <div className="text-xs text-gray-400 mt-1">Avg resolution: 7.5 days</div>
              </div>
              <div className="neomorphism p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">79</div>
                <div className="text-sm text-gray-300">Resolved This Month</div>
                <div className="text-xs text-gray-400 mt-1">+24% vs last month</div>
              </div>
            </div>

            <div className="neomorphism p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Resolution Priorities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-white font-medium">Critical Security Issues</div>
                      <div className="text-sm text-gray-400">8 issues requiring immediate attention</div>
                    </div>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High Priority</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Performance Optimizations</div>
                      <div className="text-sm text-gray-400">12 issues affecting Core Web Vitals</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium Priority</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">SEO Enhancements</div>
                      <div className="text-sm text-gray-400">5 opportunities for improvement</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Low Priority</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
