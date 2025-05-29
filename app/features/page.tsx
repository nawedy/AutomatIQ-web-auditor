"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DoubleFooter } from "@/components/double-footer"
import { BarChart3, Zap, Shield, Globe, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: <BarChart3 className="h-12 w-12 text-blue-500" />,
      title: "SEO Analysis",
      description: "Comprehensive SEO audit with actionable recommendations to improve your search rankings.",
      features: [
        "Keyword analysis and optimization",
        "Meta tags and descriptions review",
        "Content optimization suggestions",
        "Technical SEO audit",
        "Competitor analysis",
      ],
    },
    {
      icon: <Zap className="h-12 w-12 text-yellow-500" />,
      title: "Performance Testing",
      description: "Core Web Vitals and speed optimization insights to make your website lightning fast.",
      features: [
        "Core Web Vitals monitoring",
        "Page speed analysis",
        "Image optimization recommendations",
        "Code splitting suggestions",
        "CDN optimization",
      ],
    },
    {
      icon: <Shield className="h-12 w-12 text-green-500" />,
      title: "Security Scan",
      description: "Vulnerability detection and security best practices to keep your website safe.",
      features: [
        "Malware detection",
        "SSL certificate validation",
        "Security headers analysis",
        "Vulnerability scanning",
        "Security best practices",
      ],
    },
    {
      icon: <Globe className="h-12 w-12 text-purple-500" />,
      title: "UX Evaluation",
      description: "User experience analysis and accessibility checks for a better visitor experience.",
      features: [
        "Accessibility compliance",
        "Mobile responsiveness",
        "User journey analysis",
        "Conversion optimization",
        "Design best practices",
      ],
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Features</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Powerful Features</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Everything you need to optimize your website for better performance, SEO, security, and user experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="glass-card border-white/10 overflow-hidden">
                  <CardHeader>
                    <div className="mb-4 rounded-full bg-slate-800/50 p-4 w-fit">{feature.icon}</div>
                    <CardTitle className="text-white text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-lg">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <Card className="glass-card border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-gray-300 mb-6">
                  Try all these features with our 14-day free trial. No credit card required.
                </p>
                <Link href="/signup">
                  <Button className="shimmer text-white font-semibold">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
