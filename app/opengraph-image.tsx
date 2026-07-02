import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          fontFamily: 'Geist, sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
            background: '#00E676',
            borderRadius: '20%',
            fontSize: 100,
            fontWeight: 900,
            color: '#0a0a0a',
            marginBottom: 40,
          }}
        >
          G
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          Gestiona tu negocio de canchas
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: '#888',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          Reservas online · Cobro automático · Panel administrativo
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
