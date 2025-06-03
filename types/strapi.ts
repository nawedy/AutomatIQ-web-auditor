/**
 * Strapi CMS Type Definitions for AutomatIQ.AI
 * 
 * This file contains TypeScript interfaces for all Strapi content types,
 * ensuring type safety when working with CMS data.
 */

// Base Strapi types
export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string;
  url: string;
}

export interface StrapiComponent {
  id: number;
  __component: string;
}

export interface StrapiBaseAttributes {
  id: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
  localizations?: {
    data: any[];
  };
}

// Rich Text Block types (for Strapi's rich text editor)
export interface RichTextBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'code' | 'image' | 'list';
  level?: number; // for headings
  format?: 'ordered' | 'unordered'; // for lists
  children?: RichTextChild[];
}

export interface RichTextChild {
  type: 'text' | 'link';
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: RichTextChild[];
}

// SEO Component
export interface SeoComponent extends StrapiComponent {
  __component: 'shared.seo';
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: {
    data?: StrapiMedia;
  };
  metaSocial?: SocialMetaComponent[];
  keywords?: string;
  metaRobots?: string;
  structuredData?: any;
  metaViewport?: string;
  canonicalURL?: string;
}

export interface SocialMetaComponent extends StrapiComponent {
  __component: 'shared.meta-social';
  socialNetwork: 'Facebook' | 'Twitter';
  title?: string;
  description?: string;
  image?: {
    data?: StrapiMedia;
  };
}

// Blog Post Content Type
export interface BlogPost extends StrapiBaseAttributes {
  title: string;
  slug: string;
  excerpt?: string;
  content?: RichTextBlock[];
  featuredImage?: {
    data?: StrapiMedia;
  };
  author?: {
    data?: Author;
  };
  categories?: {
    data?: BlogCategory[];
  };
  tags?: {
    data?: Tag[];
  };
  readTime?: number;
  views?: number;
  featured?: boolean;
  seo?: SeoComponent;
  relatedPosts?: {
    data?: BlogPost[];
  };
}

// Case Study Content Type
export interface CaseStudy extends StrapiBaseAttributes {
  title: string;
  slug: string;
  company: string;
  industry?: {
    data?: Industry;
  };
  challenge?: string;
  solution?: RichTextBlock[];
  results?: ResultMetric[];
  featuredImage?: {
    data?: StrapiMedia;
  };
  gallery?: {
    data?: StrapiMedia[];
  };
  testimonial?: TestimonialComponent;
  readTime?: number;
  featured?: boolean;
  seo?: SeoComponent;
}

export interface ResultMetric extends StrapiComponent {
  __component: 'case-study.result-metric';
  metric: string;
  improvement: string;
  period: string;
  icon?: string;
}

export interface TestimonialComponent extends StrapiComponent {
  __component: 'shared.testimonial';
  quote: string;
  author: string;
  position?: string;
  company?: string;
  avatar?: {
    data?: StrapiMedia;
  };
  rating?: number;
}

// Author Content Type
export interface Author extends StrapiBaseAttributes {
  name: string;
  slug: string;
  bio?: string;
  avatar?: {
    data?: StrapiMedia;
  };
  email?: string;
  social?: SocialLinkComponent[];
  posts?: {
    data?: BlogPost[];
  };
}

export interface SocialLinkComponent extends StrapiComponent {
  __component: 'shared.social-link';
  platform: 'Twitter' | 'LinkedIn' | 'GitHub' | 'Website' | 'Facebook' | 'Instagram';
  url: string;
  username?: string;
}

// Category Content Types
export interface BlogCategory extends StrapiBaseAttributes {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  posts?: {
    data?: BlogPost[];
  };
  seo?: SeoComponent;
}

export interface Industry extends StrapiBaseAttributes {
  name: string;
  slug: string;
  description?: string;
  caseStudies?: {
    data?: CaseStudy[];
  };
}

// Tag Content Type
export interface Tag extends StrapiBaseAttributes {
  name: string;
  slug: string;
  posts?: {
    data?: BlogPost[];
  };
}

// Page Content Type (for dynamic pages)
export interface Page extends StrapiBaseAttributes {
  title: string;
  slug: string;
  content?: DynamicZone[];
  seo?: SeoComponent;
  template?: 'default' | 'landing' | 'contact' | 'about';
}

