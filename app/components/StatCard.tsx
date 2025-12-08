'use client'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color?: string
}

export default function StatCard({ title, value, icon, color = '#E50914' }: StatCardProps) {
  return (
    <div className="netflix-card rounded-lg p-4 md:p-6 netflix-glow hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl md:text-3xl">{icon}</span>
        <div 
          className="w-1 h-8 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-[#A3A3A3] font-medium">
        {title}
      </div>
    </div>
  )
}



