"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Star, Shield, Zap, BarChart3, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWebSocketNotifications } from "@/hooks/use-websocket-notifications"
import { DoubleFooter } from "@/components/double-footer"
import { ConversionTracker, ABTestCTA } from "@/components/ab-testing/conversion-tracker"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  // Initialize WebSocket notifications
  useWebSocketNotifications()

  // Features section data
  const features = [
    {
      icon: <BarChart3 className="h-10 w-10 text-blue-500" />,
      title: "SEO Analysis",
      description: "Comprehensive SEO audit with actionable recommendations to improve your search rankings.",
    },
    {
      icon: <Zap className="h-10 w-10 text-yellow-500" />,
      title: "Performance Testing",
      description: "Core Web Vitals and speed optimization insights to make your website lightning fast.",
    },
    {
      icon: <Shield className="h-10 w-10 text-green-500" />,
      title: "Security Scan",
      description: "Vulnerability detection and security best practices to keep your website safe.",
    },
    {
      icon: <Globe className="h-10 w-10 text-purple-500" />,
      title: "UX Evaluation",
      description: "User experience analysis and accessibility checks for a better visitor experience.",
    },
  ]

  // Testimonials data
  const testimonials = [
    {
      quote:
        "AuditPro helped us increase our organic traffic by 137% in just 3 months by identifying critical SEO issues we didn't know existed.",
      author: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      avatar: "/placeholder.svg?height=60&width=60",
      stars: 5,
    },
    {
      quote:
        "The performance recommendations alone saved us thousands in development costs. Our site is now 3x faster and conversion rates have improved significantly.",
      author: "Michael Chen",
      role: "CTO",
      company: "E-commerce Solutions",
      avatar: "/placeholder.svg?height=60&width=60",
      stars: 5,
    },
    {
      quote:
        "As a small business owner, I was overwhelmed with website optimization. AuditPro made it simple with clear, actionable recommendations.",
      author: "Emily Rodriguez",
      role: "Owner",
      company: "Boutique Designs",
      avatar: "/placeholder.svg?height=60&width=60",
      stars: 4,
    },
  ]

  // Pricing plans
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small websites and blogs",
      features: [
        "5 website audits per month",
        "Basic SEO analysis",
        "Performance testing",
        "Email reports",
        "7-day history",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "20 website audits per month",
        "Advanced SEO analysis",
        "Performance & UX testing",
        "Security scanning",
        "Scheduled audits",
        "30-day history",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$249",
      period: "/month",
      description: "For large websites and agencies",
      features: [
        "Unlimited website audits",
        "Complete analysis suite",
        "Custom audit schedules",
        "White-label reports",
        "Team collaboration",
        "1-year history",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  // FAQ items
  const faqItems = [
    {
      question: "How does AuditPro work?",
      answer:
        "AuditPro scans your website using advanced algorithms to analyze SEO, performance, security, and user experience factors. It then generates detailed reports with actionable recommendations to improve your website's overall quality and search engine rankings.",
    },
    {
      question: "Do I need technical knowledge to use AuditPro?",
      answer:
        "No, AuditPro is designed to be user-friendly for everyone. Our reports include clear explanations and step-by-step instructions for implementing recommendations. However, some advanced optimizations may require developer assistance.",
    },
    {
      question: "How often should I audit my website?",
      answer:
        "We recommend running a full audit at least once a month, with more frequent checks after significant website updates or content changes. Our Professional and Enterprise plans include scheduled recurring audits to automate this process.",
    },
    {
      question: "Can I audit competitor websites?",
      answer:
        "Yes, you can audit any publicly accessible website. Competitor analysis can provide valuable insights into their SEO strategies and performance optimizations.",
    },
    {
      question: "Is there a limit to the number of pages AuditPro can scan?",
      answer:
        "The Starter plan scans up to 100 pages per website, Professional up to 500 pages, and Enterprise up to 10,000 pages. For larger websites, please contact our sales team for custom solutions.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service. Please refer to our Refund Policy for more details.",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Email submitted:", email)
    // Reset form
    setEmail("")
    // Show success message or redirect
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] opacity-20"></div>
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit bg-blue-500/20 text-blue-400 border-blue-500/30">
                AI-Powered Website Audits
              </Badge>
              <motion.h1
                className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Optimize Your Website with AI-Powered Insights
              </motion.h1>
              <motion.p
                className="mb-8 text-xl text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Get comprehensive SEO, performance, security, and UX analysis with actionable recommendations to improve
                your website's rankings and user experience.
              </motion.p>
              <motion.div
                className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/signup">
                  <ABTestCTA variant="A" size="lg" className="shimmer text-white font-semibold">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ABTestCTA>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>
              <div className="mt-8 flex items-center space-x-2 text-sm text-blue-100">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span>14-day free trial</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>
                <img src="/placeholder.svg?height=600&width=800" alt="AuditPro Dashboard" className="w-full" />
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/20 backdrop-blur-md"></div>
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-500/20 backdrop-blur-md"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-sm text-gray-400">TRUSTED BY LEADING COMPANIES</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-70">
            {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={`/placeholder.svg?height=30&width=120&query=company logo ${index + 1}`}
                  alt={company}
                  className="h-8 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Powerful Features</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Everything You Need to Optimize Your Website
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Our comprehensive suite of tools analyzes every aspect of your website to provide actionable insights and
              recommendations.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                <CardContent className="p-6">
                  <div className="mb-4 rounded-full bg-slate-800/50 p-3 w-fit">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Simple Process</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">How AuditPro Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Get actionable insights in just three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add Your Website",
                description: "Enter your website URL and let our AI-powered crawler analyze your pages.",
                icon: <Globe className="h-10 w-10 text-blue-500" />,
              },
              {
                step: "02",
                title: "Get Detailed Analysis",
                description: "Receive comprehensive reports on SEO, performance, security, and user experience.",
                icon: <BarChart3 className="h-10 w-10 text-purple-500" />,
              },
              {
                step: "03",
                title: "Implement Recommendations",
                description:
                  "Follow our actionable recommendations to improve your website's performance and rankings.",
                icon: <CheckCircle className="h-10 w-10 text-green-500" />,
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="glass-card border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                <CardContent className="p-6">
                  <div className="mb-4 text-4xl font-bold text-blue-500/50">{item.step}</div>
                  <div className="mb-4 rounded-full bg-slate-800/50 p-3 w-fit">{item.icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Customer Success</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">What Our Customers Say</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Join thousands of satisfied customers who have improved their websites with AuditPro
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="glass-card border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.stars ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-gray-300">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      className="mr-4 h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Pricing</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">Choose the plan that's right for your business</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`glass-card border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 ${
                  plan.popular ? "relative border-blue-500/50 shadow-lg shadow-blue-500/10" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-blue-500 px-12 py-1 text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="mb-6 text-gray-300">{plan.description}</p>
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular ? "shimmer text-white font-semibold" : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>All plans include a 14-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">FAQ</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">Everything you need to know about AuditPro</p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="tab1">General Questions</TabsTrigger>
                <TabsTrigger value="tab2">Technical Questions</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <div className="space-y-4">
                  {faqItems.slice(0, 3).map((item, index) => (
                    <Card key={index} className="glass-card border-white/10">
                      <CardContent className="p-6">
                        <h3 className="mb-2 text-lg font-medium text-white">{item.question}</h3>
                        <p className="text-gray-300">{item.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tab2">
                <div className="space-y-4">
                  {faqItems.slice(3).map((item, index) => (
                    <Card key={index} className="glass-card border-white/10">
                      <CardContent className="p-6">
                        <h3 className="mb-2 text-lg font-medium text-white">{item.question}</h3>
                        <p className="text-gray-300">{item.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">Ready to Optimize Your Website?</h2>
            <p className="mb-8 text-xl text-blue-100">Start your 14-day free trial today. No credit card required.</p>
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border-white/20 bg-white/10 text-white placeholder-blue-200"
              />
              <Button type="submit" className="shimmer text-white font-semibold">
                Start Free Trial
              </Button>
            </form>
            <p className="mt-4 text-sm text-blue-100">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-white">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <DoubleFooter />

      {/* A/B Testing and Conversion Tracking */}
      <ConversionTracker />
    </div>
  )
}
