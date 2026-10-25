'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { fill } from './shelfUtils'

export type ShelfSort = 'date' | 'rating' | 'title' | 'year'

interface ShelfFilterBarProps {
  genres: string[]
  selectedGenre: string
  onGenreChange: (genre: string) => void
  years: number[]
  selectedYear: string
  onYearChange: (year: string) => void
  sortBy: ShelfSort
  onSortChange: (sort: ShelfSort) => void
  hasFilters: boolean
  onClearFilters: () => void
  // Optional minimum-rating filter (used on the All movies page)
  minRating?: string
  onMinRatingChange?: (rating: string) => void
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-[#f2ebdd]/15 bg-[#151210] pl-3.5 pr-2 text-sm transition-colors focus-within:border-[#f2ebdd]/50">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2ebdd]/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent pr-1 text-[#f2ebdd] focus:outline-none [&>option]:bg-[#151210]"
      >
        {children}
      </select>
    </label>
  )
}

// One row of filters; scrolls sideways on narrow screens instead of wrapping
export default function ShelfFilterBar({
  genres,
  selectedGenre,
  onGenreChange,
  years,
  selectedYear,
  onYearChange,
  sortBy,
  onSortChange,
  hasFilters,
  onClearFilters,
  minRating,
  onMinRatingChange,
}: ShelfFilterBarProps) {
  const { t } = useLanguage()

  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-2">
        <FilterSelect label={t.shelf.filterGenre} value={selectedGenre} onChange={onGenreChange}>
          <option value="">{t.shelf.allGenres}</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label={t.shelf.filterYear} value={selectedYear} onChange={onYearChange}>
          <option value="">{t.shelf.allYears}</option>
          {years.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </FilterSelect>
        {onMinRatingChange && (
          <FilterSelect label={t.library.filterRating} value={minRating ?? ''} onChange={onMinRatingChange}>
            <option value="">{t.library.anyRating}</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n.toString()}>
                {fill(t.library.ratingAtLeast, { n })}
              </option>
            ))}
          </FilterSelect>
        )}
        <FilterSelect label={t.shelf.sortLabel} value={sortBy} onChange={(value) => onSortChange(value as ShelfSort)}>
          <option value="date">{t.shelf.sortRecent}</option>
          <option value="rating">{t.shelf.sortRating}</option>
          <option value="title">{t.shelf.sortTitle}</option>
          <option value="year">{t.shelf.sortYear}</option>
        </FilterSelect>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 px-2 text-sm text-[#f2ebdd]/60 transition-colors hover:text-[#f2ebdd]"
          >
            <X size={14} />
            {t.shelf.clearFilters}
          </button>
        )}
      </div>
    </div>
  )
}
