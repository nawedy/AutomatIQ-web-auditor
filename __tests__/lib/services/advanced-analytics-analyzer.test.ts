// src/__tests__/lib/services/advanced-analytics-analyzer.test.ts
// Unit tests for the Advanced Analytics Analyzer Service

import { AdvancedAnalyticsAnalyzer } from '@/lib/services/advanced-analytics-analyzer';
import puppeteer from 'puppeteer';

// Mock puppeteer
jest.mock('puppeteer', () => {
  return {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setRequestInterception: jest.fn(),
        on: jest.fn(),
        goto: jest.fn(),
        evaluate: jest.fn(),
        $$eval: jest.fn(),
        waitForSelector: jest.fn(),
        close: jest.fn(),
      }),
      close: jest.fn(),
    }),
  };
});

describe('AdvancedAnalyticsAnalyzer', () => {
  let analyticsAnalyzer: AdvancedAnalyticsAnalyzer;
  const mockUrl = 'https://example.com';
  
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsAnalyzer = new AdvancedAnalyticsAnalyzer();
  });

  describe('analyze', () => {
    it('should perform analytics analysis and return results', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock network requests for analytics detection
      let requestHandler: Function;
      mockPage.on.mockImplementation((event, handler) => {
        if (event === 'request') {
          requestHandler = handler;
        }
      });
      
      // Mock page evaluate for script detection
      mockPage.evaluate.mockImplementation(() => {
        return {
          googleAnalytics: true,
          googleTagManager: true,
          facebookPixel: false,
          hotjar: false,
          mixpanel: false,
          segment: false,
          amplitude: false,
          clarity: false,
          scripts: [
            { src: 'https://www.googletagmanager.com/gtag/js?id=UA-12345678-1' },
            { src: 'https://www.google-analytics.com/analytics.js' },
          ],
        };
      });
      
      // Mock page $$eval for tracking code detection
      mockPage.$$eval.mockImplementation(() => {
        return [
          { textContent: "ga('create', 'UA-12345678-1', 'auto');" },
          { textContent: "gtag('config', 'UA-12345678-1');" },
        ];
      });
      
      const results = await analyticsAnalyzer.analyze(mockUrl);
      
      // Verify puppeteer was launched
      expect(puppeteer.launch).toHaveBeenCalled();
      
      // Verify page setup
      expect(mockPage.setRequestInterception).toHaveBeenCalledWith(true);
      expect(mockPage.on).toHaveBeenCalledWith('request', expect.any(Function));
      expect(mockPage.goto).toHaveBeenCalledWith(mockUrl, expect.any(Object));
      
      // Verify analytics detection was performed
      expect(mockPage.evaluate).toHaveBeenCalled();
      
      // Verify results structure
      expect(results).toHaveProperty('score');
      expect(results).toHaveProperty('detectedTools');
      expect(results).toHaveProperty('trackingIds');
      expect(results).toHaveProperty('implementationQuality');
      expect(results).toHaveProperty('issues');
      expect(results).toHaveProperty('recommendations');
      
      // Verify detected tools
      expect(results.detectedTools).toContain('Google Analytics');
      expect(results.detectedTools).toContain('Google Tag Manager');
    });

    it('should handle errors during analysis', async () => {
      // Mock browser page goto to throw an error
      const mockPage = await (await puppeteer.launch()).newPage();
      mockPage.goto.mockRejectedValue(new Error('Failed to load page'));
      
      const results = await analyticsAnalyzer.analyze(mockUrl);
      
      // Verify error handling in results
      expect(results.score).toBeLessThan(50); // Low score due to errors
      expect(results.issues.length).toBeGreaterThan(0);
      expect(results.issues[0].description).toContain('Failed to load');
      expect(results.detectedTools).toEqual([]);
    });
  });

  describe('detectAnalyticsTools', () => {
    it('should detect analytics tools from network requests and scripts', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock evaluate to return detected tools
      mockPage.evaluate.mockResolvedValue({
        googleAnalytics: true,
        googleTagManager: true,
        facebookPixel: false,
        hotjar: false,
        mixpanel: false,
        segment: false,
        amplitude: false,
        clarity: false,
        scripts: [
          { src: 'https://www.googletagmanager.com/gtag/js?id=UA-12345678-1' },
          { src: 'https://www.google-analytics.com/analytics.js' },
        ],
      });
      
      const result = await analyticsAnalyzer.detectAnalyticsTools(mockPage as any);
      
      // Verify detection results
      expect(result).toHaveProperty('googleAnalytics', true);
      expect(result).toHaveProperty('googleTagManager', true);
      expect(result).toHaveProperty('facebookPixel', false);
      expect(result).toHaveProperty('scripts');
      expect(result.scripts.length).toBe(2);
    });
  });

  describe('extractTrackingIds', () => {
    it('should extract tracking IDs from scripts', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock $$eval to return script contents
      mockPage.$$eval.mockResolvedValue([
        { textContent: "ga('create', 'UA-12345678-1', 'auto');" },
        { textContent: "gtag('config', 'UA-12345678-1');" },
        { textContent: "fbq('init', '123456789012345');" },
      ]);
      
      const result = await analyticsAnalyzer.extractTrackingIds(mockPage as any);
      
      // Verify extracted IDs
      expect(result).toHaveProperty('googleAnalytics');
      expect(result.googleAnalytics).toContain('UA-12345678-1');
      expect(result).toHaveProperty('facebookPixel');
      expect(result.facebookPixel).toContain('123456789012345');
    });
  });

  describe('checkImplementationQuality', () => {
    it('should assess implementation quality of detected tools', () => {
      const detectedTools = {
        googleAnalytics: true,
        googleTagManager: true,
        facebookPixel: false,
        hotjar: false,
        mixpanel: false,
        segment: false,
        amplitude: false,
        clarity: false,
        scripts: [
          { src: 'https://www.googletagmanager.com/gtag/js?id=UA-12345678-1' },
          { src: 'https://www.google-analytics.com/analytics.js' },
        ],
      };
      
      const trackingIds = {
        googleAnalytics: ['UA-12345678-1'],
        googleTagManager: ['GTM-ABCDEF'],
        facebookPixel: [],
      };
      
      const networkRequests = [
        { url: 'https://www.google-analytics.com/collect?v=1&tid=UA-12345678-1' },
        { url: 'https://www.googletagmanager.com/gtag/js?id=UA-12345678-1' },
      ];
      
      const result = analyticsAnalyzer.checkImplementationQuality(
        detectedTools,
        trackingIds,
        networkRequests
      );
      
      // Verify quality assessment
      expect(result).toHaveProperty('googleAnalytics');
      expect(result).toHaveProperty('googleTagManager');
      expect(result.googleAnalytics).toHaveProperty('score');
      expect(result.googleAnalytics).toHaveProperty('issues');
      expect(result.googleAnalytics.score).toBeGreaterThanOrEqual(0);
      expect(result.googleAnalytics.score).toBeLessThanOrEqual(100);
    });
  });

  describe('generateIssuesAndRecommendations', () => {
    it('should generate issues and recommendations based on analysis results', () => {
      const detectedTools = {
        googleAnalytics: true,
        googleTagManager: false,
        facebookPixel: true,
        hotjar: false,
        mixpanel: false,
        segment: false,
        amplitude: false,
        clarity: false,
      };
      
      const trackingIds = {
        googleAnalytics: ['UA-12345678-1'],
        facebookPixel: ['123456789012345'],
      };
      
      const implementationQuality = {
        googleAnalytics: {
          score: 70,
          issues: ['Missing enhanced e-commerce tracking'],
        },
        facebookPixel: {
          score: 50,
          issues: ['Missing event tracking', 'Pixel loaded multiple times'],
        },
      };
      
      const { issues, recommendations } = analyticsAnalyzer.generateIssuesAndRecommendations(
        detectedTools,
        trackingIds,
        implementationQuality
      );
      
      // Verify issues were generated
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.find(i => i.description.includes('Google Analytics'))).toBeTruthy();
      expect(issues.find(i => i.description.includes('Facebook Pixel'))).toBeTruthy();
      
      // Verify recommendations were generated
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.find(r => r.includes('Google Tag Manager'))).toBeTruthy();
      expect(recommendations.find(r => r.includes('enhanced e-commerce'))).toBeTruthy();
    });
  });

  describe('calculateScore', () => {
    it('should calculate overall score based on detected tools and implementation quality', () => {
      const detectedTools = {
        googleAnalytics: true,
        googleTagManager: false,
        facebookPixel: true,
        hotjar: false,
        mixpanel: false,
        segment: false,
        amplitude: false,
        clarity: false,
      };
      
      const implementationQuality = {
        googleAnalytics: {
          score: 70,
          issues: ['Missing enhanced e-commerce tracking'],
        },
        facebookPixel: {
          score: 50,
          issues: ['Missing event tracking', 'Pixel loaded multiple times'],
        },
      };
      
      const score = analyticsAnalyzer.calculateScore(detectedTools, implementationQuality);
      
      // Verify score is within range
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      
      // Verify score reflects implementation quality
      expect(score).toBe(60); // Average of 70 and 50
    });
    
    it('should handle case with no detected tools', () => {
      const detectedTools = {
        googleAnalytics: false,
        googleTagManager: false,
        facebookPixel: false,
        hotjar: false,
        mixpanel: false,
        segment: false,
        amplitude: false,
        clarity: false,
      };
      
      const implementationQuality = {};
      
      const score = analyticsAnalyzer.calculateScore(detectedTools, implementationQuality);
      
      // Verify score is low due to no tools detected
      expect(score).toBeLessThan(50);
    });
  });
});
