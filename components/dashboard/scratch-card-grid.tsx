"use client"

import { useState } from "react"
import { ScratchCard } from "@/components/dashboard/scratch-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useAuthToken } from "@/hooks/use-auth-token"

type CardType = {
  id: string
  name: string
  price: number
  minPrize: number
  maxPrize: number
  color: string
}

const cardTypes: CardType[] = [
  {
    id: "basic",
    name: "Basic Card",
    price: 10,
    minPrize: 0,
    maxPrize: 30,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "silver",
    name: "Silver Card",
    price: 25,
    minPrize: 5,
    maxPrize: 75,
    color: "from-slate-400 to-slate-500",
  },
  {
    id: "gold",
    name: "Gold Card",
    price: 50,
    minPrize: 10,
    maxPrize: 150,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "platinum",
    name: "Platinum Card",
    price: 100,
    minPrize: 20,
    maxPrize: 300,
    color: "from-purple-500 to-purple-600",
  },
]

export function ScratchCardGrid() {
  const { user, setUser, isAuthenticated } = useAuth()
  const { authFetch } = useAuthToken()
  const { toast } = useToast()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [isScratching, setIsScratching] = useState(false)
  const [prize, setPrize] = useState<number | null>(null)

  const handleBuyCard = async (card: CardType) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to buy a scratch card",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to buy a scratch card",
        variant: "destructive",
      })
      return
    }

    if ((user.tokenBalance || 0) < card.price) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough tokens to buy this card",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await authFetch("/api/game/buy-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: card.id }),
      })

      if (!response) {
        throw new Error("Authentication failed")
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to buy card")
      }

      const data = await response.json()

      // Update user's token balance if provided
      if (setUser && data.newBalance !== undefined) {
        setUser({
          ...user,
          tokenBalance: data.newBalance,
        })
      }

      setActiveCard(card)
      setPrize(null)
      setIsScratching(false)

      toast({
        title: "Card purchased",
        description: `You've purchased a ${card.name}. Scratch to reveal your prize!`,
      })
    } catch (error) {
      toast({
        title: "Failed to buy card",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleScratchComplete = async () => {
    if (!activeCard) return

    setIsScratching(true)

    try {
      const response = await authFetch("/api/game/scratch-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: activeCard.id }),
      })

      if (!response) {
        throw new Error("Authentication failed")
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to scratch card")
      }

      const data = await response.json()
      setPrize(data.prize)

      // Update user's token balance if provided
      if (user && setUser && data.newBalance !== undefined) {
        setUser({
          ...user,
          tokenBalance: data.newBalance,
          cardsScratched: (user.cardsScratched || 0) + 1,
          totalWinnings: (user.totalWinnings || 0) + (data.prize > 0 ? data.prize : 0),
        })
      }

      toast({
        title: data.prize > 0 ? "You won!" : "Better luck next time",
        description:
          data.prize > 0 ? `Congratulations! You won ${data.prize} tokens!` : "No prize this time. Try again!",
        variant: data.prize > 0 ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Failed to scratch card",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsScratching(false)
    }
  }

  const handleReset = () => {
    setActiveCard(null)
    setPrize(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scratch Cards</h2>
      </div>

      {!isAuthenticated && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
          <p className="text-yellow-800 dark:text-yellow-200">Please log in to buy and scratch cards</p>
        </div>
      )}

      {activeCard ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <ScratchCard
            card={activeCard}
            onScratchComplete={handleScratchComplete}
            prize={prize}
            isScratching={isScratching}
          />
          <Button onClick={handleReset} variant="outline">
            Get Another Card
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cardTypes.map((card) => (
            <div
              key={card.id}
              className={`rounded-lg border bg-gradient-to-r ${card.color} p-6 shadow-md transition-transform hover:scale-105`}
            >
              <h3 className="text-xl font-bold text-white">{card.name}</h3>
              <p className="mb-4 text-white/80">
                Win between {card.minPrize} and {card.maxPrize} tokens
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">{card.price} tokens</span>
                <Button
                  onClick={() => handleBuyCard(card)}
                  disabled={!isAuthenticated || (user?.tokenBalance || 0) < card.price}
                  variant="secondary"
                >
                  {!isAuthenticated ? "Login Required" : "Buy & Scratch"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
