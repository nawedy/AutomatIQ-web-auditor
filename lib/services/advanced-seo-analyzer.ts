// src/lib/services/advanced-seo-analyzer.ts
// Advanced SEO analyzer service that orchestrates all SEO analysis components

import * as cheerio from 'cheerio';
import axios from 'axios';
import { BaseAnalyzer } from './base-analyzer';
import { MetaTagsAnalyzer } from './seo/meta-tags-analyzer';
import { HeadingStructureAnalyzer } from './seo/heading-structure-analyzer';
import { KeywordAnalyzer } from './seo/keyword-analyzer';
import { LinkAnalyzer } from './seo/link-analyzer';
import { SEOAnalysisResult } from '../types/advanced-audit';

export class AdvancedSEOAnalyzer extends BaseAnalyzer {
  private metaTagsAnalyzer: MetaTagsAnalyzer;
  private headingStructureAnalyzer: HeadingStructureAnalyzer;
  private keywordAnalyzer: KeywordAnalyzer;
  private linkAnalyzer: LinkAnalyzer;
  
  constructor() {
    super();
    this.metaTagsAnalyzer = new MetaTagsAnalyzer();
    this.headingStructureAnalyzer = new HeadingStructureAnalyzer();
    this.keywordAnalyzer = new KeywordAnalyzer();
    this.linkAnalyzer = new LinkAnalyzer();
  }
  
  async analyze(url: string, options?: { primaryKeyword?: string }): Promise<SEOAnalysisResult> {
    try {
      // Fetch the page HTML
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'AutomatIQ-Website-Auditor/1.0',
        },
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Run individual analyzers
      const metaTags = this.metaTagsAnalyzer.analyze($);
      const headings = this.headingStructureAnalyzer.analyze($);
      const keywords = this.keywordAnalyzer.analyze($, url, options?.primaryKeyword);
      const links = this.linkAnalyzer.analyze($, url);
      
      // Placeholder values for other analyses that would be implemented in full version
      const images = this.placeholderImageAnalysis();
      const schema = this.placeholderSchemaAnalysis($);
      const canonicalization = this.placeholderCanonicalAnalysis($, url);
      const socialTags = this.placeholderSocialTagsAnalysis($);
      const indexability = this.placeholderIndexabilityAnalysis($);
      const technicalSeo = this.placeholderTechnicalSEOAnalysis(url);
      
      // Calculate overall SEO score
      const score = this.calculateWeightedScore([
        { score: metaTags.score, weight: 1.5 },
        { score: headings.score, weight: 1.2 },
        { score: keywords.score, weight: 1.5 },
        { score: links.score, weight: 1.2 },
        { score: images.score, weight: 1 },
        { score: schema.score, weight: 1 },
        { score: canonicalization.score, weight: 1 },
        { score: socialTags.score, weight: 0.8 },
        { score: indexability.score, weight: 1.3 },
        { score: technicalSeo.score, weight: 1.5 },
      ]);
      
      return {
        score,
        metaTags,
        headings,
        keywords,
        links,
        images,
        schema,
        canonicalization,
        socialTags,
        indexability,
        technicalSeo,
      };
    } catch (error) {
      console.error('Error in SEO analysis:', error);
      throw new Error(`SEO analysis failed: ${(error as Error).message}`);
    }
  }
  
  // Placeholder methods for components that would be fully implemented in production
  private placeholderImageAnalysis() {
    return {
      totalImages: 0,
      missingAlt: 0,
      largeImages: 0,
      imageDetails: [],
      issues: ['Image analysis not implemented yet'],
      score: 50,
    };
  }
  
  private placeholderSchemaAnalysis($: cheerio.CheerioAPI) {
    const hasSchema = $('script[type="application/ld+json"]').length > 0;
    
    return {
      hasSchema,
      schemaTypes: hasSchema ? ['Unknown'] : [],
      isValid: hasSchema,
      issues: hasSchema ? [] : ['No schema markup found'],
      score: hasSchema ? 80 : 40,
    };
  }
  
  private placeholderCanonicalAnalysis($: cheerio.CheerioAPI, url: string) {
    const canonicalUrl = $('link[rel="canonical"]').attr('href');
    const hasCanonical = !!canonicalUrl;
    const isSelf = canonicalUrl === url;
    
    return {
      hasCanonical,
      canonicalUrl,
      isSelf,
      issues: hasCanonical ? [] : ['Missing canonical URL'],
      score: hasCanonical ? 100 : 50,
    };
  }
  
  private placeholderSocialTagsAnalysis($: cheerio.CheerioAPI) {
    const hasOpenGraph = $('meta[property^="og:"]').length > 0;
    const hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
    
    const openGraphTags: Record<string, string> = {};
    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr('property')?.replace('og:', '') || '';
      const content = $(el).attr('content') || '';
      if (property && content) {
        openGraphTags[property] = content;
      }
    });
    
    const twitterCardTags: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((i, el) => {
      const name = $(el).attr('name')?.replace('twitter:', '') || '';
      const content = $(el).attr('content') || '';
      if (name && content) {
        twitterCardTags[name] = content;
      }
    });
    
    const issues = [];
    if (!hasOpenGraph) issues.push('No Open Graph tags found');
    if (!hasTwitterCards) issues.push('No Twitter Card tags found');
    
    return {
      hasOpenGraph,
      hasTwitterCards,
      openGraphTags,
      twitterCardTags,
      issues,
      score: (hasOpenGraph && hasTwitterCards) ? 100 : (hasOpenGraph || hasTwitterCards) ? 70 : 40,
    };
  }
  
  private placeholderIndexabilityAnalysis($: cheerio.CheerioAPI) {
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    const hasNoIndex = robotsMeta.includes('noindex');
    
    return {
      isIndexable: !hasNoIndex,
      robotsTxt: {
        exists: true,
        content: 'Not checked',
        blocks: false,
      },
      metaRobots: {
        exists: !!robotsMeta,
        content: robotsMeta,
        blocks: hasNoIndex,
      },
      issues: hasNoIndex ? ['Page is set to noindex'] : [],
      score: hasNoIndex ? 50 : 100,
    };
  }
  
  private placeholderTechnicalSEOAnalysis(url: string) {
    return {
      hasSitemap: true,
      sitemapUrl: `${new URL(url).origin}/sitemap.xml`,
      hasStructuredData: false,
      hasHreflang: false,
      hasBreadcrumbs: false,
      pageSpeed: {
        score: 70,
        issues: ['Page speed analysis not fully implemented'],
      },
      mobileCompatibility: {
        isCompatible: true,
        issues: [],
      },
      issues: ['Technical SEO analysis not fully implemented'],
      score: 70,
    };
  }
}
