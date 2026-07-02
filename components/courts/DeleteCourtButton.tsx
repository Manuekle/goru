'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { deleteCourt } from '@/actions/courts'

export function DeleteCourtButton({ courtId, courtName }: { courtId: string; courtName: string }) {
  return (
    <ConfirmDialog
      trigger={<Button variant="danger" size="sm">Eliminar cancha</Button>}
      title={`Eliminar ${courtName}`}
      description="La cancha se desactivará y dejará de aparecer en reservas nuevas. Esta acción no se puede deshacer desde aquí."
      confirmLabel="Eliminar"
      onConfirm={async () => { await deleteCourt(courtId) }}
    />
  )
}
