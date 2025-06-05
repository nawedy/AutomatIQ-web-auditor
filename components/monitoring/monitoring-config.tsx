"use client"

// src/components/monitoring/monitoring-config.tsx
// Component for configuring website monitoring settings

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Settings, Save, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface MonitoringConfig {
  websiteId: string
  enabled: boolean
  frequency: string
  alertThreshold: number
  metrics: string[]
  emailNotifications: boolean
  slackWebhook: string | null
}

interface MonitoringConfigProps {
  websiteId: string
  onConfigChange?: (enabled: boolean) => void
}

const AVAILABLE_METRICS = [
  { id: "overallScore", label: "Overall Score" },
  { id: "seoScore", label: "SEO Score" },
  { id: "performanceScore", label: "Performance Score" },
  { id: "accessibilityScore", label: "Accessibility Score" },
  { id: "bestPracticesScore", label: "Best Practices Score" },
  { id: "securityScore", label: "Security Score" }
]

export function MonitoringConfig({ websiteId, onConfigChange }: MonitoringConfigProps) {
  const [config, setConfig] = useState<MonitoringConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchConfig = async () => {
    if (!websiteId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/monitor/config?websiteId=${websiteId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch monitoring configuration: ${response.statusText}`)
      }
      
      const data = await response.json()
      setConfig(data)
      
      // Notify parent component of config change if callback provided
      if (onConfigChange) {
        onConfigChange(data.enabled)
      }
    } catch (err) {
      setError(`Error fetching configuration: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to load monitoring configuration: ${(err as Error).message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config || !websiteId) return
    
    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch('/api/monitor/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...config,
          websiteId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update monitoring configuration: ${response.statusText}`)
      }
      
      toast({
        title: "Success",
        description: "Monitoring configuration updated successfully",
        variant: "default"
      })
      
      // Notify parent component of config change if callback provided
      if (onConfigChange) {
        onConfigChange(config.enabled)
      }
    } catch (err) {
      setError(`Error updating configuration: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to update monitoring configuration: ${(err as Error).message}`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMetricToggle = (metricId: string) => {
    if (!config) return
    
    const updatedMetrics = config.metrics.includes(metricId)
      ? config.metrics.filter(id => id !== metricId)
      : [...config.metrics, metricId]
    
    setConfig({
      ...config,
      metrics: updatedMetrics
    })
  }

  const disableMonitoring = async () => {
    if (!websiteId) return
    
    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/monitor/config?websiteId=${websiteId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to disable monitoring: ${response.statusText}`)
      }
      
      // Update local state
      if (config) {
        setConfig({
          ...config,
          enabled: false
        })
      }
      
      toast({
        title: "Success",
        description: "Monitoring disabled successfully",
        variant: "default"
      })
      
      // Notify parent component of config change if callback provided
      if (onConfigChange) {
        onConfigChange(false)
      }
    } catch (err) {
      setError(`Error disabling monitoring: ${(err as Error).message}`)
      toast({
        title: "Error",
        description: `Failed to disable monitoring: ${(err as Error).message}`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (websiteId) {
      fetchConfig()
    }
  }, [websiteId])

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-yellow-400" />
            Monitoring Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={fetchConfig}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!config) return null

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-yellow-400" />
          Monitoring Configuration
        </CardTitle>
        <CardDescription className="text-gray-300">
          Configure continuous monitoring settings for your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="monitoring-enabled" className="text-white">Enable Monitoring</Label>
            <p className="text-xs text-gray-400">
              Automatically check your website on a regular schedule
            </p>
          </div>
          <Switch
            id="monitoring-enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monitoring-frequency" className="text-white">Monitoring Frequency</Label>
          <Select
            value={config.frequency}
            onValueChange={(value) => setConfig({ ...config, frequency: value })}
            disabled={!config.enabled}
          >
            <SelectTrigger id="monitoring-frequency" className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alert-threshold" className="text-white">Alert Threshold (%)</Label>
          <p className="text-xs text-gray-400 mb-1">
            Get alerted when scores drop by this percentage or more
          </p>
          <Input
            id="alert-threshold"
            type="number"
            min={1}
            max={50}
            value={config.alertThreshold}
            onChange={(e) => setConfig({ ...config, alertThreshold: parseInt(e.target.value) || 10 })}
            disabled={!config.enabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Metrics to Monitor</Label>
          <p className="text-xs text-gray-400 mb-1">
            Select which metrics to track for changes
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_METRICS.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`metric-${metric.id}`}
                  checked={config.metrics.includes(metric.id)}
                  onCheckedChange={() => handleMetricToggle(metric.id)}
                  disabled={!config.enabled}
                />
                <label
                  htmlFor={`metric-${metric.id}`}
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  {metric.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Notification Settings</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-notifications"
              checked={config.emailNotifications}
              onCheckedChange={(checked) => setConfig({ ...config, emailNotifications: !!checked })}
              disabled={!config.enabled}
            />
            <label
              htmlFor="email-notifications"
              className="text-sm text-gray-300 cursor-pointer"
            >
              Email notifications
            </label>
          </div>
          
          <div className="pt-2">
            <Label htmlFor="slack-webhook" className="text-sm text-gray-300">
              Slack Webhook URL (Optional)
            </Label>
            <Input
              id="slack-webhook"
              type="text"
              placeholder="https://hooks.slack.com/services/..."
              value={config.slackWebhook || ''}
              onChange={(e) => setConfig({ ...config, slackWebhook: e.target.value || null })}
              disabled={!config.enabled}
              className="w-full mt-1"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          onClick={disableMonitoring}
          disabled={!config.enabled || saving}
        >
          Disable Monitoring
        </Button>
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="gap-1"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
