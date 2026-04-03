'use client'

import Link from 'next/link'

export default function PracticeModes() {
  const modes = [
    {
      href: '/practice/daily',
      icon: '📝',
      title: 'Daily Practice',
      description: '5 Wörter üben - Übersetzung versteckt, Grammatik checken',
      badge: 'Empfohlen',
      gradient: 'from-crystal-rose/20 to-transparent'
    },
    {
      href: '/practice/translation',
      icon: '🌍',
      title: 'Translation Test',
      description: 'Nur Deutsch → tippe Englisch & Español!',
      badge: 'Challenge',
      gradient: 'from-cascade/20 to-transparent'
    },
    {
      href: '/practice/fillblank',
      icon: '✏️',
      title: 'Fill in the Blank',
      description: 'Lückentext ausfüllen - teste dein Gedächtnis!',
      badge: 'Challenge',
      gradient: 'from-nasturtium/20 to-transparent'
    },
    {
      href: '/vocabulary',
      icon: '📚',
      title: 'Alle Wörter',
      description: 'Durchsuche deine gesamte Wortschatz-Sammlung',
      badge: null,
      gradient: 'from-parasailing/20 to-transparent'
    },
    {
      href: '/export',
      icon: '💾',
      title: 'Daten exportieren',
      description: 'Sichere deine Lernfortschritte',
      badge: null,
      gradient: 'from-nine-iron/20 to-transparent'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {modes.map((mode) => (
        <Link
          key={mode.href}
          href={mode.href}
          className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          <div className="relative z-10">
            <div className="text-5xl mb-4">{mode.icon}</div>
            <h3 className="font-serif text-2xl font-semibold text-nine-iron mb-2">
              {mode.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
            
            {mode.badge && (
              <span className="inline-block bg-crystal-rose text-nine-iron px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                {mode.badge}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
