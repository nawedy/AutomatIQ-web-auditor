"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Globe, CheckCircle, AlertTriangle, XCircle, ArrowRight, FileText, Download } from "lucide-react"

export default function SeoAuditPage() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 3000)
  }

  // Sample SEO issues
  const seoIssues = [
    {
      type: "critical",
      title: "Missing Meta Descriptions",
      description: "12 pages are missing meta descriptions",
      impact: "High",
      pages: [
        "Home",
        "About",
        "Services",
        "Blog",
        "Contact",
        "Products",
        "Team",
        "FAQ",
        "Pricing",
        "Features",
        "Support",
        "Resources",
      ],
    },
    {
      type: "warning",
      title: "Slow Page Load Speed",
      description: "8 pages have load times exceeding 3 seconds",
      impact: "Medium",
      pages: ["Products", "Gallery", "Resources", "Blog", "Case Studies", "Downloads", "Videos", "Documentation"],
    },
    {
      type: "critical",
      title: "Duplicate Title Tags",
      description: "5 pages have identical title tags",
      impact: "High",
      pages: ["Blog/Post1", "Blog/Post2", "Blog/Post3", "Blog/Post4", "Blog/Post5"],
    },
    {
      type: "success",
      title: "Mobile Friendly",
      description: "All pages are mobile responsive",
      impact: "Positive",
      pages: [],
    },
    {
      type: "warning",
      title: "Low Word Count",
      description: "7 pages have less than 300 words",
      impact: "Medium",
      pages: ["FAQ", "Contact", "Pricing", "Team", "Partners", "Legal", "Privacy"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">SEO Audit Tool</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Comprehensive <span className="text-gold">SEO Analysis</span>
              </h1>
              <p className="text-xl text-silver mb-8">
                Analyze your website's SEO performance and get actionable recommendations to improve your search
                rankings.
              </p>

              <Card className="glass-card border-gold/20">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver/50" />
                      <Input
                        type="url"
                        placeholder="Enter your website URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="pl-10 border-gold/20 bg-black/50 text-white placeholder-silver/50"
                      />
                    </div>
                    <Button type="submit" className="gold-shimmer text-navy font-semibold" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          Analyzing<span className="loading-dots"></span>
                        </>
                      ) : (
                        <>Analyze Now</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {showResults && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">SEO Audit Results</h2>
                <p className="text-silver">
                  Analysis for: <span className="text-gold">{url}</span>
                </p>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="glass-card border-gold/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">SEO Score</h3>
                      <span className="text-2xl font-bold text-gold">72/100</span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full">
                      <div
                        className="bg-gradient-to-r from-gold to-gold/70 h-2 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                    <p className="mt-4 text-silver text-sm">Your site needs some improvements to rank better.</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-gold/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Issues Found</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                          <span className="text-silver">17</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                          <span className="text-silver">24</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-silver">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>2 critical issues need immediate attention</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-gold/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Pages Analyzed</h3>
                      <span className="text-2xl font-bold text-gold">32</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-silver">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>12 pages are optimized correctly</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Tabs defaultValue="issues">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="space-y-6">
                  {seoIssues.map((issue, index) => (
                    <Card
                      key={index}
                      className={`glass-card ${
                        issue.type === "critical"
                          ? "border-red-500/30"
                          : issue.type === "warning"
                            ? "border-yellow-500/30"
                            : "border-green-500/30"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {issue.type === "critical" ? (
                              <XCircle className="h-6 w-6 text-red-500" />
                            ) : issue.type === "warning" ? (
                              <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-medium text-white">{issue.title}</h3>
                              <Badge
                                className={`${
                                  issue.impact === "High"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : issue.impact === "Medium"
                                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                      : "bg-green-500/20 text-green-400 border-green-500/30"
                                }`}
                              >
                                {issue.impact} Impact
                              </Badge>
                            </div>
                            <p className="text-silver mb-4">{issue.description}</p>

                            {issue.pages.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-white mb-2">Affected Pages:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {issue.pages.slice(0, 5).map((page, i) => (
                                    <Badge key={i} variant="outline" className="border-gold/20 text-silver">
                                      {page}
                                    </Badge>
                                  ))}
                                  {issue.pages.length > 5 && (
                                    <Badge variant="outline" className="border-gold/20 text-silver">
                                      +{issue.pages.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex justify-end">
                              <Button variant="ghost" className="text-gold hover:bg-gold/10">
                                View Details <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="keywords">
                  <Card className="glass-card border-gold/20">
                    <CardHeader>
                      <CardTitle className="text-white">Keyword Analysis</CardTitle>
                      <CardDescription className="text-silver">
                        Discover which keywords your website is ranking for and identify new opportunities.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-silver">Keyword data will appear here after a full analysis.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="backlinks">
                  <Card className="glass-card border-gold/20">
                    <CardHeader>
                      <CardTitle className="text-white">Backlink Profile</CardTitle>
                      <CardDescription className="text-silver">
                        Analyze your website's backlink profile and identify opportunities for improvement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-silver">Backlink data will appear here after a full analysis.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="competitors">
                  <Card className="glass-card border-gold/20">
                    <CardHeader>
                      <CardTitle className="text-white">Competitor Analysis</CardTitle>
                      <CardDescription className="text-silver">
                        Compare your website's SEO performance with your competitors.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-silver">Competitor data will appear here after a full analysis.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Export Options */}
              <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Report
                </Button>
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF Report
                </Button>
                <Button className="gold-shimmer text-navy font-semibold">
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Another Website
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Use Our SEO Audit Tool?</h2>
              <p className="text-silver max-w-2xl mx-auto">
                Our comprehensive SEO analysis provides actionable insights to improve your search rankings and drive
                more organic traffic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Comprehensive Analysis",
                  description:
                    "We analyze over 100 SEO factors to provide a complete picture of your website's performance.",
                },
                {
                  title: "Actionable Recommendations",
                  description: "Get clear, step-by-step instructions on how to fix issues and improve your rankings.",
                },
                {
                  title: "Competitor Insights",
                  description:
                    "See how your website compares to competitors and identify opportunities to outrank them.",
                },
                {
                  title: "Keyword Optimization",
                  description: "Discover which keywords you're ranking for and find new opportunities to target.",
                },
                {
                  title: "Technical SEO Audit",
                  description: "Identify and fix technical issues that could be holding back your search performance.",
                },
                {
                  title: "Regular Monitoring",
                  description: "Track your progress over time and stay on top of new SEO issues as they arise.",
                },
              ].map((feature, index) => (
                <Card key={index} className="glass-card border-gold/10">
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gold mb-3">{feature.title}</h3>
                    <p className="text-silver">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <DoubleFooter />
    </div>
  )
}
