// src/lib/types/advanced-audit.ts
// Types for advanced audit features

export interface AdvancedAuditOptions {
  seo: boolean;
  performance: boolean;
  accessibility: boolean;
  security: boolean;
  mobile: boolean;
  content: boolean;
  crossBrowser: boolean;
  analytics: boolean;
  technicalSeo: boolean;
  bestPractices: boolean;
}

export interface ContinuousMonitoringOptions extends AdvancedAuditOptions {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly/biweekly
  dayOfMonth?: number; // 1-31 for monthly
  timeOfDay: string; // HH:MM in 24h format
}

export interface NotificationOptions {
  email: boolean;
  slack: boolean;
  slackWebhook?: string;
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
  scoreThreshold?: number;
}

// SEO Analysis Types
export interface SEOAnalysisResult {
  score: number;
  metaTags: MetaTagsAnalysis;
  headings: HeadingStructureAnalysis;
  keywords: KeywordAnalysis;
  links: LinkAnalysis;
  images: ImageAnalysis;
  schema: SchemaMarkupAnalysis;
  canonicalization: CanonicalAnalysis;
  socialTags: SocialTagsAnalysis;
  indexability: IndexabilityAnalysis;
  technicalSeo: TechnicalSEOAnalysis;
}

export interface MetaTagsAnalysis {
  title: {
    exists: boolean;
    length: number;
    content?: string;
    issues: string[];
  };
  description: {
    exists: boolean;
    length: number;
    content?: string;
    issues: string[];
  };
  robots: {
    exists: boolean;
    content?: string;
    issues: string[];
  };
  viewport: {
    exists: boolean;
    content?: string;
    issues: string[];
  };
  canonical: {
    exists: boolean;
    content?: string;
    issues: string[];
  };
  score: number;
}

export interface HeadingStructureAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  hasProperStructure: boolean;
  headings: Array<{
    type: string;
    content: string;
    issues?: string[];
  }>;
  issues: string[];
  score: number;
}

export interface KeywordAnalysis {
  primaryKeyword?: string;
  primaryKeywordDensity?: number;
  secondaryKeywords: Array<{
    keyword: string;
    density: number;
  }>;
  titleContainsKeyword: boolean;
  descriptionContainsKeyword: boolean;
  h1ContainsKeyword: boolean;
  urlContainsKeyword: boolean;
  issues: string[];
  score: number;
}

export interface LinkAnalysis {
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  noFollowLinks: number;
  linkDetails: Array<{
    url: string;
    text: string;
    isInternal: boolean;
    isNoFollow: boolean;
    isBroken?: boolean;
  }>;
  issues: string[];
  score: number;
}

export interface ImageAnalysis {
  totalImages: number;
  missingAlt: number;
  largeImages: number;
  imageDetails: Array<{
    src: string;
    alt?: string;
    size?: number;
    issues: string[];
  }>;
  issues: string[];
  score: number;
}

export interface SchemaMarkupAnalysis {
  hasSchema: boolean;
  schemaTypes: string[];
  isValid: boolean;
  issues: string[];
  score: number;
}

export interface CanonicalAnalysis {
  hasCanonical: boolean;
  canonicalUrl?: string;
  isSelf: boolean;
  issues: string[];
  score: number;
}

export interface SocialTagsAnalysis {
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  openGraphTags: Record<string, string>;
  twitterCardTags: Record<string, string>;
  issues: string[];
  score: number;
}

export interface IndexabilityAnalysis {
  isIndexable: boolean;
  robotsTxt: {
    exists: boolean;
    content?: string;
    blocks: boolean;
  };
  metaRobots: {
    exists: boolean;
    content?: string;
    blocks: boolean;
  };
  issues: string[];
  score: number;
}

export interface TechnicalSEOAnalysis {
  hasSitemap: boolean;
  sitemapUrl?: string;
  hasStructuredData: boolean;
  hasHreflang: boolean;
  hasBreadcrumbs: boolean;
  pageSpeed: {
    score: number;
    issues: string[];
  };
  mobileCompatibility: {
    isCompatible: boolean;
    issues: string[];
  };
  issues: string[];
  score: number;
}

// Performance Analysis Types
export interface PerformanceAnalysisResult {
  score: number;
  coreWebVitals: CoreWebVitals;
  metrics: PerformanceMetrics;
  opportunities: PerformanceOpportunities;
  diagnostics: PerformanceDiagnostics;
}

export interface CoreWebVitals {
  lcp: {
    value: number;
    unit: string;
    score: number;
  };
  fid: {
    value: number;
    unit: string;
    score: number;
  };
  cls: {
    value: number;
    unit: string;
    score: number;
  };
  ttfb: {
    value: number;
    unit: string;
    score: number;
  };
  inp: {
    value: number;
    unit: string;
    score: number;
  };
}

export interface PerformanceMetrics {
  firstContentfulPaint: {
    value: number;
    unit: string;
    score: number;
  };
  speedIndex: {
    value: number;
    unit: string;
    score: number;
  };
  timeToInteractive: {
    value: number;
    unit: string;
    score: number;
  };
  totalBlockingTime: {
    value: number;
    unit: string;
    score: number;
  };
}

