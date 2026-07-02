'use client'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/shadcn-select'

interface FormSelectProps {
  label?: string
  name: string
  options: { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

export function FormSelect({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  error,
  disabled,
  className,
}: FormSelectProps) {
  const inputId = name

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <Select name={name} items={options} value={value} defaultValue={defaultValue} onValueChange={onValueChange} required={required} disabled={disabled}>
        <SelectTrigger id={inputId} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
