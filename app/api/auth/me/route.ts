import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get session ID
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId || !global.sessions || !global.sessions[sessionId]) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Get user ID from session
    const userId = global.sessions[sessionId]

    // Find user
    const users = global.users || []
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
