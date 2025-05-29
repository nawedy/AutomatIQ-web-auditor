"use client"

import { useState } from "react"
import { useWebSocket } from "@/components/real-time/websocket-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Activity, Wifi, WifiOff, Clock, Users, MessageSquare, Send } from "lucide-react"

export function WebSocketDebugPanel() {
  const { connected, connectionStatus, stats, lastMessage, sendMessage } = useWebSocket()
  const [isOpen, setIsOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "disconnected":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />
      case "connecting":
        return <Activity className="h-4 w-4 animate-spin" />
      default:
        return <WifiOff className="h-4 w-4" />
    }
  }

  const sendTestMessage = () => {
    sendMessage({
      type: "test_message",
      data: {
        message: "Test message from debug panel",
        timestamp: new Date().toISOString(),
      },
    })
  }

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A"
    return `${ms.toFixed(2)}ms`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {getStatusIcon()}
            WebSocket Debug
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="w-80 mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                WebSocket Status
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(connectionStatus)}`} />
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Connect Time:</span>
                </div>
                <span className="text-muted-foreground">{formatDuration(stats.connectionTime)}</span>

                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Subscribers:</span>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {stats.subscriberCount}
                </Badge>
              </div>

              {/* Message Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Received:</span>
                </div>
                <Badge variant="outline" className="w-fit">
                  {stats.messagesReceived}
                </Badge>

                <div className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  <span>Sent:</span>
                </div>
                <Badge variant="outline" className="w-fit">
                  {stats.messagesSent}
                </Badge>
              </div>

              {/* Last Activity */}
              <div className="text-sm">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Last Activity:</span>
                </div>
                <span className="text-muted-foreground">{formatTime(stats.lastActivity)}</span>
              </div>

              {/* Last Message */}
              {lastMessage && (
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Last Message:</span>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs">
                    <div className="font-mono">Type: {lastMessage.type}</div>
                    <div className="font-mono text-muted-foreground">ID: {lastMessage.id?.slice(-8)}</div>
                    <div className="font-mono text-muted-foreground">
                      Time: {lastMessage.timestamp ? formatTime(lastMessage.timestamp) : "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {/* Test Controls */}
              <div className="pt-2 border-t">
                <Button onClick={sendTestMessage} size="sm" variant="outline" className="w-full" disabled={!connected}>
                  Send Test Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
