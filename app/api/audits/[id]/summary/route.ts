// src/app/api/audits/[id]/summary/route.ts
// API route for managing audit summaries

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth-utils";

/**
 * GET /api/audits/[id]/summary
 * Get a summary of audit results with scores by category
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { id } = params;

    // Verify the audit belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id,
        website: {
          userId: user.id,
        },
      },
      include: {
        website: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Get the audit summary
    const summary = await prisma.auditSummary.findUnique({
      where: {
        auditId: id,
      },
    });

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    // Get category scores
    const categoryScores = await prisma.auditCategoryScore.findMany({
      where: {
        auditSummaryId: summary.id,
      },
      include: {
        category: true,
      },
    });

    // Get issue counts by severity
    const issueCounts = await prisma.auditResult.groupBy({
      by: ["severity"],
      where: {
        auditId: id,
      },
      _count: {
        id: true,
      },
    });

    // Get page counts by status
    const pageCounts = await prisma.page.groupBy({
      by: ["status"],
      where: {
        auditId: id,
      },
      _count: {
        id: true,
      },
    });

    // Format the response
    return NextResponse.json({
      audit,
      summary: {
        ...summary,
        categoryScores,
        issueCounts,
        pageCounts,
      },
    });
  } catch (error) {
    console.error(`Error fetching summary for audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch audit summary" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/audits/[id]/summary
 * Generate or update an audit summary
 */
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } },
  user: { id: string; email: string }
): Promise<NextResponse> => {
  try {
    const { id } = params;

    // Verify the audit belongs to the user
    const audit = await prisma.audit.findFirst({
      where: {
        id,
        website: {
          userId: user.id,
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Get all audit results
    const auditResults = await prisma.auditResult.findMany({
      where: {
        auditId: id,
      },
      include: {
        check: {
          include: {
            category: true,
          },
        },
      },
    });

    // Get all pages
    const pages = await prisma.page.findMany({
      where: {
        auditId: id,
      },
    });

    // Calculate overall score and category scores
    const categories = await prisma.auditCategory.findMany();
    
    // Initialize category scores
    const categoryScores: Record<string, { 
      categoryId: string, 
      score: number, 
      issueCount: number,
      passedCount: number,
      warningCount: number,
      errorCount: number
    }> = {};
    
    categories.forEach((category: any) => {
      categoryScores[category.id] = {
        categoryId: category.id,
        score: 100, // Start with perfect score
        issueCount: 0,
        passedCount: 0,
        warningCount: 0,
        errorCount: 0
      };
    });

    // Calculate scores based on audit results
    auditResults.forEach((result: any) => {
      const categoryId = result.check.categoryId;
      
      if (categoryScores[categoryId]) {
        categoryScores[categoryId].issueCount++;
        
        if (result.status === 'passed') {
          categoryScores[categoryId].passedCount++;
        } else if (result.status === 'warning') {
          categoryScores[categoryId].warningCount++;
          // Deduct points for warnings based on severity
          if (result.severity === 'high') {
            categoryScores[categoryId].score -= 5;
          } else if (result.severity === 'medium') {
            categoryScores[categoryId].score -= 3;
          } else {
            categoryScores[categoryId].score -= 1;
          }
        } else if (result.status === 'error') {
          categoryScores[categoryId].errorCount++;
          // Deduct points for errors based on severity
          if (result.severity === 'high') {
            categoryScores[categoryId].score -= 10;
          } else if (result.severity === 'medium') {
            categoryScores[categoryId].score -= 7;
          } else {
            categoryScores[categoryId].score -= 3;
          }
        }
        
        // Ensure score doesn't go below 0
        categoryScores[categoryId].score = Math.max(0, categoryScores[categoryId].score);
      }
    });

    // Calculate overall score (weighted average of category scores)
    const weights: Record<string, number> = {
      // Adjust weights based on importance of each category
      "seo": 0.25,
      "performance": 0.25,
      "accessibility": 0.2,
      "security": 0.2,
      "best_practices": 0.1
    };

    let overallScore = 0;
    let totalWeight = 0;

    Object.entries(categoryScores).forEach(([categoryId, data]: [string, any]) => {
      const category = categories.find((c: any) => c.id === categoryId);
      if (category && weights[category.slug]) {
        overallScore += data.score * weights[category.slug];
        totalWeight += weights[category.slug];
      }
    });

    // Normalize overall score
    overallScore = totalWeight > 0 ? Math.round(overallScore / totalWeight) : 0;

    // Create or update audit summary
    const summary = await prisma.auditSummary.upsert({
      where: {
        auditId: id,
      },
      update: {
        overallScore,
        totalPages: pages.length,
        totalIssues: auditResults.filter((r: any) => r.status !== 'passed').length,
        highSeverityIssues: auditResults.filter((r: any) => r.severity === 'high' && r.status !== 'passed').length,
        mediumSeverityIssues: auditResults.filter((r: any) => r.severity === 'medium' && r.status !== 'passed').length,
        lowSeverityIssues: auditResults.filter((r: any) => r.severity === 'low' && r.status !== 'passed').length,
        completedAt: new Date(),
      },
      create: {
        auditId: id,
        overallScore,
        totalPages: pages.length,
        totalIssues: auditResults.filter((r: any) => r.status !== 'passed').length,
        highSeverityIssues: auditResults.filter((r: any) => r.severity === 'high' && r.status !== 'passed').length,
        mediumSeverityIssues: auditResults.filter((r: any) => r.severity === 'medium' && r.status !== 'passed').length,
        lowSeverityIssues: auditResults.filter((r: any) => r.severity === 'low' && r.status !== 'passed').length,
        completedAt: new Date(),
      },
    });

    // Create or update category scores
    const categoryScorePromises = Object.values(categoryScores).map((data: any) => {
      return prisma.auditCategoryScore.upsert({
        where: {
          auditSummaryId_categoryId: {
            auditSummaryId: summary.id,
            categoryId: data.categoryId,
          },
        },
        update: {
          score: data.score,
          issueCount: data.issueCount,
          passedCount: data.passedCount,
          warningCount: data.warningCount,
          errorCount: data.errorCount,
        },
        create: {
          auditSummaryId: summary.id,
          categoryId: data.categoryId,
          score: data.score,
          issueCount: data.issueCount,
          passedCount: data.passedCount,
          warningCount: data.warningCount,
          errorCount: data.errorCount,
        },
      });
    });

    await Promise.all(categoryScorePromises);

    // Update audit status to completed
    await prisma.audit.update({
      where: {
        id,
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Get the updated summary with category scores
    const updatedSummary = await prisma.auditSummary.findUnique({
      where: {
        auditId: id,
      },
      include: {
        categoryScores: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ summary: updatedSummary });
  } catch (error) {
    console.error(`Error generating summary for audit ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to generate audit summary" },
      { status: 500 }
    );
  }
});
