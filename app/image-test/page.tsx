import { OptimizedImage } from "@/components/ui/optimized-image"

export default function ImageTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Simple Image Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl mb-2">Local Image with Priority</h2>
          <OptimizedImage
            src="/images/placeholder.svg"
            alt="Placeholder SVG"
            width={400}
            height={300}
            priority={true}
            className="rounded-md"
          />
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl mb-2">External Image</h2>
          <OptimizedImage
            src="https://picsum.photos/400/300"
            alt="Random External Image"
            width={400}
            height={300}
            className="rounded-md"
          />
        </div>
      </div>
    </div>
  )
}
