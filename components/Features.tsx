import { HugeiconsIcon } from '@hugeicons/react'
import { WalletIcon, CalendarIcon, BarChartIcon, AwardIcon } from '@hugeicons/core-free-icons'

export default function Features() {
  return (
    <section className="section-block" style={{
      position: 'relative', zIndex: 2,
      background: 'var(--night)',
      borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
    }}>
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow"><span className="dot" /> Lo que incluye</span>
          <h2>Todo lo que necesita un negocio de canchas.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gridTemplateRows: 'auto auto', gap: 16 }} className="bento-grid">

          {/* Big dark card */}
          <div className="rv" style={{
            background: 'var(--canvas-mid)', borderRadius: 'var(--r-xl)',
            padding: '40px 40px 36px', position: 'relative', overflow: 'hidden',
            border: '1px solid var(--line)', gridRow: '1 / 2',
          }}>
            <div style={{
              position: 'absolute', width: '65%', height: '200%', right: '-15%', top: '-50%',
              background: 'radial-gradient(circle,rgba(168,41,20,.28),transparent 65%)',
              filter: 'blur(12px)', pointerEvents: 'none',
            }} />
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--brand-soft)', display: 'grid', placeItems: 'center',
              marginBottom: 22, position: 'relative',
            }}>
              <HugeiconsIcon icon={WalletIcon} size={22} color="var(--brand)" strokeWidth={1.6} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
              letterSpacing: '-0.03em', maxWidth: '18ch', position: 'relative',
              lineHeight: 1.16, marginBottom: 12, color: 'var(--ink)',
            }}>Cobro online y división automática de pagos</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, maxWidth: '40ch', lineHeight: 1.65, position: 'relative', fontWeight: 400, marginBottom: 32 }}>
              Cada jugador paga su parte con un enlace individual. Tu negocio recibe el dinero confirmado, sin efectivo perdido ni reservas a medias.
            </p>
            <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
              <div>
                <b style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, display: 'block', letterSpacing: '-0.03em', color: 'var(--ink)' }}>0%</b>
                <span style={{ fontSize: 12, color: 'var(--faint)', fontFamily: 'var(--font-mono)' }}>cobros perdidos</span>
              </div>
              <div>
                <b style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, display: 'block', letterSpacing: '-0.03em', color: 'var(--ink)' }}>&lt;2 min</b>
                <span style={{ fontSize: 12, color: 'var(--faint)', fontFamily: 'var(--font-mono)' }}>para reservar</span>
              </div>
            </div>
          </div>

          {/* Sm: Calendario */}
          <SmCard d="1" gridRow="1 / 2" icon={<HugeiconsIcon icon={CalendarIcon} size={20} strokeWidth={1.6} />} title="Calendario en tiempo real" desc="Disponibilidad sincronizada al instante en todas tus canchas. Sin choques de horario, sin errores." />

          {/* Sm: Reportes */}
          <SmCard d="2" gridRow="2 / 3" icon={<HugeiconsIcon icon={BarChartIcon} size={20} strokeWidth={1.6} />} title="Reportes de ingresos" desc="Ocupación, horas pico y clientes frecuentes, exportables cuando los necesites." />

          {/* Big accent card: Torneos */}
          <div className="rv" data-d="2" style={{
            background: 'var(--brand-soft)', borderRadius: 'var(--r-xl)',
            padding: '40px 40px 36px', border: '1px solid rgba(168,41,20,.22)',
            gridRow: '2 / 3', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: '60%', height: '180%', right: '-10%', top: '-40%',
              background: 'radial-gradient(circle,rgba(168,41,20,.22),transparent 65%)',
              filter: 'blur(10px)', pointerEvents: 'none',
            }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand)', display: 'grid', placeItems: 'center', marginBottom: 18, position: 'relative' }}>
              <HugeiconsIcon icon={AwardIcon} size={20} color="#efe9dc" strokeWidth={1.6} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
              letterSpacing: '-0.03em', lineHeight: 1.16, marginBottom: 12,
              color: 'var(--ink)', position: 'relative',
            }}>Torneos, escuela deportiva y eventos</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.65, position: 'relative', fontWeight: 400, maxWidth: '38ch' }}>
              Gestiona inscripciones, fixture y cobros de tus torneos sin salir del panel.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns:1fr !important; grid-template-rows:auto !important; }
          .bento-grid > div { grid-row:auto !important; }
        }
      `}</style>
    </section>
  )
}

function SmCard({ icon, title, desc, d, gridRow }: {
  icon: React.ReactNode; title: string; desc: string; d: string; gridRow: string
}) {
  return (
    <div className="rv" data-d={d} style={{
      background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 30,
      border: '1px solid var(--line)', gridRow,
      transition: 'transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base)',
      cursor: 'default',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--sh-float)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 9, color: 'var(--ink)' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, letterSpacing: '-0.005em', fontWeight: 400 }}>{desc}</p>
    </div>
  )
}
