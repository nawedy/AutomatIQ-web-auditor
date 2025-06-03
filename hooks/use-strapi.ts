/**
 * React hooks for Strapi CMS integration
 * 
 * This file provides custom React hooks for fetching and managing
 * Strapi CMS data with loading states, error handling, and caching.
 */

import { useState, useEffect, useCallback } from 'react';
import strapiServices, { 
  blogService, 
  caseStudyService, 
  authorService,
  categoryService,
  tagService,
  settingsService,
  searchService,
  cacheService
} from '@/lib/strapi-services';
import type {
  BlogPost,
  CaseStudy,
  Author,
  BlogCategory,
  Industry,
  Tag,
  GlobalSettings,
} from '@/types/strapi';

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Generic hook for fetching data with loading and error states
 */
function useData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  cacheKey?: string,
  cacheTTL?: number
): UseDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result: T;
      
      if (cacheKey) {
        result = await cacheService.getCached(cacheKey, fetcher, cacheTTL);
      } else {
        result = await fetcher();
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, cacheKey, cacheTTL, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching blog posts
 */
export function useBlogPosts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
} = {}) {
  const cacheKey = `blog-posts-${JSON.stringify(params)}`;
  
  return useData(
    () => blogService.getPosts(params),
    [params],
    cacheKey,
    15
  );
}

/**
 * Hook for fetching a single blog post by slug
 */
export function useBlogPost(slug: string) {
  const cacheKey = `blog-post-${slug}`;
  
  return useData(
    () => blogService.getPostBySlug(slug),
    [slug],
    cacheKey,
    30
  );
}

/**
 * Hook for fetching featured blog posts
 */
export function useFeaturedBlogPosts(limit: number = 6) {
  const cacheKey = `featured-blog-posts-${limit}`;
  
  return useData(
    () => blogService.getFeaturedPosts(limit),
    [limit],
    cacheKey,
    15
  );
}

/**
 * Hook for fetching recent blog posts
 */
export function useRecentBlogPosts(limit: number = 10) {
  const cacheKey = `recent-blog-posts-${limit}`;
  
  return useData(
    () => blogService.getRecentPosts(limit),
    [limit],
    cacheKey,
    10
  );
}

/**
 * Hook for fetching case studies
 */
export function useCaseStudies(params: {
  page?: number;
  pageSize?: number;
  industry?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
} = {}) {
  const cacheKey = `case-studies-${JSON.stringify(params)}`;
  
  return useData(
    () => caseStudyService.getCaseStudies(params),
    [params],
    cacheKey,
    15
  );
}

/**
 * Hook for fetching a single case study by slug
 */
export function useCaseStudy(slug: string) {
  const cacheKey = `case-study-${slug}`;
  
  return useData(
    () => caseStudyService.getCaseStudyBySlug(slug),
    [slug],
    cacheKey,
    30
  );
}

/**
 * Hook for fetching featured case studies
 */
export function useFeaturedCaseStudies(limit: number = 3) {
  const cacheKey = `featured-case-studies-${limit}`;
  
  return useData(
    () => caseStudyService.getFeaturedCaseStudies(limit),
    [limit],
    cacheKey,
    15
  );
}

/**
 * Hook for fetching authors
 */
export function useAuthors() {
  return useData(
    () => authorService.getAuthors(),
    [],
    'authors',
    60
  );
}

/**
 * Hook for fetching a single author by slug
 */
export function useAuthor(slug: string) {
  const cacheKey = `author-${slug}`;
  
  return useData(
    () => authorService.getAuthorBySlug(slug),
    [slug],
    cacheKey,
    30
  );
}

/**
 * Hook for fetching blog categories
 */
export function useBlogCategories() {
  return useData(
    () => categoryService.getBlogCategories(),
    [],
    'blog-categories',
    60
  );
}

/**
 * Hook for fetching industries
 */
export function useIndustries() {
  return useData(
    () => categoryService.getIndustries(),
    [],
    'industries',
    60
  );
}

/**
 * Hook for fetching tags
 */
export function useTags() {
  return useData(
    () => tagService.getTags(),
    [],
    'tags',
    60
  );
}

/**
 * Hook for fetching global settings
 */
export function useGlobalSettings() {
  return useData(
    () => settingsService.getGlobalSettings(),
    [],
    'global-settings',
    120 // Cache for 2 hours since settings change infrequently
  );
}

/**
 * Hook for performing search
 */
export function useSearch(query: string, limit: number = 20) {
  const [data, setData] = useState<{
    blogPosts: BlogPost[];
    caseStudies: CaseStudy[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const results = await searchService.globalSearch(searchQuery, limit);
      setData(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (query) {
      search(query);
    } else {
      setData(null);
    }
  }, [query, search]);

  return {
    data,
    loading,
    error,
    search,
  };
}

/**
 * Hook for managing related posts
 */
export function useRelatedPosts(
  postId: number,
  categories: string[],
  tags: string[],
  limit: number = 4
) {
  const cacheKey = `related-posts-${postId}-${categories.join(',')}-${tags.join(',')}-${limit}`;
  
  return useData(
    () => blogService.getRelatedPosts(postId, categories, tags, limit),
    [postId, categories, tags, limit],
    cacheKey,
    30
  );
}

/**
 * Hook for incrementing blog post views
 */
export function useBlogPostViews() {
  const [loading, setLoading] = useState(false);

  const incrementViews = useCallback(async (postId: number) => {
    try {
      setLoading(true);
      await blogService.incrementViews(postId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    incrementViews,
    loading,
  };
}

/**
 * Hook for managing cache
 */
export function useCache() {
  const clearCache = useCallback((key?: string) => {
    cacheService.clearCache(key);
  }, []);

  const refreshData = useCallback(async () => {
    cacheService.clearCache();
    // Trigger a page refresh or re-fetch data
    window.location.reload();
  }, []);

  return {
    clearCache,
    refreshData,
  };
}

/**
 * Hook for handling content preview (for editors)
 */
export function useContentPreview() {
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';
    setPreviewMode(isPreview);
  }, []);

  const enablePreview = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('preview', 'true');
    window.history.replaceState({}, '', url.toString());
    setPreviewMode(true);
  }, []);

  const disablePreview = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    window.history.replaceState({}, '', url.toString());
    setPreviewMode(false);
  }, []);

  return {
    previewMode,
    enablePreview,
    disablePreview,
  };
}

// Export all hooks
export default {
  useBlogPosts,
  useBlogPost,
  useFeaturedBlogPosts,
  useRecentBlogPosts,
  useCaseStudies,
  useCaseStudy,
  useFeaturedCaseStudies,
  useAuthors,
  useAuthor,
  useBlogCategories,
  useIndustries,
  useTags,
  useGlobalSettings,
  useSearch,
  useRelatedPosts,
  useBlogPostViews,
  useCache,
  useContentPreview,
}; 