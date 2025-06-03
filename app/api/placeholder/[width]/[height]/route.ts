import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours

/**
 * Generates an SVG placeholder image with the specified dimensions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  try {
    // Parse dimensions from URL parameters
    const width = parseInt(params.width, 10) || 400;
    const height = parseInt(params.height, 10) || 300;
    
    // Log the request for debugging
    console.log(`Generating placeholder image: ${width}x${height}`);
    
    // Generate SVG placeholder with specified dimensions
    const svg = generatePlaceholderSVG(width, height);
    
    // Set appropriate cache headers with longer cache times
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=31536000', // 7 days cache
        'ETag': `"placeholder-${width}-${height}"`,
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}

/**
 * Generates a simple SVG placeholder with the given dimensions
 */
function generatePlaceholderSVG(width: number, height: number): string {
  // Create a more visually appealing placeholder with brand colors
  const svg = `
    <svg 
      width="${width}" 
      height="${height}" 
      viewBox="0 0 ${width} ${height}" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1a2e" stop-opacity="1" />
          <stop offset="100%" stop-color="#0f3460" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <rect 
        x="${width * 0.3}" 
        y="${height * 0.35}" 
        width="${width * 0.4}" 
        height="${height * 0.3}" 
        stroke="#e2b714" 
        stroke-width="2" 
        fill="none" 
        rx="4"
      />
      <line 
        x1="${width * 0.3}" 
        y1="${height * 0.35}" 
        x2="${width * 0.7}" 
        y2="${height * 0.65}" 
        stroke="#e2b714" 
        stroke-width="2" 
      />
      <line 
        x1="${width * 0.7}" 
        y1="${height * 0.35}" 
        x2="${width * 0.3}" 
        y2="${height * 0.65}" 
        stroke="#e2b714" 
        stroke-width="2" 
      />
      <text 
        x="50%" 
        y="85%" 
        font-family="system-ui, sans-serif" 
        font-size="${Math.max(width, height) * 0.05}px" 
        fill="#e2b714" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${width} × ${height}
      </text>
    </svg>
  `;
  
  return svg.trim();
}
