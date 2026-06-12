'use client'
import { useState, useEffect, useMemo } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { StatusDot } from '@/components/ui/StatusDot'
import { useApp } from '@/lib/app-context'

// MOCK ONLY — no real PHI. Healthcare RCM tasks for Live assist demo.
const STACK_TASKS = [
  // AI priority
  { id: 'ai-01', time: '09:30', source: 'ai',  customer: 'Iyer, M.',     title: 'Prior-auth follow-up · CLM-9047',  tag: 'HIGHEST RISK', tagTone: 'danger',  status: 'PREP READY', statusTone: 'warning', duration: '30m', channel: 'Call',      value: '$3,420' },
  { id: 'ai-02', time: '11:00', source: 'ai',  customer: 'Denials Committee', title: 'Quarterly review · your call',    tag: 'DECISION',     tagTone: 'info',    status: 'ALIGNED',    statusTone: 'info',    duration: '60m', channel: 'In-person', value: '—' },
  { id: 'ai-03', time: '15:00', source: 'ai',  customer: 'Q4 caseload',      title: 'Review & sign-off',                tag: '90 MIN SAVED', tagTone: 'success', status: 'DRAFTED',    statusTone: 'warning', duration: '45m', channel: 'Doc',       value: '—' },
  { id: 'ai-04', time: '16:00', source: 'ai',  customer: 'Garcia family',    title: 'Benefits walk-through · deductible reset', tag: 'NBA',  tagTone: 'info',    status: 'SURFACED',   statusTone: 'info',    duration: '30m', channel: 'Call',      value: '4-wk window' },
  // Manager-assigned
  { id: 'mg-01', time: '08:45', source: 'mgr', customer: 'Hub huddle',       title: 'Stand-up · brief Michael',          tag: 'DAILY',       tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '15m', channel: 'In-person', value: '—',       assignedBy: 'Michael Reed' },
  { id: 'mg-02', time: '10:15', source: 'mgr', customer: 'Baylor Scott & White', title: 'Provider records follow-up',    tag: 'PRIORITY',    tagTone: 'danger',  status: 'OPEN',       statusTone: 'warning', duration: '20m', channel: 'Call',      value: '$85K',    assignedBy: 'Michael Reed' },
  { id: 'mg-03', time: '12:00', source: 'mgr', customer: 'Sharma · denial',   title: 'Appeal-window draft · sign off',    tag: 'REVIEW',      tagTone: 'info',    status: 'DRAFTED',    statusTone: 'warning', duration: '10m', channel: 'Email',     value: '—',       assignedBy: 'Michael Reed' },
  { id: 'mg-04', time: '13:30', source: 'mgr', customer: 'Member outreach',  title: 'Open-enrollment campaign approval', tag: 'MARKETING',   tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '20m', channel: 'Doc',       value: '—',       assignedBy: 'Michael Reed' },
  { id: 'mg-05', time: '14:30', source: 'mgr', customer: 'Sharma group plan', title: 'Onboarding checklist · escalation', tag: 'ESCALATED', tagTone: 'danger',  status: 'OPEN',       statusTone: 'warning', duration: '30m', channel: 'Doc',       value: '$210K', assignedBy: 'Michael Reed' },
  { id: 'mg-06', time: '17:30', source: 'mgr', customer: 'Michael Reed',     title: 'EOD debrief · 1:1',                tag: '1:1',         tagTone: 'info',    status: 'OPEN',       statusTone: 'info',    duration: '20m', channel: 'In-person', value: '—',       assignedBy: 'Michael Reed' },
  // Routine / planned
  { id: 'rm-01', time: '07:30', source: 'ai',  customer: 'Inbox triage',     title: 'Clear overnight queue',             tag: 'ROUTINE',    tagTone: 'info',    status: 'DONE',       statusTone: 'success', duration: '20m', channel: 'Email',     value: '—' },
  { id: 'rm-02', time: '10:30', source: 'ai',  customer: 'Verma, R.',        title: 'Eligibility refresh · check-in',    tag: 'ROUTINE',    tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '15m', channel: 'Call',      value: '—' },
  { id: 'rm-03', time: '11:45', source: 'ai',  customer: 'Vera Carter',      title: 'Confirm callback window',           tag: 'ROUTINE',    tagTone: 'info',    status: 'DRAFTED',    statusTone: 'warning', duration: '10m', channel: 'SMS',       value: '—' },
  { id: 'rm-04', time: '12:30', source: 'ai',  customer: 'Iyer, L.',         title: 'Plan renewal · confirm tier',       tag: 'ROUTINE',    tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '15m', channel: 'Email',     value: '$418/mo' },
  { id: 'rm-05', time: '14:00', source: 'ai',  customer: 'Singh, H.',        title: 'Eligibility refresh · call',        tag: 'ELIGIBILITY', tagTone: 'info',   status: 'OPEN',       statusTone: 'warning', duration: '20m', channel: 'Call',      value: '—' },
  { id: 'rm-06', time: '15:45', source: 'ai',  customer: 'Reyes Group',      title: 'Cross-sell · supplemental rider',   tag: 'NBA',        tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '20m', channel: 'Call',      value: '$60/mo' },
  { id: 'rm-07', time: '16:45', source: 'ai',  customer: 'Davis & Park',     title: 'Provider-rate amendment window',    tag: 'TIME-BOXED', tagTone: 'danger',  status: 'OPEN',       statusTone: 'warning', duration: '15m', channel: 'Call',      value: '$480K' },
  // Ad-hoc
  { id: 'ad-01', time: '09:05', source: 'ad',  customer: 'Robert Gupta',     title: 'Urgent: claim denied at point-of-care', tag: 'URGENT',  tagTone: 'danger',  status: 'NEW',        statusTone: 'danger',  duration: '10m', channel: 'Call',      value: '—' },
  { id: 'ad-02', time: '10:50', source: 'ad',  customer: 'Anand & Sons',     title: 'Walk-in · dependent enrollment',    tag: 'WALK-IN',    tagTone: 'info',    status: 'NEW',        statusTone: 'danger',  duration: '20m', channel: 'In-person', value: '—' },
  { id: 'ad-03', time: '11:20', source: 'ad',  customer: 'Kavita Sheth',     title: 'EOB dispute · last 3 claims',       tag: 'DISPUTE',    tagTone: 'danger',  status: 'OPEN',       statusTone: 'warning', duration: '20m', channel: 'Email',     value: '—' },
  { id: 'ad-04', time: '13:00', source: 'ad',  customer: 'Internal verification', title: 'Verification ref · new member', tag: 'INTERNAL', tagTone: 'info',    status: 'OPEN',       statusTone: 'warning', duration: '10m', channel: 'Call',      value: '—' },
  { id: 'ad-05', time: '15:20', source: 'ad',  customer: 'Compliance',       title: 'HIPAA audit · Reyes Group log',     tag: 'COMPLIANCE', tagTone: 'danger',  status: 'DRAFTED',    statusTone: 'warning', duration: '15m', channel: 'Doc',       value: '—' },
  { id: 'ad-06', time: '16:30', source: 'ad',  customer: 'Operations',       title: 'EFT reconciliation exception',      tag: 'OPS',        tagTone: 'info',    status: 'DONE',       statusTone: 'success', duration: '10m', channel: 'Email',     value: '$3,420' },
]

