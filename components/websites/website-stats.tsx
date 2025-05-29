"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, TrendingUp, AlertTriangle, Clock } from "lucide-react"

interface WebsiteStatsProps {
  websites: any[]
}

export function WebsiteStats({ websites }: WebsiteStatsProps) {
  const totalWebsites = websites.length
  const activeWebsites = websites.filter((w) => w.status === "active").length
  const avgScore = Math.round(websites.reduce((sum, w) => sum + w.score, 0) / websites.length)
  const totalIssues = websites.reduce((sum, w) => sum + w.issues.critical + w.issues.warning, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Websites</CardTitle>
          <Globe className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalWebsites}</div>
          <p className="text-xs text-gray-400">{activeWebsites} active</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{avgScore}</div>
          <p className="text-xs text-green-400">+2.1% from last week</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Active Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalIssues}</div>
          <p className="text-xs text-red-400">Needs attention</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Next Audit</CardTitle>
          <Clock className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">2h</div>
          <p className="text-xs text-purple-400">example.com</p>
        </CardContent>
      </Card>
    </div>
  )
}
