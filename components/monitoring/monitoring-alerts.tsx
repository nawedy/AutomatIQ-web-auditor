"use client"

// src/components/monitoring/monitoring-alerts.tsx
// Component for displaying monitoring alerts

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Bell, CheckCircle, Info, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface Alert {
  id: string
  type: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  message: string
  metric?: string
  threshold?: number
  value?: number
  read: boolean
  createdAt: string
  updatedAt: string
}

interface MonitoringAlertsProps {
  websiteId: string
  onAlertCountChange?: (count: number) => void
}

export function MonitoringAlerts({ websiteId, onAlertCountChange }: MonitoringAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [unreadOnly, setUnreadOnly] = useState(true)
  const { toast } = useToast()

  const fetchAlerts = async () => {
    if (!websiteId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/monitor/alerts?websiteId=${websiteId}&unreadOnly=${unreadOnly}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`)
      }
      
      const data = await response.json()
      setAlerts(data.alerts || [])
      
      // Notify parent component of unread alert count if callback provided
      if (onAlertCountChange) {
        const unreadCount = data.alerts.filter((alert: Alert) => !alert.read).length
        onAlertCountChange(unreadCount)
      }
    } catch (err) {
      setError(`Error fetching alerts: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to load alerts: ${(err as Error).message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    if (selectedAlerts.length === 0) {
      toast({
        title: "No alerts selected",
        description: "Please select at least one alert to mark as read",
        variant: "default"
      })
      return
    }
    
    try {
      const response = await fetch('/api/monitor/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alertIds: selectedAlerts,
          websiteId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to mark alerts as read: ${response.statusText}`)
      }
      
      toast({
        title: "Success",
        description: `${selectedAlerts.length} alert(s) marked as read`,
        variant: "default"
      })
      
      // Update local state
      setAlerts(alerts.map(alert => 
        selectedAlerts.includes(alert.id) ? { ...alert, read: true } : alert
      ))
      
      // Clear selection
      setSelectedAlerts([])
      
      // Refetch if showing unread only
      if (unreadOnly) {
        fetchAlerts()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to mark alerts as read: ${(err as Error).message}`,
        variant: "destructive"
      })
    }
  }

  const toggleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(alerts.map(alert => alert.id))
    }
  }

  const toggleAlert = (alertId: string) => {
    if (selectedAlerts.includes(alertId)) {
      setSelectedAlerts(selectedAlerts.filter(id => id !== alertId))
    } else {
      setSelectedAlerts([...selectedAlerts, alertId])
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'INFO':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Critical</Badge>
      case 'ERROR':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Error</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>
      case 'INFO':
      default:
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Info</Badge>
    }
  }

  useEffect(() => {
    if (websiteId) {
      fetchAlerts()
    }
  }, [websiteId, unreadOnly])

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            Monitoring Alerts
          </CardTitle>
          <CardDescription className="text-gray-300">
            Recent alerts and notifications for your website
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => fetchAlerts()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="unread-only"
              checked={unreadOnly}
              onCheckedChange={(checked) => setUnreadOnly(!!checked)}
            />
            <label htmlFor="unread-only" className="text-sm text-gray-300 cursor-pointer">
              Show unread only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedAlerts.length === 0}
              onClick={markAsRead}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Mark as Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedAlerts.length === alerts.length && alerts.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-white/10">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p className="text-lg font-medium">No alerts found</p>
            <p className="text-sm mt-1">
              {unreadOnly
                ? "You have no unread alerts. Try showing all alerts."
                : "No monitoring alerts have been generated for this website yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                  selectedAlerts.includes(alert.id)
                    ? "bg-primary/10 border-primary/30"
                    : "border-white/10 hover:border-white/20"
                } ${alert.read ? "opacity-70" : ""}`}
              >
                <div className="flex items-center h-full pt-0.5">
                  <Checkbox
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={() => toggleAlert(alert.id)}
                  />
                </div>
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {!alert.read && (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">New</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white mt-1">{alert.message}</p>
                  {alert.metric && (
                    <p className="text-xs text-gray-400 mt-1">
                      Metric: {alert.metric}
                      {alert.threshold && alert.value && (
                        <> • Threshold: {alert.threshold} • Value: {alert.value}</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
