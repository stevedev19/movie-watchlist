'use client'

import { CSSProperties } from 'react'
import { displayFont } from '@/app/fonts'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatNumber } from './shelfUtils'

export type ShelfTab = 'seen' | 'soon' | 'all'

const NOTCH = 7

// Ticket-stub chip: half-circle bites out of the left and right edges
export const stubMask = (() => {
  const mask = [
    `radial-gradient(circle at 0 50%, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) left / 51% 100% no-repeat`,
    `radial-gradient(circle at 100% 50%, transparent ${NOTCH}px, #000 ${NOTCH + 0.5}px) right / 51% 100% no-repeat`,
  ].join(', ')
  return { mask, WebkitMask: mask } as CSSProperties
})()

interface ShelfTabsProps {
  tab: ShelfTab
  onTabChange: (tab: ShelfTab) => void
  seenCount: number
  soonCount: number
}

export default function ShelfTabs({ tab, onTabChange, seenCount, soonCount }: ShelfTabsProps) {
  const { t, language } = useLanguage()
  const tabs = [
    { key: 'seen' as const, label: t.shelf.tabSeen, count: seenCount },
    { key: 'soon' as const, label: t.shelf.tabSoon, count: soonCount },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {tabs.map(({ key, label, count }) => {
        const active = tab === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            aria-pressed={active}
            style={stubMask}
            className={`flex items-center gap-3 rounded-[3px] px-5 py-2.5 transition-colors sm:px-6 sm:py-3 ${
              active
                ? 'bg-[#f2ebdd] text-[#1a1714]'
                : 'border border-[#f2ebdd]/30 text-[#f2ebdd] hover:border-[#f2ebdd]/60'
            }`}
          >
            <span className={`${displayFont.className} text-2xl uppercase leading-none sm:text-3xl`}>{label}</span>
            <span
              className={`border-l border-dashed pl-3 font-mono text-sm ${
                active ? 'border-[#1a1714]/30' : 'border-[#f2ebdd]/30 text-[#f2ebdd]/70'
              }`}
            >
              {formatNumber(count, language)}
            </span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onTabChange('all')}
        aria-pressed={tab === 'all'}
        className={`ml-1 text-sm underline-offset-4 transition-colors ${
          tab === 'all' ? 'text-[#f2ebdd] underline' : 'text-[#f2ebdd]/60 hover:text-[#f2ebdd] hover:underline'
        }`}
      >
        {t.shelf.showAll}
      </button>
    </div>
  )
}
