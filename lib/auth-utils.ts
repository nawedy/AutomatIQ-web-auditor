// src/lib/auth-utils.ts
// Utilities for handling authentication and database security

import { prisma, setCurrentUserId } from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-config";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to authenticate requests and set the current user ID for RLS
 * @param handler The API route handler function
 * @returns A wrapped handler function with authentication
 */
export function withAuth<T>(
  handler: (
    req: NextRequest,
    context: T,
    user: { id: string; email: string }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    try {
      // Get the authenticated user from the session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user ID from email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Set the current user ID for Row-Level Security
      await setCurrentUserId(user.id);

      // Call the handler with the authenticated user
      return handler(req, context, user);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Get the authenticated user from the request
 * @param req The Next.js request object
 * @returns The authenticated user or null
 */
export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, image: true },
    });

    if (!user) {
      return null;
    }

    // Set the current user ID for Row-Level Security
    await setCurrentUserId(user.id);

    return user;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Get the user ID from the request headers (for API routes that use x-user-id header)
 * @param req The Next.js request object
 * @returns The user ID or null
 */
export async function getUserIdFromHeader(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return null;
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    // Set the current user ID for Row-Level Security
    await setCurrentUserId(userId);

    return userId;
  } catch (error) {
    console.error("Error getting user ID from header:", error);
    return null;
  }
}
