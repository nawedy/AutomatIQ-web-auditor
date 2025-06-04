export interface AuditRequest {
  url: string
  options: AuditOptions
  userId?: string
}

export interface AuditOptions {
  seo: boolean
  performance: boolean
  accessibility: boolean
  security: boolean
  mobile: boolean
  content?: boolean
  bestPractices?: boolean
}

export interface AuditProgress {
  id: string
  url: string
  status: 'pending' | 'crawling' | 'analyzing' | 'completed' | 'failed'
  currentStep: string
  progress: number
  createdAt: Date
  updatedAt: Date
  estimatedCompletion?: Date
}

export interface SEOResults {
  score: number
  issues: SEOIssue[]
  suggestions: string[]
  metrics: {
    metaTags: {
      title: string | null
      description: string | null
      keywords: string | null
    }
    headings: {
      h1: number
      h2: number
      h3: number
      h4: number
      h5: number
      h6: number
    }
    images: {
      total: number
      missingAlt: number
      optimized: number
    }
    links: {
      internal: number
      external: number
      broken: number
    }
  }
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  category: 'meta' | 'headings' | 'images' | 'links' | 'structure'
  message: string
  element?: string
  url?: string
}

export interface PerformanceResults {
  score: number
  suggestions: string[]
  metrics: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    fcp: number // First Contentful Paint
    tti: number // Time to Interactive
    tbt: number // Total Blocking Time
    si: number  // Speed Index
  }
  opportunities: PerformanceOpportunity[]
  diagnostics: PerformanceDiagnostic[]
}

export interface PerformanceOpportunity {
  id: string
  title: string
  description: string
  savings: number
  wastedBytes?: number
  wastedMs?: number
}

export interface PerformanceDiagnostic {
  id: string
  title: string
  description: string
  score: number
  scoreDisplayMode: 'binary' | 'numeric' | 'informative'
}

export interface AccessibilityResults {
  score: number
  issues: AccessibilityIssue[]
  suggestions: string[]
  metrics: {
    violations: number
    incomplete: number
    passes: number
    inapplicable: number
  }
}

export interface AccessibilityIssue {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  tags: string[]
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
    failureSummary?: string
  }>
}

export interface SecurityResults {
  score: number
  issues: SecurityIssue[]
  suggestions: string[]
  metrics: {
    ssl: {
      valid: boolean
      issuer: string | null
      expires: Date | null
      algorithm: string | null
    }
    headers: {
      [key: string]: {
        present: boolean
        value?: string
        secure: boolean
      }
    }
    vulnerabilities: number
  }
}

export interface SecurityIssue {
  type: 'ssl' | 'headers' | 'content' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendation: string
}

export interface MobileResults {
  score: number
  issues: string[]
  suggestions: string[]
  metrics: {
    viewport: {
      configured: boolean
      width: string | null
    }
    touchTargets: {
      total: number
      tooSmall: number
      tooClose: number
    }
    readability: {
      fontSizeOk: boolean
      lineHeightOk: boolean
    }
    images: {
      responsive: number
      total: number
    }
  }
}

export interface ContentResults {
  score: number
  issues: string[]
  suggestions: string[]
  metrics: {
    readability: {
      fleschKincaid: number
      gunningFog: number
      averageSentenceLength: number
      averageWordsPerSentence: number
    }
    sentiment: {
      score: number
      magnitude: number
      overall: 'positive' | 'neutral' | 'negative'
    }
    structure: {
      wordCount: number
      paragraphs: number
      sentences: number
      headings: number
    }
  }
}

export interface AuditResults {
  id: string
  url: string
  timestamp: Date
  overallScore: number
  status: 'completed' | 'failed' | 'partial'
  
  // Module Results
  seo?: SEOResults
  performance?: PerformanceResults
  accessibility?: AccessibilityResults
  security?: SecurityResults
  mobile?: MobileResults
  content?: ContentResults
  
  // Metadata
  crawlDuration: number
  analysisDuration: number
  totalDuration: number
  userId?: string
  userAgent: string
  screenshotPath?: string
  
  // Raw data for debugging/analysis
  rawData?: {
    lighthouseReport?: any
    axeResults?: any
    crawlResults?: any
  }
}

export interface CrawlResults {
  url: string
  finalUrl: string
  title: string
  metaDescription?: string
  html: string
  screenshots: {
    desktop: string
    mobile: string
  }
  loadTime: number
  statusCode: number
  redirectChain: string[]
  resources: {
    images: string[]
    stylesheets: string[]
    scripts: string[]
    fonts: string[]
  }
  errors: string[]
}

export interface AuditJobQueue {
  id: string
  url: string
  options: AuditOptions
  priority: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  status: 'queued' | 'processing' | 'completed' | 'failed'
  retryCount: number
  maxRetries: number
  errorMessage?: string
  userId?: string
} 