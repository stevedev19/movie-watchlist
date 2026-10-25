'use client'

import { ReactNode, useRef } from 'react'
import { gsap, MOTION_OK, useIsomorphicLayoutEffect } from './gsap'

const BULBS_PER_ROW = 20

function BulbRow() {
  return (
    <div className="flex justify-between px-4 py-3 sm:px-6" aria-hidden="true">
      {Array.from({ length: BULBS_PER_ROW }).map((_, i) => (
        <span key={i} data-bulb className="h-1.5 w-1.5 rounded-full bg-[#f2ebdd]" />
      ))}
    </div>
  )
}

// Dark marquee panel with a row of bulbs along the top and bottom edges
export default function MarqueeBoard({ children }: { children: ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      const bulbs = gsap.utils.toArray<HTMLElement>('[data-bulb]', boardRef.current)
      gsap
        .timeline()
        // Light up from both ends toward the middle, like a marquee warming up
        .fromTo(
          bulbs,
          { opacity: 0.12 },
          { opacity: 1, duration: 0.3, ease: 'power1.out', stagger: { each: 0.025, from: 'edges' } }
        )
        // Then a slow, low-contrast twinkle
        .to(bulbs, {
          opacity: 0.55,
          duration: 1.4,
          ease: 'sine.inOut',
          stagger: { each: 0.3, from: 'random', repeat: -1, yoyo: true },
        })
    }, boardRef)
    return () => mm.revert()
  }, [])

  return (
    <div ref={boardRef} className="rounded-[3px] border border-[#f2ebdd]/15 bg-[#151210]">
      <BulbRow />
      <div className="border-y border-[#f2ebdd]/10 px-5 py-7 sm:px-8 sm:py-9">{children}</div>
      <BulbRow />
    </div>
  )
}
