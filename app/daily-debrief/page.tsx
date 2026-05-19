'use client'
import { useState, useMemo } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { Blade } from '@/components/ui/Blade'
import { FieldLabel, TextInput, TextArea, Select, Switch } from '@/components/ui/FormElements'
import { useApp } from '@/lib/app-context'
import { MOCK } from '@/lib/mock-data'

const TONE_COLORS: Record<string, string> = {
  success:   'var(--success)',
  gold:      '#8a6a30',
  info:      'var(--text-secondary)',
  redbright: 'var(--idfc-red-bright)',
}

// ─── LockTomorrowBlade ───────────────────────────────────────────────────────
function LockTomorrowBlade({ open, onClose, onLock }: {
  open: boolean
  onClose: () => void
  onLock: (plan: { id: number; time: string; title: string; type: string; note: string }[]) => void
}) {
  const initial = [
    { id: 1, time: '09:00', title: 'Patel, R. — eligibility refresh walkthrough',  type: 'AI',     note: 'Docs landed overnight; brief auto-prepared.' },
    { id: 2, time: '10:30', title: 'Anderson, M. — prior-auth follow-through',     type: 'AI',     note: 'Adjudication ETA confirmation + records request status.' },
    { id: 3, time: '11:30', title: 'Open-enrollment batch — review (38 members)',   type: 'AI',     note: 'Tier-personalized; ready at 09:15.' },
    { id: 4, time: '14:00', title: 'Garcia family — supplemental rider follow-up',  type: 'Manual', note: 'Send Spanish brochure pack.' },
    { id: 5, time: '16:00', title: 'Hub huddle — Thursday weekly',                  type: 'Manual', note: '5-min agenda required.' },
  ]
  const [items, setItems] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const update = (id: number, patch: Partial<typeof initial[0]>) => setItems(arr => arr.map(x => x.id === id ? { ...x, ...patch } : x))
  const remove = (id: number) => setItems(arr => arr.filter(x => x.id !== id))
  const add = () => {
    const id = Math.max(0, ...items.map(x => x.id)) + 1
    const next = { id, time: '12:00', title: 'New task', type: 'Manual', note: '' }
    setItems([...items, next])
    setEditingId(id)
  }

  return (
    <Blade open={open} onClose={onClose} eyebrow="TOMORROW · THU 9 MAY" title="Lock tomorrow's plan" width={620}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-primary" onClick={() => { onLock(items); onClose() }}>Lock {items.length} priorities</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <span className="caption" style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>Locked plan drives tomorrow&apos;s Morning Briefing.</span>
        </div>
      }
    >
      <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Review what AI lined up for tomorrow. Edit, remove, or add. Once locked, your 06:30 briefing will reflect this exact order.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, i) => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ width: 56, flexShrink: 0 }}>
              {editingId === it.id
                ? <TextInput value={it.time} onChange={e => update(it.id, { time: e.target.value })} style={{ height: 30, fontSize: 12, padding: '0 8px' }} />
                : <div className="font-mono num" style={{ fontSize: 12, color: 'var(--text-tertiary)', paddingTop: 4 }}>{it.time}</div>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingId === it.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <TextInput value={it.title} onChange={e => update(it.id, { title: e.target.value })} style={{ height: 32 }} />
                  <TextInput value={it.note} onChange={e => update(it.id, { note: e.target.value })} placeholder="Note (optional)" style={{ height: 30, fontSize: 12.5 }} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{it.title}</div>
                  {it.note && <div className="body" style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{it.note}</div>}
                </>
              )}
              <span className="caption" style={{ display: 'inline-flex', marginTop: 6, fontSize: 10, padding: '2px 6px', border: '1px solid var(--border-subtle)', borderRadius: 4, color: it.type === 'AI' ? 'var(--idfc-red)' : 'var(--text-tertiary)' }}>{it.type}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button className="btn-ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => setEditingId(editingId === it.id ? null : it.id)}>
                <Icon name={editingId === it.id ? 'Check' : 'Pencil'} size={13} />
              </button>
              <button className="btn-ghost" style={{ height: 28, width: 28, padding: 0, color: 'var(--danger)' }} onClick={() => remove(it.id)}>
                <Icon name="Trash2" size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-secondary" onClick={add} style={{ width: '100%', height: 36, marginTop: 16 }}>
        <Icon name="Plus" size={13} style={{ marginRight: 6 }} />Add priority
      </button>
    </Blade>
  )
}

