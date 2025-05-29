"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DoubleFooter } from "@/components/double-footer"
import { Search, Calendar, User, ArrowRight, ArrowLeft, TrendingUp, Zap, Shield, BarChart3, Globe } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [searchQuery, setSearchQuery] = useState("")

  // Map slug to category name
  const categoryMap: Record<string, string> = {
    seo: "SEO",
    performance: "Performance",
    security: "Security",
    ux: "UX",
    "ai-analytics": "AI & Analytics",
    accessibility: "Accessibility",
  }

  const categoryName = categoryMap[slug] || "Unknown"

  // Sample posts for each category
  const allPosts = [
    {
      title: "10 SEO Mistakes That Are Killing Your Rankings",
      excerpt: "Discover the most common SEO errors and how to fix them to boost your search engine visibility.",
      author: "Mike Chen",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "SEO",
      image: "/placeholder.svg?height=300&width=400",
      slug: "10-seo-mistakes-killing-rankings",
    },
    {
      title: "The Ultimate Guide to Technical SEO in 2024",
      excerpt: "Everything you need to know about technical SEO to improve your website's search engine visibility.",
      author: "Daniel Brown",
      date: "February 25, 2024",
      readTime: "10 min read",
      category: "SEO",
      image: "/placeholder.svg?height=300&width=400",
      slug: "ultimate-guide-technical-seo-2024",
    },
    {
      title: "How to Create a Winning Content Strategy for SEO",
      excerpt: "Learn how to create content that ranks well in search engines and engages your audience.",
      author: "Sophia Martinez",
      date: "February 22, 2024",
      readTime: "8 min read",
      category: "SEO",
      image: "/placeholder.svg?height=300&width=400",
      slug: "create-winning-content-strategy-seo",
    },
    {
      title: "The Complete Guide to Website Performance Optimization in 2024",
      excerpt:
        "Learn the latest techniques and best practices for improving your website's speed, Core Web Vitals, and user experience.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "8 min read",
      category: "Performance",
      image: "/placeholder.svg?height=300&width=400",
      slug: "complete-guide-website-performance-optimization-2024",
    },
    {
      title: "How to Improve Your Website's Core Web Vitals",
      excerpt: "A step-by-step guide to improving your Core Web Vitals scores and boosting your search rankings.",
      author: "Rachel Green",
      date: "February 28, 2024",
      readTime: "7 min read",
      category: "Performance",
      image: "/placeholder.svg?height=300&width=400",
      slug: "improve-website-core-web-vitals",
    },
    {
      title: "Security Best Practices for Modern Websites",
      excerpt: "Essential security measures every website owner should implement to protect against cyber threats.",
      author: "Emily Davis",
      date: "March 10, 2024",
      readTime: "7 min read",
      category: "Security",
      image: "/placeholder.svg?height=300&width=400",
      slug: "security-best-practices-modern-websites",
    },
    {
      title: "UX Design Principles That Convert Visitors to Customers",
      excerpt: "How to design user experiences that guide visitors through your conversion funnel and increase sales.",
      author: "Alex Rodriguez",
      date: "March 8, 2024",
      readTime: "5 min read",
      category: "UX",
      image: "/placeholder.svg?height=300&width=400",
      slug: "ux-design-principles-convert-visitors-customers",
    },
    {
      title: "AI-Powered Website Analytics: The Future is Here",
      excerpt: "Explore how artificial intelligence is revolutionizing website analysis and optimization strategies.",
      author: "David Kim",
      date: "March 5, 2024",
      readTime: "9 min read",
      category: "AI & Analytics",
      image: "/placeholder.svg?height=300&width=400",
      slug: "ai-powered-website-analytics-future",
    },
    {
      title: "Website Accessibility: Building for Everyone",
      excerpt: "A comprehensive guide to making your website accessible to users with disabilities.",
      author: "James Thompson",
      date: "March 1, 2024",
      readTime: "8 min read",
      category: "Accessibility",
      image: "/placeholder.svg?height=300&width=400",
      slug: "website-accessibility-building-for-everyone",
    },
  ]

  // Filter posts by category
  const categoryPosts = allPosts.filter((post) => post.category === categoryName)

  // Filter by search query
  const filteredPosts = categoryPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SEO":
        return <BarChart3 className="w-6 h-6" />
      case "Performance":
        return <Zap className="w-6 h-6" />
      case "Security":
        return <Shield className="w-6 h-6" />
      case "UX":
        return <TrendingUp className="w-6 h-6" />
      case "AI & Analytics":
        return <BarChart3 className="w-6 h-6" />
      case "Accessibility":
        return <Globe className="w-6 h-6" />
      default:
        return <Globe className="w-6 h-6" />
    }
  }

  const relatedCategories = Object.entries(categoryMap)
    .filter(([key, value]) => value !== categoryName)
    .slice(0, 3)

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
              <h1 className="text-xl font-semibold text-white">{categoryName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search ${categoryName} articles...`}
                className="pl-10 neomorphism border-0 text-white placeholder-gray-400 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Category Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full ${getCategoryColor(categoryName).replace("text-", "bg-").replace("border-", "").replace("/30", "/10")}`}
                >
                  {getCategoryIcon(categoryName)}
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white">{categoryName} Articles</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {categoryName === "SEO" &&
                  "Improve your search engine rankings with expert SEO strategies and techniques."}
                {categoryName === "Performance" &&
                  "Optimize your website's speed and Core Web Vitals for better user experience."}
                {categoryName === "Security" &&
                  "Protect your website from threats with comprehensive security best practices."}
                {categoryName === "UX" && "Design user experiences that convert visitors into customers."}
                {categoryName === "AI & Analytics" &&
                  "Leverage artificial intelligence and analytics to optimize your website."}
                {categoryName === "Accessibility" &&
                  "Make your website accessible to all users with inclusive design practices."}
              </p>
              <Badge className={getCategoryColor(categoryName)}>
                {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Articles Grid */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post, index) => (
                    <Card
                      key={index}
                      className="glass-card border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 group"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                          <span className="text-xs text-gray-400">{post.readTime}</span>
                        </div>
                        <CardTitle className="text-white text-lg leading-tight group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-300 mb-4">{post.excerpt}</CardDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{post.date}</span>
                            </div>
                          </div>
                          <Link href={`/blog/${post.slug}`}>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
                              Read More
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No articles found in this category.</p>
                  <Link href="/blog">
                    <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
                      Browse All Articles
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Related Categories */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Explore Other Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedCategories.map(([slug, name]) => (
                  <Link key={slug} href={`/blog/category/${slug}`}>
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-white/5">{getCategoryIcon(name)}</div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                              {name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {allPosts.filter((post) => post.category === name).length} articles
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