export interface PerformanceOpportunities {
  properImageSizing: {
    wastedBytes?: number;
    items: Array<{
      url: string;
      wastedBytes: number;
      totalBytes: number;
    }>;
  };
  renderBlockingResources: {
    wastedMs?: number;
    items: Array<{
      url: string;
      wastedMs: number;
    }>;
  };
  unusedCss: {
    wastedBytes?: number;
    items: Array<{
      url: string;
      wastedBytes: number;
      totalBytes: number;
    }>;
  };
  unusedJavaScript: {
    wastedBytes?: number;
    items: Array<{
      url: string;
      wastedBytes: number;
      totalBytes: number;
    }>;
  };
  textCompression: {
    wastedBytes?: number;
    items: Array<{
      url: string;
      wastedBytes: number;
      totalBytes: number;
    }>;
  };
}

export interface PerformanceDiagnostics {
  mainThreadWork: {
    value: number;
    unit: string;
  };
  bootupTime: {
    value: number;
    unit: string;
  };
  networkRequests: {
    value: number;
  };
  networkRtt: {
    value: number;
    unit: string;
  };
  totalByteWeight: {
    value: number;
    unit: string;
  };
  domSize: {
    value: number;
    unit: string;
  };
}

// Accessibility Analysis Types
export interface AccessibilityAnalysisResult {
  score: number;
  wcagCompliance: WCAGCompliance;
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  incomplete: AccessibilityIncomplete[];
  summary: AccessibilitySummary;
}

export interface WCAGCompliance {
  aCompliance: number; // percentage
  aaCompliance: number; // percentage
  aaaCompliance: number; // percentage
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  nodes: number;
  wcagCriteria: string[];
}

export interface AccessibilityPass {
  id: string;
  description: string;
  nodes: number;
}

export interface AccessibilityIncomplete {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  nodes: number;
}

export interface AccessibilitySummary {
  totalViolations: number;
  criticalViolations: number;
  seriousViolations: number;
  moderateViolations: number;
  minorViolations: number;
  totalPasses: number;
  totalIncomplete: number;
}

// Security Analysis Types
export interface SecurityAnalysisResult {
  score: number;
  ssl: SSLAnalysis;
  headers: SecurityHeadersAnalysis;
  vulnerabilities: VulnerabilityAnalysis;
  contentSecurity: ContentSecurityAnalysis;
  mixedContent: MixedContentAnalysis;
}

export interface SSLAnalysis {
  enabled: boolean;
  validCertificate: boolean;
  grade?: string;
  expiryDate?: Date;
  issuer?: string;
  protocol?: string;
  keyStrength?: number;
  issues: string[];
  score: number;
}

export interface SecurityHeadersAnalysis {
  strictTransportSecurity: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  xContentTypeOptions: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  xFrameOptions: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  contentSecurityPolicy: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  referrerPolicy: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  permissionsPolicy: {
    exists: boolean;
    value?: string;
    issues: string[];
  };
  score: number;
}

export interface VulnerabilityAnalysis {
  vulnerabilitiesFound: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  details: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
}

export interface ContentSecurityAnalysis {
  hasCSP: boolean;
  policies: Record<string, string>;
  strictCSP: boolean;
  issues: string[];
  score: number;
}

export interface MixedContentAnalysis {
  hasMixedContent: boolean;
  mixedContentItems: Array<{
    url: string;
    type: string;
  }>;
  issues: string[];
  score: number;
}

// Mobile UX Analysis Types
export interface MobileUXAnalysisResult {
  score: number;
  viewport: ViewportAnalysis;
  touchTargets: TouchTargetAnalysis;
  fontSizes: FontSizeAnalysis;
  tapableElements: TapableElementAnalysis;
  responsiveDesign: ResponsiveDesignAnalysis;
}

export interface ViewportAnalysis {
  hasViewport: boolean;
  isConfigured: boolean;
  content?: string;
  issues: string[];
  score: number;
}

export interface TouchTargetAnalysis {
  adequateTargets: number;
  inadequateTargets: number;
  targetDetails: Array<{
    element: string;
    size: {
      width: number;
      height: number;
    };
    isAdequate: boolean;
  }>;
  issues: string[];
  score: number;
}

export interface FontSizeAnalysis {
  adequateFonts: number;
  smallFonts: number;
  fontDetails: Array<{
    element: string;
    size: number;
    isAdequate: boolean;
  }>;
  issues: string[];
  score: number;
}

export interface TapableElementAnalysis {
  adequateSpacing: number;
  inadequateSpacing: number;
  elementDetails: Array<{
    element: string;
    spacing: number;
    isAdequate: boolean;
  }>;
  issues: string[];
  score: number;
}

export interface ResponsiveDesignAnalysis {
  isResponsive: boolean;
  breakpoints: Array<{
    width: number;
    issues: string[];
  }>;
  mediaQueries: number;
  issues: string[];
  score: number;
}

// Content Quality Analysis Types
export interface ContentQualityAnalysisResult {
  score: number;
  readability: ReadabilityAnalysis;
  grammar: GrammarAnalysis;
  sentiment: SentimentAnalysis;
  keywords: ContentKeywordAnalysis;
  structure: ContentStructureAnalysis;
  uniqueness: ContentUniquenessAnalysis;
}

