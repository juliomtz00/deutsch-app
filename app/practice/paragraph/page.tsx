import { cookies } from 'next/headers'
import { createServerClient } from '../../../lib/supabase'
import { redirect } from 'next/navigation'
import ParagraphPractice from '../../../components/ParagraphPractice'

export default async function ParagraphPracticePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  
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

  // Get 10 random words
  const shuffled = allVocab.sort(() => Math.random() - 0.5)
  const selectedWords = shuffled.slice(0, 10)

  return (
    <ParagraphPractice 
      words={selectedWords}
      userId={session.user.id}
    />
  )
}