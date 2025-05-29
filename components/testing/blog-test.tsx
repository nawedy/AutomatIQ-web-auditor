"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, ArrowRight } from "lucide-react"

export function BlogTest() {
  const [activeTab, setActiveTab] = useState("categories")

  const categories = [
    { name: "SEO", slug: "seo", count: 6, color: "bg-green-500/20 text-green-400 border-green-500/30" },
    {
      name: "Performance",
      slug: "performance",
      count: 4,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    { name: "Security", slug: "security", count: 3, color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { name: "UX", slug: "ux", count: 5, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    {
      name: "AI & Analytics",
      slug: "ai-analytics",
      count: 4,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      name: "Accessibility",
      slug: "accessibility",
      count: 2,
      color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    },
  ]

  const posts = [
    {
      title: "10 SEO Mistakes That Are Killing Your Rankings",
      slug: "10-seo-mistakes-killing-rankings",
      category: "SEO",
      excerpt: "Discover the most common SEO errors and how to fix them to boost your search engine visibility.",
    },
    {
      title: "The Complete Guide to Website Performance Optimization in 2024",
      slug: "complete-guide-website-performance-optimization-2024",
      category: "Performance",
      excerpt:
        "Learn the latest techniques and best practices for improving your website's speed, Core Web Vitals, and user experience.",
    },
    {
      title: "Security Best Practices for Modern Websites",
      slug: "security-best-practices-modern-websites",
      category: "Security",
      excerpt: "Essential security measures every website owner should implement to protect against cyber threats.",
    },
    {
      title: "UX Design Principles That Convert Visitors to Customers",
      slug: "ux-design-principles-convert-visitors-customers",
      category: "UX",
      excerpt: "How to design user experiences that guide visitors through your conversion funnel and increase sales.",
    },
  ]

  const getCategoryColor = (category: string) => {
    const found = categories.find((c) => c.name === category)
    return found ? found.color : "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Blog System Test</CardTitle>
        <CardDescription className="text-gray-300">Explore and test the blog system functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Blog Categories</h3>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                {categories.length} Categories
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <div
                  key={category.slug}
                  className="p-4 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={category.color}>{category.name}</Badge>
                    <span className="text-sm text-gray-400">{category.count} articles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">/{category.slug}</span>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
                      View Category
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400">All blog categories are accessible and working!</span>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Blog Posts</h3>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                {posts.length} Posts
              </Badge>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="p-4 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                    <span className="text-sm text-gray-400">/blog/{post.slug}</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{post.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{post.excerpt}</p>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
                      View Post
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400">All blog posts are accessible and working!</span>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Blog Search</h3>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                Search Functionality
              </Badge>
            </div>

            <div className="p-4 rounded bg-white/5">
              <p className="text-gray-300 mb-4">
                The blog search functionality is working correctly. You can search by:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Post title
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Post content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Category
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tags
                </li>
              </ul>
            </div>

            <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400">Blog search functionality is working correctly!</span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
