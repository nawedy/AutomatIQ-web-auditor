# 📦 Strapi Integration Dependencies

This document outlines the additional dependencies you might need for the Strapi CMS integration.

## Core Dependencies

The Strapi integration is built using only core libraries that are likely already in your project:

- **React** (already in Next.js)
- **TypeScript** (for type safety)
- **Next.js** (for API routes and SSR)

## Optional Dependencies

Depending on your specific use case, you might want to add these optional dependencies:

### 1. Enhanced Caching

```bash
npm install redis ioredis
# or
yarn add redis ioredis
```

For production-grade caching with Redis:

```typescript
// lib/redis-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const redisCache = {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  async set(key: string, value: any, ttlSeconds: number = 3600) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },
  
  async del(key: string) {
    await redis.del(key);
  }
};
```

### 2. Image Optimization

```bash
npm install sharp
# or  
yarn add sharp
```

For server-side image optimization:

```typescript
// lib/image-optimizer.ts
import sharp from 'sharp';

export async function optimizeImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
) {
  return sharp(buffer)
    .resize(options.width, options.height)
    .jpeg({ quality: options.quality || 80 })
    .toBuffer();
}
```

### 3. Rich Text Rendering

```bash
npm install @tailwindcss/typography
# or
yarn add @tailwindcss/typography
```

For better rich text content styling:

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

```tsx
// components/rich-text-renderer.tsx
function RichTextRenderer({ content }: { content: RichTextBlock[] }) {
  return (
    <div className="prose prose-invert max-w-none">
      {content.map((block, index) => (
        <RenderBlock key={index} block={block} />
      ))}
    </div>
  );
}
```

### 4. Form Validation

```bash
npm install zod react-hook-form @hookform/resolvers
# or
yarn add zod react-hook-form @hookform/resolvers
```

For contact form validation:

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  company: z.string().optional(),
  phone: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

### 5. SEO Enhancement

```bash
npm install next-seo
# or
yarn add next-seo
```

For enhanced SEO capabilities:

```tsx
// components/seo-head.tsx
import { NextSeo, ArticleJsonLd } from 'next-seo';

function BlogPostSEO({ post }: { post: BlogPost }) {
  const seo = post.seo;
  const author = post.author?.data;
  
  return (
    <>
      <NextSeo
        title={seo?.metaTitle || post.title}
        description={seo?.metaDescription || post.excerpt}
        canonical={seo?.canonicalURL}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: post.publishedAt,
            authors: author ? [author.name] : undefined,
            tags: post.tags?.data?.map(tag => tag.name),
          },
          images: seo?.metaImage?.data ? [
            {
              url: strapiUtils.getImageUrl(seo.metaImage.data),
              alt: seo.metaImage.data.alternativeText || post.title,
            }
          ] : undefined,
        }}
      />
      
      <ArticleJsonLd
        url={`https://your-domain.com/blog/${post.slug}`}
        title={post.title}
        images={[]}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        authorName={author?.name || 'AutomatIQ Team'}
        description={post.excerpt || ''}
      />
    </>
  );
}
```

### 6. Analytics Integration

```bash
npm install @vercel/analytics
# or
yarn add @vercel/analytics
```

For tracking blog post views:

```tsx
// hooks/use-analytics.ts
import { track } from '@vercel/analytics';

export function useAnalytics() {
  const trackPageView = (page: string, properties?: Record<string, any>) => {
    track('page_view', { page, ...properties });
  };
  
  const trackBlogView = (postSlug: string, postTitle: string) => {
    track('blog_post_view', { 
      post_slug: postSlug,
      post_title: postTitle 
    });
  };
  
  return { trackPageView, trackBlogView };
}
```

### 7. Search Enhancement

```bash
npm install fuse.js
# or
yarn add fuse.js
```

For enhanced client-side search:

```typescript
// lib/search.ts
import Fuse from 'fuse.js';

const searchOptions = {
  keys: ['title', 'excerpt', 'content'],
  threshold: 0.3,
  includeScore: true,
};

export function createSearchIndex<T>(data: T[]) {
  return new Fuse(data, searchOptions);
}

export function searchContent<T>(fuse: Fuse<T>, query: string) {
  return fuse.search(query).map(result => ({
    item: result.item,
    score: result.score,
  }));
}
```

## Development Dependencies

For enhanced development experience:

```bash
npm install --save-dev @types/node
# or
yarn add --dev @types/node
```

## Environment Variables

Add these to your `.env.local`:

```env
# Core Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token
STRAPI_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Optional Redis Cache
REDIS_URL=redis://localhost:6379

# Optional Analytics
VERCEL_ANALYTICS_ID=your-analytics-id

# Optional Search
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_API_KEY=your-algolia-api-key
```

## Installation Commands

To install all recommended dependencies at once:

```bash
# Core + Optional (minimal)
npm install @tailwindcss/typography

# Full featured setup
npm install @tailwindcss/typography zod react-hook-form @hookform/resolvers next-seo fuse.js

# Development
npm install --save-dev @types/node

# Production caching (if using Redis)
npm install redis ioredis

# Production image optimization
npm install sharp
```

## Strapi Backend Dependencies

For your Strapi backend, you might want:

```bash
# Enhanced SEO
npm install @strapi/plugin-seo

# Better media handling
npm install @strapi/provider-upload-cloudinary
# or
npm install @strapi/provider-upload-aws-s3

# GraphQL (optional)
npm install @strapi/plugin-graphql

# Email
npm install @strapi/provider-email-sendgrid
# or  
npm install @strapi/provider-email-nodemailer
```

## Notes

- **TypeScript**: All integrations are built with TypeScript support
- **Performance**: Caching is implemented at the application level, Redis is optional for production
- **SEO**: Basic SEO is handled without external libraries, `next-seo` adds advanced features
- **Images**: Basic image handling works with Strapi's built-in image processing
- **Search**: Basic search is implemented, external search services are optional enhancements

Choose dependencies based on your specific requirements and deployment environment. 