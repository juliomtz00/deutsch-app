'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Word {
  id: number;
  german: string;
  english: string;
  spanish: string;
  preposition: string | null;
  example: string;
  priority: boolean;
}

interface DailyPracticeProps {
  userId: string;
  onExit: () => void;
}

export default function DailyPractice({ userId, onExit }: DailyPracticeProps) {
  const supabase = createClientComponentClient();
  
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentence, setSentence] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [translationsVisible, setTranslationsVisible] = useState(false);
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      // Get all words, with priority words weighted 2x
      const { data: allWords } = await supabase
        .from('vocabulary')
        .select('*')
        .order('german');

      if (!allWords) return;

      // Create pool with priority words appearing twice
      let pool: Word[] = [];
      allWords.forEach(word => {
        pool.push(word);
        if (word.priority) {
          pool.push(word); // Add priority words twice
        }
      });

      // Shuffle and take 5
      const shuffled = pool.sort(() => Math.random() - 0.5);
      setWords(shuffled.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  }

  async function checkGrammar() {
    if (!sentence.trim()) {
      alert('Bitte schreibe erst einen Satz!');
      return;
    }

    setIsCheckingGrammar(true);
    
    try {
      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'text': sentence,
          'language': 'de-DE'
        })
      });
      
      const data = await response.json();
      const matches = data.matches || [];
      
      // Calculate score
      let score = 5;
      if (matches.length > 0) score = 4;
      if (matches.length > 2) score = 3;
      if (matches.length > 4) score = 2;
      if (matches.length > 6) score = 1;
      
      setGrammarResult({
        score,
        matches: matches.slice(0, 5)
      });
    } catch (error) {
      setGrammarResult({
        score: null,
        error: 'Grammatik-Check nicht verfügbar'
      });
    }
    
    setIsCheckingGrammar(false);
  }

  async function saveAndNext() {
    const word = words[currentIndex];
    
    if (!sentence.trim()) {
      alert('Bitte schreibe erst einen Satz!');
      return;
    }

    if (confidence === 0) {
      alert('Bitte bewerte dein Vertrauen (1-5)!');
      return;
    }

    try {
      // Save practice session (NOT the sentence text)
      await supabase.from('practice_sessions').insert({
        user_id: userId,
        vocabulary_id: word.id,
        confidence_rating: confidence,
        grammar_score: grammarResult?.score || null,
        mode: 'daily'
      });

      // Update user stats
      const today = new Date().toISOString().split('T')[0];
      
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (stats) {
        const lastPractice = stats.last_practice_date;
        const newStreak = lastPractice === today 
          ? stats.current_streak 
          : (lastPractice === getPreviousDay(today) 
              ? stats.current_streak + 1 
              : 1);

        await supabase
          .from('user_stats')
          .update({
            total_practiced: stats.total_practiced + 1,
            current_streak: newStreak,
            longest_streak: Math.max(stats.longest_streak, newStreak),
            last_practice_date: today
          })
          .eq('user_id', userId);
      }

      // Move to next word
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSentence('');
        setConfidence(0);
        setTranslationsVisible(false);
        setGrammarResult(null);
      } else {
        alert('🎉 Super! Du hast alle Wörter geübt!');
        onExit();
      }
    } catch (error) {
      console.error('Error saving practice:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    }
  }

  function getPreviousDay(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  async function togglePriority() {
    const word = words[currentIndex];
    try {
      await supabase
        .from('vocabulary')
        .update({ priority: !word.priority })
        .eq('id', word.id);
      
      // Update local state
      const newWords = [...words];
      newWords[currentIndex] = { ...word, priority: !word.priority };
      setWords(newWords);
    } catch (error) {
      console.error('Error toggling priority:', error);
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
      <div className="max-w-3xl mx-auto">
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

        {/* Word Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-lg relative overflow-hidden mb-6">
          {/* Background blob */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cascade opacity-10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          
          {/* Priority Star */}
          <button
            onClick={togglePriority}
            className="absolute top-6 right-6 text-3xl transition-all hover:scale-110 group"
            style={{ opacity: word.priority ? 1 : 0.3 }}
          >
            {word.priority ? '⭐' : '☆'}
            <div className="absolute top-full right-0 mt-2 bg-nine-iron text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {word.priority ? 'Hohe Priorität - erscheint öfter!' : 'Klicken für hohe Priorität'}
            </div>
          </button>

          <div className="relative z-10">
            {/* German Word */}
            <h2 className="font-fraunces text-4xl md:text-5xl font-semibold text-primary mb-4">
              {word.german}
            </h2>

            {/* Translation Toggle */}
            <button
              onClick={() => setTranslationsVisible(!translationsVisible)}
              className="bg-pink text-primary border-2 border-coral px-6 py-3 rounded-full font-semibold mb-4 hover:bg-coral hover:text-white transition-all"
            >
              👁️ {translationsVisible ? 'Übersetzung verstecken' : 'Übersetzung zeigen'}
            </button>

            {/* Translations */}
            {translationsVisible && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-cascade">EN:</span>
                  <span className="text-text-light text-lg">{word.english}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-cascade">ES:</span>
                  <span className="text-text-light text-lg">{word.spanish}</span>
                </div>
                {word.preposition && (
                  <div className="inline-block bg-cascade text-white px-4 py-2 rounded-full font-semibold text-sm mt-2">
                    {word.preposition}
                  </div>
                )}
              </div>
            )}

            {/* Example */}
            {translationsVisible && (
              <div className="bg-pink p-4 rounded-2xl border-l-4 border-coral italic text-primary mb-6">
                {word.example}
              </div>
            )}

            {/* Sentence Input */}
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Schreibe hier deinen eigenen Satz über dein Leben, ESN, Braunschweig, dein Studium..."
              className="w-full min-h-[120px] p-4 border-2 border-pink rounded-2xl focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all resize-none text-lg"
            />

            {/* Grammar Check */}
            <div className="mt-4">
              <button
                onClick={checkGrammar}
                disabled={isCheckingGrammar}
                className="bg-cascade text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isCheckingGrammar ? 'Überprüfe...' : '✓ Grammatik checken'}
              </button>

              {grammarResult && (
                <div className="mt-4 bg-pink p-4 rounded-2xl">
                  {grammarResult.score !== null ? (
                    <>
                      <div className="text-2xl font-bold text-coral mb-2">
                        Grammatik-Score: {grammarResult.score}/5 {getScoreEmoji(grammarResult.score)}
                      </div>
                      {grammarResult.matches.length > 0 ? (
                        <div className="space-y-2">
                          {grammarResult.matches.map((match: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl text-sm">
                              <div className="text-coral font-semibold">⚠️ {match.message}</div>
                              {match.replacements && match.replacements.length > 0 && (
                                <div className="text-cascade mt-1">
                                  💡 Vorschlag: {match.replacements[0].value}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-cascade font-semibold">✨ Perfekt! Keine Fehler gefunden!</p>
                      )}
                    </>
                  ) : (
                    <p className="text-coral">⚠️ {grammarResult.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Confidence Rating */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pink/30 to-pink/10 rounded-2xl">
              <div className="font-semibold text-primary mb-3">
                Wie sicher fühlst du dich mit diesem Wort?
              </div>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                      confidence >= level
                        ? 'bg-coral text-white scale-110 shadow-lg'
                        : 'bg-pink text-primary hover:scale-105'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={saveAndNext}
            className="flex-1 bg-gradient-to-r from-cascade to-parasailing text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            ✓ Speichern & Weiter
          </button>
          <button
            onClick={() => {
              if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSentence('');
                setConfidence(0);
                setTranslationsVisible(false);
                setGrammarResult(null);
              } else {
                onExit();
              }
            }}
            className="bg-white border-2 border-pink px-8 py-4 rounded-full font-semibold text-primary hover:bg-pink transition-all"
          >
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}

function getScoreEmoji(score: number): string {
  const emojis = ['😞', '😕', '😐', '😊', '🌟'];
  return emojis[score - 1] || '😐';
}
