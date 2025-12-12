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
import { useAuth } from '../contexts/AuthContext'

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
  const { isAuthenticated } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

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
      console.log('[AddMovieModal] before POST - imageUrl state:', {
        imageUrl: imageUrl ? imageUrl.substring(0, 80) : 'NULL/UNDEFINED',
        imageUrlType: typeof imageUrl,
        imageUrlLength: imageUrl?.length || 0,
        hasImage: !!imageUrl,
      })

      const newMovie: Movie = {
        id: Date.now().toString(), // Will be replaced by MongoDB _id
        title: title.trim(),
        genre: genre.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
        imageUrl: imageUrl || null, // 🔥 Uploaded file URL (e.g., /uploads/filename.jpg)
        hasImage: !!imageUrl,
        imageType: imageUrl ? 'uploaded' : 'other',
        notes: notes.trim() || undefined,
        watched: false,
        createdAt: new Date().toISOString(),
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
      setError(err instanceof Error ? err.message : 'Failed to add movie. Please try again.')
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
            <input
              type="text"
              id="movie-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
              placeholder="Enter movie name"
              required
            />
          </div>

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
