"use client"

import { useEffect, useRef, useState } from "react"

interface MemorySnapshot {
  timestamp: number
  heapUsed: number
  heapTotal: number
  external: number
  arrayBuffers: number
}

interface LeakDetectionResult {
  isLeaking: boolean
  growthRate: number
  snapshots: MemorySnapshot[]
  recommendations: string[]
}

export function useMemoryLeakDetector(intervalMs = 5000) {
  const [result, setResult] = useState<LeakDetectionResult>({
    isLeaking: false,
    growthRate: 0,
    snapshots: [],
    recommendations: [],
  })

  const snapshotsRef = useRef<MemorySnapshot[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const takeSnapshot = () => {
      const memory = (performance as any).memory
      if (!memory) return

      const snapshot: MemorySnapshot = {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.totalJSHeapSize - memory.usedJSHeapSize,
        arrayBuffers: 0, // Not available in browser
      }

      snapshotsRef.current.push(snapshot)

      // Keep only last 20 snapshots (100 seconds of data)
      if (snapshotsRef.current.length > 20) {
        snapshotsRef.current = snapshotsRef.current.slice(-20)
      }

      // Analyze for memory leaks
      const analysis = analyzeMemoryTrend(snapshotsRef.current)
      setResult(analysis)

      console.log("📊 Memory Snapshot:", {
        heapUsed: `${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(snapshot.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        isLeaking: analysis.isLeaking,
        growthRate: `${analysis.growthRate.toFixed(2)}MB/min`,
      })
    }

    // Take initial snapshot
    takeSnapshot()

    // Set up interval
    intervalRef.current = setInterval(takeSnapshot, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMs])

  return result
}

function analyzeMemoryTrend(snapshots: MemorySnapshot[]): LeakDetectionResult {
  if (snapshots.length < 3) {
    return {
      isLeaking: false,
      growthRate: 0,
      snapshots,
      recommendations: ["Collecting data... need at least 3 snapshots"],
    }
  }

  // Calculate memory growth rate
  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  const timeDiff = (last.timestamp - first.timestamp) / 1000 / 60 // minutes
  const memoryDiff = (last.heapUsed - first.heapUsed) / 1024 / 1024 // MB
  const growthRate = memoryDiff / timeDiff // MB per minute

  // Detect consistent growth pattern
  let consistentGrowth = 0
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].heapUsed > snapshots[i - 1].heapUsed) {
      consistentGrowth++
    }
  }

  const growthPercentage = consistentGrowth / (snapshots.length - 1)
  const isLeaking = growthRate > 1 && growthPercentage > 0.7 // Growing >1MB/min with 70% consistency

  // Generate recommendations
  const recommendations = generateRecommendations(growthRate, growthPercentage, snapshots)

  return {
    isLeaking,
    growthRate,
    snapshots,
    recommendations,
  }
}

function generateRecommendations(growthRate: number, growthPercentage: number, snapshots: MemorySnapshot[]): string[] {
  const recommendations = []

  if (growthRate > 5) {
    recommendations.push("🚨 Critical: Memory growing >5MB/min - check for large object accumulation")
  } else if (growthRate > 1) {
    recommendations.push("⚠️ Warning: Memory growing >1MB/min - monitor for potential leaks")
  }

  if (growthPercentage > 0.8) {
    recommendations.push("📈 Consistent memory growth detected - check event listeners and timers")
  }

  const lastSnapshot = snapshots[snapshots.length - 1]
  const memoryUsageMB = lastSnapshot.heapUsed / 1024 / 1024

  if (memoryUsageMB > 100) {
    recommendations.push("💾 High memory usage (>100MB) - consider optimizing data structures")
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Memory usage appears stable")
  }

  return recommendations
}

// Component to display memory leak detection results
export function MemoryLeakDetector() {
  const leakDetection = useMemoryLeakDetector(3000) // Check every 3 seconds

  if (leakDetection.snapshots.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`p-3 rounded-lg border ${
          leakDetection.isLeaking ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${leakDetection.isLeaking ? "bg-red-500" : "bg-green-500"}`} />
          <span className="text-sm font-medium">Memory Leak Detector</span>
        </div>

        <div className="text-xs space-y-1">
          <div>Growth Rate: {leakDetection.growthRate.toFixed(2)} MB/min</div>
          <div>Snapshots: {leakDetection.snapshots.length}</div>

          {leakDetection.recommendations.map((rec, index) => (
            <div key={index} className="text-muted-foreground">
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
