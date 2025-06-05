// src/lib/rate-limit.ts
// Rate limiting middleware for API routes

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client if environment variables are available
let redis: Redis | undefined;
let ratelimit: Ratelimit | undefined;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create a rate limiter that allows 10 requests per 10 seconds
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  });
}

export interface RateLimitConfig {
  requestsPerWindow?: number;
  window?: string;
  identifierFn?: (req: NextRequest) => string;
}

/**
 * Rate limiting middleware for API routes
 * @param handler The API route handler
 * @param config Configuration for rate limiting
 * @returns A wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse,
  config?: RateLimitConfig
) {
  return async function rateLimit(req: NextRequest, ...args: any[]) {
    // Skip rate limiting if Redis is not configured
    if (!redis || !ratelimit) {
      console.warn('Rate limiting is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env variables.');
      return handler(req, ...args);
    }

    // Create a custom rate limiter if config is provided
    let limiter = ratelimit;
    if (config?.requestsPerWindow && config?.window) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requestsPerWindow, config.window),
        analytics: true,
      });
    }

    // Get identifier for the rate limit
    // Default: IP address
    const identifier = config?.identifierFn 
      ? config.identifierFn(req) 
      : req.ip || 'anonymous';

    // Check if the request is rate limited
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Set rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    });

    // Return 429 Too Many Requests if rate limited
    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        { 
          status: 429, 
          headers,
        }
      );
    }

    // Call the original handler
    const response = await handler(req, ...args);
    
    // Add rate limit headers to the response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
