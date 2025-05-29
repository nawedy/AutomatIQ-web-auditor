"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"

// Define WebSocket message types
interface WebSocketMessage {
  type: string
  data: any
  timestamp?: number
  id?: string
}

interface WebSocketContextType {
  connected: boolean
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  sendMessage: (message: WebSocketMessage) => void
  lastMessage: WebSocketMessage | null
  subscribe: (callback: (message: WebSocketMessage) => void) => () => void
  stats: {
    messagesReceived: number
    messagesSent: number
    subscriberCount: number
    connectionTime: number | null
    lastActivity: number | null
  }
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

// Performance monitoring
const performanceMonitor = {
  renderCount: 0,
  lastRenderTime: 0,

  trackRender() {
    this.renderCount++
    this.lastRenderTime = performance.now()

    if (this.renderCount % 10 === 0) {
      console.log(`🔄 WebSocket Provider rendered ${this.renderCount} times`)
    }
  },

  trackMessage(type: string, direction: "in" | "out") {
    const timestamp = performance.now()
    console.log(`📡 WebSocket ${direction === "in" ? "⬇️" : "⬆️"} [${type}] at ${timestamp.toFixed(2)}ms`)
  },
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // Track renders for performance monitoring
  performanceMonitor.trackRender()

  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  // Performance stats
  const [stats, setStats] = useState({
    messagesReceived: 0,
    messagesSent: 0,
    subscriberCount: 0,
    connectionTime: null as number | null,
    lastActivity: null as number | null,
  })

  // Use useRef to maintain the same reference across renders
  const subscribersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionStartTime = useRef<number | null>(null)

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      const enhancedMessage = {
        ...message,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      performanceMonitor.trackMessage(message.type, "out")

      if (connected) {
        console.log("✅ WebSocket message sent:", enhancedMessage)
        setStats((prev) => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
          lastActivity: Date.now(),
        }))
      } else {
        console.warn("⚠️ WebSocket not connected, message queued:", enhancedMessage)
      }
    },
    [connected],
  )

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    console.log("🔗 New WebSocket subscriber added")
    subscribersRef.current.add(callback)

    setStats((prev) => ({
      ...prev,
      subscriberCount: subscribersRef.current.size,
    }))

    return () => {
      console.log("🔌 WebSocket subscriber removed")
      subscribersRef.current.delete(callback)
      setStats((prev) => ({
        ...prev,
        subscriberCount: subscribersRef.current.size,
      }))
    }
  }, [])

  useEffect(() => {
    console.log("🚀 WebSocket Provider useEffect triggered", {
      hasUser: !!user,
      userEmail: user?.email,
      renderCount: performanceMonitor.renderCount,
    })

    if (!user) {
      console.log("👤 No user, disconnecting WebSocket")
      setConnected(false)
      setConnectionStatus("disconnected")
      setStats((prev) => ({
        ...prev,
        connectionTime: null,
        lastActivity: null,
      }))
      return
    }

    // Clear any existing connections
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Simulate WebSocket connection
    console.log("🔄 Initiating WebSocket connection...")
    setConnectionStatus("connecting")
    connectionStartTime.current = performance.now()

    // For demo purposes, we'll simulate the connection
    timeoutRef.current = setTimeout(() => {
      const connectionTime = performance.now() - (connectionStartTime.current || 0)
      console.log(`✅ WebSocket connected in ${connectionTime.toFixed(2)}ms`)

      setConnected(true)
      setConnectionStatus("connected")
      setStats((prev) => ({
        ...prev,
        connectionTime: connectionTime,
        lastActivity: Date.now(),
      }))
    }, 1000)

    // Simulate receiving real-time updates
    intervalRef.current = setInterval(() => {
      // Reduce frequency for better performance (was 0.9, now 0.95)
      if (Math.random() > 0.95) {
        const messageTypes = ["audit_progress", "audit_complete", "issue_detected", "system_notification"]
        const type = messageTypes[Math.floor(Math.random() * messageTypes.length)]

        const newMessage: WebSocketMessage = {
          type,
          data: generateMockData(type),
          timestamp: Date.now(),
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }

        performanceMonitor.trackMessage(type, "in")
        console.log(`📨 Received WebSocket message [${type}]:`, newMessage.data)

        setLastMessage(newMessage)
        setStats((prev) => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
          lastActivity: Date.now(),
        }))

        // Notify all subscribers
        const subscriberCount = subscribersRef.current.size
        console.log(`📢 Broadcasting to ${subscriberCount} subscribers`)

        let successCount = 0
        let errorCount = 0

        subscribersRef.current.forEach((callback, index) => {
          try {
            callback(newMessage)
            successCount++
          } catch (error) {
            errorCount++
            console.error(`❌ Error in WebSocket subscriber ${index}:`, error)
          }
        })

        console.log(`📊 Broadcast complete: ${successCount} success, ${errorCount} errors`)
      }
    }, 8000) // Increased interval from 5s to 8s for better performance

    return () => {
      console.log("🧹 Cleaning up WebSocket connections")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setConnected(false)
      setConnectionStatus("disconnected")
    }
  }, [user]) // Only depend on user

  // Performance monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("📊 WebSocket Performance Stats:", {
        renderCount: performanceMonitor.renderCount,
        lastRenderTime: performanceMonitor.lastRenderTime,
        subscriberCount: subscribersRef.current.size,
        connected,
        connectionStatus,
        stats,
      })
    }, 30000) // Log stats every 30 seconds

    return () => clearInterval(interval)
  }, [connected, connectionStatus, stats])

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        connectionStatus,
        sendMessage,
        lastMessage,
        subscribe,
        stats,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

// Helper function to generate mock data for different message types
function generateMockData(type: string) {
  switch (type) {
    case "audit_progress":
      return {
        websiteId: "website_1",
        step: "performance",
        progress: Math.floor(Math.random() * 100),
        message: "Analyzing Core Web Vitals...",
      }
    case "audit_complete":
      return {
        websiteId: "website_1",
        auditId: `audit_${Date.now()}`,
        score: Math.floor(Math.random() * 40) + 60,
        issues: {
          critical: Math.floor(Math.random() * 5),
          warning: Math.floor(Math.random() * 10),
          info: Math.floor(Math.random() * 15),
        },
      }
    case "issue_detected":
      return {
        websiteId: "website_1",
        severity: "critical",
        type: "performance",
        message: "Large Cumulative Layout Shift detected",
        url: "/products",
      }
    case "system_notification":
      return {
        message: "System maintenance scheduled for tonight at 2 AM UTC",
        severity: "info",
      }
    default:
      return {}
  }
}
