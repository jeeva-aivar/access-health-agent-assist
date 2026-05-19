'use client'

export function StatusDot({ tone = 'info', label }: { tone?: string; label?: string }) {
  const cls = 'dot dot-' + (tone === 'gold' ? 'warning' : tone === 'redbright' ? 'danger' : tone)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className={cls} />
      {label && <span className="caption" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
    </span>
  )
}

export function StatusPill({ tone, label }: { tone: string; label: string }) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    success: { bg: '#eef4ee', fg: 'var(--success)',         bd: '#c8dccd' },
    warning: { bg: '#fbf5e8', fg: '#8a6a30',                bd: '#e6d2ad' },
    danger:  { bg: '#fbf0f2', fg: 'var(--danger)',          bd: '#ecc3cb' },
    info:    { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)', bd: 'var(--border-subtle)' },
  }
  const c = map[tone] || map.info
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: c.bg, color: c.fg,
      border: `1px solid ${c.bd}`,
      borderRadius: 999, padding: '4px 10px',
      fontSize: 11, fontWeight: 500,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span className={'dot dot-' + tone} />
      {label}
    </span>
  )
}
