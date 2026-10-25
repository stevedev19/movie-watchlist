'use client'

import { useRef } from 'react'
import { displayFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { gsap, MOTION_OK, useIsomorphicLayoutEffect } from './gsap'

// End-credits list: role on the left, name on the right, dotted leaders between
export default function CreditsRoll() {
  const { t } = useLanguage()
  const listRef = useRef<HTMLDListElement>(null)

  const credits = [
    [t.landing.creditSearch, t.landing.creditSearchValue],
    [t.landing.creditMark, t.landing.creditMarkValue],
    [t.landing.creditRate, t.landing.creditRateValue],
    [t.landing.creditDiscover, t.landing.creditDiscoverValue],
  ]

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.from(gsap.utils.toArray<HTMLElement>('[data-credit]', listRef.current), {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.18,
        scrollTrigger: { trigger: listRef.current, start: 'top 80%', once: true },
      })
    }, listRef)
    return () => mm.revert()
  }, [])

  return (
    <dl ref={listRef} className="mx-auto max-w-2xl space-y-6">
      {credits.map(([role, name]) => (
        <div key={role} data-credit className="flex items-baseline gap-3 sm:gap-4">
          <dt className={`${displayFont.className} shrink-0 text-xl uppercase tracking-wide text-[#f2ebdd] sm:text-2xl`}>
            {role}
          </dt>
          <span
            className="min-w-[1.5rem] flex-1 -translate-y-1 border-b-2 border-dotted border-[#f2ebdd]/30"
            aria-hidden="true"
          />
          <dd className="max-w-[60%] text-right text-sm text-[#f2ebdd]/75 sm:text-base">{name}</dd>
        </div>
      ))}
    </dl>
  )
}
