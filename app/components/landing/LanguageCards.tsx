'use client'

import { Star } from 'lucide-react'
import translations, { Language } from '@/app/lib/translations'
import { displayFont } from '@/app/fonts'

const POSTER = 'https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'
const RATING = 4

// Dates are written out per locale: Intl's Uzbek output differs between Node and browsers,
// which breaks hydration
const languages: { code: Language; name: string; watchedOn: string }[] = [
  { code: 'en', name: 'English', watchedOn: 'Mar 14, 2026' },
  { code: 'uz', name: "O'zbekcha", watchedOn: '14.03.2026' },
  { code: 'ko', name: '한국어', watchedOn: '2026. 3. 14.' },
]

// The same movie card three times, with UI labels taken from each locale's translations
export default function LanguageCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-8">
      {languages.map(({ code, name, watchedOn }) => {
        const tr = translations[code]
        return (
          <figure key={code} lang={code} className="overflow-hidden rounded-[3px] bg-[#f2ebdd] text-[#1a1714] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.9)]">
            <div className="flex justify-between border-b border-dashed border-[#1a1714]/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1714]/60">
              <span>{code}</span>
              <span>{name}</span>
            </div>
            <div className="flex sm:block">
              <div className="relative w-28 flex-none sm:w-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={POSTER} alt="" className="aspect-[2/3] w-full object-cover" loading="lazy" />
                <span className="absolute left-2 top-2 rounded-sm bg-[#1a1714] px-1.5 py-0.5 text-[10px] font-semibold text-[#f2ebdd] sm:text-[11px]">
                  {tr.movieCard.watched}
                </span>
              </div>
              <figcaption className="min-w-0 flex-1 p-3 sm:p-4">
                <p className={`${displayFont.className} text-lg uppercase leading-tight sm:text-xl`}>Spirited Away</p>
                <p className="mt-0.5 text-xs text-[#1a1714]/60">
                  2001 · {tr.addMovie.runtime.replace('{h}', '2').replace('{m}', '5')}
                </p>
                <p className="mt-2 text-xs text-[#1a1714]/80">
                  {tr.movieCard.watchedOn} {watchedOn}
                </p>
                <div className="mt-2 flex gap-0.5" role="img" aria-label={`${RATING}/5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < RATING ? 'fill-[#1a1714] text-[#1a1714]' : 'text-[#1a1714]/30'}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="rounded-sm border border-[#1a1714]/30 px-2 py-1">{tr.movieCard.unwatch}</span>
                  <span className="rounded-sm border border-[#1a1714]/30 px-2 py-1">{tr.common.edit}</span>
                </div>
              </figcaption>
            </div>
          </figure>
        )
      })}
    </div>
  )
}
