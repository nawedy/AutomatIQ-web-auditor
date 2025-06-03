"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for responsive media queries
 * @param query Media query string (e.g., "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create media query list
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Define callback for media query changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener with passive option for better performance
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener, { passive: true })
      return () => media.removeEventListener("change", listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query])

  return matches
}
