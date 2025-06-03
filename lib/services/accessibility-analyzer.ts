import { Page } from 'puppeteer'
import { AxePuppeteer } from '@axe-core/puppeteer'
import { AccessibilityResults, AccessibilityIssue } from '@/lib/types/audit'

export class AccessibilityAnalyzer {
  
  async analyze(page: Page): Promise<AccessibilityResults> {
    try {
      // Inject axe-core and run accessibility tests
      const results = await new AxePuppeteer(page).analyze()
      
      // Process violations into our format
      const issues = this.processViolations(results.violations)
      
      // Generate suggestions based on violations
      const suggestions = this.generateSuggestions(results.violations)
      
      // Calculate metrics
      const metrics = {
        violations: results.violations.length,
        incomplete: results.incomplete.length,
        passes: results.passes.length,
        inapplicable: results.inapplicable.length
      }
      
      // Calculate accessibility score
      const score = this.calculateAccessibilityScore(metrics, issues)

      return {
        score,
        issues,
        suggestions,
        metrics
      }

    } catch (error) {
      console.error('Accessibility analysis error:', error)
      
      // Return fallback results
      return {
        score: 0,
        issues: [{
          id: 'analysis-error',
          impact: 'critical',
          tags: ['error'],
          description: 'Unable to complete accessibility analysis',
          help: 'Please try again or check if the page is accessible',
          helpUrl: '',
          nodes: []
        }],
        suggestions: ['Unable to complete accessibility analysis. Please try again.'],
        metrics: {
          violations: 1,
          incomplete: 0,
          passes: 0,
          inapplicable: 0
        }
      }
    }
  }

