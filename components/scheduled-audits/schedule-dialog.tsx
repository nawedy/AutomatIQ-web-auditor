"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Repeat, X } from "lucide-react"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  websites: Array<{ id: string; name: string; url: string }>
  onScheduleCreate: (schedule: any) => void
}

export function ScheduleDialog({ open, onOpenChange, websites, onScheduleCreate }: ScheduleDialogProps) {
  const [scheduleType, setScheduleType] = useState<"one_time" | "recurring">("one_time")
  const [formData, setFormData] = useState({
    website_id: "",
    scheduled_at: "",
    frequency: "weekly",
    time_of_day: "09:00",
    timezone: "UTC",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const scheduleData = {
      ...formData,
      type: scheduleType,
    }

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(scheduleData),
      })

      if (response.ok) {
        const data = await response.json()
        onScheduleCreate(data.schedule)
        onOpenChange(false)
        setFormData({
          website_id: "",
          scheduled_at: "",
          frequency: "weekly",
          time_of_day: "09:00",
          timezone: "UTC",
        })
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Schedule Audit
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Schedule a one-time or recurring audit for your website
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={scheduleType} onValueChange={(value) => setScheduleType(value as "one_time" | "recurring")}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="one_time" className="text-white data-[state=active]:bg-slate-600">
              <Clock className="w-4 h-4 mr-2" />
              One-time
            </TabsTrigger>
            <TabsTrigger value="recurring" className="text-white data-[state=active]:bg-slate-600">
              <Repeat className="w-4 h-4 mr-2" />
              Recurring
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Website Selection */}
            <div>
              <Label htmlFor="website" className="text-white">
                Website *
              </Label>
              <Select
                value={formData.website_id}
                onValueChange={(value) => setFormData({ ...formData, website_id: value })}
                required
              >
                <SelectTrigger className="neomorphism border-0 text-white mt-2">
                  <SelectValue placeholder="Select a website" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.name} ({website.url})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="one_time" className="space-y-4">
              <div>
                <Label htmlFor="scheduled_at" className="text-white">
                  Scheduled Date & Time *
                </Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency" className="text-white">
                    Frequency *
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger className="neomorphism border-0 text-white mt-2">
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
                  <Label htmlFor="time_of_day" className="text-white">
                    Time of Day
                  </Label>
                  <Input
                    id="time_of_day"
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                    className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Timezone */}
            <div>
              <Label htmlFor="timezone" className="text-white">
                Timezone
              </Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger className="neomorphism border-0 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.website_id || (scheduleType === "one_time" && !formData.scheduled_at)}
                className="shimmer text-white font-semibold"
              >
                Schedule Audit
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
