"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, Zap, Target, TrendingUp, AlertCircle } from "lucide-react"

const performanceInsights = [
  {
    title: "Core Web Vitals Optimization",
    description: "Your LCP could be improved by 40% with image optimization",
    impact: "High",
    effort: "Medium",
    potentialGain: "+12 points",
    category: "Performance",
    icon: Zap,
  },
  {
    title: "JavaScript Bundle Optimization",
    description: "Reduce bundle size by code splitting and tree shaking",
    impact: "Medium",
    effort: "High",
    potentialGain: "+8 points",
    category: "Performance",
    icon: Target,
  },
  {
    title: "Server Response Time",
    description: "Optimize database queries and implement caching",
    impact: "High",
    effort: "Medium",
    potentialGain: "+15 points",
    category: "Performance",
    icon: TrendingUp,
  },
]

const coreWebVitals = [
  {
    metric: "First Contentful Paint",
    current: 1.2,
    target: 1.8,
    status: "good",
    improvement: "Excellent performance",
  },
  {
    metric: "Largest Contentful Paint",
    current: 2.8,
    target: 2.5,
    status: "needs-improvement",
    improvement: "Optimize images and fonts",
  },
  {
    metric: "Cumulative Layout Shift",
    current: 0.25,
    target: 0.1,
    status: "poor",
    improvement: "Reserve space for dynamic content",
  },
  {
    metric: "First Input Delay",
    current: 45,
    target: 100,
    status: "good",
    improvement: "Great interactivity",
  },
]

export function PerformanceInsights() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400"
      case "needs-improvement":
        return "text-yellow-400"
      case "poor":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "needs-improvement":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "poor":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getProgressValue = (current: number, target: number, isLowerBetter = false) => {
    if (isLowerBetter) {
      return Math.max(0, Math.min(100, ((target - current) / target) * 100))
    }
    return Math.min(100, (current / target) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Core Web Vitals Detail */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Core Web Vitals Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Detailed breakdown of Google's Core Web Vitals metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coreWebVitals.map((vital, index) => (
              <div key={index} className="neomorphism p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{vital.metric}</h3>
                  <Badge className={getStatusBadge(vital.status)}>{vital.status.replace("-", " ")}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Current</div>
                    <div className={`text-lg font-bold ${getStatusColor(vital.status)}`}>
                      {vital.current}
                      {vital.metric.includes("Delay") ? "ms" : vital.metric.includes("Shift") ? "" : "s"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Target</div>
                    <div className="text-lg font-bold text-gray-300">
                      {vital.target}
                      {vital.metric.includes("Delay") ? "ms" : vital.metric.includes("Shift") ? "" : "s"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Recommendation</div>
                    <div className="text-sm text-gray-300">{vital.improvement}</div>
                  </div>
                </div>
                <Progress
                  value={getProgressValue(
                    vital.current,
                    vital.target,
                    vital.metric.includes("Shift") || vital.metric.includes("Delay"),
                  )}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimization Recommendations */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            Performance Optimization Recommendations
          </CardTitle>
          <CardDescription className="text-gray-300">
            Prioritized recommendations to improve your performance scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceInsights.map((insight, index) => (
              <div key={index} className="neomorphism p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <insight.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold">{insight.title}</h3>
                      <Badge className={getImpactColor(insight.impact)}>{insight.impact} Impact</Badge>
                      <Badge className={getEffortColor(insight.effort)}>{insight.effort} Effort</Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {insight.potentialGain}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Score Prediction */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-400" />
            Performance Score Prediction
          </CardTitle>
          <CardDescription className="text-gray-300">
            Estimated score improvements based on recommended optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neomorphism p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">76</div>
              <div className="text-sm text-gray-300 mb-2">Current Score</div>
              <div className="text-xs text-gray-400">Baseline performance</div>
            </div>
            <div className="neomorphism p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">91</div>
              <div className="text-sm text-gray-300 mb-2">Predicted Score</div>
              <div className="text-xs text-gray-400">After optimizations</div>
            </div>
            <div className="neomorphism p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">+15</div>
              <div className="text-sm text-gray-300 mb-2">Potential Gain</div>
              <div className="text-xs text-gray-400">20% improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
