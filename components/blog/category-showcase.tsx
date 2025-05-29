"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Zap, Shield, TrendingUp, Globe, ArrowRight, BookOpen } from "lucide-react"

export function CategoryShowcase() {
  const categories = [
    {
      name: "SEO",
      slug: "seo",
      description: "Search Engine Optimization strategies, tips, and best practices to improve your rankings",
      icon: BarChart3,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      articleCount: 12,
      featured: true,
      topics: ["Technical SEO", "Content Strategy", "Link Building", "Local SEO"],
    },
    {
      name: "Performance",
      slug: "performance",
      description: "Website speed optimization, Core Web Vitals, and performance monitoring techniques",
      icon: Zap,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      articleCount: 8,
      featured: true,
      topics: ["Core Web Vitals", "Page Speed", "Image Optimization", "Caching"],
    },
    {
      name: "Security",
      slug: "security",
      description: "Website security best practices, vulnerability protection, and compliance guidelines",
      icon: Shield,
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      articleCount: 6,
      featured: false,
      topics: ["SSL/TLS", "HTTPS", "Security Headers", "Vulnerability Scanning"],
    },
    {
      name: "UX Design",
      slug: "ux",
      description: "User experience design principles, conversion optimization, and usability improvements",
      icon: TrendingUp,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      articleCount: 10,
      featured: true,
      topics: ["Conversion Rate", "User Testing", "Accessibility", "Mobile UX"],
    },
    {
      name: "AI & Analytics",
      slug: "ai-analytics",
      description: "AI-powered website analysis, data insights, and automated optimization strategies",
      icon: BarChart3,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      articleCount: 4,
      featured: false,
      topics: ["Machine Learning", "Predictive Analytics", "Automation", "Data Visualization"],
    },
    {
      name: "General",
      slug: "general",
      description: "Industry news, trends, and general website optimization insights",
      icon: Globe,
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      articleCount: 15,
      featured: false,
      topics: ["Industry News", "Best Practices", "Case Studies", "Tutorials"],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-blue-500/10">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">Explore Blog Categories</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover expert insights and actionable strategies across different areas of website optimization.
        </p>
      </div>

      {/* Featured Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Featured Categories</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Most Popular</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories
            .filter((cat) => cat.featured)
            .map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.slug} href={`/blog/category/${category.slug}`}>
                  <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-full bg-white/5">
                          <IconComponent className={`w-6 h-6 ${category.color.split(" ")[1]}`} />
                        </div>
                        <Badge className={category.color}>{category.articleCount} articles</Badge>
                      </div>
                      <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium text-sm mb-2">Popular Topics:</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.topics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="outline" className="border-white/20 text-gray-300 text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-gray-400 text-sm">View all articles</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
        </div>
      </div>

      {/* All Categories */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">All Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link key={category.slug} href={`/blog/category/${category.slug}`}>
                <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-white/5">
                        <IconComponent className={`w-5 h-5 ${category.color.split(" ")[1]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                            {category.name}
                          </h4>
                          {category.featured && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{category.articleCount} articles available</p>
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

      {/* Call to Action */}
      <Card className="glass-card border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Can't Find What You're Looking For?</h3>
          <p className="text-gray-300 mb-6">
            Suggest a topic or category you'd like us to cover. We're always looking for new ideas!
          </p>
          <Button className="shimmer text-white font-semibold">
            Suggest a Topic
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
