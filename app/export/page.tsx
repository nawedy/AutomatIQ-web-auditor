"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Database, Calendar, Settings, History } from "lucide-react"
import { BulkExport } from "@/components/export/bulk-export"

export default function ExportCenterPage() {
  const [activeTab, setActiveTab] = useState("bulk")

  const mockReports = [
    { id: "1", website: "example.com", date: "2024-03-15", score: 85, status: "completed" },
    { id: "2", website: "mystore.com", date: "2024-03-14", score: 94, status: "completed" },
    { id: "3", website: "portfolio.dev", date: "2024-03-13", score: 72, status: "completed" },
    { id: "4", website: "blog.example.com", date: "2024-03-12", score: 88, status: "completed" },
  ]

  const exportHistory = [
    {
      id: "1",
      type: "PDF Report",
      reports: ["example.com", "mystore.com"],
      date: "2024-03-15 14:30",
      status: "completed",
      size: "2.4 MB",
    },
    {
      id: "2",
      type: "CSV Data",
      reports: ["All Reports"],
      date: "2024-03-14 09:15",
      status: "completed",
      size: "156 KB",
    },
    {
      id: "3",
      type: "ZIP Archive",
      reports: ["portfolio.dev", "blog.example.com"],
      date: "2024-03-13 16:45",
      status: "completed",
      size: "5.1 MB",
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Export Center</h1>
          </div>
          <Button className="shimmer text-white font-semibold">
            <Settings className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-6">
            {/* Quick Export Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto" />
                    <h3 className="text-white font-semibold">PDF Reports</h3>
                    <p className="text-gray-400 text-sm">Generate professional PDF reports</p>
                    <Button className="w-full shimmer text-white font-semibold">
                      <Download className="w-4 h-4 mr-2" />
                      Create PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <Database className="w-8 h-8 text-green-400 mx-auto" />
                    <h3 className="text-white font-semibold">Data Export</h3>
                    <p className="text-gray-400 text-sm">Export raw data in various formats</p>
                    <Button className="w-full shimmer text-white font-semibold">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <Calendar className="w-8 h-8 text-purple-400 mx-auto" />
                    <h3 className="text-white font-semibold">Scheduled Exports</h3>
                    <p className="text-gray-400 text-sm">Set up automated report delivery</p>
                    <Button className="w-full shimmer text-white font-semibold">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-black/20">
                <TabsTrigger value="bulk" className="data-[state=active]:bg-blue-500/20">
                  Bulk Export
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-blue-500/20">
                  Scheduled Exports
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-blue-500/20">
                  Export History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bulk">
                <BulkExport reports={mockReports} />
              </TabsContent>

              <TabsContent value="scheduled">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Scheduled Exports</CardTitle>
                    <CardDescription className="text-gray-300">
                      Set up automated report generation and delivery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">No Scheduled Exports</h3>
                      <p className="text-gray-400 mb-4">Create automated exports to receive reports regularly</p>
                      <Button className="shimmer text-white font-semibold">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-400" />
                      Export History
                    </CardTitle>
                    <CardDescription className="text-gray-300">View and download your previous exports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exportHistory.map((export_item) => (
                        <div key={export_item.id} className="neomorphism p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-white font-semibold">{export_item.type}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-400">{export_item.size}</span>
                              </div>
                              <div className="text-sm text-gray-400">Reports: {export_item.reports.join(", ")}</div>
                              <div className="text-sm text-gray-400">{export_item.date}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
