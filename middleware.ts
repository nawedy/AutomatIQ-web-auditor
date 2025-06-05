import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimitMiddleware } from './lib/middleware/rate-limit';

export async function middleware(request: NextRequest) {
  // Create the response first so we can modify headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Apply rate limiting
    return rateLimitMiddleware(request, response);
  }
  
  // Handle placeholder image requests
  if (request.nextUrl.pathname.startsWith('/api/placeholder/')) {
    // Skip redirection if already requesting an SVG file
    if (request.nextUrl.pathname.endsWith('.svg')) {
      return NextResponse.next()
    }
    
    const pathParts = request.nextUrl.pathname.split('/')
    if (pathParts.length >= 4) {
      const width = pathParts[3]
      const height = pathParts[4] || ''
      
      // If we have both width and height, redirect to the static SVG
      if (width && height) {
        console.log(`Redirecting placeholder request to static SVG: ${width}x${height}`)
        const potentialSvgPath = `/api/placeholder/${width}/${height}.svg`
        
        // Check for common dimensions we know exist
        if ((width === '400' && height === '250') ||
            (width === '800' && height === '600') ||
            (width === '1200' && height === '630')) {
          return NextResponse.redirect(new URL(potentialSvgPath, request.url))
        }
        
        // For other dimensions, use the dynamic API route
        return NextResponse.next()
      }
    }
  }
  
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Protected routes
  const protectedPaths = ["/dashboard", "/websites", "/reports", "/analytics", "/settings", "/export"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // API routes that require authentication
  const protectedApiPaths = ["/api/websites", "/api/audits", "/api/notifications", "/api/schedules"]
  const isProtectedApiPath = protectedApiPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Check authentication for protected routes
  if (isProtectedPath || isProtectedApiPath) {
    if (!token) {
      if (isProtectedApiPath) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Simple token verification for demo
    try {
      const payload = JSON.parse(atob(token))
      if (!payload.userId) {
        throw new Error("Invalid token")
      }

      // Add user info to headers for API routes
      if (isProtectedApiPath) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", payload.userId)
        requestHeaders.set("x-user-email", payload.email)
        requestHeaders.set("x-user-role", payload.role)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch {
      if (isProtectedApiPath) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect to dashboard if accessing login page with valid token
  if (request.nextUrl.pathname === "/login" && token) {
    try {
      const payload = JSON.parse(atob(token))
      if (payload.userId) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      // Invalid token, continue to login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    "/api/placeholder/:path*"
  ],
}
