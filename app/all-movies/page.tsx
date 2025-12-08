'use client'

import { useState, useEffect, useMemo } from 'react'
import { Movie } from '@/types/movie'
import { loadMovies } from '@/app/lib/storage-mongodb'
import Header from '../components/Header'
import MovieCard from '../components/MovieCard'
import SectionRow from '../components/SectionRow'
import FiltersBar from '../components/FiltersBar'
import { useAuth } from '../contexts/AuthContext'

export default function AllMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unwatched' | 'watched'>('all')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'title'>('date')
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const currentUserId = user?.id || undefined

  // Load all movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        // Pass true to loadMovies to fetch all movies from all users
        const loaded = await loadMovies(true)
        setMovies(loaded)
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Get unique genres and years
  const genres = useMemo(() => {
    const genreSet = new Set<string>()
    movies.forEach(movie => {
      if (movie.genre) genreSet.add(movie.genre)
    })
    return Array.from(genreSet).sort()
  }, [movies])

  const years = useMemo(() => {
    const yearSet = new Set<number>()
    movies.forEach(movie => {
      if (movie.year) yearSet.add(movie.year)
    })
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [movies])

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter(movie => {
      // Search filter
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Type filter
      const matchesType = 
        filterType === 'all' ||
        (filterType === 'unwatched' && !movie.watched) ||
        (filterType === 'watched' && movie.watched)
      
      // Genre filter
      const matchesGenre = !selectedGenre || movie.genre === selectedGenre
      
      // Year filter
      const matchesYear = !selectedYear || movie.year?.toString() === selectedYear
      
      // Rating filter (only for watched movies)
      const matchesRating = !selectedRating || 
        (movie.watched && movie.rating && movie.rating >= parseInt(selectedRating, 10))
      
      return matchesSearch && matchesType && matchesGenre && matchesYear && matchesRating
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [movies, searchQuery, filterType, selectedGenre, selectedYear, selectedRating, sortBy])

  // Only show user's own movies in these sections (private)
  const userMovies = useMemo(() => {
    if (!isAuthenticated || !currentUserId) return []
    return movies.filter(movie => movie.userId === currentUserId)
  }, [movies, isAuthenticated, currentUserId])

  const toWatchMovies = userMovies.filter(m => !m.watched)
  const watchedMovies = userMovies.filter(m => m.watched)

  // Stats for all movies
  const stats = useMemo(() => {
    const total = movies.length
    const watched = movies.filter(m => m.watched).length
    const toWatch = total - watched
    const lastUpdated = movies.length > 0 
      ? new Date(Math.max(...movies.map(m => new Date(m.createdAt).getTime()))).toLocaleDateString()
      : 'Never'

    return { total, watched, toWatch, lastUpdated }
  }, [movies])

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        genres={genres}
        years={years}
        hideAuth={false}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Movies</h1>
          <p className="text-[#A3A3A3]">Browse all movies registered by all users</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="netflix-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📽️</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-[#A3A3A3]">Total Movies</div>
          </div>
          <div className="netflix-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-[#10B981]">{stats.watched}</div>
            <div className="text-sm text-[#A3A3A3]">Watched</div>
          </div>
          <div className="netflix-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-[#3B82F6]">{stats.toWatch}</div>
            <div className="text-sm text-[#A3A3A3]">To Watch</div>
          </div>
          <div className="netflix-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🕐</div>
            <div className="text-sm font-bold text-white">{stats.lastUpdated}</div>
            <div className="text-sm text-[#A3A3A3]">Last Updated</div>
          </div>
        </div>

        {/* To Watch Movies - Only visible to registered users, showing only their own movies */}
        {isAuthenticated && toWatchMovies.length > 0 && (
          <SectionRow title="My Movies To Watch" horizontal>
            {toWatchMovies.map(movie => {
              const isOwner = !!(currentUserId && movie.userId && currentUserId === movie.userId)
              return (
                <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                  <MovieCard
                    movie={movie}
                    onToggleWatched={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onDelete={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onUpdateRating={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </SectionRow>
        )}

        {/* Watched Movies - Only visible to registered users, showing only their own movies */}
        {isAuthenticated && watchedMovies.length > 0 && (
          <SectionRow title="My Watched Movies" horizontal>
            {watchedMovies.map(movie => {
              const isOwner = !!(currentUserId && movie.userId && currentUserId === movie.userId)
              return (
                <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                  <MovieCard
                    movie={movie}
                    onToggleWatched={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onDelete={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onUpdateRating={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </SectionRow>
        )}

        {/* Full Grid with Filters */}
        {filteredAndSortedMovies.length > 0 && (
          <>
            <FiltersBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              years={years}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />

            <SectionRow title="All Movies">
              {filteredAndSortedMovies.map(movie => {
                const isOwner = !!(currentUserId && movie.userId && currentUserId === movie.userId)
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onToggleWatched={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onDelete={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    onUpdateRating={() => {
                      // Only allow if user is owner
                      if (isOwner) {
                        // Navigate to dashboard to manage
                        window.location.href = '/dashboard'
                      }
                    }}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                )
              })}
            </SectionRow>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading movies...</h3>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedMovies.length === 0 && movies.length === 0 && (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
            <p className="text-[#A3A3A3]">No movies have been registered yet.</p>
          </div>
        )}

        {filteredAndSortedMovies.length === 0 && movies.length > 0 && (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
            <p className="text-[#A3A3A3]">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>
    </div>
  )
}

