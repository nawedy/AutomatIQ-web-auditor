"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  Globe,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { AddWebsiteDialog } from "@/components/websites/add-website-dialog"
import { EditWebsiteDialog } from "@/components/websites/edit-website-dialog"
import { WebsiteStats } from "@/components/websites/website-stats"

export default function WebsitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState<any>(null)

  const websites = [
    {
      id: 1,
      name: "Main Website",
      url: "https://example.com",
      status: "active",
      lastAudit: "2024-03-15T10:30:00Z",
      nextAudit: "2024-03-16T10:30:00Z",
      score: 85,
      previousScore: 78,
      issues: { critical: 2, warning: 5, info: 8 },
      auditFrequency: "daily",
      notifications: true,
      tags: ["production", "main"],
      created: "2024-01-15",
      totalAudits: 45,
    },
    {
      id: 2,
      name: "E-commerce Store",
      url: "https://mystore.com",
      status: "active",
      lastAudit: "2024-03-15T08:15:00Z",
      nextAudit: "2024-03-18T08:15:00Z",
      score: 94,
      previousScore: 91,
      issues: { critical: 0, warning: 2, info: 3 },
      auditFrequency: "weekly",
      notifications: true,
      tags: ["ecommerce", "production"],
      created: "2024-02-01",
      totalAudits: 28,
    },
    {
      id: 3,
      name: "Portfolio Site",
      url: "https://portfolio.dev",
      status: "paused",
      lastAudit: "2024-03-10T14:20:00Z",
      nextAudit: null,
      score: 72,
      previousScore: 75,
      issues: { critical: 4, warning: 8, info: 12 },
      auditFrequency: "monthly",
      notifications: false,
      tags: ["personal", "development"],
      created: "2024-01-20",
      totalAudits: 12,
    },
    {
      id: 4,
      name: "Blog",
      url: "https://blog.example.com",
      status: "active",
      lastAudit: "2024-03-14T16:45:00Z",
      nextAudit: "2024-03-21T16:45:00Z",
      score: 88,
      previousScore: 85,
      issues: { critical: 1, warning: 4, info: 6 },
      auditFrequency: "weekly",
      notifications: true,
      tags: ["blog", "content"],
      created: "2024-02-15",
      totalAudits: 18,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreTrend = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <div className="w-4 h-4" />
  }

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || website.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRunAudit = (websiteId: number) => {
    console.log("Running audit for website:", websiteId)
    // Implement audit trigger
  }

  const handleToggleStatus = (websiteId: number) => {
    console.log("Toggling status for website:", websiteId)
    // Implement status toggle
  }

  const handleDeleteWebsite = (websiteId: number) => {
    console.log("Deleting website:", websiteId)
    // Implement delete functionality
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Website Management</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="shimmer text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          {/* Website Stats */}
          <WebsiteStats websites={websites} />

          {/* Filters */}
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search websites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 neomorphism border-0 text-white placeholder-gray-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 neomorphism border-0 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Websites Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWebsites.map((website) => (
              <Card key={website.id} className="glass-card border-white/10 hover:border-white/20 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{website.name}</CardTitle>
                        <CardDescription className="text-gray-300">{website.url}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(website.status)}>
                        {website.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {website.status === "paused" && <Pause className="w-3 h-3 mr-1" />}
                        {website.status === "error" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {website.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-white/10">
                          <DropdownMenuItem onClick={() => setEditingWebsite(website)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRunAudit(website.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Run Audit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(website.id)}>
                            {website.status === "active" ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWebsite(website.id)}
                            className="text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Score and Trend */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(website.score)}`}>{website.score}</span>
                        {getScoreTrend(website.score, website.previousScore)}
                        <span className="text-sm text-gray-400">
                          {website.score > website.previousScore ? "+" : ""}
                          {website.score - website.previousScore}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Total Audits</div>
                        <div className="text-white font-semibold">{website.totalAudits}</div>
                      </div>
                    </div>

                    {/* Issues Summary */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-300">{website.issues.critical} Critical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-300">{website.issues.warning} Warning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-300">{website.issues.info} Info</span>
                      </div>
                    </div>

                    {/* Audit Schedule */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Last: {new Date(website.lastAudit).toLocaleDateString()}</span>
                      </div>
                      {website.nextAudit && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Next: {new Date(website.nextAudit).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {website.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {website.auditFrequency}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredWebsites.length === 0 && (
            <Card className="glass-card border-white/10">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No websites found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first website to start monitoring"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setShowAddDialog(true)} className="shimmer text-white font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Website Dialog */}
        <AddWebsiteDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

        {/* Edit Website Dialog */}
        {editingWebsite && (
          <EditWebsiteDialog
            website={editingWebsite}
            open={!!editingWebsite}
            onOpenChange={(open) => !open && setEditingWebsite(null)}
          />
        )}
      </SidebarInset>
    </div>
  )
}
