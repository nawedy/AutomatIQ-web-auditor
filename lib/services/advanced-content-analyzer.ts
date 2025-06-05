// src/lib/services/advanced-content-analyzer.ts
// Advanced content quality analyzer service using NLP techniques

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseAnalyzer } from './base-analyzer';
import { ReadabilityAnalyzer } from './content/readability-analyzer';
import { GrammarAnalyzer } from './content/grammar-analyzer';
import { ContentStructureAnalyzer } from './content/structure-analyzer';
import { ContentQualityAnalysisResult } from '../types/advanced-audit';

export class AdvancedContentAnalyzer extends BaseAnalyzer {
  private readabilityAnalyzer: ReadabilityAnalyzer;
  private grammarAnalyzer: GrammarAnalyzer;
  private structureAnalyzer: ContentStructureAnalyzer;
  
  constructor() {
    super();
    this.readabilityAnalyzer = new ReadabilityAnalyzer();
    this.grammarAnalyzer = new GrammarAnalyzer();
    this.structureAnalyzer = new ContentStructureAnalyzer();
  }
  
  async analyze(url: string): Promise<ContentQualityAnalysisResult> {
    try {
      // Fetch the HTML content
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 30000,
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Extract main content text
      const mainContent = this.extractMainContent($);
      
      // Analyze readability
      const readabilityAnalysis = this.readabilityAnalyzer.analyze(mainContent);
      
      // Analyze grammar and spelling
      const grammarAnalysis = this.grammarAnalyzer.analyze(mainContent);
      
      // Analyze content structure
      const structureAnalysis = this.structureAnalyzer.analyze(html);
      
      // Analyze content relevance (placeholder for future implementation)
      const relevanceAnalysis = this.analyzeContentRelevance($);
      
      // Analyze content freshness (placeholder for future implementation)
      const freshnessAnalysis = this.analyzeContentFreshness($);
      
      // Analyze content engagement (placeholder for future implementation)
      const engagementAnalysis = this.analyzeContentEngagement($);
      
      // Calculate overall score
      const score = this.calculateWeightedScore([
        { score: readabilityAnalysis.score, weight: 2.0 },
        { score: grammarAnalysis.score, weight: 1.5 },
        { score: structureAnalysis.score, weight: 2.0 },
        { score: relevanceAnalysis.score, weight: 1.5 },
        { score: freshnessAnalysis.score, weight: 1.0 },
        { score: engagementAnalysis.score, weight: 1.0 },
      ]);
      
      // Combine all issues
      const issues = [
        ...readabilityAnalysis.issues,
        ...grammarAnalysis.issues,
        ...structureAnalysis.issues,
        ...relevanceAnalysis.issues,
        ...freshnessAnalysis.issues,
        ...engagementAnalysis.issues,
      ];
      
      return {
        score,
        readability: readabilityAnalysis,
        grammar: grammarAnalysis,
        structure: structureAnalysis,
        relevance: relevanceAnalysis,
        freshness: freshnessAnalysis,
        engagement: engagementAnalysis,
        issues,
      };
    } catch (error) {
      console.error('Error in content quality analysis:', error);
      throw new Error(`Content quality analysis failed: ${(error as Error).message}`);
    }
  }
  
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find main content area using common selectors
    const contentSelectors = [
      'main',
      'article',
      '#content',
      '.content',
      '#main',
      '.main',
      '.post-content',
      '.entry-content',
      '.article-content',
    ];
    
    let mainContentElement: cheerio.Cheerio<cheerio.Element> | null = null;
    
