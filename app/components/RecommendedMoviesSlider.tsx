'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import { Movie } from '@/types/movie'
import MovieCard from './MovieCard'

const SLIDE_WIDTH = 180
const SLIDE_HEIGHT = 270
const SLIDE_GAP = 120
const ARC_DEPTH = 120
const CENTER_LIFT = 80
const SCROLL_LERP = 0.08

interface RecommendedMoviesSliderProps {
  movies: Movie[]
  onToggleWatched: (movie: Movie) => void
  onDelete: (movie: Movie) => void
  onUpdateRating: (movie: Movie, rating: number | undefined) => void
  currentUserId?: string
}

function computeSlideTransform(
  slideIndex: number,
  scrollOffset: number,
  slideCount: number,
  windowWidth: number,
  windowHeight: number
) {
  const trackWidth = slideCount * SLIDE_GAP
  let wrappedOffsetX =
    (((slideIndex * SLIDE_GAP - scrollOffset) % trackWidth) + trackWidth) %
    trackWidth
  if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth

  const windowCenterX = windowWidth / 2
  const arcBaselineY = windowHeight * 0.38
  const slideCenterX = windowCenterX + wrappedOffsetX
  const normalizedDist = (slideCenterX - windowCenterX) / (windowWidth * 0.5)
  const absDist = Math.min(Math.abs(normalizedDist), 1.3)

  const scaleFactor = Math.max(1 - absDist * 0.75, 0.3)
  const scaledWidth = SLIDE_WIDTH * scaleFactor
  const scaledHeight = SLIDE_HEIGHT * scaleFactor

  const clampedDist = Math.min(absDist, 1)
  const arcDropY = (1 - Math.cos(clampedDist * Math.PI)) * 0.5 * ARC_DEPTH
  const centerLiftY = Math.max(1 - absDist * 2, 0) * CENTER_LIFT

  return {
    x: slideCenterX - scaledWidth / 2,
    y: arcBaselineY - scaledHeight / 2 + arcDropY - centerLiftY,
    width: scaledWidth,
    height: scaledHeight,
    zIndex: Math.round((1 - absDist) * 100),
    distanceFromCenter: Math.abs(wrappedOffsetX),
  }
}

export default function RecommendedMoviesSlider({
  movies,
  onToggleWatched,
  onDelete,
  onUpdateRating,
  currentUserId,
}: RecommendedMoviesSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollTarget = useRef(0)
  const scrollCurrent = useRef(0)
  const rafId = useRef<number>(0)
  const dimensions = useRef({ w: 0, h: 0 })
  const [activeIndex, setActiveIndex] = useState(0)

  const slideCount = movies.length

  const layoutSlides = useCallback(() => {
    const container = containerRef.current
    const { w: areaWidth, h: areaHeight } = dimensions.current
    if (!container || areaWidth === 0) return

    let closestIndex = 0
    let closestDist = Infinity

    slideRefs.current.forEach((el, i) => {
      if (!el) return
      const transform = computeSlideTransform(
        i,
        scrollCurrent.current,
        slideCount,
        areaWidth,
        areaHeight
      )
      const { x, y, width, height, zIndex, distanceFromCenter } = transform
      gsap.set(el, {
        x,
        y,
        width,
        height,
        zIndex,
        force3D: true,
      })
      if (distanceFromCenter < closestDist) {
        closestDist = distanceFromCenter
        closestIndex = i
      }
    })

    setActiveIndex((prev) => (prev !== closestIndex ? closestIndex : prev))
  }, [slideCount])

  const animate = useCallback(() => {
    // Reduced motion: follow the wheel/touch directly instead of easing toward it
    const lerp = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : SCROLL_LERP
    scrollCurrent.current +=
      (scrollTarget.current - scrollCurrent.current) * lerp
    layoutSlides()
    rafId.current = requestAnimationFrame(animate)
  }, [layoutSlides])

  useEffect(() => {
    const container = containerRef.current
    if (!container || slideCount === 0) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        dimensions.current = { w: rect.width, h: rect.height }
      }
    }
    updateDimensions()
    layoutSlides()
    rafId.current = requestAnimationFrame(animate)

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollTarget.current += e.deltaY * 0.5
    }
    let touchStartX = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touchCurrentX = e.touches[0].clientX
      scrollTarget.current += (touchStartX - touchCurrentX) * 1.2
      touchStartX = touchCurrentX
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      cancelAnimationFrame(rafId.current)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [slideCount, animate, layoutSlides])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        dimensions.current = { w: rect.width, h: rect.height }
      }
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  if (movies.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: '420px' }}
    >
      <div className="relative w-full h-full" style={{ minHeight: '380px' }}>
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="absolute left-0 top-0 overflow-hidden rounded-lg shadow-xl"
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              pointerEvents: 'auto',
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-lg bg-[#181818]">
              <MovieCard
                movie={movie}
                onToggleWatched={() => onToggleWatched(movie)}
                onDelete={() => onDelete(movie)}
                onUpdateRating={(rating) => onUpdateRating(movie, rating)}
                currentUserId={currentUserId}
                isOwner={!!(currentUserId && movie.userId && currentUserId === movie.userId)}
              />
            </div>
          </div>
        ))}
      </div>
      <p
        className="absolute bottom-2 left-1/2 -translate-x-1/2 font-medium text-white text-lg md:text-xl text-center px-4"
        aria-live="polite"
      >
        {movies[activeIndex]?.title ?? ''}
      </p>
    </div>
  )
}
