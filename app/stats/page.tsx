"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStats } from "@/components/dashboard/user-stats"
import { NFTRewards } from "@/components/dashboard/nft-rewards"

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Statistics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <UserStats />

          <Card>
            <CardHeader>
              <CardTitle>Scratch History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Your scratch card history will appear here</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NFTRewards />

          <Card>
            <CardHeader>
              <CardTitle>Your NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Your minted NFTs will appear here</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
