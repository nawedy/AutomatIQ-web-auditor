"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink
} from "lucide-react"

interface AuditResults {
  url: string
  timestamp: string
  overallScore: number
  modules: {
    [key: string]: {
      score: number
      issues?: string[]
      suggestions?: string[]
      metrics?: any
    }
  }
}

interface AuditResultsProps {
  results: AuditResults
  onNewAudit?: () => void
}

export function AuditResults({ results, onNewAudit }: AuditResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-electric-cyan"
    if (score >= 70) return "text-digital-gold"
    if (score >= 50) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="h-4 w-4" />
    if (score >= 70) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Needs Improvement"
    return "Poor"
  }

  const moduleConfig = {
    seo: {
      name: "SEO Analysis",
      description: "Search engine optimization and discoverability"
    },
    performance: {
      name: "Performance",
      description: "Loading speed and Core Web Vitals"
    },
    accessibility: {
      name: "Accessibility",
      description: "WCAG compliance and usability"
    },
    mobile: {
      name: "Mobile UX",
      description: "Mobile responsiveness and touch optimization"
    },
    security: {
      name: "Security",
      description: "SSL certificates and security headers"
    },
    content: {
      name: "Content Quality",
      description: "Content analysis and readability"
    }
  }

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    // Mock export functionality
    const data = JSON.stringify(results, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-results-${format}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-darker-navy border-circuit-bronze/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-digital-gold">
                Audit Results
              </CardTitle>
              <CardDescription className="text-slate-steel mt-1">
                {results.url} • {new Date(results.timestamp).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="border-circuit-bronze/30 text-digital-gold hover:bg-digital-gold/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="border-circuit-bronze/30 text-digital-gold hover:bg-digital-gold/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={onNewAudit}
                className="bg-digital-gold hover:bg-circuit-bronze text-darkest-navy"
              >
                New Audit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card className="bg-darker-navy border-circuit-bronze/20 hover-shadow">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-digital-gold">Overall Score</h3>
              <div className={`text-6xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}
              </div>
              <Badge className={`${getScoreColor(results.overallScore)} bg-transparent border-current`}>
                {getScoreBadge(results.overallScore)}
              </Badge>
            </div>
            <Progress value={results.overallScore} className="h-3 bg-darkest-navy" />
          </div>
        </CardContent>
      </Card>

      {/* Module Results */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-darkest-navy border border-circuit-bronze/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-digital-gold data-[state=active]:text-darkest-navy">
            Overview
          </TabsTrigger>
          {Object.keys(results.modules).map((moduleKey) => (
            <TabsTrigger 
              key={moduleKey} 
              value={moduleKey}
              className="data-[state=active]:bg-digital-gold data-[state=active]:text-darkest-navy"
            >
              {moduleConfig[moduleKey as keyof typeof moduleConfig]?.name || moduleKey}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.modules).map(([moduleKey, moduleData]) => {
              const config = moduleConfig[moduleKey as keyof typeof moduleConfig]
              return (
                <Card key={moduleKey} className="bg-darker-navy border-circuit-bronze/20 hover-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-digital-gold">
                        {config?.name || moduleKey}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        {getScoreIcon(moduleData.score)}
                        <span className={`text-lg font-bold ${getScoreColor(moduleData.score)}`}>
                          {moduleData.score}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="text-xs text-slate-steel">
                      {config?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Progress value={moduleData.score} className="h-2 bg-darkest-navy" />
                    <div className="mt-3 space-y-1">
                      {moduleData.issues && moduleData.issues.length > 0 && (
                        <div className="flex items-center text-xs text-orange-400">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {moduleData.issues.length} issues found
                        </div>
                      )}
                      {moduleData.suggestions && moduleData.suggestions.length > 0 && (
                        <div className="flex items-center text-xs text-electric-cyan">
                          <Info className="mr-1 h-3 w-3" />
                          {moduleData.suggestions.length} recommendations
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {Object.entries(results.modules).map(([moduleKey, moduleData]) => (
          <TabsContent key={moduleKey} value={moduleKey} className="space-y-4">
            <Card className="bg-darker-navy border-circuit-bronze/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-digital-gold">
                      {moduleConfig[moduleKey as keyof typeof moduleConfig]?.name || moduleKey}
                    </CardTitle>
                    <CardDescription className="text-slate-steel">
                      {moduleConfig[moduleKey as keyof typeof moduleConfig]?.description}
                    </CardDescription>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(moduleData.score)}`}>
                    {moduleData.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Metrics */}
                {moduleData.metrics && (
                  <div>
                    <h4 className="font-semibold text-digital-gold mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(moduleData.metrics).map(([metric, value]) => (
                        <div key={metric} className="p-3 rounded-lg bg-deep-azure/20 border border-circuit-bronze/10">
                          <div className="text-sm text-slate-steel uppercase tracking-wide">{metric}</div>
                          <div className="text-lg font-semibold text-digital-gold">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues */}
                {moduleData.issues && moduleData.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-digital-gold mb-3 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-orange-400" />
                      Issues Found ({moduleData.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {moduleData.issues.map((issue, index) => (
                        <div key={index} className="p-3 rounded-lg bg-orange-400/10 border border-orange-400/20">
                          <div className="text-sm text-orange-400">{issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {moduleData.suggestions && moduleData.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-digital-gold mb-3 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-electric-cyan" />
                      Recommendations ({moduleData.suggestions.length})
                    </h4>
                    <div className="space-y-2">
                      {moduleData.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20">
                          <div className="text-sm text-electric-cyan">{suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Items */}
      <Card className="bg-darker-navy border-circuit-bronze/20">
        <CardHeader>
          <CardTitle className="text-lg text-digital-gold">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20">
              <div className="text-sm text-electric-cyan">
                Download detailed report for implementation guidance
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('pdf')}
                className="border-electric-cyan/30 text-electric-cyan hover:bg-electric-cyan/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-digital-gold/10 border border-digital-gold/20">
              <div className="text-sm text-digital-gold">
                Schedule follow-up audit to track improvements
              </div>
              <Button
                size="sm"
                onClick={onNewAudit}
                className="bg-digital-gold hover:bg-circuit-bronze text-darkest-navy"
              >
                Schedule Audit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 