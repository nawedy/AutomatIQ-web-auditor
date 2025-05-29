import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
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
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
