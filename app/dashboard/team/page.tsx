import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ROLE_LABELS } from '@/lib/utils'
import { TeamInviteForm } from '@/components/team/TeamInviteForm'
import { RemoveMemberButton } from '@/components/team/RemoveMemberButton'
import { RevokeInvitationButton } from '@/components/team/RevokeInvitationButton'

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

      <Card>
        <CardHeader>
          <CardTitle>Miembros</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              {isAdmin && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <p>{m.full_name}</p>
                  {m.id === user.id && <p className="data-table__sub">Vos</p>}
                </TableCell>
                <TableCell>
                  <Badge>{ROLE_LABELS[m.role]}</Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {m.role !== 'owner' && m.id !== user.id && (
                      <RemoveMemberButton memberId={m.id} memberName={m.full_name} />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Vence</TableHead>
                {isAdmin && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell><Badge>{ROLE_LABELS[inv.role]}</Badge></TableCell>
                  <TableCell className="data-table__sub">
                    {new Date(inv.expires_at).toLocaleDateString('es-AR')}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <RevokeInvitationButton invitationId={inv.id} email={inv.email} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invitar miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamInviteForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
