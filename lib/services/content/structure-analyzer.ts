// src/lib/services/content/structure-analyzer.ts
// Analyzer for content structure and organization

import * as cheerio from 'cheerio';
import { ContentStructureAnalysis } from '@/lib/types/advanced-audit';

export class ContentStructureAnalyzer {
  analyze(html: string): ContentStructureAnalysis {
    const $ = cheerio.load(html);
    const issues: string[] = [];
    
    // Check for proper heading structure
    const headingStructure = this.analyzeHeadingStructure($);
    
    // Check for proper paragraph structure
    const paragraphStructure = this.analyzeParagraphStructure($);
    
    // Check for proper list usage
    const listStructure = this.analyzeListStructure($);
    
    // Check for proper section breaks
    const sectionStructure = this.analyzeSectionStructure($);
    
    // Check for proper content organization
    const contentOrganization = this.analyzeContentOrganization($);
    
    // Combine all issues
    issues.push(...headingStructure.issues);
    issues.push(...paragraphStructure.issues);
    issues.push(...listStructure.issues);
    issues.push(...sectionStructure.issues);
    issues.push(...contentOrganization.issues);
    
    // Calculate overall score
    const score = this.calculateOverallScore([
      { score: headingStructure.score, weight: 2.5 },
      { score: paragraphStructure.score, weight: 2.0 },
      { score: listStructure.score, weight: 1.5 },
      { score: sectionStructure.score, weight: 2.0 },
      { score: contentOrganization.score, weight: 2.0 },
    ]);
    
    return {
      headingStructure,
      paragraphStructure,
      listStructure,
      sectionStructure,
      contentOrganization,
      issues,
      score,
    };
  }
  
  private analyzeHeadingStructure($: cheerio.CheerioAPI): {
    hasProperHierarchy: boolean;
    headingCount: Record<string, number>;
    issues: string[];
    score: number;
  } {
    const headings = $('h1, h2, h3, h4, h5, h6');
    const headingCount: Record<string, number> = {
      h1: 0,
      h2: 0,
      h3: 0,
      h4: 0,
      h5: 0,
      h6: 0,
    };
    
    const issues: string[] = [];
    let hasProperHierarchy = true;
    let lastHeadingLevel = 0;
    
    // Count headings and check hierarchy
    headings.each((_, element) => {
      const tagName = element.tagName.toLowerCase();
      headingCount[tagName]++;
      
      const currentLevel = parseInt(tagName.substring(1), 10);
      
      // Check if heading level jumps (e.g., h2 to h4 without h3)
      if (lastHeadingLevel > 0 && currentLevel > lastHeadingLevel + 1) {
        hasProperHierarchy = false;
        issues.push(`Heading hierarchy skips from h${lastHeadingLevel} to h${currentLevel}`);
      }
      
      lastHeadingLevel = currentLevel;
    });
    
    // Check for multiple h1 tags
    if (headingCount.h1 > 1) {
      issues.push(`Multiple h1 tags found (${headingCount.h1}), should have only one for SEO`);
    }
    
    // Check for missing h1
    if (headingCount.h1 === 0) {
      issues.push('No h1 tag found, main heading is missing');
    }
    
    // Check for too many headings
    const totalHeadings = Object.values(headingCount).reduce((sum, count) => sum + count, 0);
    if (totalHeadings > 20) {
      issues.push(`Too many headings (${totalHeadings}), consider consolidating content`);
    }
    
    // Calculate score
    let score = 100;
    
    // Deduct for missing h1
    if (headingCount.h1 === 0) {
      score -= 30;
    }
    
    // Deduct for multiple h1
    if (headingCount.h1 > 1) {
      score -= 20;
    }
    
    // Deduct for improper hierarchy
    if (!hasProperHierarchy) {
      score -= 25;
    }
    
    // Deduct for too many headings
    if (totalHeadings > 20) {
      score -= 15;
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      hasProperHierarchy,
      headingCount,
      issues,
      score,
    };
  }
  
