"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useAuthToken } from "@/hooks/use-auth-token"

type NFTBadge = {
  id: string
  name: string
  description: string
  tokenCost: number
  cardRequirement: number
  image: string
  apiEndpoint: string
}

const nftBadges: NFTBadge[] = [
  {
    id: "bronze",
    name: "Bronze Scratcher",
    description: "Awarded for scratching 10 cards",
    tokenCost: 10,
    cardRequirement: 10,
    image: "/placeholder.svg?height=100&width=100",
    apiEndpoint: "/api/mint/bronze",
  },
  {
    id: "silver",
    name: "Silver Scratcher",
    description: "Awarded for scratching 50 cards",
    tokenCost: 50,
    cardRequirement: 50,
    image: "/placeholder.svg?height=100&width=100",
    apiEndpoint: "/api/mint/silver",
  },
  {
    id: "gold",
    name: "Gold Scratcher",
    description: "Awarded for scratching 100 cards",
    tokenCost: 100,
    cardRequirement: 100,
    image: "/placeholder.svg?height=100&width=100",
    apiEndpoint: "/api/mint/gold",
  },
]

export function NFTRewards() {
  const { user, setUser, isAuthenticated } = useAuth()
  const { authFetch } = useAuthToken()
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [minting, setMinting] = useState<string | null>(null)

  const handleMintNFT = async (badge: NFTBadge) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to mint an NFT",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to mint an NFT",
        variant: "destructive",
      })
      return
    }

    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      })
      return
    }

    if ((user.cardsScratched || 0) < badge.cardRequirement) {
      toast({
        title: "Requirement not met",
        description: `You need to scratch at least ${badge.cardRequirement} cards to mint this NFT`,
        variant: "destructive",
      })
      return
    }

    if ((user.tokenBalance || 0) < badge.tokenCost) {
      toast({
        title: "Insufficient balance",
        description: `You need ${badge.tokenCost} tokens to mint this NFT`,
        variant: "destructive",
      })
      return
    }

    setMinting(badge.id)

    try {
      const response = await authFetch(badge.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response) {
        throw new Error("Authentication failed")
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to mint NFT")
      }

      const data = await response.json()

      // Update user's token balance
      if (user && setUser && data.newBalance !== undefined) {
        setUser({
          ...user,
          tokenBalance: data.newBalance,
          mintedBadges: {
            ...user.mintedBadges,
            [badge.id]: true,
          },
        })
      }

      toast({
        title: "NFT Minted",
        description: `You've successfully minted the ${badge.name} NFT!`,
      })
    } catch (error) {
      toast({
        title: "Failed to mint NFT",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setMinting(null)
    }
  }

  // Check if user has already minted a badge
  const hasMinted = (badgeId: string) => {
    return user?.mintedBadges?.[badgeId as keyof typeof user.mintedBadges] || false
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nftBadges.map((badge) => {
            const isEligible = (user?.cardsScratched || 0) >= badge.cardRequirement
            const canAfford = (user?.tokenBalance || 0) >= badge.tokenCost
            const alreadyMinted = hasMinted(badge.id)

            return (
              <div key={badge.id} className="flex flex-col space-y-2 rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={badge.image || "/placeholder.svg"} alt={badge.name} className="h-10 w-10 rounded-md" />
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Cost: <strong>{badge.tokenCost} tokens</strong>
                  </span>
                  <Button
                    size="sm"
                    variant={isEligible && canAfford && !alreadyMinted ? "default" : "outline"}
                    disabled={
                      !isEligible ||
                      !canAfford ||
                      !isConnected ||
                      minting === badge.id ||
                      alreadyMinted ||
                      !isAuthenticated
                    }
                    onClick={() => handleMintNFT(badge)}
                  >
                    {!isAuthenticated
                      ? "Login required"
                      : minting === badge.id
                        ? "Minting..."
                        : alreadyMinted
                          ? "Minted"
                          : isEligible
                            ? "Mint NFT"
                            : `Need ${badge.cardRequirement} cards`}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
