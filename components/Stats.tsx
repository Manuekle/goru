const cells = [
  { value:'14 días', desc:'de prueba gratuita, sin tarjeta de crédito.' },
  { value:'0',       desc:'permanencia. Cancela o pausa en cualquier momento.' },
  { value:'1 panel', desc:'para administrar todas tus canchas y reportes.' },
  { value:'24/7',    desc:'tus clientes reservan solos, a cualquier hora.' },
]

export default function Stats() {
  return (
    <section className="section-block" style={{
      position:'relative', zIndex:2,
      background:'var(--night)',
      borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)',
    }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 }} className="stats-grid">
          {cells.map((cell, i) => (
            <div key={cell.value} className="rv" data-d={i>0?String(i):undefined} style={{
              padding:'32px 28px',
              borderRight: i < cells.length-1 ? '1px solid var(--line)' : 'none',
            }}>
              <b style={{
                fontFamily:'var(--font-display)', fontSize:34, fontWeight:800,
                letterSpacing:'-0.03em', color:'var(--brand)', display:'block', marginBottom:10,
              }}>{cell.value}</b>
              <p style={{ color:'var(--muted)', fontSize:14, fontWeight:400, letterSpacing:'-0.005em', lineHeight:1.55 }}>{cell.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:860px){
          .stats-grid{grid-template-columns:1fr 1fr !important;}
          .stats-grid>div{border-right:none !important;border-bottom:1px solid var(--line);padding:28px 20px !important;}
          .stats-grid>div:nth-child(odd){border-right:1px solid var(--line) !important;}
          .stats-grid>div:nth-last-child(-n+2){border-bottom:none;}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr !important;}
          .stats-grid>div{border-right:none !important;}
          .stats-grid>div:nth-last-child(-n+2){border-bottom:1px solid var(--line) !important;}
          .stats-grid>div:last-child{border-bottom:none !important;}
        }
      `}</style>
    </section>
  )
}
