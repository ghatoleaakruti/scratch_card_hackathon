'use client'

import * as React from "react"
import { WagmiConfig, createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const { connectors } = getDefaultWallets({
  appName: 'Scratch Card Game',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
})

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors,
  ssr: true,
})

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
}