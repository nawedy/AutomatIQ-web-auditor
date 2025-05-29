"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

interface Website {
  id: string
  name: string
  url: string
  description?: string
  status: "active" | "paused" | "error"
  last_audit_at?: string
  next_audit_at?: string
  total_audits: number
  average_score: number
  audit_frequency: "daily" | "weekly" | "monthly" | "manual"
  notifications: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

interface UseWebsitesReturn {
  websites: Website[]
  loading: boolean
  error: string | null
  addWebsite: (
    website: Omit<Website, "id" | "created_at" | "updated_at" | "total_audits" | "average_score">,
  ) => Promise<void>
  updateWebsite: (id: string, updates: Partial<Website>) => Promise<void>
  deleteWebsite: (id: string) => Promise<void>
  runAudit: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useWebsites(): UseWebsitesReturn {
  const { user } = useAuth()
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebsites = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/websites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch websites")
      }

      const data = await response.json()
      setWebsites(data.websites || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch websites")
    } finally {
      setLoading(false)
    }
  }

  const addWebsite = async (
    websiteData: Omit<Website, "id" | "created_at" | "updated_at" | "total_audits" | "average_score">,
  ) => {
    try {
      setError(null)

      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(websiteData),
      })

      if (!response.ok) {
        throw new Error("Failed to add website")
      }

      const data = await response.json()
      setWebsites((prev) => [data.website, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add website")
      throw err
    }
  }

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    try {
      setError(null)

      const response = await fetch(`/api/websites/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update website")
      }

      const data = await response.json()
      setWebsites((prev) => prev.map((website) => (website.id === id ? data.website : website)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update website")
      throw err
    }
  }

  const deleteWebsite = async (id: string) => {
    try {
      setError(null)

      const response = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete website")
      }

      setWebsites((prev) => prev.filter((website) => website.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete website")
      throw err
    }
  }

  const runAudit = async (id: string) => {
    try {
      setError(null)

      const response = await fetch(`/api/websites/${id}/audit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to start audit")
      }

      // Refresh websites to get updated status
      await fetchWebsites()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run audit")
      throw err
    }
  }

  const toggleStatus = async (id: string) => {
    const website = websites.find((w) => w.id === id)
    if (!website) return

    const newStatus = website.status === "active" ? "paused" : "active"
    await updateWebsite(id, { status: newStatus })
  }

  const refetch = async () => {
    await fetchWebsites()
  }

  useEffect(() => {
    if (user) {
      fetchWebsites()
    }
  }, [user])

  return {
    websites,
    loading,
    error,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    runAudit,
    toggleStatus,
    refetch,
  }
}
