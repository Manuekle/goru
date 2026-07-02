import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: IconSvgElement
}

export function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <p className="stat-card__label">
          {!icon && <span className="pill-dot" />}
          {label}
        </p>
        {icon && (
          <span className="stat-card__icon">
            <HugeiconsIcon icon={icon} size={16} />
          </span>
        )}
      </div>
      <p className="stat-card__value">{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  )
}