export interface ReadabilityAnalysis {
  fleschKincaidScore: number;
  fleschKincaidGrade: string;
  smogIndex: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
  averageGradeLevel: number;
  averageSentenceLength: number;
  averageWordLength: number;
  issues: string[];
  score: number;
}

export interface GrammarAnalysis {
  grammarErrors: number;
  spellingErrors: number;
  styleIssues: number;
  errorDetails: Array<{
    type: string;
    message: string;
    offset: number;
    length: number;
    context: string;
  }>;
  issues: string[];
  score: number;
}

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0
  magnitude: number; // 0.0 to +inf
  sentiment: 'very negative' | 'negative' | 'neutral' | 'positive' | 'very positive';
  issues: string[];
}

export interface ContentKeywordAnalysis {
  primaryKeyword?: string;
  primaryKeywordDensity?: number;
  keywordFrequency: Record<string, number>;
  keywordRelevance: Record<string, number>;
  issues: string[];
  score: number;
}

export interface ContentStructureAnalysis {
  paragraphCount: number;
  averageParagraphLength: number;
  sentenceCount: number;
  wordCount: number;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  subheadingDensity: number;
  issues: string[];
  score: number;
}

export interface ContentUniquenessAnalysis {
  uniquenessScore: number;
  potentialDuplicates: Array<{
    url: string;
    similarityScore: number;
  }>;
  issues: string[];
  score: number;
}

// Cross-Browser Testing Types
export interface CrossBrowserTestingResult {
  score: number;
  browsers: Array<BrowserTestResult>;
  summary: CrossBrowserSummary;
}

export interface CrossBrowserAnalysisResult {
  score: number;
  browserCompatibility: BrowserCompatibilityResult;
  visualConsistency: VisualConsistencyResult;
  featureCompatibility: FeatureCompatibilityResult;
  responsiveConsistency: ResponsiveConsistencyResult;
  issues: string[];
}

export interface BrowserCompatibilityResult {
  browserResults: any[];
  issues: string[];
  score: number;
}

export interface VisualConsistencyResult {
  comparisonResults: any[];
  issues: string[];
  score: number;
}

export interface FeatureCompatibilityResult {
  featureResults: any[];
  issues: string[];
  score: number;
}

export interface ResponsiveConsistencyResult {
  responsiveResults: any[];
  issues: string[];
  score: number;
}

export interface BrowserTestResult {
  browser: string;
  version: string;
  platform: string;
  screenshot?: string;
  visualDifference?: number;
  jsErrors: Array<{
    message: string;
    line: number;
    source: string;
  }>;
  cssIssues: Array<{
    selector: string;
    issue: string;
  }>;
  renderingIssues: Array<{
    element: string;
    issue: string;
  }>;
  score: number;
}

export interface CrossBrowserSummary {
  totalBrowsersTested: number;
  browsersPassed: number;
  browsersWithIssues: number;
  majorIssues: number;
  minorIssues: number;
}

// Analytics Integration Types
export interface AnalyticsIntegrationResult {
  score: number;
  hasAnalytics: boolean;
  providers: Array<{
    name: string;
    isConfigured: boolean;
    issues: string[];
  }>;
  trackingSetup: AnalyticsTrackingSetup;
  conversionTracking: ConversionTrackingAnalysis;
  issues: string[];
}

export interface AnalyticsTrackingSetup {
  pageViews: boolean;
  events: boolean;
  ecommerce: boolean;
  userProperties: boolean;
  issues: string[];
  score: number;
}

export interface ConversionTrackingAnalysis {
  hasConversionTracking: boolean;
  conversionPoints: number;
  goalSetup: boolean;
  ecommerceTracking: boolean;
  issues: string[];
  score: number;
}

// Chatbot Integration Types
export interface ChatbotIntegrationResult {
  score: number;
  hasChatbot: boolean;
  chatbotType: 'none' | 'traditional' | 'ai';
  chatbotProvider: string;
  chatbotPosition: string;
  chatbotVisibility: boolean;
  detectedElements: number;
  detectedIframes: number;
  detectedScripts: number;
  keywordMatches: string[];
  screenshot?: string;
  issues: string[];
  recommendations: string[];
}

// Audit Status Type
export type AuditStatus = 'queued' | 'running' | 'completed' | 'failed';

// Comprehensive Audit Result
export interface ComprehensiveAuditResult {
  url: string;
  score: number;
  categories: string[];
  timestamp: string;
  seo?: SEOAnalysisResult;
  performance?: PerformanceAnalysisResult;
  accessibility?: AccessibilityAnalysisResult;
  security?: SecurityAnalysisResult;
  mobile?: MobileUXAnalysisResult;
  content?: ContentQualityAnalysisResult;
  crossBrowser?: CrossBrowserTestingResult;
  analytics?: AnalyticsIntegrationResult;
  chatbot?: ChatbotIntegrationResult;
  technicalSeo?: TechnicalSEOAnalysis;
  summary?: {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    recommendations: string[];
  };
}
