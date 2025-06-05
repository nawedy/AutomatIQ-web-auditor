// src/lib/services/advanced-audit-orchestrator.ts
// Advanced audit orchestrator service that coordinates all advanced analyzers

import { PrismaClient } from '@prisma/client';
import { ComprehensiveAuditResult, AuditStatus } from '../types/advanced-audit';
import { AuditProgressTracker } from './audit-progress-tracker';
import { AdvancedSEOAnalyzer } from './advanced-seo-analyzer';
import { AdvancedPerformanceAnalyzer } from './advanced-performance-analyzer';
import { AdvancedAccessibilityAnalyzer } from './advanced-accessibility-analyzer';
import { AdvancedMobileAnalyzer } from './advanced-mobile-analyzer';
import { AdvancedContentAnalyzer } from './advanced-content-analyzer';
import { AdvancedCrossBrowserAnalyzer } from './advanced-cross-browser-analyzer';
import { AdvancedAnalyticsAnalyzer } from './advanced-analytics-analyzer';
import { AdvancedChatbotAnalyzer } from './advanced-chatbot-analyzer';

export class AdvancedAuditOrchestrator {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  /**
   * Run a comprehensive audit with selected categories
   */
  async runAudit(
    auditId: string,
    url: string,
    categories: string[] = ['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT', 'CROSS_BROWSER', 'ANALYTICS', 'CHATBOT']
  ): Promise<ComprehensiveAuditResult> {
    // Initialize progress tracker
    const totalSteps = this.calculateTotalSteps(categories);
    const progressTracker = new AuditProgressTracker(this.prisma, auditId, totalSteps);
    await progressTracker.initialize();
    
    let currentStep = 0;
    const result: ComprehensiveAuditResult = {
      url,
      score: 0,
      categories: categories,
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Run each selected analyzer
      if (categories.includes('SEO')) {
        currentStep++;
        await progressTracker.updateProgress('SEO', currentStep, 'Analyzing SEO...');
        const seoAnalyzer = new AdvancedSEOAnalyzer();
        result.seo = await seoAnalyzer.analyze(url);
        
        // Save SEO results to database
        await this.saveCategoryResults(auditId, 'SEO', result.seo);
      }
      
      if (categories.includes('PERFORMANCE')) {
        currentStep++;
        await progressTracker.updateProgress('PERFORMANCE', currentStep, 'Analyzing performance...');
        const performanceAnalyzer = new AdvancedPerformanceAnalyzer();
        result.performance = await performanceAnalyzer.analyze(url);
        
        // Save performance results to database
        await this.saveCategoryResults(auditId, 'PERFORMANCE', result.performance);
      }
      
      if (categories.includes('ACCESSIBILITY')) {
        currentStep++;
        await progressTracker.updateProgress('ACCESSIBILITY', currentStep, 'Analyzing accessibility...');
        const accessibilityAnalyzer = new AdvancedAccessibilityAnalyzer();
        result.accessibility = await accessibilityAnalyzer.analyze(url);
        
        // Save accessibility results to database
        await this.saveCategoryResults(auditId, 'ACCESSIBILITY', result.accessibility);
      }
      
      if (categories.includes('MOBILE')) {
        currentStep++;
        await progressTracker.updateProgress('MOBILE', currentStep, 'Analyzing mobile UX...');
        const mobileAnalyzer = new AdvancedMobileAnalyzer();
        result.mobile = await mobileAnalyzer.analyze(url);
        
        // Save mobile results to database
        await this.saveCategoryResults(auditId, 'MOBILE', result.mobile);
      }
      
      if (categories.includes('CONTENT')) {
        currentStep++;
        await progressTracker.updateProgress('CONTENT', currentStep, 'Analyzing content quality...');
        const contentAnalyzer = new AdvancedContentAnalyzer();
        result.content = await contentAnalyzer.analyze(url);
        
        // Save content results to database
        await this.saveCategoryResults(auditId, 'CONTENT', result.content);
      }
      
      if (categories.includes('CROSS_BROWSER')) {
        currentStep++;
        await progressTracker.updateProgress('CROSS_BROWSER', currentStep, 'Analyzing cross-browser compatibility...');
        const crossBrowserAnalyzer = new AdvancedCrossBrowserAnalyzer();
        result.crossBrowser = await crossBrowserAnalyzer.analyze(url);
        
        // Save cross-browser results to database
        await this.saveCategoryResults(auditId, 'CROSS_BROWSER', result.crossBrowser);
      }
      
      if (categories.includes('ANALYTICS')) {
        currentStep++;
        await progressTracker.updateProgress('ANALYTICS', currentStep, 'Analyzing analytics integration...');
        const analyticsAnalyzer = new AdvancedAnalyticsAnalyzer();
        result.analytics = await analyticsAnalyzer.analyze(url);
        
        // Save analytics results to database
        await this.saveCategoryResults(auditId, 'ANALYTICS', result.analytics);
      }
      
      if (categories.includes('CHATBOT')) {
        currentStep++;
        await progressTracker.updateProgress('CHATBOT', currentStep, 'Analyzing chatbot integration...');
        const chatbotAnalyzer = new AdvancedChatbotAnalyzer();
        result.chatbot = await chatbotAnalyzer.analyze(url);
        
        // Save chatbot results to database
        await this.saveCategoryResults(auditId, 'CHATBOT', result.chatbot);
      }
      
      // Calculate overall score
      result.score = this.calculateOverallScore(result);
      
      // Save overall results
      await this.saveOverallResults(auditId, result);
      
      // Mark audit as complete
      await progressTracker.complete(true, 'Audit completed successfully');
      
      return result;
    } catch (error) {
      console.error('Error in audit orchestration:', error);
      await progressTracker.fail(error as Error);
      throw error;
    }
  }
  
