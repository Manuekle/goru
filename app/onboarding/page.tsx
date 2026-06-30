'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrg, addOnboardingCourt, checkSlugAvailability } from '@/actions/onboarding'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'
import { SURFACE_LABELS } from '@/lib/utils'
import type { Organization, Court } from '@/lib/supabase/types'

const SURFACE_OPTIONS = Object.entries(SURFACE_LABELS).map(([value, label]) => ({ value, label }))

const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (UTC-3)' },
  { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
  { value: 'America/Mexico_City', label: 'México (UTC-6)' },
  { value: 'America/Santiago', label: 'Chile (UTC-4)' },
  { value: 'America/Lima', label: 'Perú (UTC-5)' },
]

type Step = 'org' | 'courts' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('org')
  const [org, setOrg] = useState<Organization | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [slugError, setSlugError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Step 1: Org creation
  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires')

  function handleOrgNameChange(value: string) {
    setOrgName(value)
    if (!slug || slug === slugify(orgName)) {
      setSlug(slugify(value))
    }
  }

  async function handleOrgSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setSlugError('')

    const fd = new FormData(e.currentTarget)

    const { available } = await checkSlugAvailability(slug)
    if (!available) {
      setSlugError('Este identificador ya está en uso')
      return
    }
    startTransition(async () => {
      const result = await createOrg(fd)
      if (result?.error) {
        setErrors(result.error as Record<string, string[]>)
        return
      }
      if (result?.org) {
        setOrg(result.org)
        setStep('courts')
      }
    })
  }

  // Step 2: Add courts
  const [courtErrors, setCourtErrors] = useState<Record<string, string[]>>({})

  async function handleAddCourt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!org) return
    setCourtErrors({})

    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addOnboardingCourt(org.id, fd)
      if (result?.error) {
        setCourtErrors(result.error as Record<string, string[]>)
        return
      }
      if (result?.court) {
        setCourts((prev) => [...prev, result.court])
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  function handleFinish() {
    router.push('/dashboard')
  }

  if (step === 'org') {
    return (
      <div className="onboarding-step">
        <div className="onboarding-step__header">
          <span className="onboarding-step__num">1 / 2</span>
          <h1 className="onboarding-step__title">Contanos sobre tu complejo</h1>
          <p className="onboarding-step__desc">
            Esta información aparecerá en tu panel y en el link de reservas de tus clientes.
          </p>
        </div>

        <form onSubmit={handleOrgSubmit} className="onboarding-form">
          {errors._form && <p className="auth-error">{errors._form[0]}</p>}

          <Input
            label="Nombre del complejo"
            name="name"
            value={orgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            placeholder="Kopana Football Club"
            required
            error={errors.name?.[0]}
          />

          <div className="field">
            <label className="field-label" htmlFor="slug">
              Identificador único
            </label>
            <div className="field-slug-wrap">
              <span className="field-slug-prefix">goru.app/book/</span>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="field-input field-slug-input"
                pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
                minLength={4}
                required
              />
            </div>
            {slugError && <p className="field-error">{slugError}</p>}
            {errors.slug && <p className="field-error">{errors.slug[0]}</p>}
            <p className="field-hint">Solo letras minúsculas, números y guiones</p>
          </div>

          <Select
            label="Zona horaria"
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={TIMEZONES}
          />

          <Button type="submit" variant="brand" loading={isPending} style={{ width: '100%' }}>
            Continuar
          </Button>
        </form>
      </div>
    )
  }

  if (step === 'courts') {
    return (
      <div className="onboarding-step">
        <div className="onboarding-step__header">
          <span className="onboarding-step__num">2 / 2</span>
          <h1 className="onboarding-step__title">Agregá tus canchas</h1>
          <p className="onboarding-step__desc">
            Podés agregar más canchas después desde el panel. Mínimo una para comenzar.
          </p>
        </div>

        {courts.length > 0 && (
          <ul className="onboarding-courts">
            {courts.map((c) => (
              <li key={c.id} className="onboarding-court-item">
                <span>{c.name}</span>
                <span className="onboarding-court-surface">
                  {SURFACE_LABELS[c.surface]}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddCourt} className="onboarding-form">
          {courtErrors._form && <p className="auth-error">{courtErrors._form[0]}</p>}

          <Input
            label="Nombre de la cancha"
            name="name"
            placeholder="Cancha 1"
            required
            error={courtErrors.name?.[0]}
          />

          <Select
            label="Superficie"
            name="surface"
            options={SURFACE_OPTIONS}
            defaultValue="synthetic"
          />

          <Input
            label="Capacidad (jugadores)"
            name="capacity"
            type="number"
            min={2}
            max={100}
            defaultValue={10}
            error={courtErrors.capacity?.[0]}
          />

          <div className="onboarding-form__actions">
            <Button type="submit" variant="dark" loading={isPending}>
              + Agregar cancha
            </Button>

            {courts.length > 0 && (
              <Button type="button" variant="brand" onClick={handleFinish}>
                Ir al panel →
              </Button>
            )}
          </div>
        </form>
      </div>
    )
  }

  return null
}
