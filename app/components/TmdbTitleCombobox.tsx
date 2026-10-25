'use client'

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { Film, Loader2, Search } from 'lucide-react'
import type { TmdbSearchResult } from '@/app/lib/tmdb'
import { useLanguage } from '../contexts/LanguageContext'

const TMDB_THUMB = 'https://image.tmdb.org/t/p/w92'

interface TmdbTitleComboboxProps {
  id: string
  value: string
  onChange: (value: string) => void
  onSelect: (result: TmdbSearchResult) => void
  className?: string
}

type SearchStatus = 'idle' | 'loading' | 'done' | 'error'

export default function TmdbTitleCombobox({ id, value, onChange, onSelect, className }: TmdbTitleComboboxProps) {
  const { t, language } = useLanguage()
  const listboxId = useId()
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Title filled in by a pick; it shouldn't trigger another search
  const pickedTitleRef = useRef<string | null>(null)

  // Debounced search (300ms, 2+ characters); stale requests are aborted
  useEffect(() => {
    if (pickedTitleRef.current !== null && value === pickedTitleRef.current) return
    pickedTitleRef.current = null

    const query = value.trim()
    if (query.length < 2) {
      setResults([])
      setStatus('idle')
      setIsOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setStatus('loading')
      setIsOpen(true)
      try {
        const response = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(query)}&lang=${language}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error(`Search failed: ${response.status}`)
        const data = await response.json()
        setResults(data.results || [])
        setActiveIndex(-1)
        setStatus('done')
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('[TmdbTitleCombobox] Search error:', error)
        setResults([])
        setStatus('error')
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value, language])

  // Keep the highlighted option visible while using the arrow keys
  useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`${listboxId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, listboxId])

  const pick = (result: TmdbSearchResult) => {
    pickedTitleRef.current = result.title
    setIsOpen(false)
    setActiveIndex(-1)
    onSelect(result)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault()
        setIsOpen(true)
        setActiveIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (results.length) setActiveIndex((i) => (i + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (results.length) setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1))
        break
      case 'Enter':
        // Pick the highlighted result instead of submitting the form
        if (activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault()
          pick(results[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const showResults = results.length > 0 && status !== 'error'

  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0 && status === 'done') setIsOpen(true)
        }}
        onBlur={() => setIsOpen(false)}
        className={className}
        placeholder={t.addMovie.searchPlaceholder}
        autoComplete="off"
        required
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen && showResults ? listboxId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
      />
      {status === 'loading' && (
        <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#A3A3A3]" />
      )}

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#262626] bg-[#141414] shadow-2xl">
          {status === 'loading' && !showResults && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-[#A3A3A3]" role="status">
              <Loader2 size={14} className="animate-spin" />
              {t.addMovie.searching}
            </div>
          )}
          {status === 'done' && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-[#A3A3A3]" role="status">
              {t.addMovie.noResults}
            </div>
          )}
          {status === 'error' && (
            <div className="px-4 py-3 text-sm text-[#A3A3A3]" role="status">
              {t.addMovie.searchError}
            </div>
          )}
          {showResults && (
            <ul id={listboxId} role="listbox" className="max-h-80 overflow-y-auto py-1">
              {results.map((result, i) => (
                <li
                  key={result.id}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  // Keep focus in the input so blur doesn't close the list before the click lands
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(result)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                    i === activeIndex ? 'bg-[#262626]' : ''
                  }`}
                >
                  {result.posterPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${TMDB_THUMB}${result.posterPath}`}
                      alt=""
                      className="h-12 w-8 flex-none rounded bg-[#262626] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-8 flex-none items-center justify-center rounded bg-[#262626]">
                      <Film size={14} className="text-[#737373]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{result.title}</div>
                    <div className="text-xs text-[#A3A3A3]">{result.year ?? '—'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-[#262626] px-3 py-1.5 text-[11px] text-[#737373]">
            {t.addMovie.tmdbAttribution}
          </div>
        </div>
      )}
    </div>
  )
}
