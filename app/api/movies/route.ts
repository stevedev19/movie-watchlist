import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import MovieToWatch from '@/app/models/MovieToWatch'
import MovieWatched from '@/app/models/MovieWatched'
import { Movie as MovieType } from '@/types/movie'
import { getUserFromRequestCookie } from '@/lib/auth'
import { User } from '@/models/User'
import mongoose from 'mongoose'
import { logActivity } from '@/app/lib/activity-logger'

export const dynamic = 'force-dynamic'

// GET /api/movies - Get all movies for a user (from both collections)
export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI in .env.local' },
        { status: 503 }
      )
    }
    
    await connectDB()
    
    // Check if we should show all movies (for homepage recommended section)
    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    
    // Get authenticated user
    const user = getUserFromRequestCookie()
    const userId = user?.userId
    
    // If showAll=true, show all movies regardless of authentication (for homepage)
    // If user is authenticated and showAll=false, only show their movies (for dashboard)
    // If not authenticated, show all movies (for homepage public viewing)
    const movieFilter = (showAll || !userId || !mongoose.Types.ObjectId.isValid(userId))
      ? {}
      : { userId: new mongoose.Types.ObjectId(userId) }

    // Normalize legacy/invalid image values before sending to the client
    const normalizeImageUrl = (value: unknown): string | null => {
      if (!value || typeof value !== 'string') return null
      const trimmed = value.trim()
      if (!trimmed) return null
      const lowered = trimmed.toLowerCase()
      if (['null', 'undefined', 'none', 'false', '0'].includes(lowered)) return null
      return trimmed
    }

    interface MovieDoc {
      _id: { toString: () => string }
      title: string
      year?: number
      genre?: string
      imageUrl?: unknown
      image?: unknown
      hasImage?: unknown
      imageType?: string
      notes?: string
      rating?: number
      createdAt: string
      watchedAt?: string
      userId?: { toString: () => string }
    }
    const formatMovie = (m: MovieDoc, watched: boolean): MovieType => {
      const normalizedImageUrl = normalizeImageUrl(m.imageUrl) || normalizeImageUrl(m.image)
      const normalizedImage = normalizeImageUrl(m.image)
      const hasImage = normalizedImageUrl ? true : m.hasImage !== undefined ? !!m.hasImage : false
      const imageType = m.imageType || (normalizedImageUrl ? 'uploaded' : 'other')

      return {
        id: m._id.toString(),
        title: m.title,
        year: m.year,
        genre: m.genre,
        image: normalizedImage || undefined,
        imageUrl: normalizedImageUrl,
        hasImage,
        imageType,
        notes: m.notes,
        rating: m.rating,
        watched,
        createdAt: m.createdAt,
        watchedAt: m.watchedAt,
        userId: m.userId?.toString(), // Include userId in the response
      }
    }

    // Get movies from both collections (filtered by userId if authenticated)
    const [toWatchMovies, watchedMovies] = await Promise.all([
      MovieToWatch.find(movieFilter).sort({ createdAt: -1 }),
      MovieWatched.find(movieFilter).sort({ createdAt: -1 }),
    ])
    
    // Get all unique user IDs from movies
    const userIds = new Set<string>()
    toWatchMovies.forEach(m => m.userId && userIds.add(m.userId.toString()))
    watchedMovies.forEach(m => m.userId && userIds.add(m.userId.toString()))
    
    // Fetch user names for all user IDs (using the same connection)
    // Convert string IDs to ObjectIds for MongoDB query
    const userIdsArray = Array.from(userIds).filter(id => mongoose.Types.ObjectId.isValid(id))
    const userObjectIds = userIdsArray.map(id => new mongoose.Types.ObjectId(id))
    const users = userIdsArray.length > 0 
      ? await User.find({ _id: { $in: userObjectIds } }).select('_id name')
      : []
    const userMap = new Map<string, string>()
    users.forEach(user => {
      userMap.set(user._id.toString(), user.name || 'Unknown')
    })
    
    const allMovies: MovieType[] = [
      ...toWatchMovies.map((movie) => {
        const formatted = formatMovie(movie, false)
        formatted.userName = movie.userId ? userMap.get(movie.userId.toString()) || 'Unknown' : undefined
        return formatted
      }),
      ...watchedMovies.map((movie) => {
        const formatted = formatMovie(movie, true)
        formatted.userName = movie.userId ? userMap.get(movie.userId.toString()) || 'Unknown' : undefined
        return formatted
      }),
    ]

    // Sort by creation date
    allMovies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 🔥 CRITICAL: Log what we're returning
    console.log('[API /movies GET] before send - returning movies:', allMovies.map(m => ({
      title: m.title,
      imageUrl: m.imageUrl ? m.imageUrl.substring(0, 80) : 'NULL/MISSING',
      hasImage: m.hasImage,
      imageType: m.imageType,
      imageUrlType: typeof m.imageUrl,
    })))

    return NextResponse.json({ movies: allMovies })
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}

