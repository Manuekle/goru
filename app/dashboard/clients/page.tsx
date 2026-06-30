import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
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

      <form method="GET" className="search-bar">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, teléfono o email..."
          className="field-input"
        />
        <Button type="submit" variant="dark" size="sm">Buscar</Button>
      </form>

      {!clients?.length ? (
        <EmptyState
          title={q ? 'Sin resultados' : 'Sin clientes todavía'}
          description={q ? `No se encontraron clientes para "${q}"` : 'Los clientes aparecen aquí cuando hacen reservas.'}
        />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Desde</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/dashboard/clients/${c.id}`} className="data-table__link">
                    {c.full_name}
                  </Link>
                </td>
                <td>{c.phone ?? '—'}</td>
                <td>{c.email ?? '—'}</td>
                <td>{formatDateShort(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
