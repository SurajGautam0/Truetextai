import type { PublicUser } from "./redis"

export interface User extends PublicUser {}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  startTrial: () => Promise<any | null> // Add this
  cancelTrial: () => Promise<boolean> // Add this
  refreshSession: () => Promise<void> // Add this
}

import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role?: string
    plan?: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      plan: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
    plan: string
  }
}
