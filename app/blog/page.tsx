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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Blog</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10 neomorphism border-0 text-white placeholder-gray-400 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Website Optimization Blog</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Expert insights, tips, and strategies to help you optimize your website for better performance, SEO, and
                user experience.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={
                      category.name === "All"
                        ? "/blog"
                        : `/blog/category/${category.name.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`
                    }
                  >
                    <Button
                      variant="outline"
                      className={`border-white/20 text-white hover:bg-white/10 ${
                        category.name === selectedCategory ? "bg-blue-500/20 border-blue-500/30" : ""
                      }`}
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name} ({category.count})
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px] border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Post */}
            <Card className="glass-card border-white/10 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto">
                  <img
                    src={featuredPost.image || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Featured Article</Badge>
                  <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{featuredPost.title}</h2>
                  <p className="text-gray-300 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button className="w-fit shimmer text-white font-semibold">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Browse Categories Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter((cat) => cat.name !== "All")
                  .map((category, index) => {
                    const IconComponent = category.icon
                    return (
                      <Link
                        key={index}
                        href={`/blog/category/${category.name.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`}
                      >
                        <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-full bg-white/5">
                                <IconComponent className="w-6 h-6 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                                  {category.name}
                                </h3>
                                <p className="text-gray-400 text-sm">{category.count} articles</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                {searchQuery || selectedCategory !== "All"
                  ? `Search Results (${filteredPosts.length})`
                  : "Latest Articles"}
              </h2>

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
                  <p className="text-gray-400 text-lg">No articles found matching your search criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-white/20 text-white hover:bg-white/10"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("All")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredPosts.length > 0 && (
              <div className="text-center">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8">
                  Load More Articles
                </Button>
              </div>
            )}

            {/* Newsletter Signup */}
            <Card className="glass-card border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Stay Updated</CardTitle>
                <CardDescription className="text-gray-300">
                  Get the latest website optimization tips and insights delivered to your inbox weekly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 neomorphism border-0 text-white placeholder-gray-400"
                  />
                  <Button className="shimmer text-white font-semibold">Subscribe</Button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">No spam, unsubscribe at any time.</p>
              </CardContent>
            </Card>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
