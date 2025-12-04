export type User = {
  id: string
  name: string
  createdAt?: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

