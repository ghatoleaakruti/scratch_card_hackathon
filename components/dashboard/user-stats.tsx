"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, CreditCard, Trophy } from "lucide-react"

export function UserStats() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Token Balance",
      value: user?.tokenBalance || 0,
      icon: <Coins className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Cards Scratched",
      value: user?.cardsScratched || 0,
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total Winnings",
      value: user?.totalWinnings || 0,
      icon: <Trophy className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.title} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span className="text-sm font-medium">{stat.title}</span>
              </div>
              <span className="font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
