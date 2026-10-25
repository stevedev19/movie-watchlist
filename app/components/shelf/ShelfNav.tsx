'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Clapperboard, Crown, Library, LogOut, Plus, Search, Ticket } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher'
import LoginModal from '../LoginModal'
import SignupModal from '../SignupModal'
import { fill, formatDate } from './shelfUtils'

interface ShelfNavProps {
  // Search and Add Movie are shown only on pages that pass them
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onAddMovie?: () => void
}

export default function ShelfNav({ searchQuery, onSearchChange, onAddMovie }: ShelfNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { user, isAdmin, isLoading: isAuthLoading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const links = [
    ...(user ? [{ href: '/dashboard', label: t.library.navShelf, icon: Ticket }] : []),
    { href: '/all-movies', label: t.library.navAllMovies, icon: Library },
  ]
  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?'
  const menuItem =
    'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#f2ebdd] transition-colors hover:bg-[#f2ebdd]/10'

  return (
    <header className="sticky top-0 z-40 border-b border-[#f2ebdd]/10 bg-[#0e0c0b]/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[#f2ebdd] transition-opacity hover:opacity-80">
          <Clapperboard size={22} strokeWidth={1.75} />
          <span className="hidden font-bold sm:inline">SeenAndSoon</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`whitespace-nowrap text-sm transition-colors ${
                pathname === href ? 'text-[#f2ebdd] underline decoration-[#dc2626] decoration-2 underline-offset-[6px]' : 'text-[#f2ebdd]/60 hover:text-[#f2ebdd]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {onSearchChange ? (
          <div className="relative mx-auto min-w-0 flex-1 sm:max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#f2ebdd]/40" />
            <input
              type="search"
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              aria-label={t.common.search}
              className="h-9 w-full rounded-md border border-[#f2ebdd]/15 bg-[#151210] pl-9 pr-3 text-sm text-[#f2ebdd] placeholder-[#f2ebdd]/40 transition-colors focus:border-[#f2ebdd]/50 focus:outline-none"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <LanguageSwitcher />

        {onAddMovie && user && (
          <button
            type="button"
            onClick={onAddMovie}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#dc2626] px-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] sm:px-3.5"
          >
            <Plus size={16} />
            <span className="sr-only sm:not-sr-only">{t.dashboard.addMovie}</span>
          </button>
        )}

        {!user && !isAuthLoading && (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setAuthModal('login')}
              className="whitespace-nowrap px-1.5 py-2 text-sm font-medium text-[#f2ebdd]/80 transition-colors hover:text-[#f2ebdd]"
            >
              {t.common.login}
            </button>
            <button
              type="button"
              onClick={() => setAuthModal('signup')}
              className="h-9 whitespace-nowrap rounded-md bg-[#dc2626] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
            >
              {t.common.signup}
            </button>
          </div>
        )}

        {user && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t.shelf.accountMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ebdd] text-sm font-bold text-[#1a1714] transition-shadow hover:ring-2 hover:ring-[#f2ebdd]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ebdd]"
            >
              {initial}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-md border border-[#f2ebdd]/15 bg-[#151210] shadow-xl"
              >
                {/* Profile summary (there is no separate profile page) */}
                <div className="border-b border-[#f2ebdd]/10 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2ebdd]/50">{t.shelf.profile}</p>
                  <p className="mt-1 truncate font-semibold text-[#f2ebdd]">{user.name}</p>
                  {user.createdAt && (
                    <p className="mt-0.5 text-xs text-[#f2ebdd]/55">
                      {fill(t.shelf.memberSince, { date: formatDate(user.createdAt, language) })}
                    </p>
                  )}
                </div>
                {/* Page links live here on small screens */}
                <div className="border-b border-[#f2ebdd]/10 md:hidden">
                  {links.map(({ href, label, icon: Icon }) => (
                    <button key={href} type="button" role="menuitem" onClick={() => router.push(href)} className={menuItem}>
                      <Icon size={15} className="text-[#f2ebdd]/70" />
                      {label}
                    </button>
                  ))}
                </div>
                {isAdmin && (
                  <button type="button" role="menuitem" onClick={() => router.push('/admin')} className={menuItem}>
                    <Crown size={15} className="text-[#f2ebdd]/70" />
                    {t.shelf.admin}
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setMenuOpen(false)
                    await logout()
                    router.push('/')
                  }}
                  className={menuItem}
                >
                  <LogOut size={15} className="text-[#f2ebdd]/70" />
                  {t.common.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {authModal === 'login' && (
        <LoginModal onClose={() => setAuthModal(null)} onSwitchToSignup={() => setAuthModal('signup')} />
      )}
      {authModal === 'signup' && (
        <SignupModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} />
      )}
    </header>
  )
}
