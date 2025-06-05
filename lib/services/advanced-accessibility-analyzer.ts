// src/lib/services/advanced-accessibility-analyzer.ts
// Advanced accessibility analyzer service using Axe-core with Puppeteer

import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { BaseAnalyzer } from './base-analyzer';
import { 
  AccessibilityAnalysisResult,
  WCAGCompliance,
  AccessibilityViolation,
  AccessibilityPass,
  AccessibilityIncomplete,
  AccessibilitySummary
} from '../types/advanced-audit';

export class AdvancedAccessibilityAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<AccessibilityAnalysisResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Create a new page
      const page = await browser.newPage();
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Run axe-core analysis
      const results = await new AxePuppeteer(page).analyze();
      
      // Extract violations, passes, and incomplete results
      const violations = this.extractViolations(results.violations);
      const passes = this.extractPasses(results.passes);
      const incomplete = this.extractIncomplete(results.incomplete);
      
      // Generate summary
      const summary = this.generateSummary(violations, passes, incomplete);
      
      // Calculate WCAG compliance
      const wcagCompliance = this.calculateWCAGCompliance(violations, passes);
      
      // Calculate overall score
      const score = this.calculateAccessibilityScore(violations, summary.totalViolations);
      
      // Close the browser
      await browser.close();
      
      return {
        score,
        wcagCompliance,
        violations,
        passes,
        incomplete,
        summary,
      };
    } catch (error) {
      console.error('Error in accessibility analysis:', error);
      throw new Error(`Accessibility analysis failed: ${(error as Error).message}`);
    }
  }
  
  private extractViolations(violations: any[]): AccessibilityViolation[] {
    return violations.map(violation => ({
      id: violation.id,
      impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      description: violation.description,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
      wcagCriteria: this.extractWCAGCriteria(violation.tags),
    }));
  }
  
  private extractPasses(passes: any[]): AccessibilityPass[] {
    return passes.map(pass => ({
      id: pass.id,
      description: pass.description,
      nodes: pass.nodes.length,
    }));
  }
  
  private extractIncomplete(incomplete: any[]): AccessibilityIncomplete[] {
    return incomplete.map(item => ({
      id: item.id,
      impact: item.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      description: item.description,
      helpUrl: item.helpUrl,
      nodes: item.nodes.length,
    }));
  }
  
  private generateSummary(
    violations: AccessibilityViolation[],
    passes: AccessibilityPass[],
    incomplete: AccessibilityIncomplete[]
  ): AccessibilitySummary {
    const totalViolations = violations.length;
    const criticalViolations = violations.filter(v => v.impact === 'critical').length;
    const seriousViolations = violations.filter(v => v.impact === 'serious').length;
    const moderateViolations = violations.filter(v => v.impact === 'moderate').length;
    const minorViolations = violations.filter(v => v.impact === 'minor').length;
    const totalPasses = passes.length;
    const totalIncomplete = incomplete.length;
    
    return {
      totalViolations,
      criticalViolations,
      seriousViolations,
      moderateViolations,
      minorViolations,
      totalPasses,
      totalIncomplete,
    };
  }
  
  private calculateWCAGCompliance(
    violations: AccessibilityViolation[],
    passes: AccessibilityPass[]
  ): WCAGCompliance {
    // Extract WCAG criteria from violations
    const violatedCriteria = new Set<string>();
    violations.forEach(violation => {
      violation.wcagCriteria.forEach(criterion => violatedCriteria.add(criterion));
    });
    
    // Count WCAG criteria by level
    const aViolations = Array.from(violatedCriteria).filter(c => c.startsWith('wcag2a')).length;
    const aaViolations = Array.from(violatedCriteria).filter(c => c.startsWith('wcag2aa')).length;
    const aaaViolations = Array.from(violatedCriteria).filter(c => c.startsWith('wcag2aaa')).length;
    
    // Estimate total criteria by level (approximate numbers)
    const totalACriteria = 30;
    const totalAACriteria = 20;
    const totalAAACriteria = 28;
    
    // Calculate compliance percentages
    const aCompliance = Math.max(0, Math.round(((totalACriteria - aViolations) / totalACriteria) * 100));
    const aaCompliance = Math.max(0, Math.round(((totalAACriteria - aaViolations) / totalAACriteria) * 100));
    const aaaCompliance = Math.max(0, Math.round(((totalAAACriteria - aaaViolations) / totalAAACriteria) * 100));
    
    return {
      aCompliance,
      aaCompliance,
      aaaCompliance,
    };
  }
  
  private calculateAccessibilityScore(
    violations: AccessibilityViolation[],
    totalViolations: number
  ): number {
    if (totalViolations === 0) return 100;
    
    // Weight violations by impact
    const impactWeights = {
      critical: 4,
      serious: 3,
      moderate: 2,
      minor: 1,
    };
    
    let weightedViolations = 0;
    violations.forEach(violation => {
      weightedViolations += impactWeights[violation.impact] * violation.nodes;
    });
    
    // Calculate score (higher violations = lower score)
    const maxScore = 100;
    const baseDeduction = 5;
    const score = Math.max(0, maxScore - (baseDeduction * weightedViolations));
    
    return Math.round(score);
  }
  
  private extractWCAGCriteria(tags: string[]): string[] {
    return tags.filter(tag => 
      tag.startsWith('wcag2a') || 
      tag.startsWith('wcag2aa') || 
      tag.startsWith('wcag2aaa')
    );
  }
}
