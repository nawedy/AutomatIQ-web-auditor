// src/lib/services/prisma-audit-service.ts
// Prisma-based audit service for running website audits

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { WebCrawler } from './crawler';
import { SEOAnalyzer } from './seo-analyzer';
import { PerformanceAnalyzer } from './performance-analyzer';
import { AccessibilityAnalyzer } from './accessibility-analyzer';
import { AuditOptions } from '@/lib/types/audit';
import type { Prisma } from '@prisma/client';

export class PrismaAuditService {
  private crawler: WebCrawler;
  private seoAnalyzer: SEOAnalyzer;
  private performanceAnalyzer: PerformanceAnalyzer;
  private accessibilityAnalyzer: AccessibilityAnalyzer;

  constructor() {
    this.crawler = new WebCrawler();
    this.seoAnalyzer = new SEOAnalyzer();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.accessibilityAnalyzer = new AccessibilityAnalyzer();
  }

  /**
   * Start a new audit for a website
   */
  async startAudit(websiteId: string, options: AuditOptions): Promise<string> {
    const auditId = uuidv4();
    
    try {
      // Get website details
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Normalize URL
      const url = WebCrawler.normalizeUrl(website.url);
      
      // Validate URL
      if (!WebCrawler.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }

      // Create audit record
      const audit = await prisma.audit.create({
        data: {
          id: auditId,
          websiteId,
          status: 'pending',
          startedAt: new Date(),
        },
      });

      // Start audit process asynchronously
      this.processAudit(auditId, url, options).catch(error => {
        console.error(`Audit ${auditId} failed:`, error);
        this.updateAuditStatus(auditId, 'failed');
      });

      return auditId;
    } catch (error) {
      console.error('Failed to start audit:', error);
      throw new Error('Failed to start audit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Process an audit
   */
  async processAudit(auditId: string, url: string, options: AuditOptions) {
    const startTime = Date.now();
    
    try {
      // Update audit status to running
      await this.updateAuditStatus(auditId, 'running');

      // Initialize crawler
      await this.crawler.init();

      // Step 1: Website Crawling
      console.log(`🕷️ Crawling website: ${url}`);
      const crawlStartTime = Date.now();
      const crawlResults = await this.crawler.crawl(url);
      const crawlDuration = Date.now() - crawlStartTime;

      if (crawlResults.errors.length > 0) {
        console.warn(`Crawl completed with ${crawlResults.errors.length} errors for ${url}`);
      }

      // Step 2: Analysis Phase
      console.log('🔍 Analyzing website...');
      const analysisStartTime = Date.now();

      // Get audit categories from database
      const categories = await this.getAuditCategories();
      
      // Track results
      const results: any[] = [];
      let totalScore = 0;
      let totalChecks = 0;
      let passedChecks = 0;
      let failedChecks = 0;
      let warningChecks = 0;

      // Process each category
      for (const category of categories) {
        // Get checks for this category
        const checks = await this.getAuditChecks(category.id);
        
        // Skip if no checks
        if (checks.length === 0) continue;

        // Check if this category is enabled in options
        const categoryKey = category.key as keyof AuditOptions;
        if (!options[categoryKey]) continue;

        // Process each check
        for (const check of checks) {
          try {
            // Run the check (this would be replaced with actual check logic)
            const checkResult = await this.runCheck(check, crawlResults, url);
            
            // Create audit result
            const auditResult = await prisma.auditResult.create({
              data: {
                auditId,
                checkId: check.id,
                status: checkResult.status,
                score: checkResult.score,
                data: checkResult.data,
                message: checkResult.message,
                severity: checkResult.severity,
              },
            });

            // Track results
            results.push(auditResult);
            totalChecks++;
            
            if (auditResult.status === 'passed') {
              passedChecks++;
            } else if (auditResult.status === 'failed') {
              failedChecks++;
            } else if (auditResult.status === 'warning') {
              warningChecks++;
            }
            
            // Add to total score
            totalScore += auditResult.score;
          } catch (error) {
            console.error(`Check ${check.id} failed:`, error);
            
            // Create failed audit result
            const auditResult = await prisma.auditResult.create({
              data: {
                auditId,
                checkId: check.id,
                status: 'error',
                score: 0,
                data: {},
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'high',
              },
            });
            
            results.push(auditResult);
            totalChecks++;
            failedChecks++;
          }
        }
      }

      // Calculate overall score
      const averageScore = totalChecks > 0 ? Math.round(totalScore / totalChecks) : 0;
      
      // Create audit summary
      const summary = await prisma.auditSummary.create({
        data: {
          auditId,
          score: averageScore,
          passedChecks,
          failedChecks,
          warningChecks,
          screenshotUrl: crawlResults.screenshots.desktop || '',
        },
      });

      // Calculate durations
      const analysisDuration = Date.now() - analysisStartTime;
      const totalDuration = Date.now() - startTime;

      // Update audit record
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          crawlDuration,
          analysisDuration,
          totalDuration,
        },
      });

      console.log(`✅ Audit ${auditId} completed in ${totalDuration}ms`);
    } catch (error) {
      console.error(`❌ Audit ${auditId} failed:`, error);
      await this.updateAuditStatus(auditId, 'failed');
      throw error;
    } finally {
      // Clean up
      await this.crawler.close();
    }
  }

