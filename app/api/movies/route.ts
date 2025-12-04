import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import MovieToWatch from '@/app/models/MovieToWatch'
import MovieWatched from '@/app/models/MovieWatched'
import { Movie as MovieType } from '@/types/movie'
import { getUserFromRequestCookie } from '@/lib/auth'

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
    
    const user = getUserFromRequestCookie()
    
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.userId

    // Get movies from both collections
    const [toWatchMovies, watchedMovies] = await Promise.all([
      MovieToWatch.find({ userId }).sort({ createdAt: -1 }),
      MovieWatched.find({ userId }).sort({ createdAt: -1 }),
    ])
    
    const allMovies: MovieType[] = [
      ...toWatchMovies.map((movie) => ({
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        notes: movie.notes,
        rating: movie.rating,
        watched: false,
        createdAt: movie.createdAt,
        watchedAt: movie.watchedAt,
      })),
      ...watchedMovies.map((movie) => ({
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        notes: movie.notes,
        rating: movie.rating,
        watched: true,
        createdAt: movie.createdAt,
        watchedAt: movie.watchedAt,
      })),
    ]

    // Sort by creation date
    allMovies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
    
    const user = getUserFromRequestCookie()
    
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.userId

    const body = await request.json()
    const { title, year, genre, notes, watched, rating } = body

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
        notes,
        rating,
        watched: true,
        createdAt: new Date().toISOString(),
        watchedAt: new Date().toISOString(),
        userId,
      })

      await movie.save()

      const movieData: MovieType = {
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        notes: movie.notes,
        rating: movie.rating,
        watched: true,
        createdAt: movie.createdAt,
        watchedAt: movie.watchedAt,
      }

      return NextResponse.json({ movie: movieData }, { status: 201 })
    } else {
      // Add to movies-to-watch collection
      const movie = new MovieToWatch({
        title,
        year,
        genre,
        notes,
        watched: false,
        createdAt: new Date().toISOString(),
        userId,
      })

      await movie.save()

      const movieData: MovieType = {
        id: movie._id.toString(),
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        notes: movie.notes,
        watched: false,
        createdAt: movie.createdAt,
      }

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