// POST /api/movies - Create a new movie (adds to movies-to-watch)
export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI in .env.local' },
        { status: 503 }
      )
    }
    
    await connectDB()
    
    // Authentication required for POST
    const user = getUserFromRequestCookie()
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const userId = user.userId
    const userName = user.name || 'Unknown'

    const body = await request.json()
    const { title, year, genre, image, imageUrl, hasImage, imageType, notes, watched, rating } = body
    
    // 🔥 CRITICAL: Log what we received
    console.log('[API /movies POST] before save - received:', {
      title,
      imageUrl: imageUrl ? imageUrl.substring(0, 80) : 'NULL/MISSING',
      imageUrlType: typeof imageUrl,
      imageUrlLength: imageUrl?.length || 0,
      hasImage: hasImage !== undefined ? hasImage : 'UNDEFINED',
      imageType: imageType || 'MISSING',
      allBodyKeys: Object.keys(body),
    })

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const isWatched = watched === true

    if (isWatched) {
      // Add to movies-watched collection
      const movie = new MovieWatched({
        title,
        year,
        genre,
        image: image || imageUrl, // Support both for backward compatibility
        imageUrl,
        hasImage,
        imageType,
        notes,
        rating,
        watched: true,
        createdAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
        userId,
      })

      await movie.save()

      // Log activity
      await logActivity({
        userId,
        userName,
        action: 'add',
        movieId: movie._id.toString(),
        movieTitle: movie.title,
        details: 'Added as watched movie',
      })

      console.log('🟢 [API POST] Watched movie saved to DB:', {
        id: movie._id.toString(),
        title: movie.title,
        imageUrlInDB: movie.imageUrl || 'NO IMAGE URL IN DB',
        hasImageInDB: movie.hasImage
      })

      const movieData: MovieType = {
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        image: movie.image,
        imageUrl: movie.imageUrl,
        hasImage: movie.hasImage,
        imageType: movie.imageType,
        notes: movie.notes,
        rating: movie.rating,
        watched: true,
        createdAt: movie.createdAt,
        watchedAt: movie.watchedAt,
      }

      return NextResponse.json({ movie: movieData }, { status: 201 })
    } else {
      // 🔥 CRITICAL: Normalize and prepare movie data
      const movieToSave = {
        title,
        year,
        genre,
        watched: false,
        notes,
        rating: undefined,
        watchedAt: undefined,
        imageUrl: imageUrl || null,
        hasImage: hasImage !== undefined ? hasImage : !!imageUrl,
        imageType: imageType || (imageUrl ? 'uploaded' : 'other'),
        createdAt: new Date().toISOString(),
        userId,
      }

      // 🔥 CRITICAL: Log what we're saving
      console.log('[API /movies POST] Saving movie', {
        title: movieToSave.title,
        imageUrl: movieToSave.imageUrl ? movieToSave.imageUrl.substring(0, 80) : 'NULL/MISSING',
        hasImage: movieToSave.hasImage,
        imageType: movieToSave.imageType,
      })

      // Add to movies-to-watch collection
      const movie = new MovieToWatch({
        ...movieToSave,
        image: image || imageUrl || null, // Support both for backward compatibility
      })

      await movie.save()

      // Log activity
      await logActivity({
        userId,
        userName,
        action: 'add',
        movieId: movie._id.toString(),
        movieTitle: movie.title,
        details: 'Added to watchlist',
      })

      // 🔥 CRITICAL: Verify what was actually saved
      console.log('[API /movies POST] Movie saved to DB:', {
        id: movie._id.toString(),
        title: movie.title,
        imageUrlInDB: movie.imageUrl ? movie.imageUrl.substring(0, 80) : 'NULL/MISSING',
        hasImageInDB: movie.hasImage,
        imageTypeInDB: movie.imageType,
      })

      const movieData: MovieType = {
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        image: movie.image,
        imageUrl: movie.imageUrl,
        hasImage: movie.hasImage,
        imageType: movie.imageType,
        notes: movie.notes,
        watched: false,
        createdAt: movie.createdAt,
      }

      console.log('🟢 [API POST] Returning movie data:', {
        id: movieData.id,
        title: movieData.title,
        imageInResponse: movieData.image || 'NO IMAGE IN RESPONSE'
      })

      return NextResponse.json({ movie: movieData }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating movie:', error)
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    )
  }
}
