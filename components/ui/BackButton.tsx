import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  onClick?: () => void
  label?: string
  className?: string
}

export function BackButton({ href, onClick, label, className }: BackButtonProps) {
  const content = (
    <>
      <ArrowLeft size={15} strokeWidth={2.25} />
      {label && <span>{label}</span>}
    </>
  )

  const classes = `back-btn${className ? ` ${className}` : ''}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