  private analyzeParagraphStructure($: cheerio.CheerioAPI): {
    averageParagraphLength: number;
    longParagraphs: number;
    shortParagraphs: number;
    issues: string[];
    score: number;
  } {
    const paragraphs = $('p');
    const issues: string[] = [];
    
    let totalLength = 0;
    let longParagraphs = 0;
    let shortParagraphs = 0;
    
    paragraphs.each((_, element) => {
      const text = $(element).text().trim();
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      
      totalLength += wordCount;
      
      // Check for long paragraphs (more than 150 words)
      if (wordCount > 150) {
        longParagraphs++;
      }
      
      // Check for very short paragraphs (less than 20 words)
      if (wordCount < 20 && wordCount > 0) {
        shortParagraphs++;
      }
    });
    
    const paragraphCount = paragraphs.length;
    const averageParagraphLength = paragraphCount > 0 ? totalLength / paragraphCount : 0;
    
    // Check for issues
    if (longParagraphs > 0) {
      issues.push(`${longParagraphs} paragraph${longParagraphs !== 1 ? 's' : ''} exceed 150 words, consider breaking them up`);
    }
    
    if (shortParagraphs > paragraphCount * 0.5 && paragraphCount > 5) {
      issues.push('Too many short paragraphs, consider combining related ideas');
    }
    
    if (averageParagraphLength > 100) {
      issues.push(`Average paragraph length (${Math.round(averageParagraphLength)} words) is too long, aim for 40-80 words`);
    }
    
    // Calculate score
    let score = 100;
    
    // Deduct for long paragraphs
    if (paragraphCount > 0) {
      score -= Math.min(30, (longParagraphs / paragraphCount) * 100);
    }
    
    // Deduct for too many short paragraphs
    if (paragraphCount > 5 && shortParagraphs > paragraphCount * 0.5) {
      score -= 15;
    }
    
    // Deduct for average paragraph length being too long
    if (averageParagraphLength > 100) {
      score -= Math.min(25, (averageParagraphLength - 100) / 2);
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      averageParagraphLength,
      longParagraphs,
      shortParagraphs,
      issues,
      score,
    };
  }
  
  private analyzeListStructure($: cheerio.CheerioAPI): {
    listCount: number;
    properlyFormatted: boolean;
    issues: string[];
    score: number;
  } {
    const lists = $('ul, ol');
    const issues: string[] = [];
    let improperlyFormattedLists = 0;
    
    lists.each((_, element) => {
      const listItems = $(element).find('li');
      
      // Check if list has items
      if (listItems.length === 0) {
        improperlyFormattedLists++;
        issues.push('Empty list found');
      }
      
      // Check if list items have proper structure
      if (listItems.length === 1) {
        improperlyFormattedLists++;
        issues.push('List with only one item found, consider using a paragraph instead');
      }
      
      // Check if list items are too long
      let longItemsCount = 0;
      listItems.each((_, li) => {
        const text = $(li).text().trim();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        if (wordCount > 50) {
          longItemsCount++;
        }
      });
      
      if (longItemsCount > listItems.length * 0.5 && listItems.length > 3) {
        improperlyFormattedLists++;
        issues.push('List contains many long items, consider restructuring');
      }
    });
    
    const listCount = lists.length;
    const properlyFormatted = improperlyFormattedLists === 0;
    
    // Check for manual lists (numbered paragraphs)
    const paragraphs = $('p');
    let manualListCount = 0;
    
    paragraphs.each((i, element) => {
      const text = $(element).text().trim();
      
      // Check for numbered paragraphs (1., 2., etc.)
      if (/^\d+\.\s/.test(text) && i > 0) {
        const prevText = $(paragraphs[i - 1]).text().trim();
        if (/^\d+\.\s/.test(prevText)) {
          manualListCount++;
        }
      }
    });
    
    if (manualListCount > 0) {
      issues.push(`${manualListCount} manually numbered paragraphs found, consider using proper ordered lists (<ol>)`);
    }
    
    // Calculate score
    let score = 100;
    
    // Deduct for improperly formatted lists
    if (listCount > 0) {
      score -= Math.min(50, (improperlyFormattedLists / listCount) * 100);
    }
    
    // Deduct for manual lists
    if (manualListCount > 0) {
      score -= Math.min(30, manualListCount * 10);
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      listCount,
      properlyFormatted,
      issues,
      score,
    };
  }
  
