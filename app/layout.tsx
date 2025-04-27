import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WagmiProvider } from "@/components/providers/wagmi-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Crypto Scratch - Win Tokens & NFTs",
  description: "Blockchain-based scratch card game with NFT rewards",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <WagmiProvider>
              {children}
              <Toaster />
            </WagmiProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
