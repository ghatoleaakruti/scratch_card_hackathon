import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Get session ID
    const sessionId = cookies().get("session_id")?.value

    // Delete session
    if (sessionId && global.sessions && global.sessions[sessionId]) {
      delete global.sessions[sessionId]
    }

    // Clear cookie
    cookies().delete("session_id")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
