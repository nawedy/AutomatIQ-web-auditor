"use client"

// src/components/admin/recent-activity.tsx
// Component for displaying recent activity across the platform

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Activity, 
  Clock, 
  User, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Bell,
  Shield,
  Loader2,
  Building,
  ExternalLink
} from "lucide-react"

interface RecentActivityProps {
  limit?: number
  refreshInterval?: number // in milliseconds
  initialLoad?: boolean
}

interface ActivityItem {
  id: string
  type: string
  title: string
  clientName?: string
  clientId?: string
  status?: string
  user?: {
    id: string
    name: string
    role?: string
  } | null
  timestamp: string
  timeAgo: string
  details: Record<string, any>
  severity?: string
  resolved?: boolean
}

// Helper function to get icon for activity type
const getActivityIcon = (type: string, severity?: string) => {
  switch (type) {
    case "audit":
      return <CheckCircle className="w-4 h-4" />
    case "alert":
      return <AlertTriangle className="w-4 h-4" />
    case "login":
      return <User className="w-4 h-4" />
    case "client":
      return <Building className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

// Helper function to get icon color for activity type
const getActivityIconColor = (type: string, severity?: string) => {
  if (type === "alert") {
    switch (severity) {
      case "critical":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }
  
  switch (type) {
    case "audit":
      return "text-green-400"
    case "login":
      return "text-blue-400"
    case "client":
      return "text-cyan-400"
    default:
      return "text-gray-400"
  }
}

// Helper function to get activity type badge style
const getActivityBadge = (type: string, severity?: string) => {
  if (type === "alert" && severity) {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "info":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }
  
  switch (type) {
    case "audit":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "login":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "client":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

// Format timestamp to time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AdminRecentActivity({ 
  limit = 10, 
  refreshInterval = 60000,
  initialLoad = true
}: RecentActivityProps = {}) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(initialLoad)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch recent activity data from API
  const fetchRecentActivity = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/recent-activity?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setActivities(data.recentActivity)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch recent activity data:', err)
      setError('Failed to load recent activity data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data fetch and refresh interval
  useEffect(() => {
    if (initialLoad) {
      fetchRecentActivity()
    }
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchRecentActivity()
    }, refreshInterval)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [refreshInterval, initialLoad, limit])
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchRecentActivity()
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-300">
            Latest actions across all client accounts
            {lastUpdated && (
              <span className="ml-2 text-xs opacity-70">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-white/10 text-white hover:bg-white/10"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && activities.length === 0 ? (
          // Loading skeleton
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8 text-red-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            {error}
            <Button 
              variant="outline" 
              className="mt-4 border-white/10 hover:bg-white/10"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        ) : (
          // Actual content
          <div className="space-y-1">
            {activities.map((activity) => {
              const iconColor = getActivityIconColor(activity.type, activity.severity)
              const icon = getActivityIcon(activity.type, activity.severity)
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className={`mt-1 ${iconColor}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {activity.clientName && (
                          <span className="font-medium text-white truncate">
                            {activity.clientName}
                          </span>
                        )}
                        <Badge className={getActivityBadge(activity.type, activity.severity)}>
                          {activity.type}
                        </Badge>
                        {activity.status && (
                          <Badge variant="outline" className="border-white/10">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center whitespace-nowrap text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.timeAgo}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{activity.title}</p>
                    <div className="flex items-center flex-wrap gap-4 mt-1 text-xs text-gray-400">
                      {activity.details.websiteUrl && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <a 
                            href={activity.details.websiteUrl.startsWith('http') ? 
                              activity.details.websiteUrl : 
                              `https://${activity.details.websiteUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary flex items-center"
                          >
                            {activity.details.websiteUrl}
                            <ExternalLink className="w-2 h-2 ml-1" />
                          </a>
                        </div>
                      )}
                      {activity.user && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.user.name}
                          {activity.user.role && (
                            <span className="opacity-70">({activity.user.role})</span>
                          )}
                        </div>
                      )}
                      {activity.details.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(activity.details.duration)}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {activities.length > 0 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-primary hover:bg-primary/10"
            onClick={() => window.location.href = "/admin/activity"}
          >
            View All Activity
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
