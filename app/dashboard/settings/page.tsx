import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrgSettingsForm } from '@/components/OrgSettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role, organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id || !profile.organizations) redirect('/onboarding')

  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Configuración</h1>
      </div>
      <OrgSettingsForm org={profile.organizations as Parameters<typeof OrgSettingsForm>[0]['org']} />
    </div>
  )
}
