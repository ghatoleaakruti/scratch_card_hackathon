import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { getUserById } from "@/lib/db"

export async function POST(req: NextRequest) {
  // Authenticate user with middleware
  const auth = await authMiddleware(req)

  // If auth is a NextResponse, it means authentication failed
  if (auth instanceof NextResponse) {
    return auth
  }

  try {
    // Get card ID from request
    const { cardId } = await req.json()

    if (!cardId) {
      return NextResponse.json({ message: "Card ID is required" }, { status: 400 })
    }

    // Define prize ranges for each card type
    const prizeRanges = {
      basic: { min: 0, max: 30 },
      silver: { min: 5, max: 75 },
      gold: { min: 10, max: 150 },
      platinum: { min: 20, max: 300 },
    }

    const range = prizeRanges[cardId as keyof typeof prizeRanges]

    if (!range) {
      return NextResponse.json({ message: "Invalid card ID" }, { status: 400 })
    }

    // Generate random prize
    // 40% chance of winning, 60% chance of losing
    const isWin = Math.random() < 0.4
    let prize = 0

    if (isWin) {
      prize = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    }

    // Find user
    const user = await getUserById(auth.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user stats
    const updatedUser = await updateUserStats(user.id, prize)

    return NextResponse.json({ prize, newBalance: updatedUser.tokenBalance })
  } catch (error) {
    console.error("Scratch card error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Helper function to update user stats
async function updateUserStats(userId: string, prize: number) {
  const user = await getUserById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  user.cardsScratched += 1

  if (prize > 0) {
    user.tokenBalance += prize
    user.totalWinnings += prize
  }

  // In a real app, this would update the database
  const users = global.users || []
  const userIndex = users.findIndex((u: any) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex] = user
  }

  return user
}
