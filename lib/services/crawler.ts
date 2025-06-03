import puppeteer, { Browser, Page } from 'puppeteer'
import { parse } from 'node-html-parser'
import { CrawlResults } from '@/lib/types/audit'
import fs from 'fs/promises'
import path from 'path'

export class WebCrawler {
  private browser: Browser | null = null
  private screenshotDir = './public/screenshots'

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })
    }
    
    // Ensure screenshots directory exists
    await fs.mkdir(this.screenshotDir, { recursive: true })
  }

  async crawl(url: string): Promise<CrawlResults> {
    const startTime = Date.now()
    
    if (!this.browser) {
      await this.init()
    }

    const page = await this.browser!.newPage()
    
    try {
      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 AutomatIQ-Auditor/1.0'
      )

      // Set viewport for desktop
      await page.setViewport({ width: 1920, height: 1080 })

      const redirectChain: string[] = []
      const resources: CrawlResults['resources'] = {
        images: [],
        stylesheets: [],
        scripts: [],
        fonts: []
      }
      const errors: string[] = []

      // Monitor network requests
      await page.setRequestInterception(true)
      page.on('request', (request) => {
        const resourceType = request.resourceType()
        const requestUrl = request.url()
        
        switch (resourceType) {
          case 'image':
            resources.images.push(requestUrl)
            break
          case 'stylesheet':
            resources.stylesheets.push(requestUrl)
            break
          case 'script':
            resources.scripts.push(requestUrl)
            break
          case 'font':
            resources.fonts.push(requestUrl)
            break
        }
        
        request.continue()
      })

      // Monitor failed requests
      page.on('requestfailed', (request) => {
        errors.push(`Failed to load: ${request.url()} - ${request.failure()?.errorText}`)
      })

      // Monitor console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`Console error: ${msg.text()}`)
        }
      })

      // Navigate to URL
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      if (!response) {
        throw new Error('Failed to load page')
      }

      const finalUrl = page.url()
      const statusCode = response.status()

      // Get redirect chain
      let currentResponse = response
      while (currentResponse.request().redirectChain().length > 0) {
        for (const redirectResponse of currentResponse.request().redirectChain()) {
          redirectChain.push(redirectResponse.url())
        }
        break
      }

      // Wait for page to fully load
      await page.waitForTimeout(2000)

      // Get page content
      const html = await page.content()
      const title = await page.title()

      // Parse HTML to get meta description
      const root = parse(html)
      const metaDescription = root.querySelector('meta[name="description"]')?.getAttribute('content') || undefined

      // Take screenshots
      const timestamp = Date.now()
      const desktopScreenshot = `desktop-${timestamp}.png`
      const mobileScreenshot = `mobile-${timestamp}.png`

      // Desktop screenshot
      await page.screenshot({
        path: path.join(this.screenshotDir, desktopScreenshot),
        fullPage: true,
        type: 'png'
      })

      // Mobile screenshot
      await page.setViewport({ width: 375, height: 667 })
      await page.waitForTimeout(1000) // Wait for reflow
      await page.screenshot({
        path: path.join(this.screenshotDir, mobileScreenshot),
        fullPage: true,
        type: 'png'
      })

      const loadTime = Date.now() - startTime

      return {
        url,
        finalUrl,
        title,
        metaDescription,
        html,
        screenshots: {
          desktop: `/screenshots/${desktopScreenshot}`,
          mobile: `/screenshots/${mobileScreenshot}`
        },
        loadTime,
        statusCode,
        redirectChain,
        resources,
        errors
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown crawling error'
      errors.push(errorMessage)
      
      // Return partial results even on error
      return {
        url,
        finalUrl: url,
        title: '',
        html: '',
        screenshots: {
          desktop: '',
          mobile: ''
        },
        loadTime: Date.now() - startTime,
        statusCode: 0,
        redirectChain: [],
        resources: {
          images: [],
          stylesheets: [],
          scripts: [],
          fonts: []
        },
        errors
      }
    } finally {
      await page.close()
    }
  }

  async crawlForPerformance(url: string): Promise<{ page: Page; html: string }> {
    if (!this.browser) {
      await this.init()
    }

    const page = await this.browser!.newPage()
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    const html = await page.content()
    
    return { page, html }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  // Utility method to validate URL
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Utility method to normalize URL
  static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.toString()
    } catch {
      // Try adding https:// if missing protocol
      try {
        const urlObj = new URL(`https://${url}`)
        return urlObj.toString()
      } catch {
        throw new Error(`Invalid URL: ${url}`)
      }
    }
  }
} 