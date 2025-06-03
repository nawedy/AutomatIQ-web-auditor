"use client"

import { useEffect, useCallback, useState, useRef } from "react"

interface PerformanceMetrics {
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  domLoad: number | null // DOM Content Loaded
  windowLoad: number | null // Window Load Complete
  memoryUsage?: number // JS Heap Size (if available)
  resourceCount: number // Number of resources loaded
  resourceTime: number // Total resource load time
  longTasks: number // Number of long tasks (>50ms)
  longTasksTime: number // Total time spent in long tasks
  navigationTiming: PerformanceNavigationTiming | null
}

interface VitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null,
    resourceCount: 0,
    resourceTime: 0,
    longTasks: 0,
    longTasksTime: 0,
    navigationTiming: null,
  })

  const [vitals, setVitals] = useState<VitalMetric[]>([])

  const getRating = useCallback((name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }, [])

  const updateMetric = useCallback((name: string, value: number) => {
    const rating = getRating(name, value)
    const metric: VitalMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    }

    setVitals(prev => [...prev.filter(v => v.name !== name), metric])
    setMetrics(prev => ({ ...prev, [name]: value }))
  }, [getRating])

  // Initialize refs for performance observers
  const lcpObserver = useRef<PerformanceObserver | null>(null)
  const clsObserver = useRef<PerformanceObserver | null>(null)
  const fidObserver = useRef<PerformanceObserver | null>(null)
  const longTaskObserver = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.PerformanceObserver) return
    
    // Track Largest Contentful Paint
    try {
      lcpObserver.current = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          updateMetric('lcp', lastEntry.startTime)
        }
      })
      lcpObserver.current.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }

    // Track First Input Delay (FID)
    try {
      fidObserver.current = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const firstEntry = entries[0]
        if (firstEntry) {
          // @ts-ignore - processingStart is not in the standard type definitions
          const fid = firstEntry.processingStart - firstEntry.startTime
          updateMetric('fid', fid)
        }
      })
      fidObserver.current.observe({ type: 'first-input', buffered: true })
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      clsObserver.current = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // @ts-ignore - hadRecentInput and value are not in the standard type definitions
          if (!entry.hadRecentInput) {
            // @ts-ignore
            clsValue += entry.value
            updateMetric('cls', clsValue)
          }
        }
      })
      clsObserver.current.observe({ type: 'layout-shift', buffered: true })
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
    
    // Track Long Tasks
    try {
      let longTaskCount = 0
      let longTaskTime = 0
      longTaskObserver.current = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        longTaskCount += entries.length
        for (const entry of entries) {
          longTaskTime += entry.duration
        }
        setMetrics(prev => ({ 
          ...prev, 
          longTasks: longTaskCount,
          longTasksTime: longTaskTime
        }))
      })
      longTaskObserver.current.observe({ type: 'longtask', buffered: true })
    } catch (error) {
      console.warn('Long Task observation not supported:', error)
    }

    // Measure TTFB and FCP directly
    const measureBasicMetrics = () => {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType("paint")
      const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint")
      if (fcpEntry) {
        updateMetric('fcp', fcpEntry.startTime)
      }

      // Time to First Byte and other navigation metrics
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
      const navEntry = navigationEntries.length > 0 ? navigationEntries[0] : null
      if (navEntry) {
        updateMetric('ttfb', navEntry.responseStart)
        setMetrics(prev => ({
          ...prev,
          domLoad: navEntry.domContentLoadedEventEnd,
          windowLoad: navEntry.loadEventEnd,
          navigationTiming: navEntry
        }))
      }
    }
    
    // Call once on mount
    measureBasicMetrics()
    
    // Cleanup observers on unmount
    return () => {
      lcpObserver.current?.disconnect()
      fidObserver.current?.disconnect()
      clsObserver.current?.disconnect()
      longTaskObserver.current?.disconnect()
    }
  }, [updateMetric])

  // Helper function to color-code performance scores
  const getScoreRating = useCallback((name: string, value: number | null): string => {
    if (value === null) return '⚪ Not Available'
    const rating = getRating(name, value)
    
    switch (rating) {
      case 'good': return '🟢 Good'
      case 'needs-improvement': return '🟠 Needs Improvement'
      case 'poor': return '🔴 Poor'
      default: return '⚪ Not Available'
    }
  }, [getRating])
  
  const logPerformanceMetrics = useCallback(() => {
    // Get resource metrics
    const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    const resourceCount = resourceEntries.length
    const resourceTime = resourceEntries.reduce((total, entry) => total + entry.duration, 0)
    
    // Get memory usage if available
    let memoryUsage: number | undefined
    // @ts-ignore - memory is not in the standard type definitions
    if (performance.memory) {
      // @ts-ignore
      memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024) // MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }
    
    // Update resource metrics
    setMetrics(prev => ({
      ...prev,
      resourceCount,
      resourceTime
    }))
    
    // Log to console with color coding for better visibility
    console.groupCollapsed('%c📊 Performance Metrics', 'color: #D4AF37; font-weight: bold; font-size: 14px;')
    
    console.log('%cCore Web Vitals:', 'font-weight: bold;')
    console.log(`⏱️ LCP: ${metrics.lcp?.toFixed(0) || 'N/A'}ms ${metrics.lcp ? getScoreRating('lcp', metrics.lcp) : ''}`)
    console.log(`⏱️ FID: ${metrics.fid?.toFixed(2) || 'N/A'}ms ${metrics.fid ? getScoreRating('fid', metrics.fid) : ''}`)
    console.log(`📏 CLS: ${metrics.cls?.toFixed(3) || 'N/A'} ${metrics.cls ? getScoreRating('cls', metrics.cls) : ''}`)
    
    console.log('%cOther Metrics:', 'font-weight: bold;')
    console.log(`⏱️ FCP: ${metrics.fcp?.toFixed(0) || 'N/A'}ms ${metrics.fcp ? getScoreRating('fcp', metrics.fcp) : ''}`)
    console.log(`⏱️ TTFB: ${metrics.ttfb?.toFixed(0) || 'N/A'}ms ${metrics.ttfb ? getScoreRating('ttfb', metrics.ttfb) : ''}`)
    console.log(`⏱️ DOM Load: ${metrics.domLoad?.toFixed(0) || 'N/A'}ms`)
    console.log(`⏱️ Window Load: ${metrics.windowLoad?.toFixed(0) || 'N/A'}ms`)
    
    console.log('%cResource Stats:', 'font-weight: bold;')
    console.log(`📦 Resources: ${resourceCount} (${(resourceTime / 1000).toFixed(2)}s total)`)
    
    console.log('%cJavaScript Execution:', 'font-weight: bold;')
    console.log(`⚠️ Long Tasks: ${metrics.longTasks} (${metrics.longTasksTime.toFixed(0)}ms total)`)
    
    if (memoryUsage !== undefined) {
      console.log('%cMemory Usage:', 'font-weight: bold;')
      console.log(`🧠 JS Heap: ${memoryUsage.toFixed(1)} MB`)
    }
    
    // Log detailed vitals for debugging
    console.groupCollapsed('Detailed Vitals')
    console.table(vitals)
    console.groupEnd()
    
    // Log navigation timing for debugging
    if (metrics.navigationTiming) {
      console.groupCollapsed('Navigation Timing')
      console.table({
        redirect: metrics.navigationTiming.redirectEnd - metrics.navigationTiming.redirectStart,
        dns: metrics.navigationTiming.domainLookupEnd - metrics.navigationTiming.domainLookupStart,
        connect: metrics.navigationTiming.connectEnd - metrics.navigationTiming.connectStart,
        request: metrics.navigationTiming.responseStart - metrics.navigationTiming.requestStart,
        response: metrics.navigationTiming.responseEnd - metrics.navigationTiming.responseStart,
        dom: metrics.navigationTiming.domComplete - metrics.navigationTiming.domInteractive,
        load: metrics.navigationTiming.loadEventEnd - metrics.navigationTiming.loadEventStart
      })
      console.groupEnd()
    }
    
    console.groupEnd()
    
    // Return metrics for potential use elsewhere
    return metrics
  }, [metrics, vitals, getScoreRating])

  return {
    metrics,
    vitals,
    logPerformanceMetrics,
    getRating,
  }
}

// Hook for monitoring resource loading performance
export function useResourcePerformance() {
  const [resources, setResources] = useState<PerformanceResourceTiming[]>([])

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]
      setResources(prev => [...prev, ...entries])
    })

    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  }, [])

  const getSlowResources = useCallback((threshold = 1000) => {
    return resources.filter(resource => resource.duration > threshold)
  }, [resources])

  const getResourcesByType = useCallback((type: string) => {
    return resources.filter(resource => resource.initiatorType === type)
  }, [resources])

  return {
    resources,
    getSlowResources,
    getResourcesByType,
  }
} 