type Task = typeof STACK_TASKS[number] & { assignedBy?: string }

const SOURCE_META: Record<string, { label: string; pill: { bg: string; fg: string; bd: string } }> = {
  ai:  { label: 'AI',    pill: { bg: 'rgba(59,86,183,0.10)', fg: 'var(--ah-deep)',                bd: 'rgba(59,86,183,0.35)' } },
  mgr: { label: 'MGR',   pill: { bg: '#fbf5e8',               fg: '#8a6a30',                       bd: '#e6d2ad' } },
  ad:  { label: 'ADHOC', pill: { bg: 'var(--bg-subtle)',      fg: 'var(--text-secondary)',         bd: 'var(--border-default)' } },
}

function SourcePill({ source }: { source: string }) {
  const m = SOURCE_META[source] || SOURCE_META.ad
  return (
    <span className="font-mono" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 44, height: 18, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
      background: m.pill.bg, color: m.pill.fg, border: `1px solid ${m.pill.bd}`,
      borderRadius: 3, padding: '0 6px',
    }}>{m.label}</span>
  )
}

function StackBlade({ task, onClose, onComplete }: { task: Task | null; onClose: () => void; onComplete: (id: string) => void }) {
  if (!task) return null
  const m = SOURCE_META[task.source] || SOURCE_META.ad
  const anyTask = task as Record<string, string>
  const sourceLabel = task.source === 'ai' ? 'AI Priority' : task.source === 'mgr' ? 'Assigned by ' + (anyTask.assignedBy || 'Manager') : 'Ad-hoc · surfaced today'

  return (
    <>
      <div onClick={onClose} className="anim-fade" style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,10,0.32)', zIndex: 50 }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '95vw',
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)',
        zIndex: 60, display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 32px -16px rgba(20,15,10,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SourcePill source={task.source} />
            <span className="caption" style={{ fontSize: 11 }}>{sourceLabel}</span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="X" size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div className="font-mono num" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{task.time} · {task.duration} · {task.channel}</div>
          <div className="h2" style={{ color: 'var(--text-primary)', marginTop: 8 }}>{task.customer}</div>
          <div className="body-lg" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{task.title}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <span className={'badge ' + (anyTask.tagTone === 'danger' ? 'badge-danger' : anyTask.tagTone === 'success' ? 'badge-success' : 'badge-info')}>{task.tag}</span>
            <StatusDot tone={anyTask.statusTone} label={task.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24, padding: 16, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
            <div><div className="caption" style={{ fontSize: 10 }}>VALUE</div><div className="num" style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{task.value}</div></div>
            <div><div className="caption" style={{ fontSize: 10 }}>DURATION</div><div className="num" style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{task.duration}</div></div>
            <div><div className="caption" style={{ fontSize: 10 }}>CHANNEL</div><div style={{ fontSize: 14, marginTop: 4 }}>{task.channel}</div></div>
            <div><div className="caption" style={{ fontSize: 10 }}>SOURCE</div><div style={{ fontSize: 14, marginTop: 4 }}>{m.label}{anyTask.assignedBy ? ` · ${anyTask.assignedBy}` : ''}</div></div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="caption" style={{ fontSize: 10.5, marginBottom: 12 }}>WHY NOW</div>
            <p className="body" style={{ color: 'var(--text-secondary)' }}>
              {task.source === 'ai'  ? 'Surfaced by Live assist based on case value, urgency, and member-sentiment signals from the last 14 days. Team Lead aligned this morning.' : ''}
              {task.source === 'mgr' ? `Assigned by ${anyTask.assignedBy || 'Team Lead'} during morning huddle. Tied to weekly OKR — flag back if scope creeps or you need cover.` : ''}
              {task.source === 'ad'  ? 'Surfaced after morning lock — ad-hoc. AI auto-routed based on customer history; rebalance other tasks if you accept.' : ''}
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="caption" style={{ fontSize: 10.5, marginBottom: 12 }}>SUGGESTED NEXT STEP</div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="Sparkles" size={14} style={{ color: 'var(--ah-emerald)' }} />
                </div>
                <div className="body" style={{ color: 'var(--text-primary)' }}>
                  Open prep pack — Patient 360, last 3 touches, talk-track auto-tuned to {task.customer.split(' ')[0]}&apos;s tone. ~90 sec to brief.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="caption" style={{ fontSize: 10.5, marginBottom: 12 }}>TIMELINE</div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { t: '06:30', d: 'Surfaced into stack' },
                { t: '07:12', d: 'Manager aligned · pick locked' },
                { t: task.time, d: 'Scheduled · this slot' },
              ].map((r, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span className="font-mono num" style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 48 }}>{r.t}</span>
                  <span className="body" style={{ color: 'var(--text-secondary)' }}>{r.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-primary" onClick={() => onComplete(task.id)}>{task.status === 'DONE' ? 'Re-open' : 'Mark complete'}</button>
            <button className="btn-secondary">Open prep pack</button>
            <button className="btn-ghost" style={{ marginLeft: 'auto' }}>Reschedule</button>
          </div>
        </div>
      </aside>
    </>
  )
}

