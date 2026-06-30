export default function Testimonial() {
  return (
    <section className="section-block" style={{ position:'relative', zIndex:2 }}>
      <div className="wrap">
        <div className="rv" style={{ maxWidth:780, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:120, fontWeight:800,
            color:'var(--brand)', opacity:0.15, lineHeight:1,
            marginBottom:-36, userSelect:'none', letterSpacing:'-0.05em',
          }} aria-hidden="true">&ldquo;</div>

          <blockquote style={{
            fontFamily:'var(--font-display)',
            fontSize:'clamp(20px,2.4vw,30px)',
            fontWeight:600, lineHeight:1.36,
            letterSpacing:'-0.025em', color:'var(--ink)', position:'relative',
          }}>
            Antes pasábamos las tardes contestando WhatsApp para confirmar pagos. Con Goru, el dinero entra solo y yo solo reviso el panel una vez al día.
          </blockquote>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:28 }}>
            <div style={{
              width:44, height:44, borderRadius:'50%',
              background:'linear-gradient(135deg,var(--brand),#5a1009)',
              color:'#efe9dc', display:'grid', placeItems:'center',
              fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, flexShrink:0,
            }}>JR</div>
            <div style={{ textAlign:'left' }}>
              <b style={{ fontSize:14, fontWeight:700, display:'block', color:'var(--ink)' }}>Jorge Ramírez</b>
              <span style={{ fontSize:13, color:'var(--faint)', fontFamily:'var(--font-mono)' }}>Administrador, Campo Bello FC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
