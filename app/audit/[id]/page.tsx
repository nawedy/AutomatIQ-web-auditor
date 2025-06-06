"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AuditProgress } from "@/components/audit-runner/audit-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Download, Share } from "lucide-react"
import Link from "next/link"

interface AuditPageProps {
  params: {
    id: string
  }
}

export default function AuditPage({ params }: AuditPageProps) {
  const [auditResults, setAuditResults] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Mock website data
  const website = {
    id: params.id,
    name: "Example Website",
    url: "https://example.com",
  }

  const handleAuditComplete = (results: any) => {
    setAuditResults(results)
    setIsCompleted(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-4 flex-1">
            <Link href="/websites">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Websites
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Audit: {website.name}</h1>
              <p className="text-sm text-gray-400">{website.url}</p>
            </div>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Site
          </Button>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          {/* Audit Progress */}
          <AuditProgress
            websiteId={website.id}
            websiteName={website.name}
            onComplete={handleAuditComplete}
            onCancel={() => console.log("Audit cancelled")}
          />

          {/* Results */}
          {isCompleted && auditResults && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Audit Results</CardTitle>
                      <CardDescription className="text-gray-300">Completed in {auditResults.duration}s</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(auditResults.overall_score)}`}>
                        {auditResults.overall_score}
                      </div>
                      <div className="text-sm text-gray-400">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(auditResults.seo_score)}`}>
                        {auditResults.seo_score}
                      </div>
                      <div className="text-sm text-gray-400">SEO</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(auditResults.performance_score)}`}>
                        {auditResults.performance_score}
                      </div>
                      <div className="text-sm text-gray-400">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(auditResults.security_score)}`}>
                        {auditResults.security_score}
                      </div>
                      <div className="text-sm text-gray-400">Security</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(auditResults.ux_score)}`}>
                        {auditResults.ux_score}
                      </div>
                      <div className="text-sm text-gray-400">UX</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issues Summary */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Issues Found</CardTitle>
                  <CardDescription className="text-gray-300">
                    Summary of issues detected during the audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{auditResults.issues.critical}</div>
                      <div className="text-sm text-gray-400">Critical Issues</div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mt-2">High Priority</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{auditResults.issues.warning}</div>
                      <div className="text-sm text-gray-400">Warnings</div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-2">
                        Medium Priority
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{auditResults.issues.info}</div>
                      <div className="text-sm text-gray-400">Info</div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-2">Low Priority</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Next Steps</CardTitle>
                  <CardDescription className="text-gray-300">
                    Recommended actions based on audit results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 neomorphism rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span className="text-white">Fix critical performance issues first</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 neomorphism rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-white">Optimize images and reduce file sizes</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 neomorphism rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-white">Review and update meta descriptions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </div>
  )
}
