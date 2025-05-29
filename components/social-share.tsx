"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Twitter, Facebook, Linkedin, Link2, Mail, Check, Copy } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SocialShareProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
}

export function SocialShare({ url, title, description = "", hashtags = [] }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)
  const hashtagString = hashtags.map((tag) => `#${tag}`).join(" ")

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(",")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass-card border-white/20 bg-slate-900/95 text-white w-80">
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-2">Share this article</h3>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-500/20 hover:border-blue-500/30"
              onClick={() => openShare("twitter")}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-600/20 hover:border-blue-600/30"
              onClick={() => openShare("facebook")}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-blue-700/20 hover:border-blue-700/30"
              onClick={() => openShare("linkedin")}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-gray-500/20 hover:border-gray-500/30"
              onClick={() => openShare("email")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 bg-slate-800/50 rounded border border-white/10 text-sm text-gray-300 truncate">
              {url}
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
      </PopoverContent>
    </Popover>
  )
}

// Floating social share component for blog posts
export function FloatingSocialShare({ url, title, description, hashtags }: SocialShareProps) {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <Card className="glass-card border-white/20 bg-slate-900/95">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            <div className="text-center mb-2">
              <Share2 className="w-5 h-5 text-blue-400 mx-auto" />
              <span className="text-xs text-gray-400 mt-1 block">Share</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-blue-500/20"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags?.join(",")}`,
                  "_blank",
                )
              }
            >
              <Twitter className="w-4 h-4 text-blue-400" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-blue-600/20"
              onClick={() =>
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
              }
            >
              <Facebook className="w-4 h-4 text-blue-600" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-blue-700/20"
              onClick={() =>
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
              }
            >
              <Linkedin className="w-4 h-4 text-blue-700" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 hover:bg-white/10"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url)
                } catch (err) {
                  console.error("Failed to copy: ", err)
                }
              }}
            >
              <Link2 className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
