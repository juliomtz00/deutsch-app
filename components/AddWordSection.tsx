'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'

interface AddWordSectionProps {
  userId: string
}

const prepositionLookup: Record<string, string> = {
  "zugreifen": "auf + Akk",
  "forschen": "an + Dat",
  "verzweifeln": "an + Dat",
  "leiden": "an + Dat",
  "achten": "auf + Akk",
  "verzichten": "auf + Akk",
  "reagieren": "auf + Akk",
  "sich verlassen": "auf + Akk",
  "sich konzentrieren": "auf + Akk",
  "für": "für + Akk",
  "kämpfen": "für + Akk",
  "mit": "mit + Dat",
  "vereinbar": "mit + Dat",
  "sich auseinandersetzen": "mit + Dat",
  "umgehen": "mit + Dat",
  "sich ärgern": "über + Akk",
  "berichten": "über + Akk",
  "bitten": "um + Akk",
  "abhängen": "von + Dat",
  "träumen": "von + Dat",
  "führen": "zu + Dat",
  "bewegen": "zu + Dat",
  "sich gewöhnen": "an + Akk",
  "sich wenden": "an + Akk",
  "eintauchen": "in + Akk"
}

export default function AddWordSection({ userId }: AddWordSectionProps) {
  const [german, setGerman] = useState('')
  const [english, setEnglish] = useState('')
  const [spanish, setSpanish] = useState('')
  const [preposition, setPreposition] = useState('')
  const [example, setExample] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const fetchTranslations = async () => {
    if (!german.trim()) {
      alert('Bitte gib ein deutsches Wort ein!')
      return
    }

    setLoading(true)
    setEnglish('Suche...')
    setSpanish('Suche...')
    setPreposition('Suche...')
    setExample('Suche...')

    try {
      const baseWord = german.replace('sich ', '')
      
      // Fetch English translation
      const resEN = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(german)}&langpair=de|en`)
      const dataEN = await resEN.json()
      if (dataEN.responseData?.translatedText) {
        setEnglish(dataEN.responseData.translatedText)
      }

      // Fetch Spanish translation
      const resES = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(german)}&langpair=de|es`)
      const dataES = await resES.json()
      if (dataES.responseData?.translatedText) {
        setSpanish(dataES.responseData.translatedText)
      }

      // Check for preposition in lookup
      const prep = prepositionLookup[baseWord] || prepositionLookup[german] || ''
      setPreposition(prep)

      // Generate example
      setExample(`Beispiel: ${german} wird oft verwendet.`)

      // Check if reflexive
      if (!german.startsWith('sich ') && isLikelyReflexive(baseWord)) {
        if (confirm(`Ist "${german}" ein reflexives Verb? Soll ich "sich" hinzufügen?`)) {
          setGerman(`sich ${baseWord}`)
        }
      }

    } catch (error) {
      alert('⚠️ API-Fehler. Bitte fülle die Felder manuell aus.')
      setEnglish('')
      setSpanish('')
      setPreposition('')
      setExample('')
    } finally {
      setLoading(false)
    }
  }

  const isLikelyReflexive = (word: string) => {
    const patterns = ['auseinander', 'an', 'auf', 'aus', 'bei', 'ein', 'vor', 'über', 'um']
    return patterns.some(p => word.includes(p)) && 
           (word.endsWith('setzen') || word.endsWith('ziehen') || word.endsWith('stellen'))
  }

  const handleSubmit = async () => {
    if (!german || !english || !spanish || !example) {
      alert('Bitte fülle alle Pflichtfelder aus!')
      return
    }

    setLoading(true)

    try {
      // Check for duplicates
      const { data: existing } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('german', german)
        .single()

      if (existing) {
        alert('⚠️ Dieses Wort existiert bereits!')
        setLoading(false)
        return
      }

      // Insert new word
      const { error } = await supabase
        .from('vocabulary')
        .insert({
          german,
          english,
          spanish,
          preposition,
          example,
          priority: 0,
          added_by_user_id: userId
        } as any)

      if (error) throw error

      // Clear form
      setGerman('')
      setEnglish('')
      setSpanish('')
      setPreposition('')
      setExample('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (error) {
      console.error(error)
      alert('Fehler beim Speichern!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-parasailing to-cascade rounded-[32px] p-8 shadow-2xl text-white">
      <h2 className="font-serif text-3xl font-semibold mb-4">
        ➕ Neues Wort hinzufügen
      </h2>
      <p className="mb-6 opacity-90">
        Gib ein deutsches Wort ein - wir füllen den Rest automatisch aus!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Deutsches Wort *</label>
          <input
            type="text"
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
            placeholder="z.B. eintauchen oder sich auseinandersetzen"
          />
          <p className="text-sm mt-1 opacity-70 italic">✨ Reflexive Verben automatisch erkannt</p>
        </div>

        <div>
          <label className="block font-semibold mb-2">Englisch</label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
            placeholder="wird automatisch ausgefüllt..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Español</label>
          <input
            type="text"
            value={spanish}
            onChange={(e) => setSpanish(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
            placeholder="wird automatisch ausgefüllt..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Präposition</label>
          <input
            type="text"
            value={preposition}
            onChange={(e) => setPreposition(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
            placeholder="z.B. mit + Dat"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Beispielsatz *</label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:outline-none resize-none"
            placeholder="wird automatisch ausgefüllt..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={fetchTranslations}
            disabled={loading}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            🔍 Wort nachschlagen
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-white text-parasailing hover:bg-white/90 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            + Wort speichern
          </button>
        </div>

        {success && (
          <div className="bg-cascade/30 border-2 border-white/50 rounded-2xl p-4 font-semibold">
            ✓ Wort erfolgreich hinzugefügt!
          </div>
        )}
      </div>
    </div>
  )
}
