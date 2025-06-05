// src/lib/services/advanced-analytics-analyzer.ts
// Advanced analytics integration analyzer service

import puppeteer from 'puppeteer';
import { BaseAnalyzer } from './base-analyzer';
import { AnalyticsIntegrationResult } from '../types/advanced-audit';

export class AdvancedAnalyticsAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<AnalyticsIntegrationResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      // Create a new page
      const page = await browser.newPage();
      
      // Enable request interception to detect analytics requests
      await page.setRequestInterception(true);
      
      // Track analytics requests
      const analyticsRequests: {
        url: string;
        type: string;
        timestamp: number;
      }[] = [];
      
      page.on('request', (request) => {
        const url = request.url();
        let type = 'unknown';
        
        // Detect analytics services by URL patterns
        if (url.includes('google-analytics.com') || url.includes('analytics.google.com') || url.includes('gtag')) {
          type = 'Google Analytics';
        } else if (url.includes('googletagmanager.com')) {
          type = 'Google Tag Manager';
        } else if (url.includes('facebook.com/tr') || url.includes('connect.facebook.net')) {
          type = 'Facebook Pixel';
        } else if (url.includes('hotjar.com')) {
          type = 'Hotjar';
        } else if (url.includes('clarity.ms')) {
          type = 'Microsoft Clarity';
        } else if (url.includes('segment.com') || url.includes('segment.io')) {
          type = 'Segment';
        } else if (url.includes('mixpanel.com')) {
          type = 'Mixpanel';
        } else if (url.includes('amplitude.com')) {
          type = 'Amplitude';
        } else if (url.includes('matomo') || url.includes('piwik')) {
          type = 'Matomo/Piwik';
        } else if (url.includes('plausible.io')) {
          type = 'Plausible';
        } else if (url.includes('fathom.com') || url.includes('usefathom.com')) {
          type = 'Fathom';
        } else if (url.includes('adobe') && (url.includes('analytics') || url.includes('omniture'))) {
          type = 'Adobe Analytics';
        } else if (url.includes('kissmetrics.com')) {
          type = 'Kissmetrics';
        } else if (url.includes('crazyegg.com')) {
          type = 'Crazy Egg';
        } else if (url.includes('optimizely.com')) {
          type = 'Optimizely';
        } else if (url.includes('fullstory.com')) {
          type = 'FullStory';
        }
        
        if (type !== 'unknown') {
          analyticsRequests.push({
            url,
            type,
            timestamp: Date.now(),
          });
        }
        
        request.continue();
      });
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait a bit more to capture delayed analytics
      await page.waitForTimeout(3000);
      
      // Check for analytics scripts in the page
      const analyticsScripts = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const analyticsPatterns = [
          { pattern: /ga\s*\(|gtag|google-analytics|googletagmanager|analytics\.js/i, type: 'Google Analytics' },
          { pattern: /fbq\s*\(|facebook-pixel|facebook\.com\/tr|fbevents\.js/i, type: 'Facebook Pixel' },
          { pattern: /hotjar/i, type: 'Hotjar' },
          { pattern: /clarity/i, type: 'Microsoft Clarity' },
          { pattern: /segment/i, type: 'Segment' },
          { pattern: /mixpanel/i, type: 'Mixpanel' },
          { pattern: /amplitude/i, type: 'Amplitude' },
          { pattern: /matomo|piwik/i, type: 'Matomo/Piwik' },
          { pattern: /plausible/i, type: 'Plausible' },
          { pattern: /fathom/i, type: 'Fathom' },
          { pattern: /adobe.*analytics|omniture|sitecatalyst/i, type: 'Adobe Analytics' },
          { pattern: /kissmetrics/i, type: 'Kissmetrics' },
          { pattern: /crazyegg/i, type: 'Crazy Egg' },
          { pattern: /optimizely/i, type: 'Optimizely' },
          { pattern: /fullstory/i, type: 'FullStory' },
        ];
        
        const results: { type: string; implementation: string }[] = [];
        
        scripts.forEach(script => {
          const src = script.getAttribute('src') || '';
          const content = script.textContent || '';
          
          analyticsPatterns.forEach(({ pattern, type }) => {
            if ((src && pattern.test(src)) || pattern.test(content)) {
              results.push({
                type,
                implementation: src ? 'external' : 'inline',
              });
            }
          });
        });
        
        return results;
      });
      
      // Check for data layer
      const hasDataLayer = await page.evaluate(() => {
        return typeof window.dataLayer !== 'undefined';
      });
      
      // Check for event tracking
      const hasEventTracking = await page.evaluate(() => {
        // Look for common event tracking patterns
        const eventPatterns = [
          /\.addEventListener\s*\(/,
          /onclick\s*=/,
          /gtag\s*\(\s*['"]event/,
          /ga\s*\(\s*['"]send/,
          /fbq\s*\(\s*['"]track/,
          /analytics\.track/,
          /mixpanel\.track/,
          /amplitude\.track/,
        ];
        
        // Check inline event handlers
        const elementsWithEvents = document.querySelectorAll('[onclick], [onsubmit], [onchange]');
        if (elementsWithEvents.length > 0) {
          return true;
        }
        
        // Check script content
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const content = script.textContent || '';
          for (const pattern of eventPatterns) {
            if (pattern.test(content)) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      // Check for consent management
      const hasConsentManagement = await page.evaluate(() => {
        // Look for common consent management platforms
        const consentPatterns = [
          /cookieconsent/i,
          /gdpr/i,
          /consent/i,
          /cookiebot/i,
          /onetrust/i,
          /trustarc/i,
          /cookiehub/i,
          /osano/i,
          /cookie-script/i,
          /cookie banner/i,
          /cookie notice/i,
          /cookie policy/i,
        ];
        
        // Check for consent elements
        const consentElements = document.querySelectorAll(
          '[class*="cookie"], [class*="consent"], [class*="gdpr"], [id*="cookie"], [id*="consent"], [id*="gdpr"]'
        );
        
        if (consentElements.length > 0) {
          return true;
        }
        
        // Check script content
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const src = script.getAttribute('src') || '';
          const content = script.textContent || '';
          
          for (const pattern of consentPatterns) {
            if (pattern.test(src) || pattern.test(content)) {
              return true;
            }
          }
        }
        
        // Check for common consent text in the page
        const bodyText = document.body.textContent || '';
        const consentTextPatterns = [
          /we use cookies/i,
          /cookie policy/i,
          /privacy policy/i,
          /accept cookies/i,
          /cookie preferences/i,
          /cookie settings/i,
        ];
        
        for (const pattern of consentTextPatterns) {
          if (pattern.test(bodyText)) {
            return true;
          }
        }
        
        return false;
      });
      
      // Combine analytics tools from requests and scripts
      const analyticsTools = new Map<string, {
        detected: boolean;
        implementation: string;
        requests: number;
      }>();
      
      // Add tools from scripts
      analyticsScripts.forEach(script => {
        if (!analyticsTools.has(script.type)) {
          analyticsTools.set(script.type, {
            detected: true,
            implementation: script.implementation,
            requests: 0,
          });
        }
      });
      
      // Add tools from requests
      analyticsRequests.forEach(request => {
        if (analyticsTools.has(request.type)) {
          const tool = analyticsTools.get(request.type)!;
          tool.requests += 1;
        } else {
          analyticsTools.set(request.type, {
            detected: true,
            implementation: 'network',
            requests: 1,
          });
        }
      });
      
      // Convert map to array
      const detectedTools = Array.from(analyticsTools.entries()).map(([name, details]) => ({
        name,
        ...details,
      }));
      
      // Generate issues and recommendations
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      if (detectedTools.length === 0) {
        issues.push('No analytics tools detected');
        recommendations.push('Implement an analytics solution to track user behavior and site performance');
      }
      
      if (detectedTools.length > 3) {
        issues.push(`Multiple analytics tools detected (${detectedTools.length}), which may impact page performance`);
        recommendations.push('Consider consolidating analytics tools to reduce page load impact');
      }
      
      if (!hasEventTracking && detectedTools.length > 0) {
        issues.push('Analytics tools detected but no event tracking found');
        recommendations.push('Implement event tracking for user interactions to gather more valuable data');
      }
      
      if (!hasConsentManagement && detectedTools.length > 0) {
        issues.push('No consent management detected for analytics cookies');
        recommendations.push('Implement a consent management solution to comply with privacy regulations like GDPR and CCPA');
      }
      
      if (hasDataLayer) {
        recommendations.push('Good: Data layer detected, which enables more flexible and maintainable tracking');
      } else if (detectedTools.length > 0) {
        issues.push('No data layer detected');
        recommendations.push('Implement a data layer for more structured and maintainable analytics implementation');
      }
      
      // Close the browser
      await browser.close();
      
      // Calculate score
      let score = 0;
      
      // Base score for having analytics
      if (detectedTools.length > 0) {
        score += 60;
      }
      
      // Bonus for event tracking
      if (hasEventTracking) {
        score += 15;
      }
      
      // Bonus for consent management
      if (hasConsentManagement) {
        score += 15;
      }
      
      // Bonus for data layer
      if (hasDataLayer) {
        score += 10;
      }
      
      // Penalty for too many tools
      if (detectedTools.length > 3) {
        score -= 10;
      }
      
      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));
      
      return {
        score,
        detectedTools,
        hasDataLayer,
        hasEventTracking,
        hasConsentManagement,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Error in analytics integration analysis:', error);
      throw new Error(`Analytics integration analysis failed: ${(error as Error).message}`);
    }
  }
}
