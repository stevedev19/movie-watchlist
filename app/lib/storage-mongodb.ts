import { Movie } from '@/types/movie'

const API_BASE = '/api/movies'

// Helper to get user ID from JWT token via /api/me
// Note: The JWT cookie is automatically sent with fetch requests
const getUserId = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/me')
    if (res.ok) {
      const data = await res.json()
      return data.user?.id || null
    }
  } catch (error) {
    console.error('Error getting user ID:', error)
  }
  return null
}

export const loadMovies = async (): Promise<Movie[]> => {
  if (typeof window === 'undefined') return []
  
  try {
    const response = await fetch(API_BASE)

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated
        return []
      }
      throw new Error('Failed to load movies')
    }

    const data = await response.json()
    return data.movies || []
  } catch (error) {
    console.error('Error loading movies from MongoDB:', error)
    return []
  }
}

export const saveMovies = async (movies: Movie[]): Promise<void> => {
  // Note: This is a bulk operation - you might want to implement a bulk endpoint
  // For now, we'll just log that this should be handled differently
  console.warn('Bulk save not implemented. Use individual add/update/delete operations.')
}

export const addMovie = async (movie: Movie): Promise<Movie[]> => {
  if (typeof window === 'undefined') return []
  
  try {
    // Ensure watched status is set correctly
    const movieToAdd = {
      ...movie,
      watched: movie.watched || false,
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieToAdd),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to add movies')
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to add movie')
    }

    const updated = await loadMovies()
    return updated
  } catch (error) {
    console.error('Error adding movie to MongoDB:', error)
    throw error
  }
}

export const updateMovie = async (id: string, updates: Partial<Movie>): Promise<Movie[]> => {
  if (typeof window === 'undefined') return []
  
  try {
    // If watched status is changing, ensure watchedAt is set
    const updateData = { ...updates }
    if (updates.watched === true && !updates.watchedAt) {
      updateData.watchedAt = new Date().toISOString()
    } else if (updates.watched === false) {
      updateData.watchedAt = undefined
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to update movies')
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to update movie')
    }

    const updated = await loadMovies()
    return updated
  } catch (error) {
    console.error('Error updating movie in MongoDB:', error)
    throw error
  }
}

export const deleteMovie = async (id: string): Promise<Movie[]> => {
  if (typeof window === 'undefined') return []
  
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to delete movies')
      }
      throw new Error('Failed to delete movie')
    }

    const updated = await loadMovies()
    return updated
  } catch (error) {
    console.error('Error deleting movie from MongoDB:', error)
    throw error
  }
}

