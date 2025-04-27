import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { getUserById, updateUserTokenBalance } from "@/lib/db"

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

    // Get card price
    const cardPrices = {
      basic: 10,
      silver: 25,
      gold: 50,
      platinum: 100,
    }

    const price = cardPrices[cardId as keyof typeof cardPrices]

    if (!price) {
      return NextResponse.json({ message: "Invalid card ID" }, { status: 400 })
    }

    // Find user
    const user = await getUserById(auth.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if user has enough tokens
    if (user.tokenBalance < price) {
      return NextResponse.json({ message: "Insufficient token balance" }, { status: 400 })
    }

    // Deduct tokens
    const newBalance = user.tokenBalance - price
    await updateUserTokenBalance(user.id, newBalance)

    return NextResponse.json({ success: true, newBalance })
  } catch (error) {
    console.error("Buy card error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
