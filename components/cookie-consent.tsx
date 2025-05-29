"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Cookie, Settings, Check } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 500)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent)
        setPreferences(savedPreferences)
      } catch (error) {
        console.error("Error parsing cookie preferences:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleClosePopups = () => {
      if (showBanner) {
        setShowBanner(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showBanner) {
        setShowBanner(false)
      }
    }

    if (showBanner) {
      window.addEventListener("closeAllPopups", handleClosePopups)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      window.removeEventListener("closeAllPopups", handleClosePopups)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [showBanner])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setPreferences(allAccepted)
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted))
    setShowBanner(false)

    // Initialize analytics and other services here
    console.log("All cookies accepted")
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setPreferences(necessaryOnly)
    localStorage.setItem("cookie-consent", JSON.stringify(necessaryOnly))
    setShowBanner(false)

    console.log("Only necessary cookies accepted")
  }

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences))
    setShowBanner(false)
    setShowSettings(false)

    // Initialize services based on preferences
    console.log("Cookie preferences saved:", preferences)
  }

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === "necessary") return // Cannot disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4" data-popup="cookie-consent">
        <Card className="glass-card border-white/20 bg-slate-900/95 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">We use cookies</h3>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      GDPR Compliant
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our
                    traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
                    <Link href="/cookies" className="text-blue-400 hover:text-blue-300 underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-white/20 bg-slate-900/95 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Cookie Preferences</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Choose which cookies you want to accept. You can change these settings at any time.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Necessary Cookies</h4>
                          <p className="text-gray-400 text-sm">Required for the website to function properly</p>
                        </div>
                        <Switch checked={true} disabled />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Analytics Cookies</h4>
                          <p className="text-gray-400 text-sm">Help us understand how visitors use our website</p>
                        </div>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => updatePreference("analytics", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Marketing Cookies</h4>
                          <p className="text-gray-400 text-sm">Used to deliver relevant advertisements</p>
                        </div>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => updatePreference("marketing", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Functional Cookies</h4>
                          <p className="text-gray-400 text-sm">Enable enhanced functionality and personalization</p>
                        </div>
                        <Switch
                          checked={preferences.functional}
                          onCheckedChange={(checked) => updatePreference("functional", checked)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={savePreferences} className="flex-1 shimmer text-white font-semibold">
                        <Check className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={acceptNecessary}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Necessary Only
                </Button>
                <Button onClick={acceptAll} className="shimmer text-white font-semibold">
                  Accept All
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-white absolute top-2 right-2 lg:relative lg:top-0 lg:right-0"
              >
                <X className="w-4 h-4" />
              </Button>
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("cookie-consent")
                    window.location.reload()
                  }}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Reset (Dev)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
