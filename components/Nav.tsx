'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'
import { HugeiconsIcon } from '@hugeicons/react'
import { CancelIcon, MenuIcon } from '@hugeicons/core-free-icons'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { href: '#producto', label: 'Producto' },
    { href: '#multi', label: 'Multi-cancha' },
    { href: '#precio', label: 'Precio' },
    { href: '#contacto', label: 'Hablar con ventas' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.4s, box-shadow 0.4s',
        background: scrolled ? 'rgba(19,20,26,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(239,233,220,0.07)' : 'none',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '0 24px',
          height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="#" style={{
            display: 'flex', alignItems: 'center', gap: 9,
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 20, letterSpacing: '-0.03em', color: 'var(--ink)',
          }}>
            <Logo size={28} />
            goru
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-desktop">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                fontSize: 14, fontWeight: 500, color: 'var(--muted-text)',
                letterSpacing: '-0.01em', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-text)')}
              >{l.label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/auth/login" className="btn btn-ghost btn-sm" id="nav-login">
              Iniciar sesión
            </a>
            <a href="#precio" className="btn btn-dark btn-sm">Activar Goru</a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú" aria-expanded={menuOpen}
              className="menu-btn-mobile"
              style={{
                display: 'none',
                background: 'rgba(239,233,220,.07)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-full)',
                width: 44, height: 44,
                cursor: 'pointer', color: 'var(--ink)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {menuOpen
                ? <HugeiconsIcon icon={CancelIcon} size={18} strokeWidth={1.8} />
                : <HugeiconsIcon icon={MenuIcon} size={18} strokeWidth={1.8} />
              }
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: 76, left: 16, right: 16, zIndex: 49,
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl)', padding: 12,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: 'var(--sh-float)', border: '1px solid var(--line)',
        }}>
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{
                padding: '13px 18px', borderRadius: 'var(--r-full)',
                fontWeight: 600, color: 'var(--muted-text)', transition: '0.2s', display: 'block',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-mid)'; e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-text)' }}
            >{l.label}</a>
          ))}
          <a href="#precio" onClick={() => setMenuOpen(false)} className="btn btn-dark" style={{ marginTop: 8 }}>
            Activar Goru
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-links-desktop { display:none !important; }
          .menu-btn-mobile { display:flex !important; }
          #nav-login { display:none !important; }
        }
      `}</style>
    </>
  )
}
