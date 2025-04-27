import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

// In a real app, this would be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// In a real app, you would use a database
const users: any[] = global.users || []

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password, // In a real app, you would hash this
      tokenBalance: 100, // Give new users some tokens to start
      cardsScratched: 0,
      totalWinnings: 0,
      walletAddress: null,
      mintedBadges: {
        bronze: false,
        silver: false,
        gold: false,
      },
    }

    users.push(newUser)
    global.users = users

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
    global.sessions[sessionId] = newUser.id

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
