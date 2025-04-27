"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ScratchCardGrid } from "@/components/dashboard/scratch-card-grid"
import { UserStats } from "@/components/dashboard/user-stats"
import { NFTRewards } from "@/components/dashboard/nft-rewards"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  \
  if (=>{
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
      <DashboardHeader />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ScratchCardGrid />
        </div>
        <div className="space-y-8">
          <UserStats />
          <NFTRewards />
        </div>
      </div>
    </div>
  )
}
