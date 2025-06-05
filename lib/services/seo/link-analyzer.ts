// src/lib/services/seo/link-analyzer.ts
// Analyzer for internal and external links in SEO audits

import * as cheerio from 'cheerio';
import { LinkAnalysis } from '@/lib/types/advanced-audit';

export class LinkAnalyzer {
  analyze($: cheerio.CheerioAPI, baseUrl: string): LinkAnalysis {
    const issues: string[] = [];
    const linkDetails: Array<{
      url: string;
      text: string;
      isInternal: boolean;
      isNoFollow: boolean;
      isBroken?: boolean;
    }> = [];
    
    // Extract domain from base URL
    const baseDomain = this.extractDomain(baseUrl);
    
    // Initialize counters
    let internalLinks = 0;
    let externalLinks = 0;
    let brokenLinks = 0;
    let noFollowLinks = 0;
    
    // Analyze all links
    $('a[href]').each((i, el) => {
      const $link = $(el);
      const href = $link.attr('href') || '';
      const text = $link.text().trim();
      const rel = $link.attr('rel') || '';
      
      // Skip empty, javascript, and anchor links
      if (!href || href.startsWith('javascript:') || href === '#') {
        return;
      }
      
      // Normalize URL
      const url = this.normalizeUrl(href, baseUrl);
      const isInternal = this.isInternalLink(url, baseDomain);
      const isNoFollow = rel.includes('nofollow');
      
      // Update counters
      if (isInternal) {
        internalLinks++;
      } else {
        externalLinks++;
      }
      
      if (isNoFollow) {
        noFollowLinks++;
      }
      
      // Add link details
      linkDetails.push({
        url,
        text: this.truncateString(text, 50),
        isInternal,
        isNoFollow,
      });
    });
    
    // Check for issues
    if (internalLinks === 0) {
      issues.push('No internal links found');
    }
    
    if (externalLinks === 0) {
      issues.push('No external links found');
    }
    
    // Check for empty link text
    const emptyTextLinks = linkDetails.filter(link => !link.text);
    if (emptyTextLinks.length > 0) {
      issues.push(`${emptyTextLinks.length} links have empty text`);
    }
    
    // Check for duplicate link text with different URLs
    const linkTextMap: Record<string, Set<string>> = {};
    for (const link of linkDetails) {
      if (link.text) {
        if (!linkTextMap[link.text]) {
          linkTextMap[link.text] = new Set();
        }
        linkTextMap[link.text].add(link.url);
      }
    }
    
    const duplicateLinkTexts = Object.entries(linkTextMap)
      .filter(([_, urls]) => urls.size > 1)
      .map(([text]) => text);
    
    if (duplicateLinkTexts.length > 0) {
      issues.push(`${duplicateLinkTexts.length} duplicate link texts pointing to different URLs`);
    }
    
    // Calculate score based on issues
    const maxScore = 100;
    const deductionPerIssue = 15;
    const score = Math.max(0, maxScore - (issues.length * deductionPerIssue));
    
    return {
      internalLinks,
      externalLinks,
      brokenLinks,
      noFollowLinks,
      linkDetails,
      issues,
      score,
    };
  }
  
  private normalizeUrl(href: string, baseUrl: string): string {
    try {
      // Handle relative URLs
      if (href.startsWith('/')) {
        const base = new URL(baseUrl);
        return `${base.protocol}//${base.host}${href}`;
      }
      
      // Handle URLs without protocol
      if (href.startsWith('//')) {
        const base = new URL(baseUrl);
        return `${base.protocol}${href}`;
      }
      
      // Handle relative URLs without leading slash
      if (!href.includes('://') && !href.startsWith('/')) {
        const base = new URL(baseUrl);
        const path = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
        return `${base.protocol}//${base.host}${path}${href}`;
      }
      
      return href;
    } catch (error) {
      return href;
    }
  }
  
  private isInternalLink(url: string, baseDomain: string): boolean {
    try {
      const urlDomain = this.extractDomain(url);
      return urlDomain === baseDomain || urlDomain === '';
    } catch (error) {
      return false;
    }
  }
  
  private extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      return '';
    }
  }
  
  private truncateString(str: string, maxLength: number): string {
    if (!str) return '';
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  }
}
