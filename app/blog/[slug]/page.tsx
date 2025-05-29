"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DoubleFooter } from "@/components/double-footer"
import { SocialShare, FloatingSocialShare } from "@/components/social-share"
import { Calendar, User, Clock, ArrowLeft, ArrowRight } from "lucide-react"

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  // Sample blog post data
  const blogPosts: Record<string, any> = {
    "10-seo-mistakes-killing-rankings": {
      title: "10 SEO Mistakes That Are Killing Your Rankings",
      excerpt: "Discover the most common SEO errors and how to fix them to boost your search engine visibility.",
      author: "Mike Chen",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "SEO",
      image: "/placeholder.svg?height=400&width=800",
      content: `
        <p>Search Engine Optimization (SEO) is crucial for driving organic traffic to your website. However, many website owners unknowingly make mistakes that can severely impact their search rankings. In this comprehensive guide, we'll explore the 10 most common SEO mistakes and provide actionable solutions to fix them.</p>

        <h2>1. Ignoring Page Loading Speed</h2>
        <p>Page speed is a critical ranking factor. Google has made it clear that slow-loading pages will be penalized in search results. Use tools like Google PageSpeed Insights to identify and fix speed issues.</p>

        <h2>2. Not Optimizing for Mobile</h2>
        <p>With mobile-first indexing, Google primarily uses the mobile version of your site for ranking. Ensure your website is fully responsive and provides an excellent mobile experience.</p>

        <h2>3. Keyword Stuffing</h2>
        <p>Overusing keywords in your content can actually hurt your rankings. Focus on creating natural, valuable content that incorporates keywords organically.</p>

        <h2>4. Neglecting Meta Descriptions</h2>
        <p>Meta descriptions don't directly impact rankings, but they significantly affect click-through rates. Write compelling, descriptive meta descriptions for every page.</p>

        <h2>5. Poor Internal Linking Structure</h2>
        <p>Internal links help search engines understand your site structure and distribute page authority. Create a logical internal linking strategy to improve your SEO.</p>

        <h2>Conclusion</h2>
        <p>Avoiding these common SEO mistakes can significantly improve your search rankings and organic traffic. Remember, SEO is a long-term strategy that requires consistent effort and monitoring.</p>
      `,
      tags: ["SEO", "Rankings", "Website Optimization", "Search Engine"],
    },
    "complete-guide-website-performance-optimization-2024": {
      title: "The Complete Guide to Website Performance Optimization in 2024",
      excerpt:
        "Learn the latest techniques and best practices for improving your website's speed, Core Web Vitals, and user experience.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "8 min read",
      category: "Performance",
      image: "/placeholder.svg?height=400&width=800",
      content: `
        <p>Website performance has never been more important. With Google's Core Web Vitals becoming a ranking factor and user expectations at an all-time high, optimizing your website's performance is crucial for success.</p>

        <h2>Understanding Core Web Vitals</h2>
        <p>Core Web Vitals are a set of metrics that Google considers essential for user experience:</p>
        <ul>
          <li><strong>Largest Contentful Paint (LCP):</strong> Measures loading performance</li>
          <li><strong>First Input Delay (FID):</strong> Measures interactivity</li>
          <li><strong>Cumulative Layout Shift (CLS):</strong> Measures visual stability</li>
        </ul>

        <h2>Performance Optimization Techniques</h2>
        <p>Here are the most effective techniques for improving website performance in 2024:</p>

        <h3>1. Image Optimization</h3>
        <p>Images often account for the majority of a page's weight. Use modern formats like WebP, implement lazy loading, and serve responsive images.</p>

        <h3>2. Code Splitting and Lazy Loading</h3>
        <p>Load only the code that's needed for the current page. Implement code splitting and lazy loading for JavaScript and CSS.</p>

        <h3>3. Content Delivery Network (CDN)</h3>
        <p>Use a CDN to serve your content from servers closer to your users, reducing latency and improving load times.</p>

        <h2>Measuring Performance</h2>
        <p>Use tools like Google PageSpeed Insights, Lighthouse, and WebPageTest to measure and monitor your website's performance regularly.</p>
      `,
      tags: ["Performance", "Core Web Vitals", "Website Speed", "User Experience"],
    },
  }

  const post = blogPosts[slug] || {
    title: "Blog Post Not Found",
    excerpt: "The requested blog post could not be found.",
    author: "Unknown",
    date: "Unknown",
    readTime: "0 min read",
    category: "Unknown",
    image: "/placeholder.svg?height=400&width=800",
    content: "<p>This blog post could not be found. Please check the URL or return to the blog homepage.</p>",
    tags: [],
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SEO":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Performance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Security":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "UX":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "AI & Analytics":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Accessibility":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href="/blog">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Blog
                </Button>
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-lg font-semibold text-white truncate">{post.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SocialShare url={currentUrl} title={post.title} description={post.excerpt} hashtags={post.tags} />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {/* Floating Social Share */}
          <FloatingSocialShare url={currentUrl} title={post.title} description={post.excerpt} hashtags={post.tags} />

          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Article Header */}
            <div className="space-y-6">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4">
                <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                <h1 className="text-4xl font-bold text-white leading-tight">{post.title}</h1>
                <p className="text-xl text-gray-300">{post.excerpt}</p>

                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>
            </Card>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-white/20 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Found this article helpful?</h3>
                    <p className="text-gray-300">Share it with others who might benefit from it.</p>
                  </div>
                  <SocialShare url={currentUrl} title={post.title} description={post.excerpt} hashtags={post.tags} />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Link href="/blog">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
              <Link href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  More {post.category} Articles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
