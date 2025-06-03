"use client"

import { useEffect, useRef } from 'react'
import { usePerformance } from '@/hooks/use-performance'

/**
 * PerformanceLoader Component
 * 
 * This component handles resource preloading, critical CSS, and performance optimizations.
 * It should be placed near the top of your layout or page components.
 */
export function PerformanceLoader() {
  const { logPerformanceMetrics } = usePerformance()
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization during development hot reloads
    if (initialized.current) return
    initialized.current = true

    // Log initial performance metrics after a short delay
    const timer = setTimeout(() => {
      logPerformanceMetrics()
    }, 3000)

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Add preconnect for Google Fonts and other domains
      const preconnects = [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }
      ]
      
      // Add preconnects
      preconnects.forEach(preconnect => {
        // Check if preconnect already exists to avoid duplicates
        const existingLink = document.querySelector(`link[rel="${preconnect.rel}"][href="${preconnect.href}"]`)
        if (existingLink) return
        
        const link = document.createElement('link')
        link.rel = preconnect.rel
        link.href = preconnect.href
        if (preconnect.crossOrigin) {
          link.crossOrigin = preconnect.crossOrigin
        }
        document.head.appendChild(link)
      })
      
      // Font preloading with optimized strategy
      const fontUrls = [
        { url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', priority: 'high' },
        { url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap', priority: 'high' }
      ]
      
      // Ensure fonts are loaded with proper attributes
      fontUrls.forEach(font => {
        // Check if font already loaded to avoid duplicates
        const existingFont = document.querySelector(`link[href="${font.url}"]`)
        if (existingFont) return
        
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = font.url
        link.setAttribute('media', 'all')
        link.setAttribute('fetchpriority', font.priority)
        link.setAttribute('importance', 'high')
        document.head.appendChild(link)
      })
      
      // Critical images with priority
      const criticalImages = [
        { url: '/logo.png', type: 'image/png', priority: 'high' },
        { url: '/images/hero-bg.png', type: 'image/png', priority: 'high' },
        { url: '/images/placeholders/placeholder-600x400.svg', type: 'image/svg+xml', priority: 'high' },
        { url: '/images/placeholders/placeholder-400x250.svg', type: 'image/svg+xml', priority: 'high' }
      ]

      // Preload critical images with proper attributes
      criticalImages.forEach(resource => {
        // Check if already preloaded to avoid duplicates
        const existingPreload = document.querySelector(`link[rel="preload"][href="${resource.url}"]`)
        if (existingPreload) return
        
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource.url
        link.as = 'image'
        link.type = resource.type
        link.setAttribute('fetchpriority', resource.priority)
        link.setAttribute('importance', 'high')
        document.head.appendChild(link)
      })
      
      // Force font display with optimized settings
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400 700;
          font-display: swap;
          font-synthesis: none;
        }
        
        @font-face {
          font-family: 'Montserrat';
          font-style: normal;
          font-weight: 700 900;
          font-display: swap;
          font-synthesis: none;
        }
        
        /* Prevent layout shifts from font loading */
        html {
          font-synthesis: none;
        }
      `
      document.head.appendChild(style)
    }

    // Optimize image loading with advanced IntersectionObserver
    const optimizeImageLoading = () => {
      // Use IntersectionObserver with better options
      const observerOptions = {
        root: null,
        rootMargin: '200px', // Load images 200px before they enter viewport
        threshold: 0.01 // Trigger when just 1% of the image is visible
      }
      
      // Find all images with data-src attribute and lazy load them
      const lazyImages = document.querySelectorAll('img[data-src]')
      if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                // Create a new image to preload
                const preloadImg = new Image()
                preloadImg.onload = () => {
                  // Only set src after image is preloaded
                  img.src = img.dataset.src || ''
                  img.removeAttribute('data-src')
                  // Add fade-in animation
                  img.style.opacity = '0'
                  img.style.transition = 'opacity 0.3s ease-in'
                  setTimeout(() => {
                    img.style.opacity = '1'
                  }, 10)
                }
                preloadImg.onerror = () => {
                  // Use fallback if available
                  if (img.dataset.fallback) {
                    img.src = img.dataset.fallback
                  } else {
                    // Use placeholder
                    img.src = '/images/placeholders/placeholder-400x250.svg'
                  }
                  img.removeAttribute('data-src')
                }
                preloadImg.src = img.dataset.src
                imageObserver.unobserve(img)
              }
            }
          })
        }, observerOptions)
        
        lazyImages.forEach(img => imageObserver.observe(img))
      }
      
      // Also optimize regular images with loading="lazy"
      const regularImages = document.querySelectorAll('img:not([data-src])')
      regularImages.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy')
        }
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async')
        }
      })
    }

    // Defer non-critical JavaScript with priority hints
    const deferNonCriticalJS = () => {
      // Find scripts with data-defer attribute
      const deferScripts = document.querySelectorAll('script[data-defer]')
      deferScripts.forEach(script => {
        const src = script.getAttribute('src')
        if (src) {
          // Create a new script element and load it after page load
          const newScript = document.createElement('script')
          newScript.src = src
          newScript.setAttribute('importance', 'low')
          newScript.setAttribute('fetchpriority', 'low')
          newScript.defer = true
          document.body.appendChild(newScript)
          script.remove()
        }
      })
      
      // Delay third-party scripts
      setTimeout(() => {
        const thirdPartyScripts = document.querySelectorAll('script[data-third-party]')
        thirdPartyScripts.forEach(script => {
          const src = script.getAttribute('src')
          if (src) {
            const newScript = document.createElement('script')
            newScript.src = src
            newScript.defer = true
            document.body.appendChild(newScript)
            script.remove()
          }
        })
      }, 2000) // Delay third-party scripts by 2 seconds
    }

    // Load image preloader script with error handling
    const loadImagePreloaderScript = () => {
      const script = document.createElement('script')
      script.src = '/js/image-preloader.js'
      script.defer = true
      script.onerror = () => {
        console.warn('Image preloader script failed to load. Using fallback method.')
        // Fallback method to preload visible images
        const visibleImages = Array.from(document.querySelectorAll('img[src]'))
          .filter(img => {
            const rect = img.getBoundingClientRect()
            return (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            )
          })
        
        visibleImages.forEach(img => {
          img.setAttribute('fetchpriority', 'high')
        })
      }
      document.body.appendChild(script)
    }

    // Execute optimizations
    preloadCriticalResources()
    
    // Use requestIdleCallback or setTimeout for non-critical optimizations
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        optimizeImageLoading()
        deferNonCriticalJS()
        loadImagePreloaderScript()
      })
    } else {
      setTimeout(() => {
        optimizeImageLoading()
        deferNonCriticalJS()
        loadImagePreloaderScript()
      }, 200) // Small delay to prioritize critical rendering
    }

    // Clean up
    return () => {
      clearTimeout(timer)
    }
  }, [logPerformanceMetrics])

  return null // This component doesn't render anything
}
