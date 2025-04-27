"use client"

import type React from "react"
import { createConfig, WagmiConfig, configureChains, mainnet, sepolia } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { InjectedConnector } from "wagmi/connectors/injected"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client
const queryClient = new QueryClient()

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains([mainnet, sepolia], [publicProvider()])

// Set up connectors
const connectors = [
  new MetaMaskConnector({ chains }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: "CryptoScratch",
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
    },
  }),
  new InjectedConnector({
    chains,
    options: {
      name: "Injected",
      shimDisconnect: true,
    },
  }),
]

// Create config
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </QueryClientProvider>
  )
}
