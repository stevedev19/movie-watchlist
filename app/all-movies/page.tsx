'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MotionConfig, motion } from 'motion/react'
import { Movie } from '@/types/movie'
import { loadMovies } from '@/app/lib/storage-mongodb'
import { useLanguage } from '../contexts/LanguageContext'
import ShelfNav from '../components/shelf/ShelfNav'
import ShelfTabs, { ShelfTab } from '../components/shelf/ShelfTabs'
import ShelfFilterBar, { ShelfSort } from '../components/shelf/ShelfFilterBar'
import { ReadOnlyPosterTile } from '../components/shelf/PosterTile'
import { fill, formatNumber } from '../components/shelf/shelfUtils'
import { bodyFont, displayFont, editorialFont } from '../fonts'

function tabFromParams(params: URLSearchParams): ShelfTab {
  const tab = params.get('tab')
  return tab === 'seen' || tab === 'soon' ? tab : 'all'
}

function AllMoviesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [sortBy, setSortBy] = useState<ShelfSort>('date')
  const [isLoading, setIsLoading] = useState(true)

  // Seen / Soon / All lives in the URL, like on the dashboard
  const tab = tabFromParams(searchParams)
  const filterType = tab === 'seen' ? 'watched' : tab === 'soon' ? 'unwatched' : 'all'
  const setTab = (next: ShelfTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`/all-movies?${params}`, { scroll: false })
  }

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
    const filtered = movies.filter(movie => {
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
  }, [movies, searchQuery, filterType, selectedGenre, selectedYear, selectedRating, sortBy])

  // Stats for all movies
  const stats = useMemo(() => {
    const total = movies.length
    const watched = movies.filter(m => m.watched).length
    return { total, watched, toWatch: total - watched }
  }, [movies])

  const hasFilters = !!(searchQuery || selectedGenre || selectedYear || selectedRating)
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre('')
    setSelectedYear('')
    setSelectedRating('')
  }

  const statsLine = [
    fill(t.library.statsFilms, { n: formatNumber(stats.total, language) }),
    fill(t.shelf.statsSeen, { n: formatNumber(stats.watched, language) }),
    fill(t.shelf.statsSoon, { n: formatNumber(stats.toWatch, language) }),
  ].join(' · ')

  return (
    <MotionConfig reducedMotion="user">
    <div className={`${bodyFont.className} min-h-screen bg-[#0e0c0b] text-[#f2ebdd] overflow-x-clip`}>
      <ShelfNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pt-8">
        <section className="mb-6">
          <h1 className={`${displayFont.className} text-3xl uppercase leading-tight sm:text-4xl`}>{t.library.title}</h1>
          <p className="mt-1 text-sm text-[#f2ebdd]/55">
            <span className={`${editorialFont.className} text-[#f2ebdd]/70`}>{t.library.caption}</span>
            {!isLoading && <> · {statsLine}</>}
          </p>
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
            minRating={selectedRating}
            onMinRatingChange={setSelectedRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6" role="status">
            <span className="sr-only">{t.library.loading}</span>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md bg-[#f2ebdd]/5 motion-safe:animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="py-20 text-center">
            <p className={`${editorialFont.className} text-2xl text-[#f2ebdd]/80`}>
              {movies.length === 0 ? t.library.emptyLibrary : hasFilters ? t.shelf.noMatches : t.shelf.emptyTab}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 text-sm text-[#f2ebdd]/70 underline-offset-4 hover:text-[#f2ebdd] hover:underline"
              >
                {t.shelf.clearFilters}
              </button>
            )}
          </div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-6"
          >
            {filteredAndSortedMovies.map(movie => (
              <ReadOnlyPosterTile key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
    </MotionConfig>
  )
}

function AllMoviesFallback() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-[#0e0c0b] flex items-center justify-center">
      <p className={`${editorialFont.className} text-xl text-[#f2ebdd]/70`}>{t.library.loading}</p>
    </div>
  )
}

export default function AllMoviesPage() {
  return (
    <Suspense fallback={<AllMoviesFallback />}>
      <AllMoviesContent />
    </Suspense>
  )
}
