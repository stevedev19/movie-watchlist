import { Schema } from 'mongoose'
import { Movie as MovieType } from '@/types/movie'

// Optional TMDB metadata shared by the movie collections. All fields are optional,
// so documents created before TMDB auto-fill stay valid.
export const tmdbSchemaFields = {
  tmdbId: { type: Number, index: true },
  runtime: { type: Number },
  genres: { type: [String], default: undefined },
  overview: { type: String },
  posterPath: { type: String },
  backdropPath: { type: String },
  director: { type: String },
  cast: { type: [String], default: undefined },
}

// One TMDB movie per user per collection; documents without tmdbId are not affected
export function addTmdbUserIndex(schema: Schema) {
  schema.index(
    { userId: 1, tmdbId: 1 },
    { unique: true, partialFilterExpression: { tmdbId: { $type: 'number' } } }
  )
}

export type TmdbMovieFields = Pick<
  MovieType,
  'tmdbId' | 'runtime' | 'genres' | 'overview' | 'posterPath' | 'backdropPath' | 'director' | 'cast'
>

const TMDB_PATH = /^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|svg)$/

const str = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined

const strList = (value: unknown, maxItems: number) =>
  Array.isArray(value)
    ? value.map((v) => str(v, 100)).filter((v): v is string => !!v).slice(0, maxItems)
    : undefined

const imagePath = (value: unknown) => {
  const path = str(value, 100)
  return path && TMDB_PATH.test(path) ? path : undefined
}

// Validate TMDB fields from an untrusted request body or copy them from an existing document
export function pickTmdbFields(source: Partial<Record<keyof TmdbMovieFields, unknown>>): TmdbMovieFields {
  const tmdbId = Number(source.tmdbId)
  const runtime = Number(source.runtime)
  const fields: TmdbMovieFields = {
    tmdbId: Number.isInteger(tmdbId) && tmdbId > 0 ? tmdbId : undefined,
    runtime: Number.isInteger(runtime) && runtime > 0 ? runtime : undefined,
    genres: strList(source.genres, 10),
    overview: str(source.overview, 2000),
    posterPath: imagePath(source.posterPath),
    backdropPath: imagePath(source.backdropPath),
    director: str(source.director, 100),
    cast: strList(source.cast, 5),
  }
  // Drop empty values so nothing extra is written to the document
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
  ) as TmdbMovieFields
}
