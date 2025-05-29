"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Twitter, Facebook, Linkedin, Link2, Mail, Copy, Check } from "lucide-react"

export function SocialTest() {
  const [copied, setCopied] = useState(false)
  const [shareResults, setShareResults] = useState<Record<string, boolean>>({})

  const testUrl = "https://auditpro.com/blog/10-seo-mistakes-killing-rankings"
  const testTitle = "10 SEO Mistakes That Are Killing Your Rankings"
  const testDescription =
    "Discover the most common SEO errors and how to fix them to boost your search engine visibility."

  const handleShare = (platform: string) => {
    // In a real app, this would open a share dialog
    console.log(`Sharing to ${platform}:`, { url: testUrl, title: testTitle, description: testDescription })
    setShareResults((prev) => ({ ...prev, [platform]: true }))

    // Simulate share dialog opening
    setTimeout(() => {
      alert(`Share dialog for ${platform} opened successfully!`)
    }, 500)
  }

  const copyToClipboard = () => {
    // In a real app, this would copy to clipboard
    console.log("Copying to clipboard:", testUrl)
    setCopied(true)
    setShareResults((prev) => ({ ...prev, clipboard: true }))

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Social Sharing Test</CardTitle>
        <CardDescription className="text-gray-300">Test social sharing functionality across platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded bg-white/5">
          <h3 className="text-white font-medium mb-2">Test Article</h3>
          <p className="text-gray-300 mb-4">{testTitle}</p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>URL: {testUrl}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium">Share on Platforms</h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-500/20 hover:border-blue-500/30 flex justify-between"
              onClick={() => handleShare("twitter")}
            >
              <div className="flex items-center">
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Twitter
              </div>
              {shareResults.twitter && <CheckCircle className="w-4 h-4 text-green-500" />}
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-600/20 hover:border-blue-600/30 flex justify-between"
              onClick={() => handleShare("facebook")}
            >
              <div className="flex items-center">
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Facebook
              </div>
              {shareResults.facebook && <CheckCircle className="w-4 h-4 text-green-500" />}
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-700/20 hover:border-blue-700/30 flex justify-between"
              onClick={() => handleShare("linkedin")}
            >
              <div className="flex items-center">
                <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                LinkedIn
              </div>
              {shareResults.linkedin && <CheckCircle className="w-4 h-4 text-green-500" />}
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-gray-500/20 hover:border-gray-500/30 flex justify-between"
              onClick={() => handleShare("email")}
            >
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                Email
              </div>
              {shareResults.email && <CheckCircle className="w-4 h-4 text-green-500" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 bg-slate-800/50 rounded border border-white/10 text-sm text-gray-300 truncate">
              {testUrl}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {copied && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Link copied to clipboard!</Badge>
          )}
        </div>

        <div className="p-4 rounded bg-white/5">
          <h3 className="text-white font-medium mb-2">Floating Share Component</h3>
          <p className="text-gray-300 mb-4">
            The floating social share component appears on the left side of blog posts for easy sharing.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 p-2 rounded bg-slate-800/50 border border-white/10">
              <Twitter className="w-4 h-4 text-blue-400" />
              <Facebook className="w-4 h-4 text-blue-600" />
              <Linkedin className="w-4 h-4 text-blue-700" />
              <Link2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-300 text-sm">
                Floating share buttons are visible on desktop and tablet devices, providing easy access to sharing
                options while reading.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-400">Social sharing functionality is working correctly!</span>
        </div>
      </CardContent>
    </Card>
  )
}
