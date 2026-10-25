import { Movie } from '@/types/movie'
import { Language } from '@/app/lib/translations'

export const INTL_LOCALE: Record<Language, string> = {
  en: 'en-US',
  uz: 'uz-UZ',
  ko: 'ko-KR',
}

// Replace {key} placeholders in a translated template
export function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((text, [key, value]) => text.split(`{${key}}`).join(String(value)), template)
}

export function formatNumber(value: number, language: Language, fractionDigits = 0) {
  return new Intl.NumberFormat(INTL_LOCALE[language], {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDate(value: string | Date, language: Language) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  // Browsers ship incomplete Uzbek month names, so Uzbek uses the numeric form
  const options: Intl.DateTimeFormatOptions =
    language === 'uz'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat(INTL_LOCALE[language], options).format(date)
}

export function formatDateTime(value: string | Date, language: Language) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const options: Intl.DateTimeFormatOptions =
    language === 'uz'
      ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Intl.DateTimeFormat(INTL_LOCALE[language], options).format(date)
}

export function formatRuntime(minutes: number, hoursTemplate: string, minutesTemplate: string) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? fill(hoursTemplate, { h, m }) : fill(minutesTemplate, { m })
}

const normalizeImage = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || ['none', 'null', 'undefined'].includes(trimmed.toLowerCase())) return null
  return trimmed.startsWith('/uploads/') ? `/api/uploads/${trimmed.slice('/uploads/'.length)}` : trimmed
}

// Same priority as MovieCard: uploaded image first, then the TMDB poster
export function posterSrc(movie: Movie, size: 'w342' | 'w500' = 'w342') {
  return (
    normalizeImage(movie.imageUrl) ||
    normalizeImage(movie.image) ||
    (movie.posterPath ? `https://image.tmdb.org/t/p/${size}${movie.posterPath}` : null)
  )
}

export function backdropSrc(movie: Movie) {
  return movie.backdropPath ? `https://image.tmdb.org/t/p/w780${movie.backdropPath}` : posterSrc(movie, 'w500')
}
