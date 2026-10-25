'use client'

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Check, Globe } from 'lucide-react'
import { Language } from '@/app/lib/translations'

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'uz', name: 'O\'zbekcha' },
  { code: 'ko', name: '한국어' },
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#181818] border border-[#262626] rounded-lg text-white text-sm font-medium hover:border-[#E50914] transition-colors"
        aria-label="Change language"
        type="button"
      >
        <Globe size={16} className="flex-shrink-0" />
        <span className="uppercase tracking-wide">{currentLang.code}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-[#262626] rounded-lg shadow-xl z-50 overflow-hidden min-w-[180px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                  language === lang.code
                    ? 'bg-[#E50914] text-white'
                    : 'text-white hover:bg-[#262626]'
                }`}
                type="button"
              >
                <span className="w-6 text-xs font-semibold uppercase tracking-wide opacity-70">{lang.code}</span>
                <span className="flex-1">{lang.name}</span>
                {language === lang.code && (
                  <Check size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

