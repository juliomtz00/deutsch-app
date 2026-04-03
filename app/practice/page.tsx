'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import DailyPractice from '../../components/DailyPractice';
import TranslationTest from '../../components/TranslationTest';
import FillBlank from '../../components/FillBlank';
import ProgressHero from '../../components/ProgressHero';
import ModeCard from '../../components/ModeCard';
import { createClient } from '../../lib/supabase'

export default function DailyPracticePage() {
  const router = useRouter();
  const supabase = createClient()  // Client-side only
  
  const [user, setUser] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWords: 0,
    practiceCount: 0,
    priorityCount: 0,
    currentStreak: 0,
    uniqueWords: 0
  });

  useEffect(() => {
    checkUser();
    loadStats();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
  }

  async function loadStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total vocabulary count
      const { count: vocabCount } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true });

      // Get practice stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: any }

      // Get priority words count
      const { count: priorityCount } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('priority', true);

      // Get practice sessions count
      const { count: practiceCount } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalWords: vocabCount || 0,
        practiceCount: practiceCount || 0,
        priorityCount: priorityCount || 0,
        currentStreak: (userStats && userStats.current_streak) || 0,
        uniqueWords: (userStats && userStats.unique_words_count) || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function startMode(mode: string) {
    setCurrentMode(mode);
  }

  function exitMode() {
    setCurrentMode(null);
    loadStats(); // Refresh stats after practice
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pristine">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-text-light">Lade...</p>
        </div>
      </div>
    );
  }

  if (currentMode === 'daily') {
    return <DailyPractice userId={user.id} onExit={exitMode} />;
  }

  if (currentMode === 'translation') {
    return <TranslationTest userId={user.id} onExit={exitMode} />;
  }

  if (currentMode === 'fillblank') {
    return <FillBlank userId={user.id} onExit={exitMode} />;
  }

  return (
    <div className="min-h-screen bg-pristine">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-fraunces text-4xl md:text-5xl font-semibold text-primary">
                Deutsch Aktiv 🌱
              </h1>
              <p className="text-text-light font-medium mt-2">
                {new Date().toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-coral to-nasturtium text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-xl">🔥</span>
              <span className="font-bold">{stats.currentStreak} Tage</span>
            </div>
          </div>
        </header>

        {/* Progress Hero */}
        <ProgressHero stats={stats} userName={user.email?.split('@')[0] || 'Jules'} />

        {/* Practice Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ModeCard
            icon="📝"
            title="Daily Practice"
            description="5 Wörter üben - Übersetzung versteckt, Grammatik checken"
            badge="Empfohlen"
            onClick={() => startMode('daily')}
          />

          <ModeCard
            icon="🌍"
            title="Translation Test"
            description="Nur Deutsch → tippe Englisch & Español!"
            badge="Challenge"
            onClick={() => startMode('translation')}
          />

          <ModeCard
            icon="✏️"
            title="Fill in the Blank"
            description="Lückentext ausfüllen - teste dein Gedächtnis!"
            badge="Challenge"
            onClick={() => startMode('fillblank')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/vocabulary')}
            className="bg-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-fraunces text-xl font-semibold text-primary mb-2">
              Alle Wörter
            </h3>
            <p className="text-text-light">
              Durchsuche deine gesamte Wortschatz-Sammlung
            </p>
          </button>

          <button
            onClick={() => router.push('/add-word')}
            className="bg-gradient-to-br from-parasailing to-cascade text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-fraunces text-xl font-semibold mb-2">
              Neues Wort
            </h3>
            <p className="opacity-90">
              Füge neue Wörter zu deiner Sammlung hinzu
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
