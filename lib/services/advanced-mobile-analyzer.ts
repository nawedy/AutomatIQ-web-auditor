// src/lib/services/advanced-mobile-analyzer.ts
// Advanced mobile UX analyzer service using Puppeteer for mobile device emulation

import puppeteer from 'puppeteer';
import { BaseAnalyzer } from './base-analyzer';
import { 
  MobileUXAnalysisResult,
  ViewportAnalysis,
  TouchTargetAnalysis,
  FontSizeAnalysis,
  TapableElementAnalysis,
  ResponsiveDesignAnalysis
} from '../types/advanced-audit';

export class AdvancedMobileAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<MobileUXAnalysisResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Create a new page with mobile device emulation
      const page = await browser.newPage();
      
      // Set mobile viewport
      await page.setViewport({
        width: 375, // iPhone X width
        height: 812, // iPhone X height
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      });
      
      // Set user agent to mobile
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Analyze viewport configuration
      const viewportAnalysis = await this.analyzeViewport(page);
      
      // Analyze touch targets
      const touchTargetAnalysis = await this.analyzeTouchTargets(page);
      
      // Analyze font sizes
      const fontSizeAnalysis = await this.analyzeFontSizes(page);
      
      // Analyze tapable elements spacing
      const tapableElementAnalysis = await this.analyzeTapableElements(page);
      
      // Analyze responsive design
      const responsiveDesignAnalysis = await this.analyzeResponsiveDesign(browser, url);
      
      // Calculate overall score
      const score = this.calculateWeightedScore([
        { score: viewportAnalysis.score, weight: 1.5 },
        { score: touchTargetAnalysis.score, weight: 2.0 },
        { score: fontSizeAnalysis.score, weight: 1.5 },
        { score: tapableElementAnalysis.score, weight: 1.5 },
        { score: responsiveDesignAnalysis.score, weight: 2.0 },
      ]);
      
      // Close the browser
      await browser.close();
      
      return {
        score,
        viewport: viewportAnalysis,
        touchTargets: touchTargetAnalysis,
        fontSizes: fontSizeAnalysis,
        tapableElements: tapableElementAnalysis,
        responsiveDesign: responsiveDesignAnalysis,
      };
    } catch (error) {
      console.error('Error in mobile UX analysis:', error);
      throw new Error(`Mobile UX analysis failed: ${(error as Error).message}`);
    }
  }
  
  private async analyzeViewport(page: puppeteer.Page): Promise<ViewportAnalysis> {
    // Check for viewport meta tag
    const viewportContent = await page.evaluate(() => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      return viewportMeta ? viewportMeta.getAttribute('content') : null;
    });
    
    const hasViewport = !!viewportContent;
    const issues: string[] = [];
    
    if (!hasViewport) {
      issues.push('Missing viewport meta tag');
    }
    
    // Check if viewport is properly configured
    let isConfigured = false;
    if (hasViewport) {
      const hasWidthDevice = viewportContent?.includes('width=device-width');
      const hasInitialScale = viewportContent?.includes('initial-scale=1');
      
      isConfigured = hasWidthDevice && hasInitialScale;
      
      if (!hasWidthDevice) {
        issues.push('Viewport meta tag missing width=device-width');
      }
      
      if (!hasInitialScale) {
        issues.push('Viewport meta tag missing initial-scale=1');
      }
      
      if (viewportContent?.includes('user-scalable=no') || 
          viewportContent?.includes('maximum-scale=1')) {
        issues.push('Viewport prevents zooming, which harms accessibility');
      }
    }
    
    // Calculate score
    const score = hasViewport ? (isConfigured ? 100 : 60) : 0;
    
    return {
      hasViewport,
      isConfigured,
      content: viewportContent || undefined,
      issues,
      score,
    };
  }
  
  private async analyzeTouchTargets(page: puppeteer.Page): Promise<TouchTargetAnalysis> {
    // Analyze interactive elements for adequate touch target size
    const touchTargets = await page.evaluate(() => {
      const interactiveElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]'));
      
      return interactiveElements.map(el => {
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Minimum recommended touch target size is 44x44 pixels
        const isAdequate = width >= 44 && height >= 44;
        
        return {
          element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
          size: { width, height },
          isAdequate,
        };
      });
    });
    
    const adequateTargets = touchTargets.filter(target => target.isAdequate).length;
    const inadequateTargets = touchTargets.filter(target => !target.isAdequate).length;
    
    const issues: string[] = [];
    if (inadequateTargets > 0) {
      issues.push(`${inadequateTargets} interactive elements have touch targets smaller than 44x44 pixels`);
    }
    
    // Calculate score
    const totalTargets = touchTargets.length;
    const score = totalTargets > 0 
      ? Math.round((adequateTargets / totalTargets) * 100) 
      : 100;
    
    return {
      adequateTargets,
      inadequateTargets,
      targetDetails: touchTargets,
      issues,
      score,
    };
  }
  
  private async analyzeFontSizes(page: puppeteer.Page): Promise<FontSizeAnalysis> {
    // Analyze text elements for adequate font size
    const fontDetails = await page.evaluate(() => {
      // Get all text nodes that are visible
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, button, input, textarea'));
      
      return textElements
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0' &&
                 el.textContent?.trim().length > 0;
        })
        .map(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          
          // Minimum recommended font size for mobile is 16px
          const isAdequate = fontSize >= 16;
          
          return {
            element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
            size: fontSize,
            isAdequate,
          };
        });
    });
    
    const adequateFonts = fontDetails.filter(font => font.isAdequate).length;
    const smallFonts = fontDetails.filter(font => !font.isAdequate).length;
    
    const issues: string[] = [];
    if (smallFonts > 0) {
      issues.push(`${smallFonts} text elements have font size smaller than 16px`);
    }
    
    // Calculate score
    const totalFonts = fontDetails.length;
    const score = totalFonts > 0 
      ? Math.round((adequateFonts / totalFonts) * 100) 
      : 100;
    
    return {
      adequateFonts,
      smallFonts,
      fontDetails,
      issues,
      score,
    };
  }
  
  private async analyzeTapableElements(page: puppeteer.Page): Promise<TapableElementAnalysis> {
    // Analyze spacing between interactive elements
    const elementDetails = await page.evaluate(() => {
      const interactiveElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]'));
      const results = [];
      
      for (let i = 0; i < interactiveElements.length; i++) {
        const el1 = interactiveElements[i];
        const rect1 = el1.getBoundingClientRect();
        
        let minSpacing = Infinity;
        let isAdequate = true;
        
        // Check distance to other elements
        for (let j = 0; j < interactiveElements.length; j++) {
          if (i === j) continue;
          
          const el2 = interactiveElements[j];
          const rect2 = el2.getBoundingClientRect();
          
          // Calculate minimum distance between elements
          const horizontalSpacing = Math.max(0, 
            Math.min(Math.abs(rect1.left - rect2.right), Math.abs(rect2.left - rect1.right)));
          
          const verticalSpacing = Math.max(0,
            Math.min(Math.abs(rect1.top - rect2.bottom), Math.abs(rect2.top - rect1.bottom)));
          
          // If elements overlap in one dimension, check spacing in the other dimension
          let spacing;
          if (horizontalSpacing === 0 && verticalSpacing === 0) {
            spacing = 0; // Elements overlap
          } else if (horizontalSpacing === 0) {
            spacing = verticalSpacing;
          } else if (verticalSpacing === 0) {
            spacing = horizontalSpacing;
          } else {
            spacing = Math.sqrt(horizontalSpacing * horizontalSpacing + verticalSpacing * verticalSpacing);
          }
          
          if (spacing < minSpacing) {
            minSpacing = spacing;
          }
          
          // Minimum recommended spacing is 8px
          if (spacing < 8) {
            isAdequate = false;
          }
        }
        
        if (minSpacing !== Infinity) {
          results.push({
            element: el1.tagName.toLowerCase() + (el1.id ? `#${el1.id}` : ''),
            spacing: minSpacing,
            isAdequate,
          });
        }
      }
      
      return results;
    });
    
    const adequateSpacing = elementDetails.filter(item => item.isAdequate).length;
    const inadequateSpacing = elementDetails.filter(item => !item.isAdequate).length;
    
    const issues: string[] = [];
    if (inadequateSpacing > 0) {
      issues.push(`${inadequateSpacing} interactive elements have inadequate spacing (less than 8px)`);
    }
    
    // Calculate score
    const totalElements = elementDetails.length;
    const score = totalElements > 0 
      ? Math.round((adequateSpacing / totalElements) * 100) 
      : 100;
    
    return {
      adequateSpacing,
      inadequateSpacing,
      elementDetails,
      issues,
      score,
    };
  }
  
  private async analyzeResponsiveDesign(browser: puppeteer.Browser, url: string): Promise<ResponsiveDesignAnalysis> {
    // Test site at different viewport widths
    const breakpoints = [
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // Landscape tablet
      { width: 1440, height: 900 }, // Desktop
    ];
    
    const breakpointResults = [];
    const issues: string[] = [];
    
    for (const breakpoint of breakpoints) {
      const page = await browser.newPage();
      await page.setViewport(breakpoint);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Check for horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        // Check for overlapping elements
        const hasOverlappingElements = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          const viewportWidth = window.innerWidth;
          
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 5) { // 5px tolerance
              return true;
            }
          }
          
          return false;
        });
        
        const breakpointIssues = [];
        if (hasHorizontalScroll) {
          breakpointIssues.push('Horizontal scrolling detected');
        }
        
        if (hasOverlappingElements) {
          breakpointIssues.push('Elements extend beyond viewport');
        }
        
        breakpointResults.push({
          width: breakpoint.width,
          issues: breakpointIssues,
        });
        
        if (breakpointIssues.length > 0) {
          issues.push(`Issues at ${breakpoint.width}px: ${breakpointIssues.join(', ')}`);
        }
        
        await page.close();
      } catch (error) {
        await page.close();
        console.error(`Error testing breakpoint ${breakpoint.width}px:`, error);
        breakpointResults.push({
          width: breakpoint.width,
          issues: [`Error: ${(error as Error).message}`],
        });
      }
    }
    
    // Count media queries as an indicator of responsive design
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const mediaQueries = await page.evaluate(() => {
      let count = 0;
      
      // Check inline styles
      for (const styleSheet of document.styleSheets) {
        try {
          if (styleSheet.href && !styleSheet.href.startsWith(window.location.origin)) {
            continue; // Skip external stylesheets from different origins (CORS)
          }
          
          const rules = styleSheet.cssRules || styleSheet.rules;
          for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.type === CSSRule.MEDIA_RULE) {
              count++;
            }
          }
        } catch (e) {
          // CORS error, skip this stylesheet
        }
      }
      
      return count;
    });
    
    await page.close();
    
    // Determine if site is responsive
    const isResponsive = mediaQueries > 0 && breakpointResults.filter(bp => bp.issues.length === 0).length >= 3;
    
    if (!isResponsive) {
      if (mediaQueries === 0) {
        issues.push('No media queries detected, site may not be responsive');
      }
      
      if (breakpointResults.filter(bp => bp.issues.length === 0).length < 3) {
        issues.push('Site has issues at multiple breakpoints');
      }
    }
    
    // Calculate score
    const totalBreakpoints = breakpointResults.length;
    const passedBreakpoints = breakpointResults.filter(bp => bp.issues.length === 0).length;
    
    const score = Math.round(
      (passedBreakpoints / totalBreakpoints) * 70 + // 70% weight for breakpoint tests
      (mediaQueries > 0 ? 30 : 0) // 30% weight for having media queries
    );
    
    return {
      isResponsive,
      breakpoints: breakpointResults,
      mediaQueries,
      issues,
      score,
    };
  }
}
