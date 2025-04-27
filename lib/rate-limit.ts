export interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
  limit: number
}

interface RateLimitStore {
  [key: string]: {
    tokens: string[]
    createdAt: number
  }
}

// In-memory store for rate limiting
// In production, use Redis or another distributed store
const rateLimitStore: RateLimitStore = {}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (token: string) => {
      const now = Date.now()
      const windowStart = now - config.interval

      // Clean old entries
      Object.keys(rateLimitStore).forEach((key) => {
        if (rateLimitStore[key].createdAt < windowStart) {
          delete rateLimitStore[key]
        }
      })

      // Create new window if it doesn't exist
      const tokenKey = `${token}-${Math.floor(now / config.interval)}`
      if (!rateLimitStore[tokenKey]) {
        rateLimitStore[tokenKey] = {
          tokens: [],
          createdAt: now,
        }
      }

      const currentWindow = rateLimitStore[tokenKey]

      // Check if limit is reached
      if (currentWindow.tokens.length >= config.limit) {
        return Promise.reject(new Error("Rate limit exceeded"))
      }

      // Add token to window
      currentWindow.tokens.push(token)

      return Promise.resolve()
    },
  }
}
