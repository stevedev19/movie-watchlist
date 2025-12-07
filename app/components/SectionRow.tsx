'use client'

import { ReactNode } from 'react'

interface SectionRowProps {
  title: string
  children: ReactNode
  horizontal?: boolean
}

export default function SectionRow({ title, children, horizontal = false }: SectionRowProps) {
  if (horizontal) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 px-4 md:px-0">
          {title}
        </h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-0">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 px-4 md:px-0">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
        {children}
      </div>
    </div>
  )
}


