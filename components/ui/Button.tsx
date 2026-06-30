import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

type Variant = 'dark' | 'brand' | 'ghost' | 'on-dark' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'dark', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base = 'btn'
    const variants: Record<Variant, string> = {
      dark: 'btn-dark',
      brand: 'btn-brand',
      ghost: 'btn-ghost',
      'on-dark': 'btn-on-dark',
      danger: 'btn-danger',
    }
    const sizes: Record<Size, string> = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="btn-spinner" aria-hidden /> : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
