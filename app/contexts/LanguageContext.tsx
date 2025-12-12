'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import translations, { Language } from '@/app/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'uz' || savedLanguage === 'ko')) {
          setLanguageState(savedLanguage)
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    if (lang === 'en' || lang === 'uz' || lang === 'ko') {
      setLanguageState(lang)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('language', lang)
        } catch {
          // Ignore localStorage errors
        }
      }
    }
  }

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

