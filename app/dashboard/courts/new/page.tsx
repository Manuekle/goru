import Link from 'next/link'
import { CourtForm } from '@/components/courts/CourtForm'
import { Button } from '@/components/ui/Button'

export default function NewCourtPage() {
  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <Link href="/dashboard/courts">
          <Button variant="ghost" size="sm">← Canchas</Button>
        </Link>
        <h1 className="dash-page__title">Nueva cancha</h1>
      </div>
      <CourtForm />
    </div>
  )
}
