import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { NewBookingForm } from '@/components/bookings/NewBookingForm'

export default async function NewBookingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, organizations(timezone)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const timezone = (profile.organizations as { timezone: string } | null)?.timezone ?? 'UTC'

  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('org_id', profile.org_id)
    .eq('active', true)
    .order('created_at')

  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="sm">← Reservas</Button>
        </Link>
        <h1 className="dash-page__title">Nueva reserva</h1>
      </div>

      <NewBookingForm
        courts={courts?.map((c) => ({ value: c.id, label: c.name })) ?? []}
        timezone={timezone}
      />
    </div>
  )
}
