'use client'

import { CSSProperties, ReactNode, useRef } from 'react'
import { Star } from 'lucide-react'
import { displayFont, editorialFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { gsap, MOTION_OK, MOTION_REDUCED, useIsomorphicLayoutEffect } from './gsap'

const TEETH = 16
const TOOTH_DEPTH = 7
const NOTCH = 11

const percent = (i: number) => `${((i / TEETH) * 100).toFixed(2)}%`

// Interlocking zigzag edges: the body's right edge and the stub's left edge fit together exactly
const tornBodyClip = `polygon(0 0, ${Array.from({ length: TEETH + 1 }, (_, i) =>
  `${i % 2 === 0 ? `calc(100% - ${TOOTH_DEPTH}px)` : '100%'} ${percent(i)}`
).join(', ')}, 0 100%)`

const tornStubClip = `polygon(100% 0, 100% 100%, ${Array.from({ length: TEETH + 1 }, (_, k) => {
  const i = TEETH - k
  return `${i % 2 === 0 ? '0' : `${TOOTH_DEPTH}px`} ${percent(i)}`
}).join(', ')})`

// Half-circle notches where the body meets the stub (top and bottom of the perforation)
const notchMask = (x: '0' | '100%'): CSSProperties => {
  const mask = [
    `radial-gradient(circle at ${x} 0, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) top / 100% 51% no-repeat`,
    `radial-gradient(circle at ${x} 100%, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) bottom / 100% 51% no-repeat`,
  ].join(', ')
  return { mask, WebkitMask: mask }
}

function DashedFrame() {
  return <span className="pointer-events-none absolute inset-2 border border-dashed border-[#1a1714]/25" aria-hidden="true" />
}

function StubLabel({ children, number }: { children: ReactNode; number: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-5">
      <span className="font-mono text-[10px] tracking-[0.2em] text-[#1a1714]/50">{number}</span>
      <span
        className={`${displayFont.className} text-2xl uppercase tracking-wide text-[#1a1714] sm:text-3xl`}
        style={{ writingMode: 'vertical-rl' }}
      >
        {children}
      </span>
      <span className="font-mono text-[10px] tracking-[0.2em] text-[#1a1714]/50">{number}</span>
    </div>
  )
}

export default function TicketStubs() {
  const { t } = useLanguage()
  const seenRef = useRef<HTMLDivElement>(null)
  const stubRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const torn = { x: 22, y: 14, rotate: 10, transformOrigin: '0% 100%' }
    mm.add(MOTION_OK, () => {
      gsap.to(stubRef.current, {
        ...torn,
        duration: 0.9,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: seenRef.current, start: 'top 70%', once: true },
      })
    })
    // No motion: show the stub already torn off
    mm.add(MOTION_REDUCED, () => {
      gsap.set(stubRef.current, torn)
    })
    return () => mm.revert()
  }, [])

  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
      {/* SEEN: torn ticket */}
      <div ref={seenRef} className="-rotate-2 pr-6 md:pr-8">
        <div className="flex text-[#1a1714] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.9)]">
          <div className="relative min-w-0 flex-1 bg-[#f2ebdd] p-6 pr-8 sm:p-8 sm:pr-10" style={{ clipPath: tornBodyClip }}>
            <DashedFrame />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1a1714]/60">No. 0419 · 2019</p>
            <h3 className={`${displayFont.className} mt-2 text-4xl uppercase leading-none sm:text-5xl`}>Parasite</h3>
            <p className="mt-2 text-sm text-[#1a1714]/70">
              {t.addMovie.directedBy} Bong Joon Ho
            </p>
            <div className="mt-4 flex gap-1" role="img" aria-label="5/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="fill-[#1a1714] text-[#1a1714]" />
              ))}
            </div>
            <p className={`${editorialFont.className} mt-4 -rotate-1 text-lg leading-snug text-[#1a1714]/90 sm:text-xl`}>
              “{t.landing.seenNote}”
            </p>
          </div>
          <div
            ref={stubRef}
            className="relative w-[76px] flex-none bg-[#f2ebdd] sm:w-[92px]"
            style={{ clipPath: tornStubClip, marginLeft: -TOOTH_DEPTH }}
          >
            <StubLabel number="0419">{t.landing.ticketSeen}</StubLabel>
          </div>
        </div>
      </div>

      {/* SOON: intact ticket */}
      <div className="flex text-[#1a1714] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.9)] md:mt-10">
        <div className="relative min-w-0 flex-1 bg-[#f2ebdd] p-6 sm:p-8" style={notchMask('100%')}>
          <DashedFrame />
          <span
            className={`${displayFont.className} relative mb-4 inline-block rotate-[-4deg] rounded-[3px] border-2 border-[#dc2626] px-2 pb-0.5 pt-1 text-sm uppercase tracking-[0.15em] text-[#dc2626] sm:absolute sm:right-7 sm:top-7 sm:mb-0 sm:rotate-[8deg] sm:text-base`}
          >
            {t.landing.admitOne}
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1a1714]/60 sm:pr-28">No. 0420 · 2023</p>
          <h3 className={`${displayFont.className} mt-2 text-4xl sm:pr-16 uppercase leading-none sm:text-5xl`}>Perfect Days</h3>
          <p className="mt-2 text-sm text-[#1a1714]/70">
            {t.addMovie.directedBy} Wim Wenders
          </p>
          <div className="mt-5 border-t border-dotted border-[#1a1714]/30 pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1a1714]/60">{t.landing.whereToWatch}</p>
            <p className="mt-1 text-sm font-medium">{t.landing.whereToWatchValue}</p>
          </div>
        </div>
        <div
          className="relative w-[76px] flex-none border-l-2 border-dashed border-[#1a1714]/30 bg-[#f2ebdd] sm:w-[92px]"
          style={notchMask('0')}
        >
          <StubLabel number="0420">{t.landing.ticketSoon}</StubLabel>
        </div>
      </div>
    </div>
  )
}
