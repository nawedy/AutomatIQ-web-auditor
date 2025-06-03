import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services/audit-service'

const auditService = new AuditService()

export async function GET(
  request: NextRequest,
  { params }: { params: { auditId: string } }
) {
  try {
    const { auditId } = params

    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      )
    }

    // Validate audit ID format (basic UUID validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(auditId)) {
      return NextResponse.json(
        { error: 'Invalid audit ID format' },
        { status: 400 }
      )
    }

    // Get audit results
    const results = await auditService.getAuditResults(auditId)

    if (!results) {
      // Check if audit is still in progress
      const progress = await auditService.getAuditProgress(auditId)
      
      if (progress) {
        if (progress.status === 'completed') {
          return NextResponse.json(
            { error: 'Audit completed but results not found' },
            { status: 500 }
          )
        } else if (progress.status === 'failed') {
          return NextResponse.json(
            { 
              error: 'Audit failed',
              progress: {
                id: progress.id,
                status: progress.status,
                currentStep: progress.currentStep
              }
            },
            { status: 422 }
          )
        } else {
          return NextResponse.json(
            { 
              error: 'Audit still in progress',
              progress: {
                id: progress.id,
                status: progress.status,
                currentStep: progress.currentStep,
                progress: progress.progress
              }
            },
            { status: 202 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const includeRawData = searchParams.get('includeRawData') === 'true'
    const modules = searchParams.get('modules')?.split(',') || []

    // Filter results based on query parameters
    let filteredResults = { ...results }

    // Remove raw data if not requested
    if (!includeRawData && filteredResults.rawData) {
      delete filteredResults.rawData
    }

    // Filter specific modules if requested
    if (modules.length > 0) {
      const allowedModules = ['seo', 'performance', 'accessibility', 'security', 'mobile', 'content']
      const validModules = modules.filter(module => allowedModules.includes(module))
      
      if (validModules.length > 0) {
        const moduleResults: any = {}
        for (const module of validModules) {
          if (filteredResults[module as keyof typeof filteredResults]) {
            moduleResults[module] = filteredResults[module as keyof typeof filteredResults]
          }
        }
        filteredResults = {
          ...filteredResults,
          ...moduleResults
        }
        
        // Remove modules not requested
        for (const module of allowedModules) {
          if (!validModules.includes(module) && filteredResults[module as keyof typeof filteredResults]) {
            delete filteredResults[module as keyof typeof filteredResults]
          }
        }
      }
    }

    // Return audit results
    return NextResponse.json({
      success: true,
      results: filteredResults
    })

  } catch (error) {
    console.error('API Error - Get Audit Results:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get audit results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use GET to retrieve audit results.',
      usage: {
        method: 'GET',
        path: '/api/audit/results/{auditId}',
        queryParams: {
          includeRawData: 'boolean - Include raw audit data (default: false)',
          modules: 'string - Comma-separated list of modules to include (seo,performance,accessibility,security,mobile,content)'
        },
        description: 'Get the complete results of a completed audit'
      }
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use GET to retrieve audit results.',
      usage: {
        method: 'GET',
        path: '/api/audit/results/{auditId}',
        description: 'Get the complete results of a completed audit'
      }
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use GET to retrieve audit results.',
      usage: {
        method: 'GET',
        path: '/api/audit/results/{auditId}',
        description: 'Get the complete results of a completed audit'
      }
    },
    { status: 405 }
  )
} 