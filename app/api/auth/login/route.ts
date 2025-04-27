import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

// In a real app, this would be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// In a real app, you would use a database
// This is just for demo purposes
const users = global.users || []

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Set session cookie
    const sessionId = uuidv4()
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Store session (in a real app, this would be in a database)
    global.sessions = global.sessions || {}
    global.sessions[sessionId] = user.id

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
