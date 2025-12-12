import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import MovieToWatch from '@/app/models/MovieToWatch'
import MovieWatched from '@/app/models/MovieWatched'
import MovieDeleted from '@/app/models/MovieDeleted'
import { Movie as MovieType } from '@/types/movie'
import mongoose from 'mongoose'
import { getUserFromRequestCookie } from '@/lib/auth'
import { logActivity } from '@/app/lib/activity-logger'

export const dynamic = 'force-dynamic'

const normalizeImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const lowered = trimmed.toLowerCase()
  if (['none', 'null', 'undefined', 'false', '0'].includes(lowered)) return null
  return trimmed
}

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
    
    // Allow guest mode when no auth cookie is present
    const user = getUserFromRequestCookie() || { userId: 'guest', name: 'Guest' }
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

    const normalizedImageUrl = normalizeImageUrl(movie.imageUrl) || normalizeImageUrl(movie.image)
    const normalizedImage = normalizeImageUrl(movie.image)
    const hasImage = normalizedImageUrl ? true : movie.hasImage !== undefined ? !!movie.hasImage : false
    const imageType = movie.imageType || (normalizedImageUrl ? 'uploaded' : 'other')

    const movieData: MovieType = {
      id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      image: normalizedImage || undefined,
      imageUrl: normalizedImageUrl,
      hasImage,
      imageType,
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
    
    // Authentication required for PUT
    const user = getUserFromRequestCookie()
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const userId = user.userId
    const userName = user.name || 'Unknown'

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, year, genre, image, imageUrl, hasImage, imageType, notes, watched, rating, watchedAt } = body

    // Find which collection the movie is in
    const movieInToWatch = await MovieToWatch.findById(params.id)
    const movieInWatched = await MovieWatched.findById(params.id)

    if (!movieInToWatch && !movieInWatched) {
      console.error(`[PUT /api/movies/${params.id}] Movie not found in any collection. userId: ${userId}`)
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Check ownership - user can only edit their own movies
    const existingMovie = movieInToWatch || movieInWatched
    if (!existingMovie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }
    if (existingMovie.userId) {
      const movieUserId = existingMovie.userId.toString()
      if (movieUserId !== userId) {
        console.error(`[PUT /api/movies/${params.id}] Unauthorized access attempt. Movie userId: ${movieUserId}, Request userId: ${userId}`)
        return NextResponse.json(
          { error: 'Unauthorized: You can only edit your own movies' },
          { status: 403 }
        )
      }
    }

    // If watched status is changing, move between collections
    if (watched !== undefined) {
      // Case 1: Mark as watched (move from to-watch to watched)
      if (watched === true && movieInToWatch) {
        // Move from to-watch to watched
        const incomingImageUrl = normalizeImageUrl(imageUrl ?? image)
        const sourceImageUrl = normalizeImageUrl(movieInToWatch.imageUrl) || normalizeImageUrl(movieInToWatch.image)
        const finalImageUrl = incomingImageUrl ?? sourceImageUrl
        const finalImage = normalizeImageUrl(image) || incomingImageUrl || sourceImageUrl
        const finalHasImage = finalImageUrl ? true : hasImage !== undefined ? !!hasImage : false
        const finalImageType = imageType || movieInToWatch.imageType || (finalImageUrl ? 'uploaded' : 'other')

        const movieData = {
          title: title || movieInToWatch.title,
          year: year !== undefined ? year : movieInToWatch.year,
          genre: genre !== undefined ? genre : movieInToWatch.genre,
          image: finalImage || undefined,
          imageUrl: finalImageUrl,
          hasImage: finalHasImage,
          imageType: finalImageType,
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

        // Log activity - marked as watched
        await logActivity({
          userId,
          userName,
          action: 'watch',
          movieId: newMovie._id.toString(),
          movieTitle: newMovie.title,
          details: 'Marked movie as watched',
        })

        const movieResult: MovieType = {
          id: newMovie._id.toString(),
          title: newMovie.title,
          year: newMovie.year,
          genre: newMovie.genre,
          image: normalizeImageUrl(newMovie.image) || undefined,
          imageUrl: normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image),
          hasImage: newMovie.hasImage !== undefined ? !!newMovie.hasImage && !!(normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)) : !!(normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)),
          imageType: newMovie.imageType || ((normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)) ? 'uploaded' : 'other'),
          notes: newMovie.notes,
          rating: newMovie.rating,
          watched: true,
          createdAt: newMovie.createdAt,
          watchedAt: newMovie.watchedAt,
        }

        return NextResponse.json({ movie: movieResult })
      } 
      // Case 2: Mark as unwatched (move from watched to to-watch)
      else if (watched === false && movieInWatched) {
        // Move from watched to to-watch
        const incomingImageUrl = normalizeImageUrl(imageUrl ?? image)
        const sourceImageUrl = normalizeImageUrl(movieInWatched.imageUrl) || normalizeImageUrl(movieInWatched.image)
        const finalImageUrl = incomingImageUrl ?? sourceImageUrl
        const finalImage = normalizeImageUrl(image) || incomingImageUrl || sourceImageUrl
        const finalHasImage = finalImageUrl ? true : hasImage !== undefined ? !!hasImage : false
        const finalImageType = imageType || movieInWatched.imageType || (finalImageUrl ? 'uploaded' : 'other')

        const movieData = {
          title: title || movieInWatched.title,
          year: year !== undefined ? year : movieInWatched.year,
          genre: genre !== undefined ? genre : movieInWatched.genre,
          image: finalImage || undefined,
          imageUrl: finalImageUrl,
          hasImage: finalHasImage,
          imageType: finalImageType,
          notes: notes !== undefined ? notes : movieInWatched.notes,
          watched: false,
          createdAt: movieInWatched.createdAt,
          userId,
        }

        const newMovie = new MovieToWatch(movieData)
        await newMovie.save()
        await MovieWatched.findByIdAndDelete(params.id)

        // Log activity - marked as unwatched
        await logActivity({
          userId,
          userName,
          action: 'unwatch',
          movieId: newMovie._id.toString(),
          movieTitle: newMovie.title,
          details: 'Marked movie as unwatched',
        })

        const movieResult: MovieType = {
          id: newMovie._id.toString(),
          title: newMovie.title,
          year: newMovie.year,
          genre: newMovie.genre,
          image: normalizeImageUrl(newMovie.image) || undefined,
          imageUrl: normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image),
          hasImage: newMovie.hasImage !== undefined ? !!newMovie.hasImage && !!(normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)) : !!(normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)),
          imageType: newMovie.imageType || ((normalizeImageUrl(newMovie.imageUrl) || normalizeImageUrl(newMovie.image)) ? 'uploaded' : 'other'),
          notes: newMovie.notes,
          watched: false,
          createdAt: newMovie.createdAt,
        }

        return NextResponse.json({ movie: movieResult })
      }
      // Case 3: Watched status matches current collection - just update other fields
      // (e.g., movie is already watched and we're updating watched: true, or already unwatched and updating watched: false)
      // This can happen if the frontend sends the current watched status
    }

    // Update in place if not changing watched status or if watched status already matches
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (year !== undefined) updateData.year = year
    if (genre !== undefined) updateData.genre = genre
    // Handle image update - allow setting to null/undefined to clear it
    if (image !== undefined) {
      updateData.image = normalizeImageUrl(image) || null
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = normalizeImageUrl(imageUrl) || null
    }
    if (hasImage !== undefined) {
      updateData.hasImage = !!hasImage || !!(normalizeImageUrl(imageUrl) || normalizeImageUrl(image))
    } else if (image !== undefined || imageUrl !== undefined) {
      const candidate = normalizeImageUrl(imageUrl) || normalizeImageUrl(image)
      updateData.hasImage = !!candidate
    }
    if (imageType !== undefined) {
      updateData.imageType = imageType || ((normalizeImageUrl(imageUrl) || normalizeImageUrl(image)) ? 'uploaded' : 'other')
    }
    if (notes !== undefined) updateData.notes = notes
    if (rating !== undefined) updateData.rating = rating
    if (watchedAt !== undefined) updateData.watchedAt = watchedAt

    let updatedMovie
    if (movieInToWatch) {
      updatedMovie = await MovieToWatch.findByIdAndUpdate(
        params.id,
        updateData,
        { new: true, runValidators: true }
      )
    } else if (movieInWatched) {
      updatedMovie = await MovieWatched.findByIdAndUpdate(
        params.id,
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

    // Log activity - update movie
    const actionType = rating !== undefined ? 'rate' : 'update'
    const details = rating !== undefined 
      ? `Rated movie ${rating}/5` 
      : 'Updated movie details'
    
    await logActivity({
      userId,
      userName,
      action: actionType,
      movieId: updatedMovie._id.toString(),
      movieTitle: updatedMovie.title,
      details,
    })

    const normalizedImageUrl = normalizeImageUrl(updatedMovie.imageUrl) || normalizeImageUrl(updatedMovie.image)
    const normalizedImage = normalizeImageUrl(updatedMovie.image)
    const finalHasImage = normalizedImageUrl ? true : updatedMovie.hasImage !== undefined ? !!updatedMovie.hasImage : false
    const finalImageType = updatedMovie.imageType || (normalizedImageUrl ? 'uploaded' : 'other')

    const movieData: MovieType = {
      id: updatedMovie._id.toString(),
      title: updatedMovie.title,
      year: updatedMovie.year,
      genre: updatedMovie.genre,
      image: normalizedImage || undefined,
      imageUrl: normalizedImageUrl,
      hasImage: finalHasImage,
      imageType: finalImageType,
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
    const userName = user.name || 'Unknown'

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    // Find which collection the movie is in (check ownership)
    let movie = await MovieToWatch.findById(params.id)
    let sourceCollection = 'to-watch'

    if (!movie) {
      movie = await MovieWatched.findById(params.id)
      sourceCollection = 'watched'
    }

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Check ownership - user can only delete their own movies
    if (movie.userId && movie.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own movies' },
        { status: 403 }
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

    // Log activity - delete movie
    await logActivity({
      userId,
      userName,
      action: 'delete',
      movieId: params.id,
      movieTitle: movie.title,
      details: 'Deleted movie',
    })

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