  private processViolations(violations: any[]): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    for (const violation of violations) {
      // Process each violation node
      const nodes = violation.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))

      issues.push({
        id: violation.id,
        impact: violation.impact || 'moderate',
        tags: violation.tags || [],
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes
      })
    }

    // Sort by impact severity
    const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 }
    issues.sort((a, b) => 
      (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0)
    )

    return issues
  }

  private generateSuggestions(violations: any[]): string[] {
    const suggestions: string[] = []
    const seenSuggestions = new Set<string>()

    // Common WCAG suggestions based on violation types
    const suggestionMap: { [key: string]: string } = {
      'color-contrast': 'Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text)',
      'image-alt': 'Add descriptive alternative text to all images for screen reader users',
      'button-name': 'Ensure all buttons have accessible names using text, aria-label, or aria-labelledby',
      'link-name': 'Provide descriptive text for all links to help users understand their destination',
      'form-field-multiple-labels': 'Associate form fields with exactly one label using for/id attributes',
      'label': 'Associate all form controls with descriptive labels',
      'heading-order': 'Use heading tags in logical order (h1, h2, h3, etc.) to create proper document structure',
      'landmark-one-main': 'Include exactly one main landmark to identify the primary content area',
      'page-has-heading-one': 'Include exactly one h1 heading to provide a clear page title',
      'region': 'Ensure all content is contained within landmark regions for screen reader navigation',
      'skip-link': 'Provide skip links to help keyboard users navigate efficiently',
      'focus-order-semantics': 'Ensure interactive elements receive focus in a logical order',
      'aria-required-attr': 'Include all required ARIA attributes for proper accessibility API communication',
      'aria-valid-attr-value': 'Use valid values for ARIA attributes according to ARIA specifications',
      'aria-roles': 'Use valid ARIA roles that are appropriate for the element and context',
      'tabindex': 'Avoid positive tabindex values and use tabindex="-1" only when necessary'
    }

    // Generate specific suggestions based on violations
    for (const violation of violations) {
      const suggestion = suggestionMap[violation.id]
      if (suggestion && !seenSuggestions.has(suggestion)) {
        suggestions.push(suggestion)
        seenSuggestions.add(suggestion)
      }
    }

    // Add general suggestions based on violation patterns
    const hasColorIssues = violations.some(v => v.id.includes('color'))
    if (hasColorIssues && !seenSuggestions.has('color-tools')) {
      suggestions.push('Use color contrast checking tools to ensure all text meets accessibility standards')
      seenSuggestions.add('color-tools')
    }

    const hasFormIssues = violations.some(v => v.id.includes('label') || v.id.includes('form'))
    if (hasFormIssues && !seenSuggestions.has('form-testing')) {
      suggestions.push('Test forms with screen readers to ensure proper label associations and error handling')
      seenSuggestions.add('form-testing')
    }

    const hasAriaIssues = violations.some(v => v.id.includes('aria'))
    if (hasAriaIssues && !seenSuggestions.has('aria-guidance')) {
      suggestions.push('Review ARIA implementation against WCAG guidelines and test with assistive technologies')
      seenSuggestions.add('aria-guidance')
    }

    const hasKeyboardIssues = violations.some(v => v.id.includes('focus') || v.id.includes('tabindex'))
    if (hasKeyboardIssues && !seenSuggestions.has('keyboard-testing')) {
      suggestions.push('Test all interactive elements with keyboard-only navigation to ensure accessibility')
      seenSuggestions.add('keyboard-testing')
    }

    // If no specific violations, add general good practice suggestions
    if (suggestions.length === 0) {
      suggestions.push('Great accessibility! Consider conducting user testing with people who use assistive technologies')
      suggestions.push('Implement automated accessibility testing in your development workflow')
      suggestions.push('Consider WCAG 2.2 AAA criteria for enhanced accessibility')
    }

    return suggestions
  }

  private calculateAccessibilityScore(metrics: any, issues: AccessibilityIssue[]): number {
    let score = 100

    // Deduct points based on violations by severity
    for (const issue of issues) {
      switch (issue.impact) {
        case 'critical':
          score -= 20
          break
        case 'serious':
          score -= 10
          break
        case 'moderate':
          score -= 5
          break
        case 'minor':
          score -= 2
          break
      }
    }

    // Bonus points for passes (but cap the bonus)
    const passBonus = Math.min(20, Math.floor(metrics.passes * 0.5))
    score += passBonus

    // Additional deductions for missing key accessibility features
    const criticalViolations = issues.filter(issue => issue.impact === 'critical')
    if (criticalViolations.length > 5) {
      score -= 10 // Additional penalty for many critical issues
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // Utility method to get accessibility compliance level
  static getComplianceLevel(score: number): 'fail' | 'partial' | 'pass' | 'excellent' {
    if (score < 40) return 'fail'
    if (score < 70) return 'partial'
    if (score < 90) return 'pass'
    return 'excellent'
  }

  // Utility method to get WCAG level estimation
  static getWCAGLevel(issues: AccessibilityIssue[]): 'AA' | 'A' | 'non-compliant' {
    const criticalIssues = issues.filter(issue => issue.impact === 'critical')
    const seriousIssues = issues.filter(issue => issue.impact === 'serious')
    
    if (criticalIssues.length > 0) return 'non-compliant'
    if (seriousIssues.length > 2) return 'A'
    return 'AA'
  }

  // Utility method to categorize issues by WCAG principle
  static categorizeByPrinciple(issues: AccessibilityIssue[]) {
    const categories = {
      perceivable: [] as AccessibilityIssue[],
      operable: [] as AccessibilityIssue[],
      understandable: [] as AccessibilityIssue[],
      robust: [] as AccessibilityIssue[]
    }

    for (const issue of issues) {
      // Categorize based on tags or ID patterns
      if (issue.tags.includes('wcag2a') || issue.tags.includes('wcag2aa')) {
        if (issue.id.includes('color') || issue.id.includes('image') || issue.id.includes('video')) {
          categories.perceivable.push(issue)
        } else if (issue.id.includes('focus') || issue.id.includes('keyboard') || issue.id.includes('skip')) {
          categories.operable.push(issue)
        } else if (issue.id.includes('label') || issue.id.includes('heading') || issue.id.includes('form')) {
          categories.understandable.push(issue)
        } else if (issue.id.includes('aria') || issue.id.includes('landmark')) {
          categories.robust.push(issue)
        }
      }
    }

    return categories
  }
} 