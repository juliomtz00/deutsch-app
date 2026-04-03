'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Preposition lookup table
const prepositionLookup: { [key: string]: string } = {
  "zugreifen": "auf + Akk",
  "forschen": "an + Dat",
  "verzweifeln": "an + Dat",
  "leiden": "an + Dat",
  "sterben": "an + Dat",
  "sich beteiligen": "an + Dat",
  "hinweisen": "auf + Akk",
  "achten": "auf + Akk",
  "verzichten": "auf + Akk",
  "reagieren": "auf + Akk",
  "eingehen": "auf + Akk",
  "sich verlassen": "auf + Akk",
  "sich konzentrieren": "auf + Akk",
  "beruhen": "auf + Dat",
  "entnehmen": "aus + Dat",
  "bestehen": "aus + Dat",
  "sich bedanken": "bei + Dat",
  "kämpfen": "für + Akk",
  "werben": "für + Akk",
  "sich einsetzen": "für + Akk",
  "gelten": "für + Akk",
  "ausgeben": "für + Akk",
  "vereinbar": "mit + Dat",
  "sich auseinandersetzen": "mit + Dat",
  "sich befassen": "mit + Dat",
  "umgehen": "mit + Dat",
  "klarkommen": "mit + Dat",
  "zurechtkommen": "mit + Dat",
  "sich ärgern": "über + Akk",
  "berichten": "über + Akk",
  "sich unterhalten": "über + Akk",
  "sich beschweren": "über + Akk",
  "sich wundern": "über + Akk",
  "bitten": "um + Akk",
  "sich handeln": "um + Akk",
  "sich Sorgen machen": "um + Akk",
  "abhängen": "von + Dat",
  "abraten": "von + Dat",
  "halten": "von + Dat",
  "träumen": "von + Dat",
  "fliehen": "vor + Dat",
  "beitragen": "zu + Dat",
  "führen": "zu + Dat",
  "bewegen": "zu + Dat",
  "zwingen": "zu + Dat",
  "sich entschließen": "zu + Dat",
  "empfinden": "als + Akk",
  "sich gewöhnen": "an + Akk",
  "sich wenden": "an + Akk",
  "sich anpassen": "an + Akk",
  "die Abneigung": "gegen + Akk",
  "sich erkundigen": "nach + Dat",
  "eintauchen": "in + Akk"
};

