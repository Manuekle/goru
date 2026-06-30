import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 40 }
  const s = sizes[size]

  return (
    <svg
      className={cn('spinner', className)}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="60"
        strokeDashoffset="15"
        strokeLinecap="round"
      />
    </svg>
  )
}