// ─── SendDebriefBlade ────────────────────────────────────────────────────────
function SendDebriefBlade({ open, onClose, onSend }: {
  open: boolean
  onClose: () => void
  onSend: (payload: { to: string; cc: string; subject: string; body: string }) => void
}) {
  const [to, setTo] = useState('michael.reed@accesshealthcare.com')
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState('Daily debrief · Tue 19 May · Jane Doe')
  const [includeStats, setIncludeStats] = useState(true)
  const [includeTimeline, setIncludeTimeline] = useState(true)
  const [includeTomorrow, setIncludeTomorrow] = useState(true)
  const [tone, setTone] = useState('Concise')
  const [note, setNote] = useState("Strong day. Anderson prior-auth advanced, zero SLA breaches. Flagging the Garcia supplemental follow-up for next week.")

  const previewBody = useMemo(() => {
    const lines: string[] = []
    lines.push('Hi Michael,')
    lines.push('')
    lines.push(note)
    if (includeStats) {
      lines.push('')
      lines.push('• Member time: 5h 42m of 8h')
      lines.push('• Auto-actions: 142')
      lines.push('• SLA breaches: 0')
    }
    if (includeTimeline) {
      lines.push('')
      lines.push('Highlights:')
      lines.push('  09:30 — Anderson prior-auth advanced; records received 15:48 (WIN)')
      lines.push("  10:00 — Sharma group plan onboarding closed (WIN)")
      lines.push('  12:30 — Patel eligibility breach prevented (SAVED)')
    }
    if (includeTomorrow) {
      lines.push('')
      lines.push("Tomorrow: 3 member calls before lunch · Patel renewal docs land overnight · open-enrollment batch ready 09:15.")
    }
    lines.push('')
    lines.push('— Jane')
    return lines.join('\n')
  }, [note, includeStats, includeTimeline, includeTomorrow])

  return (
    <Blade open={open} onClose={onClose} eyebrow="DEBRIEF · WED 8 MAY" title="Send debrief to manager" width={620}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-primary" onClick={() => { onSend({ to, cc, subject, body: previewBody }); onClose() }}>
            <Icon name="Send" size={13} style={{ marginRight: 6 }} />Send debrief
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <span className="caption" style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>Sends via Outlook · cc&apos;d to your inbox.</span>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><FieldLabel>TO</FieldLabel><TextInput value={to} onChange={e => setTo(e.target.value)} /></div>
        <div><FieldLabel>CC</FieldLabel><TextInput value={cc} onChange={e => setCc(e.target.value)} placeholder="(optional)" /></div>
      </div>
      <div style={{ marginTop: 12 }}><FieldLabel>SUBJECT</FieldLabel><TextInput value={subject} onChange={e => setSubject(e.target.value)} /></div>
      <div style={{ marginTop: 12 }}><FieldLabel>YOUR NOTE</FieldLabel><TextArea rows={4} value={note} onChange={e => setNote(e.target.value)} /></div>

      <div style={{ marginTop: 16 }}>
        <FieldLabel>INCLUDE</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-subtle)' }}>
          <Switch checked={includeStats} onChange={setIncludeStats} label="Today's stats (3 KPIs)" />
          <Switch checked={includeTimeline} onChange={setIncludeTimeline} label="Timeline highlights (5 events)" />
          <Switch checked={includeTomorrow} onChange={setIncludeTomorrow} label="Tomorrow's preview" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <div><FieldLabel>TONE</FieldLabel><Select value={tone} onChange={setTone} options={['Concise','Detailed','Warm']} /></div>
      </div>

      <div style={{ marginTop: 20 }}>
        <FieldLabel hint="What your manager will receive">PREVIEW</FieldLabel>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)', padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, margin: 0 }}>{previewBody}</pre>
      </div>
    </Blade>
  )
}

