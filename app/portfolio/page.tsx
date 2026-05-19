'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

// MOCK ONLY — no real PHI. Patient/group caseload for Access Health demo.
const PORTFOLIO_CUSTOMERS = [
  { id: 1,  name: 'Anderson, M.',        segment: 'Individual', tier: 'Priority', revenue: 4.2,  aum: 8.4,  health: 62, nextAction: 'Prior-auth call · 09:30' },
  { id: 2,  name: 'Garcia family',       segment: 'Family',     tier: 'Priority', revenue: 2.8,  aum: 12.1, health: 88, nextAction: 'Benefits walk-through · 16:00' },
  { id: 3,  name: 'Sharma group plan',   segment: 'Group',      tier: 'Priority', revenue: 6.1,  aum: 15.2, health: 91, nextAction: 'Onboarding sign-off' },
  { id: 4,  name: 'Patel, R.',           segment: 'Individual', tier: 'Standard', revenue: 1.9,  aum: 3.8,  health: 74, nextAction: 'Eligibility refresh · 21 May' },
  { id: 5,  name: 'Reyes Group',         segment: 'Group',      tier: 'Priority', revenue: 3.4,  aum: 6.7,  health: 79, nextAction: 'Census update window' },
  { id: 6,  name: 'Carter family',       segment: 'Family',     tier: 'Standard', revenue: 1.1,  aum: 2.2,  health: 43, nextAction: 'Eligibility overdue — reassign?' },
  { id: 7,  name: 'Lopez, S.',           segment: 'Individual', tier: 'Standard', revenue: 2.3,  aum: 4.6,  health: 67, nextAction: 'Appeal-window reply · held' },
  { id: 8,  name: 'Singh, H.',           segment: 'Individual', tier: 'Standard', revenue: 0.8,  aum: 1.6,  health: 82, nextAction: 'Eligibility reminder sent' },
  { id: 9,  name: 'Davis & Park',        segment: 'Provider',   tier: 'Priority', revenue: 5.2,  aum: 18.4, health: 95, nextAction: 'Provider-rate amendment · Q4' },
  { id: 10, name: 'Baylor Scott & White', segment: 'Provider',  tier: 'Priority', revenue: 1.6,  aum: 3.2,  health: 71, nextAction: 'Records request · 9 May' },
  { id: 11, name: 'Robert Chen',         segment: 'Individual', tier: 'Priority', revenue: 3.1,  aum: 9.8,  health: 87, nextAction: 'Birthday — greeted today' },
  { id: 12, name: 'Iyer, L.',            segment: 'Individual', tier: 'Standard', revenue: 0.9,  aum: 4.2,  health: 90, nextAction: 'Plan renewal · 22 May' },
  { id: 13, name: 'Anand & Sons',        segment: 'Group',      tier: 'Standard', revenue: 0.7,  aum: 1.4,  health: 55, nextAction: 'Dependent enrollment · walk-in' },
  { id: 14, name: 'Walker family',        segment: 'Family',     tier: 'Standard', revenue: 1.2,  aum: 2.4,  health: 76, nextAction: 'Eligibility · 11 days left' },
  { id: 15, name: 'Desai practice',      segment: 'Provider',   tier: 'Priority', revenue: 4.8,  aum: 9.6,  health: 84, nextAction: 'Contract amendment delivery' },
  { id: 16, name: 'Kulkarni Pediatrics', segment: 'Provider',   tier: 'Standard', revenue: 1.4,  aum: 2.8,  health: 69, nextAction: 'Fee schedule review' },
  { id: 17, name: 'Reddy Ventures',      segment: 'Group',      tier: 'Priority', revenue: 3.7,  aum: 11.2, health: 92, nextAction: 'Quarterly check-in' },
  { id: 18, name: 'Bose, A.',            segment: 'Individual', tier: 'Standard', revenue: 2.1,  aum: 4.2,  health: 38, nextAction: 'Denial alert — urgent review' },
]

