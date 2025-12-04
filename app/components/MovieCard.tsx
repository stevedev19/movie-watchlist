'use client'

import { useState } from 'react'
import { Movie } from '@/types/movie'

interface MovieCardProps {
  movie: Movie
  onToggleWatched: () => void
  onDelete: () => void
  onUpdateRating: (rating: number | undefined) => void
  onEditNotes?: () => void
}

export default function MovieCard({ 
  movie, 
  onToggleWatched, 
  onDelete, 
  onUpdateRating,
  onEditNotes 
}: MovieCardProps) {
  const [showActions, setShowActions] = useState(false)
  const posterUrl = `https://picsum.photos/seed/${movie.id}/300/450`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
            ⭐
          </span>
        ))}
        <span className="text-sm text-[#A3A3A3] ml-1">({rating}/5)</span>
      </div>
    )
  }

  return (
    <div 
      className="netflix-card rounded-lg overflow-hidden movie-card-hover relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Dark overlay on hover */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          showActions ? 'opacity-60' : 'opacity-0'
        }`} />
        
        {/* Action buttons - slide up on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 ${
          showActions ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="flex gap-2">
            <button
              onClick={onToggleWatched}
              className="flex-1 px-3 py-2 bg-white text-black rounded text-sm font-semibold hover:bg-opacity-90 transition-all"
            >
              {movie.watched ? '👁️ Unwatch' : '✅ Watch'}
            </button>
            {onEditNotes && (
              <button
                onClick={onEditNotes}
                className="px-3 py-2 bg-[#181818] text-white rounded text-sm font-semibold hover:bg-[#262626] transition-all border border-[#262626]"
              >
                ✏️
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-3 py-2 netflix-red text-white rounded text-sm font-semibold netflix-red-hover transition-all"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Watched badge */}
        {movie.watched && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>
        
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-2">
          {movie.year && <span>{movie.year}</span>}
          {movie.genre && (
            <>
              <span>•</span>
              <span>{movie.genre}</span>
            </>
          )}
        </div>

        {movie.notes && (
          <p className="text-xs text-[#A3A3A3] line-clamp-2 mb-2">
            {movie.notes}
          </p>
        )}

        {movie.watched && movie.watchedAt && (
          <div className="text-xs text-[#A3A3A3] mb-2">
            Watched on {formatDate(movie.watchedAt)}
          </div>
        )}

        {movie.watched && (
          <div className="mb-2">
            {renderStars(movie.rating)}
            {!movie.rating && (
              <select
                value={movie.rating || ''}
                onChange={(e) => onUpdateRating(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full mt-1 px-2 py-1 bg-[#0F0F0F] border border-[#262626] rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Rate this movie</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            )}
          </div>
        )}

        {/* Mobile actions (always visible on mobile) */}
        <div className="md:hidden flex gap-2 mt-3">
          <button
            onClick={onToggleWatched}
            className="flex-1 px-2 py-1.5 bg-[#181818] border border-[#262626] text-white rounded text-xs font-semibold hover:bg-[#262626] transition-all"
          >
            {movie.watched ? '👁️ Unwatch' : '✅ Watch'}
          </button>
          {onEditNotes && (
            <button
              onClick={onEditNotes}
              className="px-2 py-1.5 bg-[#181818] border border-[#262626] text-white rounded text-xs font-semibold hover:bg-[#262626] transition-all"
            >
              ✏️
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-2 py-1.5 netflix-red text-white rounded text-xs font-semibold netflix-red-hover transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

