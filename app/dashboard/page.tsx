'use client'

import { useState, useEffect, useMemo } from 'react'
import { Movie } from '@/types/movie'
import { loadMovies, addMovie, updateMovie, deleteMovie } from '@/app/lib/storage-mongodb'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import HeroBanner from '../components/HeroBanner'
import StatCard from '../components/StatCard'
import MovieCard from '../components/MovieCard'
import SectionRow from '../components/SectionRow'
import FiltersBar from '../components/FiltersBar'

// Sample trending movie for hero
const SAMPLE_TRENDING: Movie = {
  id: 'trending-1',
  title: 'The Dark Knight',
  year: 2008,
  genre: 'Action',
  notes: 'A thrilling superhero film that redefined the genre. Follow Batman as he faces his greatest challenge yet.',
  watched: false,
  createdAt: new Date().toISOString(),
}

// Sample trending movies
const SAMPLE_TRENDING_MOVIES: Movie[] = [
  {
    id: 'trending-2',
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    notes: 'A mind-bending journey through dreams and reality.',
    watched: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trending-3',
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    notes: 'An epic space adventure exploring the boundaries of time and space.',
    watched: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trending-4',
    title: 'The Matrix',
    year: 1999,
    genre: 'Action',
    notes: 'A groundbreaking sci-fi action film that changed cinema forever.',
    watched: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trending-5',
    title: 'Pulp Fiction',
    year: 1994,
    genre: 'Crime',
    notes: 'A nonlinear crime film with unforgettable characters and dialogue.',
    watched: false,
    createdAt: new Date().toISOString(),
  },
]

export default function Dashboard() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unwatched' | 'watched'>('all')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'title'>('date')
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  // Load movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        const loaded = await loadMovies()
        setMovies(loaded)
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchMovies()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

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
      
      return matchesSearch && matchesType && matchesGenre && matchesYear
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
  }, [movies, searchQuery, filterType, selectedGenre, selectedYear, sortBy])

  const toWatchMovies = filteredAndSortedMovies.filter(m => !m.watched)
  const watchedMovies = filteredAndSortedMovies.filter(m => m.watched)

  // Stats
  const stats = useMemo(() => {
    const total = movies.length
    const watched = movies.filter(m => m.watched).length
    const toWatch = total - watched
    const lastUpdated = movies.length > 0 
      ? new Date(Math.max(...movies.map(m => new Date(m.createdAt).getTime()))).toLocaleDateString()
      : 'Never'

    return { total, watched, toWatch, lastUpdated }
  }, [movies])

  // Handlers
  const handleToggleWatched = async (id: string) => {
    const movie = movies.find(m => m.id === id)
    if (movie) {
      try {
        const updated = await updateMovie(id, {
          watched: !movie.watched,
          watchedAt: !movie.watched ? new Date().toISOString() : undefined,
        })
        setMovies(updated)
      } catch (error) {
        console.error('Error toggling watched status:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const updated = await deleteMovie(id)
      setMovies(updated)
    } catch (error) {
      console.error('Error deleting movie:', error)
    }
  }

  const handleUpdateRating = async (id: string, rating: number | undefined) => {
    try {
      const updated = await updateMovie(id, { rating })
      setMovies(updated)
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  const handleAddToWatchlist = async (movie: Movie) => {
    if (!isAuthenticated) {
      alert('Please log in to add movies to your watchlist')
      return
    }
    try {
      const newMovie: Movie = {
        ...movie,
        id: Date.now().toString(), // This will be replaced by MongoDB _id
        createdAt: new Date().toISOString(),
      }
      const updated = await addMovie(newMovie)
      setMovies(updated)
    } catch (error: any) {
      console.error('Error adding movie:', error)
      alert(error.message || 'Failed to add movie. Please try again.')
    }
  }

  const handleEditNotes = (movie: Movie) => {
    setEditingMovie(movie)
    setEditNotes(movie.notes || '')
  }

  const handleSaveNotes = async () => {
    if (editingMovie) {
      try {
        const updated = await updateMovie(editingMovie.id, { notes: editNotes })
        setMovies(updated)
        setEditingMovie(null)
        setEditNotes('')
      } catch (error) {
        console.error('Error saving notes:', error)
      }
    }
  }

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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <HeroBanner 
          movie={SAMPLE_TRENDING}
          onAddToWatchlist={() => handleAddToWatchlist(SAMPLE_TRENDING)}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Movies Added" 
            value={stats.total} 
            icon="📽️"
            color="#E50914"
          />
          <StatCard 
            title="Watched" 
            value={stats.watched} 
            icon="✅"
            color="#10B981"
          />
          <StatCard 
            title="To Watch" 
            value={stats.toWatch} 
            icon="⏳"
            color="#3B82F6"
          />
          <StatCard 
            title="Last Updated" 
            value={stats.lastUpdated} 
            icon="🕐"
            color="#8B5CF6"
          />
        </div>

        {/* Your Watchlist */}
        {toWatchMovies.length > 0 && (
          <SectionRow title="Your Watchlist" horizontal>
            {toWatchMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                <MovieCard
                  movie={movie}
                  onToggleWatched={() => handleToggleWatched(movie.id)}
                  onDelete={() => handleDelete(movie.id)}
                  onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                  onEditNotes={() => handleEditNotes(movie)}
                />
              </div>
            ))}
          </SectionRow>
        )}

        {/* Watched Movies */}
        {watchedMovies.length > 0 && (
          <SectionRow title="Watched Movies" horizontal>
            {watchedMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                <MovieCard
                  movie={movie}
                  onToggleWatched={() => handleToggleWatched(movie.id)}
                  onDelete={() => handleDelete(movie.id)}
                  onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                  onEditNotes={() => handleEditNotes(movie)}
                />
              </div>
            ))}
          </SectionRow>
        )}

        {/* Trending Now */}
        <SectionRow title="Trending Now" horizontal>
          {SAMPLE_TRENDING_MOVIES.map(movie => {
            const isInWatchlist = movies.some(m => m.title === movie.title)
            return (
              <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                <MovieCard
                  movie={movie}
                  onToggleWatched={() => {
                    if (!isInWatchlist) {
                      handleAddToWatchlist(movie)
                    }
                  }}
                  onDelete={() => {}}
                  onUpdateRating={() => {}}
                  onEditNotes={() => {}}
                />
              </div>
            )
          })}
        </SectionRow>

        {/* Full Dashboard Grid with Filters */}
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
              {filteredAndSortedMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onToggleWatched={() => handleToggleWatched(movie.id)}
                  onDelete={() => handleDelete(movie.id)}
                  onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                  onEditNotes={() => handleEditNotes(movie)}
                />
              ))}
            </SectionRow>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading your movies...</h3>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedMovies.length === 0 && movies.length === 0 && (
          <div className="netflix-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-[#A3A3A3]">
              {isAuthenticated 
                ? "Start adding movies to track what you want to watch!" 
                : "Please log in to start adding movies to your watchlist."}
            </p>
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

      {/* Edit Notes Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="netflix-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Edit Notes</h3>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] resize-none"
              placeholder="Add notes about this movie..."
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveNotes}
                className="flex-1 px-4 py-2 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingMovie(null)
                  setEditNotes('')
                }}
                className="flex-1 px-4 py-2 bg-[#181818] border border-[#262626] text-white rounded-lg font-semibold hover:bg-[#262626] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

