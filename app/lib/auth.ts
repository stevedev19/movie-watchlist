import { User } from '../types/auth'

const AUTH_STORAGE_KEY = 'movie-watchlist-auth'
const USERS_STORAGE_KEY = 'movie-watchlist-users'

// Simple hash function (for demo purposes - in production use proper hashing)
const hashPassword = (password: string): string => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export type StoredUser = {
  id: string
  email: string
  name?: string
  passwordHash: string
  createdAt: string
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const signup = (email: string, password: string, name?: string): { success: boolean; error?: string } => {
  try {
    const users = getStoredUsers()
    
    // Check if user already exists (email must be unique)
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, error: 'Email already registered' }
    }

    // Validate email
    if (!email || !isValidEmail(email.trim())) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Validate password
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email: email.trim().toLowerCase(),
      name: name?.trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Auto login after signup
    const user: User = {
      id: newUser.id,
      name: newUser.name || email.split('@')[0], // Fallback to email username if name is missing
      createdAt: newUser.createdAt,
    }
    setCurrentUser(user)

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create account' }
  }
}

export const login = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
  try {
    const users = getStoredUsers()
    const passwordHash = hashPassword(password)
    
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === passwordHash
    )

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const userData: User = {
      id: user.id,
      name: user.name || user.email.split('@')[0], // Fallback to email username if name is missing
      createdAt: user.createdAt,
    }

    setCurrentUser(userData)
    return { success: true, user: userData }
  } catch {
    return { success: false, error: 'Failed to login' }
  }
}

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore localStorage errors
  }
  
  return null
}

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

const getStoredUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore localStorage errors
  }
  
  return []
}

