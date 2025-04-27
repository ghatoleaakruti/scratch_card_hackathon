"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <Card className="mb-8">
      <CardContent className="flex flex-col items-start justify-between p-6 sm:flex-row sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <p className="mt-2 font-medium">
            Token Balance: <span className="text-primary">{user?.tokenBalance || 0}</span>
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ConnectWalletButton />
        </div>
      </CardContent>
    </Card>
  )
}
