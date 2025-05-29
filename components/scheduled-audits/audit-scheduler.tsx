"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Play, Settings, Globe } from "lucide-react"

interface ScheduledAudit {
  id: string
  websiteId: string
  websiteName: string
  frequency: "daily" | "weekly" | "monthly"
  nextRun: string
  lastRun?: string
  enabled: boolean
  timeOfDay: string
  dayOfWeek?: number
  dayOfMonth?: number
}

export function AuditScheduler() {
  const [scheduledAudits, setScheduledAudits] = useState<ScheduledAudit[]>([
    {
      id: "1",
      websiteId: "website_1",
      websiteName: "example.com",
      frequency: "daily",
      nextRun: "2024-03-16T10:30:00Z",
      lastRun: "2024-03-15T10:30:00Z",
      enabled: true,
      timeOfDay: "10:30",
    },
    {
      id: "2",
      websiteId: "website_2",
      websiteName: "mystore.com",
      frequency: "weekly",
      nextRun: "2024-03-18T08:15:00Z",
      lastRun: "2024-03-11T08:15:00Z",
      enabled: true,
      timeOfDay: "08:15",
      dayOfWeek: 1, // Monday
    },
    {
      id: "3",
      websiteId: "website_3",
      websiteName: "portfolio.dev",
      frequency: "monthly",
      nextRun: "2024-04-01T14:00:00Z",
      lastRun: "2024-03-01T14:00:00Z",
      enabled: false,
      timeOfDay: "14:00",
      dayOfMonth: 1,
    },
  ])

  const toggleSchedule = (id: string) => {
    setScheduledAudits((prev) => prev.map((audit) => (audit.id === id ? { ...audit, enabled: !audit.enabled } : audit)))
  }

  const updateFrequency = (id: string, frequency: "daily" | "weekly" | "monthly") => {
    setScheduledAudits((prev) => prev.map((audit) => (audit.id === id ? { ...audit, frequency } : audit)))
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "weekly":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "monthly":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (enabled: boolean) => {
    return enabled
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Scheduled Audits
        </CardTitle>
        <CardDescription className="text-gray-300">Manage automatic audit schedules for your websites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledAudits.map((audit) => (
            <div key={audit.id} className="neomorphism p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">{audit.websiteName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Next: {new Date(audit.nextRun).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getFrequencyColor(audit.frequency)}>{audit.frequency}</Badge>
                  <Badge className={getStatusColor(audit.enabled)}>{audit.enabled ? "Active" : "Paused"}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Frequency</label>
                  <Select
                    value={audit.frequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") => updateFrequency(audit.id, value)}
                  >
                    <SelectTrigger className="neomorphism border-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Time</label>
                  <div className="text-white bg-black/20 rounded px-3 py-2">{audit.timeOfDay}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    <Switch checked={audit.enabled} onCheckedChange={() => toggleSchedule(audit.id)} />
                    <span className="text-white text-sm">{audit.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>

              {audit.lastRun && (
                <div className="text-sm text-gray-400 mb-3">Last run: {new Date(audit.lastRun).toLocaleString()}</div>
              )}

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <Button className="shimmer text-white font-semibold">
            <Calendar className="w-4 h-4 mr-2" />
            Add New Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
