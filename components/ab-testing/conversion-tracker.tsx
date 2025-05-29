"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Eye, MousePointer } from "lucide-react"

interface ConversionEvent {
  type: "view" | "click" | "signup" | "trial"
  variant: "A" | "B"
  timestamp: number
  element?: string
}

export function ConversionTracker() {
  const [events, setEvents] = useState<ConversionEvent[]>([])
  const [variant, setVariant] = useState<"A" | "B">("A")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Determine A/B test variant (50/50 split)
    const savedVariant = localStorage.getItem("ab-variant")
    if (savedVariant) {
      setVariant(savedVariant as "A" | "B")
    } else {
      const newVariant = Math.random() < 0.5 ? "A" : "B"
      setVariant(newVariant)
      localStorage.setItem("ab-variant", newVariant)
    }

    // Load existing events
    const savedEvents = localStorage.getItem("conversion-events")
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error("Error loading conversion events:", error)
      }
    }

    // Track page view
    trackEvent("view")

    // Show tracker after delay (for demo purposes)
    const timer = setTimeout(() => setIsVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const trackEvent = (type: ConversionEvent["type"], element?: string) => {
    const event: ConversionEvent = {
      type,
      variant,
      timestamp: Date.now(),
      element,
    }

    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    localStorage.setItem("conversion-events", JSON.stringify(updatedEvents))

    console.log(`🎯 Conversion Event: ${type} (Variant ${variant})`, element ? `- ${element}` : "")
  }

  const getStats = () => {
    const variantAEvents = events.filter((e) => e.variant === "A")
    const variantBEvents = events.filter((e) => e.variant === "B")

    const calculateConversion = (variantEvents: ConversionEvent[]) => {
      const views = variantEvents.filter((e) => e.type === "view").length
      const conversions = variantEvents.filter((e) => e.type === "signup" || e.type === "trial").length
      return views > 0 ? ((conversions / views) * 100).toFixed(1) : "0.0"
    }

    return {
      variantA: {
        views: variantAEvents.filter((e) => e.type === "view").length,
        clicks: variantAEvents.filter((e) => e.type === "click").length,
        conversions: variantAEvents.filter((e) => e.type === "signup" || e.type === "trial").length,
        rate: calculateConversion(variantAEvents),
      },
      variantB: {
        views: variantBEvents.filter((e) => e.type === "view").length,
        clicks: variantBEvents.filter((e) => e.type === "click").length,
        conversions: variantBEvents.filter((e) => e.type === "signup" || e.type === "trial").length,
        rate: calculateConversion(variantBEvents),
      },
    }
  }

  const stats = getStats()

  if (!isVisible) return null

  return (
    <>
      {/* Floating A/B Test Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <Badge
          className={`${variant === "A" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}
        >
          A/B Test Variant {variant}
        </Badge>
      </div>

      {/* Conversion Tracking Panel */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Card className="glass-card border-white/20 bg-slate-900/95">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Conversion Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-gray-400">Variant A</div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span className="text-white">{stats.variantA.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="w-3 h-3 text-green-400" />
                  <span className="text-white">{stats.variantA.clicks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span className="text-white">{stats.variantA.rate}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-400">Variant B</div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span className="text-white">{stats.variantB.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="w-3 h-3 text-green-400" />
                  <span className="text-white">{stats.variantB.clicks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span className="text-white">{stats.variantB.rate}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs border-white/20 text-white hover:bg-white/10"
                onClick={() => trackEvent("click", "cta-button")}
              >
                Track CTA Click
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs shimmer text-white font-semibold"
                onClick={() => trackEvent("signup", "test-signup")}
              >
                Track Signup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Enhanced CTA buttons with A/B testing
export function ABTestCTA({ variant, children, onClick, ...props }: any) {
  const handleClick = () => {
    // Track conversion event
    const event: ConversionEvent = {
      type: "click",
      variant,
      timestamp: Date.now(),
      element: "cta-button",
    }

    const existingEvents = JSON.parse(localStorage.getItem("conversion-events") || "[]")
    localStorage.setItem("conversion-events", JSON.stringify([...existingEvents, event]))

    if (onClick) onClick()
  }

  // Variant A: Original button
  if (variant === "A") {
    return (
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
    )
  }

  // Variant B: Enhanced button with urgency
  return (
    <div className="space-y-2">
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Limited Time Offer</Badge>
      <Button onClick={handleClick} className="shimmer text-white font-semibold relative overflow-hidden" {...props}>
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
      </Button>
    </div>
  )
}
