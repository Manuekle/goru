import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { SURFACE_LABELS } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Grid02Icon } from '@hugeicons/core-free-icons'
import { NewCourtTrigger } from '@/components/courts/NewCourtTrigger'

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
        <NewCourtTrigger />
      </div>

      {!courts?.length ? (
        <EmptyState
          icon={Grid02Icon}
          title="Sin canchas todavía"
          description="Creá tu primera cancha para empezar a recibir reservas."
          action={<NewCourtTrigger />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <Link key={court.id} href={`/dashboard/courts/${court.id}`}>
              <Card className="transition-colors hover:border-[var(--brand)]/50">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">{court.name}</span>
                    <Badge variant={court.active ? 'success' : 'default'}>
                      {court.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{SURFACE_LABELS[court.surface]}</p>
                  <p className="text-sm text-muted-foreground">{court.capacity} jugadores</p>
                  {court.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{court.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
