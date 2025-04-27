import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get session ID
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId || !global.sessions || !global.sessions[sessionId]) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Get user ID from session
    const userId = global.sessions[sessionId]

    // Get badge ID from request
    const { badgeId } = await request.json()

    if (!badgeId) {
      return NextResponse.json({ message: "Badge ID is required" }, { status: 400 })
    }

    // Define badge requirements and costs
    const badgeConfig = {
      bronze: { cardRequirement: 10, tokenCost: 50 },
      silver: { cardRequirement: 50, tokenCost: 150 },
      gold: { cardRequirement: 100, tokenCost: 300 },
    }

    const config = badgeConfig[badgeId as keyof typeof badgeConfig]

    if (!config) {
      return NextResponse.json({ message: "Invalid badge ID" }, { status: 400 })
    }

    // Find user
    const users = global.users || []
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = users[userIndex]

    // Check if user has connected wallet
    if (!user.walletAddress) {
      return NextResponse.json({ message: "Wallet not connected" }, { status: 400 })
    }

    // Check if user meets requirements
    if (user.cardsScratched < config.cardRequirement) {
      return NextResponse.json({ message: "Card requirement not met" }, { status: 400 })
    }

    // Check if user has enough tokens
    if (user.tokenBalance < config.tokenCost) {
      return NextResponse.json({ message: "Insufficient token balance" }, { status: 400 })
    }

    // Deduct tokens
    users[userIndex].tokenBalance -= config.tokenCost

    // In a real app, this is where you would call the blockchain to mint the NFT
    // For this demo, we'll just simulate a successful mint

    return NextResponse.json({
      success: true,
      message: `Successfully minted ${badgeId} badge NFT`,
    })
  } catch (error) {
    console.error("Mint NFT error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
