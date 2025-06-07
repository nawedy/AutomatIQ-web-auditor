// src/__tests__/lib/services/advanced-cross-browser-analyzer.test.ts
// Unit tests for the Advanced Cross Browser Analyzer Service

import { AdvancedCrossBrowserAnalyzer } from '@/lib/services/advanced-cross-browser-analyzer';
import puppeteer from 'puppeteer';

// Mock puppeteer
jest.mock('puppeteer', () => {
  return {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setUserAgent: jest.fn(),
        setViewport: jest.fn(),
        goto: jest.fn(),
        evaluate: jest.fn(),
        screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
        close: jest.fn(),
      }),
      close: jest.fn(),
    }),
  };
});

describe('AdvancedCrossBrowserAnalyzer', () => {
  let crossBrowserAnalyzer: AdvancedCrossBrowserAnalyzer;
  const mockUrl = 'https://example.com';
  
  beforeEach(() => {
    jest.clearAllMocks();
    crossBrowserAnalyzer = new AdvancedCrossBrowserAnalyzer();
  });

  describe('analyze', () => {
    it('should perform cross-browser analysis and return results', async () => {
      // Mock browser page evaluate responses for different tests
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock feature detection results
      mockPage.evaluate.mockImplementation((fn) => {
        // Check which test is being run based on the function content
        const fnString = fn.toString();
        
        if (fnString.includes('navigator.userAgent')) {
          return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        }
        
        if (fnString.includes('document.body.style')) {
          return {
            flexbox: true,
            grid: true,
            webp: true,
            webgl: true,
            webrtc: true,
            websocket: true,
          };
        }
        
        if (fnString.includes('document.querySelectorAll')) {
          return {
            totalElements: 100,
            nonStandardElements: 2,
            vendorPrefixes: 5,
          };
        }
        
        if (fnString.includes('window.innerWidth')) {
          return {
            width: 1280,
            height: 800,
            documentWidth: 1280,
            documentHeight: 2000,
            scrollWidth: 1280,
            scrollHeight: 2000,
            overflowX: false,
            overflowY: true,
          };
        }
        
        return {};
      });
      
      const results = await crossBrowserAnalyzer.analyze(mockUrl);
      
      // Verify puppeteer was launched
      expect(puppeteer.launch).toHaveBeenCalled();
      
      // Verify browser tests were performed
      expect(mockPage.setUserAgent).toHaveBeenCalledTimes(4); // Once for each browser
      expect(mockPage.goto).toHaveBeenCalledTimes(4); // Once for each browser
      expect(mockPage.evaluate).toHaveBeenCalled();
      expect(mockPage.screenshot).toHaveBeenCalled();
      
      // Verify results structure
      expect(results).toHaveProperty('score');
      expect(results).toHaveProperty('browserCompatibility');
      expect(results).toHaveProperty('visualConsistency');
      expect(results).toHaveProperty('featureCompatibility');
      expect(results).toHaveProperty('responsiveConsistency');
      expect(results).toHaveProperty('issues');
      expect(results).toHaveProperty('recommendations');
      
      // Verify browser compatibility results
      expect(results.browserCompatibility).toHaveProperty('chrome');
      expect(results.browserCompatibility).toHaveProperty('firefox');
      expect(results.browserCompatibility).toHaveProperty('safari');
      expect(results.browserCompatibility).toHaveProperty('edge');
    });

    it('should handle errors during analysis', async () => {
      // Mock browser page goto to throw an error
      const mockPage = await (await puppeteer.launch()).newPage();
      mockPage.goto.mockRejectedValue(new Error('Failed to load page'));
      
      const results = await crossBrowserAnalyzer.analyze(mockUrl);
      
      // Verify error handling in results
      expect(results.score).toBeLessThan(50); // Low score due to errors
      expect(results.issues.length).toBeGreaterThan(0);
      expect(results.issues[0].description).toContain('Failed to load');
    });
  });

  describe('testBrowserCompatibility', () => {
    it('should test compatibility across browsers', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock evaluate to return different user agents
      mockPage.evaluate.mockImplementation(() => {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      });
      
      const results = await crossBrowserAnalyzer.testBrowserCompatibility(mockUrl);
      
      // Verify browser tests
      expect(mockPage.setUserAgent).toHaveBeenCalledTimes(4);
      expect(mockPage.goto).toHaveBeenCalledTimes(4);
      
      // Verify results for each browser
      expect(results).toHaveProperty('chrome');
      expect(results).toHaveProperty('firefox');
      expect(results).toHaveProperty('safari');
      expect(results).toHaveProperty('edge');
      
      // Verify result structure for a browser
      expect(results.chrome).toHaveProperty('userAgent');
      expect(results.chrome).toHaveProperty('loaded');
      expect(results.chrome).toHaveProperty('errors');
    });
  });

  describe('testVisualConsistency', () => {
    it('should compare visual appearance across browsers', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock screenshot to return buffer
      mockPage.screenshot.mockResolvedValue(Buffer.from('mock-screenshot'));
      
      const results = await crossBrowserAnalyzer.testVisualConsistency(mockUrl);
      
      // Verify screenshots were taken
      expect(mockPage.screenshot).toHaveBeenCalledTimes(4);
      
      // Verify results structure
      expect(results).toHaveProperty('screenshots');
      expect(results).toHaveProperty('differences');
      
      // Verify screenshot results
      expect(results.screenshots).toHaveProperty('chrome');
      expect(results.screenshots).toHaveProperty('firefox');
      expect(results.screenshots).toHaveProperty('safari');
      expect(results.screenshots).toHaveProperty('edge');
      
      // Verify differences were calculated
      expect(results.differences).toHaveProperty('chromeVsFirefox');
      expect(results.differences).toHaveProperty('chromeVsSafari');
      expect(results.differences).toHaveProperty('chromeVsEdge');
    });
  });

  describe('testFeatureCompatibility', () => {
    it('should test feature support across browsers', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock evaluate to return feature detection results
      mockPage.evaluate.mockImplementation(() => {
        return {
          flexbox: true,
          grid: true,
          webp: true,
          webgl: true,
          webrtc: true,
          websocket: true,
        };
      });
      
      const results = await crossBrowserAnalyzer.testFeatureCompatibility(mockUrl);
      
      // Verify feature detection was run for each browser
      expect(mockPage.evaluate).toHaveBeenCalledTimes(4);
      
      // Verify results structure
      expect(results).toHaveProperty('features');
      expect(results).toHaveProperty('support');
      
      // Verify feature results
      expect(results.features).toContain('flexbox');
      expect(results.features).toContain('grid');
      expect(results.features).toContain('webp');
      
      // Verify browser support
      expect(results.support).toHaveProperty('chrome');
      expect(results.support).toHaveProperty('firefox');
      expect(results.support).toHaveProperty('safari');
      expect(results.support).toHaveProperty('edge');
    });
  });

  describe('testResponsiveConsistency', () => {
    it('should test responsive design across browsers and viewports', async () => {
      // Mock browser page
      const mockPage = await (await puppeteer.launch()).newPage();
      
      // Mock evaluate to return viewport metrics
      mockPage.evaluate.mockImplementation(() => {
        return {
          width: 1280,
          height: 800,
          documentWidth: 1280,
          documentHeight: 2000,
          scrollWidth: 1280,
          scrollHeight: 2000,
          overflowX: false,
          overflowY: true,
        };
      });
      
      const results = await crossBrowserAnalyzer.testResponsiveConsistency(mockUrl);
      
      // Verify viewport was set for different sizes
      expect(mockPage.setViewport).toHaveBeenCalledTimes(12); // 4 browsers * 3 viewport sizes
      
      // Verify results structure
      expect(results).toHaveProperty('viewports');
      expect(results).toHaveProperty('metrics');
      expect(results).toHaveProperty('consistency');
      
      // Verify viewport results
      expect(results.viewports).toContain('mobile');
      expect(results.viewports).toContain('tablet');
      expect(results.viewports).toContain('desktop');
      
      // Verify browser metrics
      expect(results.metrics).toHaveProperty('chrome');
      expect(results.metrics).toHaveProperty('firefox');
      expect(results.metrics).toHaveProperty('safari');
      expect(results.metrics).toHaveProperty('edge');
      
      // Verify consistency score
      expect(results.consistency).toBeGreaterThanOrEqual(0);
      expect(results.consistency).toBeLessThanOrEqual(100);
    });
  });

  describe('generateIssuesAndRecommendations', () => {
    it('should generate issues and recommendations based on test results', () => {
      const mockResults = {
        browserCompatibility: {
          chrome: { loaded: true, errors: [] },
          firefox: { loaded: true, errors: [] },
          safari: { loaded: false, errors: ['Failed to load page'] },
          edge: { loaded: true, errors: [] },
        },
        visualConsistency: {
          differences: {
            chromeVsFirefox: 5,
            chromeVsSafari: 25, // High difference
            chromeVsEdge: 8,
          },
        },
        featureCompatibility: {
          support: {
            chrome: { flexbox: true, grid: true },
            firefox: { flexbox: true, grid: true },
            safari: { flexbox: true, grid: false }, // Safari doesn't support grid
            edge: { flexbox: true, grid: true },
          },
        },
        responsiveConsistency: {
          consistency: 75,
        },
      };
      
      const { issues, recommendations } = crossBrowserAnalyzer.generateIssuesAndRecommendations(mockResults as any);
      
      // Verify issues were generated
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.find(i => i.description.includes('Safari'))).toBeTruthy();
      expect(issues.find(i => i.description.includes('visual difference'))).toBeTruthy();
      expect(issues.find(i => i.description.includes('grid'))).toBeTruthy();
      
      // Verify recommendations were generated
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.find(r => r.includes('Safari'))).toBeTruthy();
      expect(recommendations.find(r => r.includes('CSS Grid'))).toBeTruthy();
    });
  });

  describe('calculateScore', () => {
    it('should calculate overall score based on test results', () => {
      const mockResults = {
        browserCompatibility: {
          chrome: { loaded: true, errors: [] },
          firefox: { loaded: true, errors: [] },
          safari: { loaded: false, errors: ['Failed to load page'] },
          edge: { loaded: true, errors: [] },
        },
        visualConsistency: {
          differences: {
            chromeVsFirefox: 5,
            chromeVsSafari: 25,
            chromeVsEdge: 8,
          },
        },
        featureCompatibility: {
          support: {
            chrome: { flexbox: true, grid: true, webp: true },
            firefox: { flexbox: true, grid: true, webp: true },
            safari: { flexbox: true, grid: false, webp: false },
            edge: { flexbox: true, grid: true, webp: true },
          },
        },
        responsiveConsistency: {
          consistency: 75,
        },
      };
      
      const score = crossBrowserAnalyzer.calculateScore(mockResults as any);
      
      // Verify score is within range
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      
      // Verify score reflects issues (should be lower due to Safari issues)
      expect(score).toBeLessThan(90);
    });
  });
});
