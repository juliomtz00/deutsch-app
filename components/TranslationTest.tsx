'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Word {
  id: number;
  german: string;
  english: string;
  spanish: string;
  preposition: string | null;
}

interface TranslationTestProps {
  userId: string;
  onExit: () => void;
}

export default function TranslationTest({ userId, onExit }: TranslationTestProps) {
  const supabase = createClientComponentClient();
  
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userEnglish, setUserEnglish] = useState('');
  const [userSpanish, setUserSpanish] = useState('');
  const [userPrep, setUserPrep] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const { data: allWords } = await supabase
        .from('vocabulary')
        .select('*')
        .order('german');

      if (!allWords) return;

      const shuffled = allWords.sort(() => Math.random() - 0.5);
      setWords(shuffled.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  }

  async function checkAnswers() {
    const word = words[currentIndex];
    
    const enCorrect = checkTranslation(userEnglish, word.english);
    const esCorrect = checkTranslation(userSpanish, word.spanish);
    const prepCorrect = word.preposition 
      ? checkTranslation(userPrep, word.preposition)
      : true;

    setResults({
      english: { correct: enCorrect, answer: word.english },
      spanish: { correct: esCorrect, answer: word.spanish },
      preposition: word.preposition ? { correct: prepCorrect, answer: word.preposition } : null
    });

    // Save practice session
    const allCorrect = enCorrect && esCorrect && prepCorrect;
    const confidence = allCorrect ? 5 : 3;

    try {
      await supabase.from('practice_sessions').insert({
        user_id: userId,
        vocabulary_id: word.id,
        confidence_rating: confidence,
        grammar_score: null,
        mode: 'translation'
      });
    } catch (error) {
      console.error('Error saving practice:', error);
    }
  }

  function checkTranslation(userAnswer: string, correct: string): boolean {
    const user = userAnswer.trim().toLowerCase();
    const correctLower = correct.toLowerCase();
    
    return user === correctLower || 
           correctLower.includes(user) || 
           user.includes(correctLower.split(',')[0].trim());
  }

  function nextWord() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserEnglish('');
      setUserSpanish('');
      setUserPrep('');
      setResults(null);
    } else {
      alert('🎉 Super! Du hast alle Wörter getestet!');
      onExit();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pristine">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-text-light">Lade Wörter...</p>
        </div>
      </div>
    );
  }

  const word = words[currentIndex];
  if (!word) return null;

  return (
    <div className="min-h-screen bg-pristine px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onExit}
            className="bg-white px-6 py-3 rounded-full shadow-md font-semibold text-primary hover:shadow-lg transition-all hover:-translate-x-1"
          >
            ← Zurück
          </button>
          <div className="text-text-light font-semibold">
            {currentIndex + 1} / {words.length}
          </div>
        </div>

        {/* Test Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-lg">
          <h2 className="font-fraunces text-4xl md:text-5xl font-semibold text-primary mb-6 text-center">
            {word.german}
          </h2>
          
          <p className="text-center text-text-light mb-8 text-lg">
            Übersetze dieses Wort!
          </p>

          {/* English Input */}
          <div className="mb-6">
            <label className="block font-semibold text-primary mb-2">Englisch:</label>
            <input
              type="text"
              value={userEnglish}
              onChange={(e) => setUserEnglish(e.target.value)}
              placeholder="Deine Übersetzung..."
              className="w-full p-4 border-2 border-pink rounded-2xl focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all text-lg"
              disabled={!!results}
            />
            {results && (
              <div className={`mt-2 p-3 rounded-xl ${results.english.correct ? 'bg-cascade/20 border-2 border-cascade' : 'bg-coral/20 border-2 border-coral'}`}>
                {results.english.correct ? (
                  <span className="text-cascade font-semibold">✓ Richtig!</span>
                ) : (
                  <span className="text-coral">
                    ✗ Falsch. Richtig: <span className="font-bold">{results.english.answer}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Spanish Input */}
          <div className="mb-6">
            <label className="block font-semibold text-primary mb-2">Español:</label>
            <input
              type="text"
              value={userSpanish}
              onChange={(e) => setUserSpanish(e.target.value)}
              placeholder="Tu traducción..."
              className="w-full p-4 border-2 border-pink rounded-2xl focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all text-lg"
              disabled={!!results}
            />
            {results && (
              <div className={`mt-2 p-3 rounded-xl ${results.spanish.correct ? 'bg-cascade/20 border-2 border-cascade' : 'bg-coral/20 border-2 border-coral'}`}>
                {results.spanish.correct ? (
                  <span className="text-cascade font-semibold">✓ Richtig!</span>
                ) : (
                  <span className="text-coral">
                    ✗ Falsch. Richtig: <span className="font-bold">{results.spanish.answer}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Preposition Input (if exists) */}
          {word.preposition && (
            <div className="mb-6">
              <label className="block font-semibold text-primary mb-2">Präposition:</label>
              <input
                type="text"
                value={userPrep}
                onChange={(e) => setUserPrep(e.target.value)}
                placeholder="z.B. mit + Dat"
                className="w-full p-4 border-2 border-pink rounded-2xl focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all text-lg"
                disabled={!!results}
              />
              {results && results.preposition && (
                <div className={`mt-2 p-3 rounded-xl ${results.preposition.correct ? 'bg-cascade/20 border-2 border-cascade' : 'bg-coral/20 border-2 border-coral'}`}>
                  {results.preposition.correct ? (
                    <span className="text-cascade font-semibold">✓ Richtig!</span>
                  ) : (
                    <span className="text-coral">
                      ✗ Falsch. Richtig: <span className="font-bold">{results.preposition.answer}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {!results ? (
              <button
                onClick={checkAnswers}
                className="flex-1 bg-gradient-to-r from-cascade to-parasailing text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                ✓ Antworten prüfen
              </button>
            ) : (
              <button
                onClick={nextWord}
                className="flex-1 bg-gradient-to-r from-cascade to-parasailing text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Weiter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
