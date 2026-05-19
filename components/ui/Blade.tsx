'use client'
import { useEffect } from 'react'
import { Icon } from './Icon'

export function Blade({
  open,
  onClose,
  title,
  eyebrow,
  width = 520,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  width?: number
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
      <div
        onClick={onClose}
        className="anim-fade"
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.36)', backdropFilter: 'blur(2px)' }}
      />
      <aside
        className="anim-slide-in-right"
        style={{
          position: 'absolute', top: 0, right: 0, height: '100%',
          width: `min(${width}px, 92vw)`,
          background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)',
          boxShadow: '-12px 0 40px -12px rgba(20,15,10,0.18)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {eyebrow && <div className="caption" style={{ fontSize: 10.5, marginBottom: 6 }}>{eyebrow}</div>}
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ height: 30, width: 30, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close (Esc)"
          >
            <Icon name="X" size={15} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}>
            {footer}
          </div>
        )}
      </aside>
    </div>
  )
}