function HealthBar({ val }: { val: number }) {
  const color = val >= 80 ? '#166534' : val >= 60 ? '#C49E62' : '#B91C1C'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 5, borderRadius: 999, background: '#E8E4DF', overflow: 'hidden' }}>
        <div style={{ width: `${val}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{val}</span>
    </div>
  )
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', color, background: bg }}>
      {label}
    </span>
  )
}

function PortfolioContent() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('health')

  const filtered = useMemo(() => {
    let list = PORTFOLIO_CUSTOMERS.filter(c => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false
      if (filter === 'Priority') return c.tier === 'Priority'
      if (filter === 'At-risk') return c.health < 60
      if (filter === 'Providers') return c.segment === 'Provider'
      return true
    })
    if (sort === 'health') list = [...list].sort((a, b) => a.health - b.health)
    else if (sort === 'aum') list = [...list].sort((a, b) => b.aum - a.aum)
    else if (sort === 'revenue') list = [...list].sort((a, b) => b.revenue - a.revenue)
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [q, filter, sort])

  const atRisk = PORTFOLIO_CUSTOMERS.filter(c => c.health < 60).length
  const tier1 = PORTFOLIO_CUSTOMERS.filter(c => c.tier === 'Priority').length
  const totalAum = PORTFOLIO_CUSTOMERS.reduce((s, c) => s + c.aum, 0)

  const kpis = [
    { label: 'Active cases',       value: '47' },
    { label: 'Annual case value',  value: `$${(totalAum * 100).toFixed(0)}K` },
    { label: 'Priority members',   value: String(tier1) },
    { label: 'At-risk',            value: String(atRisk) },
  ]

  const FILTER_TABS = ['All', 'Priority', 'At-risk', 'Providers']

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>
          CASELOAD · 47 ACTIVE
        </div>
        <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1.15, color: 'var(--text-primary)', margin: 0 }}>
          Your <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>caseload</em>, today.
        </h1>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28, borderTop: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ padding: '20px 24px', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>{k.label}</div>
            <div className="num" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Icon name="Search" size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search patients, providers, groups…"
            style={{ width: '100%', height: 34, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontSize: 13, outline: 0, color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', borderRadius: 8, padding: 3 }}>
          {FILTER_TABS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{ height: 28, padding: '0 12px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: filter === t ? 'var(--bg-card)' : 'transparent', color: filter === t ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', transition: 'background 100ms ease' }}
            >{t}</button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', outline: 0 }}
        >
          <option value="health">Sort: Health (worst first)</option>
          <option value="aum">Sort: Case value (highest first)</option>
          <option value="revenue">Sort: Revenue (highest first)</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px 120px 1fr', gap: 0, padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          {['Customer', 'Segment', 'Tier', 'Revenue', 'Case value', 'Health', 'Next action'].map(h => (
            <div key={h} style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{h}</div>
          ))}
        </div>
        {filtered.map((c, i) => (
          <div
            key={c.id}
            className="row-hover"
            onClick={() => router.push(`/portfolio/${c.id}`)}
            style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px 120px 1fr', gap: 0, padding: '13px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 100ms ease', alignItems: 'center' }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.segment}</div>
            <div>
              {c.tier === 'Priority'
                ? <Pill label="Priority" color="var(--ah-deep)" bg="rgba(59,86,183,0.12)" />
                : <Pill label="Standard" color="var(--text-tertiary)" bg="var(--bg-subtle)" />}
            </div>
            <div className="num" style={{ fontSize: 13, color: 'var(--text-primary)' }}>${c.revenue}K</div>
            <div className="num" style={{ fontSize: 13, color: 'var(--text-primary)' }}>${(c.aum * 10).toFixed(0)}K</div>
            <HealthBar val={c.health} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontStyle: c.health < 60 ? 'italic' : 'normal', color: c.health < 60 ? 'var(--danger)' : 'var(--text-secondary)', flex: 1 }}>{c.nextAction}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>No cases match the current filters.</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace" }}>
        Showing {filtered.length} of 47 · click any row to open the case detail.
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <AppShell>
      <PortfolioContent />
    </AppShell>
  )
}
