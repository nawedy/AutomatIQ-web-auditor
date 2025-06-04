import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        websites: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Format the response
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        websiteCount: user.websites.length,
      },
    })
  } catch (error) {
    console.error("Error getting user profile:", error)
    return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 })
  }
}
