'use client'
import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

// ─── Shared form primitives ───────────────────────────────────────────────────

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{hint}</div>}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  height: 42, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8,
  padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box',
}

export function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputBase} />
}

export function NumberInput({ value, onChange, placeholder, min, max }: { value: string; onChange: (v: string) => void; placeholder?: string; min?: number; max?: number }) {
  return <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} style={inputBase} />
}

export function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function CheckboxGroup({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const on = value.includes(o.value)
        return (
          <button key={o.value} type="button" onClick={() => toggle(o.value)} style={{
            height: 34, padding: '0 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: on ? 'var(--idfc-red)' : 'var(--bg-subtle)',
            color: on ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${on ? 'var(--idfc-red)' : 'var(--border-subtle)'}`,
            transition: 'all 120ms',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const add = () => { const t = draft.trim(); if (t && !value.includes(t)) onChange([...value, t]); setDraft('') }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: value.length ? 8 : 0 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} placeholder={placeholder ?? 'Type and press Enter'} style={{ ...inputBase, flex: 1 }} />
        <button type="button" onClick={add} style={{ height: 42, padding: '0 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>Add</button>
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map(v => (
            <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 5, fontSize: 12.5, color: 'var(--text-primary)' }}>
              {v}
              <button type="button" onClick={() => onChange(value.filter(x => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Result renderers ─────────────────────────────────────────────────────────

function PitchResult({ data }: { data: Record<string, unknown> }) {
  const deck = data.deck as { title?: string; slides?: { slide_no: number; headline: string; bullets?: string[] }[] } | undefined
  const points = data.talking_points as string[] | undefined
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {deck?.title && <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{deck.title}</div>}
      {deck?.slides?.map(s => (
        <div key={s.slide_no} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--idfc-red-bright)', border: '1px solid rgba(180,30,30,0.3)', borderRadius: 4, padding: '2px 7px' }}>SLIDE {s.slide_no}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.headline}</span>
          </div>
          {s.bullets?.map((b, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 12, marginBottom: 3 }}>• {b}</div>)}
        </div>
      ))}
      {points && points.length > 0 && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Talking Points</div>
          {points.map((p, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>• {p}</div>)}
        </div>
      )}
    </div>
  )
}

function MeetingResult({ data }: { data: Record<string, unknown> }) {
  const agenda = data.agenda as { item: string; minutes: number }[] | undefined
  const risks = data.risk_flags as { type: string; severity: string; detail: string }[] | undefined
  const market = data.market_context as { highlights?: string[] } | undefined
  const sc = (s: string) => s === 'high' ? '#dc2626' : s === 'medium' ? '#d97706' : '#16a34a'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {agenda && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Agenda</div>
          {agenda.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--idfc-red-bright)', fontWeight: 700, width: 32, flexShrink: 0 }}>{a.minutes}m</span>
              <span style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{a.item}</span>
            </div>
          ))}
        </div>
      )}
      {risks && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Risk Flags</div>
          {risks.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc(r.severity), flexShrink: 0, marginTop: 5 }} />
              <div><span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{r.type} </span><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: sc(r.severity), textTransform: 'uppercase' }}>{r.severity}</span><div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>{r.detail}</div></div>
            </div>
          ))}
        </div>
      )}
      {market?.highlights && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Market Context</div>
          {market.highlights.map((h, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>• {h}</div>)}
        </div>
      )}
    </div>
  )
}

function EarningsResult({ data }: { data: Record<string, unknown> }) {
  const kpis = data.kpis as Record<string, { actual: number; consensus: number; surprise_pct: number }> | undefined
  const impact = data.thesis_impact as { key_drivers?: string[]; risks?: string[] } | undefined
  const clients = data.client_impact as { client_id: string; suggested_action: string; rationale: string }[] | undefined
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!!data.headline && <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 14.5, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>{String(data.headline)}</div>}
      {kpis && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>KPIs vs Consensus</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {Object.entries(kpis).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>{k.replace(/_/g, ' ')}</div>
                <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, color: 'var(--text-primary)' }}>{v.actual}</div>
                <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 3 }}>+{v.surprise_pct}% vs {v.consensus}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {clients && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Customer Actions</div>
          {clients.map(c => (
            <div key={c.client_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>{c.client_id}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.suggested_action === 'hold' ? '#16a34a' : 'var(--idfc-red-bright)', border: `1px solid ${c.suggested_action === 'hold' ? 'rgba(22,163,74,0.3)' : 'rgba(180,30,30,0.3)'}`, padding: '2px 8px', borderRadius: 4 }}>{c.suggested_action.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.rationale}</div>
            </div>
          ))}
        </div>
      )}
      {impact?.key_drivers && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Key Drivers</div>
          {impact.key_drivers.map((d, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>• {d}</div>)}
        </div>
      )}
    </div>
  )
}

function ModelResult({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as { expected_return_pct: number; expected_vol_pct: number; sharpe: number; max_drawdown_pct: number } | undefined
  const allocation = data.allocation as { asset_class: string; current_pct: number; target_pct: number; delta_pct: number }[] | undefined
  const trades = data.trades as { action: string; ticker: string; notional_usd: number }[] | undefined
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[['Expected Return', `${summary.expected_return_pct}%`], ['Volatility', `${summary.expected_vol_pct}%`], ['Sharpe', String(summary.sharpe)], ['Max Drawdown', `${summary.max_drawdown_pct}%`]].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>{k}</div>
              <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {allocation && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Allocation Changes</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            {['Asset Class', 'Current', 'Target', 'Delta'].map(h => (
              <div key={h} style={{ padding: '8px 12px', background: 'var(--bg-subtle)', fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>{h}</div>
            ))}
            {allocation.map(a => [
              <div key={a.asset_class + 'n'} style={{ padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{a.asset_class.replace(/_/g, ' ')}</div>,
              <div key={a.asset_class + 'c'} style={{ padding: '9px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>{a.current_pct}%</div>,
              <div key={a.asset_class + 't'} style={{ padding: '9px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>{a.target_pct}%</div>,
              <div key={a.asset_class + 'd'} style={{ padding: '9px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: a.delta_pct > 0 ? '#16a34a' : '#dc2626', borderBottom: '1px solid var(--border-subtle)' }}>{a.delta_pct > 0 ? '+' : ''}{a.delta_pct}%</div>,
            ])}
          </div>
        </div>
      )}
      {trades && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Trade List</div>
          {trades.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: t.action === 'BUY' ? '#16a34a' : '#dc2626', border: `1px solid ${t.action === 'BUY' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 4, padding: '1px 7px' }}>{t.action}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 64 }}>{t.ticker}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${(t.notional_usd / 1_000_000).toFixed(2)}M</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MemoResult({ data }: { data: Record<string, unknown> }) {
  const s = data.structured as { decisions?: { id: string; text: string; owner: string }[]; action_items?: { id: string; text: string; owner: string; due: string }[]; risk_flags?: { type: string; severity: string; detail: string }[]; next_steps?: string[] } | undefined
  const sc = (sev: string) => sev === 'High' ? '#dc2626' : sev === 'Medium' ? '#d97706' : '#16a34a'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!!data.title && <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{String(data.title)}</div>}
      {s?.decisions && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Decisions</div>
          {s.decisions.map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--idfc-red-bright)', flexShrink: 0, marginTop: 3 }}>{d.id}</span>
              <div><div style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{d.text}</div><div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 3 }}>Owner: {d.owner}</div></div>
            </div>
          ))}
        </div>
      )}
      {s?.action_items && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Action Items</div>
          {s.action_items.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: '#d97706', flexShrink: 0, marginTop: 3 }}>{a.id}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{a.text}</div><div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 3 }}>{a.owner} · Due {a.due}</div></div>
            </div>
          ))}
        </div>
      )}
      {s?.risk_flags && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Risk Flags</div>
          {s.risk_flags.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc(r.severity), flexShrink: 0, marginTop: 5 }} />
              <div><span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{r.type} </span><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: sc(r.severity), textTransform: 'uppercase' }}>{r.severity}</span><div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>{r.detail}</div></div>
            </div>
          ))}
        </div>
      )}
      {s?.next_steps && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Next Steps</div>
          {s.next_steps.map((step, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>{i + 1}. {step}</div>)}
        </div>
      )}
    </div>
  )
}

