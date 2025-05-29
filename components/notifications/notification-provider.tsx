"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "./notification-center"

interface Notification {
  id: string
  type: "audit_complete" | "issue_detected" | "score_improvement" | "system" | "weekly_report"
  title: string
  message: string
  priority: "low" | "medium" | "high"
  read: boolean
  data?: any
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "created_at">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "created_at">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Add initial demo notifications
  useEffect(() => {
    if (!user) return

    // Add some initial notifications for demo
    setNotifications([
      {
        id: "1",
        type: "audit_complete",
        title: "Audit Complete",
        message: "Website audit for 'My Portfolio' completed successfully",
        priority: "medium",
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      },
      {
        id: "2",
        type: "issue_detected",
        title: "Critical Issue Detected",
        message: "Security vulnerability found on your homepage",
        priority: "high",
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: "3",
        type: "score_improvement",
        title: "Score Improved",
        message: "Your SEO score has improved by 15 points",
        priority: "low",
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
    ])
  }, [user])

  // Simulate real-time notifications
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      // Randomly add notifications for demo
      if (Math.random() > 0.95) {
        const types = ["audit_complete", "issue_detected", "score_improvement", "system"] as const
        const priorities = ["low", "medium", "high"] as const
        const randomType = types[Math.floor(Math.random() * types.length)]
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)]

        const messages = {
          audit_complete: "Website audit completed successfully",
          issue_detected: "New issue detected on your website",
          score_improvement: "Your website score has improved",
          system: "System maintenance scheduled for tonight",
        }

        addNotification({
          type: randomType,
          title: randomType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          message: messages[randomType],
          priority: randomPriority,
          read: false,
          data: {
            websiteName: "My Portfolio",
            score: Math.floor(Math.random() * 100),
            issuesFound: Math.floor(Math.random() * 5),
            issueType: "Performance Issue",
          },
        })
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [user])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}

      {/* Notification Bell - Fixed Position */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="border-white/20 text-white hover:bg-white/10 relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteNotification={deleteNotification}
        clearAll={clearAll}
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
