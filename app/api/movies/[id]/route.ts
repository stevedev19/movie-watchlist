import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import MovieToWatch from '@/app/models/MovieToWatch'
import MovieWatched from '@/app/models/MovieWatched'
import MovieDeleted from '@/app/models/MovieDeleted'
import { Movie as MovieType } from '@/types/movie'
import mongoose from 'mongoose'
import { getUserFromRequestCookie } from '@/lib/auth'

// GET /api/movies/[id] - Get a single movie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    // Check both collections
    let movie = await MovieToWatch.findOne({ _id: params.id, userId })
    let isWatched = false

    if (!movie) {
      movie = await MovieWatched.findOne({ _id: params.id, userId })
      isWatched = true
    }

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    const movieData: MovieType = {
      id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      notes: movie.notes,
      rating: movie.rating,
      watched: isWatched,
      createdAt: movie.createdAt,
      watchedAt: movie.watchedAt,
    }

    return NextResponse.json({ movie: movieData })
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
}

// PUT /api/movies/[id] - Update a movie (handles moving between collections)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, year, genre, notes, watched, rating, watchedAt } = body

    // Find which collection the movie is in
    let movieInToWatch = await MovieToWatch.findOne({ _id: params.id, userId })
    let movieInWatched = await MovieWatched.findOne({ _id: params.id, userId })

    if (!movieInToWatch && !movieInWatched) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // If watched status is changing, move between collections
    if (watched !== undefined) {
      if (watched === true && movieInToWatch) {
        // Move from to-watch to watched
        const movieData = {
          title: title || movieInToWatch.title,
          year: year !== undefined ? year : movieInToWatch.year,
          genre: genre !== undefined ? genre : movieInToWatch.genre,
          notes: notes !== undefined ? notes : movieInToWatch.notes,
          rating: rating !== undefined ? rating : movieInToWatch.rating,
          watched: true,
          createdAt: movieInToWatch.createdAt,
          watchedAt: watchedAt || new Date().toISOString(),
          userId,
        }

        const newMovie = new MovieWatched(movieData)
        await newMovie.save()
        await MovieToWatch.findByIdAndDelete(params.id)

        const movieResult: MovieType = {
          id: newMovie._id.toString(),
          title: newMovie.title,
          year: newMovie.year,
          genre: newMovie.genre,
          notes: newMovie.notes,
          rating: newMovie.rating,
          watched: true,
          createdAt: newMovie.createdAt,
          watchedAt: newMovie.watchedAt,
        }

        return NextResponse.json({ movie: movieResult })
      } else if (watched === false && movieInWatched) {
        // Move from watched to to-watch
        const movieData = {
          title: title || movieInWatched.title,
          year: year !== undefined ? year : movieInWatched.year,
          genre: genre !== undefined ? genre : movieInWatched.genre,
          notes: notes !== undefined ? notes : movieInWatched.notes,
          watched: false,
          createdAt: movieInWatched.createdAt,
          userId,
        }

        const newMovie = new MovieToWatch(movieData)
        await newMovie.save()
        await MovieWatched.findByIdAndDelete(params.id)

        const movieResult: MovieType = {
          id: newMovie._id.toString(),
          title: newMovie.title,
          year: newMovie.year,
          genre: newMovie.genre,
          notes: newMovie.notes,
          watched: false,
          createdAt: newMovie.createdAt,
        }

        return NextResponse.json({ movie: movieResult })
      }
    }

    // Update in place if not changing watched status
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (year !== undefined) updateData.year = year
    if (genre !== undefined) updateData.genre = genre
    if (notes !== undefined) updateData.notes = notes
    if (rating !== undefined) updateData.rating = rating
    if (watchedAt !== undefined) updateData.watchedAt = watchedAt

    let updatedMovie
    if (movieInToWatch) {
      updatedMovie = await MovieToWatch.findOneAndUpdate(
        { _id: params.id, userId },
        updateData,
        { new: true, runValidators: true }
      )
    } else if (movieInWatched) {
      updatedMovie = await MovieWatched.findOneAndUpdate(
        { _id: params.id, userId },
        updateData,
        { new: true, runValidators: true }
      )
    }

    if (!updatedMovie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    const movieData: MovieType = {
      id: updatedMovie._id.toString(),
      title: updatedMovie.title,
      year: updatedMovie.year,
      genre: updatedMovie.genre,
      notes: updatedMovie.notes,
      rating: updatedMovie.rating,
      watched: !!movieInWatched,
      createdAt: updatedMovie.createdAt,
      watchedAt: updatedMovie.watchedAt,
    }

    return NextResponse.json({ movie: movieData })
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    )
  }
}

// DELETE /api/movies/[id] - Soft delete (move to movies-deleted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    // Find which collection the movie is in
    let movie = await MovieToWatch.findOne({ _id: params.id, userId })
    let sourceCollection = 'to-watch'

    if (!movie) {
      movie = await MovieWatched.findOne({ _id: params.id, userId })
      sourceCollection = 'watched'
    }

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Move to deleted collection
    const deletedMovie = new MovieDeleted({
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      notes: movie.notes,
      rating: movie.rating,
      watched: movie.watched,
      createdAt: movie.createdAt,
      watchedAt: movie.watchedAt,
      deletedAt: new Date().toISOString(),
      userId,
    })

    await deletedMovie.save()

    // Remove from original collection
    if (sourceCollection === 'to-watch') {
      await MovieToWatch.findByIdAndDelete(params.id)
    } else {
      await MovieWatched.findByIdAndDelete(params.id)
    }

    return NextResponse.json({ 
      message: 'Movie deleted successfully',
      deletedMovie: {
        id: deletedMovie._id.toString(),
        title: deletedMovie.title,
        deletedAt: deletedMovie.deletedAt,
      }
    })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}
