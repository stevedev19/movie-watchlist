'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import LoginModal from './components/LoginModal'
import SignupModal from './components/SignupModal'
import RecommendedMoviesSlider from './components/RecommendedMoviesSlider'
import HeroPosterStack from './components/HeroPosterStack'
import MarqueeBoard from './components/landing/MarqueeBoard'
import TicketStubs from './components/landing/TicketStubs'
import CreditsRoll from './components/landing/CreditsRoll'
import LanguageCards from './components/landing/LanguageCards'
import TheEnd from './components/landing/TheEnd'
import { Hairline, ReelHeader } from './components/landing/ReelHeader'
import { MOTION_REDUCED, ScrollTrigger } from './components/landing/gsap'
import { useState, useEffect, useMemo, MouseEvent } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowRight, Clapperboard, Crown, Github } from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import { Movie } from '@/types/movie'
import { loadMovies } from '@/app/lib/storage-mongodb'
import { bodyFont, displayFont } from './fonts'

const GITHUB_URL = 'https://github.com/stevedev19/movie-watchlist'

// Grayscale fractal noise tile, layered over the background as film grain
const FILM_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { t } = useLanguage()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
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

  // Carousel and web fonts change the page height; re-measure scroll-triggered animations
  useEffect(() => {
    if (!isLoadingMovies) ScrollTrigger.refresh()
  }, [isLoadingMovies, recommendedMovies.length])

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  const scrollToHowItWorks = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const reduceMotion = window.matchMedia(MOTION_REDUCED).matches
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const ctaLabel = isAuthenticated ? t.home.heroCtaSignedIn : t.home.heroCta

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setShowSignupModal(true)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className={`${bodyFont.className} min-h-screen bg-[#0e0c0b] relative overflow-x-clip`}>
      {/* Film grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: FILM_GRAIN }}
        aria-hidden="true"
      ></div>

      {/* Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Clapperboard size={24} className="text-[#f2ebdd] shrink-0" strokeWidth={1.75} />
            <span className="text-lg sm:text-2xl font-bold text-[#f2ebdd] max-[399px]:sr-only">SeenAndSoon</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-3 sm:px-4 py-2 whitespace-nowrap bg-[#dc2626] text-white rounded-lg text-sm font-semibold hover:bg-[#b91c1c] transition-colors"
                >
                  {t.library.navShelf}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-1.5 px-1 sm:px-2 py-2 whitespace-nowrap text-sm font-medium text-[#d4d4d8] hover:text-white transition-colors"
                  >
                    <Crown size={15} />
                    <span className="max-[399px]:sr-only">{t.shelf.admin}</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    await logout()
                    router.push('/')
                  }}
                  className="px-1 sm:px-2 py-2 whitespace-nowrap text-sm font-medium text-[#d4d4d8] hover:text-white transition-colors"
                >
                  {t.common.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-1 sm:px-2 py-2 whitespace-nowrap text-sm font-medium text-[#d4d4d8] hover:text-white transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-3 sm:px-4 py-2 whitespace-nowrap bg-[#dc2626] text-white rounded-lg text-sm font-semibold hover:bg-[#b91c1c] transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero: marquee board + fanned posters */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-16 lg:pb-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 text-left"
          >
            <MarqueeBoard>
              <h1 className={`${displayFont.className} text-[#f2ebdd] uppercase text-[2.5rem] sm:text-6xl lg:text-[3.5rem] xl:text-[4.25rem] leading-[1.02]`}>
                <span className="block">{t.home.heroTitleSeen}</span>
                <span className="block">{t.home.heroTitleSoon}</span>
              </h1>
            </MarqueeBoard>

            <p className="mt-7 max-w-[42ch] text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
              {t.home.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#dc2626] text-white rounded-[3px] font-semibold text-sm hover:bg-[#b91c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ebdd] transition-colors"
              >
                {ctaLabel}
                <ArrowRight size={16} />
              </button>
              <a
                href="#how-it-works"
                onClick={scrollToHowItWorks}
                className="text-sm font-medium text-[#d4d4d8] underline-offset-4 hover:text-white hover:underline transition-colors"
              >
                {t.home.heroHowItWorks}
              </a>
            </div>
          </motion.div>

          <HeroPosterStack />
        </div>
      </section>

      <Hairline />

      {/* Reel 01: Now showing */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <ReelHeader
          number="01"
          label={t.landing.reelNowShowing}
          title={t.landing.nowShowingTitle}
          caption={t.landing.nowShowingCaption}
          align="center"
        />
        <div className="mx-auto mt-10 max-w-4xl text-center">
          {!isLoadingMovies && recommendedMovies.length > 0 && (
            <RecommendedMoviesSlider
              movies={recommendedMovies}
              onToggleWatched={() => router.push('/dashboard')}
              onDelete={() => router.push('/dashboard')}
              onUpdateRating={() => router.push('/dashboard')}
              currentUserId={user?.id || undefined}
            />
          )}
          {!isLoadingMovies && recommendedMovies.length === 0 && (
            <p className="text-[#a1a1aa]">{t.home.noRecommendedMovies}</p>
          )}
        </div>
      </section>

      <Hairline />

      {/* Reel 02: Seen / Soon */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <ReelHeader
          number="02"
          label={t.landing.reelSeenSoon}
          title={t.landing.seenSoonTitle}
          caption={t.landing.seenSoonCaption}
        />
        <div className="mx-auto mt-12 max-w-5xl sm:mt-14">
          <TicketStubs />
        </div>
      </section>

      <Hairline />

      {/* Reel 03: How it works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 scroll-mt-4">
        <ReelHeader
          number="03"
          label={t.landing.reelHowItWorks}
          title={t.landing.howTitle}
          caption={t.landing.howCaption}
          align="center"
        />
        <div className="mt-12 sm:mt-14">
          <CreditsRoll />
        </div>
      </section>

      <Hairline />

      {/* Reel 04: In three languages */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <ReelHeader
          number="04"
          label={t.landing.reelLanguages}
          title={t.landing.languagesTitle}
          caption={t.landing.languagesCaption}
        />
        <div className="mx-auto mt-12 max-w-5xl sm:mt-14">
          <LanguageCards />
        </div>
      </section>

      <TheEnd ctaLabel={ctaLabel} onCta={handleGetStarted} />

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#f2ebdd]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Clapperboard size={20} className="text-[#f2ebdd]" strokeWidth={1.75} />
              <span className="text-[#f2ebdd] font-semibold">SeenAndSoon</span>
            </div>
            <div className="flex items-center gap-5">
              <LanguageSwitcher />
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#f2ebdd]/70 hover:text-[#f2ebdd] transition-colors"
              >
                <Github size={16} />
                {t.landing.footerGithub}
              </a>
            </div>
          </div>
          <p className="mt-8 max-w-xl text-xs leading-relaxed text-[#f2ebdd]/45">{t.landing.footerTmdb}</p>
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
    </MotionConfig>
  )
}
