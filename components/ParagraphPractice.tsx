'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Word {
  id: string
  german: string
  english: string
  spanish: string
  preposition: string | null
  example: string
}

interface ParagraphPracticeProps {
  words: Word[]
  userId: string
}

export default function ParagraphPractice({ words, userId }: ParagraphPracticeProps) {
  const [paragraph, setParagraph] = useState('')
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [showTranslations, setShowTranslations] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient() as any
  const router = useRouter()

  // Check which words are used in the paragraph
  const checkUsedWords = (text: string) => {
    const used = new Set<string>()
    const lowerText = text.toLowerCase()
    
    words.forEach(word => {
      const germanWord = word.german.toLowerCase().replace('sich ', '')
      if (lowerText.includes(germanWord)) {
        used.add(word.id)
      }
    })
    
    setUsedWords(used)
  }

  const handleParagraphChange = (text: string) => {
    setParagraph(text)
    checkUsedWords(text)
  }

  const checkGrammar = async () => {
    if (!paragraph.trim()) {
      alert('Bitte schreibe erst einen Absatz!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: paragraph,
          language: 'de-DE'
        })
      })

      const data = await res.json()
      const matches = data.matches || []
      
      let score = 5
      if (matches.length > 0) score = 4
      if (matches.length > 3) score = 3
      if (matches.length > 6) score = 2
      if (matches.length > 10) score = 1

      setGrammarResult({ score, matches: matches.slice(0, 8) })
    } catch (error) {
      setGrammarResult({ score: null, error: true })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (usedWords.size < words.length) {
      const missing = words.filter(w => !usedWords.has(w.id)).length
      const confirm = window.confirm(
        `⚠️ Du hast nur ${usedWords.size}/${words.length} Wörter benutzt! ${missing} fehlen noch. Trotzdem abgeben?`
      )
      if (!confirm) return
    }

    setSubmitted(true)

    // Save practice session for each word used
    try {
      for (const word of words) {
        if (usedWords.has(word.id)) {
          await supabase
            .from('practice_sessions')
            .insert({
              user_id: userId,
              vocabulary_id: word.id,
              confidence_rating: usedWords.has(word.id) ? 5 : 1,
              grammar_score: grammarResult?.score || null,
              practice_mode: 'paragraph'
            })
        }
      }

      // Update user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (stats) {
        const today = new Date().toISOString().split('T')[0]
        const lastPractice = stats.last_practice_date
        let newStreak = stats.current_streak

        if (lastPractice !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          
          if (lastPractice === yesterdayStr) {
            newStreak += 1
          } else {
            newStreak = 1
          }
        }

        await supabase
          .from('user_stats')
          .update({
            total_practiced: stats.total_practiced + usedWords.size,
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, stats.longest_streak),
            last_practice_date: today
          })
          .eq('user_id', userId)
      }

      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const allWordsUsed = usedWords.size === words.length

  return (
    <div className="min-h-screen bg-pristine">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="px-6 py-3 bg-white rounded-full font-semibold text-nine-iron shadow-lg hover:shadow-xl transition-all"
          >
            ← Zurück
          </Link>
          <div className="flex items-center gap-4">
            <div className="font-semibold text-gray-600">
              {usedWords.size}/{words.length} Wörter benutzt
            </div>
            {allWordsUsed && (
              <div className="text-2xl animate-bounce">🎉</div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-[32px] p-6 mb-6 shadow-lg">
          <h1 className="font-serif text-3xl font-semibold text-nine-iron mb-3">
            ✍️ Paragraph Challenge
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Schreibe einen <strong>zusammenhängenden Absatz</strong> über dein Leben, ESN, Braunschweig, oder was auch immer du willst - aber benutze <strong>ALLE 10 Wörter</strong> unten!
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className="px-6 py-3 bg-crystal-rose border-2 border-nasturtium rounded-full font-semibold text-nine-iron hover:bg-nasturtium hover:text-white transition-colors"
            >
              👁️ {showTranslations ? 'Übersetzungen verstecken' : 'Übersetzungen zeigen'}
            </button>
          </div>
        </div>

        {/* Word List */}
        <div className="bg-white rounded-[32px] p-6 mb-6 shadow-lg">
          <h2 className="font-serif text-2xl font-semibold text-nine-iron mb-4">
            Deine Wörter:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {words.map((word) => (
              <div
                key={word.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  usedWords.has(word.id)
                    ? 'bg-cascade/10 border-cascade'
                    : 'bg-gray-50 border-crystal-rose'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-xl">
                    {usedWords.has(word.id) ? '✓' : '○'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-nine-iron">
                      {word.german}
                    </div>
                    {showTranslations && (
                      <div className="text-sm text-gray-600 mt-1">
                        <div>🇬🇧 {word.english}</div>
                        <div>🇪🇸 {word.spanish}</div>
                        {word.preposition && (
                          <div className="text-cascade font-semibold mt-1">
                            {word.preposition}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Writing Area */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl mb-6">
          <h2 className="font-serif text-2xl font-semibold text-nine-iron mb-4">
            Dein Absatz:
          </h2>
          <textarea
            value={paragraph}
            onChange={(e) => handleParagraphChange(e.target.value)}
            disabled={submitted}
            className="w-full min-h-[300px] p-6 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none resize-y text-lg disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Schreibe hier deinen kreativen Absatz... Versuche, alle Wörter in einem natürlichen, fließenden Text zu verwenden!"
          />
          
          <div className="mt-4 text-sm text-gray-600">
            📊 Wörter: {paragraph.split(/\s+/).filter(w => w.length > 0).length} • 
            Zeichen: {paragraph.length}
          </div>

          {/* Grammar Check */}
          {!submitted && (
            <div className="mt-6">
              <button
                onClick={checkGrammar}
                disabled={loading || !paragraph.trim()}
                className="px-6 py-3 bg-cascade text-white rounded-full font-semibold hover:bg-parasailing transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Prüfe...' : '✓ Grammatik checken'}
              </button>

              {grammarResult && (
                <div className="mt-4 p-4 bg-crystal-rose rounded-2xl">
                  <div className="text-2xl font-bold text-nasturtium mb-2">
                    Grammatik-Score: {grammarResult.score}/5
                  </div>
                  {grammarResult.matches && grammarResult.matches.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {grammarResult.matches.map((match: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-xl text-sm">
                          <div className="text-nasturtium font-semibold">
                            ⚠️ {match.message}
                          </div>
                          {match.replacements && match.replacements.length > 0 && (
                            <div className="text-cascade mt-1">
                              💡 Vorschlag: {match.replacements[0].value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {grammarResult.score === 5 && (
                    <p className="text-cascade font-semibold mt-2">
                      ✨ Perfekt! Keine Fehler gefunden!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!paragraph.trim()}
            className={`w-full py-6 rounded-full font-bold text-xl transition-all ${
              allWordsUsed
                ? 'bg-gradient-to-r from-cascade to-parasailing text-white hover:shadow-2xl'
                : 'bg-gray-300 text-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {allWordsUsed 
              ? '🎉 Perfekt! Absatz abgeben' 
              : `⚠️ Noch ${words.length - usedWords.size} Wörter fehlen - Trotzdem abgeben?`}
          </button>
        ) : (
          <div className="text-center p-8 bg-gradient-to-r from-cascade to-parasailing text-white rounded-[32px]">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-serif text-3xl font-bold mb-2">
              Super gemacht!
            </h2>
            <p className="text-xl opacity-90">
              Du hast {usedWords.size}/{words.length} Wörter verwendet!
            </p>
            <p className="mt-4">Zurück zur Startseite in 3 Sekunden...</p>
          </div>
        )}
      </div>
    </div>
  )
}