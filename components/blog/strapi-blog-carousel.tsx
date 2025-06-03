"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Eye, ChevronRight, X, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { useFeaturedBlogPosts } from "@/hooks/use-strapi";
import { strapiUtils } from "@/lib/strapi";
import type { BlogPost } from "@/types/strapi";
import Link from "next/link";

function BlogCardSkeleton() {
  return (
    <Card className="glass-card border-gold/10 overflow-hidden h-[400px] w-[300px] sm:w-[320px] flex-shrink-0 animate-pulse">
      <div className="relative h-48 bg-gradient-to-br from-slate-steel/20 to-deep-azure/20"></div>
      <CardContent className="p-4 flex flex-col justify-between h-52">
        <div className="space-y-3">
          <div className="h-4 bg-slate-steel/30 rounded w-3/4"></div>
          <div className="h-3 bg-slate-steel/20 rounded w-full"></div>
          <div className="h-3 bg-slate-steel/20 rounded w-2/3"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-steel/20 rounded w-20"></div>
            <div className="h-3 bg-slate-steel/20 rounded w-16"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-slate-steel/20 rounded w-24"></div>
            <div className="h-3 bg-slate-steel/20 rounded w-12"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const featuredImage = post.featuredImage?.data;
  const author = post.author?.data;
  const categories = post.categories?.data || [];

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
          {featuredImage ? (
            <img
              src={strapiUtils.getImageUrl(featuredImage, 'medium')}
              alt={featuredImage.alternativeText || post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/20 to-silver/20"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
          
          {categories.length > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gold/90 text-navy font-medium text-xs">
                {categories[0].name}
              </Badge>
            </div>
          )}
          
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
            <p className="text-silver text-sm line-clamp-3 mb-3">
              {post.excerpt || strapiUtils.getPlainText(post.content)}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-silver/80">
              {author && (
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{author.name}</span>
                </div>
              )}
              {post.readTime && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-silver/80">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{strapiUtils.formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              {post.views && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Eye className="h-3 w-3" />
                  <span>{post.views.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BlogPostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const featuredImage = post.featuredImage?.data;
  const author = post.author?.data;
  const categories = post.categories?.data || [];

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
            {featuredImage ? (
              <img
                src={strapiUtils.getImageUrl(featuredImage, 'large')}
                alt={featuredImage.alternativeText || post.title}
                className="w-full h-full object-cover"
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
              {categories.length > 0 && (
                <Badge className="bg-gold/90 text-navy font-medium mb-2 text-xs">
                  {categories[0].name}
                </Badge>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2">{post.title}</h2>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-silver/80 mb-4 gap-2">
              <div className="flex flex-wrap items-center gap-4">
                {author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{strapiUtils.formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime} min read</span>
                  </div>
                )}
              </div>
              {post.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              )}
            </div>
            
            <p className="text-silver mb-6 leading-relaxed">
              {post.excerpt || strapiUtils.getPlainText(post.content)}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/blog/${post.slug}`} className="flex-1">
                <Button className="gold-shimmer text-navy font-semibold w-full sm:w-auto">
                  Read Full Article
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {categories.length > 0 && (
                <Link href={`/blog/category/${categories[0].slug}`}>
                  <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 w-full sm:w-auto">
                    More in {categories[0].name}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-gold mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Unable to load blog posts</h3>
        <p className="text-silver text-sm mb-4">
          There was an error loading the latest blog posts. Please try again.
        </p>
        <Button 
          onClick={onRetry}
          variant="outline" 
          className="border-gold/30 text-gold hover:bg-gold/10"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function StrapiBlogCarousel() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { data: blogPosts, loading, error, refresh } = useFeaturedBlogPosts(8);

  if (error) {
    return (
      <section className="py-16 w-full max-w-[100vw] overflow-hidden bg-gradient-to-br from-midnight-navy to-deep-azure border-y border-gold/10">
        <div className="container mx-auto px-4 mb-8 max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 text-xs">Latest Insights</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              From Our Blog
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-silver">
              Stay updated with the latest trends, tips, and insights in website optimization, SEO, and digital marketing.
            </p>
          </div>
          <ErrorState onRetry={refresh} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 w-full max-w-[100vw] overflow-hidden bg-gradient-to-br from-midnight-navy to-deep-azure border-y border-gold/10">
      <div className="container mx-auto px-4 mb-8 max-w-7xl">
        <div className="text-center">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 text-xs">Latest Insights</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            From Our Blog
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-silver">
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
          {loading ? (
            // Show more skeleton loading cards for better continuity
            Array.from({ length: 12 }).map((_, index) => (
              <BlogCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            // Duplicate the blog posts to ensure continuous scrolling
            [...(blogPosts || []), ...(blogPosts || [])].map((post, index) => (
              <BlogCard
                key={`${post.id}-${index}`}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))
          )}
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
  );
} 