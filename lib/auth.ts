import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

// In a real app, this would be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return { authenticated: false, error: "Authentication token is missing" }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    if (!decoded || !decoded.userId) {
      return { authenticated: false, error: "Invalid authentication token" }
    }

    return { authenticated: true, userId: decoded.userId }
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    }
  }
}

export function createAuthResponse(error: string, status = 401) {
  return NextResponse.json({ success: false, message: error }, { status })
}
