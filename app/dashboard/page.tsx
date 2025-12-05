'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Movie } from '@/types/movie'
import { loadMovies, addMovie, updateMovie, deleteMovie } from '@/app/lib/storage-mongodb'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import HeroBanner from '../components/HeroBanner'
import StatCard from '../components/StatCard'
import MovieCard from '../components/MovieCard'
import SectionRow from '../components/SectionRow'
import FiltersBar from '../components/FiltersBar'
import AddMovieModal from '../components/AddMovieModal'

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

function DashboardContent() {
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unwatched' | 'watched'>('all')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'title'>('date')
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editGenre, setEditGenre] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>('')
  const [editImageUrl, setEditImageUrl] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const currentUserId = user?.id || user?.userId || undefined

  // Handle URL query parameters for filtering
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'watched') {
      setFilterType('watched')
    } else if (filterParam === 'unwatched') {
      setFilterType('unwatched')
    }
  }, [searchParams])

  // Load movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        const loaded = await loadMovies()
        // 🔥 CRITICAL: Log movies after fetch
        console.log('[Dashboard] movies after fetch:', loaded.map(m => ({
          title: m.title,
          imageUrl: m.imageUrl ? m.imageUrl.substring(0, 80) : 'NULL/MISSING',
          hasImage: m.hasImage,
          imageType: m.imageType,
        })))
        setMovies(loaded)
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch movies only if authenticated
    if (isAuthenticated && currentUserId) {
      fetchMovies()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, currentUserId])

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

  // Filter and sort movies (only show current user's movies)
  const filteredAndSortedMovies = useMemo(() => {
    // First filter to only show current user's movies
    const userMovies = movies.filter(movie => movie.userId === currentUserId)
    
    let filtered = userMovies.filter(movie => {
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
  }, [movies, currentUserId, searchQuery, filterType, selectedGenre, selectedYear, selectedRating, sortBy])

  const toWatchMovies = filteredAndSortedMovies.filter(m => !m.watched)
  const watchedMovies = filteredAndSortedMovies.filter(m => m.watched)

  // Stats (only for current user's movies - already filtered above)
  // Stats (only for current user's movies - already filtered above)
  const stats = useMemo(() => {
    const userMoviesList = movies.filter(m => m.userId === currentUserId)
    const total = userMoviesList.length
    const watched = userMoviesList.filter(m => m.watched).length
    const toWatch = total - watched
    const lastUpdated = userMoviesList.length > 0 
      ? new Date(Math.max(...userMoviesList.map(m => new Date(m.createdAt).getTime()))).toLocaleDateString()
      : 'Never'

    return { total, watched, toWatch, lastUpdated }
  }, [movies, currentUserId])

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
    const movie = movies.find(m => m.id === id)
    const movieTitle = movie?.title || 'this movie'
    
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you really going to delete "${movieTitle}"?`)
    
    if (!confirmed) {
      return // User cancelled deletion
    }

    try {
      const updated = await deleteMovie(id)
      setMovies(updated)
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Failed to delete movie. Please try again.')
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
    setEditTitle(movie.title || '')
    setEditGenre(movie.genre || '')
    setEditYear(movie.year?.toString() || '')
    setEditNotes(movie.notes || '')
    setEditImageUrl(movie.imageUrl || movie.image || '')
    setEditImageFile(null)
    setEditImagePreview('')
    console.log('Editing movie:', movie.title, 'Current imageUrl:', movie.imageUrl || movie.image || 'none')
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image file (JPEG, PNG, WebP, or GIF).')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.')
      return
    }

    // Convert to base64 data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string)
      setEditImageFile(null) // We don't need the file object anymore
    }
    reader.onerror = () => {
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveEditImage = () => {
    setEditImageFile(null)
    setEditImagePreview('')
    setEditImageUrl('')
  }

  const handleSaveNotes = async () => {
    if (editingMovie) {
      try {
        // Validate title
        if (!editTitle.trim()) {
          alert('Movie title is required')
          return
        }

        setIsUploadingImage(true)
        
        // Use preview (base64) if available, otherwise keep current image or clear if removed
        let finalImage: string | undefined = editImagePreview || editImageUrl || undefined
        
        // If image was removed (empty string), clear it
        if (editImageUrl === '' && !editImagePreview) {
          finalImage = undefined
        }

        // Update movie with title, genre, year, notes, and image
        const updates: Partial<Movie> = { 
          title: editTitle.trim(),
          genre: editGenre.trim() || undefined,
          year: editYear ? parseInt(editYear, 10) : undefined,
          notes: editNotes.trim() || undefined,
        }
        
        // Update image if it changed (new preview or was removed)
        if (editImagePreview || editImageUrl === '') {
          updates.imageUrl = finalImage || null
          updates.image = finalImage || null // keep backward compat
          updates.hasImage = !!finalImage
        }

        const updated = await updateMovie(editingMovie.id, updates)
        setMovies(updated)
        setEditingMovie(null)
        setEditTitle('')
        setEditGenre('')
        setEditYear('')
        setEditNotes('')
        setEditImageFile(null)
        setEditImagePreview('')
        setEditImageUrl('')
      } catch (error) {
        console.error('Error saving movie:', error)
        alert(error instanceof Error ? error.message : 'Failed to save changes')
      } finally {
        setIsUploadingImage(false)
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
        onAddMovie={() => setShowAddMovieModal(true)}
        hideAuth={true}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
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
            {toWatchMovies.map(movie => {
              const isOwner = currentUserId && movie.userId && currentUserId === movie.userId
              return (
                <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                  <MovieCard
                    movie={movie}
                    onToggleWatched={() => handleToggleWatched(movie.id)}
                    onDelete={() => handleDelete(movie.id)}
                    onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                    onEditNotes={isOwner ? () => handleEditNotes(movie) : undefined}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </SectionRow>
        )}

        {/* Watched Movies */}
        {watchedMovies.length > 0 && (
          <SectionRow title="Watched Movies" horizontal>
            {watchedMovies.map(movie => {
              const isOwner = true // All movies shown are user's own
              return (
                <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                  <MovieCard
                    movie={movie}
                    onToggleWatched={() => handleToggleWatched(movie.id)}
                    onDelete={() => handleDelete(movie.id)}
                    onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                    onEditNotes={isOwner ? () => handleEditNotes(movie) : undefined}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </SectionRow>
        )}

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
                {filteredAndSortedMovies.map(movie => {
                  const isOwner = true // All movies shown are user's own
                  return (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onToggleWatched={() => handleToggleWatched(movie.id)}
                      onDelete={() => handleDelete(movie.id)}
                      onUpdateRating={(rating) => handleUpdateRating(movie.id, rating)}
                      onEditNotes={isOwner ? () => handleEditNotes(movie) : undefined}
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

      {/* Edit Movie Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="netflix-card rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Movie</h3>
              <button
                onClick={() => {
                  setEditingMovie(null)
                  setEditTitle('')
                  setEditGenre('')
                  setEditYear('')
                  setEditNotes('')
                  setEditImageFile(null)
                  setEditImagePreview('')
                  setEditImageUrl('')
                }}
                className="text-[#A3A3A3] hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-[#A3A3A3] mb-2">
                  Movie Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
                  placeholder="Enter movie title"
                  required
                />
              </div>

              {/* Genre and Year Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-genre" className="block text-sm font-medium text-[#A3A3A3] mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    id="edit-genre"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
                    placeholder="e.g., Action, Drama, Comedy"
                  />
                </div>
                <div>
                  <label htmlFor="edit-year" className="block text-sm font-medium text-[#A3A3A3] mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    id="edit-year"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
                    placeholder="e.g., 2023"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              {/* Image Section */}
              <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                  Movie Image
                </label>
                {editImagePreview || editImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img 
                        src={editImagePreview || editImageUrl} 
                        alt="Current image" 
                        className="w-full h-64 object-cover rounded-lg border border-[#262626]"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        className="absolute top-2 right-2 px-3 py-1 bg-[#181818] border border-[#262626] text-white text-sm font-semibold rounded-lg hover:bg-[#262626] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {!editImagePreview && (
                      <p className="text-xs text-[#A3A3A3]">Current image</p>
                    )}
                    {editImagePreview && (
                      <p className="text-xs text-green-500">New image selected (will be saved)</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="edit-movie-image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#262626] border-dashed rounded-lg cursor-pointer bg-[#0F0F0F] hover:bg-[#181818] hover:border-[#E50914] transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-[#A3A3A3]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-[#A3A3A3]">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#A3A3A3]">
                          PNG, JPG, GIF, WebP (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="edit-movie-image"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-[#A3A3A3] mb-2">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] resize-none"
                  placeholder="Add notes about this movie..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isUploadingImage}
                  className="flex-1 px-4 py-2 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingMovie(null)
                    setEditTitle('')
                    setEditGenre('')
                    setEditYear('')
                    setEditNotes('')
                    setEditImageFile(null)
                    setEditImagePreview('')
                    setEditImageUrl('')
                  }}
                  className="flex-1 px-4 py-2 bg-[#181818] border border-[#262626] text-white rounded-lg font-semibold hover:bg-[#262626] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <AddMovieModal
          onClose={() => setShowAddMovieModal(false)}
          onSuccess={async () => {
            // Reload movies after adding
            const loaded = await loadMovies()
            setMovies(loaded)
            setShowAddMovieModal(false)
          }}
        />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎬</div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading...</h3>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
