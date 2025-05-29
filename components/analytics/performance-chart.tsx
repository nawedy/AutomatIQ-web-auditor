"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface PerformanceChartProps {
  timeRange: string
}

export function PerformanceChart({ timeRange }: PerformanceChartProps) {
  // Generate data based on time range
  const generateData = (range: string) => {
    const baseData = [
      { date: "Week 1", overall: 72, seo: 68, performance: 65, security: 78, ux: 74 },
      { date: "Week 2", overall: 75, seo: 72, performance: 68, security: 80, ux: 76 },
      { date: "Week 3", overall: 78, seo: 75, performance: 70, security: 82, ux: 78 },
      { date: "Week 4", overall: 85, seo: 92, performance: 78, security: 88, ux: 82 },
    ]

    if (range === "7d") {
      return baseData.slice(-1).map((item, index) => ({
        ...item,
        date: `Day ${index + 1}`,
      }))
    }

    return baseData
  }

  const data = generateData(timeRange)

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={3} name="Overall Score" />
          <Line type="monotone" dataKey="seo" stroke="#10b981" strokeWidth={2} name="SEO" />
          <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} name="Performance" />
          <Line type="monotone" dataKey="security" stroke="#06b6d4" strokeWidth={2} name="Security" />
          <Line type="monotone" dataKey="ux" stroke="#8b5cf6" strokeWidth={2} name="UX" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
