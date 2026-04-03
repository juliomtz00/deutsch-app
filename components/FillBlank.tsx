'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Word {
  id: number;
  german: string;
  example: string;
}

interface FillBlankProps {
  userId: string;
  onExit: () => void;
}

export default function FillBlank({ userId, onExit }: FillBlankProps) {
  const supabase = createClientComponentClient();
  
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const { data: allWords } = await supabase
        .from('vocabulary')
        .select('id, german, example')
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

  async function checkAnswer() {
    const word = words[currentIndex];
    const cleanWord = word.german.toLowerCase().replace('sich ', '');
    const userClean = userAnswer.trim().toLowerCase();
    
    const isCorrect = userClean === cleanWord || userClean === word.german.toLowerCase();
    
    setResult({
      correct: isCorrect,
      answer: word.german
    });

    // Save practice session
    const confidence = isCorrect ? 5 : 3;

    try {
      await supabase.from('practice_sessions').insert({
        user_id: userId,
        vocabulary_id: word.id,
        confidence_rating: confidence,
        grammar_score: null,
        mode: 'fillblank'
      });
    } catch (error) {
      console.error('Error saving practice:', error);
    }
  }

  function nextWord() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setResult(null);
    } else {
      alert('🎉 Super! Du hast alle Lücken ausgefüllt!');
      onExit();
    }
  }

  function createBlankSentence(sentence: string, word: string): string {
    const cleanWord = word.replace('sich ', '');
    const regex = new RegExp(cleanWord, 'gi');
    return sentence.replace(regex, '_____');
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

  const blankSentence = createBlankSentence(word.example, word.german);

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

        {/* Fill Blank Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-text-light mb-6 text-center">
            Fülle die Lücke aus:
          </h3>

          <div className="bg-pink p-6 rounded-2xl border-l-4 border-coral text-2xl text-primary mb-8 leading-relaxed">
            {blankSentence}
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block font-semibold text-primary mb-2">Deine Antwort:</label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Welches Wort fehlt?"
              className="w-full p-4 border-2 border-pink rounded-2xl focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all text-lg"
              disabled={!!result}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !result) {
                  checkAnswer();
                }
              }}
            />
            {result && (
              <div className={`mt-4 p-4 rounded-xl ${result.correct ? 'bg-cascade/20 border-2 border-cascade' : 'bg-coral/20 border-2 border-coral'}`}>
                {result.correct ? (
                  <span className="text-cascade font-semibold text-lg">
                    ✓ Perfekt! Das ist richtig!
                  </span>
                ) : (
                  <span className="text-coral text-lg">
                    ✗ Fast! Die richtige Antwort ist: <span className="font-bold">{result.answer}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {!result ? (
              <button
                onClick={checkAnswer}
                className="flex-1 bg-gradient-to-r from-cascade to-parasailing text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                ✓ Antwort prüfen
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
