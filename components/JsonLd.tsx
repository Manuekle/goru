export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Goru',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Plataforma para negocios de canchas sintéticas. Reservas online, cobro automático y panel administrativo.',
    url: 'https://goru.app',
    offers: {
      '@type': 'Offer',
      price: '180000',
      priceCurrency: 'COP',
      description: 'Plan mensual por negocio. Prueba 14 días gratis.',
    },
    author: { '@type': 'Organization', name: 'Goru' },
    inLanguage: 'es-CO',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
