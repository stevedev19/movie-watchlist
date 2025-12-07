'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterType: 'all' | 'unwatched' | 'watched'
  onFilterChange: (type: 'all' | 'unwatched' | 'watched') => void
  selectedGenre: string
  onGenreChange: (genre: string) => void
  selectedYear: string
  onYearChange: (year: string) => void
  genres: string[]
  years: number[]
  onAddMovie?: () => void
  hideAuth?: boolean // Hide login/signup buttons (for dashboard)
  selectedUserId?: string
  onUserIdChange?: (userId: string) => void
  users?: Array<{ id: string; name: string }>
  selectedRating?: string
  onRatingChange?: (rating: string) => void
}

export default function Header({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  genres,
  years,
  onAddMovie,
  hideAuth = false,
  selectedUserId,
  onUserIdChange,
  users = [],
  selectedRating,
  onRatingChange,
}: HeaderProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuth()

  const handleAddMovieClick = () => {
    if (!isAuthenticated) {
      alert('Please login first to add a new movie')
      if (!hideAuth) {
        setShowLoginModal(true)
      } else {
        router.push('/')
      }
      return
    }
    onAddMovie?.()
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0F0F0F]/95 backdrop-blur-sm border-b border-[#262626] netflix-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16 gap-4">
          {/* Left: Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🎬</span>
            <h1 className="text-xl font-bold text-white">SeenAndSoon</h1>
          </button>

          {/* Middle: Search + Filters */}
          <div className="flex-1 flex items-center gap-3 max-w-3xl">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies..."
                className="w-full px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3]">🔍</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'unwatched' | 'watched')}
              className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="all">All</option>
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
            </select>

            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            {/* Filter by User */}
            {onUserIdChange && users.length > 0 && (
              <select
                value={selectedUserId || ''}
                onChange={(e) => onUserIdChange(e.target.value)}
                className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            )}

            {/* Filter by High Rating */}
            {onRatingChange && (
              <select
                value={selectedRating || ''}
                onChange={(e) => onRatingChange(e.target.value)}
                className="px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
              >
                <option value="">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                <option value="3">⭐⭐⭐ 3+ Stars</option>
              </select>
            )}
          </div>

          {/* Right: Auth */}
          {!hideAuth && (
            <div className="flex-shrink-0 flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {onAddMovie && (
                    <button
                      onClick={handleAddMovieClick}
                      className="px-4 py-2 netflix-red text-white rounded-lg text-sm font-semibold netflix-red-hover transition-all hidden md:block"
                    >
                      ➕ Add Movie
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg text-sm font-semibold hover:bg-[#7C3AED] transition-all hidden md:block"
                    >
                      👑 Admin
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#A3A3A3] hidden lg:block">Welcome,</span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1">
                      {isAdmin && <span className="text-yellow-400">👑</span>}
                      <span>{user?.name || 'User'}</span>
                      {isAdmin && <span className="text-xs text-yellow-400">(Admin)</span>}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors flex items-center gap-2"
                  >
                    <span>🔐</span>
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="px-4 py-2 netflix-red text-white rounded-lg text-sm font-semibold netflix-red-hover transition-colors flex items-center gap-2"
                  >
                    <span>✨</span>
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>
          )}
          {/* Show Add Movie button even when auth is hidden */}
          {hideAuth && onAddMovie && (
            <div className="flex-shrink-0">
              <button
                onClick={handleAddMovieClick}
                className="px-4 py-2 netflix-red text-white rounded-lg text-sm font-semibold netflix-red-hover transition-all"
              >
                ➕ Add Movie
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-14 gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">🎬</span>
            <h1 className="text-lg font-bold text-white">SeenAndSoon</h1>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 bg-[#181818] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
              />
            </div>
            {!hideAuth && (
              <>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-semibold hidden sm:block">
                    {isAdmin && <span className="text-yellow-400">👑</span>} {user?.name}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="px-2 py-1.5 bg-[#8B5CF6] text-white rounded text-xs font-semibold hover:bg-[#7C3AED] transition-all"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1.5 bg-[#181818] border border-[#262626] rounded text-white text-xs font-medium hover:border-[#E50914] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-3 py-1.5 bg-[#181818] border border-[#262626] rounded text-white text-xs font-medium flex items-center gap-1"
                    >
                      <span>🔐</span>
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="px-3 py-1.5 netflix-red text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <span>✨</span>
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-10 h-10 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#262626] bg-[#181818] p-4 space-y-3 animate-slide-up">
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'unwatched' | 'watched')}
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="all">All</option>
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
            </select>

            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            {/* Filter by User (Mobile) */}
            {onUserIdChange && users.length > 0 && (
              <select
                value={selectedUserId || ''}
                onChange={(e) => onUserIdChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            )}

            {/* Filter by High Rating (Mobile) */}
            {onRatingChange && (
              <select
                value={selectedRating || ''}
                onChange={(e) => onRatingChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
              >
                <option value="">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                <option value="3">⭐⭐⭐ 3+ Stars</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Auth Modals - Only show if auth is not hidden */}
      {!hideAuth && (
        <>
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
        </>
      )}
    </header>
  )
}

