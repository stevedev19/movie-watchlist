'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import AddMovieModal from './components/AddMovieModal'
import MovieCard from './components/MovieCard'
import SectionRow from './components/SectionRow'
import { useState, useEffect, useMemo } from 'react'
import { motion as framerMotion } from 'framer-motion'
import { LayoutGroup, motion } from 'motion/react'
import { TextRotate } from '@/components/ui/text-rotate'
import { Plus } from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import { Movie } from '@/types/movie'
import { loadMovies } from '@/app/lib/storage-mongodb'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { t, language } = useLanguage()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)

  // Load movies on mount - always fetch all movies for recommended section
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true)
      try {
        // Pass true to loadMovies to fetch all movies (without credentials)
        const loaded = await loadMovies(true)
        setMovies(loaded)
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        setIsLoadingMovies(false)
      }
    }
    fetchMovies()
  }, [])

  // Get highly rated movies (watched movies with rating >= 4)
  const recommendedMovies = useMemo(() => {
    return movies
      .filter(movie => movie.watched && movie.rating && movie.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10) // Top 10 highly rated movies
  }, [movies])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setShowSignupModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F]"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E50914] opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">🎬</span>
            <h1 className="text-2xl font-bold text-white">SeenAndSoon</h1>
          </button>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
                  >
                    My Movies List
                  </button>
                    <button
                      onClick={() => router.push('/dashboard?filter=watched')}
                      className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#10B981] transition-colors"
                    >
                      My Watched Movies
                    </button>
                  <span className="text-sm text-[#A3A3A3] hidden lg:block">
                    Welcome, {isAdmin && <span className="text-yellow-400">👑</span>} {user?.name}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all"
                >
                  Dashboard
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg font-semibold hover:bg-[#7C3AED] transition-all"
                  >
                    👑 Admin
                  </button>
                )}
                <button
                  onClick={async () => {
                    await logout()
                    router.push('/')
                  }}
                  className="px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-4 py-2 netflix-red text-white rounded-lg text-sm font-semibold netflix-red-hover transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Netflix Style */}
      <section className="relative z-10 min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Spotlight Effect */}
        <div className="hero-glow absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pointer-events-none">
          {/* Horizontal glowing bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm"></div>
          {/* Vertical light cone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-96 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
          <framerMotion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Eyebrow Text */}
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#A3A3A3] mb-6 font-medium">
              {t.home.eyebrow}
            </p>

            {/* Main Title */}
            <div className="mb-6">
              <LayoutGroup>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-2">
                  <span className="text-slate-300">{t.home.title} </span>
                  <TextRotate
                    texts={language === 'en' 
                      ? ["Favorites", "Watchlist", "Movie Journey", "Movies"]
                      : language === 'uz'
                      ? ["Sevimlilar", "Ro'yxat", "Film Safari", "Filmlar"]
                      : ["즐겨찾기", "시청 목록", "영화 여정", "영화"]
                    }
                    mainClassName="inline-block font-bold bg-gradient-to-r from-[#E50914] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={3000}
                  />
                </h1>
              </LayoutGroup>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-[#A3A3A3] max-w-[500px] mx-auto mb-10 leading-relaxed">
              {t.home.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowAddMovieModal(true)}
                    className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 netflix-red text-white rounded-full font-semibold text-sm sm:text-base netflix-red-hover transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E50914]/30"
                  >
                    <Plus size={18} />
                    <span>{t.home.addNewMovie}</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard?filter=watched')}
                    className="group flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#181818] border border-[#262626] text-white rounded-full font-medium text-sm sm:text-base hover:border-[#10B981] hover:bg-[#1a1a1a] transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="text-base">✅</span>
                    <span>{t.home.watchedMovies}</span>
                  </button>
                  <button
                    onClick={() => router.push('/all-movies')}
                    className="group flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-transparent border border-[#262626] text-white rounded-full font-medium text-sm sm:text-base hover:border-white/50 hover:bg-white/5 transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="text-base">🎬</span>
                    <span>{t.home.viewAllMovies}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      alert('Please login first to add a new movie')
                      setShowLoginModal(true)
                    }}
                    className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 netflix-red text-white rounded-full font-semibold text-sm sm:text-base netflix-red-hover transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E50914]/30"
                  >
                    <Plus size={18} />
                    <span>{t.home.addNewMovie}</span>
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="group flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#181818] border border-[#262626] text-white rounded-full font-medium text-sm sm:text-base hover:border-[#10B981] hover:bg-[#1a1a1a] transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="text-base">✅</span>
                    <span>{t.home.getStarted}</span>
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="group flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-transparent border border-[#262626] text-white rounded-full font-medium text-sm sm:text-base hover:border-white/50 hover:bg-white/5 transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="text-base">🎬</span>
                    <span>{t.home.signIn}</span>
                  </button>
                </>
              )}
            </div>

            {/* Stats Strip */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#181818]/60 border border-[#262626]/50 backdrop-blur-sm text-xs sm:text-sm text-[#A3A3A3]">
              <span>🎞️ {movies.length} {t.home.statsMoviesSaved}</span>
              <span className="text-[#262626]">·</span>
              <span>✅ {movies.filter(m => m.watched).length} {t.home.statsWatched}</span>
              <span className="text-[#262626]">·</span>
              <span>🕒 {t.home.statsLastUpdated} {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </framerMotion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center max-w-4xl mx-auto">

          {/* Recommended Movies Section */}
          {!isLoadingMovies && recommendedMovies.length > 0 && (
            <div className="mt-20 mb-20 w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                {t.home.recommendedMovies}
              </h2>
              <p className="text-[#A3A3A3] text-center mb-8 max-w-2xl mx-auto">
                {t.home.recommendedDescription}
              </p>
              <SectionRow title="" horizontal>
                {recommendedMovies.map(movie => (
                  <div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[200px]">
                    <MovieCard
                      movie={movie}
                      onToggleWatched={() => {
                        // Navigate to dashboard if user wants to toggle
                        router.push('/dashboard')
                      }}
                      onDelete={() => {
                        // Navigate to dashboard if user wants to delete
                        router.push('/dashboard')
                      }}
                      onUpdateRating={(rating) => {
                        // Navigate to dashboard if user wants to rate
                        router.push('/dashboard')
                      }}
                      currentUserId={user?.id || undefined}
                      isOwner={!!(user && movie.userId && user.id === movie.userId)}
                    />
                  </div>
                ))}
              </SectionRow>
            </div>
          )}

          {!isLoadingMovies && recommendedMovies.length === 0 && (
            <div className="mt-20 mb-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t.home.recommendedMovies}
              </h2>
              <p className="text-[#A3A3A3]">
                {t.home.noRecommendedMovies}
              </p>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="netflix-card rounded-lg p-6 netflix-glow hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Create Watchlists</h3>
              <p className="text-[#A3A3A3]">
                Add movies you want to watch and organize them by genre, year, or rating.
              </p>
            </div>

            <div className="netflix-card rounded-lg p-6 netflix-glow hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
              <p className="text-[#A3A3A3]">
                Mark movies as watched, rate them, and add personal notes to remember your thoughts.
              </p>
            </div>

            <div className="netflix-card rounded-lg p-6 netflix-glow hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
              <p className="text-[#A3A3A3]">
                Find movies quickly with powerful filters and search functionality.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">∞</div>
              <div className="text-sm text-[#A3A3A3]">Movies to Track</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-[#A3A3A3]">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">⚡</div>
              <div className="text-sm text-[#A3A3A3]">Lightning Fast</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">🔒</div>
              <div className="text-sm text-[#A3A3A3]">Secure & Private</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#262626] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl">🎬</span>
              <span className="text-white font-semibold">SeenAndSoon</span>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              © {new Date().getFullYear()} SeenAndSoon. Track your movies, your way.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false)
            setShowSignupModal(true)
          }}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false)
            setShowLoginModal(true)
          }}
        />
      )}

      {showAddMovieModal && (
        <AddMovieModal
          onClose={() => setShowAddMovieModal(false)}
          onSuccess={() => {
            // Optionally refresh or redirect
            router.push('/dashboard')
          }}
        />
      )}
    </div>
  )
}
