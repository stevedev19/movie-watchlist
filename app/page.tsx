'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import AddMovieModal from './components/AddMovieModal'
import MovieCard from './components/MovieCard'
import SectionRow from './components/SectionRow'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LampContainer } from '@/components/ui/lamp'
import { Movie } from '@/types/movie'
import { loadMovies } from '@/app/lib/storage-mongodb'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)

  // Load movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true)
      try {
        const loaded = await loadMovies()
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
            <h1 className="text-2xl font-bold text-white">MyWatchlist</h1>
          </button>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
                  >
                    Movies List
                  </button>
                  <button
                    onClick={() => router.push('/dashboard?filter=watched')}
                    className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#10B981] transition-colors"
                  >
                    Watched Movies
                  </button>
                  <span className="text-sm text-[#A3A3A3] hidden lg:block">Welcome, {user?.name}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all"
                >
                  Dashboard
                </button>
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

      {/* Hero Section with Lamp Effect */}
      <div className="relative -mt-20">
        <LampContainer className="min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-center"
          >
            <h2 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl mb-6">
              Track Your
              <br />
              <span className="bg-gradient-to-br from-[#E50914] to-[#3B82F6] bg-clip-text text-transparent">
                Movie Journey
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto px-4">
              Never forget a movie you want to watch. Organize your watchlist, 
              rate what you've seen, and discover your next favorite film.
            </p>
          </motion.div>
        </LampContainer>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center max-w-4xl mx-auto">

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowAddMovieModal(true)}
                  className="px-8 py-4 netflix-red text-white rounded-lg font-bold text-lg netflix-red-hover transition-all transform hover:scale-105 shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Add New Movie</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard?filter=watched')}
                  className="px-8 py-4 bg-[#10B981] text-white rounded-lg font-bold text-lg hover:bg-[#059669] transition-all transform hover:scale-105 shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>Watched Movies</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-4 bg-[#181818] border-2 border-[#262626] text-white rounded-lg font-bold text-lg hover:border-[#E50914] transition-all transform hover:scale-105"
                >
                  View All Movies
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    alert('Please login first to add a new movie')
                    setShowLoginModal(true)
                  }}
                  className="px-8 py-4 netflix-red text-white rounded-lg font-bold text-lg netflix-red-hover transition-all transform hover:scale-105 shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Add New Movie</span>
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 netflix-red text-white rounded-lg font-bold text-lg netflix-red-hover transition-all transform hover:scale-105 shadow-lg shadow-[#E50914]/20"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-8 py-4 bg-[#181818] border-2 border-[#262626] text-white rounded-lg font-bold text-lg hover:border-[#E50914] transition-all transform hover:scale-105"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Recommended Movies Section */}
          {!isLoadingMovies && recommendedMovies.length > 0 && (
            <div className="mt-20 mb-20 w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                ⭐ Recommended Movies
              </h2>
              <p className="text-[#A3A3A3] text-center mb-8 max-w-2xl mx-auto">
                Discover the highest-rated movies from our community. These are the top picks that users have watched and loved.
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
                      currentUserId={user?.id || user?.userId || undefined}
                      isOwner={user && movie.userId && (user.id || user.userId) === movie.userId}
                    />
                  </div>
                ))}
              </SectionRow>
            </div>
          )}

          {!isLoadingMovies && recommendedMovies.length === 0 && (
            <div className="mt-20 mb-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ⭐ Recommended Movies
              </h2>
              <p className="text-[#A3A3A3]">
                No highly rated movies yet. Be the first to rate a movie 4+ stars!
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
              <span className="text-white font-semibold">MyWatchlist</span>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              © {new Date().getFullYear()} MyWatchlist. Track your movies, your way.
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
