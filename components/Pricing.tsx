'use client'

import { useEffect, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircleIcon } from '@hugeicons/core-free-icons'

interface Props { onOpen: () => void }

function setDigits(el: HTMLElement | null, str: string) {
  if (!el) return
  el.classList.remove('animating')
  el.innerHTML = ''
  str.split('').forEach((c, i, arr) => {
    const span = document.createElement('span')
    span.className = 'digit'; span.textContent = c
    if (i === arr.length - 2) span.dataset.s = '1'
    else if (i === arr.length - 1) span.dataset.s = '2'
    el.appendChild(span)
  })
  void el.offsetHeight
  el.classList.add('animating')
}

const features = [
  'Reservas y calendario en tiempo real',
  'Cobro online y división de pagos por jugador',
  'Panel administrativo y reportes de ingresos',
  'Torneos, escuela deportiva y eventos',
  'Pausa o cancela cuando quieras, sin permanencia',
]

export default function Pricing({ onOpen }: Props) {
  const priceRef = useRef<HTMLSpanElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setTimeout(() => setDigits(priceRef.current,'180.000'), 200); obs.disconnect() }
    }, { threshold: 0.4 })
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="section-block" id="precio" style={{ position:'relative', zIndex:2 }}>
      <div className="wrap">
        <div className="sec-head rv" style={{ textAlign:'center', maxWidth:'100%', margin:'0 auto 52px' }}>
          <span className="eyebrow"><span className="dot" /> Precio</span>
          <h2 style={{ margin:'14px auto 0' }}>Un solo plan. Todo incluido.</h2>
          <p style={{ margin:'16px auto 0', textAlign:'center' }}>
            Sin tiers confusos ni letra pequeña. Cada negocio paga lo mismo.
          </p>
        </div>

        <div style={{ display:'flex', justifyContent:'center' }}>
          <div ref={wrapRef} className="rv" data-d="1" style={{
            maxWidth:480, width:'100%',
            background:'var(--surface)', borderRadius:'var(--r-2xl)',
            padding:'44px 44px 40px',
            boxShadow:'var(--sh-float)', border:'1px solid var(--line)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', width:'75%', height:180, right:'-20%', top:-70,
              background:'radial-gradient(circle,rgba(168,41,20,.22),transparent 70%)',
              filter:'blur(10px)', pointerEvents:'none',
            }} />
            <span style={{ fontSize:12, fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--brand)', letterSpacing:'0.06em', textTransform:'uppercase', position:'relative' }}>Plan Goru</span>
            <div style={{ display:'flex', alignItems:'baseline', gap:5, margin:'18px 0 6px', position:'relative' }}>
              <span style={{ fontSize:20, fontWeight:700, color:'var(--muted)', alignSelf:'flex-start', marginTop:10 }}>$</span>
              <b style={{ fontFamily:'var(--font-display)', fontSize:60, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1, color:'var(--ink)' }}>
                <span className="digit-group" ref={priceRef} />
              </b>
              <span style={{ fontSize:15, color:'var(--faint)', fontFamily:'var(--font-mono)' }}>/ mes por negocio</span>
            </div>
            <p style={{ color:'var(--muted)', fontSize:14.5, marginBottom:28, fontWeight:400, position:'relative' }}>
              Reservas ilimitadas, cobro online y panel administrativo completo.
            </p>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:13, marginBottom:30, position:'relative' }}>
              {features.map(f => (
                <li key={f} style={{ display:'flex', gap:11, alignItems:'flex-start', fontSize:14.5, fontWeight:500, color:'var(--ink)' }}>
                  <span style={{ color:'var(--brand)', display:'flex', flexShrink:0, marginTop:1 }}>
                    <HugeiconsIcon icon={CheckmarkCircleIcon} size={20} strokeWidth={1.8} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-brand" style={{ width:'100%', position:'relative' }} onClick={onOpen}>
              Activar mi negocio
            </button>
            <p style={{ textAlign:'center', fontSize:12.5, color:'var(--faint)', fontFamily:'var(--font-mono)', marginTop:14, position:'relative' }}>
              Prueba de 14 días gratis · sin tarjeta requerida
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
