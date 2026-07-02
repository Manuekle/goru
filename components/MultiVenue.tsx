'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { GlobeIcon, PlusSignIcon, CheckmarkCircleIcon } from '@hugeicons/core-free-icons'

const VENUES = [
  { id:'cb', init:'CB', name:'Campo Bello FC',   sub:'próximo cobro 5 jul',     color:'var(--brand)',   on:true  },
  { id:'ln', init:'LN', name:'La Norte Sport',   sub:'próximo cobro 12 jul',    color:'var(--muted-text)',   on:true  },
  { id:'ss', init:'SS', name:'Sintética del Sur', sub:'próximo cobro 18 jul',   color:'var(--faint)',   on:true  },
  { id:'et', init:'ET', name:'El Techo Fútbol',  sub:'En pausa desde el 2 jun', color:'var(--canvas-mid)', on:false },
]

export default function MultiVenue() {
  const [states, setStates] = useState<Record<string,boolean>>(
    Object.fromEntries(VENUES.map(v => [v.id, v.on]))
  )
  const toggle = (id: string) => setStates(s => ({ ...s, [id]: !s[id] }))
  const activeCount = Object.values(states).filter(Boolean).length

  return (
    <section className="section-block" id="multi" style={{ position:'relative', zIndex:2 }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }} className="control-grid">

          <div>
            <span className="eyebrow rv"><span className="dot" /> Pensado para negocios</span>
            <h2 className="rv disp" data-d="1" style={{ fontSize:'clamp(28px,3.4vw,42px)', letterSpacing:'-0.03em', lineHeight:1.08, margin:'16px 0 0', color:'var(--ink)' }}>
              Cada cancha, su propio negocio. Tú decides cuándo está activa.
            </h2>
            <p className="rv" data-d="1" style={{ color:'var(--muted-text)', fontSize:17, marginTop:16, letterSpacing:'-0.01em', maxWidth:'46ch', fontWeight:400, lineHeight:1.65 }}>
              Goru funciona por suscripción mensual, negocio por negocio. Activas, pausas o cancelas cuando quieras — sin perder tu historial ni tus datos.
            </p>

            <ul style={{ listStyle:'none', marginTop:28, display:'flex', flexDirection:'column', gap:18 }}>
              {[
                { icon:<HugeiconsIcon icon={GlobeIcon} size={16} strokeWidth={1.5} />, title:'Suscripción independiente por cancha', desc:'Cada negocio paga su propio plan; nada se mezcla entre operaciones.', d:'2' },
                { icon:<HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={1.6} />,  title:'Pausa o cancela en un clic',            desc:'Sin contratos ni penalidades. Tu cuenta queda lista para reactivar cuando lo necesites.', d:'2' },
                { icon:<HugeiconsIcon icon={CheckmarkCircleIcon} size={16} strokeWidth={1.6} />, title:'Tus datos siempre te pertenecen',        desc:'Histórico de reservas, pagos y clientes disponible incluso en pausa.', d:'3' },
              ].map(item => (
                <li key={item.title} className="rv" data-d={item.d} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <span style={{
                    width:36, height:36, borderRadius:'50%', flexShrink:0,
                    display:'grid', placeItems:'center',
                    background:'var(--surface)', boxShadow:'var(--sh-card)', color:'var(--brand)',
                  }}>{item.icon}</span>
                  <div>
                    <b style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.015em', color:'var(--ink)' }}>{item.title}</b>
                    <p style={{ color:'var(--muted-text)', fontSize:13.5, marginTop:4, letterSpacing:'-0.005em', fontWeight:400 }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rv" data-d="2">
            <div style={{ background:'var(--surface)', borderRadius:'var(--r-xl)', padding:24, boxShadow:'var(--sh-float)', border:'1px solid var(--line)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <b style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>Tus negocios</b>
                <span style={{ fontSize:12, color:'var(--faint)', fontFamily:'var(--font-mono)' }}>
                  {activeCount} activo{activeCount!==1?'s':''} · {VENUES.length-activeCount} en pausa
                </span>
              </div>
              {VENUES.map(v => {
                const isOn = states[v.id]
                return (
                  <div key={v.id} style={{
                    display:'flex', alignItems:'center', gap:13,
                    padding:'13px 0', borderTop:'1px solid var(--line-soft)',
                    transition:'opacity var(--dur-base)', opacity: isOn ? 1 : 0.5,
                  }}>
                    <div style={{
                      width:42, height:42, borderRadius:'50%',
                      background: v.color, display:'grid', placeItems:'center',
                      fontFamily:'var(--font-mono)', fontWeight:600, fontSize:13,
                      color:'var(--ink)', flexShrink:0,
                      filter: isOn ? 'none' : 'saturate(0.15)',
                      transition:'filter var(--dur-base)',
                    }}>{v.init}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <b style={{
                        fontSize:14, fontWeight:700, letterSpacing:'-0.015em', display:'block',
                        color: isOn ? 'var(--ink)' : 'var(--faint)',
                        transition:'color var(--dur-base)',
                      }}>{v.name}</b>
                      <span style={{ fontSize:11.5, color:'var(--faint)', fontFamily:'var(--font-mono)', display:'block', marginTop:2 }}>
                        {isOn ? `Plan activo · ${v.sub}` : `En pausa · ${v.sub}`}
                      </span>
                    </div>
                    <button onClick={() => toggle(v.id)} className={`toggle${isOn?' on':''}`} aria-label={`${isOn?'Pausar':'Activar'} ${v.name}`} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:860px){.control-grid{grid-template-columns:1fr !important;gap:40px !important;}}`}</style>
    </section>
  )
}

