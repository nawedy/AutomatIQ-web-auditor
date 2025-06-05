// src/lib/services/comparative-analysis-service.ts
// Service for comparing audit results over time

import { PrismaClient, Audit } from '@prisma/client';

export interface ScoreComparison {
  current: number;
  previous: number;
  change: number;
  percentChange: number;
}

export interface CategoryScoreComparison {
  category: string;
  scores: ScoreComparison;
}

export interface AuditComparison {
  currentAudit: Audit;
  previousAudit: Audit;
  overallScoreComparison: ScoreComparison;
  categoryComparisons: CategoryScoreComparison[];
  improvementAreas: string[];
  declineAreas: string[];
  timeGap: string; // e.g., "7 days", "2 weeks", "1 month"
}

export interface TrendAnalysis {
  websiteId: string;
  period: string; // e.g., "last30days", "last3months", "lastYear"
  overallScoreTrend: Array<{ date: string; score: number }>;
  categoryScoreTrends: Record<string, Array<{ date: string; score: number }>>;
  mostImprovedCategory: string;
  leastImprovedCategory: string;
}

export class ComparativeAnalysisService {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  /**
   * Compare two specific audits
   */
  async compareAudits(currentAuditId: string, previousAuditId: string): Promise<AuditComparison> {
    try {
      // Get both audits with their results
      const [currentAudit, previousAudit] = await Promise.all([
        this.prisma.audit.findUnique({
          where: { id: currentAuditId },
          include: {
            auditResults: {
              include: {
                category: true,
                check: true,
              },
            },
          },
        }),
        this.prisma.audit.findUnique({
          where: { id: previousAuditId },
          include: {
            auditResults: {
              include: {
                category: true,
                check: true,
              },
            },
          },
        }),
      ]);
      
      if (!currentAudit || !previousAudit) {
        throw new Error('One or both audits not found');
      }
      
      // Calculate time gap between audits
      const timeGap = this.calculateTimeGap(
        new Date(currentAudit.createdAt),
        new Date(previousAudit.createdAt)
      );
      
      // Compare overall scores
      const overallScoreComparison = this.compareScores(
        currentAudit.overallScore || 0,
        previousAudit.overallScore || 0
      );
      
      // Compare category scores
      const categoryComparisons: CategoryScoreComparison[] = [
        {
          category: 'SEO',
          scores: this.compareScores(
            currentAudit.seoScore || 0,
            previousAudit.seoScore || 0
          ),
        },
        {
          category: 'Performance',
          scores: this.compareScores(
            currentAudit.performanceScore || 0,
            previousAudit.performanceScore || 0
          ),
        },
        {
          category: 'Accessibility',
          scores: this.compareScores(
            currentAudit.accessibilityScore || 0,
            previousAudit.accessibilityScore || 0
          ),
        },
        {
          category: 'Security',
          scores: this.compareScores(
            currentAudit.securityScore || 0,
            previousAudit.securityScore || 0
          ),
        },
        {
          category: 'Mobile',
          scores: this.compareScores(
            currentAudit.mobileScore || 0,
            previousAudit.mobileScore || 0
          ),
        },
        {
          category: 'Content',
          scores: this.compareScores(
            currentAudit.contentScore || 0,
            previousAudit.contentScore || 0
          ),
        },
      ];
      
      // Identify improvement and decline areas
      const improvementAreas: string[] = [];
      const declineAreas: string[] = [];
      
      categoryComparisons.forEach(comparison => {
        if (comparison.scores.change > 5) {
          improvementAreas.push(comparison.category);
        } else if (comparison.scores.change < -5) {
          declineAreas.push(comparison.category);
        }
      });
      
      // Compare specific checks
      const currentChecks = new Map(
        currentAudit.auditResults.map(result => [
          `${result.categoryId}-${result.checkId}`,
          result,
        ])
      );
      
      const previousChecks = new Map(
        previousAudit.auditResults.map(result => [
          `${result.categoryId}-${result.checkId}`,
          result,
        ])
      );
      
      // Find specific improvements
      currentChecks.forEach((currentResult, key) => {
        const previousResult = previousChecks.get(key);
        if (previousResult) {
          const scoreDiff = currentResult.score - previousResult.score;
          if (scoreDiff >= 20) {
            improvementAreas.push(
              `${currentResult.check.name} (${currentResult.category.name}): +${scoreDiff.toFixed(1)} points`
            );
          } else if (scoreDiff <= -20) {
            declineAreas.push(
              `${currentResult.check.name} (${currentResult.category.name}): ${scoreDiff.toFixed(1)} points`
            );
          }
        }
      });
      
      return {
        currentAudit,
        previousAudit,
        overallScoreComparison,
        categoryComparisons,
        improvementAreas,
        declineAreas,
        timeGap,
      };
    } catch (error) {
      console.error('Error comparing audits:', error);
      throw new Error(`Failed to compare audits: ${(error as Error).message}`);
    }
  }
  
