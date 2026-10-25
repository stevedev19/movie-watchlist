import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequestCookie } from '@/lib/auth'
import { getMovieDetails, tmdbLanguage, TmdbError } from '@/app/lib/tmdb'

export const dynamic = 'force-dynamic'

// GET /api/tmdb/movie/[id]?lang=en|ko|uz - TMDB movie details with director and top cast
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!getUserFromRequestCookie()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!/^\d{1,10}$/.test(params.id)) {
    return NextResponse.json({ error: 'Invalid TMDB movie ID' }, { status: 400 })
  }

  try {
    const language = tmdbLanguage(request.nextUrl.searchParams.get('lang'))
    const movie = await getMovieDetails(parseInt(params.id, 10), language)
    return NextResponse.json({ movie })
  } catch (error) {
    if (error instanceof TmdbError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error(`[API /tmdb/movie/${params.id}] Unexpected error:`, error)
    return NextResponse.json({ error: 'Failed to load movie details' }, { status: 500 })
  }
}
