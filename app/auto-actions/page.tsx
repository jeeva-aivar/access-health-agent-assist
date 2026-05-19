'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/FormElements'
import { useApp } from '@/lib/app-context'
import { MOCK } from '@/lib/mock-data'
import { COMMS_DATA, SYS_DATA, BADGE_STYLE, type ActionItem, type Badge } from '@/lib/auto-actions-data'

function BadgePill({ badge }: { badge: Badge }) {
  const s = BADGE_STYLE[badge] ?? BADGE_STYLE.DONE
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px',
      border: `1px solid ${s.border}`, borderRadius: 4,
      fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace",
      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: s.color,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{badge}</span>
  )
}

function ActionRow({ item, dismissing, onView }: { item: ActionItem; dismissing: boolean; onView: () => void }) {
  return (
    <div
      onClick={onView}
      className={'row-hover' + (dismissing ? ' row-dismiss' : '')}
      style={{
        display: 'grid', gridTemplateColumns: '52px 1fr auto',
        gap: 14, alignItems: 'center', padding: '13px 18px',
        borderTop: '1px solid var(--border-subtle)', cursor: 'pointer',
        transition: 'background 100ms ease',
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1 }}>{item.time}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{item.detail}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BadgePill badge={item.badge} />
        <Icon name="ChevronRight" size={13} style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </div>
  )
}

function ConfigureRulesModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (r: typeof MOCK.defaultRules) => void }) {
  const [rules, setRules] = useState(() => MOCK.defaultRules.map(r => ({ ...r })))
  const toggle = (id: string) => setRules(arr => arr.map(r => r.id === id ? { ...r, on: !r.on } : r))
  const enabled = rules.filter(r => r.on).length
  return (
    <Modal open={open} onClose={onClose} eyebrow="AUTOMATION RULES" title="Configure what runs without you" width={620}
      footer={<div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={() => { onSave(rules); onClose() }}>Save changes</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <span className="caption" style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>{enabled} of {rules.length} enabled</span>
      </div>}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
        These rules govern what Access Health AI does on your behalf overnight. Anything you turn off becomes a one-time draft for your review instead.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rules.map((r, i) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{r.desc}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 4 }}>Threshold: {r.threshold}</div>
            </div>
            <Switch checked={r.on} onChange={() => toggle(r.id)} label={r.on ? 'On' : 'Off'} />
          </div>
        ))}
      </div>
    </Modal>
  )
}

