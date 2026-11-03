import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequestCookie } from '@/lib/auth'
import connectDB from '@/app/lib/mongodb'
import MovieToWatch from '@/app/models/MovieToWatch'
import { consumeAskQuota, getAskQuota } from '@/app/lib/ask-rate-limit'
import { recommendMovie, isProviderConfigured, isProviderRateLimit, RATE_LIMIT_MESSAGE } from '@/app/lib/watchlist-ai'
import { EMBEDDING_MODEL, createEmbedding, cosineSimilarity, isEmbedding } from '@/lib/watchlist-embeddings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOTHING_FITS = 'Nothing on your Soon list fits that. Try another mood or add a few more movies.'

export async function GET() {
  const user = getUserFromRequestCookie()
  if (!user?.userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  try {
    await connectDB()
    return NextResponse.json(await getAskQuota(user.userId))
  } catch {
    return NextResponse.json({ error: 'Could not check your remaining questions.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequestCookie()
  if (!user?.userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON question.' }, { status: 400 })
  }
  const question = body && typeof body === 'object' && 'question' in body ? body.question : undefined
  if (typeof question !== 'string' || !question.trim() || question.length > 1000) {
    return NextResponse.json({ error: 'Enter a question between 1 and 1,000 characters.' }, { status: 400 })
  }
  if (!isProviderConfigured() || !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Watchlist recommendations are not configured yet.' }, { status: 503 })
  }

  let quotaInfo = {}
  try {
    await connectDB()
    const quota = await consumeAskQuota(user.userId)
    quotaInfo = { remaining: quota.remaining, resetsAt: quota.resetsAt }
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'You’ve reached 10 questions this hour. Please try again when the next hour starts.', ...quotaInfo },
        { status: 429, headers: { 'Retry-After': String(quota.retryAfter) } },
      )
    }
    const movies = await MovieToWatch.find({ userId: user.userId, watched: false })
      .select('title year imageUrl image posterPath genre genres overview runtime +embedding +embeddingModel').lean()
    if (!movies.length) {
      return NextResponse.json({ status: 'empty', movie: null, ...quotaInfo })
    }
    // Avoid silently ignoring legacy movies until the backfill has been run.
    if (movies.some(movie => movie.embeddingModel !== EMBEDDING_MODEL || !isEmbedding(movie.embedding))) {
      return NextResponse.json({ error: 'Your watchlist is still being prepared for recommendations. Please try again after its embeddings have been created.', ...quotaInfo }, { status: 503 })
    }
    const questionEmbedding = await createEmbedding(question.trim(), 'RETRIEVAL_QUERY')
    const candidates = movies
      .map(movie => ({ movie, score: cosineSimilarity(questionEmbedding, movie.embedding!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ movie }) => ({
        id: movie._id.toString(), title: movie.title, year: movie.year,
        genre: movie.genre, genres: movie.genres, overview: movie.overview, runtime: movie.runtime,
      }))
    const answer = await recommendMovie(question.trim(), candidates)
    // Verify against the actual retrieved Soon documents, never trust model titles/posters.
    const movie = candidates.some(candidate => candidate.id === answer.movieId)
      ? movies.find(movie => movie._id.toString() === answer.movieId)
      : undefined
    if (!movie) {
      return NextResponse.json({ status: 'no_match', movie: null, reason: NOTHING_FITS, ...quotaInfo })
    }
    return NextResponse.json({
      status: 'match',
      movie: {
        id: movie._id.toString(), title: movie.title, year: movie.year,
        imageUrl: movie.imageUrl || movie.image || (movie.posterPath ? `https://image.tmdb.org/t/p/w342${movie.posterPath}` : null),
      },
      reason: answer.reason, ...quotaInfo,
    })
  } catch (error) {
    if (isProviderRateLimit(error)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE, ...quotaInfo }, { status: 429, headers: { 'Retry-After': '60' } })
    }
    return NextResponse.json({ error: 'Could not get a recommendation right now. Please try again.', ...quotaInfo }, { status: 502 })
  }
}
