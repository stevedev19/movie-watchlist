import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequestCookie } from '@/lib/auth'
import { searchMovies, tmdbLanguage, TmdbError } from '@/app/lib/tmdb'

export const dynamic = 'force-dynamic'

// GET /api/tmdb/search?q=...&lang=en|ko|uz - Search TMDB movies (max 8 results)
export async function GET(request: NextRequest) {
  // Only signed-in users can add movies, so only they can use our TMDB quota
  if (!getUserFromRequestCookie()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ error: 'Query must be 2–100 characters' }, { status: 400 })
  }

  try {
    const language = tmdbLanguage(request.nextUrl.searchParams.get('lang'))
    const results = await searchMovies(query, language)
    return NextResponse.json({ results })
  } catch (error) {
    if (error instanceof TmdbError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[API /tmdb/search] Unexpected error:', error)
    return NextResponse.json({ error: 'Movie search failed' }, { status: 500 })
  }
}