export default function AddWordPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [german, setGerman] = useState('');
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [preposition, setPreposition] = useState('');
  const [example, setExample] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function fetchTranslations() {
    if (!german.trim()) {
      alert('Bitte gib ein deutsches Wort ein!');
      return;
    }

    setIsLoading(true);
    setEnglish('Suche...');
    setSpanish('Suche...');
    setPreposition('Suche...');
    setExample('Suche...');

    try {
      const baseWord = german.replace('sich ', '');

      // Fetch English translation
      const enResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(german)}&langpair=de|en`
      );
      const enData = await enResponse.json();
      if (enData.responseData?.translatedText) {
        setEnglish(enData.responseData.translatedText);
      } else {
        setEnglish('');
      }

      // Fetch Spanish translation
      const esResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(german)}&langpair=de|es`
      );
      const esData = await esResponse.json();
      if (esData.responseData?.translatedText) {
        setSpanish(esData.responseData.translatedText);
      } else {
        setSpanish('');
      }

      // Check for preposition
      const prep = prepositionLookup[baseWord] || prepositionLookup[german] || '';
      setPreposition(prep);

      // Generate example
      setExample(`Beispiel: ${german} wird oft verwendet.`);

      // Check if reflexive
      if (!german.startsWith('sich ') && isLikelyReflexive(baseWord)) {
        if (confirm(`Ist "${german}" ein reflexives Verb? Soll ich "sich" hinzufügen?`)) {
          setGerman(`sich ${baseWord}`);
        }
      }

      setIsLoading(false);
      alert('✓ Übersetzungen gefunden! Du kannst sie jetzt bearbeiten.');
    } catch (error) {
      console.error('Error fetching translations:', error);
      setEnglish('');
      setSpanish('');
      setPreposition('');
      setExample('');
      setIsLoading(false);
      alert('⚠️ API-Fehler. Bitte fülle die Felder manuell aus.');
    }
  }

  function isLikelyReflexive(word: string): boolean {
    const reflexivePatterns = ['auseinander', 'an', 'auf', 'aus', 'bei', 'ein', 'vor', 'über', 'um'];
    return reflexivePatterns.some(pattern => word.includes(pattern)) && 
           (word.endsWith('setzen') || word.endsWith('ziehen') || word.endsWith('stellen'));
  }

  async function saveWord() {
    if (!german || !english || !spanish || !example) {
      alert('Bitte fülle alle Pflichtfelder aus!');
      return;
    }

    try {
      // Check for duplicates
      const { data: existing } = await supabase
        .from('vocabulary')
        .select('id')
        .ilike('german', german)
        .single();

      if (existing) {
        alert('⚠️ Dieses Wort existiert bereits!');
        return;
      }

      // Insert new word
      const { error } = await supabase
        .from('vocabulary')
        .insert({
          german: german.trim(),
          english: english.trim(),
          spanish: spanish.trim(),
          preposition: preposition.trim() || null,
          example: example.trim(),
          priority: false
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setGerman('');
        setEnglish('');
        setSpanish('');
        setPreposition('');
        setExample('');
      }, 2000);
    } catch (error) {
      console.error('Error saving word:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    }
  }

  return (
    <div className="min-h-screen bg-pristine px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/practice')}
            className="bg-white px-6 py-3 rounded-full shadow-md font-semibold text-primary hover:shadow-lg transition-all hover:-translate-x-1"
          >
            ← Zurück
          </button>
          <h1 className="font-fraunces text-3xl md:text-4xl font-semibold text-primary">
            Neues Wort ➕
          </h1>
          <div className="w-24" />
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-parasailing to-cascade rounded-[2rem] p-8 shadow-lg text-white">
          <h2 className="font-fraunces text-2xl md:text-3xl font-semibold mb-2">
            Wort hinzufügen
          </h2>
          <p className="opacity-90 mb-6">
            Gib ein deutsches Wort ein - wir füllen den Rest automatisch aus!
          </p>

          {/* German Word */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Deutsches Wort *</label>
            <input
              type="text"
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              placeholder="z.B. eintauchen oder sich auseinandersetzen"
              className="w-full p-4 border-2 border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:bg-white/15 outline-none transition-all"
            />
            <p className="text-sm opacity-70 mt-2 italic">
              ✨ Reflexive Verben automatisch erkannt
            </p>
          </div>

          {/* English */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Englisch *</label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="wird automatisch ausgefüllt..."
              className="w-full p-4 border-2 border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:bg-white/15 outline-none transition-all"
            />
          </div>

          {/* Spanish */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Español *</label>
            <input
              type="text"
              value={spanish}
              onChange={(e) => setSpanish(e.target.value)}
              placeholder="será rellenado automáticamente..."
              className="w-full p-4 border-2 border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:bg-white/15 outline-none transition-all"
            />
          </div>

          {/* Preposition */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Präposition</label>
            <input
              type="text"
              value={preposition}
              onChange={(e) => setPreposition(e.target.value)}
              placeholder="z.B. mit + Dat"
              className="w-full p-4 border-2 border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:bg-white/15 outline-none transition-all"
            />
          </div>

          {/* Example */}
          <div className="mb-8">
            <label className="block font-semibold mb-2">Beispielsatz *</label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="wird automatisch ausgefüllt..."
              rows={3}
              className="w-full p-4 border-2 border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:bg-white/15 outline-none transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={fetchTranslations}
              disabled={isLoading}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Suche...' : '🔍 Wort nachschlagen'}
            </button>
            <button
              onClick={saveWord}
              className="flex-1 bg-white text-parasailing py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all"
            >
              + Wort speichern
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-4 bg-white text-cascade p-4 rounded-2xl font-semibold text-center animate-pulse">
              ✓ Wort erfolgreich hinzugefügt!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
