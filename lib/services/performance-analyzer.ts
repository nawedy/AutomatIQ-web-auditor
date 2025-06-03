import lighthouse from 'lighthouse'
import { Page } from 'puppeteer'
import { PerformanceResults, PerformanceOpportunity, PerformanceDiagnostic } from '@/lib/types/audit'

export class PerformanceAnalyzer {
  
  async analyze(page: Page, url: string): Promise<PerformanceResults> {
    try {
      // Get the port from the page's browser
      const browser = page.browser()
      const wsEndpoint = browser.wsEndpoint()
      const port = new URL(wsEndpoint).port
      
      // Run Lighthouse audit
      const result = await lighthouse(url, {
        port: parseInt(port),
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance'],
        settings: {
          maxWaitForFcp: 15 * 1000,
          maxWaitForLoad: 35 * 1000,
          throttlingMethod: 'simulate',
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
          },
          emulatedFormFactor: 'desktop',
        }
      })

      if (!result || !result.lhr) {
        throw new Error('Failed to run Lighthouse audit')
      }

      const lhr = result.lhr
      
      // Extract Core Web Vitals and other metrics
      const metrics = this.extractMetrics(lhr)
      
      // Extract opportunities for improvement
      const opportunities = this.extractOpportunities(lhr)
      
      // Extract diagnostics
      const diagnostics = this.extractDiagnostics(lhr)
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(opportunities, diagnostics)
      
      // Calculate overall performance score
      const score = Math.round((lhr.categories.performance?.score || 0) * 100)

      return {
        score,
        suggestions,
        metrics,
        opportunities,
        diagnostics
      }

    } catch (error) {
      console.error('Performance analysis error:', error)
      
      // Return fallback results
      return {
        score: 0,
        suggestions: ['Unable to complete performance analysis. Please try again.'],
        metrics: {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          tti: 0,
          tbt: 0,
          si: 0
        },
        opportunities: [],
        diagnostics: []
      }
    }
  }

  private extractMetrics(lhr: any) {
    const audits = lhr.audits
    
    // Core Web Vitals
    const lcp = audits['largest-contentful-paint']?.numericValue || 0
    const fid = audits['max-potential-fid']?.numericValue || 0 // Use max-potential-fid as proxy
    const cls = audits['cumulative-layout-shift']?.numericValue || 0
    
    // Other important metrics
    const fcp = audits['first-contentful-paint']?.numericValue || 0
    const tti = audits['interactive']?.numericValue || 0
    const tbt = audits['total-blocking-time']?.numericValue || 0
    const si = audits['speed-index']?.numericValue || 0

    return {
      lcp: Math.round(lcp),
      fid: Math.round(fid),
      cls: Math.round(cls * 1000) / 1000, // Round to 3 decimal places
      fcp: Math.round(fcp),
      tti: Math.round(tti),
      tbt: Math.round(tbt),
      si: Math.round(si)
    }
  }

  private extractOpportunities(lhr: any): PerformanceOpportunity[] {
    const opportunities: PerformanceOpportunity[] = []
    const audits = lhr.audits

    // Define opportunity audit IDs that Lighthouse provides
    const opportunityAudits = [
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript',
      'preload-lcp-image',
      'total-byte-weight',
      'uses-long-cache-ttl',
      'dom-size'
    ]

    for (const auditId of opportunityAudits) {
      const audit = audits[auditId]
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: Math.round(audit.details.overallSavingsMs),
          wastedBytes: audit.details.overallSavingsBytes ? Math.round(audit.details.overallSavingsBytes) : undefined,
          wastedMs: Math.round(audit.details.overallSavingsMs)
        })
      }
    }

    // Sort by potential savings (highest first)
    return opportunities.sort((a, b) => b.savings - a.savings)
  }

  private extractDiagnostics(lhr: any): PerformanceDiagnostic[] {
    const diagnostics: PerformanceDiagnostic[] = []
    const audits = lhr.audits

    // Define diagnostic audit IDs
    const diagnosticAudits = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'total-blocking-time',
      'speed-index',
      'interactive',
      'bootup-time',
      'mainthread-work-breakdown',
      'network-rtt',
      'network-server-latency',
      'uses-http2',
      'uses-passive-event-listeners',
      'no-document-write',
      'dom-size',
      'critical-request-chains'
    ]

    for (const auditId of diagnosticAudits) {
      const audit = audits[auditId]
      if (audit) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score !== null ? Math.round(audit.score * 100) : 0,
          scoreDisplayMode: audit.scoreDisplayMode || 'numeric'
        })
      }
    }

    return diagnostics
  }

  private generateSuggestions(opportunities: PerformanceOpportunity[], diagnostics: PerformanceDiagnostic[]): string[] {
    const suggestions: string[] = []

    // Generate suggestions based on opportunities
    if (opportunities.length > 0) {
      const topOpportunity = opportunities[0]
      
      switch (topOpportunity.id) {
        case 'unused-css-rules':
          suggestions.push('Remove unused CSS rules to reduce bundle size and improve load times')
          break
        case 'unused-javascript':
          suggestions.push('Remove unused JavaScript to reduce bundle size and parse time')
          break
        case 'modern-image-formats':
          suggestions.push('Use modern image formats like WebP or AVIF for better compression')
          break
        case 'offscreen-images':
          suggestions.push('Implement lazy loading for images below the fold')
          break
        case 'render-blocking-resources':
          suggestions.push('Eliminate render-blocking resources to improve First Contentful Paint')
          break
        case 'unminified-css':
          suggestions.push('Minify CSS files to reduce file size')
          break
        case 'unminified-javascript':
          suggestions.push('Minify JavaScript files to reduce file size')
          break
      }
    }

    // Generate suggestions based on Core Web Vitals
    const poorLcp = diagnostics.find(d => d.id === 'largest-contentful-paint' && d.score < 50)
    if (poorLcp) {
      suggestions.push('Optimize Largest Contentful Paint by optimizing server response times and resource loading')
    }

    const poorCls = diagnostics.find(d => d.id === 'cumulative-layout-shift' && d.score < 75)
    if (poorCls) {
      suggestions.push('Reduce Cumulative Layout Shift by ensuring proper sizing for images and ads')
    }

    const highTbt = diagnostics.find(d => d.id === 'total-blocking-time' && d.score < 50)
    if (highTbt) {
      suggestions.push('Reduce Total Blocking Time by optimizing JavaScript execution and breaking up long tasks')
    }

    // General suggestions
    if (suggestions.length === 0) {
      suggestions.push('Great performance! Consider implementing advanced optimizations like service workers and preloading critical resources')
    }

    return suggestions
  }

  // Utility method to get performance score category
  static getScoreCategory(score: number): 'poor' | 'needs-improvement' | 'good' {
    if (score < 50) return 'poor'
    if (score < 90) return 'needs-improvement'
    return 'good'
  }

  // Utility method to format metric values for display
  static formatMetric(metricId: string, value: number): string {
    switch (metricId) {
      case 'lcp':
      case 'fcp':
      case 'tti':
      case 'si':
        return `${(value / 1000).toFixed(1)}s`
      case 'fid':
      case 'tbt':
        return `${value}ms`
      case 'cls':
        return value.toFixed(3)
      default:
        return value.toString()
    }
  }
} 