"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import jwt_decode from "jwt-decode"

interface TokenPayload {
  userId: string
  email: string
  exp: number
  iat: number
}

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      try {
        // Check if token is expired
        const decoded = jwt_decode<TokenPayload>(storedToken)
        const currentTime = Date.now() / 1000

        if (decoded.exp < currentTime) {
          setIsTokenExpired(true)
          localStorage.removeItem("authToken")
          toast({
            title: "Session expired",
            description: "Please log in again to continue",
            variant: "destructive",
          })
        } else {
          setToken(storedToken)
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem("authToken")
      }
    }
  }, [toast])

  // Save token to localStorage and state
  const saveToken = useCallback((newToken: string) => {
    localStorage.setItem("authToken", newToken)
    setToken(newToken)
    setIsTokenExpired(false)
  }, [])

  // Clear token from localStorage and state
  const clearToken = useCallback(() => {
    localStorage.removeItem("authToken")
    setToken(null)
  }, [])

  // Handle API responses that indicate token expiration
  const handleApiResponse = useCallback(
    async (response: Response) => {
      if (response.status === 401) {
        try {
          const data = await response.json()
          if (data.expired) {
            setIsTokenExpired(true)
            clearToken()
            toast({
              title: "Session expired",
              description: "Please log in again to continue",
              variant: "destructive",
            })
            router.push("/login")
            return null
          }
        } catch (e) {
          // If we can't parse the response, just continue
        }
      }
      return response
    },
    [clearToken, router, toast],
  )

  // Create authenticated fetch function
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        })
        router.push("/login")
        return null
      }

      const authOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      }

      try {
        const response = await fetch(url, authOptions)
        return handleApiResponse(response)
      } catch (error) {
        console.error("Auth fetch error:", error)
        toast({
          title: "Request failed",
          description: "Please check your connection and try again",
          variant: "destructive",
        })
        return null
      }
    },
    [token, handleApiResponse, router, toast],
  )

  return {
    token,
    isAuthenticated: !!token && !isTokenExpired,
    isTokenExpired,
    saveToken,
    clearToken,
    authFetch,
  }
}