  /**
   * Calculate the total number of steps for progress tracking
   */
  private calculateTotalSteps(categories: string[]): number {
    return categories.length;
  }
  
  /**
   * Calculate the overall score based on category scores
   */
  private calculateOverallScore(result: ComprehensiveAuditResult): number {
    // Define weights for each category
    const weights: Record<string, number> = {
      seo: 1.5,
      performance: 1.5,
      accessibility: 1.2,
      security: 1.5,
      mobile: 1.2,
      content: 1.0,
      crossBrowser: 1.0,
      analytics: 0.8,
      chatbot: 0.5,
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // Add weighted scores for each category
    if (result.seo) {
      totalScore += result.seo.score * weights.seo;
      totalWeight += weights.seo;
    }
    
    if (result.performance) {
      totalScore += result.performance.score * weights.performance;
      totalWeight += weights.performance;
    }
    
    if (result.accessibility) {
      totalScore += result.accessibility.score * weights.accessibility;
      totalWeight += weights.accessibility;
    }
    
    if (result.security) {
      totalScore += result.security.score * weights.security;
      totalWeight += weights.security;
    }
    
    if (result.mobile) {
      totalScore += result.mobile.score * weights.mobile;
      totalWeight += weights.mobile;
    }
    
    if (result.content) {
      totalScore += result.content.score * weights.content;
      totalWeight += weights.content;
    }
    
    if (result.crossBrowser) {
      totalScore += result.crossBrowser.score * weights.crossBrowser;
      totalWeight += weights.crossBrowser;
    }
    
    if (result.analytics) {
      totalScore += result.analytics.score * weights.analytics;
      totalWeight += weights.analytics;
    }
    
    if (result.chatbot) {
      totalScore += result.chatbot.score * weights.chatbot;
      totalWeight += weights.chatbot;
    }
    
    // Calculate weighted average
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 10) / 10 : 0;
  }
  
