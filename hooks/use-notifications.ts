"use client"

import { useState, useEffect, useCallback } from "react"

interface Notification {
  id: string
  type: "audit_complete" | "issue_detected" | "score_improved" | "system" | "scheduled"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  websiteId?: string
  websiteName?: string
  actionUrl?: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  refetch: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "audit_complete",
          title: "Audit Complete",
          message: "Website audit for example.com has finished. Score: 85 (+7 from last audit)",
          timestamp: "2024-03-15T10:30:00Z",
          read: false,
          priority: "medium",
          websiteId: "1",
          websiteName: "example.com",
          actionUrl: "/reports/1",
        },
        {
          id: "2",
          type: "issue_detected",
          title: "Critical Issue Detected",
          message: "New critical performance issue found on mystore.com: Large Cumulative Layout Shift",
          timestamp: "2024-03-15T09:15:00Z",
          read: false,
          priority: "high",
          websiteId: "2",
          websiteName: "mystore.com",
          actionUrl: "/reports/2",
        },
        {
          id: "3",
          type: "score_improved",
          title: "Score Improvement",
          message: "portfolio.dev SEO score improved from 68 to 75 (+7 points)",
          timestamp: "2024-03-14T16:45:00Z",
          read: true,
          priority: "low",
          websiteId: "3",
          websiteName: "portfolio.dev",
          actionUrl: "/reports/3",
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }, [])

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const refetch = async () => {
    await fetchNotifications()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.98) {
        // 2% chance every 10 seconds
        const types = ["audit_complete", "issue_detected", "score_improved"] as const
        const type = types[Math.floor(Math.random() * types.length)]

        addNotification({
          type,
          title: `${type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
          message: "New notification received",
          priority: "medium",
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [addNotification])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refetch,
  }
}
