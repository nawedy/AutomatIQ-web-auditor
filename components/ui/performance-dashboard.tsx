"use client"

import { useEffect, useState } from 'react'
import { usePerformance } from '@/hooks/use-performance'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number | null
  unit?: string
  rating?: 'good' | 'needs-improvement' | 'poor'
  description?: string
}

const MetricCard = ({ title, value, unit = 'ms', rating, description }: MetricCardProps) => {
  const getBgColor = () => {
    if (!rating) return 'bg-card'
    switch (rating) {
      case 'good': return 'bg-emerald-950/30 border-emerald-700/50'
      case 'needs-improvement': return 'bg-amber-950/30 border-amber-700/50'
      case 'poor': return 'bg-red-950/30 border-red-700/50'
      default: return 'bg-card'
    }
  }

  const getTextColor = () => {
    if (!rating) return 'text-foreground'
    switch (rating) {
      case 'good': return 'text-emerald-400'
      case 'needs-improvement': return 'text-amber-400'
      case 'poor': return 'text-red-400'
      default: return 'text-foreground'
    }
  }

  const getRatingLabel = () => {
    if (!rating) return null
    switch (rating) {
      case 'good': return <Badge variant="outline" className="bg-emerald-950/50 text-emerald-400 border-emerald-700">Good</Badge>
      case 'needs-improvement': return <Badge variant="outline" className="bg-amber-950/50 text-amber-400 border-amber-700">Needs Improvement</Badge>
      case 'poor': return <Badge variant="outline" className="bg-red-950/50 text-red-400 border-red-700">Poor</Badge>
      default: return null
    }
  }

  return (
    <Card className={`p-4 ${getBgColor()} transition-colors duration-300 h-full`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {getRatingLabel()}
      </div>
      <div className={`text-2xl font-bold ${getTextColor()} transition-colors duration-300`}>
        {value !== null ? value : 'N/A'}{value !== null ? unit : ''}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
    </Card>
  )
}

export function PerformanceDashboard() {
  const { metrics, vitals, logPerformanceMetrics, getRating } = usePerformance()
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Wait for metrics to be collected
    const timer = setTimeout(() => {
      logPerformanceMetrics()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [logPerformanceMetrics])

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary/90 hover:bg-primary"
        size="sm"
      >
        Show Performance
      </Button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-auto' : 'w-[340px] sm:w-[400px]'}`}>
      <Card className="border border-border/50 bg-background/95 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-medium">Performance Metrics</h2>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? '↗' : '↙'}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-destructive" 
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                title="LCP" 
                value={metrics.lcp !== null ? Number(metrics.lcp.toFixed(0)) : null}
                rating={metrics.lcp !== null ? getRating('lcp', metrics.lcp) : undefined}
                description="Largest Contentful Paint"
              />
              <MetricCard 
                title="FID" 
                value={metrics.fid !== null ? Number(metrics.fid.toFixed(1)) : null}
                rating={metrics.fid !== null ? getRating('fid', metrics.fid) : undefined}
                description="First Input Delay"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                title="CLS" 
                value={metrics.cls !== null ? Number(metrics.cls.toFixed(3)) : null}
                unit=""
                rating={metrics.cls !== null ? getRating('cls', metrics.cls) : undefined}
                description="Cumulative Layout Shift"
              />
              <MetricCard 
                title="FCP" 
                value={metrics.fcp !== null ? Number(metrics.fcp.toFixed(0)) : null}
                rating={metrics.fcp !== null ? getRating('fcp', metrics.fcp) : undefined}
                description="First Contentful Paint"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                title="TTFB" 
                value={metrics.ttfb !== null ? Number(metrics.ttfb.toFixed(0)) : null}
                rating={metrics.ttfb !== null ? getRating('ttfb', metrics.ttfb) : undefined}
                description="Time To First Byte"
              />
              <MetricCard 
                title="DOM Load" 
                value={metrics.domLoad !== null ? Number(metrics.domLoad.toFixed(0)) : null}
                description="DOM Content Loaded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                title="Resources" 
                value={metrics.resourceCount}
                unit=" files"
                description={`${(metrics.resourceTime / 1000).toFixed(2)}s total load time`}
              />
              <MetricCard 
                title="Long Tasks" 
                value={metrics.longTasks}
                unit=" tasks"
                description={`${metrics.longTasksTime.toFixed(0)}ms blocking time`}
              />
            </div>
            
            {metrics.memoryUsage !== undefined && (
              <div className="grid grid-cols-1 gap-3">
                <MetricCard 
                  title="Memory Usage" 
                  value={Number(metrics.memoryUsage.toFixed(1))}
                  unit=" MB"
                  description="JS Heap Size"
                />
              </div>
            )}
            
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => logPerformanceMetrics()}
              >
                Refresh Metrics
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
