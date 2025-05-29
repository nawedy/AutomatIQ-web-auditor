"use client"

import { useEffect } from "react"
import { useWebSocket } from "@/components/real-time/websocket-provider"
import { useNotifications } from "@/components/notifications/notification-provider"

export function useWebSocketNotifications() {
  const { subscribe } = useWebSocket()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      const { type, data } = message

      switch (type) {
        case "audit_complete":
          addNotification({
            type: "audit_complete",
            title: "Audit Complete",
            message: `Audit completed with score: ${data.score}`,
            priority: "medium",
            read: false,
            data,
          })
          break
        case "issue_detected":
          addNotification({
            type: "issue_detected",
            title: "Issue Detected",
            message: data.message,
            priority: "high",
            read: false,
            data,
          })
          break
        case "system_notification":
          addNotification({
            type: "system",
            title: "System Notification",
            message: data.message,
            priority: "medium",
            read: false,
            data,
          })
          break
      }
    })

    return unsubscribe
  }, [subscribe, addNotification])
}
