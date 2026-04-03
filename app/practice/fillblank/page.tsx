import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import PracticeSession from '@/components/PracticeSession'

export default async function FillBlankPracticePage() {
  const supabase = createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: allVocab } = await supabase
    .from('vocabulary')
    .select('*')

  if (!allVocab || allVocab.length === 0) {
    return <div>No vocabulary found</div>
  }

  const shuffled = allVocab.sort(() => Math.random() - 0.5)
  const selectedWords = shuffled.slice(0, 5)

  return (
    <PracticeSession 
      words={selectedWords}
      mode="fillblank"
      userId={session.user.id}
    />
  )
}
