"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
  onIntersect?: () => void
}

export function LazyLoad({
  children,
  fallback = <div className="animate-pulse bg-muted h-32 w-full rounded" />,
  className,
  rootMargin = "100px", // Increased from 50px to 100px for earlier loading
  threshold = 0.05, // Reduced from 0.1 to 0.05 to trigger earlier
  triggerOnce = true,
  onIntersect,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  // Check if we should use reduced motion
  const prefersReducedMotion = useRef<boolean>(false)
  
  // Check for reduced motion preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }, [])

  useEffect(() => {
    // Skip intersection observer for users who prefer reduced motion
    // This improves performance by loading all content immediately
    if (prefersReducedMotion.current) {
      setIsIntersecting(true)
      setHasIntersected(true)
      onIntersect?.()
      return
    }
    
    // Use a more performant observer configuration
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Batch state updates for better performance
          requestAnimationFrame(() => {
            setIsIntersecting(true)
            setHasIntersected(true)
            onIntersect?.()
          })
          
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false)
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [rootMargin, threshold, triggerOnce, onIntersect])

  const shouldRender = triggerOnce ? hasIntersected : isIntersecting

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {shouldRender ? children : fallback}
    </div>
  )
}

// Hook for intersection observer
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])

  return isIntersecting
} 