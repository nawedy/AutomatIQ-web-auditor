// src/lib/services/base-analyzer.ts
// Base analyzer class for all specialized analyzers to extend

export abstract class BaseAnalyzer {
  protected calculateScore(passedChecks: number, totalChecks: number): number {
    if (totalChecks === 0) return 100;
    return Math.round((passedChecks / totalChecks) * 100);
  }

  protected calculateWeightedScore(
    items: Array<{ score: number; weight: number }>,
    defaultWeight = 1
  ): number {
    if (items.length === 0) return 100;
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const item of items) {
      const weight = item.weight || defaultWeight;
      weightedSum += item.score * weight;
      totalWeight += weight;
    }
    
    return Math.round(weightedSum / totalWeight);
  }

  protected normalizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.toString();
    } catch (error) {
      return url;
    }
  }

  protected extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      return '';
    }
  }

  protected truncateString(str: string, maxLength: number): string {
    if (!str) return '';
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  }

  protected sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  protected countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }

  protected getTextContent(html: string): string {
    return this.sanitizeHtml(html);
  }
}
