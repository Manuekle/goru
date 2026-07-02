import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRightIcon } from '@hugeicons/core-free-icons'

interface Props { onOpen: () => void }

export default function FinalCTA({ onOpen }: Props) {
  return (
    <section className="section-block" id="contacto" style={{ position:'relative', zIndex:2 }}>
      <div className="wrap">
        <div className="rv" style={{
          position:'relative', borderRadius:'var(--r-2xl)',
          padding:'72px 48px', textAlign:'center', overflow:'hidden',
          background:'var(--night)',
          border:'1px solid var(--line)',
        }}>
          <div style={{
            position:'absolute', width:'55%', height:'220%', left:'-12%', top:'-60%',
            background:'radial-gradient(circle,rgba(168,41,20,.38),transparent 65%)',
            filter:'blur(28px)', pointerEvents:'none',
          }} />
          <div style={{
            position:'absolute', width:'40%', height:'180%', right:'-8%', top:'-40%',
            background:'radial-gradient(circle,rgba(168,41,20,.14),transparent 65%)',
            filter:'blur(22px)', pointerEvents:'none',
          }} />

          <div style={{ position:'relative' }}>
            <h2 style={{
              fontFamily:'var(--font-display)', fontSize:'clamp(30px,4vw,48px)',
              fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.05,
              color:'var(--ink)', marginBottom:18,
            }}>
              Tu negocio merece operar sin fricción.
            </h2>
            <p style={{
              color:'var(--muted-text)', fontSize:17, margin:'0 auto 36px',
              maxWidth:'48ch', letterSpacing:'-0.005em', fontWeight:400, lineHeight:1.65,
            }}>
              Activa Goru hoy, prueba 14 días gratis y decide después si quieres continuar. Sin tarjeta, sin permanencia.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn btn-dark" onClick={onOpen}>
                Activar mi negocio
                <HugeiconsIcon icon={ArrowRightIcon} size={16} strokeWidth={1.8} />
              </button>
              <a href="#contacto" className="btn btn-on-dark">Hablar con ventas</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:600px){#contacto .rv{padding:52px 28px !important;}}`}</style>
    </section>
  )
}
