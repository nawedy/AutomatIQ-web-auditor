"use client"

import { useState } from "react"
import { UrlInputForm } from "@/components/audit/url-input-form"
import { AuditProgress } from "@/components/audit/audit-progress"
import { AuditResults } from "@/components/audit/audit-results"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"

interface AuditOptions {
  seo: boolean
  performance: boolean
  accessibility: boolean
  security: boolean
  mobile: boolean
  content: boolean
}

type AuditState = 'input' | 'progress' | 'results' | 'error'

export default function AuditPage() {
  const [auditState, setAuditState] = useState<AuditState>('input')
  const [currentUrl, setCurrentUrl] = useState("")
  const [auditId, setAuditId] = useState("")
  const [auditOptions, setAuditOptions] = useState<AuditOptions | null>(null)
  const [auditResults, setAuditResults] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isStartingAudit, setIsStartingAudit] = useState(false)

  const handleAuditStart = async (url: string, options: AuditOptions) => {
    setIsStartingAudit(true)
    setErrorMessage("")
    
    try {
      const response = await fetch('/api/audit/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          options,
          userId: undefined // Can be added later for user authentication
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentUrl(url)
        setAuditOptions(options)
        setAuditId(data.auditId)
        setAuditState('progress')
      } else {
        setErrorMessage(data.error || 'Failed to start audit')
        setAuditState('error')
      }
    } catch (error) {
      console.error('Error starting audit:', error)
      setErrorMessage('Network error: Unable to start audit')
      setAuditState('error')
    } finally {
      setIsStartingAudit(false)
    }
  }

  const handleAuditComplete = (results: any) => {
    setAuditResults(results)
    setAuditState('results')
  }

  const handleAuditError = (error: string) => {
    setErrorMessage(error)
    setAuditState('error')
  }

  const handleNewAudit = () => {
    setAuditState('input')
    setCurrentUrl("")
    setAuditId("")
    setAuditOptions(null)
    setAuditResults(null)
    setErrorMessage("")
  }

  const handleRetryAudit = () => {
    if (currentUrl && auditOptions) {
      handleAuditStart(currentUrl, auditOptions)
    } else {
      handleNewAudit()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-32">
        <div className="section-padding">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold shimmer-title mb-4">
                AI Website Auditor
              </h1>
              <p className="text-lg text-white max-w-3xl mx-auto">
                Comprehensive analysis of your website's performance, SEO, accessibility, security, and user experience. 
                Get actionable insights powered by advanced AI technology.
              </p>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              {auditState === 'input' && (
                <div className="space-y-8">
                  <UrlInputForm 
                    onAuditStart={handleAuditStart}
                    isLoading={isStartingAudit}
                  />
                  
                  {/* Features Section - All Comprehensive Audits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">SEO Analysis</h3>
                      <p className="text-white text-sm">
                        Meta tags, heading structure, keyword optimization, and search engine discoverability analysis.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">⚡</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Performance Testing</h3>
                      <p className="text-white text-sm">
                        Core Web Vitals, load times, and optimization opportunities using Google Lighthouse.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">♿</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Accessibility Scan</h3>
                      <p className="text-white text-sm">
                        WCAG compliance, screen reader compatibility, and inclusive design evaluation.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🔒</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Security Assessment</h3>
                      <p className="text-white text-sm">
                        SSL certificates, security headers, and vulnerability scanning for web security.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">📱</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Mobile UX Analysis</h3>
                      <p className="text-white text-sm">
                        Responsive design, touch targets, and mobile user experience optimization.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">📝</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Content Quality Audit</h3>
                      <p className="text-white text-sm">
                        NLP-powered content evaluation, readability scores, and tone analysis.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🔧</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Technical SEO</h3>
                      <p className="text-white text-sm">
                        Site structure, crawlability, indexability, and schema markup analysis.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🎯</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">User Experience Review</h3>
                      <p className="text-white text-sm">
                        Navigation analysis, conversion optimization, and UX best practices evaluation.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">📊</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Core Web Vitals</h3>
                      <p className="text-white text-sm">
                        LCP, FID, CLS measurements and performance optimization recommendations.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🌐</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Cross-Browser Testing</h3>
                      <p className="text-white text-sm">
                        Compatibility testing across different browsers and devices.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">🏷️</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Schema Markup</h3>
                      <p className="text-white text-sm">
                        Structured data analysis and rich snippet optimization.
                      </p>
                    </div>
                    
                    <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-6 hover-shadow">
                      <div className="text-electric-cyan text-2xl mb-4">📈</div>
                      <h3 className="text-lg font-semibold text-glow-gold mb-2">Analytics Integration</h3>
                      <p className="text-white text-sm">
                        Google Analytics, tracking setup, and conversion measurement analysis.
                      </p>
                    </div>
                  </div>
                  
                  {/* Benefits Section */}
                  <div className="bg-darker-navy border border-circuit-bronze/20 rounded-lg p-8 mt-12">
                    <h2 className="text-2xl font-bold shimmer-subtitle mb-6 text-center">
                      Why Choose Our AI Website Auditor?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">Comprehensive Analysis</h4>
                            <p className="text-white text-sm">All-in-one solution covering SEO, performance, accessibility, and more.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">AI-Powered Insights</h4>
                            <p className="text-white text-sm">Advanced algorithms provide intelligent recommendations for improvement.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">Actionable Reports</h4>
                            <p className="text-white text-sm">Detailed, downloadable reports with step-by-step improvement guides.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">Fast & Accurate</h4>
                            <p className="text-white text-sm">Quick analysis with professional-grade accuracy and reliability.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">Industry Standards</h4>
                            <p className="text-white text-sm">Based on Google Lighthouse, WCAG guidelines, and best practices.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="text-electric-cyan mt-1">✓</div>
                          <div>
                            <h4 className="font-semibold text-digital-gold">Continuous Monitoring</h4>
                            <p className="text-white text-sm">Track improvements over time with scheduled follow-up audits.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {auditState === 'progress' && auditId && (
                <AuditProgress 
                  auditId={auditId}
                  url={currentUrl} 
                  onComplete={handleAuditComplete}
                  onError={handleAuditError}
                />
              )}

              {auditState === 'results' && auditResults && (
                <AuditResults 
                  results={auditResults} 
                  onNewAudit={handleNewAudit}
                />
              )}

              {auditState === 'error' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-8 text-center">
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-400 mb-4">Audit Failed</h2>
                    <p className="text-white mb-6">{errorMessage}</p>
                    <div className="space-x-4">
                      <button
                        onClick={handleRetryAudit}
                        className="bg-digital-gold hover:bg-circuit-bronze text-darkest-navy font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Retry Audit
                      </button>
                      <button
                        onClick={handleNewAudit}
                        className="border border-circuit-bronze/30 text-digital-gold hover:bg-digital-gold/10 font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Start New Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <DoubleFooter />
    </div>
  )
} 