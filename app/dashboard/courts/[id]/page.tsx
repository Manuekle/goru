import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CourtForm } from '@/components/courts/CourtForm'
import { ScheduleEditor } from '@/components/courts/ScheduleEditor'
import { Button } from '@/components/ui/Button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CourtEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const [{ data: court }, { data: schedules }] = await Promise.all([
    supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .eq('org_id', profile.org_id)
      .single(),
    supabase
      .from('court_schedules')
      .select('*')
      .eq('court_id', id)
      .order('day_of_week'),
  ])

  if (!court) notFound()

  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <Link href="/dashboard/courts">
          <Button variant="ghost" size="sm">← Canchas</Button>
        </Link>
        <h1 className="dash-page__title">{court.name}</h1>
      </div>

      <section className="dash-section">
        <h2 className="dash-section__title">Información</h2>
        <CourtForm court={court} />
      </section>

      <section className="dash-section">
        <ScheduleEditor courtId={court.id} schedules={schedules ?? []} />
      </section>
    </div>
  )
}
