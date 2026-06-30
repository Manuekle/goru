const names = ['Campo Bello FC','La Norte Sport','Sintética del Sur','El Techo Fútbol','Cancha 9','Fútbol Park','Arena Central','Club Las Palmas']

export default function Trust() {
  const doubled = [...names, ...names]
  return (
    <section style={{
      position: 'relative', zIndex: 2,
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
      padding: '36px 0',
      background: 'var(--night)',
    }}>
      <div className="wrap" style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
          color: 'var(--faint)', letterSpacing: '0.08em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          Negocios que ya gestionan sus canchas con Goru
        </p>
      </div>

      <div className="marquee-track">
        <div className="marquee-inner">
          {doubled.map((name, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '0 40px',
              borderRight: '1px solid var(--line)',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 16, color: 'var(--ink)',
                letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                opacity: 0.35,
              }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
