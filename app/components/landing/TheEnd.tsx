'use client'

import { CSSProperties, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { displayFont, editorialFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { gsap, MOTION_OK, useIsomorphicLayoutEffect } from './gsap'

const NOTCH = 9

// Half-circle notches on the left and right edges of the ticket button
const sideNotches = (() => {
  const mask = [
    `radial-gradient(circle at 0 50%, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) left / 51% 100% no-repeat`,
    `radial-gradient(circle at 100% 50%, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) right / 51% 100% no-repeat`,
  ].join(', ')
  return { mask, WebkitMask: mask } as CSSProperties
})()

interface TheEndProps {
  ctaLabel: string
  onCta: () => void
}

export default function TheEnd({ ctaLabel, onCta }: TheEndProps) {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      // Uneven brightness steps, like a projector lamp catching
      gsap.fromTo(
        titleRef.current,
        { opacity: 0 },
        {
          keyframes: { opacity: [0, 0.7, 0.15, 0.85, 0.4, 1, 0.75, 1] },
          duration: 1.4,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        }
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative z-10 bg-black px-4 py-24 text-center sm:py-32">
      <h2 ref={titleRef} className={`${editorialFont.className} text-7xl text-[#f2ebdd] sm:text-8xl lg:text-9xl`}>
        {t.landing.theEnd}
      </h2>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/50">{t.landing.endCaption}</p>

      <button
        type="button"
        onClick={onCta}
        className="group mt-14 inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2ebdd]"
      >
        <span
          className="relative flex items-stretch bg-[#f2ebdd] text-left text-[#1a1714] transition-transform duration-200 group-hover:-translate-y-0.5"
          style={sideNotches}
        >
          <span className="pointer-events-none absolute inset-1.5 border border-dashed border-[#1a1714]/25" aria-hidden="true" />
          <span className="flex flex-col justify-center py-4 pl-7 pr-5 sm:py-5 sm:pl-9 sm:pr-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1a1714]/60">{t.landing.admitOne}</span>
            <span className={`${displayFont.className} mt-1 text-2xl uppercase leading-none sm:text-3xl`}>{ctaLabel}</span>
          </span>
          <span className="flex items-center border-l-2 border-dashed border-[#1a1714]/30 pl-4 pr-6 text-[#dc2626] sm:pl-5 sm:pr-8">
            <ArrowRight size={22} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </span>
      </button>
    </section>
  )
}
