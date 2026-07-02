'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, CheckmarkCircle02Icon, ExternalLinkIcon } from '@hugeicons/core-free-icons'

export function BookingLinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const path = `/book/${slug}`
  const url = `${origin}${path}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link de reservas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Compartí este link con tus clientes para que reserven canchas por su cuenta.
        </p>
        <div className="flex items-center gap-2">
          <div className="field-input flex-1 overflow-x-auto whitespace-nowrap font-[family-name:var(--font-mono)] text-sm text-[var(--text)]">
            {url}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
            <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={16} />
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="ghost" size="sm">
              <HugeiconsIcon icon={ExternalLinkIcon} size={16} />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