  /**
   * Save category results to the database
   */
  private async saveCategoryResults(auditId: string, category: string, results: any): Promise<void> {
    try {
      // Save category score to the audit record
      const scoreField = `${category.toLowerCase()}Score`;
      
      await this.prisma.audit.update({
        where: { id: auditId },
        data: {
          [scoreField]: results.score,
        },
      });
      
      // Save detailed results as JSON
      await this.prisma.auditResult.create({
        data: {
          auditId,
          category,
          score: results.score,
          details: results,
        },
      });
      
      // Save issues as individual records for better querying
      if (results.issues && Array.isArray(results.issues)) {
        const issueRecords = results.issues.map((issue: string) => ({
          auditId,
          category,
          description: issue,
          severity: this.determineSeverity(issue),
        }));
        
        if (issueRecords.length > 0) {
          await this.prisma.auditIssue.createMany({
            data: issueRecords,
          });
        }
      }
    } catch (error) {
      console.error(`Error saving ${category} results:`, error);
    }
  }
  
  /**
   * Save overall audit results to the database
   */
  private async saveOverallResults(auditId: string, result: ComprehensiveAuditResult): Promise<void> {
    try {
      // Update the audit record with overall score and category scores
      await this.prisma.audit.update({
        where: { id: auditId },
        data: {
          overallScore: result.score,
          status: 'completed' as AuditStatus,
          completedAt: new Date(),
        },
      });
      
      // Create audit summary
      await this.prisma.auditSummary.create({
        data: {
          auditId,
          overallScore: result.score,
          totalIssues: await this.countTotalIssues(auditId),
          criticalIssues: await this.countIssuesBySeverity(auditId, 'CRITICAL'),
          majorIssues: await this.countIssuesBySeverity(auditId, 'MAJOR'),
          minorIssues: await this.countIssuesBySeverity(auditId, 'MINOR'),
          categories: result.categories,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Error saving overall results:', error);
    }
  }
  
  /**
   * Count total issues for an audit
   */
  private async countTotalIssues(auditId: string): Promise<number> {
    return this.prisma.auditIssue.count({
      where: { auditId },
    });
  }
  
  /**
   * Count issues by severity
   */
  private async countIssuesBySeverity(auditId: string, severity: string): Promise<number> {
    return this.prisma.auditIssue.count({
      where: { auditId, severity },
    });
  }
  
  /**
   * Determine issue severity based on keywords
   */
  private determineSeverity(issue: string): string {
    const lowercaseIssue = issue.toLowerCase();
    
    // Critical issues
    if (
      lowercaseIssue.includes('critical') ||
      lowercaseIssue.includes('severe') ||
      lowercaseIssue.includes('security') ||
      lowercaseIssue.includes('vulnerability') ||
      lowercaseIssue.includes('breach') ||
      lowercaseIssue.includes('broken') ||
      lowercaseIssue.includes('missing ssl') ||
      lowercaseIssue.includes('missing https')
    ) {
      return 'CRITICAL';
    }
    
    // Major issues
    if (
      lowercaseIssue.includes('major') ||
      lowercaseIssue.includes('important') ||
      lowercaseIssue.includes('significant') ||
      lowercaseIssue.includes('performance') ||
      lowercaseIssue.includes('slow') ||
      lowercaseIssue.includes('accessibility') ||
      lowercaseIssue.includes('mobile') ||
      lowercaseIssue.includes('seo')
    ) {
      return 'MAJOR';
    }
    
    // Default to minor
    return 'MINOR';
  }
  
  /**
   * Get audit result by ID
   */
  async getAuditResult(auditId: string): Promise<ComprehensiveAuditResult | null> {
    try {
      // Get the audit record
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
      });
      
      if (!audit) {
        return null;
      }
      
      // Get all category results
      const categoryResults = await this.prisma.auditResult.findMany({
        where: { auditId },
      });
      
      // Construct the comprehensive result
      const result: ComprehensiveAuditResult = {
        url: audit.url as string,
        score: audit.overallScore as number || 0,
        categories: audit.categories as string[],
        timestamp: audit.completedAt?.toISOString() || audit.createdAt.toISOString(),
        summary: {
          totalIssues: 0,
          criticalIssues: 0,
          majorIssues: 0,
          minorIssues: 0,
          recommendations: []
        }
      };
      
      // Add category results
      for (const categoryResult of categoryResults) {
        const category = categoryResult.category.toLowerCase();
        (result as any)[category] = categoryResult.details;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting audit result:', error);
      return null;
    }
  }
}
