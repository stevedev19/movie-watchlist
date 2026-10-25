'use client'

import { Check, Film } from 'lucide-react'
import { Movie } from '@/types/movie'
import { displayFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { backdropSrc, formatRuntime } from './shelfUtils'

interface UpNextCardProps {
  movie: Movie
  onOpen: () => void
  onMarkSeen: () => void
}

// Wide card for the first few Soon movies: backdrop (or poster), title, year, runtime
export default function UpNextCard({ movie, onOpen, onMarkSeen }: UpNextCardProps) {
  const { t } = useLanguage()
  const src = backdropSrc(movie)
  const meta = [
    movie.year,
    movie.runtime && formatRuntime(movie.runtime, t.addMovie.runtime, t.addMovie.runtimeMinutes),
  ].filter(Boolean)

  return (
    <article className="flex w-[80%] flex-none snap-start flex-col overflow-hidden rounded-md border border-[#f2ebdd]/10 bg-[#151210] sm:w-auto">
      <button
        type="button"
        onClick={onOpen}
        aria-label={movie.title}
        className="relative block aspect-video w-full overflow-hidden bg-[#1a1714] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#f2ebdd]"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover ${movie.backdropPath ? '' : 'object-[50%_25%]'}`}
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Film size={24} className="text-[#f2ebdd]/30" />
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="min-w-0">
          <h3 className={`${displayFont.className} truncate text-lg uppercase leading-tight text-[#f2ebdd]`}>{movie.title}</h3>
          {meta.length > 0 && <p className="mt-0.5 text-xs text-[#f2ebdd]/55">{meta.join(' · ')}</p>}
        </div>
        <button
          type="button"
          onClick={onMarkSeen}
          className="mt-auto inline-flex items-center justify-center gap-1.5 self-start rounded-[3px] border border-[#f2ebdd]/30 px-3 py-1.5 text-xs font-semibold text-[#f2ebdd] transition-colors hover:bg-[#f2ebdd] hover:text-[#1a1714]"
        >
          <Check size={14} />
          {t.shelf.markSeen}
        </button>
      </div>
    </article>
  )
}
