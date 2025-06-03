import { parse, HTMLElement } from 'node-html-parser'
import { SEOResults, SEOIssue, CrawlResults } from '@/lib/types/audit'

export class SEOAnalyzer {
  
  async analyze(crawlResults: CrawlResults, baseUrl: string): Promise<SEOResults> {
    const root = parse(crawlResults.html)
    const issues: SEOIssue[] = []
    const suggestions: string[] = []
    
    // Analyze meta tags
    const metaTags = this.analyzeMetaTags(root, issues, suggestions)
    
    // Analyze headings
    const headings = this.analyzeHeadings(root, issues, suggestions)
    
    // Analyze images
    const images = this.analyzeImages(root, issues, suggestions)
    
    // Analyze links
    const links = await this.analyzeLinks(root, baseUrl, issues, suggestions)
    
    // Calculate score based on issues
    const score = this.calculateSEOScore(issues, metaTags, headings, images, links)
    
    return {
      score,
      issues,
      suggestions,
      metrics: {
        metaTags,
        headings,
        images,
        links
      }
    }
  }

  private analyzeMetaTags(root: HTMLElement, issues: SEOIssue[], suggestions: string[]) {
    const titleElement = root.querySelector('title')
    const descriptionElement = root.querySelector('meta[name="description"]')
    const keywordsElement = root.querySelector('meta[name="keywords"]')
    
    const metaTags = {
      title: titleElement?.text?.trim() || null,
      description: descriptionElement?.getAttribute('content')?.trim() || null,
      keywords: keywordsElement?.getAttribute('content')?.trim() || null
    }

    // Title analysis
    if (!metaTags.title) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing page title',
        element: '<title>'
      })
      suggestions.push('Add a descriptive title tag to improve SEO')
    } else {
      if (metaTags.title.length < 30) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Title tag is too short (less than 30 characters)',
          element: `<title>${metaTags.title}</title>`
        })
        suggestions.push('Expand your title tag to 50-60 characters for better SEO')
      } else if (metaTags.title.length > 60) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Title tag is too long (more than 60 characters)',
          element: `<title>${metaTags.title}</title>`
        })
        suggestions.push('Shorten your title tag to under 60 characters to prevent truncation in search results')
      }
    }

    // Meta description analysis
    if (!metaTags.description) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Missing meta description',
        element: '<meta name="description">'
      })
      suggestions.push('Add a meta description to improve click-through rates from search results')
    } else {
      if (metaTags.description.length < 120) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description is too short (less than 120 characters)',
          element: `<meta name="description" content="${metaTags.description}">`
        })
        suggestions.push('Expand your meta description to 150-160 characters for better search result snippets')
      } else if (metaTags.description.length > 160) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description is too long (more than 160 characters)',
          element: `<meta name="description" content="${metaTags.description}">`
        })
        suggestions.push('Shorten your meta description to under 160 characters to prevent truncation')
      }
    }

    // Check for multiple title tags
    const titleElements = root.querySelectorAll('title')
    if (titleElements.length > 1) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Multiple title tags found',
        element: '<title>'
      })
      suggestions.push('Remove duplicate title tags - only one title tag should exist per page')
    }

    // Check for multiple meta descriptions
    const descriptionElements = root.querySelectorAll('meta[name="description"]')
    if (descriptionElements.length > 1) {
      issues.push({
        type: 'error',
        category: 'meta',
        message: 'Multiple meta description tags found',
        element: '<meta name="description">'
      })
      suggestions.push('Remove duplicate meta description tags - only one should exist per page')
    }

    return metaTags
  }

  private analyzeHeadings(root: HTMLElement, issues: SEOIssue[], suggestions: string[]) {
    const headings = {
      h1: root.querySelectorAll('h1').length,
      h2: root.querySelectorAll('h2').length,
      h3: root.querySelectorAll('h3').length,
      h4: root.querySelectorAll('h4').length,
      h5: root.querySelectorAll('h5').length,
      h6: root.querySelectorAll('h6').length
    }

    // H1 analysis
    if (headings.h1 === 0) {
      issues.push({
        type: 'error',
        category: 'headings',
        message: 'Missing H1 tag',
        element: '<h1>'
      })
      suggestions.push('Add an H1 tag with your main keyword to improve page structure')
    } else if (headings.h1 > 1) {
      issues.push({
        type: 'warning',
        category: 'headings',
        message: `Multiple H1 tags found (${headings.h1})`,
        element: '<h1>'
      })
      suggestions.push('Use only one H1 tag per page for better SEO structure')
    }

    // Check heading hierarchy
    const headingElements = root.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    
    for (const heading of headingElements) {
      const currentLevel = parseInt(heading.tagName.substring(1))
      
      if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
        issues.push({
          type: 'warning',
          category: 'headings',
          message: `Heading hierarchy skipped from H${previousLevel} to H${currentLevel}`,
          element: `<${heading.tagName.toLowerCase()}>`
        })
      }
      
      // Check for empty headings
      if (!heading.text?.trim()) {
        issues.push({
          type: 'warning',
          category: 'headings',
          message: `Empty ${heading.tagName.toUpperCase()} tag`,
          element: `<${heading.tagName.toLowerCase()}>`
        })
      }
      
      previousLevel = currentLevel
    }

    if (headingElements.length > 0 && (headings.h2 === 0 && headings.h3 === 0)) {
      suggestions.push('Consider adding H2 and H3 tags to improve content structure and readability')
    }

    return headings
  }

  private analyzeImages(root: HTMLElement, issues: SEOIssue[], suggestions: string[]) {
    const imageElements = root.querySelectorAll('img')
    let missingAlt = 0
    let optimized = 0

    for (const img of imageElements) {
      const alt = img.getAttribute('alt')
      const src = img.getAttribute('src')
      
      if (!alt || alt.trim() === '') {
        missingAlt++
        issues.push({
          type: 'warning',
          category: 'images',
          message: 'Image missing alt text',
          element: `<img src="${src}">`
        })
      } else if (alt.length > 125) {
        issues.push({
          type: 'info',
          category: 'images',
          message: 'Alt text is too long (over 125 characters)',
          element: `<img src="${src}" alt="${alt}">`
        })
      }

      // Check for optimized formats (basic check)
      if (src && (src.includes('.webp') || src.includes('.avif'))) {
        optimized++
      }

      // Check for loading attribute
      const loading = img.getAttribute('loading')
      if (!loading) {
        suggestions.push('Consider adding loading="lazy" to images below the fold for better performance')
      }
    }

    const images = {
      total: imageElements.length,
      missingAlt,
      optimized
    }

    if (missingAlt > 0) {
      suggestions.push(`Add alt text to ${missingAlt} images for better accessibility and SEO`)
    }

    if (optimized < images.total * 0.5 && images.total > 0) {
      suggestions.push('Consider using modern image formats like WebP or AVIF for better performance')
    }

    return images
  }

  private async analyzeLinks(root: HTMLElement, baseUrl: string, issues: SEOIssue[], suggestions: string[]) {
    const linkElements = root.querySelectorAll('a[href]')
    let internal = 0
    let external = 0
    let broken = 0

    const baseUrlObj = new URL(baseUrl)

    for (const link of linkElements) {
      const href = link.getAttribute('href')
      if (!href) continue

      try {
        const linkUrl = new URL(href, baseUrl)
        
        if (linkUrl.hostname === baseUrlObj.hostname) {
          internal++
        } else {
          external++
          
          // Check for external link attributes
          const rel = link.getAttribute('rel')
          const target = link.getAttribute('target')
          
          if (!rel?.includes('nofollow') && !rel?.includes('sponsored')) {
            suggestions.push('Consider adding rel="nofollow" to external links to control link equity flow')
          }
          
          if (target === '_blank' && !rel?.includes('noopener')) {
            issues.push({
              type: 'warning',
              category: 'links',
              message: 'External link opens in new tab without rel="noopener"',
              element: `<a href="${href}" target="_blank">`
            })
            suggestions.push('Add rel="noopener" to external links that open in new tabs for security')
          }
        }

        // Check for empty link text
        const linkText = link.text?.trim()
        if (!linkText) {
          issues.push({
            type: 'warning',
            category: 'links',
            message: 'Link with empty anchor text',
            element: `<a href="${href}">`
          })
        } else if (linkText.toLowerCase().includes('click here') || linkText.toLowerCase().includes('read more')) {
          issues.push({
            type: 'info',
            category: 'links',
            message: 'Generic anchor text found',
            element: `<a href="${href}">${linkText}</a>`
          })
          suggestions.push('Use descriptive anchor text instead of generic phrases like "click here"')
        }

      } catch (error) {
        broken++
        issues.push({
          type: 'error',
          category: 'links',
          message: 'Invalid or broken link',
          element: `<a href="${href}">`,
          url: href
        })
      }
    }

    const links = {
      internal,
      external,
      broken
    }

    if (broken > 0) {
      suggestions.push(`Fix ${broken} broken links to improve user experience and SEO`)
    }

    if (internal === 0 && linkElements.length > 0) {
      suggestions.push('Add internal links to improve site navigation and help search engines discover content')
    }

    return links
  }

  private calculateSEOScore(
    issues: SEOIssue[], 
    metaTags: any, 
    headings: any, 
    images: any, 
    links: any
  ): number {
    let score = 100

    // Deduct points based on issues
    for (const issue of issues) {
      switch (issue.type) {
        case 'error':
          score -= 10
          break
        case 'warning':
          score -= 5
          break
        case 'info':
          score -= 2
          break
      }
    }

    // Bonus points for good practices
    if (metaTags.title && metaTags.title.length >= 30 && metaTags.title.length <= 60) {
      score += 5
    }

    if (metaTags.description && metaTags.description.length >= 120 && metaTags.description.length <= 160) {
      score += 5
    }

    if (headings.h1 === 1) {
      score += 5
    }

    if (headings.h2 > 0 || headings.h3 > 0) {
      score += 3
    }

    if (images.missingAlt === 0 && images.total > 0) {
      score += 5
    }

    if (links.internal > 0) {
      score += 3
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)))
  }
} 