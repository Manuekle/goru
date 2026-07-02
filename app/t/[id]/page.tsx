import { getTicketData } from '@/actions/tickets'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { CheckInButton } from './CheckInButton'
import { formatDate, formatTime, formatPrice, SURFACE_LABELS, STATUS_LABELS, whatsappShareUrl } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: Props) {
  const { id } = await params
  const booking = await getTicketData(id)

  if (!booking) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (booking as any).organizations as { name: string; slug: string; timezone: string; phone: string | null; address: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const court = (booking as any).courts as { name: string; surface: string } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (booking as any).clients as { full_name: string; phone: string | null } | null

  const tz = org?.timezone ?? 'UTC'
  const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goru.app'}/t/${id}`

  // Generate QR code SVG
  const qrSvg = await QRCode.toString(ticketUrl, {
    type: 'svg',
    width: 220,
    margin: 2,
    color: { dark: '#0c0d12', light: '#efe9dc' },
  })

  const shareText = `🎟️ Reserva confirmada — ${court?.name ?? 'Cancha'}\n${formatDate(booking.start_time, tz)} ${formatTime(booking.start_time, tz)} – ${formatTime(booking.end_time, tz)}\n${client?.full_name ?? 'Cliente'}\n📲 ${ticketUrl}`

  return (
    <div className="ticket-shell">
      <div className="ticket-nav">
        <Link href="/" className="ticket-nav__brand">
          <span className="ticket-nav__mark">G</span>
          <span>Goru</span>
        </Link>
        <span className="ticket-nav__sub">Ticket digital</span>
      </div>

      <div className="ticket-page">
        <div className="ticket-card">
          {/* Header */}
          <div className="ticket-card__head">
            <div className="ticket-card__venue">
              <p className="ticket-card__org">{org?.name ?? 'Reserva'}</p>
              <p className="ticket-card__court">
                {court?.name ?? '—'}
                {court?.surface && (
                  <span className="badge ticket-badge">{SURFACE_LABELS[court.surface]}</span>
                )}
              </p>
            </div>
            <div className="ticket-card__status">
              {booking.checked_in_at ? (
                <span className="status-pill ok">Check-in: {formatTime(booking.checked_in_at, tz)}</span>
              ) : (
                <span className={`status-pill ${booking.status === 'confirmed' ? 'ok' : booking.status === 'pending' ? 'pend' : ''}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="ticket-card__qr">
            <div
              className="ticket-card__qr-code"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="ticket-card__qr-hint">
              {booking.checked_in_at ? '✓ Check-in realizado' : 'Mostrá este QR al llegar'}
            </p>
          </div>

          {/* Details */}
          <div className="ticket-card__details">
            <div className="ticket-detail">
              <span className="ticket-detail__label">Fecha</span>
              <span className="ticket-detail__value">{formatDate(booking.start_time, tz)}</span>
            </div>
            <div className="ticket-detail">
              <span className="ticket-detail__label">Horario</span>
              <span className="ticket-detail__value">{formatTime(booking.start_time, tz)} – {formatTime(booking.end_time, tz)}</span>
            </div>
            <div className="ticket-detail">
              <span className="ticket-detail__label">Cliente</span>
              <span className="ticket-detail__value">{client?.full_name ?? '—'}</span>
            </div>
            {client?.phone && (
              <div className="ticket-detail">
                <span className="ticket-detail__label">Teléfono</span>
                <span className="ticket-detail__value">{client.phone}</span>
              </div>
            )}
            <div className="ticket-detail">
              <span className="ticket-detail__label">Precio</span>
              <span className="ticket-detail__value">{formatPrice(Number(booking.total_price))}</span>
            </div>
            {booking.notes && (
              <div className="ticket-detail">
                <span className="ticket-detail__label">Notas</span>
                <span className="ticket-detail__value ticket-detail__notes">{booking.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ticket-card__actions">
            <CheckInButton bookingId={id} isCheckedIn={!!booking.checked_in_at} />
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a
              href={whatsappShareUrl(shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Compartir por WhatsApp
            </a>
          </div>
        </div>

        {org?.slug && (
          <p className="ticket-footer">
            ¿Querés reservar otro turno?{' '}
            <Link href={`/book/${org.slug}`} className="ticket-footer__link">
              Reservar de nuevo →
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
