'use client'

import Link from 'next/link'

interface ExportDataProps {
  stats: any
  sessions: any[]
}

export default function ExportData({ stats, sessions }: ExportDataProps) {
  const handleExport = () => {
    let exportText = "=== DEUTSCH AKTIV - LERNFORTSCHRITT ===\n\n"
    
    if (stats) {
      exportText += `Gesamt geübt: ${stats.total_practiced} mal\n`
      exportText += `Einzigartige Wörter: ${stats.unique_words_count}\n`
      exportText += `Aktueller Streak: ${stats.current_streak} Tage\n`
      exportText += `Längster Streak: ${stats.longest_streak} Tage\n\n`
    }
    
    exportText += "=== LETZTE ÜBUNGEN ===\n\n"
    
    sessions.forEach(session => {
      const date = new Date(session.practiced_at).toLocaleDateString('de-DE')
      const word = session.vocabulary
      exportText += `${date} - ${word.german}\n`
      if (session.confidence_rating) {
        exportText += `  Vertrauen: ${session.confidence_rating}/5\n`
      }
      if (session.grammar_score) {
        exportText += `  Grammatik: ${session.grammar_score}/5\n`
      }
      exportText += `  Modus: ${session.practice_mode}\n\n`
    })

    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deutsch-aktiv-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-pristine">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-4xl font-semibold text-nine-iron">
            Daten exportieren 💾
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white rounded-full font-semibold text-nine-iron shadow-lg hover:shadow-xl transition-all"
          >
            ← Zurück
          </Link>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-lg">
          <h2 className="font-serif text-2xl font-semibold text-nine-iron mb-4">
            Deine Statistiken
          </h2>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-crystal-rose/30 rounded-2xl">
                <div className="text-3xl font-bold text-nasturtium">{stats.total_practiced}</div>
                <div className="text-sm text-gray-600 font-medium">Mal geübt</div>
              </div>
              <div className="text-center p-4 bg-crystal-rose/30 rounded-2xl">
                <div className="text-3xl font-bold text-nasturtium">{stats.unique_words_count}</div>
                <div className="text-sm text-gray-600 font-medium">Wörter</div>
              </div>
              <div className="text-center p-4 bg-crystal-rose/30 rounded-2xl">
                <div className="text-3xl font-bold text-nasturtium">{stats.current_streak}</div>
                <div className="text-sm text-gray-600 font-medium">Streak</div>
              </div>
              <div className="text-center p-4 bg-crystal-rose/30 rounded-2xl">
                <div className="text-3xl font-bold text-nasturtium">{stats.longest_streak}</div>
                <div className="text-sm text-gray-600 font-medium">Längster</div>
              </div>
            </div>
          )}

          <h3 className="font-serif text-xl font-semibold text-nine-iron mb-4">
            Letzte {sessions.length} Übungen
          </h3>

          <div className="max-h-96 overflow-y-auto space-y-3 mb-6">
            {sessions.map((session, idx) => (
              <div key={idx} className="p-4 bg-pristine rounded-xl">
                <div className="font-semibold text-nine-iron">
                  {session.vocabulary.german}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(session.practiced_at).toLocaleDateString('de-DE')} • 
                  {session.confidence_rating && ` Vertrauen: ${session.confidence_rating}/5`}
                  {session.grammar_score && ` • Grammatik: ${session.grammar_score}/5`}
                  {` • ${session.practice_mode}`}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-cascade to-parasailing text-white font-semibold py-4 rounded-full hover:shadow-lg transition-all"
          >
            💾 Daten als .txt herunterladen
          </button>

          <p className="text-sm text-gray-600 text-center mt-4">
            Deine Lernfortschritte werden als Textdatei heruntergeladen
          </p>
        </div>
      </div>
    </div>
  )
}
