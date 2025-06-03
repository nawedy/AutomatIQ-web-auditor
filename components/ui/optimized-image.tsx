"use client"

import Image from "next/image"
import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoadingComplete?: () => void
  onError?: () => void
  style?: React.CSSProperties
  fallbackSrc?: string
}

// Optimized base64 encoded transparent placeholder (1x1 pixel, minimal size)
const DEFAULT_BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxYTFhMmUiLz48L3N2Zz4="

// Default placeholder if no matching dimensions are found
const DEFAULT_PLACEHOLDER = "/images/placeholder.svg"

// Map of common dimensions to static placeholder images
const PLACEHOLDER_MAP: Record<string, string> = {
  "400x250": "/api/placeholder/400/250.svg",
  "800x600": "/api/placeholder/800/600.svg",
  "1200x630": "/api/placeholder/1200/630.svg"
}

// Preload common placeholder images
if (typeof window !== 'undefined') {
  // Create link elements for preloading
  const preloadPlaceholders = () => {
    const placeholders = Object.values(PLACEHOLDER_MAP)
    
    // Check if preload links already exist to avoid duplicates
    const existingLinks = Array.from(document.head.querySelectorAll('link[rel="preload"][as="image"]'))
      .map(link => (link as HTMLLinkElement).href)
    
    placeholders.forEach(path => {
      // Convert relative path to absolute URL
      const absoluteUrl = new URL(path, window.location.origin).href
      
      // Skip if this placeholder is already preloaded
      if (existingLinks.some(href => href.includes(path))) {
        return
      }
      
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = absoluteUrl
      link.type = 'image/svg+xml'
      link.setAttribute('data-placeholder', 'true')
      document.head.appendChild(link)
      
      console.log(`Preloaded placeholder: ${absoluteUrl}`)
    })
  }
  
  // Execute after page load to avoid blocking critical resources
  if (document.readyState === 'complete') {
    preloadPlaceholders()
  } else {
    window.addEventListener('load', preloadPlaceholders)
    // Also add a timeout as a fallback in case the load event doesn't fire
    setTimeout(preloadPlaceholders, 2000)
  }
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = "blur",
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoadingComplete,
  onError,
  style,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imgSrc, setImgSrc] = useState<string>(src || '')
  const imgRef = useRef<HTMLImageElement>(null)
  const retryCount = useRef(0)
  const mountedRef = useRef(true)

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Normalize the src and handle changes
  useEffect(() => {
    if (!mountedRef.current) return
    
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)
    retryCount.current = 0
    
    // Handle different src formats
    if (typeof src === 'string' && src) {
      // If it's a relative path without a leading slash, normalize it
      if (src.startsWith('./')) {
        setImgSrc(src.substring(2))
      } else if (!src.startsWith('/') && !src.startsWith('http')) {
        setImgSrc(`/${src}`)
      } else {
        setImgSrc(src)
      }
    } else {
      setImgSrc(fallbackSrc || DEFAULT_PLACEHOLDER)
      setHasError(!fallbackSrc)
      console.error('Invalid image source:', src)
    }
  }, [src, fallbackSrc])

  // Preload critical images
  useEffect(() => {
    if (priority && imgSrc) {
      // Create a new image element for preloading
      const imgEl = document.createElement('img');
      imgEl.src = imgSrc;
      // Set high priority for important images
      if ('fetchPriority' in imgEl) {
        // @ts-ignore - fetchPriority exists but TypeScript doesn't know about it yet
        imgEl.fetchPriority = 'high';
      }
      
      // Add to preload link in head for better browser prioritization
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgSrc;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Clean up preload link when component unmounts
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, imgSrc])

  // Memoize handlers to prevent unnecessary re-renders
  const handleLoadingComplete = useCallback(() => {
    if (!mountedRef.current) return
    
    setIsLoading(false)
    onLoadingComplete?.() // Call the provided callback if it exists
  }, [onLoadingComplete])

  const handleError = useCallback(() => {
    if (!mountedRef.current) return
    
    // Increment retry counter
    retryCount.current += 1
    
    // Call the onError callback if provided
    if (onError && retryCount.current === 1) {
      onError()
    }
    
    // Use provided fallback if available
    if (fallbackSrc && retryCount.current === 1) {
      console.log(`Using provided fallback image: ${fallbackSrc}`)
      setImgSrc(fallbackSrc)
      return
    }
    
    // Check if we have a placeholder for these specific dimensions
    if (width && height) {
      const dimensionKey = `${width}x${height}`
      if (PLACEHOLDER_MAP[dimensionKey]) {
        console.log(`Using dimension-specific placeholder: ${PLACEHOLDER_MAP[dimensionKey]}`)
        setImgSrc(PLACEHOLDER_MAP[dimensionKey])
        setHasError(false) // Not really an error if we have a placeholder
        setIsLoading(false)
        return
      }
      
      // Try to find the closest matching placeholder size
      const availableSizes = Object.keys(PLACEHOLDER_MAP).map(size => {
        const [w, h] = size.split('x').map(Number)
        return { size, width: w, height: h }
      })
      
      // Sort by closest area ratio to find best match
      const targetRatio = width / height
      const closestMatch = availableSizes.sort((a, b) => {
        const ratioA = Math.abs((a.width / a.height) - targetRatio)
        const ratioB = Math.abs((b.width / b.height) - targetRatio)
        return ratioA - ratioB
      })[0]
      
      if (closestMatch) {
        console.log(`Using closest matching placeholder: ${PLACEHOLDER_MAP[closestMatch.size]}`)
        setImgSrc(PLACEHOLDER_MAP[closestMatch.size])
        setHasError(false)
        setIsLoading(false)
        return
      }
    }
    
    // If retry fails or no fallback available, use default placeholder
    console.error(`Failed to load image: ${src} (attempt ${retryCount.current})`)
    setImgSrc(DEFAULT_PLACEHOLDER)
    setHasError(true)
    setIsLoading(false)
  }, [src, fallbackSrc, width, height, onError])

  // Fallback UI for error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/10 border border-muted rounded",
          className
        )}
        style={{ 
          width: width || "100%", 
          height: height || (width ? width * 0.75 : 200), // Maintain aspect ratio or default height
          ...style 
        }}
      >
        <div className="flex flex-col items-center p-2 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mb-2 text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span className="text-xs">Image not available</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      {isLoading && (
        <Skeleton 
          className="absolute inset-0" 
          style={{
            width: width || "100%",
            height: height || (width ? width * 0.75 : "auto"),
          }}
        />
      )}
      {imgSrc && (
        <Image
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={fill ? undefined : (width || 800)}
          height={fill ? undefined : (height || (width ? Math.floor(width * 0.75) : undefined))}
          fill={fill}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoadingComplete}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          unoptimized={imgSrc === DEFAULT_PLACEHOLDER}
          className={cn(
            "transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100",
            fill ? "object-cover" : ""
          )}
          {...props}
        />
      )}
    </div>
  )
} 