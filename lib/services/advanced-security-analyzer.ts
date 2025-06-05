// src/lib/services/advanced-security-analyzer.ts
// Advanced security analyzer service for comprehensive security audits

import axios from 'axios';
import * as https from 'https';
import * as cheerio from 'cheerio';
import { BaseAnalyzer } from './base-analyzer';
import { 
  SecurityAnalysisResult,
  SSLAnalysis,
  SecurityHeadersAnalysis,
  VulnerabilityAnalysis,
  ContentSecurityAnalysis,
  MixedContentAnalysis
} from '../types/advanced-audit';

export class AdvancedSecurityAnalyzer extends BaseAnalyzer {
  async analyze(url: string): Promise<SecurityAnalysisResult> {
    try {
      // Ensure URL uses HTTPS
      const secureUrl = url.replace(/^http:\/\//i, 'https://');
      
      // Make request with custom agent to capture SSL details
      const agent = new https.Agent({ 
        rejectUnauthorized: false, // Allow self-signed certificates for analysis
      });
      
      const response = await axios.get(secureUrl, {
        headers: {
          'User-Agent': 'AutomatIQ-Website-Auditor/1.0',
        },
        httpsAgent: agent,
        validateStatus: () => true, // Accept any status code
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Analyze SSL certificate
      const ssl = await this.analyzeSSL(secureUrl);
      
      // Analyze security headers
      const headers = this.analyzeSecurityHeaders(response.headers);
      
      // Analyze content security policy
      const contentSecurity = this.analyzeContentSecurity(response.headers);
      
      // Check for mixed content
      const mixedContent = this.analyzeMixedContent($, secureUrl);
      
      // Analyze for common vulnerabilities
      const vulnerabilities = this.analyzeVulnerabilities($, response.headers);
      
      // Calculate overall security score
      const score = this.calculateWeightedScore([
        { score: ssl.score, weight: 2.0 },
        { score: headers.score, weight: 1.5 },
        { score: contentSecurity.score, weight: 1.5 },
        { score: mixedContent.score, weight: 1.0 },
        { score: vulnerabilities.score, weight: 2.0 },
      ]);
      
      return {
        score,
        ssl,
        headers,
        vulnerabilities,
        contentSecurity,
        mixedContent,
      };
    } catch (error) {
      console.error('Error in security analysis:', error);
      throw new Error(`Security analysis failed: ${(error as Error).message}`);
    }
  }
  
  private async analyzeSSL(url: string): Promise<SSLAnalysis> {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      
      if (!isHttps) {
        return {
          enabled: false,
          validCertificate: false,
          issues: ['Site is not using HTTPS'],
          score: 0,
        };
      }
      
      // In a full implementation, we would use a library like node-forge
      // to analyze the certificate in detail. For now, we'll do a basic check.
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });
      
      // Check if connection was secure
      const validCertificate = response.request.res.socket.authorized;
      
      // Get certificate details if available
      const cert = response.request.res.socket.getPeerCertificate();
      
      const issues: string[] = [];
      if (!validCertificate) {
        issues.push('Invalid SSL certificate');
      }
      
      if (cert && cert.valid_to) {
        const expiryDate = new Date(cert.valid_to);
        const now = new Date();
        const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry < 30) {
          issues.push(`SSL certificate expires soon (${daysToExpiry} days)`);
        }
      }
      
      // Calculate score
      const score = validCertificate ? (issues.length > 0 ? 70 : 100) : 30;
      
      return {
        enabled: true,
        validCertificate,
        grade: validCertificate ? (issues.length > 0 ? 'B' : 'A') : 'F',
        expiryDate: cert && cert.valid_to ? new Date(cert.valid_to) : undefined,
        issuer: cert && cert.issuer ? cert.issuer.CN : undefined,
        protocol: response.request.res.socket.getProtocol?.() || undefined,
        keyStrength: cert && cert.bits ? cert.bits : undefined,
        issues,
        score,
      };
    } catch (error) {
      console.error('Error analyzing SSL:', error);
      return {
        enabled: false,
        validCertificate: false,
        issues: [`Error analyzing SSL: ${(error as Error).message}`],
        score: 0,
      };
    }
  }
  
  private analyzeSecurityHeaders(headers: Record<string, string>): SecurityHeadersAnalysis {
    const normalizedHeaders: Record<string, string> = {};
    
    // Normalize header names (case-insensitive)
    Object.keys(headers).forEach(key => {
      normalizedHeaders[key.toLowerCase()] = headers[key];
    });
    
    // Check for security headers
    const strictTransportSecurity = {
      exists: 'strict-transport-security' in normalizedHeaders,
      value: normalizedHeaders['strict-transport-security'],
      issues: [] as string[],
    };
    
    if (!strictTransportSecurity.exists) {
      strictTransportSecurity.issues.push('Missing Strict-Transport-Security header');
    } else if (!strictTransportSecurity.value?.includes('max-age=')) {
      strictTransportSecurity.issues.push('Strict-Transport-Security header missing max-age directive');
    }
    
    const xContentTypeOptions = {
      exists: 'x-content-type-options' in normalizedHeaders,
      value: normalizedHeaders['x-content-type-options'],
      issues: [] as string[],
    };
    
    if (!xContentTypeOptions.exists) {
      xContentTypeOptions.issues.push('Missing X-Content-Type-Options header');
    } else if (xContentTypeOptions.value !== 'nosniff') {
      xContentTypeOptions.issues.push('X-Content-Type-Options should be set to nosniff');
    }
    
    const xFrameOptions = {
      exists: 'x-frame-options' in normalizedHeaders,
      value: normalizedHeaders['x-frame-options'],
      issues: [] as string[],
    };
    
    if (!xFrameOptions.exists) {
      xFrameOptions.issues.push('Missing X-Frame-Options header');
    }
    
    const contentSecurityPolicy = {
      exists: 'content-security-policy' in normalizedHeaders,
      value: normalizedHeaders['content-security-policy'],
      issues: [] as string[],
    };
    
    if (!contentSecurityPolicy.exists) {
      contentSecurityPolicy.issues.push('Missing Content-Security-Policy header');
    }
    
    const referrerPolicy = {
      exists: 'referrer-policy' in normalizedHeaders,
      value: normalizedHeaders['referrer-policy'],
      issues: [] as string[],
    };
    
    if (!referrerPolicy.exists) {
      referrerPolicy.issues.push('Missing Referrer-Policy header');
    }
    
    const permissionsPolicy = {
      exists: 'permissions-policy' in normalizedHeaders || 'feature-policy' in normalizedHeaders,
      value: normalizedHeaders['permissions-policy'] || normalizedHeaders['feature-policy'],
      issues: [] as string[],
    };
    
    if (!permissionsPolicy.exists) {
      permissionsPolicy.issues.push('Missing Permissions-Policy header');
    }
    
    // Calculate score based on header presence
    const totalHeaders = 6;
    const presentHeaders = [
      strictTransportSecurity.exists,
      xContentTypeOptions.exists,
      xFrameOptions.exists,
      contentSecurityPolicy.exists,
      referrerPolicy.exists,
      permissionsPolicy.exists,
    ].filter(Boolean).length;
    
    const score = Math.round((presentHeaders / totalHeaders) * 100);
    
    return {
      strictTransportSecurity,
      xContentTypeOptions,
      xFrameOptions,
      contentSecurityPolicy,
      referrerPolicy,
      permissionsPolicy,
      score,
    };
  }
  
  private analyzeContentSecurity(headers: Record<string, string>): ContentSecurityAnalysis {
    const normalizedHeaders: Record<string, string> = {};
    
    // Normalize header names (case-insensitive)
    Object.keys(headers).forEach(key => {
      normalizedHeaders[key.toLowerCase()] = headers[key];
    });
    
    const cspHeader = normalizedHeaders['content-security-policy'];
    const hasCSP = !!cspHeader;
    
    const policies: Record<string, string> = {};
    const issues: string[] = [];
    
    if (hasCSP) {
      // Parse CSP directives
      const directives = cspHeader.split(';').map(d => d.trim());
      
      directives.forEach(directive => {
        const [key, ...values] = directive.split(/\s+/);
        if (key) {
          policies[key] = values.join(' ');
        }
      });
      
      // Check for unsafe directives
      if (policies['default-src']?.includes("'unsafe-inline'") || 
          policies['script-src']?.includes("'unsafe-inline'") ||
          policies['style-src']?.includes("'unsafe-inline'")) {
        issues.push("CSP uses 'unsafe-inline' which reduces security");
      }
      
      if (policies['default-src']?.includes("'unsafe-eval'") || 
          policies['script-src']?.includes("'unsafe-eval'")) {
        issues.push("CSP uses 'unsafe-eval' which reduces security");
      }
      
      // Check for missing key directives
      if (!policies['default-src']) {
        issues.push('CSP missing default-src directive');
      }
      
      if (!policies['script-src'] && !policies['default-src']) {
        issues.push('CSP missing script-src directive');
      }
    } else {
      issues.push('Content Security Policy (CSP) not implemented');
    }
    
    // Determine if CSP is strict
    const strictCSP = hasCSP && 
                     !Object.values(policies).some(v => 
                       v.includes("'unsafe-inline'") || 
                       v.includes("'unsafe-eval'") ||
                       v === '*');
    
    // Calculate score
    const score = hasCSP ? (strictCSP ? 100 : 70) : 0;
    
    return {
      hasCSP,
      policies,
      strictCSP,
      issues,
      score,
    };
  }
  
  private analyzeMixedContent($: cheerio.CheerioAPI, url: string): MixedContentAnalysis {
    const isHttps = url.startsWith('https://');
    const mixedContentItems: Array<{ url: string; type: string }> = [];
    const issues: string[] = [];
    
    if (!isHttps) {
      return {
        hasMixedContent: false,
        mixedContentItems: [],
        issues: ['Site is not using HTTPS, so mixed content is not applicable'],
        score: 0,
      };
    }
    
    // Check for mixed content in various elements
    $('img[src^="http:"], script[src^="http:"], link[href^="http:"][rel="stylesheet"], iframe[src^="http:"], object[data^="http:"], embed[src^="http:"], video[src^="http:"], audio[src^="http:"]').each((i, el) => {
      const $el = $(el);
      const src = $el.attr('src') || $el.attr('href') || $el.attr('data') || '';
      
      if (src.startsWith('http:')) {
        mixedContentItems.push({
          url: src,
          type: el.name,
        });
      }
    });
    
    const hasMixedContent = mixedContentItems.length > 0;
    
    if (hasMixedContent) {
      issues.push(`Found ${mixedContentItems.length} mixed content resources on HTTPS site`);
    }
    
    // Calculate score
    const score = hasMixedContent ? Math.max(0, 100 - (mixedContentItems.length * 10)) : 100;
    
    return {
      hasMixedContent,
      mixedContentItems,
      issues,
      score,
    };
  }
  
  private analyzeVulnerabilities($: cheerio.CheerioAPI, headers: Record<string, string>): VulnerabilityAnalysis {
    const vulnerabilities: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }> = [];
    
    // Check for common vulnerabilities
    
    // 1. Check for jQuery and its version
    const jqueryVersions = this.extractJQueryVersion($);
    if (jqueryVersions.length > 0) {
      const oldVersions = jqueryVersions.filter(v => {
        const match = v.match(/^(\d+)\.(\d+)\.(\d+)$/);
        if (!match) return false;
        
        const [, major, minor, patch] = match.map(Number);
        // jQuery versions below 3.5.0 have known XSS vulnerabilities
        return major < 3 || (major === 3 && minor < 5);
      });
      
      if (oldVersions.length > 0) {
        vulnerabilities.push({
          type: 'outdated-jquery',
          severity: 'high',
          description: `Using outdated jQuery version(s): ${oldVersions.join(', ')}`,
          recommendation: 'Update to jQuery 3.5.0 or newer to avoid known XSS vulnerabilities',
        });
      }
    }
    
    // 2. Check for exposed sensitive files
    $('a[href$=".sql"], a[href$=".bak"], a[href$=".config"], a[href$=".env"], a[href*="phpinfo.php"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      vulnerabilities.push({
        type: 'exposed-sensitive-file',
        severity: 'critical',
        description: `Potentially sensitive file exposed: ${href}`,
        recommendation: 'Remove or restrict access to sensitive files',
      });
    });
    
    // 3. Check for missing security headers (already done in analyzeSecurityHeaders)
    const normalizedHeaders: Record<string, string> = {};
    Object.keys(headers).forEach(key => {
      normalizedHeaders[key.toLowerCase()] = headers[key];
    });
    
    if (!normalizedHeaders['x-xss-protection']) {
      vulnerabilities.push({
        type: 'missing-xss-protection',
        severity: 'medium',
        description: 'Missing X-XSS-Protection header',
        recommendation: 'Add X-XSS-Protection: 1; mode=block header',
      });
    }
    
    // 4. Check for insecure form submission
    $('form[action^="http:"]').each((i, el) => {
      vulnerabilities.push({
        type: 'insecure-form',
        severity: 'high',
        description: 'Form submitting data over unencrypted HTTP',
        recommendation: 'Use HTTPS for all form submissions',
      });
    });
    
    // Count vulnerabilities by severity
    const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulnerabilities = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulnerabilities = vulnerabilities.filter(v => v.severity === 'medium').length;
    const lowVulnerabilities = vulnerabilities.filter(v => v.severity === 'low').length;
    
    // Calculate score based on vulnerability severity
    const score = Math.max(0, 100 - 
      (criticalVulnerabilities * 25) - 
      (highVulnerabilities * 15) - 
      (mediumVulnerabilities * 10) - 
      (lowVulnerabilities * 5));
    
    return {
      vulnerabilitiesFound: vulnerabilities.length,
      criticalVulnerabilities,
      highVulnerabilities,
      mediumVulnerabilities,
      lowVulnerabilities,
      details: vulnerabilities,
      score,
    };
  }
  
  private extractJQueryVersion($: cheerio.CheerioAPI): string[] {
    const versions: string[] = [];
    
    // Check script tags for jQuery
    $('script').each((i, el) => {
      const src = $(el).attr('src') || '';
      const content = $(el).html() || '';
      
      // Check src attribute for version
      const srcMatch = src.match(/jquery[.-](\d+\.\d+\.\d+)(\.min)?\.js/i);
      if (srcMatch) {
        versions.push(srcMatch[1]);
      }
      
      // Check inline script content for version
      const contentMatch = content.match(/jQuery\s+v(\d+\.\d+\.\d+)/i);
      if (contentMatch) {
        versions.push(contentMatch[1]);
      }
    });
    
    return [...new Set(versions)]; // Remove duplicates
  }
}
