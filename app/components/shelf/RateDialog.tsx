'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Star, X } from 'lucide-react'
import { Movie } from '@/types/movie'
import { displayFont, editorialFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'

interface RateDialogProps {
  movie: Movie
  onCancel: () => void
  onConfirm: (rating: number | undefined) => Promise<void>
}

// Shown when marking a Soon movie as seen: pick a rating (or skip), then save both at once
export default function RateDialog({ movie, onCancel, onConfirm }: RateDialogProps) {
  const { t } = useLanguage()
  const [rating, setRating] = useState<number | undefined>(movie.rating)
  const [isSaving, setIsSaving] = useState(false)
  const firstStarRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  // Focus the stars once on open; Escape closes
  useEffect(() => {
    firstStarRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const save = async (value: number | undefined) => {
    setIsSaving(true)
    try {
      await onConfirm(value)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-dialog-title"
        className="relative w-full max-w-sm rounded-[3px] bg-[#f2ebdd] p-6 text-[#1a1714]"
      >
        <span className="pointer-events-none absolute inset-2 border border-dashed border-[#1a1714]/25" aria-hidden="true" />
        <button
          type="button"
          onClick={onCancel}
          aria-label={t.shelf.close}
          className="absolute right-3 top-3 rounded p-1 text-[#1a1714]/60 transition-colors hover:text-[#1a1714]"
        >
          <X size={18} />
        </button>

        <h2 id="rate-dialog-title" className={`${displayFont.className} text-3xl uppercase leading-none`}>
          {t.shelf.rateTitle}
        </h2>
        <p className="mt-2 truncate pr-6 text-sm font-medium">{movie.title}</p>
        <p className={`${editorialFont.className} mt-1 text-sm text-[#1a1714]/70`}>{t.shelf.rateCaption}</p>

        <div className="mt-5 flex gap-1" role="radiogroup" aria-label={t.addMovie.yourRating}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              ref={value === 1 ? firstStarRef : undefined}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value}/5`}
              onClick={() => setRating(rating === value ? undefined : value)}
              className="rounded p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a1714]"
            >
              <Star
                size={28}
                className={rating && value <= rating ? 'fill-[#1a1714] text-[#1a1714]' : 'text-[#1a1714]/30'}
              />
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save(rating)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-[3px] bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {t.shelf.markSeen}
          </button>
          <button
            type="button"
            onClick={() => save(undefined)}
            disabled={isSaving}
            className="rounded-[3px] border border-[#1a1714]/30 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#1a1714]/5 disabled:opacity-60"
          >
            {t.shelf.rateSkip}
          </button>
        </div>
      </div>
    </div>
  )
}
