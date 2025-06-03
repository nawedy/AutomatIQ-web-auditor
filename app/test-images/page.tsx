"use client"

import { useState } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Button } from "@/components/ui/button"

export default function TestImagesPage() {
  const [loading, setLoading] = useState(false)
  
  // Array of test images with different sizes and formats
  const testImages = [
    {
      src: "/images/placeholder.svg",
      alt: "Placeholder SVG",
      width: 400,
      height: 300,
      priority: true,
    },
    {
      src: "https://picsum.photos/800/600",
      alt: "Random Image 1 (External)",
      width: 800,
      height: 600,
    },
    {
      src: "https://picsum.photos/id/237/400/300",
      alt: "Random Image 2 (External)",
      width: 400,
      height: 300,
    },
    {
      src: "https://source.unsplash.com/random/600x400",
      alt: "Random Unsplash Image",
      width: 600,
      height: 400,
    },
    {
      src: "/non-existent-image.jpg",
      alt: "Non-existent Image (Should Show Fallback)",
      width: 500,
      height: 300,
      fallbackSrc: "/images/placeholder.svg",
    },
  ]

  // Simulate loading state
  const handleLoadTest = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Loading Test Page</h1>
      
      <div className="mb-6">
        <Button onClick={handleLoadTest} disabled={loading}>
          {loading ? "Loading..." : "Simulate Loading"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 flex flex-col">
            <div className="h-[300px] relative mb-4">
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority={image.priority}
                fallbackSrc={image.fallbackSrc}
                className="rounded-md"
              />
            </div>
            <div>
              <h3 className="font-medium">{image.alt}</h3>
              <p className="text-sm text-gray-500">
                {image.width}x{image.height}
              </p>
              <p className="text-xs text-gray-400 truncate mt-1">{image.src}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Performance Notes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>The first image uses <code>priority</code> for immediate loading</li>
          <li>External images are loaded with proper error handling</li>
          <li>The last image intentionally uses a non-existent source to demonstrate fallback</li>
          <li>All images use the optimized component with skeleton loading states</li>
        </ul>
      </div>
    </div>
  )
}
