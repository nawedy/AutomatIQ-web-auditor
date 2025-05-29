"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  HardDrive,
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface PerformanceMetrics {
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  renderCount: number
  averageRenderTime: number
  componentMounts: number
  componentUnmounts: number
  eventListeners: number
  timers: number
  fps: number
  domNodes: number
  memoryLeaks: Array<{
    type: string
    count: number
    severity: "low" | "medium" | "high"
    description: string
  }>
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    renderCount: 0,
    averageRenderTime: 0,
    componentMounts: 0,
    componentUnmounts: 0,
    eventListeners: 0,
    timers: 0,
    fps: 0,
    domNodes: 0,
    memoryLeaks: [],
  })

  const renderTimes = useRef<number[]>([])
  const lastFrameTime = useRef<number>(0)
  const frameCount = useRef<number>(0)
  const fpsHistory = useRef<number[]>([])
  const componentRegistry = useRef<Set<string>>(new Set())
  const timerRegistry = useRef<Set<number>>(new Set())
  const listenerRegistry = useRef<Set<string>>(new Set())

  // Performance monitoring hooks
  useEffect(() => {
    const startTime = performance.now()

    // Track component mount
    const componentId = `component_${Date.now()}_${Math.random()}`
    componentRegistry.current.add(componentId)

    return () => {
      // Track component unmount
      componentRegistry.current.delete(componentId)
      const endTime = performance.now()
      renderTimes.current.push(endTime - startTime)

      // Keep only last 100 render times
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-100)
      }
    }
  })

  // Memory and performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      // Memory usage (if available)
      const memory = (performance as any).memory
      let memoryUsage = { used: 0, total: 0, percentage: 0 }

      if (memory) {
        const used = memory.usedJSHeapSize / 1024 / 1024 // MB
        const total = memory.totalJSHeapSize / 1024 / 1024 // MB
        memoryUsage = {
          used: Math.round(used * 100) / 100,
          total: Math.round(total * 100) / 100,
          percentage: Math.round((used / total) * 100),
        }
      }

      // Calculate average render time
      const avgRenderTime =
        renderTimes.current.length > 0 ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length : 0

      // Count DOM nodes
      const domNodes = document.querySelectorAll("*").length

      // Count active timers (approximate)
      const timers = timerRegistry.current.size

      // Count event listeners (approximate)
      const listeners = listenerRegistry.current.size

      // Detect potential memory leaks
      const memoryLeaks = detectMemoryLeaks(memoryUsage, domNodes, timers, listeners)

      setMetrics({
        memoryUsage,
        renderCount: renderTimes.current.length,
        averageRenderTime: Math.round(avgRenderTime * 100) / 100,
        componentMounts: componentRegistry.current.size,
        componentUnmounts: renderTimes.current.length,
        eventListeners: listeners,
        timers,
        fps: calculateFPS(),
        domNodes,
        memoryLeaks,
      })
    }

    // Monitor every 2 seconds
    const interval = setInterval(monitorPerformance, 2000)

    // Initial measurement
    monitorPerformance()

    return () => clearInterval(interval)
  }, [])

  // FPS monitoring
  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now()
      frameCount.current++

      if (lastFrameTime.current) {
        const delta = now - lastFrameTime.current
        const fps = 1000 / delta
        fpsHistory.current.push(fps)

        // Keep only last 60 frames
        if (fpsHistory.current.length > 60) {
          fpsHistory.current = fpsHistory.current.slice(-60)
        }
      }

      lastFrameTime.current = now
      requestAnimationFrame(measureFPS)
    }

    const rafId = requestAnimationFrame(measureFPS)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Override setTimeout/setInterval to track timers
  useEffect(() => {
    const originalSetTimeout = window.setTimeout
    const originalSetInterval = window.setInterval
    const originalClearTimeout = window.clearTimeout
    const originalClearInterval = window.clearInterval

    window.setTimeout = (...args) => {
      const id = originalSetTimeout(...args)
      timerRegistry.current.add(id)
      return id
    }

    window.setInterval = (...args) => {
      const id = originalSetInterval(...args)
      timerRegistry.current.add(id)
      return id
    }

    window.clearTimeout = (id) => {
      timerRegistry.current.delete(id)
      return originalClearTimeout(id)
    }

    window.clearInterval = (id) => {
      timerRegistry.current.delete(id)
      return originalClearInterval(id)
    }

    return () => {
      window.setTimeout = originalSetTimeout
      window.setInterval = originalSetInterval
      window.clearTimeout = originalClearTimeout
      window.clearInterval = originalClearInterval
    }
  }, [])

  const calculateFPS = () => {
    if (fpsHistory.current.length === 0) return 0
    const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
    return Math.round(avgFPS)
  }

  const detectMemoryLeaks = (memory: any, domNodes: number, timers: number, listeners: number) => {
    const leaks = []

    // High memory usage
    if (memory.percentage > 80) {
      leaks.push({
        type: "High Memory Usage",
        count: memory.percentage,
        severity: "high" as const,
        description: `Memory usage is at ${memory.percentage}% (${memory.used}MB)`,
      })
    }

    // Too many DOM nodes
    if (domNodes > 5000) {
      leaks.push({
        type: "DOM Node Leak",
        count: domNodes,
        severity: "medium" as const,
        description: `${domNodes} DOM nodes detected (threshold: 5000)`,
      })
    }

    // Too many active timers
    if (timers > 50) {
      leaks.push({
        type: "Timer Leak",
        count: timers,
        severity: "high" as const,
        description: `${timers} active timers detected (threshold: 50)`,
      })
    }

    // Too many event listeners
    if (listeners > 100) {
      leaks.push({
        type: "Event Listener Leak",
        count: listeners,
        severity: "medium" as const,
        description: `${listeners} event listeners detected (threshold: 100)`,
      })
    }

    // Low FPS
    const fps = calculateFPS()
    if (fps < 30 && fps > 0) {
      leaks.push({
        type: "Performance Issue",
        count: fps,
        severity: "medium" as const,
        description: `Low FPS detected: ${fps} (threshold: 30)`,
      })
    }

    return leaks
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const runMemoryStressTest = () => {
    console.log("🧪 Starting memory stress test...")

    // Create temporary objects to test garbage collection
    const testObjects = []
    for (let i = 0; i < 10000; i++) {
      testObjects.push({
        id: i,
        data: new Array(1000).fill(Math.random()),
        timestamp: Date.now(),
      })
    }

    // Force garbage collection if available
    if ((window as any).gc) {
      ;(window as any).gc()
    }

    console.log("🧪 Memory stress test completed")
  }

  const runPerformanceTest = () => {
    console.log("⚡ Starting performance test...")

    const startTime = performance.now()

    // CPU intensive task
    let result = 0
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.sin(i)
    }

    const endTime = performance.now()
    console.log(`⚡ Performance test completed in ${(endTime - startTime).toFixed(2)}ms`)
    console.log(`⚡ Result: ${result}`)
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            {metrics.memoryLeaks.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {metrics.memoryLeaks.length}
              </Badge>
            )}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="w-96 mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Real-time performance and memory monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Memory Usage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">Memory Usage</span>
                  <Badge variant={metrics.memoryUsage.percentage > 80 ? "destructive" : "secondary"}>
                    {metrics.memoryUsage.percentage}%
                  </Badge>
                </div>
                <Progress value={metrics.memoryUsage.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    <span>Avg Render:</span>
                  </div>
                  <Badge variant="outline">{metrics.averageRenderTime}ms</Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>FPS:</span>
                  </div>
                  <Badge variant={metrics.fps < 30 ? "destructive" : "secondary"}>{metrics.fps}</Badge>
                </div>

                <div className="space-y-1">
                  <span>Components:</span>
                  <Badge variant="outline">{metrics.componentMounts}</Badge>
                </div>

                <div className="space-y-1">
                  <span>DOM Nodes:</span>
                  <Badge variant={metrics.domNodes > 5000 ? "destructive" : "outline"}>{metrics.domNodes}</Badge>
                </div>

                <div className="space-y-1">
                  <span>Timers:</span>
                  <Badge variant={metrics.timers > 50 ? "destructive" : "outline"}>{metrics.timers}</Badge>
                </div>

                <div className="space-y-1">
                  <span>Listeners:</span>
                  <Badge variant={metrics.eventListeners > 100 ? "destructive" : "outline"}>
                    {metrics.eventListeners}
                  </Badge>
                </div>
              </div>

              {/* Memory Leaks */}
              {metrics.memoryLeaks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Potential Issues</span>
                  </div>
                  <div className="space-y-2">
                    {metrics.memoryLeaks.map((leak, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-xs">
                        {getSeverityIcon(leak.severity)}
                        <div className="flex-1">
                          <div className={`font-medium ${getSeverityColor(leak.severity)}`}>{leak.type}</div>
                          <div className="text-muted-foreground">{leak.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Controls */}
              <div className="pt-2 border-t space-y-2">
                <Button onClick={runMemoryStressTest} size="sm" variant="outline" className="w-full">
                  Run Memory Test
                </Button>
                <Button onClick={runPerformanceTest} size="sm" variant="outline" className="w-full">
                  Run Performance Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
