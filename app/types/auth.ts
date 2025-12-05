export type User = {
  id: string
  name: string
  role?: 'admin' | 'user'
  createdAt?: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

