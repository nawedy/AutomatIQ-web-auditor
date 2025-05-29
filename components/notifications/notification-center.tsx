"use client"
import { useState, useEffect } from "react"
import { X, Bell, AlertTriangle, CheckCircle, Info, Trash2, BookMarkedIcon as MarkAsRead } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

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

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const handleClosePopups = () => {
      onClose()
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "high") return notification.priority === "high"
    return true
  })

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case "audit_complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "issue_detected":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "score_improvement":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "system":
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end p-4" data-popup="notification-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Badge variant="secondary">{notifications.filter((n) => !n.read).length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
            <MarkAsRead className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-2">
            <ScrollArea className="h-full px-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Bell className="w-8 h-8 mb-2" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
