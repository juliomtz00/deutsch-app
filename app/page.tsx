import { createServerClient } from '../lib/supabase'
import { redirect } from 'next/navigation'
import ProgressHero from '../components/ProgressHero'
import PracticeModes from '../components/PracticeModes'
import AddWordSection from '../components/AddWordSection'
import Header from '../components/Header'
import { cookies } from 'next/headers'


export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Get user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // Get total vocabulary count
  const { count: vocabCount } = await supabase
    .from('vocabulary')
    .select('*', { count: 'exact', head: true })

  // Get priority word count
  const { count: priorityCount } = await supabase
    .from('vocabulary')
    .select('*', { count: 'exact', head: true })
    .gt('priority', 0)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Header user={session.user} />
        
        <ProgressHero 
          stats={stats || {
            total_practiced: 0,
            unique_words_count: 0,
            current_streak: 0,
            longest_streak: 0
          }}
          totalWords={vocabCount || 0}
          priorityCount={priorityCount || 0}
        />

        <PracticeModes />

        <AddWordSection userId={session.user.id} />
      </div>
    </div>
  )
}
