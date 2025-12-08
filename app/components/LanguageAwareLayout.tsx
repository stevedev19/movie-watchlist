'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { useEffect } from 'react'

export function LanguageAwareLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return <>{children}</>
}


