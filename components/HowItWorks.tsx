const steps = [
  { n: '01', title: 'Activas tu negocio', desc: 'Creas tu cuenta, cargas tus canchas, horarios y precios. Tu página de reservas queda lista en minutos.' },
  { n: '02', title: 'Tus clientes reservan solos', desc: 'Disponibilidad en tiempo real, pago online y división automática entre jugadores. Sin llamadas, sin WhatsApp.' },
  { n: '03', title: 'Tú administras desde un panel', desc: 'Ingresos, ocupación, clientes frecuentes y reportes. Tu negocio visible y bajo control en todo momento.' },
]

export default function HowItWorks() {
  return (
    <section className="section-block" style={{ position: 'relative', zIndex: 2 }}>
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow"><span className="dot" /> Cómo funciona</span>
          <h2>De pagos por WhatsApp a un sistema que cobra solo.</h2>
          <p>Tres pasos para que tu negocio empiece a operar con Goru, sin instalar nada.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', position: 'relative' }} className="steps-grid">
          <div style={{
            position: 'absolute', top: 26, left: '16.67%', right: '16.67%',
            height: 1, background: 'var(--line)', zIndex: 0,
          }} className="steps-connector" />

          {steps.map((step, i) => (
            <div key={step.n} className="rv" data-d={i > 0 ? String(i) : undefined} style={{
              position: 'relative', zIndex: 1,
              paddingRight: i < 2 ? 36 : 0,
              paddingLeft: i > 0 ? 36 : 0,
              borderRight: i < 2 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: i === 0 ? 'var(--brand)' : 'var(--surface)',
                border: i === 0 ? 'none' : '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500,
                color: i === 0 ? '#efe9dc' : 'var(--muted-text)',
                marginBottom: 24,
                boxShadow: i === 0 ? 'var(--sh-brand)' : 'var(--sh-sm)',
              }}>{step.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 10, color: 'var(--ink)' }}>{step.title}</h3>
              <p style={{ color: 'var(--muted-text)', fontSize: 14.5, lineHeight: 1.65, letterSpacing: '-0.005em', fontWeight: 400 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .steps-grid { grid-template-columns:1fr !important; gap:36px !important; }
          .steps-grid > div { padding:0 !important; border-right:none !important; padding-bottom:36px !important; border-bottom:1px solid var(--line) !important; }
          .steps-grid > div:last-child { border-bottom:none !important; padding-bottom:0 !important; }
          .steps-connector { display:none !important; }
        }
      `}</style>
    </section>
  )
}
