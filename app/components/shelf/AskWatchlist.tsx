'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowRight, Film, RotateCcw, Sparkles } from 'lucide-react'
import { Movie } from '@/types/movie'
import { displayFont, editorialFont } from '@/app/fonts'

type Result = {
  status: 'match' | 'no_match' | 'empty'
  movie: { id: string; title: string; year?: number; imageUrl?: string | null } | null
  reason?: string
}
type Quota = { remaining: number; resetsAt: number }
type Props = {
  soonMovies: Movie[]
  moviesLoading: boolean
  onAddMovie: () => void
  onMarkSeen: (movie: Movie) => void
}

export default function AskWatchlist({ soonMovies, moviesLoading, onAddMovie, onMarkSeen }: Props) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [quota, setQuota] = useState<Quota | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  const empty = !moviesLoading && (soonMovies.length === 0 || result?.status === 'empty')
  const verifiedMovie = result?.movie && soonMovies.find(movie => movie.id === result.movie?.id)

  useEffect(() => {
    const controller = new AbortController()
    const refresh = async () => {
      try {
        const response = await fetch('/api/ask', { signal: controller.signal, cache: 'no-store' })
        if (response.ok) setQuota(await response.json())
      } catch { /* Asking still works if the initial quota lookup is unavailable. */ }
    }
    refresh()
    const timer = window.setInterval(refresh, 60000)
    return () => { controller.abort(); window.clearInterval(timer) }
  }, [])

  useEffect(() => {
    if (window.location.hash === '#ask') document.getElementById('ask')?.scrollIntoView()
  }, [])

  // Clear a recommendation after it leaves Soon, including after marking it as seen.
  useEffect(() => {
    if (result?.movie && !moviesLoading && !soonMovies.some(movie => movie.id === result.movie?.id)) setResult(null)
    if (result?.status === 'empty' && soonMovies.length) setResult(null)
  }, [soonMovies, moviesLoading, result])

  async function ask(value: string) {
    if (!value.trim() || pending.current || empty || moviesLoading || quota?.remaining === 0) return
    pending.current = true
    setQuestion(value)
    setLoading(true)
    setResult(null)
    setPosterFailed(false)
    setError('')
    try {
      const response = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: value.trim() }), signal: AbortSignal.timeout(60000),
      })
      const data = await response.json()
      if (typeof data.remaining === 'number') setQuota({ remaining: data.remaining, resetsAt: data.resetsAt })
      if (!response.ok) throw new Error(data.error || 'Could not get a recommendation. Please try again.')
      if (!['match', 'no_match', 'empty'].includes(data.status)) throw new Error('Could not get a recommendation. Please try again.')
      setResult(data)
    } catch (error) {
      setError(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The request timed out. Please try again.')
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void ask(question) }
  function askAgain() { setResult(null); setError(''); setQuestion(''); inputRef.current?.focus() }
  const disabled = loading || moviesLoading || empty || quota?.remaining === 0

  return (
    <section id="ask" className="mb-6 scroll-mt-6 rounded-md border border-[#f2ebdd]/15 bg-[#f2ebdd]/[0.03] p-5 sm:p-6" aria-labelledby="ask-watchlist-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ask-watchlist-title" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/70"><Sparkles size={15} aria-hidden="true" />Ask your watchlist</h2>
        <span className="font-mono text-[11px] text-[#f2ebdd]/45">{quota ? `${quota.remaining} left this hour` : '10 questions per hour'}</span>
      </div>
      <p id="ask-watchlist-hint" className={`${editorialFont.className} mt-3 text-xl text-[#f2ebdd]/90`}>A mood. A little time. Your next movie.</p>
      <p className="mt-1 text-sm text-[#f2ebdd]/50">Find tonight’s pick from your Soon list.</p>
      {empty ? (
        <div className="mt-5 rounded-[3px] border border-dashed border-[#f2ebdd]/15 p-5">
          <p className="text-sm text-[#f2ebdd]/75">Add movies to your Soon list first.</p>
          <a href="#add-movie" onClick={event => { event.preventDefault(); onAddMovie() }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#f2ebdd] underline underline-offset-4">Add Movie <ArrowRight size={14} /></a>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="watchlist-question" className="sr-only">What would you like to watch?</label>
            <input ref={inputRef} id="watchlist-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="e.g. something short and funny" maxLength={1000} required disabled={disabled} aria-describedby="ask-watchlist-hint" className="min-w-0 flex-1 rounded-[3px] border border-[#f2ebdd]/15 bg-[#0e0c0b] px-3 py-3 text-sm text-[#f2ebdd] placeholder:text-[#f2ebdd]/35 focus:outline-none focus:ring-2 focus:ring-[#dc2626] disabled:opacity-60" />
            <button type="submit" disabled={disabled || !question.trim()} className="rounded-[3px] bg-[#dc2626] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Finding your pick…' : 'Find my movie'}</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested moods">
            {['Funny', 'Short', 'Mind-bending', 'Feel-good'].map(mood => <button key={mood} type="button" disabled={disabled} onClick={() => void ask(mood)} className="rounded-full border border-[#f2ebdd]/15 px-3 py-1.5 text-xs text-[#f2ebdd]/65 transition-colors hover:border-[#f2ebdd]/40 hover:text-[#f2ebdd] disabled:opacity-40">{mood}</button>)}
          </div>
        </>
      )}
      {quota?.remaining === 0 && <p className="mt-3 text-sm text-[#f2ebdd]/60">You’ve used your questions for this hour. Come back when the next hour starts.</p>}
      <div role="status" aria-live="polite" aria-busy={loading || moviesLoading}>
        {(loading || moviesLoading) && <div className="mt-5 flex gap-4 rounded-[3px] border border-[#f2ebdd]/10 p-4"><span className="sr-only">Looking through your Soon list…</span><div aria-hidden="true" className="h-36 w-24 shrink-0 rounded bg-[#f2ebdd]/10 motion-safe:animate-pulse" /><div aria-hidden="true" className="flex-1 space-y-3 py-2 motion-safe:animate-pulse"><div className="h-6 w-2/3 rounded bg-[#f2ebdd]/10" /><div className="h-3 w-1/4 rounded bg-[#f2ebdd]/10" /><div className="h-3 rounded bg-[#f2ebdd]/10" /><div className="h-3 w-3/4 rounded bg-[#f2ebdd]/10" /></div></div>}
        {!loading && result?.status === 'match' && verifiedMovie && result.movie && (
          <article className="mt-5 flex flex-col gap-5 rounded-[3px] border border-[#f2ebdd]/15 bg-[#0e0c0b]/60 p-4 sm:flex-row sm:p-5">
            <div className="flex h-44 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-[#f2ebdd]/5">
              {result.movie.imageUrl && !posterFailed ? <img src={result.movie.imageUrl} alt={`${result.movie.title} poster`} onError={() => setPosterFailed(true)} className="h-full w-full object-cover" /> : <Film size={28} className="text-[#f2ebdd]/25" aria-label="No poster available" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2ebdd]/40">Tonight’s pick</p>
              <h3 className={`${displayFont.className} mt-2 text-3xl uppercase leading-tight`}>{result.movie.title}</h3>
              {result.movie.year && <p className="mt-1 text-xs text-[#f2ebdd]/45">{result.movie.year}</p>}
              <p className="mt-3 text-sm leading-relaxed text-[#f2ebdd]/75">{result.reason}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => onMarkSeen(verifiedMovie)} className="rounded-[3px] bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]">Mark as seen</button>
                <button type="button" onClick={askAgain} className="inline-flex items-center gap-2 px-2 py-2 text-sm text-[#f2ebdd]/65 hover:text-[#f2ebdd]"><RotateCcw size={14} />Ask again</button>
              </div>
            </div>
          </article>
        )}
        {!loading && result?.status === 'no_match' && <div className="mt-5 rounded-[3px] border border-dashed border-[#f2ebdd]/15 p-5"><p className={`${editorialFont.className} text-lg text-[#f2ebdd]/80`}>Nothing on your Soon list fits that.</p><p className="mt-1 text-sm text-[#f2ebdd]/50">Try another mood or add a few more movies.</p><button type="button" onClick={askAgain} className="mt-3 text-sm text-[#f2ebdd] underline underline-offset-4">Ask again</button></div>}
      </div>
      {error && <div role="alert" className="mt-5 rounded-[3px] border border-[#f87171]/25 bg-[#f87171]/5 p-4"><p className="text-sm text-[#f87171]">{error}</p><button type="button" disabled={disabled} onClick={() => void ask(question)} className="mt-2 text-sm text-[#f2ebdd]/75 underline underline-offset-4 disabled:opacity-40">Try again</button></div>}
    </section>
  )
}