  /**
   * Compare the most recent audit with the previous one for a website
   */
  async compareLatestAudits(websiteId: string): Promise<AuditComparison | null> {
    try {
      // Get the two most recent completed audits for this website
      const audits = await this.prisma.audit.findMany({
        where: {
          websiteId,
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
      });
      
      if (audits.length < 2) {
        // Not enough audits for comparison
        return null;
      }
      
      // Compare the two most recent audits
      return this.compareAudits(audits[0].id, audits[1].id);
    } catch (error) {
      console.error('Error comparing latest audits:', error);
      throw new Error(`Failed to compare latest audits: ${(error as Error).message}`);
    }
  }
  
  /**
   * Analyze score trends over time for a website
   */
  async analyzeTrends(
    websiteId: string,
    period: 'last30days' | 'last3months' | 'lastYear' = 'last30days'
  ): Promise<TrendAnalysis> {
    try {
      // Calculate start date based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'last30days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case 'last3months':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'lastYear':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
      }
      
      // Get all completed audits for this website in the period
      const audits = await this.prisma.audit.findMany({
        where: {
          websiteId,
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      if (audits.length === 0) {
        throw new Error('No audits found for the specified period');
      }
      
      // Prepare trend data
      const overallScoreTrend = audits.map(audit => ({
        date: audit.createdAt.toISOString().split('T')[0],
        score: audit.overallScore || 0,
      }));
      
      // Prepare category trends
      const categoryScoreTrends: Record<string, Array<{ date: string; score: number }>> = {
        SEO: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.seoScore || 0,
        })),
        Performance: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.performanceScore || 0,
        })),
        Accessibility: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.accessibilityScore || 0,
        })),
        Security: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.securityScore || 0,
        })),
        Mobile: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.mobileScore || 0,
        })),
        Content: audits.map(audit => ({
          date: audit.createdAt.toISOString().split('T')[0],
          score: audit.contentScore || 0,
        })),
      };
      
      // Calculate most and least improved categories
      const categoryImprovements: Record<string, number> = {};
      
      Object.entries(categoryScoreTrends).forEach(([category, scores]) => {
        if (scores.length >= 2) {
          const firstScore = scores[0].score;
          const lastScore = scores[scores.length - 1].score;
          categoryImprovements[category] = lastScore - firstScore;
        } else {
          categoryImprovements[category] = 0;
        }
      });
      
      // Find most and least improved categories
      let mostImprovedCategory = Object.keys(categoryImprovements)[0];
      let leastImprovedCategory = Object.keys(categoryImprovements)[0];
      
      Object.entries(categoryImprovements).forEach(([category, improvement]) => {
        if (improvement > categoryImprovements[mostImprovedCategory]) {
          mostImprovedCategory = category;
        }
        if (improvement < categoryImprovements[leastImprovedCategory]) {
          leastImprovedCategory = category;
        }
      });
      
      return {
        websiteId,
        period,
        overallScoreTrend,
        categoryScoreTrends,
        mostImprovedCategory,
        leastImprovedCategory,
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw new Error(`Failed to analyze trends: ${(error as Error).message}`);
    }
  }
  
  /**
   * Helper method to compare two scores
   */
  private compareScores(currentScore: number, previousScore: number): ScoreComparison {
    const change = currentScore - previousScore;
    const percentChange = previousScore === 0 
      ? 0 
      : (change / previousScore) * 100;
    
    return {
      current: currentScore,
      previous: previousScore,
      change,
      percentChange,
    };
  }
  
  /**
   * Helper method to calculate time gap between two dates
   */
  private calculateTimeGap(currentDate: Date, previousDate: Date): string {
    const diffInMs = currentDate.getTime() - previousDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
      return 'Less than a day';
    } else if (diffInDays === 1) {
      return '1 day';
    } else if (diffInDays < 7) {
      return `${diffInDays} days`;
    } else if (diffInDays < 14) {
      return '1 week';
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} weeks`;
    } else if (diffInDays < 60) {
      return '1 month';
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)} months`;
    } else if (diffInDays < 730) {
      return '1 year';
    } else {
      return `${Math.floor(diffInDays / 365)} years`;
    }
  }
}
