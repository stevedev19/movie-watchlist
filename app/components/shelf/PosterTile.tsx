'use client'

import { MouseEvent, ReactNode } from 'react'
import { Check, Clock, Film, Pencil, Trash2 } from 'lucide-react'
import { Movie } from '@/types/movie'
import { displayFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { fill, posterSrc } from './shelfUtils'

interface PosterTileProps {
  movie: Movie
  onOpen: () => void
  onMarkSeen: () => void
  onMarkSoon: () => void
  onDelete: () => void
}

// Browse-only tile (other people's movies): poster, stamp, and a caption with who added it
export function ReadOnlyPosterTile({ movie }: { movie: Movie }) {
  const { t } = useLanguage()
  const src = posterSrc(movie)

  return (
    <figure>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#1a1714] ring-1 ring-[#f2ebdd]/10">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
            <Film size={22} className="text-[#f2ebdd]/30" />
          </span>
        )}
        <div className="absolute left-2 top-2">
          <ShelfStamp movie={movie} />
        </div>
      </div>
      <figcaption className="mt-1.5 min-w-0">
        <p className="truncate text-xs font-medium text-[#f2ebdd] sm:text-sm">{movie.title}</p>
        <p className="truncate text-[11px] text-[#f2ebdd]/50 sm:text-xs">
          {[movie.year, movie.userName && fill(t.library.addedBy, { name: movie.userName })].filter(Boolean).join(' · ')}
        </p>
      </figcaption>
    </figure>
  )
}

function QuickAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e: MouseEvent) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f2ebdd]/30 text-[#f2ebdd] transition-colors hover:bg-[#f2ebdd] hover:text-[#1a1714] focus-visible:bg-[#f2ebdd] focus-visible:text-[#1a1714] focus-visible:outline-none"
    >
      {children}
    </button>
  )
}

export function ShelfStamp({ movie }: { movie: Movie }) {
  const { t } = useLanguage()
  return movie.watched ? (
    <span className={`${displayFont.className} rounded-[2px] bg-[#f2ebdd] px-1.5 pb-px pt-0.5 text-[11px] uppercase tracking-[0.08em] text-[#1a1714]`}>
      {t.shelf.stampSeen}
      {movie.rating ? ` ★${movie.rating}` : ''}
    </span>
  ) : (
    <span className={`${displayFont.className} rounded-[2px] bg-[#dc2626] px-1.5 pb-px pt-0.5 text-[11px] uppercase tracking-[0.08em] text-white`}>
      {t.shelf.stampSoon}
    </span>
  )
}

export default function PosterTile({ movie, onOpen, onMarkSeen, onMarkSoon, onDelete }: PosterTileProps) {
  const { t } = useLanguage()
  const src = posterSrc(movie)

  return (
    <div className="group relative">
      {/* Tapping the poster opens the edit dialog (the only path on touch screens) */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={movie.year ? `${movie.title}, ${movie.year}` : movie.title}
        className="relative block aspect-[2/3] w-full overflow-hidden rounded-md bg-[#1a1714] ring-1 ring-[#f2ebdd]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ebdd]"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
            <Film size={22} className="text-[#f2ebdd]/30" />
            <span className="line-clamp-3 text-xs text-[#f2ebdd]/60">{movie.title}</span>
          </span>
        )}
      </button>

      <div className="pointer-events-none absolute left-2 top-2">
        <ShelfStamp movie={movie} />
      </div>

      {/* Hover overlay with quick actions, only on devices that can hover */}
      <div
        onClick={onOpen}
        className="pointer-events-none absolute inset-0 hidden cursor-pointer flex-col justify-end rounded-md bg-black/75 p-3 opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:hover)]:flex"
      >
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#f2ebdd]">{movie.title}</p>
        {movie.year && <p className="text-xs text-[#f2ebdd]/60">{movie.year}</p>}
        <div className="mt-2.5 flex gap-1.5">
          {movie.watched ? (
            <QuickAction label={t.shelf.markSoon} onClick={onMarkSoon}>
              <Clock size={15} />
            </QuickAction>
          ) : (
            <QuickAction label={t.shelf.markSeen} onClick={onMarkSeen}>
              <Check size={15} />
            </QuickAction>
          )}
          <QuickAction label={t.common.edit} onClick={onOpen}>
            <Pencil size={14} />
          </QuickAction>
          <QuickAction label={t.common.delete} onClick={onDelete}>
            <Trash2 size={14} />
          </QuickAction>
        </div>
      </div>

      {/* Title under the poster on touch screens, where there is no hover overlay */}
      <div className="mt-1.5 [@media(hover:hover)]:hidden">
        <p className="truncate text-xs font-medium text-[#f2ebdd]">{movie.title}</p>
        {movie.year && <p className="text-[11px] text-[#f2ebdd]/50">{movie.year}</p>}
      </div>
    </div>
  )
}
