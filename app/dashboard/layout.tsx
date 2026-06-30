import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import type { Organization } from '@/lib/supabase/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  if (!profile.org_id || !profile.organizations) redirect('/onboarding')

  const org = profile.organizations as unknown as Organization

  return (
    <DashboardShell org={org} profile={{ ...profile, organizations: org }}>
      {children}
    </DashboardShell>
  )
}
