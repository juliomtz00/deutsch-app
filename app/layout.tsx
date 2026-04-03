import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deutsch Aktiv | Dein Wortschatztrainer',
  description: 'Learn German vocabulary with daily practice, grammar checking, and multiple test modes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
