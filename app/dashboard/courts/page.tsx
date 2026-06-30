import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SURFACE_LABELS } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function CourtsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at')

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Canchas</h1>
        <Link href="/dashboard/courts/new">
          <Button variant="brand" size="sm">+ Nueva cancha</Button>
        </Link>
      </div>

      {!courts?.length ? (
        <EmptyState
          title="Sin canchas todavía"
          description="Creá tu primera cancha para empezar a recibir reservas."
          action={
            <Link href="/dashboard/courts/new">
              <Button variant="brand">+ Nueva cancha</Button>
            </Link>
          }
        />
      ) : (
        <div className="court-grid">
          {courts.map((court) => (
            <Link key={court.id} href={`/dashboard/courts/${court.id}`} className="court-card">
              <div className="court-card__head">
                <span className="court-card__name">{court.name}</span>
                <Badge variant={court.active ? 'success' : 'default'}>
                  {court.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <p className="court-card__surface">{SURFACE_LABELS[court.surface]}</p>
              <p className="court-card__capacity">{court.capacity} jugadores</p>
              {court.description && (
                <p className="court-card__desc">{court.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
