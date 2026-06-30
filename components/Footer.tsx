import Logo from './Logo'

export default function Footer() {
  return (
    <footer style={{
      position:'relative', zIndex:2,
      borderTop:'1px solid var(--line)',
      padding:'60px 0 44px',
      background:'var(--night)',
    }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', gap:40 }} className="foot-grid">
          <div>
            <a href="#" style={{
              display:'flex', alignItems:'center', gap:8,
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:19,
              letterSpacing:'-0.03em', color:'var(--ink)', marginBottom:14,
            }}>
              <Logo size={24} />
              goru
            </a>
            <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.65, maxWidth:'30ch', fontWeight:400 }}>
              El software para negocios de canchas. Reservas, cobro y administración en un solo panel.
            </p>
          </div>

          {[
            { title:'Producto', links:['Panel admin:#producto','Multi-negocio:#multi','Precio:#precio'] },
            { title:'Compañía', links:['Ventas:#contacto','Soporte:#','Términos:#'] },
            { title:'Contacto', links:['hola@goru.app:mailto:hola@goru.app','Hablar con ventas:#contacto'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize:11, fontFamily:'var(--font-mono)', fontWeight:500, color:'var(--faint)', marginBottom:18, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {col.title}
              </h4>
              {col.links.map(item => {
                const [label, href] = item.split(':')
                const isEmail = href.startsWith('mailto')
                return (
                  <a key={label} href={isEmail ? `mailto:${href.slice(7)}` : href} style={{
                    display:'block', color:'var(--muted)', fontSize:14, marginBottom:10,
                    fontWeight:500, letterSpacing:'-0.01em', transition:'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                  >{label}</a>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop:48, paddingTop:24, borderTop:'1px solid var(--line)',
          color:'var(--faint)', fontSize:12, fontFamily:'var(--font-mono)',
          flexWrap:'wrap', gap:12,
        }}>
          <span>© 2026 Goru · software para negocios de canchas</span>
          <span>Hecho para que tu cancha rinda sola</span>
        </div>
      </div>

      <style>{`
        @media(max-width:860px){.foot-grid{grid-template-columns:1fr 1fr !important;gap:32px !important;}}
        @media(max-width:480px){.foot-grid{grid-template-columns:1fr !important;}}
      `}</style>
    </footer>
  )
}
