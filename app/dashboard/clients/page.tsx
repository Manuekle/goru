import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Group01Icon } from '@hugeicons/core-free-icons'
import { formatDateShort } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  let query = supabase
    .from('clients')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('full_name')
    .limit(100)

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: clients } = await query

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Clientes</h1>
      </div>

      <form method="GET" className="flex gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full sm:w-72"
        />
        <Button type="submit" variant="dark" size="sm">Buscar</Button>
      </form>

      {!clients?.length ? (
        <EmptyState
          icon={Group01Icon}
          title={q ? 'Sin resultados' : 'Sin clientes todavía'}
          description={q ? `No se encontraron clientes para "${q}"` : 'Los clientes aparecen aquí cuando hacen reservas.'}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/dashboard/clients/${c.id}`} className="data-table__link">
                      {c.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{c.phone ?? '—'}</TableCell>
                  <TableCell>{c.email ?? '—'}</TableCell>
                  <TableCell>{formatDateShort(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
