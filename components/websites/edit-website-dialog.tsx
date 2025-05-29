"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Settings } from "lucide-react"

interface EditWebsiteDialogProps {
  website: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWebsiteDialog({ website, open, onOpenChange }: EditWebsiteDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    auditFrequency: "weekly",
    notifications: true,
    tags: [] as string[],
    newTag: "",
  })

  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name || "",
        url: website.url || "",
        description: website.description || "",
        auditFrequency: website.auditFrequency || "weekly",
        notifications: website.notifications || false,
        tags: website.tags || [],
        newTag: "",
      })
    }
  }, [website])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Updating website:", formData)
    // Implement website update
    onOpenChange(false)
  }

  const addTag = () => {
    if (formData.newTag && !formData.tags.includes(formData.newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag],
        newTag: "",
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Edit Website
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Update website settings and audit configuration.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">
                  Website Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Website"
                  className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="url" className="text-white">
                  Website URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the website..."
                className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                rows={3}
              />
            </div>
          </div>

          {/* Audit Settings */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Audit Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency" className="text-white">
                  Audit Frequency
                </Label>
                <Select
                  value={formData.auditFrequency}
                  onValueChange={(value) => setFormData({ ...formData, auditFrequency: value })}
                >
                  <SelectTrigger className="neomorphism border-0 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked as boolean })}
                  />
                  <Label htmlFor="notifications" className="text-gray-300">
                    Enable notifications
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Tags</h3>
            <div className="flex gap-2">
              <Input
                value={formData.newTag}
                onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                placeholder="Add a tag..."
                className="neomorphism border-0 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="border-white/20 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-white/20 text-gray-300">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
            <Button type="submit" className="shimmer text-white font-semibold">
              Update Website
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
