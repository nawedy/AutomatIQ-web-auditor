// src/lib/enhanced-auth.ts
// Enhanced authentication middleware with rate limiting and security headers

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { withRateLimit, RateLimitConfig } from './rate-limit';
import { prisma } from './db';

export interface AuthConfig {
  rateLimit?: RateLimitConfig;
  requireVerified?: boolean;
}

/**
 * Enhanced authentication middleware with rate limiting and security headers
 * @param handler The API route handler
 * @param config Configuration for authentication and rate limiting
 * @returns A wrapped handler with authentication and rate limiting
 */
export function withEnhancedAuth(
  handler: (
    req: NextRequest,
    context: any,
    user: { id: string; email: string }
  ) => Promise<NextResponse> | NextResponse,
  config?: AuthConfig
) {
  // First apply rate limiting
  const rateLimitedHandler = withRateLimit(async (req: NextRequest, context: any) => {
    // Then check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        emailVerified: true,
      },
    });
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Check if email verification is required
    if (config?.requireVerified && !user.emailVerified) {
      return new NextResponse(
        JSON.stringify({ error: 'Email verification required' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Set current user ID for Prisma middleware
    // This enables row-level security
    prisma.$use(async (params, next) => {
      // Add userId to the query for specific models
      if (['Website', 'Audit', 'AuditResult', 'Page', 'PageAuditResult', 'AuditSummary', 'Notification'].includes(params.model || '')) {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          // Add userId to where clause
          params.args.where = { ...params.args.where, userId: user.id };
        } else if (params.action === 'findMany') {
          // Add userId to where clause if it doesn't exist
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          params.args.where.userId = user.id;
        }
      }
      return next(params);
    });
    
    // Add security headers to response
    const response = await handler(req, context, { id: user.id, email: user.email });
    
    // Add security headers
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  }, config?.rateLimit);
  
  return rateLimitedHandler;
}
