"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Loader2, AlertCircle } from "lucide-react"

interface AuditStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  estimatedTime?: string
}

interface AuditProgressProps {
  auditId: string
  url: string
  onComplete?: (results: any) => void
  onError?: (error: string) => void
}

export function AuditProgress({ auditId, url, onComplete, onError }: AuditProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [apiProgress, setApiProgress] = useState(0)
  const [apiStatus, setApiStatus] = useState<'pending' | 'crawling' | 'analyzing' | 'completed' | 'failed'>('pending')
  const [currentStepName, setCurrentStepName] = useState('Initializing audit')
  const [steps, setSteps] = useState<AuditStep[]>([
    {
      id: 'crawl',
      name: 'Website Crawling',
      description: 'Analyzing site structure and collecting page data',
      status: 'pending',
      progress: 0,
      estimatedTime: '30s'
    },
    {
      id: 'seo',
      name: 'SEO Analysis',
      description: 'Checking meta tags, headings, and keyword optimization',
      status: 'pending',
      progress: 0,
      estimatedTime: '45s'
    },
    {
      id: 'performance',
      name: 'Performance Testing',
      description: 'Measuring Core Web Vitals and load times',
      status: 'pending',
      progress: 0,
      estimatedTime: '60s'
    },
    {
      id: 'accessibility',
      name: 'Accessibility Scan',
      description: 'WCAG compliance and usability checks',
      status: 'pending',
      progress: 0,
      estimatedTime: '40s'
    },
    {
      id: 'mobile',
      name: 'Mobile UX Analysis',
      description: 'Responsive design and mobile optimization',
      status: 'pending',
      progress: 0,
      estimatedTime: '35s'
    },
    {
      id: 'content',
      name: 'Content Analysis',
      description: 'Content quality and readability assessment',
      status: 'pending',
      progress: 0,
      estimatedTime: '25s'
    }
  ])

  useEffect(() => {
    // Poll for audit progress
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/audit/status/${auditId}`)
        const data = await response.json()

        if (response.ok && data.success) {
          const { status, currentStep, progress } = data.audit
          
          setApiStatus(status)
          setApiProgress(progress)
          setCurrentStepName(currentStep)

          // Update steps based on current progress and status
          updateStepsBasedOnProgress(status, progress, currentStep)

          // Check if audit is completed
          if (status === 'completed') {
            clearInterval(pollInterval)
            
            // Fetch results
            try {
              const resultsResponse = await fetch(`/api/audit/results/${auditId}`)
              const resultsData = await resultsResponse.json()
              
              if (resultsResponse.ok && resultsData.success) {
                onComplete?.(resultsData.results)
              } else {
                onError?.('Failed to fetch audit results')
              }
            } catch (error) {
              onError?.('Failed to fetch audit results')
            }
          } else if (status === 'failed') {
            clearInterval(pollInterval)
            onError?.(`Audit failed: ${currentStep}`)
          }
        } else {
          // Handle API errors
          if (response.status === 404) {
            clearInterval(pollInterval)
            onError?.('Audit not found')
          } else {
            console.error('Failed to fetch audit status:', data.error)
          }
        }
      } catch (error) {
        console.error('Error polling audit status:', error)
        // Don't clear interval on network errors, keep trying
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [auditId, onComplete, onError])

  const updateStepsBasedOnProgress = (status: string, progress: number, currentStep: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps]
      
      // Reset all steps to pending first
      newSteps.forEach(step => {
        step.status = 'pending'
        step.progress = 0
      })

      // Update based on current status and progress
      if (status === 'crawling') {
        newSteps[0].status = 'running'
        newSteps[0].progress = Math.min(100, progress * 2) // Scale progress for crawling phase
      } else if (status === 'analyzing') {
        newSteps[0].status = 'completed'
        newSteps[0].progress = 100
        
        // Determine which analysis step is running based on progress
        if (progress < 50) {
          newSteps[1].status = 'running' // SEO
          newSteps[1].progress = (progress - 30) * 5 // Scale from 30-50% progress
        } else if (progress < 70) {
          newSteps[1].status = 'completed'
          newSteps[1].progress = 100
          newSteps[2].status = 'running' // Performance
          newSteps[2].progress = (progress - 50) * 5
        } else if (progress < 85) {
          newSteps[1].status = 'completed'
          newSteps[1].progress = 100
          newSteps[2].status = 'completed'
          newSteps[2].progress = 100
          newSteps[3].status = 'running' // Accessibility
          newSteps[3].progress = (progress - 70) * 6.67
        } else if (progress < 95) {
          newSteps[1].status = 'completed'
          newSteps[1].progress = 100
          newSteps[2].status = 'completed'
          newSteps[2].progress = 100
          newSteps[3].status = 'completed'
          newSteps[3].progress = 100
          newSteps[4].status = 'running' // Mobile
          newSteps[4].progress = (progress - 85) * 10
        } else {
          newSteps[1].status = 'completed'
          newSteps[1].progress = 100
          newSteps[2].status = 'completed'
          newSteps[2].progress = 100
          newSteps[3].status = 'completed'
          newSteps[3].progress = 100
          newSteps[4].status = 'completed'
          newSteps[4].progress = 100
          newSteps[5].status = 'running' // Content
          newSteps[5].progress = (progress - 95) * 20
        }
      } else if (status === 'completed') {
        newSteps.forEach(step => {
          step.status = 'completed'
          step.progress = 100
        })
      } else if (status === 'failed') {
        // Find the current running step and mark it as error
        const runningStepIndex = newSteps.findIndex(step => step.name.toLowerCase().includes(currentStep.toLowerCase()))
        if (runningStepIndex >= 0) {
          newSteps[runningStepIndex].status = 'error'
        }
      }

      return newSteps
    })
  }

  const getStepIcon = (step: AuditStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-electric-cyan" />
      case 'running':
        return <Loader2 className="h-5 w-5 text-digital-gold animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      default:
        return <Circle className="h-5 w-5 text-slate-steel" />
    }
  }

  const getStepStatus = (step: AuditStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge className="bg-electric-cyan/20 text-electric-cyan border-electric-cyan/30">Completed</Badge>
      case 'running':
        return <Badge className="bg-digital-gold/20 text-digital-gold border-digital-gold/30">Running</Badge>
      case 'error':
        return <Badge className="bg-red-400/20 text-red-400 border-red-400/30">Error</Badge>
      default:
        return <Badge className="bg-slate-steel/20 text-slate-steel border-slate-steel/30">Pending</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-darker-navy border-circuit-bronze/20">
      <CardHeader>
        <CardTitle className="text-xl text-digital-gold">
          Auditing: {url}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-steel">
            <span>Overall Progress</span>
            <span>{Math.round(apiProgress)}%</span>
          </div>
          <Progress 
            value={apiProgress} 
            className="h-2 bg-darkest-navy"
          />
          <div className="text-sm text-slate-steel">
            Current Step: {currentStepName}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border transition-all ${
              step.status === 'running' 
                ? 'bg-digital-gold/5 border-digital-gold/30 hover-shadow' 
                : step.status === 'completed'
                ? 'bg-electric-cyan/5 border-electric-cyan/20'
                : step.status === 'error'
                ? 'bg-red-400/5 border-red-400/20'
                : 'bg-deep-azure/20 border-circuit-bronze/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStepIcon(step)}
                <div>
                  <h4 className="font-medium text-digital-gold">{step.name}</h4>
                  <p className="text-sm text-slate-steel">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {step.estimatedTime && step.status === 'pending' && (
                  <span className="text-xs text-slate-steel">~{step.estimatedTime}</span>
                )}
                {getStepStatus(step)}
              </div>
            </div>
            
            {step.status === 'running' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-steel">
                  <span>Progress</span>
                  <span>{Math.round(step.progress)}%</span>
                </div>
                <Progress 
                  value={step.progress} 
                  className="h-1 bg-darkest-navy"
                />
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20">
          <p className="text-sm text-slate-steel">
            <strong className="text-digital-gold">Note:</strong> This comprehensive audit analyzes multiple aspects of your website. 
            Results will include detailed recommendations and actionable insights for improvement.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 