'use client'

import { MotionConfig, motion } from 'motion/react'
import { displayFont } from '../fonts'

type Stamp = 'seen' | 'soon'

const TMDB_POSTER = 'https://image.tmdb.org/t/p/w342'

// Left to right; later posters sit on top of earlier ones
const posters: { title: string; path: string; rotate: number; stamp?: Stamp }[] = [
  { title: 'Pulp Fiction', path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rotate: -20 },
  { title: 'Spirited Away', path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', rotate: -10, stamp: 'seen' },
  { title: 'Parasite', path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', rotate: 0 },
  { title: 'Interstellar', path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rotate: 10 },
  { title: 'Dune: Part Two', path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rotate: 20, stamp: 'soon' },
]

const stampStyles: Record<Stamp, string> = {
  seen: 'border-[#f2ebdd]/80 bg-[#0e0c0b]/85 text-[#f2ebdd]',
  soon: 'border-[#dc2626] bg-[#dc2626] text-white',
}

export default function HeroPosterStack() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative mx-auto aspect-[5/4] w-full max-w-[440px] lg:ml-auto lg:mr-0 lg:max-w-[560px]"
        aria-hidden="true"
      >
        {posters.map((poster, i) => (
          <motion.div
            key={poster.title}
            className="absolute top-[7%] w-[36%]"
            // Fan out around a pivot well below the cards, like a hand of cards
            style={{ left: '50%', marginLeft: '-18%', transformOrigin: '50% 160%', zIndex: i }}
            initial={{ rotate: 0, opacity: 0, y: 24 }}
            animate={{ rotate: poster.rotate, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-[6px] bg-[#1c1917] shadow-[0_28px_50px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${TMDB_POSTER}${poster.path}`}
                alt=""
                className="h-full w-full object-cover"
                loading={i > 2 ? 'lazy' : 'eager'}
                draggable={false}
              />
              {poster.stamp && (
                <span
                  className={`${displayFont.className} ${stampStyles[poster.stamp]} absolute left-3 top-3 -rotate-[8deg] rounded-[3px] border-2 px-2 pb-0.5 pt-1 text-lg leading-none tracking-[0.12em]`}
                >
                  {poster.stamp === 'seen' ? 'SEEN' : 'SOON'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  )
}
