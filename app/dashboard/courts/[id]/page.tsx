import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CourtForm } from '@/components/courts/CourtForm'
import { ScheduleEditor } from '@/components/courts/ScheduleEditor'
import { BackButton } from '@/components/ui/BackButton'
import { DeleteCourtButton } from '@/components/courts/DeleteCourtButton'

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
    <div className="dash-page">
      <div className="dash-page__header">
        <BackButton href="/dashboard/courts" />
        <h1 className="dash-page__title">{court.name}</h1>
        <DeleteCourtButton courtId={court.id} courtName={court.name} />
      </div>

      <div className="court-detail-grid">
        <Card className="court-detail-grid__info">
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <CourtForm court={court} />
          </CardContent>
        </Card>

        <Card className="court-detail-grid__schedule">
          <CardContent>
            <ScheduleEditor courtId={court.id} schedules={schedules ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
