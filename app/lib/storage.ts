import { Movie } from '@/types/movie'
import { getCurrentUser } from './auth'

const getStorageKey = (): string => {
  if (typeof window === 'undefined') return 'movie-watchlist-data-guest'
  const user = getCurrentUser()
  return user ? `movie-watchlist-data-${user.id}` : 'movie-watchlist-data-guest'
}

export const loadMovies = (): Movie[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const storageKey = getStorageKey()
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading movies from localStorage:', error)
  }
  
  return []
}

export const saveMovies = (movies: Movie[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(movies))
  } catch (error) {
    console.error('Error saving movies to localStorage:', error)
  }
}

export const addMovie = (movie: Movie): Movie[] => {
  const movies = loadMovies()
  const updated = [...movies, movie]
  saveMovies(updated)
  return updated
}

export const updateMovie = (id: string, updates: Partial<Movie>): Movie[] => {
  const movies = loadMovies()
  const updated = movies.map(movie => 
    movie.id === id ? { ...movie, ...updates } : movie
  )
  saveMovies(updated)
  return updated
}

export const deleteMovie = (id: string): Movie[] => {
  const movies = loadMovies()
  const updated = movies.filter(movie => movie.id !== id)
  saveMovies(updated)
  return updated
}

