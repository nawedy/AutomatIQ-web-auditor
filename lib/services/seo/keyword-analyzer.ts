// src/lib/services/seo/keyword-analyzer.ts
// Analyzer for keyword usage and optimization in SEO audits

import * as cheerio from 'cheerio';
import { KeywordAnalysis } from '@/lib/types/advanced-audit';

export class KeywordAnalyzer {
  analyze($: cheerio.CheerioAPI, url: string, primaryKeyword?: string): KeywordAnalysis {
    const issues: string[] = [];
    
    // Extract text content from the page
    const pageText = this.getTextContent($);
    const wordCount = this.countWords(pageText);
    
    // Get title, description, and h1 content
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text().trim();
    
    // If no primary keyword is provided, try to extract one
    if (!primaryKeyword) {
      primaryKeyword = this.extractPrimaryKeyword(title, description, h1);
    }
    
    // Calculate keyword density if we have a primary keyword
    let primaryKeywordDensity: number | undefined;
    let titleContainsKeyword = false;
    let descriptionContainsKeyword = false;
    let h1ContainsKeyword = false;
    let urlContainsKeyword = false;
    
    if (primaryKeyword) {
      // Count keyword occurrences (case insensitive)
      const keywordRegex = new RegExp(this.escapeRegExp(primaryKeyword), 'gi');
      const keywordMatches = pageText.match(keywordRegex) || [];
      primaryKeywordDensity = wordCount > 0 ? (keywordMatches.length / wordCount) * 100 : 0;
      
      // Check if keyword is in important elements
      titleContainsKeyword = title.toLowerCase().includes(primaryKeyword.toLowerCase());
      descriptionContainsKeyword = description.toLowerCase().includes(primaryKeyword.toLowerCase());
      h1ContainsKeyword = h1.toLowerCase().includes(primaryKeyword.toLowerCase());
      urlContainsKeyword = url.toLowerCase().includes(primaryKeyword.toLowerCase());
      
      // Add issues based on keyword usage
      if (!titleContainsKeyword) {
        issues.push('Primary keyword not found in page title');
      }
      
      if (!descriptionContainsKeyword) {
        issues.push('Primary keyword not found in meta description');
      }
      
      if (!h1ContainsKeyword) {
        issues.push('Primary keyword not found in H1 heading');
      }
      
      if (!urlContainsKeyword) {
        issues.push('Primary keyword not found in URL');
      }
      
      // Check keyword density
      if (primaryKeywordDensity > 3) {
        issues.push('Keyword density is too high (potential keyword stuffing)');
      } else if (primaryKeywordDensity < 0.5 && wordCount > 300) {
        issues.push('Keyword density is too low');
      }
    } else {
      issues.push('No primary keyword could be identified');
    }
    
    // Extract secondary keywords
    const secondaryKeywords = this.extractSecondaryKeywords(pageText, primaryKeyword);
    
    // Calculate score based on issues
    const maxScore = 100;
    const deductionPerIssue = 15;
    const score = Math.max(0, maxScore - (issues.length * deductionPerIssue));
    
    return {
      primaryKeyword,
      primaryKeywordDensity,
      secondaryKeywords,
      titleContainsKeyword,
      descriptionContainsKeyword,
      h1ContainsKeyword,
      urlContainsKeyword,
      issues,
      score,
    };
  }
  
  private getTextContent($: cheerio.CheerioAPI): string {
    // Remove script and style elements
    $('script, style').remove();
    
    // Get text content
    return $('body').text().replace(/\s+/g, ' ').trim();
  }
  
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
  
  private extractPrimaryKeyword(title: string, description: string, h1: string): string | undefined {
    // Simple algorithm to extract primary keyword from title, description and h1
    // In a real implementation, this would use NLP techniques
    
    // Combine all text
    const combinedText = `${title} ${description} ${h1}`.toLowerCase();
    
    // Remove common stop words
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'is', 'are', 'was', 'were'];
    
    // Split into words and count frequencies
    const words = combinedText.split(/\s+/).filter(Boolean);
    const wordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length > 2 && !stopWords.includes(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    }
    
    // Find the most frequent word
    let maxFreq = 0;
    let primaryKeyword: string | undefined;
    
    for (const [word, freq] of Object.entries(wordFrequency)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        primaryKeyword = word;
      }
    }
    
    return primaryKeyword;
  }
  
  private extractSecondaryKeywords(text: string, primaryKeyword?: string): Array<{ keyword: string; density: number }> {
    // Simple algorithm to extract secondary keywords
    // In a real implementation, this would use NLP techniques
    
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'is', 'are', 'was', 'were'];
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Count word frequencies
    const wordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length > 3 && !stopWords.includes(word) && (!primaryKeyword || word !== primaryKeyword.toLowerCase())) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    }
    
    // Convert to array and sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .map(([keyword, count]) => ({
        keyword,
        density: (count / wordCount) * 100
      }))
      .sort((a, b) => b.density - a.density);
    
    // Return top 5 secondary keywords
    return sortedWords.slice(0, 5);
  }
  
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
