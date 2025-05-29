import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
