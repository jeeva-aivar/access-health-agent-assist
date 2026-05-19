'use client'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { StatusDot } from '@/components/ui/StatusDot'
import { useApp } from '@/lib/app-context'
import { MOCK } from '@/lib/mock-data'

function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="density-card" style={{ padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
      <div className="caption" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      <div className="num" style={{ fontSize: 32, fontWeight: 600, marginTop: 10, color: accent || 'var(--text-primary)', letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-tertiary)' }}>{sub}</div>}
    </div>
  )
}

const SIGNALS = [
  { text: "Garcia family · deductible reset 14 May",       sub: "High signal moment — supplemental rider window", href: '/priority-stack', color: '#d97706' },
  { text: "Iyer, M. · prior-auth call at 09:30",       sub: "Prep brief ready — review before call",         href: '/voice-intelligence', color: '#2563eb' },
  { text: "Verma, R. · eligibility overdue — SLA risk",     sub: "Eligibility refresh needed — breach in 48 hrs",  href: '/auto-actions', color: '#dc2626' },
  { text: "Davis & Park · provider-rate amendment pending", sub: "Contract update needed — close-of-quarter",      href: '/portfolio', color: '#7c3aed' },
]

function MorningBriefingContent() {
  const app = useApp()
  const router = useRouter()
  const M = MOCK

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 32 }}>
        <div className="h2" style={{ color: 'var(--text-primary)' }}>Good morning, Afsheen.</div>
        <div className="body-lg" style={{ color: 'var(--text-secondary)', maxWidth: 720, marginTop: 8 }}>
          Here's your brief for today — priorities, signals, and actions that need your attention. Actions already completed by AI and the ones that need your review are listed below.
        </div>
      </div>

      {/* Stats */}
      <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40, animationDelay: '60ms' }}>
        {M.briefingStats.map(s => <StatTile key={s.label} {...s} />)}
      </div>

      {/* Signals */}
      <div className="anim-fade-up" style={{ marginBottom: 32, animationDelay: '100ms' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>SIGNALS · AI RECOMMENDS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {SIGNALS.map(sig => (
            <div
              key={sig.href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${sig.color}`, borderRadius: 8, padding: '10px 14px', minHeight: 56 }}
            >
              <Icon name="Bot" size={14} style={{ color: sig.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sig.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sig.sub}</div>
              </div>
              <button
                onClick={() => router.push(sig.href)}
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 5, border: `1px solid ${sig.color}`, background: 'transparent', color: sig.color, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
              >Use Agent →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Body grid */}
      <div className="anim-fade-up briefing-grid" style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, animationDelay: '120ms' }}>
        {/* Left: priorities */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="caption" style={{ fontSize: 11 }}>TODAY&apos;S PRIORITIES · RANKED &amp; REASONED</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Scored by deal value × urgency × sentiment risk</div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {app.state.priorities.map((p) => (
              <div
                key={p.n}
                className="row-divider row-hover density-row"
                onClick={() => { app.openPriority(p.n); app.navigate('priority') }}
                style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1.1fr 200px 24px', alignItems: 'center', gap: 16, padding: '20px 22px', cursor: 'pointer' }}
              >
                <div className="font-mono num" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.time}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.customer}
                    {p.headline && <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}> · {p.headline}</span>}
                  </div>
                  <div className="body" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    {p.context.split('.')[0]}.
                  </div>
                </div>
                <div>
                  <div className="caption" style={{ fontSize: 10.5 }}>WHY NOW</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                    {p.context.split('.').slice(1).join('.').trim() || p.context}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', paddingRight: 8 }}>
                  <span className={'badge ' + (p.whyTone === 'danger' ? 'badge-danger' : p.whyTone === 'success' ? 'badge-success' : 'badge-info')}>{p.why}</span>
                  <StatusDot tone={p.statusTone} label={p.status} />
                </div>
                <Icon name="ChevronRight" size={16} style={{ opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Right: sidebar cards */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Manager alignment */}
          <div className="card density-card anim-fade-up" style={{ padding: 22, animationDelay: '160ms' }}>
            <div className="caption" style={{ fontSize: 11 }}>MANAGER ALIGNMENT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>MR</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{M.manager.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{M.manager.role}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.5, fontWeight: 500, color: 'var(--text-primary)', borderLeft: '2px solid var(--idfc-red)', paddingLeft: 14 }}>
              &ldquo;{M.manager.quote}&rdquo;
            </div>
            <div style={{ marginTop: 16 }}>
              <StatusDot tone="info" label={M.manager.aligned} />
            </div>
          </div>

          {/* Verma eligibility card */}
          {!app.state.kapoorReassigned && (
            <div className="card density-card anim-fade-up" style={{ padding: 22, animationDelay: '200ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot dot-warning" />
                <span className="caption" style={{ fontSize: 11 }}>AWAITING REVIEW</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>SLA risk · Verma eligibility</div>
              <div className="body" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>48-hr breach predicted. Suggesting reassignment to Aaron Kim.</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ height: 32, fontSize: 13 }} onClick={() => { app.setKapoor(true); app.toast('Verma eligibility reassigned to Aaron'); app.bumpPoints(50) }}>
                  Approve reassign
                </button>
                <button className="btn-ghost" onClick={() => { app.setKapoor(true); app.toast('Dismissed · rule learned') }}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
          {app.state.kapoorReassigned && (
            <div className="card density-card anim-fade" style={{ padding: 22, opacity: 0.75 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot dot-success" />
                <span className="caption" style={{ fontSize: 11, color: 'var(--success)' }}>HANDLED</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Verma eligibility · reassigned to Aaron</div>
              <div className="body" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Breach window cleared. Aaron acknowledged at 06:48.</div>
            </div>
          )}

          {/* Tomorrow preview */}
          <div className="card density-card anim-fade-up" style={{ padding: 22, animationDelay: '240ms' }}>
            <div className="caption" style={{ fontSize: 11 }}>TOMORROW&apos;S PREVIEW</div>
            <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icon name="PhoneCall" size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2 }} />
                <span className="body" style={{ color: 'var(--text-secondary)' }}>3 customer calls before lunch</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icon name="FileText" size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2 }} />
                <span className="body" style={{ color: 'var(--text-secondary)' }}>Verma renewal docs land overnight</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icon name="Sparkles" size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2 }} />
                <span className="body" style={{ color: 'var(--text-secondary)' }}>Open-enrollment outreach batch ready for review at 09:15</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function MorningBriefingPage() {
  return (
    <AppShell>
      <MorningBriefingContent />
    </AppShell>
  )
}
