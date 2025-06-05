// src/lib/services/seo/meta-tags-analyzer.ts
// Analyzer for meta tags in SEO audits

import * as cheerio from 'cheerio';
import { MetaTagsAnalysis } from '@/lib/types/advanced-audit';

export class MetaTagsAnalyzer {
  analyze($: cheerio.CheerioAPI): MetaTagsAnalysis {
    const issues: string[] = [];
    
    // Title analysis
    const title = $('title').text().trim();
    const titleExists = title.length > 0;
    const titleLength = title.length;
    
    if (!titleExists) {
      issues.push('Missing page title');
    } else if (titleLength < 10) {
      issues.push('Title is too short (less than 10 characters)');
    } else if (titleLength > 60) {
      issues.push('Title is too long (more than 60 characters)');
    }
    
    // Meta description analysis
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const descriptionExists = metaDescription.length > 0;
    const descriptionLength = metaDescription.length;
    
    if (!descriptionExists) {
      issues.push('Missing meta description');
    } else if (descriptionLength < 50) {
      issues.push('Meta description is too short (less than 50 characters)');
    } else if (descriptionLength > 160) {
      issues.push('Meta description is too long (more than 160 characters)');
    }
    
    // Robots meta tag analysis
    const robotsContent = $('meta[name="robots"]').attr('content') || '';
    const robotsExists = robotsContent.length > 0;
    
    if (robotsExists && (robotsContent.includes('noindex') || robotsContent.includes('none'))) {
      issues.push('Page is set to noindex, which prevents search engines from indexing it');
    }
    
    // Viewport meta tag analysis
    const viewportContent = $('meta[name="viewport"]').attr('content') || '';
    const viewportExists = viewportContent.length > 0;
    
    if (!viewportExists) {
      issues.push('Missing viewport meta tag for responsive design');
    }
    
    // Canonical URL analysis
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const canonicalExists = canonicalUrl.length > 0;
    
    if (!canonicalExists) {
      issues.push('Missing canonical URL tag');
    }
    
    // Calculate score based on issues
    const maxScore = 100;
    const deductionPerIssue = 20;
    const score = Math.max(0, maxScore - (issues.length * deductionPerIssue));
    
    return {
      title: {
        exists: titleExists,
        length: titleLength,
        content: title,
        issues: titleExists ? [] : ['Missing page title'],
      },
      description: {
        exists: descriptionExists,
        length: descriptionLength,
        content: metaDescription,
        issues: descriptionExists ? [] : ['Missing meta description'],
      },
      robots: {
        exists: robotsExists,
        content: robotsContent,
        issues: robotsExists && (robotsContent.includes('noindex') || robotsContent.includes('none')) 
          ? ['Page is set to noindex'] 
          : [],
      },
      viewport: {
        exists: viewportExists,
        content: viewportContent,
        issues: viewportExists ? [] : ['Missing viewport meta tag'],
      },
      canonical: {
        exists: canonicalExists,
        content: canonicalUrl,
        issues: canonicalExists ? [] : ['Missing canonical URL tag'],
      },
      score,
      issues,
    };
  }
}
