'use client'

import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getDateDisplay = () => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    const now = new Date()
    return `${days[now.getDay()]}, ${now.getDate()}. ${months[now.getMonth()]}`
  }

  return (
    <header className="mb-8">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-nine-iron mb-2">
            Deutsch Aktiv 🌱
          </h1>
          <p className="text-gray-600 font-medium">{getDateDisplay()}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Angemeldet als</p>
            <p className="font-semibold text-nine-iron">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white border-2 border-crystal-rose rounded-full font-semibold text-nine-iron hover:bg-crystal-rose transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  )
}
