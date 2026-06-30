'use client'

import { useEffect, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRightIcon, LinkSquare02Icon } from '@hugeicons/core-free-icons'

interface Props { onOpen: () => void }

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const TIMES = ['18:00', '19:00', '20:00', '21:00']

// true = occupied, false = free
const SLOTS = [
  [true,  false, true,  false, true,  true,  false],
  [true,  true,  false, true,  true,  true,  true ],
  [false, true,  true,  true,  false, true,  true ],
  [false, false, true,  false, true,  true,  true ],
]

export default function Hero({ onOpen }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rvObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target) } })
    }, { threshold: 0.15 })
    document.querySelectorAll('.rv').forEach(el => rvObs.observe(el))
    return () => rvObs.disconnect()
  }, [])

  return (
    <header style={{ position: 'relative', paddingTop: 148 }}>
      <div className="wrap">
        <div style={{
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr',
          gap: 52, alignItems: 'center',
          minHeight: 'calc(100vh - 148px)', paddingBottom: 72,
        }} className="hero-grid">

          {/* Left: copy */}
          <div>
            <div className="rv" style={{ marginBottom: 26 }}>
              <span className="pill"><span className="pill-dot" />Software para negocios de canchas</span>
            </div>

            <h1 className="rv" data-d="1" style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px,6vw,84px)',
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              color: 'var(--ink)',
              margin: '0 0 26px',
            }}>
              El sistema<br />
              que <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>cobra solo.</em>
            </h1>

            <p className="rv" data-d="2" style={{
              fontSize: 'clamp(16px,1.5vw,18.5px)',
              color: 'var(--muted)',
              maxWidth: '48ch', lineHeight: 1.65,
              letterSpacing: '-0.01em', fontWeight: 400, marginBottom: 36,
            }}>
              Reservas online, cobro automático y administración completa para tu negocio de canchas. Lo activas en minutos, sin WhatsApp, sin efectivo, sin contratos.
            </p>

            <div className="rv" data-d="3" style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              alignItems: 'center', marginBottom: 28,
            }}>
              <button className="btn btn-dark" onClick={onOpen}>
                Activar mi negocio
                <HugeiconsIcon icon={ArrowRightIcon} size={16} strokeWidth={1.8} />
              </button>
              <a href="#producto" className="btn btn-ghost">Ver el panel</a>
            </div>

            <div className="rv" data-d="3" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['CB','LN','SS','ET','C9'].map((init, i) => (
                  <div key={init} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: i % 2 === 0 ? 'var(--brand)' : 'var(--surface)',
                    border: '2px solid var(--canvas)',
                    color: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 5 - i, position: 'relative',
                  }}>{init}</div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--faint)', fontWeight: 500, letterSpacing: '-0.005em' }}>
                47 negocios activos · Cancela cuando quieras
              </span>
            </div>
          </div>

          {/* Right: Calendar panel */}
          <div className="rv" data-d="2" id="producto" style={{ position: 'relative' }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: '10% 5%',
              background: 'radial-gradient(ellipse at center, rgba(168,41,20,.16), transparent 70%)',
              filter: 'blur(32px)', borderRadius: '50%',
              pointerEvents: 'none', zIndex: 0,
            }} />

            {/* Main panel */}
            <div ref={stageRef} style={{
              position: 'relative', zIndex: 1,
              transform: 'perspective(1200px) rotateX(4deg) rotateY(-3deg)',
              transformOrigin: 'center center',
              transition: 'transform 0.8s var(--ease-spring)',
              borderRadius: 'var(--r-xl)',
              background: 'var(--surface)',
              boxShadow: '0 1px 0 rgba(255,255,255,.05) inset, 0 2px 4px rgba(0,0,0,.3), 0 32px 72px -16px rgba(0,0,0,.65), 0 0 0 1px rgba(239,233,220,.07)',
              overflow: 'hidden',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'perspective(1200px) rotateX(1deg) rotateY(-1deg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'perspective(1200px) rotateX(4deg) rotateY(-3deg)' }}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: '1px solid var(--line)',
                background: 'var(--night)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--brand)', color: '#efe9dc',
                    display: 'grid', placeItems: 'center',
                    fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0,
                  }}>CB</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.015em' }}>Campo Bello FC</div>
                    <div style={{ fontSize: 10.5, color: 'var(--faint)', fontFamily: 'var(--font-mono)' }}>30 jun – 6 jul</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: 'var(--muted)', background: 'var(--canvas-mid)',
                  border: '1px solid var(--line)', borderRadius: 'var(--r-full)',
                  padding: '4px 10px',
                }}>Cancha 1</span>
              </div>

              {/* Calendar grid */}
              <div style={{ padding: '16px 20px 20px', background: 'var(--canvas)' }}>
                {/* Day headers */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)',
                  gap: 4, marginBottom: 6,
                }}>
                  <div />
                  {DAYS.map(d => (
                    <div key={d} style={{
                      fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color: 'var(--faint)', textAlign: 'center', letterSpacing: '0.04em',
                    }}>{d}</div>
                  ))}
                </div>

                {/* Slots */}
                {SLOTS.map((row, ri) => (
                  <div key={ri} style={{
                    display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)',
                    gap: 4, marginBottom: 4,
                  }}>
                    <div style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--faint)',
                      display: 'flex', alignItems: 'center',
                    }}>{TIMES[ri]}</div>
                    {row.map((occupied, ci) => (
                      <div key={ci} style={{
                        height: 28, borderRadius: 6,
                        background: occupied ? 'var(--brand)' : 'var(--canvas-mid)',
                        opacity: occupied ? 0.88 : 1,
                        border: occupied ? 'none' : '1px solid var(--line)',
                        transition: 'opacity 0.2s',
                      }} />
                    ))}
                  </div>
                ))}

                {/* Legend + occupancy */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 12, marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {[
                      { color: 'var(--brand)', label: 'Ocupado' },
                      { color: 'var(--canvas-mid)', border: true, label: 'Libre' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: 3,
                          background: item.color, flexShrink: 0,
                          border: item.border ? '1px solid var(--line)' : 'none',
                        }} />
                        <span style={{ fontSize: 10.5, color: 'var(--faint)', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 600 }}>
                    75% ocupado
                  </span>
                </div>

                {/* CTA */}
                <button style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 16px', borderRadius: 'var(--r-full)',
                  background: 'var(--brand)', color: '#efe9dc',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 16px -4px rgba(168,41,20,.5)',
                }}>
                  <HugeiconsIcon icon={LinkSquare02Icon} size={14} strokeWidth={2} />
                  Compartir link de reservas
                </button>
              </div>
            </div>

            {/* Floating toast */}
            <div style={{
              position: 'absolute', top: -14, right: -14, zIndex: 2,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: '10px 14px',
              boxShadow: 'var(--sh-float)',
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'toast-in 0.6s 0.8s var(--ease-spring) both',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#6dd98a', flexShrink: 0,
                boxShadow: '0 0 6px rgba(109,217,138,.6)',
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                  Nueva reserva · hace 2 min
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--faint)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                  Andrés P. · Sáb 21:00 · $45.000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity:0; transform:translateY(8px) scale(0.96); }
          to   { opacity:1; transform:none; }
        }
        @media (max-width: 960px) { .hero-grid { grid-template-columns:1fr !important; min-height:auto !important; padding-bottom:56px !important; } }
        @media (max-width: 680px) { .hero-grid { gap:32px !important; } }
      `}</style>
    </header>
  )
}
