import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, createAuthResponse } from "@/lib/auth"
import { getUserById, updateUserTokenBalance } from "@/lib/db"
import { mintNFTBadge } from "@/lib/blockchain"

export async function POST(req: NextRequest) {
  // Authenticate user
  const auth = await verifyAuth(req)
  if (!auth.authenticated) {
    return createAuthResponse(auth.error)
  }

  try {
    // Get user data
    const user = await getUserById(auth.userId)
    if (!user) {
      return createAuthResponse("User not found", 404)
    }

    // Check if user has a wallet address
    if (!user.walletAddress) {
      return NextResponse.json(
        { success: false, message: "Wallet not connected. Please connect your wallet first." },
        { status: 400 },
      )
    }

    // Check if user has already minted this badge
    if (user.mintedBadges?.bronze) {
      return NextResponse.json({ success: false, message: "Bronze badge already minted" }, { status: 400 })
    }

    // Check if user has enough tokens (10 for Bronze)
    const requiredTokens = 10
    if (user.tokenBalance < requiredTokens) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient token balance. You need ${requiredTokens} tokens to mint a Bronze badge.`,
          currentBalance: user.tokenBalance,
        },
        { status: 400 },
      )
    }

    // Deduct tokens from user's balance
    const newBalance = user.tokenBalance - requiredTokens
    await updateUserTokenBalance(user.id, newBalance)

    // Mint the NFT on the blockchain
    const mintResult = await mintNFTBadge(user.walletAddress, "BRONZE")

    if (!mintResult.success) {
      // Rollback token deduction if minting fails
      await updateUserTokenBalance(user.id, user.tokenBalance)

      return NextResponse.json({ success: false, message: "Failed to mint NFT: " + mintResult.error }, { status: 500 })
    }

    // Update user record to mark badge as minted
    const updatedUser = await updateUserTokenBalance(user.id, newBalance, "bronze")

    return NextResponse.json({
      success: true,
      message: "Bronze badge minted successfully!",
      transactionHash: mintResult.transactionHash,
      newBalance: updatedUser?.tokenBalance || newBalance,
    })
  } catch (error) {
    console.error("Bronze badge minting error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to mint Bronze badge",
      },
      { status: 500 },
    )
  }
}
