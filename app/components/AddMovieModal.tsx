'use client'

import React, {
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from 'react'
import { Movie } from '@/types/movie'
import { addMovie } from '@/app/lib/storage-mongodb'
import type { TmdbMovieDetails, TmdbSearchResult } from '@/app/lib/tmdb'
import { Film, Loader2, Star, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import TmdbTitleCombobox from './TmdbTitleCombobox'

const TMDB_PREVIEW = 'https://image.tmdb.org/t/p/w185'

interface AddMovieModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddMovieModal({
  onClose,
  onSuccess,
}: AddMovieModalProps) {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null) // Final URL to save (upload URL or base64 fallback)
  const [imagePreview, setImagePreview] = useState<string | null>(null) // For immediate preview
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [watched, setWatched] = useState(false)
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [tmdbMovie, setTmdbMovie] = useState<TmdbMovieDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const { isAuthenticated } = useAuth()
  const { t, language } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const detailsRequestRef = useRef(0)

  // Fill the form from a TMDB search result, then upgrade it with full details
  const handleTmdbSelect = async (result: TmdbSearchResult) => {
    const requestId = ++detailsRequestRef.current
    setTitle(result.title)
    setYear(result.year ? String(result.year) : '')
    setTmdbMovie(null)
    setDetailsError('')
    setIsLoadingDetails(true)

    try {
      const response = await fetch(`/api/tmdb/movie/${result.id}?lang=${language}`)
      if (!response.ok) throw new Error(`Details failed: ${response.status}`)
      const data: { movie: TmdbMovieDetails } = await response.json()
      if (requestId !== detailsRequestRef.current) return
      setTmdbMovie(data.movie)
      if (data.movie.year) setYear(String(data.movie.year))
      if (data.movie.genres.length) setGenre(data.movie.genres.join(', '))
    } catch (err) {
      if (requestId !== detailsRequestRef.current) return
      console.error('[AddMovieModal] TMDB details error:', err)
      // Keep what the search result already gave us
      setTmdbMovie({
        tmdbId: result.id,
        title: result.title,
        year: result.year,
        runtime: null,
        genres: [],
        overview: result.overview,
        posterPath: result.posterPath,
        backdropPath: null,
        director: null,
        cast: [],
      })
      setDetailsError(t.addMovie.detailsError)
    } finally {
      if (requestId === detailsRequestRef.current) setIsLoadingDetails(false)
    }
  }

  const clearTmdbSelection = () => {
    detailsRequestRef.current++
    setTmdbMovie(null)
    setIsLoadingDetails(false)
    setDetailsError('')
  }

  const formatRuntime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0
      ? t.addMovie.runtime.replace('{h}', String(h)).replace('{m}', String(m))
      : t.addMovie.runtimeMinutes.replace('{m}', String(m))
  }

  // Upload images function (similar to the example)
  const uploadImages = async () => {
    try {
      const selectedFiles = inputRef.current?.files
      if (!selectedFiles || selectedFiles.length === 0) {
        return false
      }

      const file = selectedFiles[0] // Take first file only

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ]
      if (!allowedTypes.includes(file.type)) {
        setError(
          'Invalid file type. Please select an image file (JPEG, PNG, WebP, or GIF).'
        )
        return false
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.')
        return false
      }

      setError('')
      setSuccessMessage('')
      setIsUploading(true)

      // Create preview first
      const reader = new FileReader()
      reader.onloadend = () => {
        const preview = reader.result as string
        setImagePreview(preview)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      console.log('📤 [AddMovieModal] Uploading image file...', {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 [AddMovieModal] Upload response:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [AddMovieModal] Upload failed:', errorData)
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      console.log('✅ [AddMovieModal] Image uploaded successfully:', data)
      console.log('📸 [AddMovieModal] Image URL:', data.url)

      // Store the uploaded URL
      setImageUrl(data.url)
      setIsUploading(false)
      setSuccessMessage('Image uploaded successfully!')
      return true
    } catch (err: unknown) {
      console.error('❌ [AddMovieModal] Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setIsUploading(false)
      setImageUrl(null)
      setImagePreview(null)
      return false
    }
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // Trigger upload when file is selected
    await uploadImages()
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setImagePreview(null)
    setError('')
    setSuccessMessage('')
    // Reset file input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (isUploading) {
      setError('Please wait for the image to finish uploading')
      setIsLoading(false)
      return
    }

    if (!isAuthenticated) {
      setError('Please log in to add movies')
      setIsLoading(false)
      return
    }

    if (!title.trim()) {
      setError('Movie name is required')
      setIsLoading(false)
      return
    }

    // If image is selected but not uploaded yet, upload it first
    if (inputRef.current?.files && inputRef.current.files.length > 0 && !imageUrl) {
      setIsLoading(true)
      const uploaded = await uploadImages()
      if (!uploaded) {
        setIsLoading(false)
        return
      }
    }

    try {
      // 🔥 CRITICAL: Log before creating movie
      const finalImageUrl = imageUrl || imagePreview || null
      console.log('[AddMovieModal] before POST - imageUrl state:', {
        imageUrl: finalImageUrl ? finalImageUrl.substring(0, 80) : 'NULL/UNDEFINED',
        imageUrlType: typeof finalImageUrl,
        imageUrlLength: finalImageUrl?.length || 0,
        hasImage: !!finalImageUrl,
      })

      const newMovie: Movie = {
        id: Date.now().toString(), // Will be replaced by MongoDB _id
        title: title.trim(),
        genre: genre.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
        imageUrl: finalImageUrl, // Prefer upload URL, fall back to base64 preview
        image: imagePreview || undefined, // Base64 fallback if uploads are unavailable
        hasImage: !!finalImageUrl,
        imageType: finalImageUrl ? 'uploaded' : 'other',
        notes: notes.trim() || undefined,
        watched,
        rating: watched ? rating : undefined,
        createdAt: new Date().toISOString(),
        ...(tmdbMovie && {
          tmdbId: tmdbMovie.tmdbId,
          runtime: tmdbMovie.runtime ?? undefined,
          genres: tmdbMovie.genres,
          overview: tmdbMovie.overview || undefined,
          posterPath: tmdbMovie.posterPath ?? undefined,
          backdropPath: tmdbMovie.backdropPath ?? undefined,
          director: tmdbMovie.director ?? undefined,
          cast: tmdbMovie.cast,
        }),
      }

      // 🔥 CRITICAL: Log the movie object being created
      console.log('[AddMovieModal] Creating movie', {
        title: newMovie.title,
        imageUrl: newMovie.imageUrl ? newMovie.imageUrl.substring(0, 80) : 'NULL/MISSING',
        hasImage: newMovie.hasImage,
        imageType: newMovie.imageType,
        allKeys: Object.keys(newMovie),
      })

      await addMovie(newMovie)

      setSuccessMessage('Movie added successfully!')
      
      // Optional: reset form
      // setTitle('')
      // setGenre('')
      // setYear('')
      // setNotes('')
      // setImageUrl(null)

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    } catch (err: unknown) {
      console.error('❌ [AddMovieModal] Error adding movie:', err)
      if ((err as { code?: string })?.code === 'DUPLICATE_TMDB') {
        setError(t.addMovie.duplicate)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add movie. Please try again.')
      }
      setSuccessMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="netflix-card rounded-lg p-8 max-w-md w-full netflix-glow max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Movie</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="movie-title"
              className="block text-sm font-medium text-[#A3A3A3] mb-2"
            >
              Movie Name <span className="text-red-500">*</span>
            </label>
            <TmdbTitleCombobox
              id="movie-title"
              value={title}
              onChange={setTitle}
              onSelect={handleTmdbSelect}
              className="w-full pl-10 pr-10 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
            />
          </div>

          {/* TMDB preview */}
          {isLoadingDetails && (
            <div className="flex items-center gap-3 rounded-lg border border-[#262626] bg-[#0F0F0F] p-3 text-sm text-[#A3A3A3]" role="status">
              <Loader2 size={16} className="animate-spin" />
              {t.addMovie.loadingDetails}
            </div>
          )}
          {tmdbMovie && !isLoadingDetails && (
            <div className="flex gap-3 rounded-lg border border-[#262626] bg-[#0F0F0F] p-3">
              {tmdbMovie.posterPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${TMDB_PREVIEW}${tmdbMovie.posterPath}`}
                  alt=""
                  className="h-[108px] w-[72px] flex-none rounded bg-[#262626] object-cover"
                />
              ) : (
                <div className="flex h-[108px] w-[72px] flex-none items-center justify-center rounded bg-[#262626]">
                  <Film size={20} className="text-[#737373]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight text-white">{tmdbMovie.title}</p>
                  <button
                    type="button"
                    onClick={clearTmdbSelection}
                    className="-mr-1 -mt-1 rounded p-1 text-[#A3A3A3] transition-colors hover:bg-[#262626] hover:text-white"
                    aria-label={t.addMovie.clearSelection}
                    title={t.addMovie.clearSelection}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#A3A3A3]">
                  {[tmdbMovie.year, tmdbMovie.runtime && formatRuntime(tmdbMovie.runtime)].filter(Boolean).join(' · ')}
                </p>
                {tmdbMovie.genres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tmdbMovie.genres.map((g) => (
                      <span key={g} className="rounded bg-[#262626] px-1.5 py-0.5 text-[11px] text-[#D4D4D4]">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                {tmdbMovie.director && (
                  <p className="mt-2 truncate text-xs text-[#A3A3A3]">
                    {t.addMovie.directedBy} {tmdbMovie.director}
                  </p>
                )}
                {detailsError && <p className="mt-2 text-xs text-yellow-500">{detailsError}</p>}
              </div>
            </div>
          )}

          {/* Genre */}
          <div>
            <label
              htmlFor="movie-genre"
              className="block text-sm font-medium text-[#A3A3A3] mb-2"
            >
              Genre
            </label>
            <input
              type="text"
              id="movie-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
              placeholder="e.g., Action, Drama, Comedy"
            />
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="movie-year"
              className="block text-sm font-medium text-[#A3A3A3] mb-2"
            >
              Year
            </label>
            <input
              type="number"
              id="movie-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
              placeholder="e.g., 2023"
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="movie-image"
              className="block text-sm font-medium text-[#A3A3A3] mb-2"
            >
              Movie Image
            </label>
            {tmdbMovie?.posterPath && !imageUrl && !imagePreview && (
              <p className="mb-2 text-xs text-[#A3A3A3]">{t.addMovie.posterFromTmdb}</p>
            )}

            {!imageUrl && !imagePreview ? (
              <div>
                <label
                  htmlFor="movie-image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#262626] border-dashed rounded-lg cursor-pointer bg-[#0F0F0F] hover:bg-[#181818] hover:border-[#E50914] transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const files = e.dataTransfer.files
                    if (files.length > 0 && inputRef.current) {
                      inputRef.current.files = files
                      await uploadImages()
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-[#A3A3A3]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-[#A3A3A3]">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-[#A3A3A3]">
                      PNG, JPG, GIF, WebP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    id="movie-image"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <img
                    src={imagePreview || imageUrl || ''}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-[#262626]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 px-3 py-1 bg-[#181818] border border-[#262626] text-white text-sm font-semibold rounded-lg hover:bg-[#262626] transition-colors"
                  >
                    Remove
                  </button>
                </div>
                {isUploading && (
                  <p className="text-xs text-yellow-500">⏳ Uploading image...</p>
                )}
                {imageUrl && !isUploading && (
                  <p className="text-xs text-green-500">
                    ✓ Image uploaded successfully
                  </p>
                )}
                {imagePreview && !imageUrl && (
                  <p className="text-xs text-blue-500">
                    📸 Image selected (will upload on save)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Watched + rating */}
          <div className="space-y-3">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={watched}
                onChange={(e) => setWatched(e.target.checked)}
                className="h-4 w-4 accent-[#E50914]"
              />
              <span className="text-sm text-white">{t.addMovie.alreadyWatched}</span>
            </label>
            {watched && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#A3A3A3]">{t.addMovie.yourRating}</span>
                <div className="flex gap-1" role="radiogroup" aria-label={t.addMovie.yourRating}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value}/5`}
                      // Clicking the current rating clears it
                      onClick={() => setRating(rating === value ? undefined : value)}
                      className="rounded p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={rating && value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#525252]'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="movie-notes"
              className="block text-sm font-medium text-[#A3A3A3] mb-2"
            >
              Notes (Optional)
            </label>
            <textarea
              id="movie-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all resize-none"
              placeholder="Add any notes about this movie..."
              rows={3}
            />
          </div>

          {/* Error & Success */}
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-green-500 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              {successMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
      {isLoading ? (isUploading ? 'Uploading...' : 'Adding...') : 'Add Movie'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#181818] border border-[#262626] text-white rounded-lg font-semibold hover:bg-[#262626] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