// ─── Main debrief content ────────────────────────────────────────────────────
function DailyDebriefContent() {
  const app = useApp()
  const M = MOCK
  const [lockOpen, setLockOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [planLocked, setPlanLocked] = useState(false)
  const [debriefSent, setDebriefSent] = useState(false)

  const debriefHeadline = "A strong day, *Jane*. Here's how it went."
  const parts = debriefHeadline.split(/(\*[^*]+\*)/g).filter(Boolean)

  return (
    <div className="anim-fade" style={{ padding: '48px 32px', maxWidth: 920, margin: '0 auto' }}>
      <div className="caption anim-fade-up" style={{ color: 'var(--idfc-red)', fontSize: 11 }}>TODAY, IN ONE BREATH</div>

      <h1 className="display-56 anim-fade-up" style={{ color: 'var(--text-primary)', marginTop: 20, animationDelay: '100ms' }}>
        {parts.map((p, i) =>
          p.startsWith('*') && p.endsWith('*')
            ? <span key={i} style={{ color: 'var(--idfc-red)', fontWeight: 500 }}>{p.slice(1, -1)}</span>
            : <span key={i}>{p}</span>
        )}
      </h1>

      {/* Stats */}
      <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 48, animationDelay: '200ms' }}>
        {M.debriefStats.map((s, i) => (
          <div key={s.label} style={{ padding: '8px 24px', borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div className="caption" style={{ fontSize: 11 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 36, fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginTop: 12 }}>{s.value}</div>
            {s.sub && <div className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 64, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--idfc-red)', opacity: 0.25 }} />
        {M.debriefTimeline.map((t, i) => (
          <div key={i} className="anim-fade-up" style={{ position: 'relative', paddingLeft: 40, paddingRight: 8, paddingTop: i === 0 ? 0 : 18, paddingBottom: 18, animationDelay: `${300 + i * 110}ms` }}>
            <div style={{ position: 'absolute', left: 1.5, top: i === 0 ? 6 : 24, width: 11, height: 11, borderRadius: 999, background: 'var(--bg-canvas)', border: '1.5px solid var(--idfc-red)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, minWidth: 0 }}>
                <div className="font-mono num" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{t.time}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{t.headline}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>{t.detail}</div>
                </div>
              </div>
              <div className="caption" style={{ flexShrink: 0, color: TONE_COLORS[t.tone] || 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>{t.outcome}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tomorrow's preview */}
      <div className="card anim-fade-up" style={{ padding: 24, marginTop: 56, borderTop: '2px solid var(--idfc-red)', animationDelay: '1000ms' }}>
        <div className="caption" style={{ color: 'var(--idfc-red)', fontSize: 11 }}>TOMORROW&apos;S PREVIEW</div>
        <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>
          3 member calls before lunch · Patel renewal docs land overnight · open-enrollment batch ready for your review at 09:15.
        </div>
      </div>

      {/* Actions */}
      <div className="anim-fade-up" style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12, animationDelay: '1100ms' }}>
        <button className="btn-primary" onClick={() => setLockOpen(true)}>
          {planLocked ? <><Icon name="Check" size={13} style={{ marginRight: 6 }} />Tomorrow&apos;s plan locked</> : 'Lock tomorrow\'s plan'}
        </button>
        <button className="btn-secondary" onClick={() => setSendOpen(true)}>
          {debriefSent ? <><Icon name="Check" size={13} style={{ marginRight: 6 }} />Debrief sent</> : 'Send debrief to manager'}
        </button>
      </div>

      <LockTomorrowBlade
        open={lockOpen}
        onClose={() => setLockOpen(false)}
        onLock={plan => { setPlanLocked(true); app.toast(`${plan.length} priorities locked for tomorrow`) }}
      />
      <SendDebriefBlade
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSend={payload => { setDebriefSent(true); app.toast(`Debrief sent to ${payload.to.split('@')[0]}`) }}
      />
    </div>
  )
}

export default function DailyDebriefPage() {
  return (
    <AppShell>
      <DailyDebriefContent />
    </AppShell>
  )
}
