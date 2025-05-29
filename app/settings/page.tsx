"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Key,
  Mail,
  Smartphone,
  Save,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showApiKey, setShowApiKey] = useState(false)

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    company: "Acme Corp",
    jobTitle: "Web Developer",
    bio: "Passionate about web performance and user experience optimization.",
    avatar: "",
    timezone: "America/New_York",
    language: "en",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    auditComplete: true,
    criticalIssues: true,
    weeklyReports: true,
    scoreChanges: false,
    systemUpdates: true,
    marketingEmails: false,
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "24h",
    loginAlerts: true,
    apiAccess: true,
  })

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: "ak_live_1234567890abcdef",
    webhookUrl: "https://example.com/webhook",
    rateLimitTier: "standard",
    allowedOrigins: ["https://example.com", "https://app.example.com"],
  })

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileData)
    // Implement save logic
  }

  const handleSaveNotifications = () => {
    console.log("Saving notifications:", notificationSettings)
    // Implement save logic
  }

  const handleSaveSecurity = () => {
    console.log("Saving security:", securitySettings)
    // Implement save logic
  }

  const handleSaveAPI = () => {
    console.log("Saving API settings:", apiSettings)
    // Implement save logic
  }

  const generateNewApiKey = () => {
    const newKey = "ak_live_" + Math.random().toString(36).substring(2, 18)
    setApiSettings({ ...apiSettings, apiKey: newKey })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-black/20">
                <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500/20">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500/20">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-blue-500/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-blue-500/20">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-blue-500/20">
                  <Key className="w-4 h-4 mr-2" />
                  API
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {profileData.firstName[0]}
                        {profileData.lastName[0]}
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">First Name</Label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Last Name</Label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Email Address</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Company</Label>
                        <Input
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Job Title</Label>
                        <Input
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                          className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Bio</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Timezone</Label>
                        <Select
                          value={profileData.timezone}
                          onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}
                        >
                          <SelectTrigger className="neomorphism border-0 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10">
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
                      <div>
                        <Label className="text-white">Language</Label>
                        <Select
                          value={profileData.language}
                          onValueChange={(value) => setProfileData({ ...profileData, language: value })}
                        >
                          <SelectTrigger className="neomorphism border-0 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} className="shimmer text-white font-semibold">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-400" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Choose how you want to be notified about audit results and system updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Delivery Methods */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Delivery Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-white">Email Notifications</div>
                              <div className="text-sm text-gray-400">Receive notifications via email</div>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-purple-400" />
                            <div>
                              <div className="text-white">Push Notifications</div>
                              <div className="text-sm text-gray-400">Browser push notifications</div>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="text-white">SMS Notifications</div>
                              <div className="text-sm text-gray-400">Text message alerts for critical issues</div>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Notification Types</h3>
                      <div className="space-y-3">
                        {[
                          { key: "auditComplete", label: "Audit Complete", description: "When website audits finish" },
                          {
                            key: "criticalIssues",
                            label: "Critical Issues",
                            description: "High priority issues detected",
                          },
                          { key: "weeklyReports", label: "Weekly Reports", description: "Weekly summary reports" },
                          {
                            key: "scoreChanges",
                            label: "Score Changes",
                            description: "Significant score improvements or drops",
                          },
                          {
                            key: "systemUpdates",
                            label: "System Updates",
                            description: "Platform updates and maintenance",
                          },
                          {
                            key: "marketingEmails",
                            label: "Marketing Emails",
                            description: "Product updates and tips",
                          },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <div className="text-white">{item.label}</div>
                              <div className="text-sm text-gray-400">{item.description}</div>
                            </div>
                            <Switch
                              checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, [item.key]: checked })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications} className="shimmer text-white font-semibold">
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage your account security and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">Enable 2FA</div>
                            <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
                          </div>
                          <Switch
                            checked={securitySettings.twoFactorEnabled}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                            }
                          />
                        </div>
                        {securitySettings.twoFactorEnabled && (
                          <div className="space-y-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">2FA Enabled</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Manage 2FA Settings
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Session Management */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Session Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Session Timeout</Label>
                          <Select
                            value={securitySettings.sessionTimeout}
                            onValueChange={(value) =>
                              setSecuritySettings({ ...securitySettings, sessionTimeout: value })
                            }
                          >
                            <SelectTrigger className="neomorphism border-0 text-white mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10">
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="8h">8 Hours</SelectItem>
                              <SelectItem value="24h">24 Hours</SelectItem>
                              <SelectItem value="7d">7 Days</SelectItem>
                              <SelectItem value="30d">30 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="loginAlerts"
                              checked={securitySettings.loginAlerts}
                              onCheckedChange={(checked) =>
                                setSecuritySettings({ ...securitySettings, loginAlerts: checked as boolean })
                              }
                            />
                            <Label htmlFor="loginAlerts" className="text-gray-300">
                              Login alerts
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Password</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Password</div>
                            <div className="text-sm text-gray-400">Last changed 30 days ago</div>
                          </div>
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveSecurity} className="shimmer text-white font-semibold">
                        <Save className="w-4 h-4 mr-2" />
                        Save Security Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Plan */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Current Plan</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">Pro Plan</div>
                            <div className="text-sm text-gray-400">$49/month • Billed monthly</div>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Next billing date</div>
                            <div className="text-white">April 15, 2024</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Websites</div>
                            <div className="text-white">4 of unlimited</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Change Plan
                          </Button>
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Cancel Subscription
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Payment Method</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                            <div>
                              <div className="text-white">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-400">Expires 12/25</div>
                            </div>
                          </div>
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Billing History */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Billing History</h3>
                      <div className="space-y-2">
                        {[
                          { date: "Mar 15, 2024", amount: "$49.00", status: "Paid" },
                          { date: "Feb 15, 2024", amount: "$49.00", status: "Paid" },
                          { date: "Jan 15, 2024", amount: "$49.00", status: "Paid" },
                        ].map((invoice, index) => (
                          <div key={index} className="neomorphism p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-white">{invoice.date}</div>
                                <div className="text-sm text-gray-400">Pro Plan</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-white font-semibold">{invoice.amount}</div>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {invoice.status}
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Tab */}
              <TabsContent value="api" className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      API Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage API keys and integration settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* API Key */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">API Key</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value={apiSettings.apiKey}
                            readOnly
                            className="neomorphism border-0 text-white bg-black/20"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateNewApiKey}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Regenerate
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400">
                          Keep your API key secure. Don't share it in publicly accessible areas.
                        </p>
                      </div>
                    </div>

                    {/* Webhook Settings */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Webhook Settings</h3>
                      <div>
                        <Label className="text-white">Webhook URL</Label>
                        <Input
                          value={apiSettings.webhookUrl}
                          onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                          placeholder="https://your-app.com/webhook"
                          className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Receive real-time notifications when audits complete
                        </p>
                      </div>
                    </div>

                    {/* Rate Limiting */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Rate Limiting</h3>
                      <div className="neomorphism p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white">Current Tier</div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {apiSettings.rateLimitTier}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          Standard: 1000 requests/hour • Pro: 5000 requests/hour
                        </div>
                      </div>
                    </div>

                    {/* Allowed Origins */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Allowed Origins</h3>
                      <div className="space-y-2">
                        {apiSettings.allowedOrigins.map((origin, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={origin}
                              onChange={(e) => {
                                const newOrigins = [...apiSettings.allowedOrigins]
                                newOrigins[index] = e.target.value
                                setApiSettings({ ...apiSettings, allowedOrigins: newOrigins })
                              }}
                              className="neomorphism border-0 text-white placeholder-gray-400"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOrigins = apiSettings.allowedOrigins.filter((_, i) => i !== index)
                                setApiSettings({ ...apiSettings, allowedOrigins: newOrigins })
                              }}
                              className="border-white/20 text-white hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setApiSettings({
                              ...apiSettings,
                              allowedOrigins: [...apiSettings.allowedOrigins, ""],
                            })
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Add Origin
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveAPI} className="shimmer text-white font-semibold">
                        <Save className="w-4 h-4 mr-2" />
                        Save API Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* API Documentation */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">API Documentation</CardTitle>
                    <CardDescription className="text-gray-300">
                      Learn how to integrate with the AuditPro API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="neomorphism p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Quick Start</h4>
                        <pre className="text-sm text-gray-300 bg-black/20 p-3 rounded overflow-x-auto">
                          {`curl -X POST https://api.auditpro.com/v1/audits \\
  -H "Authorization: Bearer ${apiSettings.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          View Full Documentation
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Download SDK
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
