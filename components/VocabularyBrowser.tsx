'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Word {
  id: string
  german: string
  english: string
  spanish: string
  preposition: string | null
  priority: number
}

interface VocabularyBrowserProps {
  initialVocabulary: Word[]
  userId: string
}

export default function VocabularyBrowser({ initialVocabulary, userId }: VocabularyBrowserProps) {
  const [vocabulary, setVocabulary] = useState(initialVocabulary)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const filtered = vocabulary.filter(word =>
    word.german.toLowerCase().includes(search.toLowerCase()) ||
    word.english.toLowerCase().includes(search.toLowerCase()) ||
    word.spanish.toLowerCase().includes(search.toLowerCase())
  )

  const togglePriority = async (wordId: string, currentPriority: number) => {
    const newPriority = currentPriority > 0 ? 0 : 1
    
    await supabase
      .from('vocabulary')
      .update({ priority: newPriority })
      .eq('id', wordId)

    setVocabulary(prev =>
      prev.map(w => w.id === wordId ? { ...w, priority: newPriority } : w)
    )
  }

  return (
    <div className="min-h-screen bg-pristine">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-4xl font-semibold text-nine-iron">
            Alle Wörter 📚
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white rounded-full font-semibold text-nine-iron shadow-lg hover:shadow-xl transition-all"
          >
            ← Zurück
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Wort suchen..."
            className="w-full px-6 py-4 rounded-full border-2 border-crystal-rose focus:border-nasturtium focus:outline-none text-lg"
          />
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600 font-medium">
          {filtered.length} von {vocabulary.length} Wörtern
        </div>

        {/* Vocabulary List */}
        <div className="bg-white rounded-[32px] shadow-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Keine Wörter gefunden
            </div>
          ) : (
            <div className="divide-y divide-crystal-rose">
              {filtered.map((word) => (
                <div
                  key={word.id}
                  className="p-6 hover:bg-crystal-rose/20 transition-colors relative group"
                >
                  <button
                    onClick={() => togglePriority(word.id, word.priority)}
                    className="absolute top-6 right-6 text-2xl opacity-30 hover:opacity-100 transition-opacity"
                    title="Priorität markieren"
                  >
                    {word.priority > 0 ? '⭐' : '☆'}
                  </button>

                  <div className="font-serif text-2xl font-semibold text-nine-iron mb-2">
                    {word.german}
                  </div>
                  <div className="text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold text-cascade">EN:</span> {word.english}
                    </p>
                    <p>
                      <span className="font-semibold text-cascade">ES:</span> {word.spanish}
                    </p>
                    {word.preposition && (
                      <p>
                        <span className="inline-block bg-cascade text-white px-3 py-1 rounded-full text-sm font-semibold mt-2">
                          {word.preposition}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
