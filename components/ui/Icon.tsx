'use client'
import * as LucideIcons from 'lucide-react'

export function Icon({
  name,
  size = 16,
  className = '',
  strokeWidth = 1.75,
  style,
}: {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  const LucideIcon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>>)[name]
  if (!LucideIcon) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    )
  }
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} style={style} />
}
