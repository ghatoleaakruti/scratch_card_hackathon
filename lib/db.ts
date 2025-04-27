// In a real app, this would use a real database like MongoDB or PostgreSQL
// For this demo, we'll use the global object as a mock database

export interface User {
  id: string
  email: string
  walletAddress?: string
  tokenBalance: number
  cardsScratched: number
  totalWinnings: number
  mintedBadges: {
    bronze: boolean
    silver: boolean
    gold: boolean
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = global.users || []
  const user = users.find((u: any) => u.id === userId)

  if (!user) {
    return null
  }

  // Add mintedBadges if it doesn't exist
  if (!user.mintedBadges) {
    user.mintedBadges = {
      bronze: false,
      silver: false,
      gold: false,
    }
  }

  return user
}

export async function updateUserTokenBalance(
  userId: string,
  newBalance: number,
  badgeType?: "bronze" | "silver" | "gold",
): Promise<User | null> {
  const users = global.users || []
  const userIndex = users.findIndex((u: any) => u.id === userId)

  if (userIndex === -1) {
    return null
  }

  // Update token balance
  users[userIndex].tokenBalance = newBalance

  // Mark badge as minted if specified
  if (badgeType) {
    if (!users[userIndex].mintedBadges) {
      users[userIndex].mintedBadges = {
        bronze: false,
        silver: false,
        gold: false,
      }
    }
    users[userIndex].mintedBadges[badgeType] = true
  }

  return users[userIndex]
}
