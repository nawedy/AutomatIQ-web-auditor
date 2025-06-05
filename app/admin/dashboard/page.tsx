"use client"

// src/app/admin/dashboard/page.tsx
// Admin dashboard overview page

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminClientOverview } from "@/components/admin/client-overview"
import { AdminSystemHealth } from "@/components/admin/system-health"
import { AdminAuditMetrics } from "@/components/admin/audit-metrics"
import { AdminRecentActivity } from "@/components/admin/recent-activity"
import { AdminResourceUsage } from "@/components/admin/resource-usage"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { ComparativeAnalysis } from "@/components/audit/comparative-analysis"
import { MonitoringDashboard } from "@/components/monitoring/monitoring-dashboard"
import { 
  Users, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Server,
  Clock,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalWebsites: 0,
    totalAudits: 0,
    criticalIssues: 0,
    monitoredWebsites: 0,
    activeAlerts: 0,
    systemHealth: 0,
    apiResponseTime: 0,
    dbQueryTime: 0,
    storageUsed: 0,
    totalStorage: 0
  })
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalClients: 48,
        activeClients: 42,
        totalWebsites: 156,
        totalAudits: 1248,
        criticalIssues: 23,
        monitoredWebsites: 87,
        activeAlerts: 12,
        systemHealth: 98,
        apiResponseTime: 124,
        dbQueryTime: 78,
        storageUsed: 128,
        totalStorage: 500
      })
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {stats.activeClients} Active
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {stats.totalClients - stats.activeClients} Inactive
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Websites</CardTitle>
            <Globe className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalWebsites}</div>
            <p className="text-xs text-purple-400">~{(stats.totalWebsites / stats.totalClients).toFixed(1)} per client</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.criticalIssues}</div>
            <p className="text-xs text-red-400">Across all monitored websites</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">System Health</CardTitle>
            <Server className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monitored Websites</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.monitoredWebsites}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {stats.activeAlerts} Alerts
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-black/20 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="audits" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Audit Management
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Client Analytics
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            System Performance
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Recent Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminClientOverview />
            <AdminAuditMetrics />
          </div>
          <AdminRecentActivity />
        </TabsContent>
        
        <TabsContent value="audits" className="space-y-6">
          <AdminOverview />
          
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Comparative Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Sample comparative analysis for a website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalWebsites > 0 ? (
                <ComparativeAnalysis websiteId="sample-website-id" />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-400">No websites available for analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringDashboard 
            websites={[
              { 
                id: "website-1", 
                name: "Company Website", 
                url: "https://example.com", 
                monitoringEnabled: true 
              },
              { 
                id: "website-2", 
                name: "E-commerce Store", 
                url: "https://store.example.com", 
                monitoringEnabled: true 
              },
              { 
                id: "website-3", 
                name: "Marketing Blog", 
                url: "https://blog.example.com", 
                monitoringEnabled: false 
              }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Client Analytics
              </CardTitle>
              <CardDescription className="text-gray-300">
                Detailed analytics for all client accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-400">Client analytics visualization will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminSystemHealth />
            <AdminResourceUsage 
              storageUsed={stats.storageUsed}
              totalStorage={stats.totalStorage}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <AdminRecentActivity limit={20} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
