import mongoose, { Schema, Document } from 'mongoose'
import { 
  AuditResults, 
  AuditProgress, 
  AuditJobQueue,
  SEOResults,
  PerformanceResults,
  AccessibilityResults,
  SecurityResults,
  MobileResults,
  ContentResults
} from '@/lib/types/audit'

// Audit Results Schema
const AuditResultsSchema = new Schema<AuditResults & Document>({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  overallScore: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'failed', 'partial'],
    required: true 
  },
  
  // Module Results (optional based on user selection)
  seo: {
    score: Number,
    issues: [{
      type: { type: String, enum: ['error', 'warning', 'info'] },
      category: { type: String, enum: ['meta', 'headings', 'images', 'links', 'structure'] },
      message: String,
      element: String,
      url: String
    }],
    suggestions: [String],
    metrics: {
      metaTags: {
        title: String,
        description: String,
        keywords: String
      },
      headings: {
        h1: Number,
        h2: Number,
        h3: Number,
        h4: Number,
        h5: Number,
        h6: Number
      },
      images: {
        total: Number,
        missingAlt: Number,
        optimized: Number
      },
      links: {
        internal: Number,
        external: Number,
        broken: Number
      }
    }
  },
  
  performance: {
    score: Number,
    suggestions: [String],
    metrics: {
      lcp: Number,
      fid: Number,
      cls: Number,
      fcp: Number,
      tti: Number,
      tbt: Number,
      si: Number
    },
    opportunities: [{
      id: String,
      title: String,
      description: String,
      savings: Number,
      wastedBytes: Number,
      wastedMs: Number
    }],
    diagnostics: [{
      id: String,
      title: String,
      description: String,
      score: Number,
      scoreDisplayMode: { type: String, enum: ['binary', 'numeric', 'informative'] }
    }]
  },
  
  accessibility: {
    score: Number,
    issues: [{
      id: String,
      impact: { type: String, enum: ['minor', 'moderate', 'serious', 'critical'] },
      tags: [String],
      description: String,
      help: String,
      helpUrl: String,
      nodes: [{
        html: String,
        target: [String],
        failureSummary: String
      }]
    }],
    suggestions: [String],
    metrics: {
      violations: Number,
      incomplete: Number,
      passes: Number,
      inapplicable: Number
    }
  },
  
  security: {
    score: Number,
    issues: [{
      type: { type: String, enum: ['ssl', 'headers', 'content', 'network'] },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      title: String,
      description: String,
      recommendation: String
    }],
    suggestions: [String],
    metrics: {
      ssl: {
        valid: Boolean,
        issuer: String,
        expires: Date,
        algorithm: String
      },
      headers: Schema.Types.Mixed,
      vulnerabilities: Number
    }
  },
  
  mobile: {
    score: Number,
    issues: [String],
    suggestions: [String],
    metrics: {
      viewport: {
        configured: Boolean,
        width: String
      },
      touchTargets: {
        total: Number,
        tooSmall: Number,
        tooClose: Number
      },
      readability: {
        fontSizeOk: Boolean,
        lineHeightOk: Boolean
      },
      images: {
        responsive: Number,
        total: Number
      }
    }
  },
  
  content: {
    score: Number,
    issues: [String],
    suggestions: [String],
    metrics: {
      readability: {
        fleschKincaid: Number,
        gunningFog: Number,
        averageSentenceLength: Number,
        averageWordsPerSentence: Number
      },
      sentiment: {
        score: Number,
        magnitude: Number,
        overall: { type: String, enum: ['positive', 'neutral', 'negative'] }
      },
      structure: {
        wordCount: Number,
        paragraphs: Number,
        sentences: Number,
        headings: Number
      }
    }
  },
  
  // Metadata
  crawlDuration: { type: Number, required: true },
  analysisDuration: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  userId: String,
  userAgent: { type: String, required: true },
  screenshotPath: String,
  
  // Raw data for debugging
  rawData: {
    lighthouseReport: Schema.Types.Mixed,
    axeResults: Schema.Types.Mixed,
    crawlResults: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'audit_results'
})

// Audit Progress Schema
const AuditProgressSchema = new Schema<AuditProgress & Document>({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'crawling', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  currentStep: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  estimatedCompletion: Date
}, {
  timestamps: true,
  collection: 'audit_progress'
})

// Audit Job Queue Schema
const AuditJobQueueSchema = new Schema<AuditJobQueue & Document>({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  options: {
    seo: { type: Boolean, default: true },
    performance: { type: Boolean, default: true },
    accessibility: { type: Boolean, default: true },
    security: { type: Boolean, default: false },
    mobile: { type: Boolean, default: true },
    content: { type: Boolean, default: false }
  },
  priority: { type: Number, default: 1, min: 1, max: 10 },
  status: { 
    type: String, 
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  startedAt: Date,
  completedAt: Date,
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  errorMessage: String,
  userId: String
}, {
  timestamps: true,
  collection: 'audit_job_queue'
})

// Indexes for performance
AuditResultsSchema.index({ url: 1, timestamp: -1 })
AuditResultsSchema.index({ userId: 1, timestamp: -1 })
AuditResultsSchema.index({ overallScore: -1 })

AuditProgressSchema.index({ id: 1 })
AuditProgressSchema.index({ status: 1, updatedAt: -1 })

AuditJobQueueSchema.index({ status: 1, priority: -1, createdAt: 1 })
AuditJobQueueSchema.index({ userId: 1, createdAt: -1 })

// Create models
export const AuditResultsModel = mongoose.models.AuditResults || 
  mongoose.model<AuditResults & Document>('AuditResults', AuditResultsSchema)

export const AuditProgressModel = mongoose.models.AuditProgress || 
  mongoose.model<AuditProgress & Document>('AuditProgress', AuditProgressSchema)

export const AuditJobQueueModel = mongoose.models.AuditJobQueue || 
  mongoose.model<AuditJobQueue & Document>('AuditJobQueue', AuditJobQueueSchema) 