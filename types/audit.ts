/**
 * Types related to audits in the application
 */

export type AuditStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AuditSummary {
  id: string;
  auditId: string;
  summaryReport: string | Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditResult {
  id: string;
  auditId: string;
  category: string;
  score: number;
  details: string | Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Audit {
  id: string;
  websiteId: string;
  website?: Website;
  status: AuditStatus;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  results?: AuditResult[];
  summary?: AuditSummary;
}
