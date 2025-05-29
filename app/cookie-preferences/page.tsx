"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DoubleFooter } from "@/components/double-footer"
import { Cookie, Shield, BarChart3, Target, Settings, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    // Load saved preferences
    const consent = localStorage.getItem("cookie-consent")
    if (consent) {
      try {
        const savedPreferences = JSON.parse(consent)
        setPreferences(savedPreferences)
      } catch (error) {
        console.error("Error parsing cookie preferences:", error)
      }
    }
  }, [])

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === "necessary") return // Cannot disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences))
    setHasChanges(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)

    // Initialize services based on preferences
    console.log("Cookie preferences saved:", preferences)
  }

  const resetToDefaults = () => {
    const defaults = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setPreferences(defaults)
    setHasChanges(true)
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setPreferences(allAccepted)
    setHasChanges(true)
  }

  const cookieTypes = [
    {
      key: "necessary" as const,
      title: "Necessary Cookies",
      description: "These cookies are essential for the website to function properly. They cannot be disabled.",
      icon: Shield,
      color: "text-green-400",
      examples: ["Session management", "Security tokens", "Load balancing"],
      disabled: true,
    },
    {
      key: "analytics" as const,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website by collecting anonymous information.",
      icon: BarChart3,
      color: "text-blue-400",
      examples: ["Google Analytics", "Page views", "User behavior tracking"],
      disabled: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing Cookies",
      description: "Used to deliver relevant advertisements and track the effectiveness of our campaigns.",
      icon: Target,
      color: "text-purple-400",
      examples: ["Ad targeting", "Conversion tracking", "Social media pixels"],
      disabled: false,
    },
    {
      key: "functional" as const,
      title: "Functional Cookies",
      description: "Enable enhanced functionality and personalization features on our website.",
      icon: Settings,
      color: "text-yellow-400",
      examples: ["Language preferences", "Theme settings", "Chat widgets"],
      disabled: false,
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Cookie Preferences</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              GDPR Compliant
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-blue-500/10">
                  <Cookie className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white">Cookie Preferences</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Manage your cookie preferences and control how we use cookies on our website. You can change these
                settings at any time.
              </p>
            </div>

            {/* Save Alert */}
            {showSaved && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <Check className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Your cookie preferences have been saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-300">
                  Use these buttons to quickly configure your cookie preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={acceptAll} className="shimmer text-white font-semibold">
                    Accept All Cookies
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Necessary Only
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Types */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Cookie Categories</h2>
              <div className="grid gap-6">
                {cookieTypes.map((cookieType) => {
                  const IconComponent = cookieType.icon
                  return (
                    <Card key={cookieType.key} className="glass-card border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-full bg-white/5">
                              <IconComponent className={`w-6 h-6 ${cookieType.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-white font-semibold text-lg">{cookieType.title}</h3>
                                {cookieType.disabled && (
                                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-300 mb-4">{cookieType.description}</p>
                              <div className="space-y-2">
                                <h4 className="text-white font-medium text-sm">Examples:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {cookieType.examples.map((example, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="border-white/20 text-gray-300 text-xs"
                                    >
                                      {example}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={preferences[cookieType.key]}
                              onCheckedChange={(checked) => updatePreference(cookieType.key, checked)}
                              disabled={cookieType.disabled}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Current Status */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Current Cookie Status</CardTitle>
                <CardDescription className="text-gray-300">
                  Overview of your current cookie preferences and their impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cookieTypes.map((cookieType) => (
                    <div key={cookieType.key} className="text-center p-4 rounded-lg bg-white/5">
                      <div
                        className={`text-2xl font-bold ${preferences[cookieType.key] ? "text-green-400" : "text-red-400"}`}
                      >
                        {preferences[cookieType.key] ? "ON" : "OFF"}
                      </div>
                      <div className="text-gray-300 text-sm">{cookieType.title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Changes */}
            {hasChanges && (
              <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h3 className="text-white font-semibold">Unsaved Changes</h3>
                        <p className="text-gray-300 text-sm">You have unsaved changes to your cookie preferences.</p>
                      </div>
                    </div>
                    <Button onClick={savePreferences} className="shimmer text-white font-semibold">
                      <Check className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">Data Retention:</strong> Cookie data is stored locally in your browser
                  and is not transmitted to our servers unless explicitly stated.
                </p>
                <p>
                  <strong className="text-white">Third-Party Cookies:</strong> Some cookies may be set by third-party
                  services we use, such as analytics providers.
                </p>
                <p>
                  <strong className="text-white">Updates:</strong> We may update our cookie practices from time to time.
                  Any changes will be reflected in our Cookie Policy.
                </p>
                <div className="pt-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Read Full Cookie Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
