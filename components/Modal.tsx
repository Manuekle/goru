'use client'

import { useEffect, useRef, useState } from 'react'

interface Props { open: boolean; onClose: () => void }

export default function Modal({ open, onClose }: Props) {
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setTimeout(() => inputRef.current?.focus(), 80) }
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) return
    setSubmitted(true)
    setTimeout(() => { onClose(); setTimeout(() => { setSubmitted(false); setName(''); setPhone('') }, 400) }, 1600)
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'none', border:'none',
    padding:'13px 20px', fontFamily:'inherit', fontSize:15, fontWeight:500,
    color:'var(--ink)', outline:'none', borderRadius:'var(--r-full)',
  }

  return (
    <div onClick={e => { if (e.target===e.currentTarget) onClose() }} aria-hidden={!open} style={{
      position:'fixed', inset:0, zIndex:60,
      background:'rgba(12,13,18,.72)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
      display:'grid', placeItems:'center', padding:20,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition:'opacity 0.24s ease',
    }}>
      <div role="dialog" aria-modal="true" aria-label="Activar negocio en Goru" style={{
        width:'100%', maxWidth:420,
        background:'var(--surface)', borderRadius:'var(--r-2xl)',
        padding:'32px 32px 28px',
        boxShadow:'var(--sh-float)',
        border:'1px solid var(--line)',
        transform: open ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
        opacity: open ? 1 : 0,
        transition:'transform 0.28s var(--ease-spring),opacity 0.28s var(--ease-spring)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', width:'70%', height:160, right:'-20%', top:-60,
          background:'radial-gradient(circle,rgba(168,41,20,.20),transparent 70%)',
          filter:'blur(10px)', pointerEvents:'none',
        }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4, position:'relative' }}>
          <span style={{ fontSize:11, color:'var(--faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
            Activar tu negocio
          </span>
          <button onClick={onClose} aria-label="Cerrar" style={{
            background:'var(--canvas-mid)', border:'none', width:34, height:34,
            borderRadius:'50%', cursor:'pointer', color:'var(--muted)',
            display:'grid', placeItems:'center', transition:'background var(--dur-fast)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--canvas)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--canvas-mid)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <h3 style={{
          fontFamily:'var(--font-display)', fontSize:26, fontWeight:700,
          letterSpacing:'-0.03em', margin:'14px 0 7px', color:'var(--ink)', position:'relative',
        }}>
          {submitted ? '¡Listo, te contactamos hoy!' : '14 días gratis, sin tarjeta.'}
        </h3>
        <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24, fontWeight:400, position:'relative' }}>
          {submitted
            ? 'Un especialista de Goru te escribirá en las próximas horas para activar tu panel.'
            : 'Cuéntanos sobre tu negocio y activamos tu panel hoy mismo.'}
        </p>

        {!submitted && (
          <>
            {[
              { label:'Nombre del negocio', type:'text', ph:'Ej. Campo Bello FC', val:name, set:setName, ref:inputRef },
              { label:'WhatsApp de contacto', type:'tel', ph:'321 000 0000', val:phone, set:setPhone, ref:undefined },
            ].map(field => (
              <div key={field.label} style={{ marginBottom:14, position:'relative' }}>
                <label style={{ fontSize:12, color:'var(--muted)', fontFamily:'var(--font-mono)', display:'block', marginBottom:7 }}>
                  {field.label}
                </label>
                <div style={{ border:'1.5px solid var(--line)', borderRadius:'var(--r-full)', background:'var(--canvas-mid)' }}>
                  <input
                    ref={field.ref as React.RefObject<HTMLInputElement>}
                    type={field.type} placeholder={field.ph}
                    value={field.val}
                    onChange={e => field.set(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSubmit()}
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginBottom:22 }} />
            <button className="btn btn-brand" style={{ width:'100%', position:'relative' }} onClick={handleSubmit}>
              Crear mi panel
            </button>
          </>
        )}

        {submitted && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 0 8px', position:'relative' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(42,138,62,.2)', display:'grid', placeItems:'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="m5 12 5 5 9-11" stroke="#6dd98a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