  private analyzeSectionStructure($: cheerio.CheerioAPI): {
    sectionCount: number;
    wellStructured: boolean;
    issues: string[];
    score: number;
  } {
    // Look for semantic section elements
    const sections = $('section, article, div[class*="section"], div[id*="section"]');
    const issues: string[] = [];
    let poorlyStructuredSections = 0;
    
    // Count sections with proper structure (heading followed by content)
    sections.each((_, element) => {
      const hasHeading = $(element).find('h1, h2, h3, h4, h5, h6').length > 0;
      const hasContent = $(element).find('p, ul, ol, table, img').length > 0;
      
      if (!hasHeading && hasContent) {
        poorlyStructuredSections++;
        issues.push('Section without heading found');
      }
      
      if (hasHeading && !hasContent) {
        poorlyStructuredSections++;
        issues.push('Heading without content found');
      }
    });
    
    const sectionCount = sections.length;
    const wellStructured = poorlyStructuredSections === 0;
    
    // Check for content not in sections
    const orphanedParagraphs = $('body > p').length;
    if (orphanedParagraphs > 3 && sectionCount > 0) {
      issues.push(`${orphanedParagraphs} paragraphs found outside of sections, consider organizing content better`);
    }
    
    // Calculate score
    let score = 100;
    
    // Deduct for poorly structured sections
    if (sectionCount > 0) {
      score -= Math.min(50, (poorlyStructuredSections / sectionCount) * 100);
    }
    
    // Deduct for orphaned paragraphs
    if (orphanedParagraphs > 3 && sectionCount > 0) {
      score -= Math.min(30, orphanedParagraphs * 5);
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      sectionCount,
      wellStructured,
      issues,
      score,
    };
  }
  
  private analyzeContentOrganization($: cheerio.CheerioAPI): {
    hasIntroduction: boolean;
    hasConclusion: boolean;
    logicalFlow: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    
    // Check for introduction (first paragraph or section)
    const firstParagraph = $('p').first();
    const hasIntroduction = firstParagraph.length > 0 && 
                           firstParagraph.text().trim().length > 50;
    
    if (!hasIntroduction) {
      issues.push('No clear introduction found, consider adding one');
    }
    
    // Check for conclusion (last paragraph or section)
    const lastParagraph = $('p').last();
    const hasConclusion = lastParagraph.length > 0 && 
                         lastParagraph.text().trim().length > 50 &&
                         lastParagraph.text() !== firstParagraph.text();
    
    if (!hasConclusion) {
      issues.push('No clear conclusion found, consider adding one');
    }
    
    // Check for logical flow using transition words
    const paragraphs = $('p');
    let transitionWordsCount = 0;
    
    const transitionWords = [
      'additionally', 'consequently', 'furthermore', 'however', 'moreover',
      'nevertheless', 'therefore', 'thus', 'in conclusion', 'in summary',
      'first', 'second', 'third', 'finally', 'lastly', 'next', 'then',
      'in addition', 'as a result', 'for example', 'for instance',
      'in contrast', 'on the other hand', 'similarly', 'in fact',
    ];
    
    paragraphs.each((_, element) => {
      const text = $(element).text().toLowerCase();
      
      for (const word of transitionWords) {
        if (text.includes(word)) {
          transitionWordsCount++;
          break; // Count only once per paragraph
        }
      }
    });
    
    const logicalFlow = paragraphs.length > 3 ? 
                       transitionWordsCount >= paragraphs.length * 0.25 : 
                       true;
    
    if (!logicalFlow && paragraphs.length > 3) {
      issues.push('Few transition words found, consider improving content flow');
    }
    
    // Calculate score
    let score = 100;
    
    // Deduct for missing introduction
    if (!hasIntroduction) {
      score -= 25;
    }
    
    // Deduct for missing conclusion
    if (!hasConclusion) {
      score -= 25;
    }
    
    // Deduct for poor logical flow
    if (!logicalFlow && paragraphs.length > 3) {
      score -= 20;
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      hasIntroduction,
      hasConclusion,
      logicalFlow,
      issues,
      score,
    };
  }
  
  private calculateOverallScore(scores: Array<{ score: number; weight: number }>): number {
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
    
    return Math.round(weightedSum / totalWeight);
  }
}
