"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, Search, Settings, Zap, Loader2 } from "lucide-react"

interface AuditOptions {
  seo: boolean
  performance: boolean
  accessibility: boolean
  security: boolean
  mobile: boolean
  content: boolean
}

interface UrlInputFormProps {
  onAuditStart?: (url: string, options: AuditOptions) => void
  isLoading?: boolean
}

export function UrlInputForm({ onAuditStart, isLoading = false }: UrlInputFormProps) {
  const [url, setUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [auditOptions, setAuditOptions] = useState<AuditOptions>({
    seo: true,
    performance: true,
    accessibility: true,
    security: false,
    mobile: true,
    content: false
  })

  const validateUrl = (inputUrl: string) => {
    try {
      const urlPattern = /^https?:\/\/.+\..+/
      const isValid = urlPattern.test(inputUrl)
      setIsValidUrl(isValid)
      return isValid
    } catch {
      setIsValidUrl(false)
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    validateUrl(newUrl)
  }

  const handleOptionChange = (option: keyof AuditOptions) => {
    setAuditOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidUrl && onAuditStart) {
      onAuditStart(url, auditOptions)
    }
  }

  const auditOptionsConfig = [
    {
      key: 'seo' as keyof AuditOptions,
      label: 'SEO Analysis',
      description: 'Meta tags, headings, keywords, structure',
      icon: Search,
      recommended: true
    },
    {
      key: 'performance' as keyof AuditOptions,
      label: 'Performance',
      description: 'Load times, Core Web Vitals, optimization',
      icon: Zap,
      recommended: true
    },
    {
      key: 'accessibility' as keyof AuditOptions,
      label: 'Accessibility',
      description: 'WCAG compliance, screen reader support',
      icon: Settings,
      recommended: true
    },
    {
      key: 'mobile' as keyof AuditOptions,
      label: 'Mobile UX',
      description: 'Responsive design, touch targets',
      icon: Globe,
      recommended: true
    },
    {
      key: 'security' as keyof AuditOptions,
      label: 'Security',
      description: 'SSL, headers, vulnerabilities',
      icon: Settings,
      recommended: false
    },
    {
      key: 'content' as keyof AuditOptions,
      label: 'Content Analysis',
      description: 'NLP analysis, readability, tone',
      icon: Search,
      recommended: false
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto bg-darker-navy border-circuit-bronze/20 hover-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-digital-gold">
          Website Audit Tool
        </CardTitle>
        <CardDescription className="text-slate-steel">
          Comprehensive AI-powered analysis of your website's performance, SEO, accessibility, and more
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* URL Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="website-url" className="text-sm font-medium text-digital-gold">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-steel h-4 w-4" />
              <Input
                id="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={handleUrlChange}
                className="pl-10 bg-darkest-navy border-circuit-bronze/30 text-digital-gold placeholder:text-slate-steel focus:border-electric-cyan"
              />
            </div>
            {url && !isValidUrl && (
              <p className="text-sm text-red-400">Please enter a valid URL (including http:// or https://)</p>
            )}
            {url && isValidUrl && (
              <p className="text-sm text-electric-cyan">✓ Valid URL format</p>
            )}
          </div>

          {/* Audit Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-digital-gold">Audit Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditOptionsConfig.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.key}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-deep-azure/30 border border-circuit-bronze/10 hover:border-circuit-bronze/30 transition-colors hover-shadow"
                  >
                    <Checkbox
                      id={option.key}
                      checked={auditOptions[option.key]}
                      onCheckedChange={() => handleOptionChange(option.key)}
                      className="mt-1 border-circuit-bronze data-[state=checked]:bg-digital-gold data-[state=checked]:border-digital-gold"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-digital-gold" />
                        <label
                          htmlFor={option.key}
                          className="text-sm font-medium text-digital-gold cursor-pointer"
                        >
                          {option.label}
                        </label>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-xs bg-electric-cyan/20 text-electric-cyan border-electric-cyan/30">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-steel">{option.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValidUrl || isLoading}
            className="w-full bg-digital-gold hover:bg-circuit-bronze text-darkest-navy font-semibold py-3 hover-shadow-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Audit...
              </>
            ) : isValidUrl ? (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Comprehensive Audit
              </>
            ) : (
              "Enter a valid URL to continue"
            )}
          </Button>
        </form>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20">
          <p className="text-sm text-slate-steel">
            <strong className="text-digital-gold">Note:</strong> The audit will analyze your website across multiple dimensions including technical SEO, performance metrics, accessibility standards, and user experience factors. Results will be available for download in multiple formats.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 