// Server-only helpers for talking to TMDB. The bearer token never leaves the server.

const TMDB_API = 'https://api.themoviedb.org/3'
const DEFAULT_LANGUAGE = 'en-US'

const LOCALE_TO_TMDB: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  uz: 'uz-UZ',
}

export class TmdbError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export interface TmdbSearchResult {
  id: number
  title: string
  year: number | null
  posterPath: string | null
  overview: string
}

export interface TmdbMovieDetails {
  tmdbId: number
  title: string
  year: number | null
  runtime: number | null
  genres: string[]
  overview: string
  posterPath: string | null
  backdropPath: string | null
  director: string | null
  cast: string[]
}

interface RawSearchMovie {
  id: number
  title?: string
  release_date?: string
  poster_path?: string | null
  overview?: string
}

interface RawMovieDetails extends RawSearchMovie {
  runtime?: number | null
  genres?: { name: string }[]
  backdrop_path?: string | null
  credits?: {
    cast?: { name: string; order?: number }[]
    crew?: { name: string; job?: string }[]
  }
}

export function tmdbLanguage(locale: string | null): string {
  return (locale && LOCALE_TO_TMDB[locale]) || DEFAULT_LANGUAGE
}

function yearOf(date?: string): number | null {
  const year = date ? parseInt(date.slice(0, 4), 10) : NaN
  return Number.isFinite(year) ? year : null
}

async function tmdbFetch<T>(path: string, params: Record<string, string>, revalidate: number): Promise<T> {
  const token = process.env.TMDB_TOKEN
  if (!token) {
    throw new TmdbError('TMDB is not configured. Set TMDB_TOKEN in .env.local', 503)
  }

  const url = `${TMDB_API}${path}?${new URLSearchParams(params)}`
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    })
  } catch (error) {
    console.error('[tmdb] Request failed:', path, error)
    throw new TmdbError('Could not reach TMDB. Please try again.', 502)
  }

  if (response.status === 404) {
    throw new TmdbError('Movie not found on TMDB', 404)
  }
  if (!response.ok) {
    console.error('[tmdb] Bad response:', path, response.status)
    throw new TmdbError(
      response.status === 401 ? 'TMDB rejected the API token' : 'TMDB request failed',
      502
    )
  }
  return response.json() as Promise<T>
}

export async function searchMovies(query: string, language: string): Promise<TmdbSearchResult[]> {
  const search = (lang: string) =>
    tmdbFetch<{ results?: RawSearchMovie[] }>(
      '/search/movie',
      { query, language: lang, include_adult: 'false', page: '1' },
      3600
    ).then((data) => (data.results || []).slice(0, 8))

  const results = await search(language)

  // Fill missing localized overviews from the English results
  let fallback = new Map<number, string>()
  if (language !== DEFAULT_LANGUAGE && results.some((m) => !m.overview)) {
    const english = await search(DEFAULT_LANGUAGE).catch(() => [])
    fallback = new Map(english.map((m) => [m.id, m.overview || '']))
  }

  return results.map((m) => ({
    id: m.id,
    title: m.title || '',
    year: yearOf(m.release_date),
    posterPath: m.poster_path || null,
    overview: m.overview || fallback.get(m.id) || '',
  }))
}

export async function getMovieDetails(id: number, language: string): Promise<TmdbMovieDetails> {
  const movie = await tmdbFetch<RawMovieDetails>(
    `/movie/${id}`,
    { language, append_to_response: 'credits' },
    86400
  )

  let overview = movie.overview || ''
  if (!overview && language !== DEFAULT_LANGUAGE) {
    const english = await tmdbFetch<RawMovieDetails>(`/movie/${id}`, { language: DEFAULT_LANGUAGE }, 86400).catch(
      () => null
    )
    overview = english?.overview || ''
  }

  const cast = [...(movie.credits?.cast || [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5)
    .map((c) => c.name)

  return {
    tmdbId: movie.id,
    title: movie.title || '',
    year: yearOf(movie.release_date),
    runtime: movie.runtime || null,
    genres: (movie.genres || []).map((g) => g.name),
    overview,
    posterPath: movie.poster_path || null,
    backdropPath: movie.backdrop_path || null,
    director: movie.credits?.crew?.find((c) => c.job === 'Director')?.name || null,
    cast,
  }
}
