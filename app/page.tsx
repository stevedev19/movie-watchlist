'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

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
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎬</span>
            <h1 className="text-2xl font-bold text-white">MyWatchlist</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-[#A3A3A3] hidden sm:block">Welcome, {user?.name}</span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all"
                >
                  Go to Dashboard
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 animate-slide-up">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Track Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-[#3B82F6]">
                Movie Journey
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-[#A3A3A3] mb-8 leading-relaxed">
              Never forget a movie you want to watch. Organize your watchlist, 
              rate what you've seen, and discover your next favorite film.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 netflix-red text-white rounded-lg font-bold text-lg netflix-red-hover transition-all transform hover:scale-105 shadow-lg shadow-[#E50914]/20"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-[#181818] border-2 border-[#262626] text-white rounded-lg font-bold text-lg hover:border-[#E50914] transition-all transform hover:scale-105"
              >
                Sign In
              </button>
            )}
          </div>

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
    </div>
  )
}