// Dynamic Zone Components
export type DynamicZone = 
  | HeroComponent
  | ContentBlockComponent
  | FeatureGridComponent
  | TestimonialGridComponent
  | CtaComponent
  | ImageGalleryComponent
  | VideoComponent;

export interface HeroComponent extends StrapiComponent {
  __component: 'layout.hero';
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: {
    data?: StrapiMedia;
  };
  buttons?: ButtonComponent[];
}

export interface ContentBlockComponent extends StrapiComponent {
  __component: 'layout.content-block';
  title?: string;
  content: RichTextBlock[];
  image?: {
    data?: StrapiMedia;
  };
  layout: 'text-only' | 'text-left' | 'text-right' | 'centered';
}

export interface FeatureGridComponent extends StrapiComponent {
  __component: 'layout.feature-grid';
  title?: string;
  subtitle?: string;
  features: FeatureComponent[];
}

export interface FeatureComponent extends StrapiComponent {
  __component: 'shared.feature';
  title: string;
  description: string;
  icon?: string;
  image?: {
    data?: StrapiMedia;
  };
  link?: string;
}

export interface TestimonialGridComponent extends StrapiComponent {
  __component: 'layout.testimonial-grid';
  title?: string;
  subtitle?: string;
  testimonials: TestimonialComponent[];
}

export interface CtaComponent extends StrapiComponent {
  __component: 'layout.cta';
  title: string;
  description?: string;
  buttons: ButtonComponent[];
  backgroundImage?: {
    data?: StrapiMedia;
  };
}

export interface ButtonComponent extends StrapiComponent {
  __component: 'shared.button';
  text: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
}

export interface ImageGalleryComponent extends StrapiComponent {
  __component: 'layout.image-gallery';
  title?: string;
  images: {
    data?: StrapiMedia[];
  };
  layout: 'grid' | 'masonry' | 'carousel';
}

export interface VideoComponent extends StrapiComponent {
  __component: 'layout.video';
  title?: string;
  description?: string;
  videoFile?: {
    data?: StrapiMedia;
  };
  videoUrl?: string;
  poster?: {
    data?: StrapiMedia;
  };
  autoplay?: boolean;
  controls?: boolean;
}

// Global/Settings Content Types
export interface GlobalSettings extends StrapiBaseAttributes {
  siteName: string;
  siteDescription: string;
  logo?: {
    data?: StrapiMedia;
  };
  favicon?: {
    data?: StrapiMedia;
  };
  defaultSeo?: SeoComponent;
  socialMedia?: SocialLinkComponent[];
  analytics?: AnalyticsComponent;
  scripts?: ScriptComponent[];
}

export interface AnalyticsComponent extends StrapiComponent {
  __component: 'settings.analytics';
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  customScripts?: string;
}

export interface ScriptComponent extends StrapiComponent {
  __component: 'settings.script';
  name: string;
  content: string;
  location: 'head' | 'body-start' | 'body-end';
  async?: boolean;
  defer?: boolean;
}

// Newsletter Content Type
export interface Newsletter extends StrapiBaseAttributes {
  subject: string;
  preheader?: string;
  content: RichTextBlock[];
  sentAt?: string;
  recipients?: number;
  openRate?: number;
  clickRate?: number;
}

// Contact Form Submission
export interface ContactSubmission extends StrapiBaseAttributes {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  source?: string;
  status: 'new' | 'in-progress' | 'resolved' | 'spam';
  response?: string;
  respondedAt?: string;
}

// API Response Types
export interface StrapiBlogPostsResponse {
  data: BlogPost[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiBlogPostResponse {
  data: BlogPost;
  meta: {};
}

export interface StrapiCaseStudiesResponse {
  data: CaseStudy[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiCaseStudyResponse {
  data: CaseStudy;
  meta: {};
}

// Webhook payload types
export interface StrapiWebhookPayload {
  event: 'entry.create' | 'entry.update' | 'entry.delete' | 'entry.publish' | 'entry.unpublish';
  createdAt: string;
  model: string;
  entry: any;
}

// Query parameter types for API calls
export interface StrapiQueryParams {
  filters?: Record<string, any>;
  sort?: string | string[];
  populate?: string | string[] | Record<string, any>;
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
} 