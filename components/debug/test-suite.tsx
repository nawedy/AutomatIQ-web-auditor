"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  Cpu,
  HardDrive,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  RotateCw,
  Settings,
  Terminal,
  X,
  XCircle,
} from "lucide-react"

// Routes to test navigation
const TEST_ROUTES = [
  { path: "/", name: "Home" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/analytics", name: "Analytics" },
  { path: "/reports", name: "Reports" },
  { path: "/websites", name: "Websites" },
  { path: "/settings", name: "Settings" },
  { path: "/export", name: "Export" },
]

// Console log types for styling
const LOG_TYPES = {
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  DEBUG: "debug",
  PERFORMANCE: "performance",
  MEMORY: "memory",
  NAVIGATION: "navigation",
}

interface LogEntry {
  id: string
  timestamp: number
  type: string
  message: string
  data?: any
}

export function TestSuite() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("navigation")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [currentTest, setCurrentTest] = useState("")
  const [progress, setProgress] = useState(0)
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; message: string }>>({})
  const [autoScroll, setAutoScroll] = useState(true)
  const [captureConsole, setCaptureConsole] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(false)

  const logContainerRef = useRef<HTMLDivElement>(null)
  const originalConsole = useRef<any>({})
  const logQueue = useRef<LogEntry[]>([])
  const processingLogs = useRef(false)

  // Batch process logs to avoid render conflicts
  const processLogQueue = useCallback(() => {
    if (processingLogs.current || logQueue.current.length === 0) return

    processingLogs.current = true

    // Use setTimeout to defer state update outside of render cycle
    setTimeout(() => {
      const logsToAdd = [...logQueue.current]
      logQueue.current = []

      if (logsToAdd.length > 0) {
        setLogs((prev) => {
          const newLogs = [...prev, ...logsToAdd]
          // Keep only the last 500 logs
          if (newLogs.length > 500) {
            return newLogs.slice(-500)
          }
          return newLogs
        })
      }

      processingLogs.current = false

      // Process any remaining logs
      if (logQueue.current.length > 0) {
        processLogQueue()
      }
    }, 0)
  }, [])

  const addLog = useCallback(
    (type: string, message: any, data?: any) => {
      const logEntry: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        type,
        message: typeof message === "string" ? message : JSON.stringify(message),
        data: data && data.length > 0 ? data : undefined,
      }

      logQueue.current.push(logEntry)
      processLogQueue()
    },
    [processLogQueue],
  )

  // Initialize console overrides
  useEffect(() => {
    if (captureConsole && isOpen) {
      // Store original console methods
      originalConsole.current = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
      }

      // Override console methods
      console.log = (...args: any[]) => {
        originalConsole.current.log(...args)
        addLog(LOG_TYPES.INFO, args[0], args.slice(1))
      }

      console.warn = (...args: any[]) => {
        originalConsole.current.warn(...args)
        addLog(LOG_TYPES.WARN, args[0], args.slice(1))
      }

      console.error = (...args: any[]) => {
        originalConsole.current.error(...args)
        addLog(LOG_TYPES.ERROR, args[0], args.slice(1))
      }

      console.info = (...args: any[]) => {
        originalConsole.current.info(...args)
        addLog(LOG_TYPES.INFO, args[0], args.slice(1))
      }

      console.debug = (...args: any[]) => {
        originalConsole.current.debug(...args)
        addLog(LOG_TYPES.DEBUG, args[0], args.slice(1))
      }
    }

    return () => {
      // Restore original console methods
      if (originalConsole.current.log) {
        console.log = originalConsole.current.log
        console.warn = originalConsole.current.warn
        console.error = originalConsole.current.error
        console.info = originalConsole.current.info
        console.debug = originalConsole.current.debug
      }
    }
  }, [captureConsole, isOpen, addLog])

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Global popup close handling
  useEffect(() => {
    const handleClosePopups = () => {
      setIsOpen(false)
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener("closeAllPopups", handleClosePopups)
      window.addEventListener("closeCustomPopups", handleClosePopups)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      window.removeEventListener("closeAllPopups", handleClosePopups)
      window.removeEventListener("closeCustomPopups", handleClosePopups)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen])

  const clearLogs = () => {
    setLogs([])
    logQueue.current = []
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 })
  }

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case LOG_TYPES.INFO:
        return <Terminal className="h-3 w-3 text-blue-500" />
      case LOG_TYPES.WARN:
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case LOG_TYPES.ERROR:
        return <XCircle className="h-3 w-3 text-red-500" />
      case LOG_TYPES.DEBUG:
        return <Code className="h-3 w-3 text-purple-500" />
      case LOG_TYPES.PERFORMANCE:
        return <Activity className="h-3 w-3 text-green-500" />
      case LOG_TYPES.MEMORY:
        return <HardDrive className="h-3 w-3 text-cyan-500" />
      case LOG_TYPES.NAVIGATION:
        return <ChevronRight className="h-3 w-3 text-orange-500" />
      default:
        return <Terminal className="h-3 w-3" />
    }
  }

  const getLogTypeClass = (type: string) => {
    switch (type) {
      case LOG_TYPES.INFO:
        return "text-blue-500"
      case LOG_TYPES.WARN:
        return "text-yellow-500"
      case LOG_TYPES.ERROR:
        return "text-red-500"
      case LOG_TYPES.DEBUG:
        return "text-purple-500"
      case LOG_TYPES.PERFORMANCE:
        return "text-green-500"
      case LOG_TYPES.MEMORY:
        return "text-cyan-500"
      case LOG_TYPES.NAVIGATION:
        return "text-orange-500"
      default:
        return ""
    }
  }

  // Navigation testing
  const navigateToRoute = async (route: string, name: string) => {
    try {
      addLog(LOG_TYPES.NAVIGATION, `Navigating to ${name} (${route})`)

      // Capture memory before navigation
      const memoryBefore = (performance as any).memory?.usedJSHeapSize
      const timeBefore = performance.now()

      // Navigate
      router.push(route)

      // Wait for navigation (simulated)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capture memory after navigation
      const memoryAfter = (performance as any).memory?.usedJSHeapSize
      const timeAfter = performance.now()

      // Calculate metrics
      const memoryDiff = memoryAfter && memoryBefore ? (memoryAfter - memoryBefore) / (1024 * 1024) : null
      const timeDiff = timeAfter - timeBefore

      // Log results
      if (memoryDiff !== null) {
        addLog(
          memoryDiff > 5 ? LOG_TYPES.WARN : LOG_TYPES.MEMORY,
          `Memory change after navigation: ${memoryDiff.toFixed(2)}MB (${timeDiff.toFixed(0)}ms)`,
        )
      }

      addLog(LOG_TYPES.NAVIGATION, `Navigation to ${name} complete`)

      return {
        passed: true,
        message: `Navigation successful (${timeDiff.toFixed(0)}ms)`,
      }
    } catch (error) {
      addLog(LOG_TYPES.ERROR, `Navigation to ${route} failed: ${error}`)
      return {
        passed: false,
        message: `Navigation failed: ${error}`,
      }
    }
  }

  const runNavigationTest = async () => {
    setIsRunningTest(true)
    setCurrentTest("Navigation Test")
    setProgress(0)

    const results: Record<string, { passed: boolean; message: string }> = {}

    addLog(LOG_TYPES.INFO, "Starting navigation test sequence")

    // Navigate through all routes
    for (let i = 0; i < TEST_ROUTES.length; i++) {
      const route = TEST_ROUTES[i]
      setProgress(Math.round((i / TEST_ROUTES.length) * 100))

      // Navigate to route
      results[route.path] = await navigateToRoute(route.path, route.name)

      // Wait between navigations
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Return to starting page
    await navigateToRoute("/", "Home")

    setTestResults(results)
    setProgress(100)
    setIsRunningTest(false)

    addLog(LOG_TYPES.INFO, "Navigation test sequence complete")

    // Final memory check
    if ((performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024)
      addLog(memoryUsage > 100 ? LOG_TYPES.WARN : LOG_TYPES.MEMORY, `Final memory usage: ${memoryUsage.toFixed(2)}MB`)
    }
  }

  // Memory stress test
  const runMemoryStressTest = async () => {
    setIsRunningTest(true)
    setCurrentTest("Memory Stress Test")
    setProgress(0)

    addLog(LOG_TYPES.INFO, "Starting memory stress test")

    // Capture initial memory
    const initialMemory = (performance as any).memory?.usedJSHeapSize

    // Create arrays of objects in batches
    const batches = 10
    const objectsPerBatch = 10000
    const objects: any[] = []

    for (let i = 0; i < batches; i++) {
      const batchStart = performance.now()

      // Create batch of objects
      for (let j = 0; j < objectsPerBatch; j++) {
        objects.push({
          id: `${i}_${j}`,
          data: new Array(100).fill(0).map(() => Math.random()),
          timestamp: Date.now(),
          text: `Test object with some text content ${i}_${j}`,
        })
      }

      const batchEnd = performance.now()
      const currentMemory = (performance as any).memory?.usedJSHeapSize
      const memoryUsage = currentMemory ? (currentMemory - initialMemory) / (1024 * 1024) : null

      addLog(
        LOG_TYPES.MEMORY,
        `Batch ${i + 1}/${batches}: Created ${objectsPerBatch} objects in ${(batchEnd - batchStart).toFixed(0)}ms` +
          (memoryUsage !== null ? ` (Memory: +${memoryUsage.toFixed(2)}MB)` : ""),
      )

      setProgress(Math.round(((i + 1) / batches) * 50))

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    addLog(LOG_TYPES.INFO, `Created ${objects.length} objects total`)

    // Now clear the objects and check memory
    addLog(LOG_TYPES.INFO, "Clearing objects and running garbage collection")
    const beforeClear = (performance as any).memory?.usedJSHeapSize

    // Clear objects
    objects.length = 0

    // Try to force garbage collection if available
    if ((window as any).gc) {
      ;(window as any).gc()
      addLog(LOG_TYPES.INFO, "Forced garbage collection")
    } else {
      addLog(LOG_TYPES.INFO, "Manual garbage collection not available, waiting for automatic GC")
      // Create pressure to encourage GC
      for (let i = 0; i < 10; i++) {
        const pressure = new Array(1000000).fill(0)
        pressure.length = 0
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(50 + Math.round(((i + 1) / 10) * 50))
      }
    }

    // Check final memory
    const finalMemory = (performance as any).memory?.usedJSHeapSize

    if (initialMemory && finalMemory && beforeClear) {
      const creationDiff = (beforeClear - initialMemory) / (1024 * 1024)
      const clearDiff = (finalMemory - beforeClear) / (1024 * 1024)
      const totalDiff = (finalMemory - initialMemory) / (1024 * 1024)

      addLog(LOG_TYPES.MEMORY, `Memory after object creation: +${creationDiff.toFixed(2)}MB`)
      addLog(LOG_TYPES.MEMORY, `Memory change after clearing: ${clearDiff.toFixed(2)}MB`)
      addLog(
        totalDiff > 5 ? LOG_TYPES.WARN : LOG_TYPES.MEMORY,
        `Total memory change: ${totalDiff.toFixed(2)}MB (${totalDiff > 5 ? "POTENTIAL LEAK" : "OK"})`,
      )

      setTestResults({
        memoryStress: {
          passed: totalDiff <= 5,
          message: `Memory change: ${totalDiff.toFixed(2)}MB (${totalDiff > 5 ? "LEAK DETECTED" : "No leak detected"})`,
        },
      })
    } else {
      addLog(LOG_TYPES.WARN, "Memory metrics not available in this browser")
      setTestResults({
        memoryStress: {
          passed: true,
          message: "Test completed, but memory metrics not available",
        },
      })
    }

    setProgress(100)
    setIsRunningTest(false)
    addLog(LOG_TYPES.INFO, "Memory stress test complete")
  }

  // Performance stress test
  const runPerformanceTest = async () => {
    setIsRunningTest(true)
    setCurrentTest("Performance Test")
    setProgress(0)

    addLog(LOG_TYPES.INFO, "Starting performance stress test")

    const results: Record<string, { passed: boolean; message: string }> = {}

    // Test 1: CPU-intensive operations
    addLog(LOG_TYPES.PERFORMANCE, "Running CPU test")
    const cpuStart = performance.now()

    let cpuResult = 0
    const iterations = 1000000

    for (let i = 0; i < iterations; i++) {
      cpuResult += Math.sqrt(i) * Math.sin(i)

      if (i % 100000 === 0) {
        setProgress(Math.round((i / iterations) * 33))
        await new Promise((resolve) => setTimeout(resolve, 0)) // Allow UI to update
      }
    }

    const cpuTime = performance.now() - cpuStart
    addLog(LOG_TYPES.PERFORMANCE, `CPU test completed in ${cpuTime.toFixed(2)}ms`)

    results.cpu = {
      passed: cpuTime < 2000, // Less than 2 seconds is good
      message: `CPU test: ${cpuTime.toFixed(2)}ms (${cpuTime < 2000 ? "Good" : "Slow"})`,
    }

    // Test 2: DOM operations
    addLog(LOG_TYPES.PERFORMANCE, "Running DOM test")
    const domStart = performance.now()

    const testDiv = document.createElement("div")
    testDiv.style.position = "absolute"
    testDiv.style.left = "-9999px"
    testDiv.style.top = "-9999px"
    document.body.appendChild(testDiv)

    const domIterations = 5000

    for (let i = 0; i < domIterations; i++) {
      const element = document.createElement("div")
      element.textContent = `Test element ${i}`
      element.className = `test-element test-element-${i % 10}`
      element.style.padding = "5px"
      element.style.margin = "2px"
      testDiv.appendChild(element)

      if (i % 500 === 0) {
        setProgress(33 + Math.round((i / domIterations) * 33))
        await new Promise((resolve) => setTimeout(resolve, 0)) // Allow UI to update
      }
    }

    // Force layout recalculation
    const elements = testDiv.querySelectorAll(".test-element")
    let totalHeight = 0
    elements.forEach((el) => {
      totalHeight += (el as HTMLElement).offsetHeight
    })

    const domTime = performance.now() - domStart

    // Clean up
    document.body.removeChild(testDiv)

    addLog(LOG_TYPES.PERFORMANCE, `DOM test completed in ${domTime.toFixed(2)}ms (${elements.length} elements)`)

    results.dom = {
      passed: domTime < 1000, // Less than 1 second is good
      message: `DOM test: ${domTime.toFixed(2)}ms (${domTime < 1000 ? "Good" : "Slow"})`,
    }

    // Test 3: Memory allocation/deallocation
    addLog(LOG_TYPES.PERFORMANCE, "Running memory allocation test")
    const memStart = performance.now()

    const cycles = 100
    for (let i = 0; i < cycles; i++) {
      const objects = []

      // Allocate
      for (let j = 0; j < 10000; j++) {
        objects.push({
          id: j,
          value: `value_${j}`,
          data: new Array(10).fill(j),
        })
      }

      // Use the objects
      let checksum = 0
      for (const obj of objects) {
        checksum += obj.id
      }

      // Clear
      objects.length = 0

      setProgress(66 + Math.round((i / cycles) * 34))

      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0)) // Allow UI to update
      }
    }

    const memTime = performance.now() - memStart

    addLog(LOG_TYPES.PERFORMANCE, `Memory allocation test completed in ${memTime.toFixed(2)}ms`)

    results.memory = {
      passed: memTime < 3000, // Less than 3 seconds is good
      message: `Memory allocation test: ${memTime.toFixed(2)}ms (${memTime < 3000 ? "Good" : "Slow"})`,
    }

    setTestResults(results)
    setProgress(100)
    setIsRunningTest(false)

    addLog(LOG_TYPES.INFO, "Performance stress test complete")
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTest(true)
    setCurrentTest("Complete Test Suite")
    setProgress(0)

    addLog(LOG_TYPES.INFO, "Starting complete test suite")

    // Run memory test
    addLog(LOG_TYPES.INFO, "Phase 1: Memory stress test")
    await runMemoryStressTest()

    // Run performance test
    addLog(LOG_TYPES.INFO, "Phase 2: Performance test")
    await runPerformanceTest()

    // Run navigation test
    addLog(LOG_TYPES.INFO, "Phase 3: Navigation test")
    await runNavigationTest()

    setIsRunningTest(false)
    addLog(LOG_TYPES.INFO, "Complete test suite finished")
  }

  return (
    <>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 left-4 z-50 shadow-lg" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Test Suite
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 left-4 z-50" data-popup="test-suite">
          <Card className="w-[800px] h-[600px] shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Website Audit Test Suite
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Test navigation, performance, and memory usage</CardDescription>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <div className="px-4">
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="navigation" className="flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Navigation</span>
                  </TabsTrigger>
                  <TabsTrigger value="memory" className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    <span>Memory</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-1">
                    <Cpu className="h-4 w-4" />
                    <span>Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="console" className="flex items-center gap-1">
                    <Terminal className="h-4 w-4" />
                    <span>Console</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-0 flex-1 flex flex-col">
                <TabsContent value="navigation" className="flex-1 flex flex-col p-4 pt-0 m-0">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {TEST_ROUTES.map((route) => (
                      <Button
                        key={route.path}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        onClick={() => navigateToRoute(route.path, route.name)}
                        disabled={isRunningTest}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        {route.name}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4 flex-1">
                    <Button onClick={runNavigationTest} disabled={isRunningTest} className="w-full">
                      Run Navigation Test Sequence
                    </Button>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Test Results:</div>
                      <div className="space-y-1">
                        {Object.entries(testResults).map(([route, result]) => (
                          <div key={route} className="flex items-center gap-2 text-sm">
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-mono">{route}</span>
                            <span className="text-muted-foreground">{result.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="memory" className="flex-1 flex flex-col p-4 pt-0 m-0">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Current Memory Usage:</div>
                      {(performance as any).memory ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Used Heap:</span>
                            <span className="font-mono">
                              {((performance as any).memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Heap:</span>
                            <span className="font-mono">
                              {((performance as any).memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Heap Limit:</span>
                            <span className="font-mono">
                              {((performance as any).memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>

                          <Progress
                            value={
                              ((performance as any).memory.usedJSHeapSize /
                                (performance as any).memory.jsHeapSizeLimit) *
                              100
                            }
                            className="h-2 mt-2"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Memory API not available in this browser</div>
                      )}
                    </div>

                    <Button onClick={runMemoryStressTest} disabled={isRunningTest} className="w-full">
                      Run Memory Stress Test
                    </Button>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Test Results:</div>
                      <div className="space-y-1">
                        {testResults.memoryStress && (
                          <div className="flex items-center gap-2 text-sm">
                            {testResults.memoryStress.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-muted-foreground">{testResults.memoryStress.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="flex-1 flex flex-col p-4 pt-0 m-0">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-1">CPU Test</div>
                        <div className="text-xs text-muted-foreground">Math operations</div>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-1">DOM Test</div>
                        <div className="text-xs text-muted-foreground">Element creation & layout</div>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-1">Memory Test</div>
                        <div className="text-xs text-muted-foreground">Allocation & deallocation</div>
                      </div>
                    </div>

                    <Button onClick={runPerformanceTest} disabled={isRunningTest} className="w-full">
                      Run Performance Test
                    </Button>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Test Results:</div>
                      <div className="space-y-1">
                        {Object.entries(testResults)
                          .filter(([key]) => ["cpu", "dom", "memory"].includes(key))
                          .map(([key, result]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-mono">{key}</span>
                              <span className="text-muted-foreground">{result.message}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="console" className="flex-1 flex flex-col p-4 pt-0 m-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
                        <Label htmlFor="auto-scroll">Auto-scroll</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="capture-console" checked={captureConsole} onCheckedChange={setCaptureConsole} />
                        <Label htmlFor="capture-console">Capture console</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="show-timestamps" checked={showTimestamps} onCheckedChange={setShowTimestamps} />
                        <Label htmlFor="show-timestamps">Show timestamps</Label>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={clearLogs}>
                      Clear
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 border rounded-md p-2" ref={logContainerRef}>
                    <div className="space-y-1 font-mono text-xs">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2">
                          {showTimestamps && (
                            <span className="text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          )}
                          <span className="mt-0.5">{getLogTypeIcon(log.type)}</span>
                          <span className={getLogTypeClass(log.type)}>
                            {log.message}
                            {log.data && <span className="text-muted-foreground"> {JSON.stringify(log.data)}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </CardContent>

              {isRunningTest && (
                <div className="px-4 py-2 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentTest}
                    </div>
                    <div className="text-sm">{progress}%</div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <CardFooter className="flex justify-between border-t p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("console")} className="gap-1">
                    <Terminal className="h-4 w-4" />
                    Logs ({logs.length})
                  </Button>

                  <Button variant="default" size="sm" onClick={runAllTests} disabled={isRunningTest} className="gap-1">
                    {isRunningTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
                    Run All Tests
                  </Button>
                </div>
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      )}
    </>
  )
}