function PriorityStackContent() {
  const app = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [completed, setCompleted] = useState(() => new Set(STACK_TASKS.filter(t => t.status === 'DONE').map(t => t.id)))

  useEffect(() => {
    if (app.state.focusPriority) {
      const pri = app.state.priorities.find(p => p.n === app.state.focusPriority)
      if (pri) {
        const t = STACK_TASKS.find(tt => tt.customer.startsWith(pri.customer.split(' ')[0]) && tt.source === 'ai')
        if (t) setOpenId(t.id)
      }
    }
  }, [app.state.focusPriority, app.state.priorities])

  const counts = useMemo(() => {
    const total = STACK_TASKS.length
    const ai  = STACK_TASKS.filter(t => t.source === 'ai').length
    const mgr = STACK_TASKS.filter(t => t.source === 'mgr').length
    const ad  = STACK_TASKS.filter(t => t.source === 'ad').length
    const done = STACK_TASKS.filter(t => completed.has(t.id)).length
    return { total, ai, mgr, ad, done }
  }, [completed])

  const filtered = useMemo(() => {
    return STACK_TASKS
      .filter(t => filter === 'all' ? true : filter === 'open' ? !completed.has(t.id) : t.source === filter)
      .filter(t => !query || (t.customer + ' ' + t.title).toLowerCase().includes(query.toLowerCase()))
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [filter, query, completed])

  const grouped = useMemo(() => {
    const bands = [
      { key: 'morning',   label: 'MORNING',   range: ['00:00', '12:00'] },
      { key: 'midday',    label: 'MIDDAY',     range: ['12:00', '14:30'] },
      { key: 'afternoon', label: 'AFTERNOON',  range: ['14:30', '17:00'] },
      { key: 'evening',   label: 'EVENING',    range: ['17:00', '23:59'] },
    ]
    return bands
      .map(b => ({ ...b, items: filtered.filter(t => t.time >= b.range[0] && t.time < b.range[1]) }))
      .filter(b => b.items.length)
  }, [filtered])

  const toggleComplete = (id: string) => {
    const willComplete = !completed.has(id)
    setCompleted(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
    const t = STACK_TASKS.find(tt => tt.id === id)
    if (t) {
      app.toast(willComplete ? `Completed · ${t.customer}` : `Re-opened · ${t.customer}`)
      if (willComplete) app.bumpPoints(100)
    }
  }

  const openTask = (STACK_TASKS as unknown as Task[]).find(t => t.id === openId) ?? null
  const progressPct = Math.round((counts.done / counts.total) * 100)

  const filters = [
    { id: 'all',  label: 'All',          count: counts.total },
    { id: 'open', label: 'Open',         count: counts.total - counts.done },
    { id: 'ai',   label: 'AI priority',  count: counts.ai },
    { id: 'mgr',  label: 'From manager', count: counts.mgr },
    { id: 'ad',   label: 'Ad-hoc',       count: counts.ad },
  ]

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="h1" style={{ color: 'var(--text-primary)' }}>Today&apos;s stack — {counts.total} tasks</div>
          <div className="body-lg" style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            <span className="num" style={{ color: 'var(--ah-deep)', fontWeight: 600 }}>{counts.ai}</span> AI priority ·{' '}
            <span className="num" style={{ color: '#8a6a30', fontWeight: 600 }}>{counts.mgr}</span> from Michael ·{' '}
            <span className="num" style={{ fontWeight: 600 }}>{counts.ad}</span> ad-hoc surfaced today
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div className="caption" style={{ fontSize: 10.5 }}>PROGRESS</div>
          <div style={{ width: 120, height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: progressPct + '%', height: '100%', background: 'var(--success)', transition: 'width 240ms ease' }} />
          </div>
          <div className="num font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{counts.done}/{counts.total}</div>
        </div>
      </div>

      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap', animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          {filters.map(f => (
            <button key={f.id} className={'tab ' + (filter === f.id ? 'active' : '')} onClick={() => setFilter(f.id)}>
              {f.label} <span className="num font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, minWidth: 240, marginLeft: 'auto' }}>
          <Icon name="Search" size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks…" style={{ background: 'transparent', border: 0, outline: 0, fontSize: 13, flex: 1, color: 'var(--text-primary)' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 56px 1.4fr 1fr 90px 130px 24px', alignItems: 'center', padding: '10px 20px', gap: 14, color: 'var(--text-tertiary)', fontSize: 10, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} className="caption">
          <div>TIME</div><div>SRC</div><div>CUSTOMER · TASK</div><div>TAG</div><div style={{ textAlign: 'right' }}>VALUE</div><div>STATUS</div><div></div>
        </div>

        {grouped.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No tasks match your filter.</div>
        )}

        {grouped.map((band, gi) => (
          <div key={band.key}>
            <div className="caption" style={{ padding: '8px 20px', background: 'var(--bg-canvas)', color: 'var(--text-tertiary)', fontSize: 10, borderTop: gi === 0 ? 'none' : '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
              {band.label} · {band.items.length}
            </div>
            {band.items.map((t) => {
              const anyT = t as Record<string, string>
              const isDone = completed.has(t.id)
              return (
                <div
                  key={t.id}
                  className="row-divider row-hover"
                  onClick={() => setOpenId(t.id)}
                  style={{ display: 'grid', gridTemplateColumns: '60px 56px 1.4fr 1fr 90px 130px 24px', gap: 14, alignItems: 'center', padding: '12px 20px', cursor: 'pointer', opacity: isDone ? 0.55 : 1 }}
                >
                  <div className="font-mono num" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.time}</div>
                  <div><SourcePill source={t.source} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.customer}</div>
                    <div className="body" style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span className={'badge ' + (anyT.tagTone === 'danger' ? 'badge-danger' : anyT.tagTone === 'success' ? 'badge-success' : 'badge-info')}>{t.tag}</span>
                    {anyT.assignedBy && <div className="caption" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>BY {anyT.assignedBy.split(' ')[0]}</div>}
                  </div>
                  <div className="num font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>{t.value}</div>
                  <div><StatusDot tone={isDone ? 'success' : anyT.statusTone} label={isDone ? 'DONE' : t.status} /></div>
                  <Icon name="ChevronRight" size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <StackBlade task={openTask} onClose={() => setOpenId(null)} onComplete={(id) => { toggleComplete(id); setOpenId(null) }} />
    </div>
  )
}

export default function PriorityStackPage() {
  return (
    <AppShell>
      <PriorityStackContent />
    </AppShell>
  )
}
