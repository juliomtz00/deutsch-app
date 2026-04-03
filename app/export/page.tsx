import { createServerClient } from '../../lib/supabase'
import { redirect } from 'next/navigation'
import ExportData from '../../components/ExportData'

export default async function ExportPage() {
  const supabase = createServerClient()
  
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

  // Get practice sessions
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select(`
      *,
      vocabulary (
        german,
        english,
        spanish
      )
    `)
    .eq('user_id', session.user.id)
    .order('practiced_at', { ascending: false })
    .limit(100)

  return (
    <ExportData 
      stats={stats}
      sessions={sessions || []}
    />
  )
}
