import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import VocabularyBrowser from '@/components/VocabularyBrowser'

export default async function VocabularyPage() {
  const supabase = createServerClient()
  
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
