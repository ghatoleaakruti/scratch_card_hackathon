import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { rateLimit } from "@/lib/rate-limit"

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Rate limiting configuration
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max number of users per interval
  limit: 100, // 100 requests per interval
})

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function authMiddleware(req: NextRequest) {
  // Apply rate limiting
  try {
    const ip = req.ip || "anonymous"
    await limiter.check(ip)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    )
  }

  // Check for JWT token in Authorization header
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < now) {
      return NextResponse.json({ success: false, message: "Token expired", expired: true }, { status: 401 })
    }

    // Add user info to request
    return { authenticated: true, userId: decoded.userId, email: decoded.email }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 401 },
    )
  }
}
