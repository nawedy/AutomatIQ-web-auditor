"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { usePerformance } from "@/hooks/use-performance"

// Simple Logo component with direct styling to ensure visibility
function Logo() {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
        <span className="text-navy font-bold text-lg">A</span>
      </div>
      <span className="font-bold text-[#D4AF37] text-2xl">AutomatIQ.AI</span>
    </div>
  )
}

export default function LandingPage() {
  const { logPerformanceMetrics } = usePerformance()
  const [imageLoadStats, setImageLoadStats] = useState({
    loaded: 0,
    failed: 0,
    total: 6
  })

  useEffect(() => {
    // Log performance metrics when the page loads
    const handleLoad = () => {
      logPerformanceMetrics()
    }

    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  // Track image loading stats
  const handleImageLoad = useCallback(() => {
    setImageLoadStats(prev => ({
      ...prev,
      loaded: prev.loaded + 1
    }))
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoadStats(prev => ({
      ...prev,
      failed: prev.failed + 1
    }))
  }, [])

  return (
    <main className="min-h-screen bg-navy text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-navy to-darker-navy">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Website Audit Made Simple</h1>
            <p className="text-xl mb-8 text-center max-w-2xl">
              Get comprehensive insights and actionable recommendations to improve your website.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy">
                Start Free Audit
              </Button>
              <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Content */}
      <section className="py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold mb-6 text-center">Website Auditor</h1>
          <p className="text-xl mb-8 text-center max-w-2xl mx-auto">
            Get comprehensive SEO, performance, security, and UX analysis with actionable recommendations.  
          </p>

          {/* Image Loading Stats */}
          <div className="bg-darker-navy p-4 rounded-lg mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-2">Image Loading Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-bold">{imageLoadStats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Loaded</p>
                <p className="text-xl font-bold text-green-500">{imageLoadStats.loaded}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-xl font-bold text-red-500">{imageLoadStats.failed}</p>
              </div>
            </div>
          </div>

          {/* Test Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Test Case 1: Standard image with correct dimensions */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/images/dashboard.png" 
                alt="Dashboard" 
                width={400} 
                height={250}
                className="rounded-lg mb-4"
                priority={true}
                onLoadingComplete={handleImageLoad}
              />
              <h3 className="text-xl font-bold mb-2">Priority Image</h3>
              <p>Standard image with priority loading enabled.</p>
            </div>

            {/* Test Case 2: Non-existent image that should fall back to placeholder */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/images/non-existent.png" 
                alt="Non-existent Image" 
                width={400} 
                height={250}
                className="rounded-lg mb-4"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
              />
              <h3 className="text-xl font-bold mb-2">Fallback Test</h3>
              <p>Non-existent image that should use the placeholder.</p>
            </div>

            {/* Test Case 3: Direct placeholder from API */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/api/placeholder/400/250" 
                alt="Direct Placeholder" 
                width={400} 
                height={250}
                className="rounded-lg mb-4"
                onLoadingComplete={handleImageLoad}
              />
              <h3 className="text-xl font-bold mb-2">Direct Placeholder</h3>
              <p>Direct placeholder image from the API route.</p>
            </div>

            {/* Test Case 4: Image with custom dimensions */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/images/seo-report.png" 
                alt="SEO Report" 
                width={800} 
                height={600}
                className="rounded-lg mb-4"
                onLoadingComplete={handleImageLoad}
              />
              <h3 className="text-xl font-bold mb-2">Custom Dimensions</h3>
              <p>Image with 800x600 dimensions to test scaling.</p>
            </div>

            {/* Test Case 5: SVG placeholder */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/api/placeholder/800/600.svg" 
                alt="SVG Placeholder" 
                width={800} 
                height={600}
                className="rounded-lg mb-4"
                onLoadingComplete={handleImageLoad}
              />
              <h3 className="text-xl font-bold mb-2">Static SVG</h3>
              <p>Static SVG placeholder file from public directory.</p>
            </div>

            {/* Test Case 6: Image with fallback */}
            <div className="glass-card p-6 rounded-lg">
              <OptimizedImage 
                src="/images/will-fail.jpg" 
                alt="Image with Fallback" 
                width={1200} 
                height={630}
                fallbackSrc="/api/placeholder/1200/630.svg"
                className="rounded-lg mb-4"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
              />
              <h3 className="text-xl font-bold mb-2">Custom Fallback</h3>
              <p>Image with explicit fallback source specified.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p> 2025 AutomatIQ.AI. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gold">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
