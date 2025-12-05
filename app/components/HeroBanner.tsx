'use client'

import { Movie } from '@/types/movie'

interface HeroBannerProps {
  movie: Movie
  onAddToWatchlist?: () => void
}

export default function HeroBanner({ movie, onAddToWatchlist }: HeroBannerProps) {
  const posterUrl = movie.image || `https://picsum.photos/seed/${movie.id}/1920/1080`
  
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-lg mb-8 netflix-glow">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${posterUrl})`,
          filter: 'blur(4px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl">
            {movie.title}
          </h2>
          
          {movie.year && (
            <p className="text-xl md:text-2xl text-[#A3A3A3] mb-4">
              {movie.year} {movie.genre && `• ${movie.genre}`}
            </p>
          )}
          
          {movie.notes && (
            <p className="text-base md:text-lg text-white mb-6 line-clamp-3 drop-shadow-lg">
              {movie.notes}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-opacity-80 transition-all flex items-center justify-center gap-2">
              <span>▶️</span>
              <span>Watch Trailer</span>
            </button>
            
            {onAddToWatchlist && (
              <button
                onClick={onAddToWatchlist}
                className="px-6 py-3 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>Add to Watchlist</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

