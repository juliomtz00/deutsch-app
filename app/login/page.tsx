'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        })
        if (error) throw error
        alert('✓ Konto erstellt! Bitte bestätige deine E-Mail.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-parasailing to-cascade">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-semibold text-nine-iron mb-2">
              Deutsch Aktiv 🌱
            </h1>
            <p className="text-gray-600">Dein Wortschatztrainer</p>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 mb-6 bg-crystal-rose/30 rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                !isSignUp
                  ? 'bg-nasturtium text-white shadow-lg'
                  : 'text-nine-iron hover:bg-white/50'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                isSignUp
                  ? 'bg-nasturtium text-white shadow-lg'
                  : 'text-nine-iron hover:bg-white/50'
              }`}
            >
              Registrieren
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-nine-iron mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-crystal-rose focus:border-nasturtium focus:outline-none transition-colors"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-nine-iron mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-2xl border-2 border-crystal-rose focus:border-nasturtium focus:outline-none transition-colors"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            {error && (
              <div className="bg-nasturtium/10 border-2 border-nasturtium rounded-2xl p-3 text-nasturtium text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cascade to-parasailing text-white font-semibold py-4 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Lädt...' : isSignUp ? 'Konto erstellen' : 'Anmelden'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignUp ? (
              <p>
                Mit der Registrierung stimmst du zu, dass deine Daten sicher gespeichert werden.
              </p>
            ) : (
              <p>
                Noch kein Konto? Klicke oben auf "Registrieren"
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-white text-center">
          <div>
            <div className="text-3xl mb-1">📝</div>
            <div className="text-sm font-medium">Daily Practice</div>
          </div>
          <div>
            <div className="text-3xl mb-1">🌍</div>
            <div className="text-sm font-medium">3 Sprachen</div>
          </div>
          <div>
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-sm font-medium">Streak Tracking</div>
          </div>
        </div>
      </div>
    </div>
  )
}
