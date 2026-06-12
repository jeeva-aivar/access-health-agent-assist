'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

// MOCK ONLY — no real PHI. Aggregate caseload book for Live assist demo.
const SEGMENTS = [
  { label: 'Individual members', aum: 38.4, color: '#3B56B7' }, // Sapphire
  { label: 'Family plans',       aum: 22.1, color: '#1E3082' }, // True Cobalt
  { label: 'Group plans',        aum: 14.2, color: '#9C8387' }, // Taupe
  { label: 'Providers',          aum:  9.5, color: '#131F53' }, // Deep Navy
]

const EXPOSURE = [
  { product: 'Active claims',           amount: 28.4 },
  { product: 'Prior auths in flight',   amount: 19.2 },
  { product: 'Open enrollments',        amount: 22.1 },
  { product: 'Provider contracts',      amount: 14.2 },
  { product: 'Appeals / disputes',      amount: 0.3 },
]

const MONTHS = [
  { month: 'Dec', revenue: 3.1 },
  { month: 'Jan', revenue: 3.4 },
  { month: 'Feb', revenue: 3.0 },
  { month: 'Mar', revenue: 3.8 },
  { month: 'Apr', revenue: 3.6 },
  { month: 'May', revenue: 4.1 },
]

const COHORTS = [
  { name: 'Iyer, V.',             delta: '+8%',  direction: 'up',   note: 'Prior-auth advanced' },
  { name: 'Sharma group plan',    delta: '+12%', direction: 'up',   note: 'Onboarding closed' },
  { name: 'Bose, A.',             delta: '-6%',  direction: 'down', note: 'Denial flagged' },
  { name: 'Carter family',        delta: '-3%',  direction: 'down', note: 'Eligibility stalled — reassign' },
  { name: 'Davis & Park',         delta: '+4%',  direction: 'up',   note: 'Contract amendment signed off' },
]

function ConsolidatedBookContent() {
  const totalAum = SEGMENTS.reduce((s, x) => s + x.aum, 0)
  const maxRevenue = Math.max(...MONTHS.map(m => m.revenue))
  const maxExposure = Math.max(...EXPOSURE.map(e => e.amount))

  const kpis = [
    { label: 'Total case value',  value: '$842K' },
    { label: 'Revenue book',      value: '$410K', sub: 'May run-rate' },
    { label: 'New cases YTD',     value: '$1.24M' },
    { label: 'In negotiation',    value: '$840K', sub: 'pipeline' },
  ]

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>
          CASELOAD · CONSOLIDATED BOOK · WEEK 19 · 2026
        </div>
        <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1.15, color: 'var(--text-primary)', margin: 0 }}>
          <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>$842K</em> across 47 cases.
        </h1>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 32, borderTop: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ padding: '20px 24px', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>{k.label}</div>
            <div className="num" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue trend */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 20 }}>Revenue Trend · 6 months</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {MONTHS.map((m, i) => {
              const isLast = i === MONTHS.length - 1
              const barH = Math.round((m.revenue / maxRevenue) * 110)
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: isLast ? 'var(--idfc-red-bright)' : 'var(--text-tertiary)' }}>${(m.revenue * 100).toFixed(0)}K</div>
                  <div style={{ width: '100%', height: barH, background: isLast ? 'var(--idfc-red-bright)' : 'var(--border-default)', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace" }}>{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Segment mix */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 20 }}>Segment Mix · AUM</div>
          {/* Stacked bar */}
          <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', marginBottom: 20 }}>
            {SEGMENTS.map((s) => (
              <div key={s.label} style={{ width: `${(s.aum / totalAum) * 100}%`, background: s.color }} title={`${s.label}: $${(s.aum * 10).toFixed(0)}K`} />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SEGMENTS.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.label}</span>
                </div>
                <span className="num" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${(s.aum * 10).toFixed(0)}K <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>({Math.round((s.aum / totalAum) * 100)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Exposure + Top Movers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Product exposure */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 20 }}>Product Exposure</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EXPOSURE.map((e) => (
              <div key={e.product}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{e.product}</span>
                  <span className="num" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${(e.amount * 10).toFixed(0)}K</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${(e.amount / maxExposure) * 100}%`, height: '100%', background: 'var(--idfc-red)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top movers */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Top Movers · This Week</div>
          </div>
          {COHORTS.map((c, i) => (
            <div key={c.name} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', cursor: 'default', transition: 'background 100ms ease' }}>
              <Icon
                name={c.direction === 'up' ? 'TrendingUp' : 'TrendingDown'}
                size={15}
                style={{ color: c.direction === 'up' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.note}</div>
              </div>
              <div className="num" style={{ fontSize: 13, fontWeight: 600, color: c.direction === 'up' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}>{c.delta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConsolidatedBookPage() {
  return (
    <AppShell>
      <ConsolidatedBookContent />
    </AppShell>
  )
}
