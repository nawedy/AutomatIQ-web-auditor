"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Eye, ChevronRight, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { LazyLoad } from "@/components/ui/lazy-load";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  views: number;
  image: string;
  featured?: boolean;
}

// Sample blog data
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 SEO Mistakes That Are Killing Your Rankings",
    excerpt: "Discover the most common SEO mistakes that prevent websites from ranking higher in search results.",
    content: "SEO mistakes can significantly impact your website's performance...",
    category: "SEO",
    author: "Sarah Johnson",
    publishDate: "2025-05-15",
    readTime: "5 min read",
    views: 2450,
    image: "/images/placeholders/placeholder-400x250.svg",
    featured: true,
  },
  {
    id: "2",
    title: "Core Web Vitals: The Complete Guide for 2025",
    excerpt: "Everything you need to know about Core Web Vitals and how to optimize them for better user experience.",
    content: "Core Web Vitals are essential metrics...",
    category: "Performance",
    author: "Michael Chen",
    publishDate: "2025-05-12",
    readTime: "8 min read",
    views: 1890,
    image: "/images/placeholders/placeholder-400x250.svg",
  },
  {
    id: "3",
    title: "Website Security Best Practices in 2025",
    excerpt: "Protect your website from cyber threats with these essential security measures and best practices.",
    content: "Website security is more important than ever...",
    category: "Security",
    author: "Emily Rodriguez",
    publishDate: "2025-04-28",
    readTime: "6 min read",
    views: 1560,
    image: "/images/placeholders/placeholder-400x250.svg",
  },
  {
    id: "4",
    title: "UX Design Principles for Better Conversions",
    excerpt: "Learn how to apply user experience design principles to increase your website's conversion rates.",
    content: "Good UX design is crucial for conversions...",
    category: "UX/UI",
    author: "David Park",
    publishDate: "2025-04-20",
    readTime: "7 min read",
    views: 2100,
    image: "/images/placeholders/placeholder-400x250.svg",
  },
  {
    id: "5",
    title: "Local SEO Strategies for Small Businesses",
    excerpt: "Dominate local search results with these proven strategies tailored for small business owners.",
    content: "Local SEO can make or break a small business...",
    category: "SEO",
    author: "Lisa Wang",
    publishDate: "2025-04-05",
    readTime: "4 min read",
    views: 1750,
    image: "/images/placeholders/placeholder-400x250.svg",
  },
  {
    id: "6",
    title: "Mobile-First Design: Why It Matters More Than Ever",
    excerpt: "Understand the importance of mobile-first design and how to implement it effectively.",
    content: "Mobile-first design is no longer optional...",
    category: "Design",
    author: "Alex Thompson",
    publishDate: "2025-03-18",
    readTime: "5 min read",
    views: 1920,
    image: "/images/placeholders/placeholder-400x250.svg",
  },
];

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="glass-card border-gold/10 overflow-hidden h-[400px] w-[300px] sm:w-[320px] flex-shrink-0 hover:border-gold/30 transition-all duration-300 group">
        <div className="relative h-48 overflow-hidden">
          {post.image ? (
            <OptimizedImage
              src={post.image}
              alt={post.title}
              width={320}
              height={192}
              className="w-full h-full"
              sizes="(max-width: 640px) 300px, 320px"
              quality={80}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/20 to-silver/20"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gold/90 text-navy font-medium text-xs">
              {post.category}
            </Badge>
          </div>
          {post.featured && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-electric-cyan/90 text-navy font-medium text-xs">
                Featured
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className="p-4 flex flex-col justify-between h-52">
          <div>
            <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors">
              {post.title}
            </h3>
            <p className="text-white text-sm line-clamp-3 mb-3">
              {post.excerpt}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-white/80">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{post.author}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/80">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{new Date(post.publishDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Eye className="h-3 w-3" />
                <span>{post.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BlogPostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="bg-midnight-navy border border-gold/20 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-48 sm:h-64 overflow-hidden">
            {post.image ? (
              <OptimizedImage
                src={post.image}
                alt={post.title}
                fill
                className="w-full h-full"
                sizes="(max-width: 768px) 100vw, 672px"
                quality={85}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gold/30 to-silver/20"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-4 right-16">
              <Badge className="bg-gold/90 text-navy font-medium mb-2 text-xs">
                {post.category}
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2">{post.title}</h2>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-white/80 mb-4 gap-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>
            
            <p className="text-white mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            
            <p className="text-white/90 mb-6 leading-relaxed">
              {post.content}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/blog/${post.id}`} className="flex-1">
                <Button className="gold-shimmer text-navy font-semibold w-full sm:w-auto">
                  Read Full Article
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/blog/category/${post.category.toLowerCase()}`}>
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 w-full sm:w-auto">
                  More in {post.category}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BlogCarousel() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <LazyLoad fallback={
      <section className="py-16 w-full max-w-[100vw] overflow-hidden bg-gradient-to-br from-midnight-navy to-deep-azure border-y border-gold/10">
        <div className="container mx-auto px-4 mb-8 max-w-7xl">
          <div className="text-center">
            <div className="mb-4 bg-gold/20 text-gold border-gold/30 text-xs rounded px-2 py-1 w-fit mx-auto animate-pulse">Loading...</div>
            <div className="h-8 bg-gray-600 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-600 rounded w-96 mx-auto animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-600 h-[400px] w-[300px] sm:w-[320px] flex-shrink-0 rounded animate-pulse" />
          ))}
        </div>
      </section>
    }>
      <section className="py-16 w-full max-w-[100vw] overflow-hidden bg-gradient-to-br from-midnight-navy to-deep-azure border-y border-gold/10">
        <div className="container mx-auto px-4 mb-8 max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 text-xs">Latest Insights</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold shimmer-subtitle mb-4">
              From Our Blog
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-white">
              Stay updated with the latest trends, tips, and insights in website optimization, SEO, and digital marketing.
            </p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <Marquee
            pauseOnHover={true}
            className="[--duration:40s] py-4"
            repeat={4}
          >
            {[...blogPosts, ...blogPosts].map((post, index) => (
              <BlogCard
                key={`${post.id}-${index}`}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </Marquee>
        </div>

        <div className="text-center mt-8 px-4 max-w-7xl mx-auto">
          <Link href="/blog">
            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              View All Articles
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {selectedPost && (
          <BlogPostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </section>
    </LazyLoad>
  );
} 