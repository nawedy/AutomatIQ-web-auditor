// src/lib/services/advanced-performance-analyzer.ts
// Advanced performance analyzer service using Lighthouse and Puppeteer

import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { BaseAnalyzer } from './base-analyzer';
import { 
  PerformanceAnalysisResult,
  CoreWebVitals,
  PerformanceMetrics,
  PerformanceOpportunities,
  PerformanceDiagnostics
} from '../types/advanced-audit';

export class AdvancedPerformanceAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<PerformanceAnalysisResult> {
    try {
      // Launch a browser instance
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Create a new page
      const page = await browser.newPage();
      
      // Get the Chrome DevTools Protocol (CDP) endpoint
      const client = await page.target().createCDPSession();
      
      // Run Lighthouse
      const { lhr } = await lighthouse(url, {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
      });
      
      // Extract core web vitals
      const coreWebVitals = this.extractCoreWebVitals(lhr);
      
      // Extract performance metrics
      const metrics = this.extractPerformanceMetrics(lhr);
      
      // Extract opportunities for improvement
      const opportunities = this.extractOpportunities(lhr);
      
      // Extract diagnostics
      const diagnostics = this.extractDiagnostics(lhr);
      
      // Close the browser
      await browser.close();
      
      // Calculate overall score
      const score = Math.round(lhr.categories.performance.score * 100);
      
      return {
        score,
        coreWebVitals,
        metrics,
        opportunities,
        diagnostics,
      };
    } catch (error) {
      console.error('Error in performance analysis:', error);
      throw new Error(`Performance analysis failed: ${(error as Error).message}`);
    }
  }
  
  private extractCoreWebVitals(lhr: any): CoreWebVitals {
    const lcpAudit = lhr.audits['largest-contentful-paint'];
    const fidAudit = lhr.audits['max-potential-fid'] || lhr.audits['total-blocking-time']; // FID proxy
    const clsAudit = lhr.audits['cumulative-layout-shift'];
    const ttfbAudit = lhr.audits['server-response-time'];
    const inpAudit = lhr.audits['interactive']; // INP proxy
    
    return {
      lcp: {
        value: lcpAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((lcpAudit?.score || 0) * 100),
      },
      fid: {
        value: fidAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((fidAudit?.score || 0) * 100),
      },
      cls: {
        value: clsAudit?.numericValue || 0,
        unit: '',
        score: Math.round((clsAudit?.score || 0) * 100),
      },
      ttfb: {
        value: ttfbAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((ttfbAudit?.score || 0) * 100),
      },
      inp: {
        value: inpAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((inpAudit?.score || 0) * 100),
      },
    };
  }
  
  private extractPerformanceMetrics(lhr: any): PerformanceMetrics {
    const fcpAudit = lhr.audits['first-contentful-paint'];
    const siAudit = lhr.audits['speed-index'];
    const ttiAudit = lhr.audits['interactive'];
    const tbtAudit = lhr.audits['total-blocking-time'];
    
    return {
      firstContentfulPaint: {
        value: fcpAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((fcpAudit?.score || 0) * 100),
      },
      speedIndex: {
        value: siAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((siAudit?.score || 0) * 100),
      },
      timeToInteractive: {
        value: ttiAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((ttiAudit?.score || 0) * 100),
      },
      totalBlockingTime: {
        value: tbtAudit?.numericValue || 0,
        unit: 'ms',
        score: Math.round((tbtAudit?.score || 0) * 100),
      },
    };
  }
  
  private extractOpportunities(lhr: any): PerformanceOpportunities {
    const properImageSizingAudit = lhr.audits['uses-responsive-images'] || lhr.audits['uses-optimized-images'];
    const renderBlockingResourcesAudit = lhr.audits['render-blocking-resources'];
    const unusedCssAudit = lhr.audits['unused-css-rules'];
    const unusedJsAudit = lhr.audits['unused-javascript'];
    const textCompressionAudit = lhr.audits['uses-text-compression'];
    
    return {
      properImageSizing: {
        wastedBytes: properImageSizingAudit?.details?.overallSavingsBytes,
        items: (properImageSizingAudit?.details?.items || []).map((item: any) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
        })),
      },
      renderBlockingResources: {
        wastedMs: renderBlockingResourcesAudit?.details?.overallSavingsMs,
        items: (renderBlockingResourcesAudit?.details?.items || []).map((item: any) => ({
          url: item.url,
          wastedMs: item.wastedMs,
        })),
      },
      unusedCss: {
        wastedBytes: unusedCssAudit?.details?.overallSavingsBytes,
        items: (unusedCssAudit?.details?.items || []).map((item: any) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
        })),
      },
      unusedJavaScript: {
        wastedBytes: unusedJsAudit?.details?.overallSavingsBytes,
        items: (unusedJsAudit?.details?.items || []).map((item: any) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
        })),
      },
      textCompression: {
        wastedBytes: textCompressionAudit?.details?.overallSavingsBytes,
        items: (textCompressionAudit?.details?.items || []).map((item: any) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
        })),
      },
    };
  }
  
  private extractDiagnostics(lhr: any): PerformanceDiagnostics {
    const mainThreadWorkAudit = lhr.audits['mainthread-work-breakdown'];
    const bootupTimeAudit = lhr.audits['bootup-time'];
    const networkRequestsAudit = lhr.audits['network-requests'];
    const networkRttAudit = lhr.audits['network-rtt'];
    const totalByteWeightAudit = lhr.audits['total-byte-weight'];
    const domSizeAudit = lhr.audits['dom-size'];
    
    return {
      mainThreadWork: {
        value: mainThreadWorkAudit?.numericValue || 0,
        unit: 'ms',
      },
      bootupTime: {
        value: bootupTimeAudit?.numericValue || 0,
        unit: 'ms',
      },
      networkRequests: {
        value: (networkRequestsAudit?.details?.items || []).length,
      },
      networkRtt: {
        value: networkRttAudit?.numericValue || 0,
        unit: 'ms',
      },
      totalByteWeight: {
        value: totalByteWeightAudit?.numericValue || 0,
        unit: 'bytes',
      },
      domSize: {
        value: domSizeAudit?.numericValue || 0,
        unit: 'elements',
      },
    };
  }
}
