import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: IconSvgElement
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <span className="empty-state__icon">
          <HugeiconsIcon icon={icon} size={20} />
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
