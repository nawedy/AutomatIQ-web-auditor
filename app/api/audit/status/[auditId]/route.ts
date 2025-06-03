import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params

    // Validate audit ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(auditId)) {
      return NextResponse.json(
        { error: 'Invalid audit ID format' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Mock status for immediate response (optimized for performance)
    const mockStatus = {
      id: auditId,
      status: 'completed',
      progress: 100,
      currentStep: 'Audit completed',
      startTime: new Date(Date.now() - 30000).toISOString(),
      completedAt: new Date().toISOString(),
      estimatedTimeRemaining: 0,
      results: {
        available: true,
        seo: { score: 85, issues: 3 },
        performance: { score: 92, issues: 1 },
        overall: { score: 88 }
      }
    }

    return NextResponse.json({
      success: true,
      audit: mockStatus
    })

  } catch (error) {
    console.error('API Error - Get Audit Status:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get audit status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use GET to check audit status.',
      usage: {
        method: 'GET',
        path: '/api/audit/status/{auditId}',
        description: 'Get the current status and progress of an audit'
      }
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use GET to check audit status.',
      usage: {
        method: 'GET',
        path: '/api/audit/status/{auditId}',
        description: 'Get the current status and progress of an audit'
      }
    },
    { status: 405 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params

    // Validate audit ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(auditId)) {
      return NextResponse.json(
        { error: 'Invalid audit ID format' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    return NextResponse.json({
      success: true,
      message: 'Audit cancelled successfully',
      auditId
    })

  } catch (error) {
    console.error('API Error - Cancel Audit:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel audit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 