  /**
   * Get audit progress
   */
  async getAuditProgress(auditId: string) {
    try {
      const audit = await prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          summary: true,
        },
      });

      if (!audit) {
        return null;
      }

      // Calculate progress percentage based on status
      let progress = 0;
      if (audit.status === 'pending') {
        progress = 0;
      } else if (audit.status === 'running') {
        progress = 50; // Simplified - would need more granular tracking
      } else if (audit.status === 'completed') {
        progress = 100;
      }

      return {
        id: audit.id,
        status: audit.status,
        progress,
        startedAt: audit.startedAt,
        completedAt: audit.completedAt,
        summary: audit.summary,
      };
    } catch (error) {
      console.error('Failed to get audit progress:', error);
      return null;
    }
  }

  /**
   * Get audit results
   */
  async getAuditResults(auditId: string) {
    try {
      const audit = await prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          website: true,
          summary: true,
          auditResults: {
            include: {
              check: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      return audit;
    } catch (error) {
      console.error('Failed to get audit results:', error);
      return null;
    }
  }

  /**
   * Update audit status
   */
  private async updateAuditStatus(auditId: string, status: 'pending' | 'running' | 'completed' | 'failed') {
    try {
      await prisma.audit.update({
        where: { id: auditId },
        data: { status },
      });
    } catch (error) {
      console.error('Failed to update audit status:', error);
    }
  }

  /**
   * Get all audit categories
   */
  private async getAuditCategories() {
    return await prisma.auditCategory.findMany();
  }

  /**
   * Get audit checks for a category
   */
  private async getAuditChecks(categoryId: string) {
    return await prisma.auditCheck.findMany({
      where: { categoryId },
    });
  }

  /**
   * Run a specific audit check
   * This is a placeholder that would be replaced with actual check implementations
   */
  private async runCheck(check: any, crawlResults: any, url: string) {
    // This is a simplified implementation
    // In a real system, this would dispatch to different check implementations
    
    const checkId = check.id;
    const checkKey = check.key;
    
    // Simulate different check results based on check key
    if (checkKey.includes('meta')) {
      const hasTitle = crawlResults.html.includes('<title>');
      return {
        status: hasTitle ? 'passed' : 'failed',
        score: hasTitle ? 100 : 0,
        data: { hasTitle },
        message: hasTitle ? 'Page has a title tag' : 'Page is missing a title tag',
        severity: hasTitle ? 'low' : 'high',
      };
    }
    
    if (checkKey.includes('image')) {
      const imgTags = (crawlResults.html.match(/<img[^>]+>/g) || []);
      const imgWithoutAlt = imgTags.filter((tag: string) => !tag.includes('alt='));
      const hasAltTags = imgWithoutAlt.length === 0;
      
      return {
        status: hasAltTags ? 'passed' : imgWithoutAlt.length < imgTags.length / 2 ? 'warning' : 'failed',
        score: hasAltTags ? 100 : Math.max(0, 100 - (imgWithoutAlt.length / imgTags.length) * 100),
        data: { total: imgTags.length, missing: imgWithoutAlt.length },
        message: hasAltTags 
          ? 'All images have alt text' 
          : `${imgWithoutAlt.length} of ${imgTags.length} images are missing alt text`,
        severity: hasAltTags ? 'low' : imgWithoutAlt.length < imgTags.length / 2 ? 'medium' : 'high',
      };
    }
    
    // Default random result for demo purposes
    const random = Math.random();
    return {
      status: random > 0.7 ? 'passed' : random > 0.4 ? 'warning' : 'failed',
      score: Math.round(random * 100),
      data: {},
      message: `Check ${checkKey} completed`,
      severity: random > 0.7 ? 'low' : random > 0.4 ? 'medium' : 'high',
    };
  }
}
