"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"
import { ConversionTracker } from "@/components/ab-testing/conversion-tracker"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  // Features section data
  const features = [
    {
      title: "SEO Analysis",
      description: "Comprehensive SEO audit with actionable recommendations to improve your search rankings.",
    },
    {
      title: "Performance Testing",
      description: "Core Web Vitals and speed optimization insights to make your website lightning fast.",
    },
    {
      title: "Security Scan",
      description: "Vulnerability detection and security best practices to keep your website safe.",
    },
    {
      title: "UX Evaluation",
      description: "User experience analysis and accessibility checks for a better visitor experience.",
    },
  ]

  // Testimonials data
  const testimonials = [
    {
      quote:
        "AutomatIQ.AI helped us increase our organic traffic by 137% in just 3 months by identifying critical SEO issues we didn't know existed.",
      author: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      stars: 5,
    },
    {
      quote:
        "The performance recommendations alone saved us thousands in development costs. Our site is now 3x faster and conversion rates have improved significantly.",
      author: "Michael Chen",
      role: "CTO",
      company: "E-commerce Solutions",
      stars: 5,
    },
    {
      quote:
        "As a small business owner, I was overwhelmed with website optimization. AutomatIQ.AI made it simple with clear, actionable recommendations.",
      author: "Emily Rodriguez",
      role: "Owner",
      company: "Boutique Designs",
      stars: 4,
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setEmail("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] opacity-20"></div>
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit bg-gold/20 text-gold border-gold/30">AI-Powered Website Audits</Badge>
              <motion.h1
                className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Optimize Your Website with <span className="text-gold">AutomatIQ.AI</span>
              </motion.h1>
              <motion.p
                className="mb-8 text-xl text-silver"
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
                  <Button size="lg" className="gold-shimmer text-navy font-semibold">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>
              <div className="mt-8 flex items-center space-x-2 text-sm text-silver">
                <CheckCircle className="h-4 w-4 text-gold" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-gold" />
                <span>14-day free trial</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-gold" />
                <span>Cancel anytime</span>
              </div>
            </div>
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-gold/10 bg-black/20 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-silver/5"></div>
                <img src="/placeholder.svg?height=600&width=800" alt="AutomatIQ.AI Dashboard" className="w-full" />
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/10 backdrop-blur-md"></div>
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-silver/10 backdrop-blur-md"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Powerful Features</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Everything You Need to Optimize Your Website
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-silver">
              Our comprehensive suite of tools analyzes every aspect of your website to provide actionable insights and
              recommendations.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card border-gold/10 overflow-hidden transition-all duration-300 hover:border-gold/20"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="mb-2 text-xl font-bold text-gold">{feature.title}</h3>
                  <p className="text-silver flex-grow">{feature.description}</p>
                  <div className="mt-4 pt-4 border-t border-gold/10 text-right">
                    <Link href={`/tools/${feature.title.toLowerCase().replace(" ", "-")}`}>
                      <Button variant="ghost" className="text-gold hover:bg-gold/10">
                        Learn more <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Customer Success</Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">What Our Customers Say</h2>
            <p className="mx-auto max-w-2xl text-lg text-silver">
              Join thousands of satisfied customers who have improved their websites with AutomatIQ.AI
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="glass-card border-gold/10 overflow-hidden transition-all duration-300 hover:border-gold/20"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.stars ? "fill-gold text-gold" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-silver flex-grow">"{testimonial.quote}"</p>
                  <div className="mt-auto">
                    <p className="font-medium text-gold">{testimonial.author}</p>
                    <p className="text-sm text-silver">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-black to-black/80 border-y border-gold/10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">Ready to Optimize Your Website?</h2>
            <p className="mb-8 text-xl text-silver">Start your 14-day free trial today. No credit card required.</p>
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border-gold/20 bg-black/50 text-white placeholder-silver/50"
              />
              <Button type="submit" className="gold-shimmer text-navy font-semibold">
                Start Free Trial
              </Button>
            </form>
            <p className="mt-4 text-sm text-silver">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-gold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gold hover:underline">
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
