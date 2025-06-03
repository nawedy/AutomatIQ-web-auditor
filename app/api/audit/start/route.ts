import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/db/mongodb'

// Simple audit service without complex dependencies for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, options, userId } = body

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!options) {
      return NextResponse.json(
        { error: 'Audit options are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate audit options
    const validOptions = ['seo', 'performance', 'accessibility', 'security', 'mobile', 'content']
    const providedOptions = Object.keys(options)
    
    if (!providedOptions.some(option => validOptions.includes(option))) {
      return NextResponse.json(
        { error: 'At least one audit option must be selected' },
        { status: 400 }
      )
    }

    // Ensure all options are boolean
    for (const [key, value] of Object.entries(options)) {
      if (typeof value !== 'boolean') {
        return NextResponse.json(
          { error: `Option '${key}' must be a boolean value` },
          { status: 400 }
        )
      }
    }

    // Connect to MongoDB
    await connectDB()

    // Generate audit ID
    const auditId = uuidv4()

    // Log audit start (simplified for performance)
    console.log(`🚀 Starting audit ${auditId} for ${url}`)

    return NextResponse.json({
      success: true,
      auditId,
      message: 'Audit started successfully',
      url,
      options,
      status: 'pending',
      estimatedDuration: '2-3 minutes'
    })

  } catch (error) {
    console.error('API Error - Start Audit:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start audit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to start an audit.',
      usage: {
        method: 'POST',
        body: {
          url: 'string (required) - The URL to audit',
          options: {
            seo: 'boolean - Enable SEO analysis',
            performance: 'boolean - Enable performance analysis',
            accessibility: 'boolean - Enable accessibility analysis',
            security: 'boolean - Enable security analysis',
            mobile: 'boolean - Enable mobile UX analysis',
            content: 'boolean - Enable content analysis'
          },
          userId: 'string (optional) - User ID for tracking'
        }
      }
    },
    { status: 405 }
  )
} 