"use client"

// src/components/audit/audit-overview.tsx
// Component for displaying audit overview with key metrics and scores

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  BarChart3,
  Clock
} from "lucide-react"

interface AuditOverviewProps {
  audit: {
    id: string
    score: number
    status: string
    completedAt: string
    issues: {
      critical: number
      major: number
      minor: number
      info: number
    }
    categories: {
      name: string
      score: number
      issueCount: number
    }[]
  }
}

export function AuditOverview({ audit }: AuditOverviewProps) {
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  // Get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    if (score >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white">Overall Audit Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold tracking-tight">
              <span className={getScoreColor(audit.score)}>{audit.score}</span>
              <span className="text-sm text-gray-400">/100</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${audit.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}
            >
              {audit.status === 'completed' ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              {audit.status === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
          <Progress value={audit.score} className={`h-2 ${getProgressColor(audit.score)}`} />
          <p className="text-xs text-gray-400 mt-2">
            Last updated: {formatDate(audit.completedAt)}
          </p>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white">Issues Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center mb-1">
                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-300">Critical</span>
              </div>
              <span className="text-xl font-bold text-red-500">{audit.issues.critical}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-gray-300">Major</span>
              </div>
              <span className="text-xl font-bold text-orange-500">{audit.issues.major}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-300">Minor</span>
              </div>
              <span className="text-xl font-bold text-yellow-500">{audit.issues.minor}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center mb-1">
                <Info className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-300">Info</span>
              </div>
              <span className="text-xl font-bold text-blue-500">{audit.issues.info}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white">Category Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {audit.categories.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                      {category.score}/100
                    </span>
                    <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      {category.issueCount} issues
                    </Badge>
                  </div>
                </div>
                <Progress value={category.score} className={`h-1.5 ${getProgressColor(category.score)}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
