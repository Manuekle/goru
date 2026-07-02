'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { deleteClient } from '@/actions/clients'

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  return (
    <ConfirmDialog
      trigger={<Button variant="danger" size="sm">Eliminar cliente</Button>}
      title={`Eliminar ${clientName}`}
      description="Se eliminará el cliente y su historial dejará de estar asociado a su perfil. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      onConfirm={async () => { await deleteClient(clientId) }}
    />
  )
}
