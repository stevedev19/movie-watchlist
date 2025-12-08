import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { LanguageAwareLayout } from './components/LanguageAwareLayout'

export const metadata: Metadata = {
  title: 'SeenAndSoon - Track your movielist',
  description: 'Track what you want to watch and what you have finished',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LanguageAwareLayout>
            {children}
          </LanguageAwareLayout>
        </Providers>
      </body>
    </html>
  )
}

