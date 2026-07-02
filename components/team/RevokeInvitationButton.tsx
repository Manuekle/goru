'use client'

import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { revokeInvitation } from '@/actions/team'

export function RevokeInvitationButton({ invitationId, email }: { invitationId: string; email: string }) {
  const router = useRouter()

  return (
    <ConfirmDialog
      trigger={<Button variant="danger" size="sm">Revocar</Button>}
      title={`Revocar invitación a ${email}`}
      description="Esta invitación dejará de ser válida y la persona no podrá unirse con ese enlace."
      confirmLabel="Revocar"
      onConfirm={async () => {
        await revokeInvitation(invitationId)
        router.refresh()
      }}
    />
  )
}
