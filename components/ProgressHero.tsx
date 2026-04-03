'use client'

import { useEffect, useState } from 'react'

interface Stats {
  total_practiced: number
  unique_words_count: number
  current_streak: number
  longest_streak: number
}

interface ProgressHeroProps {
  stats: Stats
  totalWords: number
  priorityCount: number
}

export default function ProgressHero({ stats, totalWords, priorityCount }: ProgressHeroProps) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    // Animate progress circle
    const percent = totalWords > 0 ? Math.round((stats.unique_words_count / totalWords) * 100) : 0
    setTimeout(() => setProgress(percent), 100)
  }, [stats.unique_words_count, totalWords])

  const circumference = 2 * Math.PI * 60
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 mb-8 shadow-lg relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-crystal-rose/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Stats */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-nine-iron mb-2">
              Hi, Jules! 👋
            </h2>
            <p className="text-gray-600 mb-6">Deine Lernreise geht weiter!</p>
            
            <div className="flex gap-8 flex-wrap">
              <div>
                <div className="text-4xl mb-1">📚</div>
                <div className="text-2xl font-bold text-nasturtium">{totalWords}</div>
                <div className="text-sm text-gray-600 font-medium">Wörter</div>
              </div>
              <div>
                <div className="text-4xl mb-1">✨</div>
                <div className="text-2xl font-bold text-nasturtium">{stats.total_practiced}</div>
                <div className="text-sm text-gray-600 font-medium">Mal geübt</div>
              </div>
              <div>
                <div className="text-4xl mb-1">⭐</div>
                <div className="text-2xl font-bold text-nasturtium">{priorityCount}</div>
                <div className="text-sm text-gray-600 font-medium">Priorität</div>
              </div>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-36 h-36">
              <svg className="transform -rotate-90" width="144" height="144">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="#FFD6DD"
                  strokeWidth="10"
                  opacity="0.3"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="#FF6B58"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-nine-iron">{progress}%</div>
                <div className="text-2xl">🌱</div>
              </div>
            </div>
            
            {/* Streak Badge */}
            <div className="bg-gradient-to-r from-nasturtium to-[#FF8A7A] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold">
              🔥 <span>{stats.current_streak} Tage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
