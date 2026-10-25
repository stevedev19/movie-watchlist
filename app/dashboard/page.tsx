'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MotionConfig, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { Movie } from '@/types/movie'
import { loadMovies, updateMovie, deleteMovie } from '@/app/lib/storage-mongodb'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import AddMovieModal from '../components/AddMovieModal'
import ShelfNav from '../components/shelf/ShelfNav'
import ShelfTabs, { ShelfTab } from '../components/shelf/ShelfTabs'
import ShelfFilterBar, { ShelfSort } from '../components/shelf/ShelfFilterBar'
import PosterTile from '../components/shelf/PosterTile'
import UpNextCard from '../components/shelf/UpNextCard'
import RateDialog from '../components/shelf/RateDialog'
import { fill, formatNumber } from '../components/shelf/shelfUtils'
import { bodyFont, displayFont, editorialFont } from '../fonts'

const UP_NEXT_COUNT = 4

// ?tab=seen|soon|all; the older ?filter=watched|unwatched links still work
function tabFromParams(params: URLSearchParams): ShelfTab {
  const tab = params.get('tab')
  if (tab === 'seen' || tab === 'soon' || tab === 'all') return tab
  const filter = params.get('filter')
  if (filter === 'watched') return 'seen'
  if (filter === 'unwatched') return 'soon'
  return 'soon'
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState<ShelfSort>('date')
  const [ratingMovie, setRatingMovie] = useState<Movie | null>(null)
  const [hour, setHour] = useState<number | null>(null)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editGenre, setEditGenre] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editImagePreview, setEditImagePreview] = useState<string>('')
  const [editImageUrl, setEditImageUrl] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()
  const { t, language } = useLanguage()
  const currentUserId = user?.id || undefined

  // The active tab lives in the URL so it is shareable and survives reloads
  const tab = tabFromParams(searchParams)
  const filterType = tab === 'seen' ? 'watched' : tab === 'soon' ? 'unwatched' : 'all'
  const setTab = (next: ShelfTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('filter')
    params.set('tab', next)
    router.replace(`/dashboard?${params}`, { scroll: false })
  }

  // Greeting depends on the visitor's local time, so pick it after mount
  useEffect(() => {
    setHour(new Date().getHours())
  }, [])

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
    
    const filtered = userMovies.filter(movie => {
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
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'year':
          return (b.year || 0) - (a.year || 0)
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return sorted
  }, [movies, currentUserId, searchQuery, filterType, selectedGenre, selectedYear, sortBy])

  // Stats (only for current user's movies)
  const stats = useMemo(() => {
    const userMoviesList = movies.filter(m => m.userId === currentUserId)
    const total = userMoviesList.length
    const watched = userMoviesList.filter(m => m.watched).length
    const toWatch = total - watched
    const ratings = userMoviesList.filter(m => m.watched && m.rating).map(m => m.rating as number)
    const avgRating = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null

    return { total, watched, toWatch, avgRating }
  }, [movies, currentUserId])

  const hasFilters = !!(searchQuery || selectedGenre || selectedYear)
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre('')
    setSelectedYear('')
  }

  // On the Soon tab the first few movies get the wide "Up next" cards; the grid shows the rest
  const upNextMovies = tab === 'soon' ? filteredAndSortedMovies.slice(0, UP_NEXT_COUNT) : []
  const gridMovies = tab === 'soon' ? filteredAndSortedMovies.slice(UP_NEXT_COUNT) : filteredAndSortedMovies

  const greetingTemplate =
    hour === null
      ? null
      : hour >= 5 && hour < 12
      ? t.shelf.greetingMorning
      : hour >= 12 && hour < 18
      ? t.shelf.greetingAfternoon
      : t.shelf.greetingEvening

  const statsLine = [
    fill(t.shelf.statsSeen, { n: formatNumber(stats.watched, language) }),
    fill(t.shelf.statsSoon, { n: formatNumber(stats.toWatch, language) }),
    stats.avgRating !== null && fill(t.shelf.statsAvg, { x: formatNumber(stats.avgRating, language, 1) }),
  ].filter(Boolean).join(' · ')

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

  // Mark a Soon movie as seen together with its rating in a single update
  const handleMarkSeen = async (rating: number | undefined) => {
    if (!ratingMovie) return
    try {
      const updated = await updateMovie(ratingMovie.id, {
        watched: true,
        watchedAt: new Date().toISOString(),
        rating,
      })
      setMovies(updated)
      setRatingMovie(null)
    } catch (error) {
      console.error('Error marking movie as seen:', error)
      alert(error instanceof Error ? error.message : 'Failed to update movie')
    }
  }

  const closeEditModal = () => {
    setEditingMovie(null)
    setEditTitle('')
    setEditGenre('')
    setEditYear('')
    setEditNotes('')
    setEditImagePreview('')
    setEditImageUrl('')
  }


  const handleEditNotes = (movie: Movie) => {
    setEditingMovie(movie)
    setEditTitle(movie.title || '')
    setEditGenre(movie.genre || '')
    setEditYear(movie.year?.toString() || '')
    setEditNotes(movie.notes || '')
    setEditImageUrl(movie.imageUrl || movie.image || '')
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
    }
    reader.onerror = () => {
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveEditImage = () => {
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
          updates.imageUrl = finalImage || undefined
          updates.image = finalImage || undefined // keep backward compat
          updates.hasImage = !!finalImage
        }

        const updated = await updateMovie(editingMovie.id, updates)
        setMovies(updated)
        setEditingMovie(null)
        setEditTitle('')
        setEditGenre('')
        setEditYear('')
        setEditNotes('')
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

  const showSignInPrompt = !isAuthLoading && !isAuthenticated

  return (
    <MotionConfig reducedMotion="user">
    <div className={`${bodyFont.className} min-h-screen bg-[#0e0c0b] text-[#f2ebdd] overflow-x-clip`}>
      <ShelfNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddMovie={() => setShowAddMovieModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pt-8">
        {showSignInPrompt ? (
          <div className="py-24 text-center">
            <p className={`${editorialFont.className} text-2xl text-[#f2ebdd]/80`}>{t.shelf.signInPrompt}</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-[3px] bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
            >
              {t.shelf.goHome}
            </Link>
          </div>
        ) : (
          <>
            {/* Header: greeting + one line of stats */}
            <section className="mb-6">
              <h1 className={`${displayFont.className} truncate text-3xl uppercase leading-tight sm:text-4xl`}>
                {greetingTemplate && user ? fill(greetingTemplate, { name: user.name }) : '\u00a0'}
              </h1>
              <p className="mt-1 text-sm text-[#f2ebdd]/55">{isLoading ? '\u00a0' : statsLine}</p>
            </section>

            <ShelfTabs tab={tab} onTabChange={setTab} seenCount={stats.watched} soonCount={stats.toWatch} />

            <div className="mt-4 border-b border-[#f2ebdd]/10 pb-4">
              <ShelfFilterBar
                genres={genres}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                sortBy={sortBy}
                onSortChange={setSortBy}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
              />
            </div>

            {isLoading ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6" role="status">
                <span className="sr-only">{t.shelf.loading}</span>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-md bg-[#f2ebdd]/5 motion-safe:animate-pulse" />
                ))}
              </div>
            ) : filteredAndSortedMovies.length === 0 ? (
              /* Empty state for the current tab */
              <div className="py-20 text-center">
                <p className={`${editorialFont.className} text-2xl text-[#f2ebdd]/80`}>
                  {hasFilters ? t.shelf.noMatches : t.shelf.emptyTab}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMovieModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
                  >
                    <Plus size={16} />
                    {t.dashboard.addMovie}
                  </button>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-[#f2ebdd]/70 underline-offset-4 hover:text-[#f2ebdd] hover:underline"
                    >
                      {t.shelf.clearFilters}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Up next (Soon tab only) */}
                {upNextMovies.length > 0 && (
                  <section className="mt-6" aria-labelledby="up-next-title">
                    <div className="mb-3 flex items-baseline gap-3">
                      <h2 id="up-next-title" className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/60">
                        {t.shelf.upNext}
                      </h2>
                      <p className={`${editorialFont.className} truncate text-sm text-[#f2ebdd]/50`}>{t.shelf.upNextCaption}</p>
                    </div>
                    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
                      {upNextMovies.map(movie => (
                        <UpNextCard
                          key={movie.id}
                          movie={movie}
                          onOpen={() => handleEditNotes(movie)}
                          onMarkSeen={() => setRatingMovie(movie)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Poster grid */}
                {gridMovies.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
                    {gridMovies.map(movie => (
                      <PosterTile
                        key={movie.id}
                        movie={movie}
                        onOpen={() => handleEditNotes(movie)}
                        onMarkSeen={() => setRatingMovie(movie)}
                        onMarkSoon={() => handleToggleWatched(movie.id)}
                        onDelete={() => handleDelete(movie.id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Edit Movie Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="netflix-card rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Movie</h3>
              <button
                onClick={closeEditModal}
                aria-label={t.shelf.close}
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

              {/* Status and delete (the main way to do this on touch screens) */}
              <div className="flex flex-wrap gap-2 border-t border-[#262626] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const movie = editingMovie
                    closeEditModal()
                    if (movie.watched) handleToggleWatched(movie.id)
                    else setRatingMovie(movie)
                  }}
                  className="px-4 py-2 bg-[#181818] border border-[#262626] text-white rounded-lg text-sm font-semibold hover:bg-[#262626] transition-all"
                >
                  {editingMovie.watched ? t.shelf.markSoon : t.shelf.markSeen}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = editingMovie.id
                    closeEditModal()
                    handleDelete(id)
                  }}
                  className="px-4 py-2 border border-[#dc2626]/40 text-[#f87171] rounded-lg text-sm font-semibold hover:bg-[#dc2626]/10 transition-all"
                >
                  {t.common.delete}
                </button>
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
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 bg-[#181818] border border-[#262626] text-white rounded-lg font-semibold hover:bg-[#262626] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as seen + rating */}
      {ratingMovie && (
        <RateDialog movie={ratingMovie} onCancel={() => setRatingMovie(null)} onConfirm={handleMarkSeen} />
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
    </MotionConfig>
  )
}

function DashboardFallback() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-[#0e0c0b] flex items-center justify-center">
      <p className={`${editorialFont.className} text-xl text-[#f2ebdd]/70`}>{t.shelf.loading}</p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  )
}
