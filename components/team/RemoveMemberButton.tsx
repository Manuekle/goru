'use client'

import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { removeMember } from '@/actions/team'

export function RemoveMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const router = useRouter()

  return (
    <ConfirmDialog
      trigger={<Button variant="danger" size="sm">Quitar</Button>}
      title={`Quitar a ${memberName}`}
      description="Esta persona perderá acceso al panel de la organización."
      confirmLabel="Quitar"
      onConfirm={async () => {
        await removeMember(memberId)
        router.refresh()
      }}
    />
  )
}
