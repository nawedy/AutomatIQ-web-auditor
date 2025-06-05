// src/lib/services/seo/heading-structure-analyzer.ts
// Analyzer for heading structure in SEO audits

import * as cheerio from 'cheerio';
import { HeadingStructureAnalysis } from '@/lib/types/advanced-audit';

export class HeadingStructureAnalyzer {
  analyze($: cheerio.CheerioAPI): HeadingStructureAnalysis {
    const issues: string[] = [];
    const headings: Array<{ type: string; content: string; issues?: string[] }> = [];
    
    // Count headings by level
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    const h4Count = $('h4').length;
    const h5Count = $('h5').length;
    const h6Count = $('h6').length;
    
    // Check for proper H1 usage
    if (h1Count === 0) {
      issues.push('Missing H1 heading');
    } else if (h1Count > 1) {
      issues.push(`Multiple H1 headings (${h1Count}) found - should have only one`);
    }
    
    // Check for proper heading hierarchy
    if (h3Count > 0 && h2Count === 0) {
      issues.push('H3 headings found without H2 headings - improper hierarchy');
    }
    
    if (h4Count > 0 && h3Count === 0) {
      issues.push('H4 headings found without H3 headings - improper hierarchy');
    }
    
    // Analyze each heading
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const type = el.name;
      const content = $(el).text().trim();
      const headingIssues: string[] = [];
      
      // Check for empty headings
      if (content.length === 0) {
        headingIssues.push('Empty heading');
      } 
      // Check for very short headings
      else if (content.length < 3) {
        headingIssues.push('Heading is too short');
      } 
      // Check for very long headings
      else if ((type === 'h1' && content.length > 70) || 
               (type === 'h2' && content.length > 60) ||
               (type === 'h3' && content.length > 50)) {
        headingIssues.push('Heading is too long');
      }
      
      // Check for duplicate headings
      const duplicates = headings.filter(h => 
        h.type === type && h.content.toLowerCase() === content.toLowerCase()
      );
      
      if (duplicates.length > 0) {
        headingIssues.push('Duplicate heading');
      }
      
      headings.push({
        type,
        content,
        issues: headingIssues.length > 0 ? headingIssues : undefined
      });
    });
    
    // Determine if the overall structure is proper
    const hasProperStructure = 
      h1Count === 1 && 
      (h3Count === 0 || h2Count > 0) && 
      (h4Count === 0 || h3Count > 0) &&
      !headings.some(h => h.issues && h.issues.length > 0);
    
    // Calculate score based on issues
    const maxScore = 100;
    const deductionPerIssue = 15;
    const score = Math.max(0, maxScore - (issues.length * deductionPerIssue));
    
    return {
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      hasProperStructure,
      headings,
      issues,
      score,
    };
  }
}
