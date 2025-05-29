"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, Play, X, RefreshCw } from "lucide-react"

interface AuditStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  duration?: number
  error?: string
}

interface AuditProgressProps {
  websiteId: string
  websiteName: string
  onComplete?: (results: any) => void
  onCancel?: () => void
}

export function AuditProgress({ websiteId, websiteName, onComplete, onCancel }: AuditProgressProps) {
  const [steps, setSteps] = useState<AuditStep[]>([
    {
      id: "initialization",
      name: "Initialization",
      description: "Setting up audit environment",
      status: "pending",
      progress: 0,
    },
    {
      id: "crawling",
      name: "Page Crawling",
      description: "Discovering and analyzing pages",
      status: "pending",
      progress: 0,
    },
    {
      id: "performance",
      name: "Performance Analysis",
      description: "Testing page speed and Core Web Vitals",
      status: "pending",
      progress: 0,
    },
    {
      id: "seo",
      name: "SEO Analysis",
      description: "Checking SEO best practices",
      status: "pending",
      progress: 0,
    },
    {
      id: "security",
      name: "Security Scan",
      description: "Scanning for security vulnerabilities",
      status: "pending",
      progress: 0,
    },
    {
      id: "ux",
      name: "UX Analysis",
      description: "Evaluating user experience factors",
      status: "pending",
      progress: 0,
    },
    {
      id: "reporting",
      name: "Report Generation",
      description: "Compiling results and generating report",
      status: "pending",
      progress: 0,
    },
  ])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)

  const startAudit = () => {
    setIsRunning(true)
    setStartTime(new Date())
    setCurrentStepIndex(0)

    // Reset all steps
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending" as const,
        progress: 0,
        duration: undefined,
        error: undefined,
      })),
    )
  }

  const cancelAudit = () => {
    setIsRunning(false)
    setCurrentStepIndex(0)
    setOverallProgress(0)
    setEstimatedTimeRemaining(null)
    onCancel?.()
  }

  // Simulate audit progress
  useEffect(() => {
    if (!isRunning || currentStepIndex >= steps.length) return

    const currentStep = steps[currentStepIndex]
    if (currentStep.status === "completed") {
      // Move to next step
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1)
      }, 500)
      return
    }

    // Start current step
    if (currentStep.status === "pending") {
      setSteps((prev) =>
        prev.map((step, index) => (index === currentStepIndex ? { ...step, status: "running" as const } : step)),
      )
    }

    // Simulate step progress
    const interval = setInterval(() => {
      setSteps((prev) =>
        prev.map((step, index) => {
          if (index === currentStepIndex && step.status === "running") {
            const newProgress = Math.min(step.progress + Math.random() * 15 + 5, 100)

            if (newProgress >= 100) {
              return {
                ...step,
                progress: 100,
                status: "completed" as const,
                duration: Math.floor(Math.random() * 5000 + 2000), // 2-7 seconds
              }
            }

            return { ...step, progress: newProgress }
          }
          return step
        }),
      )
    }, 200)

    return () => clearInterval(interval)
  }, [isRunning, currentStepIndex, steps])

  // Update overall progress
  useEffect(() => {
    const completedSteps = steps.filter((step) => step.status === "completed").length
    const currentStepProgress = steps[currentStepIndex]?.progress || 0
    const newOverallProgress = (completedSteps * 100 + currentStepProgress) / steps.length
    setOverallProgress(newOverallProgress)

    // Calculate estimated time remaining
    if (startTime && completedSteps > 0) {
      const elapsed = Date.now() - startTime.getTime()
      const avgTimePerStep = elapsed / completedSteps
      const remainingSteps = steps.length - completedSteps
      setEstimatedTimeRemaining(Math.floor((avgTimePerStep * remainingSteps) / 1000))
    }
  }, [steps, currentStepIndex, startTime])

  // Handle audit completion
  useEffect(() => {
    if (currentStepIndex >= steps.length && isRunning) {
      setIsRunning(false)

      // Generate mock results
      const results = {
        overall_score: Math.floor(Math.random() * 40) + 60,
        seo_score: Math.floor(Math.random() * 40) + 60,
        performance_score: Math.floor(Math.random() * 40) + 60,
        security_score: Math.floor(Math.random() * 40) + 60,
        ux_score: Math.floor(Math.random() * 40) + 60,
        issues: {
          critical: Math.floor(Math.random() * 5),
          warning: Math.floor(Math.random() * 10),
          info: Math.floor(Math.random() * 15),
        },
        duration: startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0,
      }

      onComplete?.(results)
    }
  }, [currentStepIndex, steps.length, isRunning, startTime, onComplete])

  const getStepIcon = (step: AuditStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "running":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Audit Progress</CardTitle>
            <CardDescription className="text-gray-300">Running audit for {websiteName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning && currentStepIndex === 0 && (
              <Button onClick={startAudit} className="shimmer text-white font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Start Audit
              </Button>
            )}
            {isRunning && (
              <Button
                variant="outline"
                onClick={cancelAudit}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Overall Progress</span>
            <span className="text-white font-semibold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          {estimatedTimeRemaining && (
            <div className="text-xs text-gray-400">Estimated time remaining: {estimatedTimeRemaining}s</div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`neomorphism p-4 rounded-lg transition-all ${
                index === currentStepIndex && isRunning ? "border-blue-500/30" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStepIcon(step)}
                  <div>
                    <h4 className="text-white font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStepBadgeColor(step.status)}>{step.status}</Badge>
                  {step.duration && <span className="text-xs text-gray-400">{(step.duration / 1000).toFixed(1)}s</span>}
                </div>
              </div>

              {step.status === "running" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(step.progress)}%</span>
                  </div>
                  <Progress value={step.progress} className="h-1" />
                </div>
              )}

              {step.error && <div className="mt-2 text-sm text-red-400">Error: {step.error}</div>}
            </div>
          ))}
        </div>

        {/* Summary */}
        {startTime && (
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Started:</span>
                <div className="text-white">{startTime.toLocaleTimeString()}</div>
              </div>
              <div>
                <span className="text-gray-400">Elapsed:</span>
                <div className="text-white">{Math.floor((Date.now() - startTime.getTime()) / 1000)}s</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
