"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useAuthToken } from "@/hooks/use-auth-token"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, setUser, isAuthenticated } = useAuth()
  const { authFetch } = useAuthToken()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  useEffect(() => {
    // If wallet is connected and user is logged in, link wallet to account
    if (isConnected && address && user && isAuthenticated && !user.walletAddress) {
      linkWalletToAccount(address)
    }
  }, [isConnected, address, user, isAuthenticated])

  const linkWalletToAccount = async (walletAddress: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to link your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await authFetch("/api/user/link-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response) {
        throw new Error("Authentication failed")
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to link wallet")
      }

      const data = await response.json()

      // Update user data if provided
      if (setUser && data.user) {
        setUser(data.user)
      }

      toast({
        title: "Wallet linked",
        description: "Your wallet has been linked to your account",
      })
    } catch (error) {
      toast({
        title: "Failed to link wallet",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()} className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        {formatAddress(address)}
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button disabled={!isAuthenticated || isLoading}>
          {!isAuthenticated ? "Login Required" : isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {connectors
          .filter((connector) => connector.ready)
          .map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => {
                connect({ connector })
                setIsOpen(false)
              }}
              disabled={isLoading && pendingConnector?.id === connector.id}
            >
              {connector.name}
              {isLoading && pendingConnector?.id === connector.id && " (connecting)"}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