    // Try each selector until we find content
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContentElement = element;
        break;
      }
    }
    
    // If no content found with selectors, use body as fallback
    if (!mainContentElement || mainContentElement.length === 0) {
      mainContentElement = $('body');
    }
    
    // Remove non-content elements
    mainContentElement.find('nav, header, footer, aside, script, style, .comments, #comments, .sidebar, .widget, .ad, .advertisement').remove();
    
    // Get text content
    return mainContentElement.text().trim();
  }
  
  private analyzeContentRelevance($: cheerio.CheerioAPI): {
    keywordDensity: number;
    topicConsistency: boolean;
    issues: string[];
    score: number;
  } {
    // This is a placeholder for future implementation
    // In a real implementation, this would analyze content relevance using NLP
    
    return {
      keywordDensity: 2.5, // Placeholder value
      topicConsistency: true, // Placeholder value
      issues: [],
      score: 85, // Placeholder score
    };
  }
  
  private analyzeContentFreshness($: cheerio.CheerioAPI): {
    hasPublishDate: boolean;
    hasUpdateDate: boolean;
    isRecent: boolean;
    issues: string[];
    score: number;
  } {
    // Look for publish date
    const publishDateSelectors = [
      'meta[property="article:published_time"]',
      'time[datetime]',
      '.published-date',
      '.post-date',
      '.entry-date',
      '.date',
    ];
    
    let publishDate: Date | null = null;
    
    // Try each selector until we find a date
    for (const selector of publishDateSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const dateStr = element.attr('content') || element.attr('datetime') || element.text();
        if (dateStr) {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            publishDate = parsedDate;
            break;
          }
        }
      }
    }
    
    // Look for update date
    const updateDateSelectors = [
      'meta[property="article:modified_time"]',
      '.updated-date',
      '.modified-date',
      '.update-date',
    ];
    
    let updateDate: Date | null = null;
    
    // Try each selector until we find a date
    for (const selector of updateDateSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const dateStr = element.attr('content') || element.attr('datetime') || element.text();
        if (dateStr) {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            updateDate = parsedDate;
            break;
          }
        }
      }
    }
    
    const hasPublishDate = publishDate !== null;
    const hasUpdateDate = updateDate !== null;
    
    // Check if content is recent (within the last year)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const latestDate = updateDate || publishDate;
    const isRecent = latestDate ? latestDate > oneYearAgo : false;
    
    const issues: string[] = [];
    
    if (!hasPublishDate) {
      issues.push('No publish date found, consider adding one for better user experience');
    }
    
    if (!isRecent && latestDate) {
      issues.push('Content may be outdated (older than one year), consider updating');
    }
    
    // Calculate score
    let score = 100;
    
    if (!hasPublishDate) {
      score -= 20;
    }
    
    if (!isRecent && latestDate) {
      score -= 30;
    }
    
    if (!hasUpdateDate && hasPublishDate && !isRecent) {
      score -= 15;
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      hasPublishDate,
      hasUpdateDate,
      isRecent,
      issues,
      score,
    };
  }
  
  private analyzeContentEngagement($: cheerio.CheerioAPI): {
    hasImages: boolean;
    hasVideos: boolean;
    hasInteractiveElements: boolean;
    mediaCount: number;
    issues: string[];
    score: number;
  } {
    // Count images
    const images = $('img').filter((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      const width = $(el).attr('width');
      const height = $(el).attr('height');
      
      // Filter out tiny images and icons
      return src && 
             (!width || parseInt(width) > 100) && 
             (!height || parseInt(height) > 100);
    });
    
    // Count videos
    const videos = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"], .video-container');
    
    // Check for interactive elements
    const interactiveElements = $('button, .button, [role="button"], details, summary, .accordion, .tabs, .interactive, [data-interactive], form, input, select, textarea');
    
    const hasImages = images.length > 0;
    const hasVideos = videos.length > 0;
    const hasInteractiveElements = interactiveElements.length > 0;
    const mediaCount = images.length + videos.length;
    
    const issues: string[] = [];
    
    // Check for issues
    if (!hasImages && !hasVideos) {
      issues.push('No visual media found, consider adding images or videos to improve engagement');
    }
    
    if (images.length > 0) {
      // Check for missing alt text
      const imagesWithoutAlt = $('img').filter((_, el) => {
        const alt = $(el).attr('alt');
        return !alt || alt.trim() === '';
      });
      
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} image${imagesWithoutAlt.length !== 1 ? 's' : ''} missing alt text, add for accessibility`);
      }
    }
    
    // Calculate content length
    const contentLength = $('p').text().length;
    
    // Calculate media density (media per 1000 characters)
    const mediaDensity = contentLength > 0 ? (mediaCount * 1000) / contentLength : 0;
    
    if (contentLength > 3000 && mediaDensity < 1) {
      issues.push('Low media density for long content, consider adding more visual elements');
    }
    
    // Calculate score
    let score = 70; // Base score
    
    if (hasImages) {
      score += 10;
    }
    
    if (hasVideos) {
      score += 10;
    }
    
    if (hasInteractiveElements) {
      score += 10;
    }
    
    // Adjust score based on media density
    if (contentLength > 1000) {
      if (mediaDensity >= 2) {
        score += 10;
      } else if (mediaDensity >= 1) {
        score += 5;
      } else if (mediaDensity < 0.5) {
        score -= 10;
      }
    }
    
    // Deduct for issues
    score -= issues.length * 5;
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      hasImages,
      hasVideos,
      hasInteractiveElements,
      mediaCount,
      issues,
      score,
    };
  }
}
