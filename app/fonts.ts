import { Anton, Fraunces, Inter } from 'next/font/google'

// Condensed display face for marquee-style headlines
export const displayFont = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

// Italic serif for small editorial captions
export const editorialFont = Fraunces({
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
})

export const bodyFont = Inter({
  subsets: ['latin'],
  display: 'swap',
})
