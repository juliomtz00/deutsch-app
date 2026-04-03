import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import PracticeSession from '@/components/PracticeSession'

export default async function DailyPracticePage() {
  const supabase = createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Get vocabulary with priority weighting
  const { data: allVocab } = await supabase
    .from('vocabulary')
    .select('*')
    .order('priority', { ascending: false })

  if (!allVocab || allVocab.length === 0) {
    return <div>No vocabulary found</div>
  }

  // Weight priority words (add them twice to pool)
  const pool: any[] = []
  allVocab.forEach(word => {
    pool.push(word)
    if (word.priority > 0) {
      pool.push(word) // Add priority words twice
    }
  })

  // Shuffle and take 5
  const shuffled = pool.sort(() => Math.random() - 0.5)
  const selectedWords = shuffled.slice(0, 5)

  return (
    <PracticeSession 
      words={selectedWords}
      mode="daily"
      userId={session.user.id}
    />
  )
}
