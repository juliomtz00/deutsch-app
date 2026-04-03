import { createServerClient } from '../../lib/supabase'
import { redirect } from 'next/navigation'
import VocabularyBrowser from '../../components/VocabularyBrowser'
import { cookies } from 'next/headers'

export default async function VocabularyPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: vocabulary } = await supabase
    .from('vocabulary')
    .select('*')
    .order('german')

  return (
    <VocabularyBrowser 
      initialVocabulary={vocabulary || []}
      userId={session.user.id}
    />
  )
}
