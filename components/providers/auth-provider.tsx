"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuthToken } from "@/hooks/use-auth-token"

type User = {
  id: string
  email: string
  walletAddress?: string
  tokenBalance: number
  cardsScratched: number
  totalWinnings: number
  mintedBadges?: {
    bronze: boolean
    silver: boolean
    gold: boolean
  }
}

type AuthContextType = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  checkAuthStatus: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: false,
  isAuthenticated: false,
  checkAuthStatus: async () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { token, isAuthenticated, saveToken, clearToken, authFetch } = useAuthToken()

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        await fetchUserData()
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [isAuthenticated])

  // Fetch user data with authentication
  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await authFetch("/api/auth/me")
      if (response && response.ok) {
        const data = await response.json()

        // Initialize mintedBadges if it doesn't exist
        if (data.user && !data.user.mintedBadges) {
          data.user.mintedBadges = {
            bronze: false,
            silver: false,
            gold: false,
          }
        }

        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Check authentication status (for protected routes)
  const checkAuthStatus = async () => {
    if (!isAuthenticated) {
      return false
    }

    if (!user) {
      await fetchUserData()
    }

    return !!user
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()

      // Initialize mintedBadges if it doesn't exist
      if (data.user && !data.user.mintedBadges) {
        data.user.mintedBadges = {
          bronze: false,
          silver: false,
          gold: false,
        }
      }

      setUser(data.user)

      // Store JWT token
      if (data.token) {
        saveToken(data.token)
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Signup failed")
      }

      const data = await response.json()

      // Initialize mintedBadges if it doesn't exist
      if (data.user && !data.user.mintedBadges) {
        data.user.mintedBadges = {
          bronze: false,
          silver: false,
          gold: false,
        }
      }

      setUser(data.user)

      // Store JWT token
      if (data.token) {
        saveToken(data.token)
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      clearToken()

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        logout,
        loading,
        isAuthenticated,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
