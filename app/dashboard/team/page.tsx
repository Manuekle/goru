import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABELS } from '@/lib/utils'
import { TeamInviteForm } from '@/components/team/TeamInviteForm'

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const isAdmin = ['owner', 'admin'].includes(profile.role)

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('org_id', profile.org_id)
      .order('role'),

    supabase
      .from('invitations')
      .select('id, email, role, expires_at, accepted_at')
      .eq('org_id', profile.org_id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Equipo</h1>
      </div>

      <section className="dash-section">
        <h2 className="dash-section__title">Miembros</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => (
              <tr key={m.id}>
                <td>
                  <p>{m.full_name}</p>
                  {m.id === user.id && <p className="data-table__sub">Vos</p>}
                </td>
                <td>
                  <Badge>{ROLE_LABELS[m.role]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {invitations && invitations.length > 0 && (
        <section className="dash-section">
          <h2 className="dash-section__title">Invitaciones pendientes</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Vence</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.email}</td>
                  <td><Badge>{ROLE_LABELS[inv.role]}</Badge></td>
                  <td className="data-table__sub">
                    {new Date(inv.expires_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {isAdmin && (
        <section className="dash-section">
          <h2 className="dash-section__title">Invitar miembro</h2>
          <TeamInviteForm />
        </section>
      )}
    </div>
  )
}
