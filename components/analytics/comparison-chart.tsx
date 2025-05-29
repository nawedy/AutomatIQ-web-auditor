"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  {
    website: "example.com",
    seo: 92,
    performance: 78,
    security: 88,
    ux: 82,
  },
  {
    website: "mystore.com",
    seo: 96,
    performance: 91,
    security: 95,
    ux: 94,
  },
  {
    website: "portfolio.dev",
    seo: 68,
    performance: 65,
    security: 82,
    ux: 74,
  },
  {
    website: "blog.example.com",
    seo: 85,
    performance: 72,
    security: 90,
    ux: 78,
  },
]

export function ComparisonChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="website" stroke="rgba(255,255,255,0.6)" fontSize={12} />
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
          <Bar dataKey="seo" fill="#10b981" name="SEO" />
          <Bar dataKey="performance" fill="#f59e0b" name="Performance" />
          <Bar dataKey="security" fill="#06b6d4" name="Security" />
          <Bar dataKey="ux" fill="#8b5cf6" name="UX" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
