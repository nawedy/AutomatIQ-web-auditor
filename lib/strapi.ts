/**
 * Strapi CMS Integration for AutomatIQ.AI
 * 
 * This module provides utilities for connecting to and interacting with Strapi CMS.
 * It includes functions for fetching content, managing authentication, and handling
 * content types like blogs, case studies, and other dynamic content.
 */

interface StrapiConfig {
  url: string;
  token?: string;
  timeout?: number;
}

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

class StrapiClient {
  private config: StrapiConfig;
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(config: StrapiConfig) {
    this.config = config;
    this.baseUrl = `${config.url}/api`;
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (config.token) {
      this.headers['Authorization'] = `Bearer ${config.token}`;
    }
  }

  /**
   * Generic fetch method for Strapi API calls
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StrapiResponse<T> | StrapiError> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: { ...this.headers, ...options.headers },
        timeout: this.config.timeout || 10000,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            status: response.status,
            name: data.error?.name || 'StrapiError',
            message: data.error?.message || 'An error occurred',
            details: data.error?.details,
          },
        };
      }

      return data;
    } catch (error) {
      return {
        data: null,
        error: {
          status: 500,
          name: 'NetworkError',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  /**
   * Get multiple entries from a collection
   */
  async find<T>(
    collection: string,
    params: {
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
    } = {}
  ): Promise<StrapiResponse<T[]> | StrapiError> {
    const searchParams = new URLSearchParams();

    // Handle filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([operator, operatorValue]) => {
            searchParams.append(`filters[${key}][$${operator}]`, String(operatorValue));
          });
        } else {
          searchParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    // Handle sorting
    if (params.sort) {
      const sortArray = Array.isArray(params.sort) ? params.sort : [params.sort];
      sortArray.forEach((sortField) => {
        searchParams.append('sort', sortField);
      });
    }

    // Handle population
    if (params.populate) {
      if (typeof params.populate === 'string') {
        searchParams.append('populate', params.populate);
      } else if (Array.isArray(params.populate)) {
        params.populate.forEach((field) => {
          searchParams.append('populate', field);
        });
      } else {
        // Handle complex populate object
        Object.entries(params.populate).forEach(([key, value]) => {
          searchParams.append(`populate[${key}]`, JSON.stringify(value));
        });
      }
    }

    // Handle pagination
    if (params.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(`pagination[${key}]`, String(value));
        }
      });
    }

    // Handle fields
    if (params.fields) {
      params.fields.forEach((field) => {
        searchParams.append('fields', field);
      });
    }

    // Handle locale
    if (params.locale) {
      searchParams.append('locale', params.locale);
    }

    // Handle publication state
    if (params.publicationState) {
      searchParams.append('publicationState', params.publicationState);
    }

    const queryString = searchParams.toString();
    const endpoint = `/${collection}${queryString ? `?${queryString}` : ''}`;

    return this.fetch<T[]>(endpoint);
  }

  /**
   * Get a single entry by ID
   */
  async findOne<T>(
    collection: string,
    id: string | number,
    params: {
      populate?: string | string[] | Record<string, any>;
      fields?: string[];
      locale?: string;
    } = {}
  ): Promise<StrapiResponse<T> | StrapiError> {
    const searchParams = new URLSearchParams();

    if (params.populate) {
      if (typeof params.populate === 'string') {
        searchParams.append('populate', params.populate);
      } else if (Array.isArray(params.populate)) {
        params.populate.forEach((field) => {
          searchParams.append('populate', field);
        });
      }
    }

    if (params.fields) {
      params.fields.forEach((field) => {
        searchParams.append('fields', field);
      });
    }

    if (params.locale) {
      searchParams.append('locale', params.locale);
    }

    const queryString = searchParams.toString();
    const endpoint = `/${collection}/${id}${queryString ? `?${queryString}` : ''}`;

    return this.fetch<T>(endpoint);
  }

  /**
   * Create a new entry
   */
  async create<T>(
    collection: string,
    data: Record<string, any>
  ): Promise<StrapiResponse<T> | StrapiError> {
    return this.fetch<T>(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Update an existing entry
   */
  async update<T>(
    collection: string,
    id: string | number,
    data: Record<string, any>
  ): Promise<StrapiResponse<T> | StrapiError> {
    return this.fetch<T>(`/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Delete an entry
   */
  async delete<T>(
    collection: string,
    id: string | number
  ): Promise<StrapiResponse<T> | StrapiError> {
    return this.fetch<T>(`/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Upload media files
   */
  async upload(
    files: File | File[],
    options: {
      ref?: string;
      refId?: string | number;
      field?: string;
    } = {}
  ): Promise<StrapiResponse<any> | StrapiError> {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    if (options.ref) formData.append('ref', options.ref);
    if (options.refId) formData.append('refId', String(options.refId));
    if (options.field) formData.append('field', options.field);

    const headers = { ...this.headers };
    delete headers['Content-Type']; // Let browser set it for FormData

    return this.fetch<any>('/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Create and configure Strapi client
const strapiConfig: StrapiConfig = {
  url: process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  token: process.env.STRAPI_API_TOKEN,
  timeout: 10000,
};

export const strapi = new StrapiClient(strapiConfig);

// Utility functions for common operations
export const strapiUtils = {
  /**
   * Helper to check if a response is an error
   */
  isError(response: StrapiResponse<any> | StrapiError): response is StrapiError {
    return 'error' in response && response.error !== null;
  },

  /**
   * Extract data from Strapi response, handling errors
   */
  getData<T>(response: StrapiResponse<T> | StrapiError): T | null {
    if (this.isError(response)) {
      console.error('Strapi Error:', response.error);
      return null;
    }
    return response.data;
  },

  /**
   * Build image URL from Strapi media
   */
  getImageUrl(media: any, size?: 'thumbnail' | 'small' | 'medium' | 'large'): string {
    if (!media) return '';
    
    const baseUrl = strapiConfig.url;
    
    if (size && media.formats && media.formats[size]) {
      return `${baseUrl}${media.formats[size].url}`;
    }
    
    return `${baseUrl}${media.url}`;
  },

  /**
   * Format date from Strapi
   */
  formatDate(dateString: string, locale = 'en-US'): string {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Extract plain text from rich text content
   */
  getPlainText(richText: any): string {
    if (typeof richText === 'string') return richText;
    if (Array.isArray(richText)) {
      return richText
        .map((block) => {
          if (block.type === 'paragraph') {
            return block.children?.map((child: any) => child.text).join('') || '';
          }
          return '';
        })
        .join(' ');
    }
    return '';
  },
};

export default strapi; 