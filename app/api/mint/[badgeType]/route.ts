import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { getUserById, updateUserTokenBalance } from "@/lib/db"
import { mintNFTBadge } from "@/lib/blockchain"

type BadgeConfig = {
  type: "BRONZE" | "SILVER" | "GOLD"
  dbKey: "bronze" | "silver" | "gold"
  requiredTokens: number
  name: string
}

const badgeConfigs: Record<string, BadgeConfig> = {
  bronze: {
    type: "BRONZE",
    dbKey: "bronze",
    requiredTokens: 10,
    name: "Bronze",
  },
  silver: {
    type: "SILVER",
    dbKey: "silver",
    requiredTokens: 50,
    name: "Silver",
  },
  gold: {
    type: "GOLD",
    dbKey: "gold",
    requiredTokens: 100,
    name: "Gold",
  },
}

export async function POST(req: NextRequest, { params }: { params: { badgeType: string } }) {
  const badgeType = params.badgeType.toLowerCase()

  // Check if badge type is valid
  if (!badgeConfigs[badgeType]) {
    return NextResponse.json({ success: false, message: "Invalid badge type" }, { status: 400 })
  }

  const badgeConfig = badgeConfigs[badgeType]

  // Authenticate user with middleware
  const auth = await authMiddleware(req)

  // If auth is a NextResponse, it means authentication failed
  if (auth instanceof NextResponse) {
    return auth
  }

  try {
    // Get user data
    const user = await getUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if user has a wallet address
    if (!user.walletAddress) {
      return NextResponse.json(
        { success: false, message: "Wallet not connected. Please connect your wallet first." },
        { status: 400 },
      )
    }

    // Check if user has already minted this badge
    if (user.mintedBadges?.[badgeConfig.dbKey]) {
      return NextResponse.json({ success: false, message: `${badgeConfig.name} badge already minted` }, { status: 400 })
    }

    // Check if user has enough tokens
    if (user.tokenBalance < badgeConfig.requiredTokens) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient token balance. You need ${badgeConfig.requiredTokens} tokens to mint a ${badgeConfig.name} badge.`,
          currentBalance: user.tokenBalance,
        },
        { status: 400 },
      )
    }

    // Deduct tokens from user's balance
    const newBalance = user.tokenBalance - badgeConfig.requiredTokens
    await updateUserTokenBalance(user.id, newBalance)

    // Mint the NFT on the blockchain
    const mintResult = await mintNFTBadge(user.walletAddress, badgeConfig.type)

    if (!mintResult.success) {
      // Rollback token deduction if minting fails
      await updateUserTokenBalance(user.id, user.tokenBalance)

      return NextResponse.json({ success: false, message: "Failed to mint NFT: " + mintResult.error }, { status: 500 })
    }

    // Update user record to mark badge as minted
    const updatedUser = await updateUserTokenBalance(user.id, newBalance, badgeConfig.dbKey)

    return NextResponse.json({
      success: true,
      message: `${badgeConfig.name} badge minted successfully!`,
      transactionHash: mintResult.transactionHash,
      newBalance: updatedUser?.tokenBalance || newBalance,
    })
  } catch (error) {
    console.error(`${badgeConfig.name} badge minting error:`, error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : `Failed to mint ${badgeConfig.name} badge`,
      },
      { status: 500 },
    )
  }
}
