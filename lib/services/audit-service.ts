import { v4 as uuidv4 } from 'uuid'
import { WebCrawler } from './crawler'
import { SEOAnalyzer } from './seo-analyzer'
import { PerformanceAnalyzer } from './performance-analyzer'
import { AccessibilityAnalyzer } from './accessibility-analyzer'
import { AuditResults, AuditOptions, AuditProgress, CrawlResults } from '@/lib/types/audit'
import { AuditResultsModel, AuditProgressModel, AuditJobQueueModel } from '@/lib/models/audit'
import connectDB from '@/lib/db/mongodb'

export class AuditService {
  private crawler: WebCrawler
  private seoAnalyzer: SEOAnalyzer
  private performanceAnalyzer: PerformanceAnalyzer
  private accessibilityAnalyzer: AccessibilityAnalyzer

  constructor() {
    this.crawler = new WebCrawler()
    this.seoAnalyzer = new SEOAnalyzer()
    this.performanceAnalyzer = new PerformanceAnalyzer()
    this.accessibilityAnalyzer = new AccessibilityAnalyzer()
  }

  async startAudit(url: string, options: AuditOptions, userId?: string): Promise<string> {
    const auditId = uuidv4()
    
    try {
      await connectDB()

      // Normalize URL
      const normalizedUrl = WebCrawler.normalizeUrl(url)
      
      // Validate URL
      if (!WebCrawler.isValidUrl(normalizedUrl)) {
        throw new Error('Invalid URL provided')
      }

      // Create audit progress record
      await AuditProgressModel.create({
        id: auditId,
        url: normalizedUrl,
        status: 'pending',
        currentStep: 'Initializing audit',
        progress: 0
      })

      // Start audit process asynchronously
      this.processAudit(auditId, normalizedUrl, options, userId).catch(error => {
        console.error(`Audit ${auditId} failed:`, error)
        this.updateProgress(auditId, 'failed', 'Audit failed', 0)
      })

      return auditId

    } catch (error) {
      console.error('Failed to start audit:', error)
      throw new Error('Failed to start audit: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async processAudit(auditId: string, url: string, options: AuditOptions, userId?: string) {
    const startTime = Date.now()
    let crawlResults: CrawlResults | null = null

    try {
      // Initialize crawler
      await this.crawler.init()

      // Step 1: Website Crawling
      await this.updateProgress(auditId, 'crawling', 'Crawling website', 10)
      
      const crawlStartTime = Date.now()
      crawlResults = await this.crawler.crawl(url)
      const crawlDuration = Date.now() - crawlStartTime

      if (crawlResults.errors.length > 0) {
        console.warn(`Crawl completed with ${crawlResults.errors.length} errors for ${url}`)
      }

      // Step 2: Analysis Phase
      await this.updateProgress(auditId, 'analyzing', 'Analyzing website', 30)
      
      const analysisStartTime = Date.now()
      const results: Partial<AuditResults> = {
        id: auditId,
        url,
        timestamp: new Date(),
        status: 'completed',
        crawlDuration,
        analysisDuration: 0,
        totalDuration: 0,
        userId,
        userAgent: 'AutomatIQ-Auditor/1.0',
        screenshotPath: crawlResults.screenshots.desktop,
        rawData: {
          crawlResults
        }
      }

      // Run enabled analysis modules
      let totalModules = 0
      let completedModules = 0
      const enabledModules = Object.entries(options).filter(([_, enabled]) => enabled)
      totalModules = enabledModules.length

      // SEO Analysis
      if (options.seo) {
        await this.updateProgress(auditId, 'analyzing', 'Analyzing SEO', 40)
        try {
          results.seo = await this.seoAnalyzer.analyze(crawlResults, url)
          completedModules++
        } catch (error) {
          console.error('SEO analysis failed:', error)
          results.seo = {
            score: 0,
            issues: [{ type: 'error', category: 'meta', message: 'SEO analysis failed' }],
            suggestions: ['Unable to complete SEO analysis'],
            metrics: { metaTags: { title: null, description: null, keywords: null }, headings: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 }, images: { total: 0, missingAlt: 0, optimized: 0 }, links: { internal: 0, external: 0, broken: 0 } }
          }
        }
      }

      // Performance Analysis
      if (options.performance) {
        await this.updateProgress(auditId, 'analyzing', 'Analyzing performance', 60)
        try {
          const { page } = await this.crawler.crawlForPerformance(url)
          results.performance = await this.performanceAnalyzer.analyze(page, url)
          results.rawData!.lighthouseReport = results.performance
          await page.close()
          completedModules++
        } catch (error) {
          console.error('Performance analysis failed:', error)
          results.performance = {
            score: 0,
            suggestions: ['Unable to complete performance analysis'],
            metrics: { lcp: 0, fid: 0, cls: 0, fcp: 0, tti: 0, tbt: 0, si: 0 },
            opportunities: [],
            diagnostics: []
          }
        }
      }

      // Accessibility Analysis
      if (options.accessibility) {
        await this.updateProgress(auditId, 'analyzing', 'Analyzing accessibility', 80)
        try {
          const { page } = await this.crawler.crawlForPerformance(url)
          results.accessibility = await this.accessibilityAnalyzer.analyze(page)
          results.rawData!.axeResults = results.accessibility
          await page.close()
          completedModules++
        } catch (error) {
          console.error('Accessibility analysis failed:', error)
          results.accessibility = {
            score: 0,
            issues: [{ id: 'analysis-error', impact: 'critical', tags: ['error'], description: 'Accessibility analysis failed', help: 'Please try again', helpUrl: '', nodes: [] }],
            suggestions: ['Unable to complete accessibility analysis'],
            metrics: { violations: 1, incomplete: 0, passes: 0, inapplicable: 0 }
          }
        }
      }

      // Mobile UX Analysis (Basic implementation)
      if (options.mobile) {
        await this.updateProgress(auditId, 'analyzing', 'Analyzing mobile UX', 85)
        try {
          results.mobile = await this.analyzeMobileUX(crawlResults)
          completedModules++
        } catch (error) {
          console.error('Mobile analysis failed:', error)
          results.mobile = {
            score: 0,
            issues: ['Mobile analysis failed'],
            suggestions: ['Unable to complete mobile analysis'],
            metrics: { viewport: { configured: false, width: null }, touchTargets: { total: 0, tooSmall: 0, tooClose: 0 }, readability: { fontSizeOk: false, lineHeightOk: false }, images: { responsive: 0, total: 0 } }
          }
        }
      }

      // Content Analysis (Basic implementation)
      if (options.content) {
        await this.updateProgress(auditId, 'analyzing', 'Analyzing content', 90)
        try {
          results.content = await this.analyzeContent(crawlResults)
          completedModules++
        } catch (error) {
          console.error('Content analysis failed:', error)
          results.content = {
            score: 0,
            issues: ['Content analysis failed'],
            suggestions: ['Unable to complete content analysis'],
            metrics: { readability: { fleschKincaid: 0, gunningFog: 0, averageSentenceLength: 0, averageWordsPerSentence: 0 }, sentiment: { score: 0, magnitude: 0, overall: 'neutral' }, structure: { wordCount: 0, paragraphs: 0, sentences: 0, headings: 0 } }
          }
        }
      }

      // Calculate overall score
      const moduleScores = Object.values(results).filter((module): module is any => 
        module && typeof module === 'object' && 'score' in module
      ).map(module => module.score)
      
      results.overallScore = moduleScores.length > 0 
        ? Math.round(moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length)
        : 0

      // Finalize timing
      const analysisDuration = Date.now() - analysisStartTime
      const totalDuration = Date.now() - startTime
      
      results.analysisDuration = analysisDuration
      results.totalDuration = totalDuration

      // Save results to database
      await connectDB()
      await AuditResultsModel.create(results)

      // Update progress to completed
      await this.updateProgress(auditId, 'completed', 'Audit completed', 100)

      console.log(`✅ Audit ${auditId} completed in ${totalDuration}ms`)

    } catch (error) {
      console.error(`❌ Audit ${auditId} failed:`, error)
      await this.updateProgress(auditId, 'failed', `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 0)
      throw error
    } finally {
      // Clean up
      await this.crawler.close()
    }
  }

  async getAuditProgress(auditId: string): Promise<AuditProgress | null> {
    try {
      await connectDB()
      const progress = await AuditProgressModel.findOne({ id: auditId }).lean()
      return progress as AuditProgress | null
    } catch (error) {
      console.error('Failed to get audit progress:', error)
      return null
    }
  }

  async getAuditResults(auditId: string): Promise<AuditResults | null> {
    try {
      await connectDB()
      const results = await AuditResultsModel.findOne({ id: auditId }).lean()
      return results as AuditResults | null
    } catch (error) {
      console.error('Failed to get audit results:', error)
      return null
    }
  }

  private async updateProgress(auditId: string, status: AuditProgress['status'], currentStep: string, progress: number) {
    try {
      await connectDB()
      await AuditProgressModel.findOneAndUpdate(
        { id: auditId },
        {
          status,
          currentStep,
          progress,
          updatedAt: new Date()
        }
      )
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  private async analyzeMobileUX(crawlResults: CrawlResults) {
    // Basic mobile UX analysis
    const root = require('node-html-parser').parse(crawlResults.html)
    
    // Check viewport meta tag
    const viewportMeta = root.querySelector('meta[name="viewport"]')
    const viewport = {
      configured: !!viewportMeta,
      width: viewportMeta?.getAttribute('content') || null
    }

    // Analyze touch targets (buttons, links)
    const touchElements = root.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    const touchTargets = {
      total: touchElements.length,
      tooSmall: 0, // Would need CSS analysis for accurate measurement
      tooClose: 0  // Would need CSS analysis for accurate measurement
    }

    // Basic readability check
    const readability = {
      fontSizeOk: true, // Would need CSS analysis
      lineHeightOk: true // Would need CSS analysis
    }

    // Check responsive images
    const images = root.querySelectorAll('img')
    const responsiveImages = images.filter((img: any) => 
      img.getAttribute('srcset') || img.getAttribute('sizes')
    )
    
    const imageMetrics = {
      responsive: responsiveImages.length,
      total: images.length
    }

    let score = 100
    if (!viewport.configured) score -= 20
    if (imageMetrics.responsive < imageMetrics.total * 0.5) score -= 10

    return {
      score: Math.max(0, score),
      issues: viewport.configured ? [] : ['Missing viewport meta tag'],
      suggestions: viewport.configured 
        ? ['Great mobile setup! Consider testing on various devices']
        : ['Add viewport meta tag for proper mobile rendering'],
      metrics: {
        viewport,
        touchTargets,
        readability,
        images: imageMetrics
      }
    }
  }

  private async analyzeContent(crawlResults: CrawlResults) {
    // Basic content analysis
    const root = require('node-html-parser').parse(crawlResults.html)
    
    // Extract text content
    const textContent = root.text || ''
    const words = textContent.split(/\s+/).filter((word: string) => word.length > 0)
    const sentences = textContent.split(/[.!?]+/).filter((sentence: string) => sentence.trim().length > 0)
    const paragraphs = root.querySelectorAll('p').length
    const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6').length

    // Basic readability calculations
    const averageWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0
    const averageSentenceLength = sentences.length > 0 
      ? sentences.reduce((sum: number, sentence: string) => sum + sentence.length, 0) / sentences.length 
      : 0

    // Simplified Flesch-Kincaid approximation
    const fleschKincaid = averageWordsPerSentence > 0 
      ? Math.max(0, 206.835 - 1.015 * averageWordsPerSentence - 84.6 * (averageSentenceLength / words.length))
      : 0

    const readability = {
      fleschKincaid: Math.round(fleschKincaid),
      gunningFog: Math.round(0.4 * (averageWordsPerSentence + 100 * (words.filter((word: string) => word.length > 6).length / words.length))),
      averageSentenceLength: Math.round(averageSentenceLength),
      averageWordsPerSentence: Math.round(averageWordsPerSentence)
    }

    // Basic sentiment analysis (very simplified)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic']
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate']
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (textContent.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0)
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (textContent.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0)
    
    const sentimentScore = positiveCount - negativeCount
    const sentiment = {
      score: sentimentScore,
      magnitude: Math.abs(sentimentScore),
      overall: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral' as const
    }

    const structure = {
      wordCount: words.length,
      paragraphs,
      sentences: sentences.length,
      headings
    }

    // Calculate content score
    let score = 100
    if (words.length < 300) score -= 20
    if (readability.fleschKincaid < 30) score -= 15
    if (headings === 0) score -= 10
    if (paragraphs < 3) score -= 10

    const issues: string[] = []
    const suggestions: string[] = []

    if (words.length < 300) {
      issues.push('Content appears to be too short')
      suggestions.push('Consider adding more comprehensive content')
    }

    if (readability.fleschKincaid < 30) {
      issues.push('Content may be difficult to read')
      suggestions.push('Simplify language and sentence structure for better readability')
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions: suggestions.length > 0 ? suggestions : ['Content analysis looks good! Consider regular content updates'],
      metrics: {
        readability,
        sentiment,
        structure
      }
    }
  }
} 