'use client'
import { useEffect } from 'react'
import { Icon } from './Icon'

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  width = 540,
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        onClick={onClose}
        className="anim-fade"
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.4)', backdropFilter: 'blur(2px)' }}
      />
      <div
        className="anim-fade-up"
        style={{
          position: 'relative',
          width: `min(${width}px, 100%)`,
          maxHeight: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          boxShadow: '0 24px 60px -16px rgba(20,15,10,0.28)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          {eyebrow && <div className="caption" style={{ fontSize: 10.5, marginBottom: 6 }}>{eyebrow}</div>}
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
