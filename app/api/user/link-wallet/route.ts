import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"

export async function POST(req: NextRequest) {
  // Authenticate user with middleware
  const auth = await authMiddleware(req)

  // If auth is a NextResponse, it means authentication failed
  if (auth instanceof NextResponse) {
    return auth
  }

  try {
    // Get wallet address from request
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json({ message: "Wallet address is required" }, { status: 400 })
    }

    // Find and update user
    const users = global.users || []
    const userIndex = users.findIndex((u: any) => u.id === auth.userId)

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user's wallet address
    users[userIndex].walletAddress = walletAddress

    return NextResponse.json({
      success: true,
      user: {
        ...users[userIndex],
        password: undefined, // Don't send password back
      },
    })
  } catch (error) {
    console.error("Link wallet error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
