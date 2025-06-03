/**
 * Strapi CMS Service Functions for AutomatIQ.AI
 * 
 * This file contains specific service functions for different content types,
 * providing a clean API for fetching and managing CMS content.
 */

import { strapi, strapiUtils } from './strapi';
import type {
  BlogPost,
  CaseStudy,
  Author,
  BlogCategory,
  Industry,
  Tag,
  Page,
  GlobalSettings,
  ContactSubmission,
  StrapiBlogPostsResponse,
  StrapiBlogPostResponse,
  StrapiCaseStudiesResponse,
  StrapiCaseStudyResponse,
  StrapiQueryParams,
} from '@/types/strapi';

// Blog Services
export const blogService = {
  /**
   * Get all blog posts with pagination and filtering
   */
  async getPosts(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    author?: string;
    featured?: boolean;
    search?: string;
    sort?: string;
  } = {}): Promise<BlogPost[]> {
    const {
      page = 1,
      pageSize = 10,
      category,
      tag,
      author,
      featured,
      search,
      sort = 'publishedAt:desc',
    } = params;

    const filters: Record<string, any> = {};

    if (category) {
      filters['categories.slug'] = { eq: category };
    }

    if (tag) {
      filters['tags.slug'] = { eq: tag };
    }

    if (author) {
      filters['author.slug'] = { eq: author };
    }

    if (featured !== undefined) {
      filters.featured = { eq: featured };
    }

    if (search) {
      filters.$or = [
        { title: { containsi: search } },
        { excerpt: { containsi: search } },
        { content: { containsi: search } },
      ];
    }

    const response = await strapi.find<BlogPost>('blog-posts', {
      filters,
      sort,
      pagination: { page, pageSize },
      populate: [
        'featuredImage',
        'author',
        'author.avatar',
        'categories',
        'tags',
        'seo',
        'seo.metaImage',
      ],
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const response = await strapi.find<BlogPost>('blog-posts', {
      filters: { slug: { eq: slug } },
      populate: [
        'featuredImage',
        'author',
        'author.avatar',
        'author.social',
        'categories',
        'tags',
        'seo',
        'seo.metaImage',
        'seo.metaSocial',
        'relatedPosts',
        'relatedPosts.featuredImage',
        'relatedPosts.author',
        'relatedPosts.categories',
      ],
      publicationState: 'live',
    });

    const posts = strapiUtils.getData(response);
    return posts && posts.length > 0 ? posts[0] : null;
  },

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(limit: number = 6): Promise<BlogPost[]> {
    return this.getPosts({
      featured: true,
      pageSize: limit,
      sort: 'publishedAt:desc',
    });
  },

  /**
   * Get recent blog posts
   */
  async getRecentPosts(limit: number = 10): Promise<BlogPost[]> {
    return this.getPosts({
      pageSize: limit,
      sort: 'publishedAt:desc',
    });
  },

  /**
   * Get related posts based on categories and tags
   */
  async getRelatedPosts(
    postId: number,
    categories: string[],
    tags: string[],
    limit: number = 4
  ): Promise<BlogPost[]> {
    const filters: Record<string, any> = {
      id: { ne: postId },
    };

    if (categories.length > 0 || tags.length > 0) {
      filters.$or = [];
      
      if (categories.length > 0) {
        filters.$or.push({ 'categories.slug': { in: categories } });
      }
      
      if (tags.length > 0) {
        filters.$or.push({ 'tags.slug': { in: tags } });
      }
    }

    const response = await strapi.find<BlogPost>('blog-posts', {
      filters,
      pagination: { pageSize: limit },
      populate: ['featuredImage', 'author', 'categories'],
      sort: 'publishedAt:desc',
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Update blog post views
   */
  async incrementViews(id: number): Promise<void> {
    // This would typically be handled by a custom Strapi controller
    // For now, we'll just log it
    console.log(`Incrementing views for blog post ${id}`);
  },
};

// Case Study Services
export const caseStudyService = {
  /**
   * Get all case studies with pagination and filtering
   */
  async getCaseStudies(params: {
    page?: number;
    pageSize?: number;
    industry?: string;
    featured?: boolean;
    search?: string;
    sort?: string;
  } = {}): Promise<CaseStudy[]> {
    const {
      page = 1,
      pageSize = 10,
      industry,
      featured,
      search,
      sort = 'publishedAt:desc',
    } = params;

    const filters: Record<string, any> = {};

    if (industry) {
      filters['industry.slug'] = { eq: industry };
    }

    if (featured !== undefined) {
      filters.featured = { eq: featured };
    }

    if (search) {
      filters.$or = [
        { title: { containsi: search } },
        { company: { containsi: search } },
        { challenge: { containsi: search } },
      ];
    }

    const response = await strapi.find<CaseStudy>('case-studies', {
      filters,
      sort,
      pagination: { page, pageSize },
      populate: [
        'featuredImage',
        'industry',
        'results',
        'testimonial',
        'testimonial.avatar',
        'seo',
      ],
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Get a single case study by slug
   */
  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
    const response = await strapi.find<CaseStudy>('case-studies', {
      filters: { slug: { eq: slug } },
      populate: [
        'featuredImage',
        'industry',
        'results',
        'gallery',
        'testimonial',
        'testimonial.avatar',
        'seo',
        'seo.metaImage',
        'seo.metaSocial',
      ],
      publicationState: 'live',
    });

    const caseStudies = strapiUtils.getData(response);
    return caseStudies && caseStudies.length > 0 ? caseStudies[0] : null;
  },

  /**
   * Get featured case studies
   */
  async getFeaturedCaseStudies(limit: number = 3): Promise<CaseStudy[]> {
    return this.getCaseStudies({
      featured: true,
      pageSize: limit,
      sort: 'publishedAt:desc',
    });
  },

  /**
   * Get case studies by industry
   */
  async getCaseStudiesByIndustry(industrySlug: string, limit: number = 6): Promise<CaseStudy[]> {
    return this.getCaseStudies({
      industry: industrySlug,
      pageSize: limit,
      sort: 'publishedAt:desc',
    });
  },
};

// Author Services
export const authorService = {
  /**
   * Get all authors
   */
  async getAuthors(): Promise<Author[]> {
    const response = await strapi.find<Author>('authors', {
      populate: ['avatar', 'social'],
      sort: 'name:asc',
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Get author by slug
   */
  async getAuthorBySlug(slug: string): Promise<Author | null> {
    const response = await strapi.find<Author>('authors', {
      filters: { slug: { eq: slug } },
      populate: ['avatar', 'social', 'posts', 'posts.featuredImage', 'posts.categories'],
      publicationState: 'live',
    });

    const authors = strapiUtils.getData(response);
    return authors && authors.length > 0 ? authors[0] : null;
  },
};

// Category Services
export const categoryService = {
  /**
   * Get all blog categories
   */
  async getBlogCategories(): Promise<BlogCategory[]> {
    const response = await strapi.find<BlogCategory>('blog-categories', {
      sort: 'name:asc',
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Get blog category by slug
   */
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    const response = await strapi.find<BlogCategory>('blog-categories', {
      filters: { slug: { eq: slug } },
      populate: ['posts', 'posts.featuredImage', 'posts.author', 'seo'],
      publicationState: 'live',
    });

    const categories = strapiUtils.getData(response);
    return categories && categories.length > 0 ? categories[0] : null;
  },

  /**
   * Get all industries
   */
  async getIndustries(): Promise<Industry[]> {
    const response = await strapi.find<Industry>('industries', {
      sort: 'name:asc',
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },
};

// Tag Services
export const tagService = {
  /**
   * Get all tags
   */
  async getTags(): Promise<Tag[]> {
    const response = await strapi.find<Tag>('tags', {
      sort: 'name:asc',
      publicationState: 'live',
    });

    return strapiUtils.getData(response) || [];
  },

  /**
   * Get popular tags (tags with most posts)
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    // This would require a custom endpoint in Strapi to count posts per tag
    // For now, return all tags
    return this.getTags();
  },
};

// Page Services
export const pageService = {
  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string): Promise<Page | null> {
    const response = await strapi.find<Page>('pages', {
      filters: { slug: { eq: slug } },
      populate: {
        content: {
          populate: {
            backgroundImage: true,
            image: true,
            images: true,
            buttons: true,
            features: {
              populate: ['image']
            },
            testimonials: {
              populate: ['avatar']
            },
            videoFile: true,
            poster: true,
          }
        },
        seo: {
          populate: ['metaImage', 'metaSocial']
        }
      },
      publicationState: 'live',
    });

    const pages = strapiUtils.getData(response);
    return pages && pages.length > 0 ? pages[0] : null;
  },
};

// Settings Services
export const settingsService = {
  /**
   * Get global settings
   */
  async getGlobalSettings(): Promise<GlobalSettings | null> {
    const response = await strapi.findOne<GlobalSettings>('global-setting', 1, {
      populate: [
        'logo',
        'favicon',
        'defaultSeo',
        'defaultSeo.metaImage',
        'socialMedia',
        'analytics',
        'scripts',
      ],
    });

    return strapiUtils.getData(response);
  },
};

// Contact Services
export const contactService = {
  /**
   * Submit a contact form
   */
  async submitContactForm(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    phone?: string;
    company?: string;
    source?: string;
  }): Promise<ContactSubmission | null> {
    const response = await strapi.create<ContactSubmission>('contact-submissions', {
      ...data,
      status: 'new',
    });

    return strapiUtils.getData(response);
  },
};

// Search Services
export const searchService = {
  /**
   * Global search across content types
   */
  async globalSearch(query: string, limit: number = 20): Promise<{
    blogPosts: BlogPost[];
    caseStudies: CaseStudy[];
  }> {
    const [blogPosts, caseStudies] = await Promise.all([
      blogService.getPosts({ search: query, pageSize: Math.ceil(limit / 2) }),
      caseStudyService.getCaseStudies({ search: query, pageSize: Math.ceil(limit / 2) }),
    ]);

    return {
      blogPosts,
      caseStudies,
    };
  },
};

// Cache utilities for better performance
export const cacheService = {
  cache: new Map<string, { data: any; expiry: number }>(),

  /**
   * Get cached data or fetch fresh data
   */
  async getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 15
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiry: now + ttlMinutes * 60 * 1000,
    });

    return data;
  },

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  },
};

// Webhook handler for real-time updates
export const webhookService = {
  /**
   * Handle Strapi webhook to invalidate cache
   */
  handleWebhook(payload: any): void {
    const { event, model } = payload;

    // Clear relevant cache based on the event and model
    switch (model) {
      case 'blog-post':
        cacheService.clearCache('blog-posts');
        cacheService.clearCache('featured-posts');
        break;
      case 'case-study':
        cacheService.clearCache('case-studies');
        cacheService.clearCache('featured-case-studies');
        break;
      case 'global-setting':
        cacheService.clearCache('global-settings');
        break;
      default:
        // Clear all cache for safety
        cacheService.clearCache();
    }

    console.log(`Cache cleared for ${model} due to ${event} event`);
  },
};

// Export all services
export default {
  blog: blogService,
  caseStudy: caseStudyService,
  author: authorService,
  category: categoryService,
  tag: tagService,
  page: pageService,
  settings: settingsService,
  contact: contactService,
  search: searchService,
  cache: cacheService,
  webhook: webhookService,
}; 