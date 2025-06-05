// src/lib/middleware/rate-limit.ts
// Rate limiting middleware to protect API routes from abuse

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Redis } from '@upstash/redis';

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

interface RateLimitConfig {
  limit: number;      // Maximum number of requests
  window: number;     // Time window in seconds
  keyPrefix: string;  // Prefix for Redis keys
}

// Default rate limit configurations
const defaultRateLimit: RateLimitConfig = {
  limit: 100,         // 100 requests
  window: 60 * 15,    // per 15 minutes
  keyPrefix: 'ratelimit',
};

// More restrictive rate limit for authentication routes
const authRateLimit: RateLimitConfig = {
  limit: 10,          // 10 requests
  window: 60 * 5,     // per 5 minutes
  keyPrefix: 'ratelimit:auth',
};

// Rate limit for audit creation
const auditRateLimit: RateLimitConfig = {
  limit: 5,           // 5 requests
  window: 60 * 10,    // per 10 minutes
  keyPrefix: 'ratelimit:audit',
};

/**
 * Get rate limit configuration based on the request path
 */
function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.includes('/api/auth')) {
    return authRateLimit;
  } else if (path.includes('/api/audits') && !path.includes('GET')) {
    return auditRateLimit;
  }
  return defaultRateLimit;
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse | Response> {
  try {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return response;
    }
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // Get user ID from session if authenticated
    const token = await getToken({ req: request as any });
    const userId = token?.sub || 'anonymous';
    
    // Get appropriate rate limit config
    const config = getRateLimitConfig(request.nextUrl.pathname);
    
    // Create unique keys for IP and user
    const ipKey = `${config.keyPrefix}:ip:${ip}`;
    const userKey = `${config.keyPrefix}:user:${userId}`;
    
    // Check rate limits for both IP and user ID
    const [ipRequests, userRequests] = await Promise.all([
      redis.incr(ipKey),
      redis.incr(userKey),
    ]);
    
    // Set expiry for keys if they're new
    if (ipRequests === 1) {
      await redis.expire(ipKey, config.window);
    }
    
    if (userRequests === 1) {
      await redis.expire(userKey, config.window);
    }
    
    // Get remaining requests (use the more restrictive of the two)
    const remaining = Math.min(
      Math.max(0, config.limit - ipRequests),
      Math.max(0, config.limit - userRequests)
    );
    
    // Set rate limit headers
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    
    // If either limit is exceeded, return 429 Too Many Requests
    if (ipRequests > config.limit || userRequests > config.limit) {
      // Get TTL for the keys
      const [ipTtl, userTtl] = await Promise.all([
        redis.ttl(ipKey),
        redis.ttl(userKey),
      ]);
      
      // Use the longer TTL
      const retryAfter = Math.max(ipTtl, userTtl);
      
      response.headers.set('Retry-After', retryAfter.toString());
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }
    
    return response;
  } catch (error) {
    console.error('Error in rate limiting middleware:', error);
    
    // If rate limiting fails, allow the request to proceed
    // but log the error for monitoring
    return response;
  }
}
