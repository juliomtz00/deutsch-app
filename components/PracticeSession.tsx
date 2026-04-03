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
  priority: number
}

interface PracticeSessionProps {
  words: Word[]
  mode: 'daily' | 'translation' | 'fillblank'
  userId: string
}

export default function PracticeSession({ words, mode, userId }: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sentence, setSentence] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [translationsVisible, setTranslationsVisible] = useState(false)
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [grammarScore, setGrammarScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Translation test state
  const [userEnglish, setUserEnglish] = useState('')
  const [userSpanish, setUserSpanish] = useState('')
  const [userPrep, setUserPrep] = useState('')
  const [translationResults, setTranslationResults] = useState<any>(null)
  
  // Fill blank state
  const [userBlank, setUserBlank] = useState('')
  const [blankResult, setBlankResult] = useState<any>(null)

  const supabase = createClient()
  const router = useRouter()
  const currentWord = words[currentIndex]

  const checkGrammar = async () => {
    if (!sentence.trim()) {
      alert('Bitte schreibe erst einen Satz!')
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
          text: sentence,
          language: 'de-DE'
        })
      })

      const data = await res.json()
      const matches = data.matches || []
      
      let score = 5
      if (matches.length > 0) score = 4
      if (matches.length > 2) score = 3
      if (matches.length > 4) score = 2
      if (matches.length > 6) score = 1

      setGrammarScore(score)
      setGrammarResult({ score, matches: matches.slice(0, 5) })
    } catch (error) {
      setGrammarResult({ score: null, error: true })
    } finally {
      setLoading(false)
    }
  }

  const checkTranslations = () => {
    const enCorrect = userEnglish.toLowerCase().includes(currentWord.english.toLowerCase().split(',')[0].trim()) || 
                      currentWord.english.toLowerCase().includes(userEnglish.toLowerCase())
    const esCorrect = userSpanish.toLowerCase().includes(currentWord.spanish.toLowerCase().split(',')[0].trim()) ||
                      currentWord.spanish.toLowerCase().includes(userSpanish.toLowerCase())
    const prepCorrect = !currentWord.preposition || userPrep.toLowerCase() === currentWord.preposition.toLowerCase()

    setTranslationResults({ enCorrect, esCorrect, prepCorrect })
    
    const allCorrect = enCorrect && esCorrect && prepCorrect
    savePracticeSession(allCorrect ? 5 : 3, null)
  }

  const checkBlank = () => {
    const correctAnswer = currentWord.german.toLowerCase().replace('sich ', '')
    const isCorrect = userBlank.toLowerCase() === correctAnswer || userBlank.toLowerCase() === currentWord.german.toLowerCase()
    
    setBlankResult({ isCorrect })
    savePracticeSession(isCorrect ? 5 : 3, null)
  }

  const savePracticeSession = async (conf: number, gramScore: number | null) => {
    try {
      // Save practice session
      await supabase
        .from('practice_sessions')
        .insert({
          user_id: userId,
          vocabulary_id: currentWord.id,
          confidence_rating: conf,
          grammar_score: gramScore,
          practice_mode: mode
        })

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
            total_practiced: stats.total_practiced + 1,
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, stats.longest_streak),
            last_practice_date: today
          })
          .eq('user_id', userId)
      }

    } catch (error) {
      console.error('Error saving practice:', error)
    }
  }

  const handleNext = async () => {
    if (mode === 'daily' && !sentence.trim()) {
      alert('Bitte schreibe erst einen Satz!')
      return
    }

    if (mode === 'daily' && confidence === 0) {
      alert('Bitte bewerte dein Vertrauen (1-5)!')
      return
    }

    if (mode === 'daily') {
      await savePracticeSession(confidence, grammarScore)
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // Reset state
      setSentence('')
      setConfidence(0)
      setTranslationsVisible(false)
      setGrammarResult(null)
      setGrammarScore(null)
      setUserEnglish('')
      setUserSpanish('')
      setUserPrep('')
      setTranslationResults(null)
      setUserBlank('')
      setBlankResult(null)
    } else {
      alert('🎉 Super! Du hast alle Wörter geübt!')
      router.push('/')
    }
  }

  const togglePriority = async () => {
    const newPriority = currentWord.priority > 0 ? 0 : 1
    await supabase
      .from('vocabulary')
      .update({ priority: newPriority })
      .eq('id', currentWord.id)
    
    currentWord.priority = newPriority
  }

  const getScoreEmoji = (score: number) => {
    const emojis = ['😞', '😕', '😐', '😊', '🌟']
    return emojis[score - 1] || '😐'
  }

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
          <div className="font-semibold text-gray-600">
            {currentIndex + 1} / {words.length}
          </div>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden mb-6">
          {/* Decorative blob */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cascade/10 to-transparent rounded-full blur-3xl" />

          {/* Priority Star */}
          <button
            onClick={togglePriority}
            className="absolute top-8 right-8 text-4xl opacity-30 hover:opacity-100 transition-opacity group"
            title="Priorität markieren"
          >
            {currentWord.priority > 0 ? '⭐' : '☆'}
            <div className="absolute top-full right-0 mt-2 bg-nine-iron text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {currentWord.priority > 0 ? 'Hohe Priorität - erscheint öfter!' : 'Klicken für hohe Priorität'}
            </div>
          </button>

          <div className="relative z-10">
            {/* Daily Practice Mode */}
            {mode === 'daily' && (
              <>
                <h2 className="font-serif text-4xl font-semibold text-nine-iron mb-4">
                  {currentWord.german}
                </h2>

                <button
                  onClick={() => setTranslationsVisible(!translationsVisible)}
                  className="mb-4 px-6 py-3 bg-crystal-rose border-2 border-nasturtium rounded-full font-semibold text-nine-iron hover:bg-nasturtium hover:text-white transition-colors"
                >
                  👁️ {translationsVisible ? 'Übersetzung verstecken' : 'Übersetzung zeigen'}
                </button>

                {translationsVisible && (
                  <div className="space-y-2 mb-4">
                    <p className="text-lg">
                      <span className="font-semibold text-cascade">EN:</span> {currentWord.english}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold text-cascade">ES:</span> {currentWord.spanish}
                    </p>
                    {currentWord.preposition && (
                      <span className="inline-block bg-cascade text-white px-4 py-2 rounded-full font-semibold">
                        {currentWord.preposition}
                      </span>
                    )}
                  </div>
                )}

                {translationsVisible && (
                  <div className="bg-crystal-rose p-4 rounded-2xl italic text-nine-iron mb-4 border-l-4 border-nasturtium">
                    {currentWord.example}
                  </div>
                )}

                <textarea
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  className="w-full min-h-[120px] p-4 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none resize-y mb-4"
                  placeholder="Schreibe hier deinen eigenen Satz über dein Leben, ESN, Braunschweig, dein Studium..."
                />

                {/* Grammar Check */}
                <div className="mb-6">
                  <button
                    onClick={checkGrammar}
                    disabled={loading}
                    className="px-6 py-3 bg-cascade text-white rounded-full font-semibold hover:bg-parasailing transition-colors disabled:opacity-50"
                  >
                    ✓ Grammatik checken
                  </button>

                  {grammarResult && (
                    <div className="mt-4 p-4 bg-crystal-rose rounded-2xl">
                      <div className="text-2xl font-bold text-nasturtium mb-2">
                        Grammatik-Score: {grammarResult.score}/5 {getScoreEmoji(grammarResult.score)}
                      </div>
                      {grammarResult.matches && grammarResult.matches.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {grammarResult.matches.map((match: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl text-sm">
                              <div className="text-nasturtium font-semibold">⚠️ {match.message}</div>
                              {match.replacements && match.replacements.length > 0 && (
                                <div className="text-cascade mt-1">💡 Vorschlag: {match.replacements[0].value}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {grammarResult.score === 5 && (
                        <p className="text-cascade font-semibold mt-2">✨ Perfekt! Keine Fehler gefunden!</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confidence Rating */}
                <div className="bg-gradient-to-br from-crystal-rose/30 to-crystal-rose/10 p-6 rounded-2xl">
                  <div className="font-semibold text-nine-iron mb-4">
                    Wie sicher fühlst du dich mit diesem Wort?
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfidence(level)}
                        className={`w-14 h-14 rounded-full font-bold text-lg transition-all ${
                          confidence >= level
                            ? 'bg-nasturtium text-white scale-110 shadow-lg'
                            : 'bg-crystal-rose text-nine-iron hover:scale-105'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Translation Test Mode */}
            {mode === 'translation' && (
              <>
                <h2 className="font-serif text-4xl font-semibold text-nine-iron mb-6">
                  {currentWord.german}
                </h2>
                <p className="text-gray-600 mb-6">Übersetze dieses Wort!</p>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">Englisch:</label>
                    <input
                      type="text"
                      value={userEnglish}
                      onChange={(e) => setUserEnglish(e.target.value)}
                      className="w-full p-3 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none"
                      placeholder="Deine Übersetzung..."
                    />
                    {translationResults && (
                      <div className={`mt-2 p-3 rounded-xl ${translationResults.enCorrect ? 'bg-cascade/20 border-2 border-cascade' : 'bg-nasturtium/20 border-2 border-nasturtium'}`}>
                        {translationResults.enCorrect ? '✓ Richtig!' : `✗ Falsch. Richtig: ${currentWord.english}`}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Español:</label>
                    <input
                      type="text"
                      value={userSpanish}
                      onChange={(e) => setUserSpanish(e.target.value)}
                      className="w-full p-3 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none"
                      placeholder="Tu traducción..."
                    />
                    {translationResults && (
                      <div className={`mt-2 p-3 rounded-xl ${translationResults.esCorrect ? 'bg-cascade/20 border-2 border-cascade' : 'bg-nasturtium/20 border-2 border-nasturtium'}`}>
                        {translationResults.esCorrect ? '✓ Richtig!' : `✗ Falsch. Richtig: ${currentWord.spanish}`}
                      </div>
                    )}
                  </div>

                  {currentWord.preposition && (
                    <div>
                      <label className="block font-semibold mb-2">Präposition:</label>
                      <input
                        type="text"
                        value={userPrep}
                        onChange={(e) => setUserPrep(e.target.value)}
                        className="w-full p-3 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none"
                        placeholder="z.B. mit + Dat"
                      />
                      {translationResults && (
                        <div className={`mt-2 p-3 rounded-xl ${translationResults.prepCorrect ? 'bg-cascade/20 border-2 border-cascade' : 'bg-nasturtium/20 border-2 border-nasturtium'}`}>
                          {translationResults.prepCorrect ? '✓ Richtig!' : `✗ Falsch. Richtig: ${currentWord.preposition}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Fill in the Blank Mode */}
            {mode === 'fillblank' && (
              <>
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                  Fülle die Lücke aus:
                </h3>
                <div className="bg-crystal-rose p-6 rounded-2xl text-2xl text-nine-iron mb-6">
                  {currentWord.example.replace(new RegExp(currentWord.german.replace(/sich /, ''), 'gi'), '_____')}
                </div>

                <div>
                  <label className="block font-semibold mb-2">Deine Antwort:</label>
                  <input
                    type="text"
                    value={userBlank}
                    onChange={(e) => setUserBlank(e.target.value)}
                    className="w-full p-3 border-2 border-crystal-rose rounded-2xl focus:border-nasturtium focus:outline-none"
                    placeholder="Welches Wort fehlt?"
                  />
                  {blankResult && (
                    <div className={`mt-4 p-4 rounded-xl ${blankResult.isCorrect ? 'bg-cascade/20 border-2 border-cascade' : 'bg-nasturtium/20 border-2 border-nasturtium'}`}>
                      {blankResult.isCorrect ? '✓ Perfekt! Das ist richtig!' : `✗ Fast! Die richtige Antwort ist: ${currentWord.german}`}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          {mode === 'daily' && (
            <button
              onClick={handleNext}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-cascade to-parasailing text-white font-semibold py-4 rounded-full hover:shadow-lg transition-all"
            >
              ✓ Speichern & Weiter
            </button>
          )}
          {mode === 'translation' && !translationResults && (
            <button
              onClick={checkTranslations}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-cascade to-parasailing text-white font-semibold py-4 rounded-full hover:shadow-lg transition-all"
            >
              ✓ Antworten prüfen
            </button>
          )}
          {mode === 'fillblank' && !blankResult && (
            <button
              onClick={checkBlank}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-cascade to-parasailing text-white font-semibold py-4 rounded-full hover:shadow-lg transition-all"
            >
              ✓ Antwort prüfen
            </button>
          )}
          {(mode !== 'daily' || translationResults || blankResult) && (
            <button
              onClick={handleNext}
              className="flex-1 min-w-[200px] bg-white border-2 border-crystal-rose text-nine-iron font-semibold py-4 rounded-full hover:bg-crystal-rose transition-all"
            >
              Weiter →
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-4 bg-white border-2 border-crystal-rose text-nine-iron font-semibold rounded-full hover:bg-crystal-rose transition-all"
          >
            Überspringen
          </button>
        </div>
      </div>
    </div>
  )
}
