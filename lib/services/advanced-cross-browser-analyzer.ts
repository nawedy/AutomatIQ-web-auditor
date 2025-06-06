// src/lib/services/advanced-cross-browser-analyzer.ts
// Advanced cross-browser testing analyzer service using Puppeteer

// Safely detect environment
const isServer = typeof window === 'undefined';

// Only import browser environment if we're on the server
if (isServer) {
  // Import mock browser environment for server-side rendering
  require('./mock-browser-environment');
}

// Use dynamic imports for browser-specific modules
let puppeteer: any;
let compareImages: any;

// Only load these modules in client-side environment
if (!isServer) {
  // Use dynamic imports to load browser-specific modules only on client
  const loadDependencies = async () => {
    try {
      puppeteer = (await import('puppeteer')).default;
      const resembleJs = await import('resemblejs');
      compareImages = resembleJs.compareImages || resembleJs.default?.compareImages;
    } catch (error) {
      console.error('Failed to load browser testing dependencies:', error);
    }
  };
  
  // Load dependencies if in browser
  loadDependencies();
}

import { BaseAnalyzer } from './base-analyzer';
import { CrossBrowserAnalysisResult, BrowserCompatibilityResult, VisualConsistencyResult, FeatureCompatibilityResult, ResponsiveConsistencyResult } from '../types/advanced-audit';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class AdvancedCrossBrowserAnalyzer extends BaseAnalyzer {
  // Browser configurations to test
  private browserConfigs = [
    {
      name: 'Chrome',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    {
      name: 'Firefox',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    },
    {
      name: 'Safari',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    },
    {
      name: 'Edge',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    },
  ];
  
  // Viewport sizes to test
  private viewportSizes = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1366, height: 768, name: 'Laptop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 812, name: 'Mobile' },
  ];
  
  async analyze(url: string): Promise<CrossBrowserAnalysisResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      // Test browser compatibility
      const browserCompatibility = await this.testBrowserCompatibility(browser, url);
      
      // Test visual consistency
      const visualConsistency = await this.testVisualConsistency(browser, url);
      
      // Test feature compatibility
      const featureCompatibility = await this.testFeatureCompatibility(browser, url);
      
      // Test responsive consistency
      const responsiveConsistency = await this.testResponsiveConsistency(browser, url);
      
      // Close the browser
      await browser.close();
      
      // Calculate overall score
      const score = this.calculateWeightedScore([
        { score: browserCompatibility.score, weight: 2.5 },
        { score: visualConsistency.score, weight: 2.0 },
        { score: featureCompatibility.score, weight: 2.5 },
        { score: responsiveConsistency.score, weight: 3.0 },
      ]);
      
      // Combine all issues
      const issues = [
        ...browserCompatibility.issues,
        ...visualConsistency.issues,
        ...featureCompatibility.issues,
        ...responsiveConsistency.issues,
      ];
      
      return {
        score,
        browserCompatibility,
        visualConsistency,
        featureCompatibility,
        responsiveConsistency,
        issues,
      };
    } catch (error) {
      console.error('Error in cross-browser analysis:', error);
      throw new Error(`Cross-browser analysis failed: ${(error as Error).message}`);
    }
  }
  
  private async testBrowserCompatibility(browser: puppeteer.Browser, url: string): Promise<BrowserCompatibilityResult> {
    const browserResults = [];
    const issues: string[] = [];
    
    for (const config of this.browserConfigs) {
      const page = await browser.newPage();
      
      // Set user agent to emulate different browsers
      await page.setUserAgent(config.userAgent);
      
      try {
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Check for console errors
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Wait a bit to collect console errors
        await page.waitForTimeout(2000);
        
        // Check for JavaScript errors
        const jsErrors = await page.evaluate(() => {
          return window.JSErrors || [];
        });
        
        // Check for layout issues
        const layoutIssues = await page.evaluate(() => {
          const issues = [];
          
          // Check for elements with negative margins or positions
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            if (rect.left < 0 || rect.top < 0) {
              issues.push(`Element ${el.tagName.toLowerCase()} has negative position`);
            }
          }
          
          // Check for horizontal scrollbar
          if (document.body.scrollWidth > window.innerWidth) {
            issues.push('Horizontal scrollbar detected');
          }
          
          return issues;
        });
        
        // Combine all issues
        const browserIssues = [
          ...consoleErrors.map(err => `Console error: ${err}`),
          ...jsErrors.map(err => `JS error: ${err}`),
          ...layoutIssues,
        ];
        
        // Calculate browser score
        const score = Math.max(0, 100 - (browserIssues.length * 10));
        
        browserResults.push({
          browser: config.name,
          issues: browserIssues,
          score,
          passed: browserIssues.length === 0
        });
        
        if (browserIssues.length > 0) {
          issues.push(`${config.name} browser issues: ${browserIssues.length} found`);
        }
      } catch (error) {
        console.error(`Error testing ${config.name}:`, error);
        issues.push(`Failed to test ${config.name}: ${(error as Error).message}`);
        browserResults.push({
          browser: config.name,
          issues: [`Test failed: ${(error as Error).message}`],
          score: 0,
          passed: false
        });
      } finally {
        await page.close();
      }
    }
    
    // Calculate overall score
    const totalScore = browserResults.reduce((sum, result) => sum + result.score, 0);
    const avgScore = Math.round(totalScore / this.browserConfigs.length);
    
    return {
      browsers: browserResults,
      issues,
      score: avgScore
    };
  }
  
  private async testVisualConsistency(browser: puppeteer.Browser, url: string): Promise<VisualConsistencyResult> {
    const screenshotDir = path.join(os.tmpdir(), 'automatiq-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshots: Record<string, string> = {};
    const issues: string[] = [];
    const comparisonResults: Array<{
      browsers: [string, string];
      difference: number;
      passed: boolean;
    }> = [];
    
    // Take screenshots in each browser
    for (const config of this.browserConfigs) {
      const page = await browser.newPage();
      
      try {
        // Set user agent to emulate different browsers
        await page.setUserAgent(config.userAgent);
        await page.setViewport({ width: 1366, height: 768 });
        
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        const screenshotPath = path.join(screenshotDir, `${config.name.toLowerCase()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        screenshots[config.name] = screenshotPath;
      } catch (error) {
        console.error(`Error capturing screenshot for ${config.name}:`, error);
        issues.push(`Failed to capture screenshot for ${config.name}: ${(error as Error).message}`);
      } finally {
        await page.close();
      }
    }
    
    // Compare screenshots between browsers
    const browserNames = Object.keys(screenshots);
    for (let i = 0; i < browserNames.length; i++) {
      for (let j = i + 1; j < browserNames.length; j++) {
        const browser1 = browserNames[i];
        const browser2 = browserNames[j];
        
        try {
          const screenshot1 = fs.readFileSync(screenshots[browser1]);
          const screenshot2 = fs.readFileSync(screenshots[browser2]);
          
          const comparisonResult = await compareImages(
            screenshot1,
            screenshot2,
            { output: { largeImageThreshold: 1200 } }
          );
          
          const difference = comparisonResult.rawMisMatchPercentage;
          const passed = difference < 5; // Less than 5% difference is acceptable
          
          comparisonResults.push({
            browsers: [browser1, browser2],
            difference,
            passed
          });
          
          if (!passed) {
            issues.push(`Visual difference between ${browser1} and ${browser2}: ${difference.toFixed(2)}%`);
          }
        } catch (error) {
          console.error(`Error comparing ${browser1} and ${browser2}:`, error);
          issues.push(`Failed to compare ${browser1} and ${browser2}: ${(error as Error).message}`);
        }
      }
    }
    
    // Clean up screenshots
    Object.values(screenshots).forEach(file => {
      try {
        fs.unlinkSync(file);
      } catch (error) {
        console.error(`Error deleting screenshot ${file}:`, error);
      }
    });
    
    // Calculate score based on comparison results
    const passedComparisons = comparisonResults.filter(result => result.passed).length;
    const totalComparisons = comparisonResults.length || 1; // Avoid division by zero
    const score = Math.round((passedComparisons / totalComparisons) * 100);
    
    return {
      comparisons: comparisonResults,
      issues,
      score
    };
  }
  
  private async testFeatureCompatibility(browser: puppeteer.Browser, url: string): Promise<FeatureCompatibilityResult> {
    const featureTests = [
      { name: 'CSS Grid', test: "typeof document.createElement('div').style.grid !== 'undefined'" },
      { name: 'Flexbox', test: "typeof document.createElement('div').style.flexDirection !== 'undefined'" },
      { name: 'CSS Variables', test: "window.CSS && window.CSS.supports && window.CSS.supports('--a', '0')" },
      { name: 'ES6 Features', test: "typeof Promise !== 'undefined' && typeof Symbol !== 'undefined' && typeof Map !== 'undefined'" },
      { name: 'Fetch API', test: "typeof fetch !== 'undefined'" },
      { name: 'WebP Support', test: "document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0" },
      { name: 'WebGL', test: "(() => { try { return !!document.createElement('canvas').getContext('webgl'); } catch(e) { return false; } })()" },
      { name: 'Touch Events', test: "'ontouchstart' in window || navigator.maxTouchPoints > 0" },
      { name: 'Service Workers', test: "'serviceWorker' in navigator" },
      { name: 'WebRTC', test: "typeof RTCPeerConnection !== 'undefined'" },
    ];
    
    const results: Array<{
      feature: string;
      browser: string;
      supported: boolean;
    }> = [];
    
    const issues: string[] = [];
    
    for (const config of this.browserConfigs) {
      const page = await browser.newPage();
      
      try {
        // Set user agent to emulate different browsers
        await page.setUserAgent(config.userAgent);
        
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Test each feature
        for (const feature of featureTests) {
          const supported = await page.evaluate(`(function() { return ${feature.test}; })()`);
          
          results.push({
            feature: feature.name,
            browser: config.name,
            supported
          });
          
          if (!supported) {
            issues.push(`${feature.name} not supported in ${config.name}`);
          }
        }
      } catch (error) {
        console.error(`Error testing features for ${config.name}:`, error);
        issues.push(`Failed to test features for ${config.name}: ${(error as Error).message}`);
        
        // Add failed results for all features
        featureTests.forEach(feature => {
          results.push({
            feature: feature.name,
            browser: config.name,
            supported: false
          });
        });
      } finally {
        await page.close();
      }
    }
    
    // Calculate score based on feature support
    const supportedFeatures = results.filter(result => result.supported).length;
    const totalTests = results.length || 1; // Avoid division by zero
    const score = Math.round((supportedFeatures / totalTests) * 100);
    
    return {
      features: results,
      issues,
      score
    };
  }
  
  private async testResponsiveConsistency(browser: puppeteer.Browser, url: string): Promise<ResponsiveConsistencyResult> {
    const viewportResults: Array<{
      viewport: string;
      width: number;
      height: number;
      issues: string[];
      score: number;
    }> = [];
    
    const issues: string[] = [];
    
    for (const viewport of this.viewportSizes) {
      const page = await browser.newPage();
      
      try {
        // Set viewport size
        await page.setViewport({
          width: viewport.width,
          height: viewport.height
        });
        
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Check for responsive issues
        const viewportIssues = await page.evaluate(() => {
          const issues: string[] = [];
          
          // Check for horizontal overflow
          if (document.body.scrollWidth > window.innerWidth) {
            issues.push('Horizontal scrollbar detected');
          }
          
          // Check for elements extending beyond viewport
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 5) { // 5px tolerance
              issues.push(`Element ${el.tagName.toLowerCase()} extends beyond viewport width`);
            }
          }
          
          // Check for tiny tap targets on mobile
          if (window.innerWidth < 768) {
            const clickableElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
            for (const el of clickableElements) {
              const rect = el.getBoundingClientRect();
              if (rect.width < 44 || rect.height < 44) {
                issues.push(`Tap target ${el.tagName.toLowerCase()} is too small for mobile`);
              }
            }
          }
          
          // Check for fixed font sizes
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
          for (const el of textElements) {
            const style = window.getComputedStyle(el);
            if (style.fontSize.endsWith('px')) {
              const size = parseFloat(style.fontSize);
              if (size < 16 && style.position === 'fixed') {
                issues.push(`Fixed position text with small font size (${size}px)`);
              }
            }
          }
          
          return issues;
        });
        
        // Calculate viewport score
        const score = Math.max(0, 100 - (viewportIssues.length * 10));
        
        viewportResults.push({
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          issues: viewportIssues,
          score
        });
        
        if (viewportIssues.length > 0) {
          issues.push(`${viewport.name} (${viewport.width}x${viewport.height}) issues: ${viewportIssues.length} found`);
        }
      } catch (error) {
        console.error(`Error testing responsive design for ${viewport.name}:`, error);
        issues.push(`Failed to test ${viewport.name} viewport: ${(error as Error).message}`);
        
        viewportResults.push({
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          issues: [`Test failed: ${(error as Error).message}`],
          score: 0
        });
      } finally {
        await page.close();
      }
    }
    
    // Calculate overall score
    const totalScore = viewportResults.reduce((sum, result) => sum + result.score, 0);
    const avgScore = Math.round(totalScore / this.viewportSizes.length);
    
    return {
      viewports: viewportResults,
      issues,
      score: avgScore
    };
  }
  
  // Method to analyze cross-browser compatibility
  async analyzeCrossBrowserCompatibility(url: string): Promise<CrossBrowserAnalysisResult> {
    const browserResults: BrowserResult[] = [];
    const issues: string[] = [];
    
    for (const config of this.browserConfigs) {
      const browser = await puppeteer.launch(config.options);
      const page = await browser.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Perform browser-specific tests
        const browserIssues = await this.testBrowserCompatibility(page, config);
        const score = 100 - (browserIssues.length * 10);
        
        browserResults.push({
          browser: config.name,
          issues: browserIssues,
          score: Math.max(0, Math.min(100, score)),
        });
        
        // Add browser-specific issues to the overall issues list
        if (browserIssues.length > 0) {
          issues.push(`${config.name} browser issues: ${browserIssues.length} found`);
        }
        
        await page.close();
      } catch (error) {
        await page.close();
        console.error(`Error testing ${config.name}:`, error);
        
        browserResults.push({
          browser: config.name,
          issues: [`Failed to load: ${(error as Error).message}`],
          score: 0,
        });
        
        issues.push(`${config.name} browser failed to load the page`);
      }
    }
    
    // Calculate overall browser compatibility score
    const totalScore = browserResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / browserResults.length);
    
    return {
      browserResults,
      issues,
      score,
    };
  }
  
  private async testVisualConsistency(browser: puppeteer.Browser, url: string): Promise<VisualConsistencyResult> {
    const visualResults = [];
    const issues: string[] = [];
    
    // Take screenshots in each browser
    const screenshots: Record<string, string> = {};
    
    for (const config of this.browserConfigs) {
      const page = await browser.newPage();
      
      // Set user agent to emulate different browsers
      await page.setUserAgent(config.userAgent);
      
      // Set viewport to desktop size
      await page.setViewport({ width: 1366, height: 768 });
      
      try {
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        const screenshot = await page.screenshot({ encoding: 'base64' });
        screenshots[config.name] = screenshot as string;
        
        // Check for visual elements
        const visualElements = await page.evaluate(() => {
          return {
            images: document.querySelectorAll('img').length,
            buttons: document.querySelectorAll('button, .button, [role="button"]').length,
            forms: document.querySelectorAll('form').length,
            tables: document.querySelectorAll('table').length,
            fonts: Array.from(document.querySelectorAll('*')).map(el => 
              window.getComputedStyle(el).fontFamily
            ).filter((v, i, a) => a.indexOf(v) === i).length,
          };
        });
        
        visualResults.push({
          browser: config.name,
          elements: visualElements,
          screenshot: `data:image/png;base64,${screenshot}`,
        });
        
        await page.close();
      } catch (error) {
        await page.close();
        console.error(`Error taking screenshot in ${config.name}:`, error);
        
        issues.push(`Failed to capture visual state in ${config.name}`);
      }
    }
    
    // Compare element counts across browsers
    if (visualResults.length > 1) {
      const baseElements = visualResults[0].elements;
      
      for (let i = 1; i < visualResults.length; i++) {
        const currentElements = visualResults[i].elements;
        
        if (baseElements.images !== currentElements.images) {
          issues.push(`Image count differs between ${visualResults[0].browser} (${baseElements.images}) and ${visualResults[i].browser} (${currentElements.images})`);
        }
        
        if (baseElements.buttons !== currentElements.buttons) {
          issues.push(`Button count differs between ${visualResults[0].browser} (${baseElements.buttons}) and ${visualResults[i].browser} (${currentElements.buttons})`);
        }
        
        if (baseElements.forms !== currentElements.forms) {
          issues.push(`Form count differs between ${visualResults[0].browser} (${baseElements.forms}) and ${visualResults[i].browser} (${currentElements.forms})`);
        }
        
        if (baseElements.tables !== currentElements.tables) {
          issues.push(`Table count differs between ${visualResults[0].browser} (${baseElements.tables}) and ${visualResults[i].browser} (${currentElements.tables})`);
        }
        
        if (Math.abs(baseElements.fonts - currentElements.fonts) > 2) {
          issues.push(`Font count differs significantly between ${visualResults[0].browser} (${baseElements.fonts}) and ${visualResults[i].browser} (${currentElements.fonts})`);
        }
      }
    }
    
    // Calculate score based on issues
    const score = Math.max(0, 100 - (issues.length * 15));
    
    return {
      visualResults,
      issues,
      score,
    };
  }
  
  private async testFeatureCompatibility(browser: puppeteer.Browser, url: string): Promise<FeatureCompatibilityResult> {
    const featureResults = [];
    const issues: string[] = [];
    
    // Features to test
    const features = [
      { name: 'Flexbox', test: 'return !!window.getComputedStyle(document.documentElement).flex;' },
      { name: 'Grid', test: 'return !!window.getComputedStyle(document.documentElement).grid;' },
      { name: 'CSS Variables', test: 'return window.CSS && window.CSS.supports && window.CSS.supports("--test", "0");' },
      { name: 'ES6 Features', test: 'try { eval("let a = () => {}; class Test {}; new Promise(() => {});"); return true; } catch(e) { return false; }' },
      { name: 'Fetch API', test: 'return typeof fetch === "function";' },
      { name: 'WebP Support', test: 'const canvas = document.createElement("canvas"); return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;' },
      { name: 'WebGL', test: 'try { const canvas = document.createElement("canvas"); return !!canvas.getContext("webgl") || !!canvas.getContext("experimental-webgl"); } catch(e) { return false; }' },
      { name: 'Local Storage', test: 'try { localStorage.setItem("test", "test"); localStorage.removeItem("test"); return true; } catch(e) { return false; }' },
      { name: 'Session Storage', test: 'try { sessionStorage.setItem("test", "test"); sessionStorage.removeItem("test"); return true; } catch(e) { return false; }' },
      { name: 'IndexedDB', test: 'return !!window.indexedDB;' },
    ];
    
    for (const config of this.browserConfigs) {
      const page = await browser.newPage();
      
      // Set user agent to emulate different browsers
      await page.setUserAgent(config.userAgent);
      
      try {
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Test each feature
        const results: Record<string, boolean> = {};
        
        for (const feature of features) {
          try {
            results[feature.name] = await page.evaluate(feature.test);
          } catch (error) {
            results[feature.name] = false;
          }
        }
        
        // Check for feature usage on the page
        const featureUsage = await page.evaluate(() => {
          return {
            usesFlexbox: !!Array.from(document.querySelectorAll('*')).find(el => 
              window.getComputedStyle(el).display === 'flex' || 
              window.getComputedStyle(el).display === 'inline-flex'
            ),
            usesGrid: !!Array.from(document.querySelectorAll('*')).find(el => 
              window.getComputedStyle(el).display === 'grid' || 
              window.getComputedStyle(el).display === 'inline-grid'
            ),
            usesCSSVariables: !!document.querySelector(':root') && 
              Object.keys(window.getComputedStyle(document.querySelector(':root'))).some(prop => prop.startsWith('--')),
            usesWebP: !!Array.from(document.querySelectorAll('img')).find(img => 
              img.src.endsWith('.webp') || img.srcset.includes('.webp')
            ),
          };
        });
        
        // Check for feature compatibility issues
        const browserIssues = [];
        
        if (featureUsage.usesFlexbox && !results['Flexbox']) {
          browserIssues.push('Page uses Flexbox but browser may not support it');
        }
        
        if (featureUsage.usesGrid && !results['Grid']) {
          browserIssues.push('Page uses CSS Grid but browser may not support it');
        }
        
        if (featureUsage.usesCSSVariables && !results['CSS Variables']) {
          browserIssues.push('Page uses CSS Variables but browser may not support them');
        }
        
        if (featureUsage.usesWebP && !results['WebP Support']) {
          browserIssues.push('Page uses WebP images but browser may not support them');
        }
        
        // Calculate browser score
        const supportedFeatures = Object.values(results).filter(Boolean).length;
        const score = Math.round((supportedFeatures / features.length) * 100);
        
        featureResults.push({
          browser: config.name,
          features: results,
          issues: browserIssues,
          score,
        });
        
        // Add browser-specific issues to the overall issues list
        if (browserIssues.length > 0) {
          issues.push(`${config.name} feature compatibility issues: ${browserIssues.join(', ')}`);
        }
        
        await page.close();
      } catch (error) {
        await page.close();
        console.error(`Error testing features in ${config.name}:`, error);
        
        issues.push(`Failed to test features in ${config.name}`);
      }
    }
    
    // Calculate overall feature compatibility score
    const totalScore = featureResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / featureResults.length);
    
    return {
      featureResults,
      issues,
      score,
    };
  }
  
  private async testResponsiveConsistency(browser: puppeteer.Browser, url: string): Promise<ResponsiveConsistencyResult> {
    const responsiveResults = [];
    const issues: string[] = [];
    
    // Test each browser at different viewport sizes
    for (const config of this.browserConfigs) {
      const viewportTests = [];
      
      for (const viewport of this.viewportSizes) {
        const page = await browser.newPage();
        
        // Set user agent to emulate different browsers
        await page.setUserAgent(config.userAgent);
        
        // Set viewport size
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
        });
        
        try {
          // Navigate to the URL
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Check for responsive issues
          const responsiveIssues = await page.evaluate(() => {
            const issues = [];
            
            // Check for horizontal overflow
            if (document.body.scrollWidth > window.innerWidth) {
              issues.push('Horizontal scrollbar detected');
            }
            
            // Check for elements extending beyond viewport
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > window.innerWidth + 5) { // 5px tolerance
                issues.push(`Element extends beyond viewport width`);
                break; // Only report once
              }
            }
            
            // Check for tiny text
            const textElements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, li, td, th');
            for (const el of textElements) {
              const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
              if (fontSize < 12 && el.textContent?.trim()) {
                issues.push('Text smaller than 12px detected');
                break; // Only report once
              }
            }
            
            // Check for touch targets
            if (window.innerWidth < 768) { // Only check on mobile viewports
              const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
              for (const el of interactiveElements) {
                const rect = el.getBoundingClientRect();
                if ((rect.width < 44 || rect.height < 44) && 
                    rect.width > 0 && rect.height > 0 && 
                    el.offsetParent !== null) { // Check if element is visible
                  issues.push('Touch targets smaller than 44x44px detected');
                  break; // Only report once
                }
              }
            }
            
            return issues;
          });
          
          // Take screenshot
          const screenshot = await page.screenshot({ encoding: 'base64' });
          
          viewportTests.push({
            viewport: viewport.name,
            width: viewport.width,
            height: viewport.height,
            issues: responsiveIssues,
            screenshot: `data:image/png;base64,${screenshot}`,
          });
          
          // Add viewport-specific issues to the overall issues list
          if (responsiveIssues.length > 0) {
            issues.push(`${config.name} at ${viewport.name} (${viewport.width}x${viewport.height}) has ${responsiveIssues.length} responsive issues`);
          }
          
          await page.close();
        } catch (error) {
          await page.close();
          console.error(`Error testing ${config.name} at ${viewport.name}:`, error);
          
          viewportTests.push({
            viewport: viewport.name,
            width: viewport.width,
            height: viewport.height,
            issues: [`Failed to load: ${(error as Error).message}`],
            screenshot: '',
          });
          
          issues.push(`Failed to test ${config.name} at ${viewport.name} viewport`);
        }
      }
      
      // Calculate browser responsive score
      const viewportIssueCount = viewportTests.reduce((sum, test) => sum + test.issues.length, 0);
      const score = Math.max(0, 100 - (viewportIssueCount * 5));
      
      responsiveResults.push({
        browser: config.name,
        viewportTests,
        score,
      });
    }
    
    // Calculate overall responsive consistency score
    const totalScore = responsiveResults.reduce((sum, result) => sum + result.score, 0);
    const score = Math.round(totalScore / responsiveResults.length);
    
    return {
      responsiveResults,
      issues,
      score,
    };
  }
}
