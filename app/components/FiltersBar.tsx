'use client'

interface FiltersBarProps {
  sortBy: 'rating' | 'date' | 'title'
  onSortChange: (sort: 'rating' | 'date' | 'title') => void
  genres: string[]
  selectedGenre: string
  onGenreChange: (genre: string) => void
  years: number[]
  selectedYear: string
  onYearChange: (year: string) => void
}

export default function FiltersBar({
  sortBy,
  onSortChange,
  genres,
  selectedGenre,
  onGenreChange,
  years,
  selectedYear,
  onYearChange,
}: FiltersBarProps) {
  return (
    <div className="netflix-card rounded-lg p-4 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#A3A3A3] text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'rating' | 'date' | 'title')}
            className="px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
          >
            <option value="rating">Rating</option>
            <option value="date">Date Added</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#A3A3A3] text-sm font-medium">Genre:</span>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#A3A3A3] text-sm font-medium">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}


