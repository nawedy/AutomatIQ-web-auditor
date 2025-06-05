"use client"

// src/components/monitoring/monitoring-dashboard.tsx
// Main component for the website monitoring dashboard

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonitoringAlerts } from "./monitoring-alerts"
import { MonitoringConfig } from "./monitoring-config"
import { MonitoringTrends } from "./monitoring-trends"
import { useToast } from "@/components/ui/use-toast"
import { Activity, Bell, Settings, AlertTriangle } from "lucide-react"

interface Website {
  id: string
  name: string
  url: string
  monitoringEnabled?: boolean
}

interface MonitoringDashboardProps {
  websites?: Website[]
  initialWebsiteId?: string
}

export function MonitoringDashboard({ websites = [], initialWebsiteId }: MonitoringDashboardProps) {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(initialWebsiteId || "")
  const [unreadAlertCount, setUnreadAlertCount] = useState(0)
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Set initial website if provided
    if (initialWebsiteId) {
      setSelectedWebsiteId(initialWebsiteId)
    } 
    // Otherwise use the first website in the list if available
    else if (websites.length > 0 && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0].id)
    }
  }, [initialWebsiteId, websites])

  // Update monitoring enabled state when website changes
  useEffect(() => {
    if (selectedWebsiteId) {
      const selectedWebsite = websites.find(website => website.id === selectedWebsiteId)
      if (selectedWebsite) {
        setMonitoringEnabled(!!selectedWebsite.monitoringEnabled)
      }
    }
  }, [selectedWebsiteId, websites])

  const handleAlertCountChange = (count: number) => {
    setUnreadAlertCount(count)
  }

  const handleConfigChange = (enabled: boolean) => {
    setMonitoringEnabled(enabled)
    
    // Update the local websites array to reflect the change
    const updatedWebsites = websites.map(website => 
      website.id === selectedWebsiteId 
        ? { ...website, monitoringEnabled: enabled } 
        : website
    )
    
    // This would typically be handled by the parent component
    // but we're updating our local state for immediate UI feedback
    if (enabled) {
      toast({
        title: "Monitoring Enabled",
        description: `Continuous monitoring has been enabled for this website.`,
        variant: "default"
      })
    }
  }

  if (websites.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-yellow-400" />
            Website Monitoring
          </CardTitle>
          <CardDescription className="text-gray-300">
            Continuous monitoring and alerts for your websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p className="text-lg font-medium">No websites available</p>
            <p className="text-sm mt-1">
              Add a website to your account to enable continuous monitoring.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Website Monitoring</h2>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedWebsiteId}
            onValueChange={setSelectedWebsiteId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{website.name}</span>
                    {website.monitoringEnabled && (
                      <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500/30">
                        Monitoring On
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedWebsiteId ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="relative">
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {unreadAlertCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white"
                  variant="destructive"
                >
                  {unreadAlertCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6">
              <MonitoringTrends websiteId={selectedWebsiteId} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-yellow-400" />
                      Recent Alerts
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Latest monitoring alerts for your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monitoringEnabled ? (
                      <MonitoringAlerts 
                        websiteId={selectedWebsiteId} 
                        onAlertCountChange={handleAlertCountChange}
                      />
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        <Bell className="h-10 w-10 mx-auto mb-3 text-gray-500" />
                        <p className="text-lg font-medium">Monitoring is disabled</p>
                        <p className="text-sm mt-1 mb-4">
                          Enable monitoring to receive alerts about your website's performance.
                        </p>
                        <Button 
                          variant="default" 
                          onClick={() => {
                            // Navigate to settings tab
                            const settingsTab = document.querySelector('[value="settings"]') as HTMLElement
                            if (settingsTab) settingsTab.click()
                          }}
                        >
                          Configure Monitoring
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-yellow-400" />
                      Monitoring Status
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Current monitoring configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-white/10 rounded-md bg-white/5">
                        <span className="text-white">Status</span>
                        <Badge 
                          className={monitoringEnabled 
                            ? "bg-green-500/20 text-green-500 border-green-500/30"
                            : "bg-red-500/20 text-red-500 border-red-500/30"
                          }
                        >
                          {monitoringEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      {monitoringEnabled && (
                        <>
                          <div className="flex items-center justify-between p-3 border border-white/10 rounded-md bg-white/5">
                            <span className="text-white">Alert Threshold</span>
                            <span className="text-white">10%</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-white/10 rounded-md bg-white/5">
                            <span className="text-white">Frequency</span>
                            <span className="text-white">Weekly</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-white/10 rounded-md bg-white/5">
                            <span className="text-white">Notifications</span>
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                              Email
                            </Badge>
                          </div>
                        </>
                      )}
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Navigate to settings tab
                            const settingsTab = document.querySelector('[value="settings"]') as HTMLElement
                            if (settingsTab) settingsTab.click()
                          }}
                        >
                          {monitoringEnabled ? "Update Configuration" : "Enable Monitoring"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            <MonitoringAlerts 
              websiteId={selectedWebsiteId} 
              onAlertCountChange={handleAlertCountChange}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <MonitoringConfig 
              websiteId={selectedWebsiteId}
              onConfigChange={handleConfigChange}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="glass-card border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Please select a website to view monitoring data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
