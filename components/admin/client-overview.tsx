"use client"

// src/components/admin/client-overview.tsx
// Component for displaying client overview metrics and distribution

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Users } from "lucide-react"

// Sample data - would be fetched from API in production
const clientData = [
  { name: "Enterprise", value: 12, color: "#3b82f6" },
  { name: "Business", value: 18, color: "#8b5cf6" },
  { name: "Startup", value: 14, color: "#10b981" },
  { name: "Free Tier", value: 4, color: "#f59e0b" },
]

const activityData = [
  { name: "Active (Last 24h)", value: 32, color: "#10b981" },
  { name: "Active (Last Week)", value: 10, color: "#8b5cf6" },
  { name: "Inactive (>1 Week)", value: 6, color: "#f59e0b" },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/10 p-3 rounded-lg shadow-lg">
        <p className="text-white font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

export function AdminClientOverview() {
  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Client Overview
        </CardTitle>
        <CardDescription className="text-gray-300">
          Client distribution by plan and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">Client Distribution by Plan</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {clientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {clientData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-gray-300">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">Client Activity</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {activityData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-gray-300">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white mb-2">Key Insights</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Enterprise clients have increased by 15% this quarter</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Client retention rate is at 94% (up 2% from last month)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>6 clients require attention due to inactivity</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
