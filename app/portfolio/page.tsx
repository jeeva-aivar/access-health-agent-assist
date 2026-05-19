'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { CUSTOMERS, type Customer } from '@/lib/customers'

// Caseload page now reads from the shared CUSTOMERS roster
// (lib/customers.ts) — same source as Live Call Assist. Click a row
// to open the detail page; routed by memberId.

function totalBilled(c: Customer): number {
  return c.claims.reduce((s, cl) => s + cl.billed, 0)
}

function nextActionFor(c: Customer): string {
  // Short, scan-friendly version of the call reason.
  const r = c.callReason
  return r.length > 70 ? r.slice(0, 67) + '…' : r
}

function flowLabel(f: Customer['flow']): string {
  return f === 'claim_status' ? 'Claim status' : f === 'eligibility_priorauth' ? 'Eligibility + PA' : 'Billing / refund'
}

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
  const [filter, setFilter] = useState<'All' | 'Priority' | 'At-risk' | 'Claim status' | 'Eligibility + PA' | 'Billing / refund'>('All')
  const [sort, setSort] = useState('health')

  const filtered = useMemo(() => {
    let list = CUSTOMERS.filter(c => {
      if (q && !(c.name.toLowerCase().includes(q.toLowerCase()) || c.memberId.toLowerCase().includes(q.toLowerCase()) || c.phoneDisplay.includes(q))) return false
      if (filter === 'Priority') return c.tier === 'Priority'
      if (filter === 'At-risk') return c.healthScore < 60
      if (filter === 'Claim status') return c.flow === 'claim_status'
      if (filter === 'Eligibility + PA') return c.flow === 'eligibility_priorauth'
      if (filter === 'Billing / refund') return c.flow === 'billing_refund'
      return true
    })
    if (sort === 'health') list = [...list].sort((a, b) => a.healthScore - b.healthScore)
    else if (sort === 'value') list = [...list].sort((a, b) => totalBilled(b) - totalBilled(a))
    else if (sort === 'name') list = [...list].sort((a, b) => a.lastName.localeCompare(b.lastName))
    return list
  }, [q, filter, sort])

  const atRisk = CUSTOMERS.filter(c => c.healthScore < 60).length
  const priority = CUSTOMERS.filter(c => c.tier === 'Priority').length
  const totalCaseValue = CUSTOMERS.reduce((s, c) => s + totalBilled(c), 0)

  const kpis = [
    { label: 'Active cases',      value: String(CUSTOMERS.length) },
    { label: 'Annual case value', value: `$${(totalCaseValue / 1000).toFixed(1)}K` },
    { label: 'Priority members',  value: String(priority) },
    { label: 'At-risk',           value: String(atRisk) },
  ]

  const FILTER_TABS = ['All', 'Priority', 'At-risk', 'Claim status', 'Eligibility + PA', 'Billing / refund'] as const

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>
          CASELOAD · {CUSTOMERS.length} ACTIVE
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
            placeholder="Search name, member ID, phone…"
            style={{ width: '100%', height: 34, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontSize: 13, outline: 0, color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
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
          <option value="value">Sort: Case value (highest first)</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 110px 90px 110px 130px 120px 1.6fr', gap: 0, padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          {['Member', 'Segment', 'Tier', 'Plan', 'Flow', 'Health', 'Next action'].map(h => (
            <div key={h} style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{h}</div>
          ))}
        </div>
        {filtered.map((c, i) => (
          <div
            key={c.memberId}
            className="row-hover"
            onClick={() => router.push(`/portfolio/${c.memberId}`)}
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 110px 90px 110px 130px 120px 1.6fr', gap: 0, padding: '13px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 100ms ease', alignItems: 'center' }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{c.lastName}, {c.firstName.charAt(0)}.</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.memberId} · {c.phoneDisplay}</div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.segment}</div>
            <div>
              {c.tier === 'Priority'
                ? <Pill label="Priority" color="var(--ah-deep)" bg="rgba(59,86,183,0.12)" />
                : <Pill label="Standard" color="var(--text-tertiary)" bg="var(--bg-subtle)" />}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.planType}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{flowLabel(c.flow)}</div>
            <HealthBar val={c.healthScore} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontStyle: c.healthScore < 60 ? 'italic' : 'normal', color: c.healthScore < 60 ? 'var(--danger)' : 'var(--text-secondary)', flex: 1 }}>{nextActionFor(c)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>No cases match the current filters.</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace" }}>
        Showing {filtered.length} of {CUSTOMERS.length} · click any row to open the case detail · same roster as Live Call Assist
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
