"use client"

import { usePathname } from "next/navigation"
import { PerformanceMonitor } from "./performance-monitor"
import { MemoryLeakDetector } from "./memory-leak-detector"
import { TestSuite } from "./test-suite"
import { ConversionTracker } from "@/components/ab-testing/conversion-tracker"

export function DebugComponents() {
  const pathname = usePathname()
  
  // Only show debug components in development mode
  if (process.env.NODE_ENV === "production") {
    return null
  }
  
  // Only show debug components on dashboard routes
  const dashboardRoutes = [
    "/dashboard", 
    "/websites", 
    "/reports", 
    "/analytics", 
    "/settings", 
    "/export", 
    "/audit",
    "/test"
  ]
  
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route))
  
  if (!isDashboardRoute) {
    return null
  }
  
  return (
    <>
      <TestSuite />
      <PerformanceMonitor />
      <MemoryLeakDetector />
      <ConversionTracker />
    </>
  )
} 