// ─── Shared agent page shell ──────────────────────────────────────────────────

interface AgentPageProps {
  agentId: string
  label: string
  icon: string
  tagline: string
  color: string
  latency: string
  buildPayload: () => Record<string, unknown> | null
  form: ReactNode
}

export function AgentPage({ agentId, label, icon, tagline, color, latency, buildPayload, form }: AgentPageProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [showRaw, setShowRaw] = useState(false)

  const invoke = async () => {
    const payload = buildPayload()
    if (!payload) return
    setStatus('loading'); setResult(null); setError(''); setElapsed(0)
    const t0 = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500)
    try {
      const res = await fetch('/api/agents/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentId, payload }),
      })
      const json = await res.json()
      clearInterval(timer)
      setElapsed(Math.floor((Date.now() - t0) / 1000))
      if (!res.ok || json.error) { setError(json.error || 'Unknown error'); setStatus('error'); return }
      setResult(json.data)
      setStatus('done')
    } catch (e) {
      clearInterval(timer)
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  const isLoading = status === 'loading'

  return (
    <AppShell>
      <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => router.push('/ai-agents')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13, padding: 0, marginBottom: 24 }}>
          <Icon name="ArrowLeft" size={14} style={{ color: 'var(--text-tertiary)' }} />
          All agents
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name={icon} size={22} style={{ color }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 32, fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>{label}</h1>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>{tagline} · <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>{latency}</span></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '560px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Form panel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 28 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 20 }}>Input parameters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {form}
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
              {error && <div style={{ marginBottom: 14, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>}
              <button onClick={invoke} disabled={isLoading} style={{
                width: '100%', height: 46, background: isLoading ? 'var(--bg-subtle)' : color,
                color: isLoading ? 'var(--text-tertiary)' : '#fff', border: 'none', borderRadius: 10,
                fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: isLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                {isLoading ? (
                  <><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', animation: 'pulse 1s infinite' }} />Running · {elapsed}s elapsed</>
                ) : (
                  <><Icon name="Play" size={14} />Run {label}</>
                )}
              </button>
            </div>
          </div>

          {/* Result panel */}
          {result ? (
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}30`, borderRadius: 14, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a' }}>Completed · {elapsed}s</span>
                </div>
                <button onClick={() => setShowRaw(r => !r)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}>
                  {showRaw ? 'Formatted' : 'Raw JSON'}
                </button>
              </div>
              {showRaw ? (
                <pre style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14, fontSize: 11.5, color: 'var(--text-secondary)', overflow: 'auto', maxHeight: 600, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6, margin: 0 }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <>
                  {agentId === 'pitch_builder'     && <PitchResult data={result} />}
                  {agentId === 'meeting_preparer'  && <MeetingResult data={result} />}
                  {agentId === 'earnings_reviewer' && <EarningsResult data={result} />}
                  {agentId === 'model_builder'     && <ModelResult data={result} />}
                  {agentId === 'memo_maker'        && <MemoResult data={result} />}
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-tertiary)', padding: '60px 32px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 14, textAlign: 'center' }}>
              <Icon name={icon} size={32} style={{ color: 'var(--border-subtle)' }} />
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Output will appear here</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>Fill in the form and click Run to invoke the agent.</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
