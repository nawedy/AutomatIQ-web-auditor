// lib/services/mock-cross-browser-analyzer.ts
// Mock implementation of the cross-browser analyzer for server-side rendering

import { BaseAnalyzer } from './base-analyzer';

// Export all the types that would be used by importing modules
export interface CrossBrowserAnalysisResult {
  score: number;
  browserCompatibility: BrowserCompatibilityResult;
  visualConsistency: VisualConsistencyResult;
  featureCompatibility: FeatureCompatibilityResult;
  responsiveConsistency: ResponsiveConsistencyResult;
  issues: string[];
}

export interface BrowserCompatibilityResult {
  browserResults: any[];
  issues: string[];
  score: number;
}

export interface VisualConsistencyResult {
  comparisonResults: any[];
  issues: string[];
  score: number;
}

export interface FeatureCompatibilityResult {
  featureResults: any[];
  issues: string[];
  score: number;
}

export interface ResponsiveConsistencyResult {
  responsiveResults: any[];
  issues: string[];
  score: number;
}

// Mock implementation of the AdvancedCrossBrowserAnalyzer
export class AdvancedCrossBrowserAnalyzer extends BaseAnalyzer {
  // Browser configurations to test (matching the real implementation)
  private browserConfigs = [
    {
      name: 'Chrome',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    {
      name: 'Firefox',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    },
    {
      name: 'Safari',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    },
    {
      name: 'Edge',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    },
  ];
  
  // Viewport sizes to test (matching the real implementation)
  private viewportSizes = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1366, height: 768, name: 'Laptop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 812, name: 'Mobile' },
  ];

  // Mock implementation that returns placeholder data
  async analyze(url: string): Promise<CrossBrowserAnalysisResult> {
    // Generate mock browser compatibility data
    const browserCompatibility = await this.testBrowserCompatibility(null, url);
    
    // Generate mock visual consistency data
    const visualConsistency = await this.testVisualConsistency(null, url);
    
    // Generate mock feature compatibility data
    const featureCompatibility = await this.testFeatureCompatibility(null, url);
    
    // Generate mock responsive consistency data
    const responsiveConsistency = await this.testResponsiveConsistency(null, url);
    
    // Calculate overall score
    const score = this.calculateWeightedScore([
      { score: browserCompatibility.score, weight: 2.5 },
      { score: visualConsistency.score, weight: 2.0 },
      { score: featureCompatibility.score, weight: 2.5 },
      { score: responsiveConsistency.score, weight: 3.0 },
    ]);
    
    // Return mock data
    return {
      score,
      browserCompatibility,
      visualConsistency,
      featureCompatibility,
      responsiveConsistency,
      issues: [],
    };
  }

  // Helper method to calculate weighted score
  protected calculateWeightedScore(scores: Array<{score: number, weight: number}>): number {
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
    return Math.round(weightedSum / totalWeight);
  }

  // Mock implementation of browser compatibility testing
  async testBrowserCompatibility(browser: any, url: string): Promise<BrowserCompatibilityResult> {
    // Generate mock browser results
    const browserResults = this.browserConfigs.map(config => ({
      browser: config.name,
      userAgent: config.userAgent,
      issues: [],
      score: Math.floor(Math.random() * 15) + 85, // Random score between 85-100
      screenshot: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`, // 1x1 transparent PNG
    }));
    
    // Calculate average score
    const totalScore = browserResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / browserResults.length);
    
    return {
      browserResults,
      issues: [],
      score,
    };
  }

  // Mock implementation of visual consistency testing
  async testVisualConsistency(browser: any, url: string): Promise<VisualConsistencyResult> {
    // Generate mock comparison results
    const comparisonResults = [];
    for (let i = 0; i < this.browserConfigs.length - 1; i++) {
      for (let j = i + 1; j < this.browserConfigs.length; j++) {
        comparisonResults.push({
          browser1: this.browserConfigs[i].name,
          browser2: this.browserConfigs[j].name,
          similarity: Math.floor(Math.random() * 10) + 90, // Random similarity between 90-100%
          diffImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
          issues: [],
        });
      }
    }
    
    // Calculate average similarity
    const totalSimilarity = comparisonResults.reduce((sum, result) => sum + result.similarity, 0);
    const avgSimilarity = totalSimilarity / comparisonResults.length;
    
    // Convert to score (90% similarity = 90 score)
    const score = Math.round(avgSimilarity);
    
    return {
      comparisonResults,
      issues: [],
      score,
    };
  }

  // Mock implementation of feature compatibility testing
  async testFeatureCompatibility(browser: any, url: string): Promise<FeatureCompatibilityResult> {
    // List of features to test
    const features = [
      'CSS Grid',
      'Flexbox',
      'WebP',
      'WebGL',
      'ES6 Features',
      'CSS Variables',
      'Service Workers',
      'Web Components',
    ];
    
    // Generate mock feature results for each browser
    const featureResults = this.browserConfigs.map(config => ({
      browser: config.name,
      features: features.map(feature => ({
        name: feature,
        supported: Math.random() > 0.1, // 90% chance of being supported
        issues: [],
      })),
      score: Math.floor(Math.random() * 15) + 85, // Random score between 85-100
    }));
    
    // Calculate average score
    const totalScore = featureResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / featureResults.length);
    
    return {
      featureResults,
      issues: [],
      score,
    };
  }

  // Mock implementation of responsive consistency testing
  async testResponsiveConsistency(browser: any, url: string): Promise<ResponsiveConsistencyResult> {
    // Generate mock responsive results for each browser
    const responsiveResults = this.browserConfigs.map(config => {
      const viewportTests = this.viewportSizes.map(viewport => ({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        issues: [],
        screenshot: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
      }));
      
      return {
        browser: config.name,
        viewportTests,
        score: Math.floor(Math.random() * 15) + 85, // Random score between 85-100
      };
    });
    
    // Calculate average score
    const totalScore = responsiveResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / responsiveResults.length);
    
    return {
      responsiveResults,
      issues: [],
      score,
    };
  }
  
  // Mock the analyzeCrossBrowserCompatibility method that might be used elsewhere
  async analyzeCrossBrowserCompatibility(url: string): Promise<CrossBrowserAnalysisResult> {
    return this.analyze(url);
  }
}
