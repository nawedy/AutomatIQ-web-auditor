# 🚀 Strapi CMS Integration Guide

This guide covers the complete Strapi CMS integration for AutomatIQ.AI, including setup, configuration, and usage.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Environment Configuration](#environment-configuration)
4. [Content Types](#content-types)
5. [API Usage](#api-usage)
6. [React Hooks](#react-hooks)
7. [Webhook Integration](#webhook-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## 🔍 Overview

The Strapi integration provides a complete content management solution with:

- **Type-safe API interactions** using TypeScript
- **React hooks** for easy data fetching
- **Automatic caching** with cache invalidation
- **Real-time updates** via webhooks
- **SEO optimization** with structured metadata
- **Image optimization** with multiple formats
- **Rich text content** support

## 🛠 Installation & Setup

### 1. Install Strapi (Backend)

```bash
# Create a new Strapi project
npx create-strapi-app@latest my-strapi-backend --quickstart

# Or use an existing Strapi installation
cd path/to/your/strapi/project
npm install
```

### 2. Configure Strapi

#### Enable Required Plugins

```javascript
// config/plugins.js
module.exports = {
  upload: {
    config: {
      provider: 'local', // or 'aws-s3', 'cloudinary', etc.
      providerOptions: {},
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  seo: {
    enabled: true,
  },
};
```

#### API Permissions

1. Go to **Settings > Roles > Public**
2. Enable `find` and `findOne` for:
   - Blog Posts
   - Case Studies
   - Authors
   - Categories
   - Tags
   - Industries
   - Global Settings

3. For authenticated requests, create an API token:
   - **Settings > API Tokens > Create new API Token**
   - Set appropriate permissions

### 3. Create Content Types

Use the Strapi admin panel to create the following content types:

#### Blog Post (`blog-post`)
- **title** (Text, required)
- **slug** (UID, required)
- **excerpt** (Text)
- **content** (Rich Text)
- **featuredImage** (Media)
- **author** (Relation to Author)
- **categories** (Relation to Blog Categories)
- **tags** (Relation to Tags)
- **readTime** (Number)
- **views** (Number)
- **featured** (Boolean)
- **seo** (Component - SEO)

#### Case Study (`case-study`)
- **title** (Text, required)
- **slug** (UID, required)
- **company** (Text, required)
- **industry** (Relation to Industry)
- **challenge** (Text)
- **solution** (Rich Text)
- **results** (Component - Result Metrics, repeatable)
- **featuredImage** (Media)
- **gallery** (Media, multiple)
- **testimonial** (Component - Testimonial)
- **readTime** (Number)
- **featured** (Boolean)
- **seo** (Component - SEO)

## ⚙️ Environment Configuration

Create a `.env.local` file in your Next.js project:

```env
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token-here
STRAPI_WEBHOOK_SECRET=your-webhook-secret

# Public URL for client-side requests
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## 📝 Content Types

### Core Content Types

1. **Blog Posts** - Main blog content with SEO and categorization
2. **Case Studies** - Client success stories with metrics
3. **Authors** - Content creators with social profiles
4. **Categories** - Blog post categorization
5. **Industries** - Case study industry classification
6. **Tags** - Content tagging system
7. **Pages** - Dynamic pages with flexible content
8. **Global Settings** - Site-wide configuration

### Components

1. **SEO Component** - Meta tags, social sharing
2. **Result Metrics** - Case study performance data
3. **Testimonials** - Client feedback with ratings
4. **Social Links** - Author social media profiles
5. **Buttons** - Call-to-action elements
6. **Features** - Service/product features

## 🔗 API Usage

### Basic Usage

```typescript
import { strapi, strapiUtils } from '@/lib/strapi';
import type { BlogPost } from '@/types/strapi';

// Get all blog posts
const response = await strapi.find<BlogPost>('blog-posts', {
  populate: ['featuredImage', 'author', 'categories'],
  sort: 'publishedAt:desc',
  pagination: { page: 1, pageSize: 10 }
});

const posts = strapiUtils.getData(response);
```

### Service Functions

```typescript
import { blogService } from '@/lib/strapi-services';

// Get featured posts
const featuredPosts = await blogService.getFeaturedPosts(6);

// Get post by slug
const post = await blogService.getPostBySlug('seo-best-practices');

// Search posts
const searchResults = await blogService.getPosts({
  search: 'SEO optimization',
  category: 'seo'
});
```

## ⚛️ React Hooks

### Blog Hooks

```typescript
import { useFeaturedBlogPosts, useBlogPost } from '@/hooks/use-strapi';

function BlogCarousel() {
  const { data: posts, loading, error } = useFeaturedBlogPosts(6);
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  
  return (
    <div>
      {posts?.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function BlogPost({ slug }: { slug: string }) {
  const { data: post, loading } = useBlogPost(slug);
  
  if (loading) return <Skeleton />;
  if (!post) return <NotFound />;
  
  return <ArticleContent post={post} />;
}
```

### Case Study Hooks

```typescript
import { useFeaturedCaseStudies, useCaseStudy } from '@/hooks/use-strapi';

function CaseStudyGrid() {
  const { data: caseStudies, loading } = useFeaturedCaseStudies(3);
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {caseStudies?.map(study => (
        <CaseStudyCard key={study.id} study={study} />
      ))}
    </div>
  );
}
```

### Search Hook

```typescript
import { useSearch } from '@/hooks/use-strapi';

function SearchResults() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useSearch(query);
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search content..." 
      />
      
      {loading && <Spinner />}
      
      {data && (
        <div>
          <h3>Blog Posts ({data.blogPosts.length})</h3>
          {data.blogPosts.map(post => <SearchResult key={post.id} item={post} />)}
          
          <h3>Case Studies ({data.caseStudies.length})</h3>
          {data.caseStudies.map(study => <SearchResult key={study.id} item={study} />)}
        </div>
      )}
    </div>
  );
}
```

## 🔗 Webhook Integration

### Setup Webhook in Strapi

1. Go to **Settings > Webhooks**
2. Create a new webhook:
   - **Name**: Next.js Cache Invalidation
   - **URL**: `https://your-domain.com/api/strapi/webhook`
   - **Events**: Select relevant events (create, update, delete, publish, unpublish)
   - **Headers**: Add `x-strapi-signature: your-webhook-secret`

### Webhook Handler

The webhook handler is automatically set up at `/api/strapi/webhook` and handles:

- **Cache invalidation** when content changes
- **Real-time updates** for published content
- **Error logging** and debugging
- **Security verification** with webhook secrets

### Cache Management

```typescript
import { cacheService } from '@/lib/strapi-services';

// Clear specific cache
cacheService.clearCache('blog-posts');

// Clear all cache
cacheService.clearCache();

// Get cached data with TTL
const data = await cacheService.getCached(
  'featured-posts',
  () => blogService.getFeaturedPosts(),
  15 // 15 minutes TTL
);
```

## 📸 Image Handling

### Image URLs

```typescript
import { strapiUtils } from '@/lib/strapi';

// Get optimized image URL
const imageUrl = strapiUtils.getImageUrl(post.featuredImage?.data, 'medium');

// Available sizes: thumbnail, small, medium, large
const thumbnailUrl = strapiUtils.getImageUrl(media, 'thumbnail');
```

### Responsive Images

```tsx
function ResponsiveImage({ media, alt }: { media: StrapiMedia, alt: string }) {
  if (!media) return null;
  
  return (
    <picture>
      <source 
        media="(max-width: 768px)" 
        srcSet={strapiUtils.getImageUrl(media, 'small')} 
      />
      <source 
        media="(max-width: 1200px)" 
        srcSet={strapiUtils.getImageUrl(media, 'medium')} 
      />
      <img 
        src={strapiUtils.getImageUrl(media, 'large')} 
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}
```

## 🎯 Best Practices

### 1. Type Safety

Always use TypeScript interfaces for type safety:

```typescript
import type { BlogPost, CaseStudy } from '@/types/strapi';

function processBlogPost(post: BlogPost) {
  // TypeScript will enforce type checking
  return {
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt
  };
}
```

### 2. Error Handling

Implement proper error handling:

```typescript
const { data, error, loading, refresh } = useBlogPosts();

if (error) {
  return (
    <ErrorBoundary>
      <ErrorMessage 
        message="Failed to load blog posts" 
        onRetry={refresh}
      />
    </ErrorBoundary>
  );
}
```

### 3. Loading States

Provide good loading experiences:

```typescript
function BlogList() {
  const { data: posts, loading } = useBlogPosts();
  
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {posts?.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 4. SEO Optimization

Use Strapi SEO data for meta tags:

```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = await blogService.getPostBySlug(params.slug);
  
  if (!post) return {};
  
  const seo = post.seo;
  
  return {
    title: seo?.metaTitle || post.title,
    description: seo?.metaDescription || post.excerpt,
    openGraph: {
      title: seo?.metaTitle || post.title,
      description: seo?.metaDescription || post.excerpt,
      images: seo?.metaImage?.data ? 
        [strapiUtils.getImageUrl(seo.metaImage.data)] : 
        undefined,
    },
  };
}
```

### 5. Performance Optimization

Use caching effectively:

```typescript
// Cache frequently accessed data
const globalSettings = await cacheService.getCached(
  'global-settings',
  () => settingsService.getGlobalSettings(),
  120 // 2 hours cache
);

// Cache search results briefly
const searchResults = await cacheService.getCached(
  `search-${query}`,
  () => searchService.globalSearch(query),
  5 // 5 minutes cache
);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Issues
```javascript
// strapi/config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: ['http://localhost:3000', 'https://your-domain.com']
    }
  },
  // ... other middlewares
];
```

#### 2. API Token Issues
- Ensure API token has correct permissions
- Check token is not expired
- Verify token is set in environment variables

#### 3. Webhook Issues
- Verify webhook URL is accessible
- Check webhook secret matches
- Ensure proper HTTP headers are sent

#### 4. Image Loading Issues
- Verify media upload permissions
- Check image formats are supported
- Ensure responsive formats are generated

### Debug Mode

Enable debug logging:

```typescript
// Add to strapi client configuration
const strapiConfig = {
  url: process.env.STRAPI_URL,
  token: process.env.STRAPI_API_TOKEN,
  debug: process.env.NODE_ENV === 'development'
};
```

### Health Check

Create a health check endpoint:

```typescript
// app/api/health/strapi/route.ts
import { strapi } from '@/lib/strapi';

export async function GET() {
  try {
    const response = await strapi.find('blog-posts', {
      pagination: { page: 1, pageSize: 1 }
    });
    
    return Response.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
```

## 📚 Additional Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contributing

When contributing to the Strapi integration:

1. **Update types** when adding new content types
2. **Add service functions** for new API endpoints
3. **Create hooks** for common data fetching patterns
4. **Update documentation** for new features
5. **Add tests** for critical functionality

---

**Need help?** Check the troubleshooting section or create an issue in the project repository. 