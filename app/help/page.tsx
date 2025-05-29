"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DoubleFooter } from "@/components/double-footer"
import { Search, HelpCircle, Book, MessageCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using AuditPro",
      icon: <Book className="w-6 h-6 text-blue-400" />,
      articles: [
        "How to create your first audit",
        "Understanding audit results",
        "Setting up your account",
        "Navigating the dashboard",
      ],
    },
    {
      title: "Features & Tools",
      description: "Detailed guides on all features",
      icon: <HelpCircle className="w-6 h-6 text-green-400" />,
      articles: [
        "SEO analysis explained",
        "Performance testing guide",
        "Security scanning features",
        "UX evaluation tools",
      ],
    },
    {
      title: "Troubleshooting",
      description: "Solutions to common issues",
      icon: <MessageCircle className="w-6 h-6 text-yellow-400" />,
      articles: [
        "Audit failed to complete",
        "Login and account issues",
        "Payment and billing problems",
        "Technical error messages",
      ],
    },
    {
      title: "Account & Billing",
      description: "Manage your subscription and account",
      icon: <Mail className="w-6 h-6 text-purple-400" />,
      articles: ["Upgrading your plan", "Canceling subscription", "Updating payment method", "Downloading invoices"],
    },
  ]

  const faqItems = [
    {
      question: "How does AuditPro work?",
      answer:
        "AuditPro scans your website using advanced algorithms to analyze SEO, performance, security, and user experience factors. It then generates detailed reports with actionable recommendations.",
    },
    {
      question: "How long does an audit take?",
      answer:
        "Most audits complete within 2-5 minutes, depending on the size of your website and the depth of analysis selected.",
    },
    {
      question: "Can I audit any website?",
      answer: "Yes, you can audit any publicly accessible website. You don't need to own the website to run an audit.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 14-day money-back guarantee for all new subscriptions. Please see our refund policy for details.",
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Help Center</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">How can we help you?</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Find answers to common questions, browse our guides, or contact our support team.
              </p>

              {/* Search */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for help..."
                    className="pl-12 neomorphism border-0 text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Help Categories */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {helpCategories.map((category, index) => (
                  <Card
                    key={index}
                    className="glass-card border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-white/5">{category.icon}</div>
                        <div>
                          <CardTitle className="text-white">{category.title}</CardTitle>
                          <CardDescription className="text-gray-300">{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, i) => (
                          <li key={i}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-300 hover:text-white p-0 h-auto"
                            >
                              {article}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <Card key={index} className="glass-card border-white/10">
                    <CardContent className="p-6">
                      <h3 className="text-white font-semibold mb-2">{item.question}</h3>
                      <p className="text-gray-300">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <Card className="glass-card border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
                <p className="text-gray-300 mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button className="shimmer text-white font-semibold">Contact Support</Button>
                  </Link>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Live Chat
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
