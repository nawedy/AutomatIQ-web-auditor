"use client"

import { useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DoubleFooter } from "@/components/double-footer"
import { Search, Calendar, User, ArrowRight, TrendingUp, Zap, Shield, BarChart3, Globe, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const featuredPost = {
    title: "The Complete Guide to Website Performance Optimization in 2024",
    excerpt:
      "Learn the latest techniques and best practices for improving your website's speed, Core Web Vitals, and user experience.",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Performance",
    image: "/placeholder.svg?height=400&width=600",
    featured: true,
    slug: "complete-guide-website-performance-optimization-2024",
  }

  const blogPosts = [
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
      title: "Mobile-First Indexing: What You Need to Know",
      excerpt: "Understanding Google's mobile-first approach and how to optimize your site for mobile users.",
      author: "Lisa Wang",
      date: "March 3, 2024",
      readTime: "6 min read",
      category: "SEO",
      image: "/placeholder.svg?height=300&width=400",
      slug: "mobile-first-indexing-what-to-know",
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
  ]

  const categories = [
    { name: "All", count: 25, icon: Globe },
    { name: "SEO", count: 8, icon: BarChart3 },
    { name: "Performance", count: 6, icon: Zap },
    { name: "Security", count: 4, icon: Shield },
    { name: "UX", count: 5, icon: TrendingUp },
    { name: "AI & Analytics", count: 2, icon: BarChart3 },
  ]

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

  // Filter posts based on search query and selected category
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-32">
        <div className="section-padding">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold shimmer-title mb-4">
                AutomatIQ.AI Blog
              </h1>
              <p className="text-lg text-white mb-8">
                Latest insights, tips, and best practices for website optimization, SEO, performance, and digital growth.
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search articles..."
                    className="pl-12 glass-card border-gold/30 text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Badge
                className={`cursor-pointer transition-all duration-300 ${
                  selectedCategory === "All" 
                    ? "bg-gold text-navy hover:bg-gold/90" 
                    : "bg-gold/20 text-gold border-gold/30 hover:bg-gold/30"
                }`}
                onClick={() => setSelectedCategory("All")}
              >
                All ({blogPosts.length})
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.name}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCategory === category.name
                      ? `${getCategoryColor(category.name).replace("text-", "bg-").replace("border-", "").replace("/30", "")} text-navy hover:opacity-90`
                      : `${getCategoryColor(category.name)} hover:bg-opacity-30`
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon} {category.name} ({category.count})
                </Badge>
              ))}
            </div>

            {/* Featured Article */}
            {featuredPost && (
              <Card className="glass-card border-gold/20 mb-12 overflow-hidden hover-shadow">
                <CardContent className="p-0">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <div className="h-64 md:h-full bg-gradient-to-br from-gold/20 to-silver/20 flex items-center justify-center">
                        <div className="text-center text-gold">
                          <div className="text-2xl font-bold mb-2">Featured Article</div>
                          <div className="text-sm opacity-80">Latest Insights</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8">
                      <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Featured</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-300 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {featuredPost.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {featuredPost.readTime}
                          </div>
                        </div>
                        <Badge className={getCategoryColor(featuredPost.category)}>
                          <Tag className="w-3 h-3 mr-1" />
                          {featuredPost.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Articles Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <Card key={index} className="glass-card border-gold/10 overflow-hidden hover-shadow h-full">
                  <CardHeader className="p-0">
                    <div className="h-48 bg-gradient-to-br from-gold/10 to-silver/10 flex items-center justify-center">
                      <div className="text-center text-gold">
                        <div className="text-lg font-bold mb-1">Article</div>
                        <div className="text-xs opacity-80">{post.category}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge className={`mb-3 w-fit ${getCategoryColor(post.category)}`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {post.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 flex-grow">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-gold/10">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                <p className="text-gray-400">
                  {searchQuery ? "Try adjusting your search terms" : "No articles in this category yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <DoubleFooter />
    </div>
  )
}