function AutoActionsContent() {
  const router = useRouter()
  const app = useApp()
  const [comms, setComms] = useState<ActionItem[]>(COMMS_DATA)
  const [sys, setSys] = useState<ActionItem[]>(SYS_DATA)
  const [dismissingIds, setDismissingIds] = useState<Record<string, boolean>>({})
  const [rulesOpen, setRulesOpen] = useState(false)
  const [savedRules, setSavedRules] = useState<typeof MOCK.defaultRules | null>(null)

  const dismiss = (which: 'c' | 's', idx: number) => {
    const list = which === 'c' ? comms : sys
    const setter = which === 'c' ? setComms : setSys
    const key = which + idx
    setDismissingIds(p => ({ ...p, [key]: true }))
    app.toast(`Dismissed · ${list[idx].title.replace(/\.$/, '')}`)
    setTimeout(() => {
      setter(prev => prev.filter((_, i) => i !== idx))
      setDismissingIds(p => { const n = { ...p }; delete n[key]; return n })
    }, 360)
  }

  const approveAll = () => {
    setComms(comms.map(r => r.needsAction ? { ...r, badge: 'APPROVED' as Badge, needsAction: false } : r))
    setSys(sys.map(r => r.needsAction ? { ...r, badge: 'APPROVED' as Badge, needsAction: false } : r))
    const n = comms.filter(r => r.needsAction).length + sys.filter(r => r.needsAction).length
    app.toast(`${n} actions approved`)
    app.bumpPoints(n * 50)
  }

  const reviewCount = comms.filter(r => r.needsAction).length + sys.filter(r => r.needsAction).length
  const totalCount = comms.length + sys.length

  return (
    <div className="anim-fade" style={{ padding: '36px 40px', maxWidth: 1360, margin: '0 auto' }}>

      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          TODAY · 09:15 &nbsp;<span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'inherit' }}>While you slept</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 999, border: '1px solid #16a34a', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono',monospace", color: '#16a34a', textTransform: 'uppercase' }}>{totalCount - reviewCount} ACTIONS COMPLETE</span>
          {reviewCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 999, border: '1px solid #dc2626', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono',monospace", color: '#dc2626', textTransform: 'uppercase' }}>{reviewCount} AWAITING REVIEW</span>}
        </div>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-serif" style={{ fontSize: 46, fontWeight: 400, lineHeight: 1.1, color: 'var(--text-primary)', margin: 0 }}>
          {totalCount} things <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>Access Health AI</em> handled.
        </h1>
        <div style={{ marginTop: 10, fontSize: 15.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Allow all, or review individually. Anything you reject becomes a rule going forward.
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 32, border: '1px solid var(--border-subtle)' }}>
        {[
          { label: 'TIER-1 REPLIES SENT',     value: '12',     color: 'var(--ah-emerald)' },
          { label: 'EHR RECORDS UPDATED',     value: '5',      color: 'var(--ah-emerald)' },
          { label: 'ELIGIBILITY REMINDERS',   value: '2',      color: 'var(--ah-emerald)' },
          { label: 'TIME YOU SAVED',             value: '1h 48m', color: '#16a34a' },
        ].map((k, i) => (
          <div key={k.label} style={{ padding: '18px 22px', borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>{k.label}</div>
            <div className="num" style={{ fontSize: 36, fontWeight: 400, color: k.color, lineHeight: 1, fontFamily: "'Source Serif 4','Source Serif Pro',Georgia,serif" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>COMMUNICATIONS</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--ah-emerald)', fontWeight: 700, letterSpacing: '0.1em' }}>
              {comms.filter(r => r.needsAction).length > 0 ? `${comms.filter(r => r.needsAction).length} ACTIONS` : `${comms.length} SENT`}
            </div>
          </div>
          <div>
            {comms.map((item, i) => (
              <ActionRow
                key={item.id}
                item={item}
                dismissing={!!dismissingIds['c' + i]}
                onView={() => router.push(`/auto-actions/${item.id}`)}
              />
            ))}
            {comms.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>All caught up.</div>}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>SYSTEM UPDATES & FLAGS</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--ah-emerald)', fontWeight: 700, letterSpacing: '0.1em' }}>
              {sys.filter(r => r.needsAction).length > 0 ? `${sys.filter(r => r.needsAction).length} ACTIONS` : `${sys.length} DONE`}
            </div>
          </div>
          <div>
            {sys.map((item, i) => (
              <ActionRow
                key={item.id}
                item={item}
                dismissing={!!dismissingIds['s' + i]}
                onView={() => router.push(`/auto-actions/${item.id}`)}
              />
            ))}
            {sys.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>All caught up.</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-primary" onClick={approveAll} disabled={reviewCount === 0} style={{ opacity: reviewCount === 0 ? 0.45 : 1, cursor: reviewCount === 0 ? 'not-allowed' : 'pointer' }}>
          {reviewCount === 0 ? 'All approved' : `Approve all (${reviewCount})`}
        </button>
        <button className="btn-secondary" onClick={() => setRulesOpen(true)}>
          <Icon name="SlidersHorizontal" size={13} style={{ marginRight: 6 }} />
          Configure rules{savedRules ? ` (${savedRules.filter(r => r.on).length} on)` : ''}
        </button>
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
          Each approval +50 pts · session: <span style={{ color: '#16a34a', fontWeight: 700 }}>+{app.state.sessionPoints}</span>
        </span>
      </div>

      <ConfigureRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        onSave={r => { setSavedRules(r); app.toast(`${r.filter(x => x.on).length} rules active · changes saved`) }}
      />
    </div>
  )
}

export default function AutoActionsPage() {
  return (
    <AppShell>
      <AutoActionsContent />
    </AppShell>
  )
}
