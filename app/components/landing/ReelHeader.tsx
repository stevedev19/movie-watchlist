'use client'

import { displayFont, editorialFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'

interface ReelHeaderProps {
  number: string
  label: string
  title: string
  caption?: string
  align?: 'left' | 'center'
}

// Program-style section heading: "REEL 01 — NOW SHOWING", display title, italic caption
export function ReelHeader({ number, label, title, caption, align = 'left' }: ReelHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className={align === 'center' ? 'text-center' : ''}>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f2ebdd]/60">
        <span className="text-[#dc2626]">
          {t.landing.reel} {number}
        </span>{' '}
        — {label}
      </p>
      <h2 className={`${displayFont.className} mt-3 text-4xl uppercase leading-none text-[#f2ebdd] sm:text-5xl`}>
        {title}
      </h2>
      {caption && (
        <p className={`${editorialFont.className} mt-3 text-lg text-[#f2ebdd]/70 sm:text-xl`}>{caption}</p>
      )}
    </header>
  )
}

// Double cream hairline between sections, like a rule on a printed page
export function Hairline() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="h-[3px] border-y border-[#f2ebdd]/15" />
    </div>
  )
}
