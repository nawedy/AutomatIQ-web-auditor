"use client"

import { CheckCircle, Search, Shield, Zap, BarChart3, Users, Globe, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"
import { Badge } from "@/components/ui/badge"

export default function FeaturesPage() {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-gold" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your website across multiple dimensions.",
      features: [
        "Intelligent content analysis",
        "Automated recommendation engine",
        "Pattern recognition and insights",
        "Predictive performance metrics",
      ],
    },
    {
      icon: <Zap className="w-8 h-8 text-gold" />,
      title: "Performance Optimization", 
      description: "Comprehensive speed and performance analysis with actionable recommendations.",
      features: [
        "Core Web Vitals monitoring",
        "Page speed optimization",
        "Resource loading analysis", 
        "Mobile performance insights",
      ],
    },
    {
      icon: <Shield className="w-8 h-8 text-gold" />,
      title: "Security & Compliance",
      description: "Advanced security scanning and compliance checking for your website.",
      features: [
        "Vulnerability assessment",
        "SSL certificate monitoring",
        "GDPR compliance checks",
        "Security headers analysis",
      ],
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-gold" />,
      title: "Advanced Analytics",
      description: "Deep insights into your website's performance and user experience.",
      features: [
        "Real-time monitoring",
        "Conversion tracking",
        "User behavior analysis",
        "Custom reporting dashboards",
      ],
    },
    {
      icon: <Users className="w-8 h-8 text-gold" />,
      title: "User Experience Analysis",
      description: "Comprehensive UX evaluation and accessibility testing.",
      features: [
        "Accessibility compliance (WCAG)",
        "User journey mapping", 
        "Mobile responsiveness testing",
        "Navigation flow analysis",
      ],
    },
    {
      icon: <Globe className="w-8 h-8 text-gold" />,
      title: "Multi-Site Management", 
      description: "Manage and monitor multiple websites from a single dashboard.",
      features: [
        "Centralized dashboard",
        "Bulk audit capabilities",
        "Cross-site comparisons",
        "Team collaboration tools",
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-32">
        <div className="section-padding">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Powerful Features</Badge>
              <h1 className="text-4xl md:text-5xl font-bold shimmer-title mb-4">
                Everything You Need to Optimize Your Website
              </h1>
              <p className="text-lg text-white mb-8">
                Comprehensive tools and AI-powered insights to improve your website's performance, SEO, security, and user experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="glass-card border-gold/10 overflow-hidden hover-shadow h-full">
                  <CardHeader>
                    <div className="mb-4 p-4 rounded-full bg-gold/10 w-fit">{feature.icon}</div>
                    <CardTitle className="text-white text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-lg">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="mr-3 h-5 w-5 text-gold flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <Card className="glass-card border-gold/20 bg-gradient-to-br from-gold/5 to-transparent max-w-4xl mx-auto">
                <CardContent className="p-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Optimize Your Website?
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Join thousands of businesses that have improved their digital presence with AutomatIQ.AI
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/signup"
                      className="inline-flex items-center justify-center px-8 py-3 bg-gold hover:bg-gold/90 text-navy font-semibold rounded-lg transition-colors"
                    >
                      Start Free Trial
                    </a>
                    <a
                      href="/demo"
                      className="inline-flex items-center justify-center px-8 py-3 border border-gold/30 text-gold hover:bg-gold/10 font-semibold rounded-lg transition-colors"
                    >
                      Watch Demo
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <DoubleFooter />
    </div>
  )
}
