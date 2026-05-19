'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import { ALL_ITEMS, BADGE_STYLE, type Badge } from '@/lib/auto-actions-data'

const TABS = [
  { id: 'summary',    label: 'Summary',           icon: 'LayoutDashboard' },
  { id: 'email',      label: 'Original Email',     icon: 'Mail' },
  { id: 'draft',      label: 'AI Draft',           icon: 'Sparkles' },
  { id: 'analysis',   label: 'AI Analysis',        icon: 'BrainCircuit' },
  { id: 'customer',   label: 'Customer Context',   icon: 'User' },
  { id: 'compliance', label: 'Compliance Check',   icon: 'ShieldCheck' },
  { id: 'audit',      label: 'Audit Trail',        icon: 'ScrollText' },
  { id: 'related',    label: 'Related Actions',    icon: 'GitBranch' },
] as const
type TabId = typeof TABS[number]['id']

function BadgePill({ badge, large }: { badge: Badge; large?: boolean }) {
  const s = BADGE_STYLE[badge] ?? BADGE_STYLE.DONE
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: large ? 28 : 22, padding: large ? '0 12px' : '0 8px',
      border: `1px solid ${s.border}`, borderRadius: 4,
      fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace",
      fontSize: large ? 11.5 : 10, fontWeight: 700, letterSpacing: '0.1em', color: s.color,
      whiteSpace: 'nowrap',
    }}>{badge}</span>
  )
}

function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', ...style }}>{children}</div>
}

function KVRow({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <Mono style={{ minWidth: 140, paddingTop: 2 }}>{k}</Mono>
      <span style={{ fontSize: 13.5, color: accent ?? 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{v}</span>
    </div>
  )
}

function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

function CheckItem({ text, pass }: { text: string; pass: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 18px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: pass ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon name={pass ? 'Check' : 'X'} size={11} style={{ color: pass ? '#16a34a' : '#dc2626' }} />
      </div>
      <span style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{text}</span>
    </div>
  )
}

function AuditStep({ time, actor, action, detail, idx }: { time: string; actor: string; action: string; detail: string; idx: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: idx === 0 ? 'var(--idfc-red-bright)' : 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={actor === 'AI' ? 'Sparkles' : 'User'} size={13} style={{ color: idx === 0 ? '#fff' : 'var(--text-tertiary)' }} />
        </div>
        <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)', marginTop: 4 }} />
      </div>
      <div style={{ paddingBottom: 16, flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{action}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{time}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: actor === 'AI' ? 'var(--idfc-red-bright)' : 'var(--text-tertiary)', background: actor === 'AI' ? 'rgba(220,38,38,0.07)' : 'var(--bg-subtle)', padding: '1px 6px', borderRadius: 3 }}>{actor}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{detail}</div>
      </div>
    </div>
  )
}

function RelatedCard({ title, badge, time, detail }: { title: string; badge: Badge; time: string; detail: string }) {
  const s = BADGE_STYLE[badge]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, cursor: 'pointer' }} className="row-hover">
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)', minWidth: 44 }}>{time}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{detail}</div>
      </div>
      <span style={{ display: 'inline-flex', height: 20, padding: '0 7px', border: `1px solid ${s.border}`, borderRadius: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', color: s.color }}>{badge}</span>
      <Icon name="ChevronRight" size={13} style={{ color: 'var(--text-tertiary)' }} />
    </div>
  )
}

// ─── Per-item extended mock data ───────────────────────────────────────────────
// MOCK ONLY — no real PHI. Healthcare RCM auto-action detail.
function getExtended(id: string) {
  const base: Record<string, any> = {
    c0: {
      customer: { name: 'Baylor Scott & White', cif: 'PRV-BSW-002291', segment: 'Provider', tier: 'Priority', health: 91, aum: '$1.2M/yr', since: '2019', rm: 'Jane Doe', city: 'Dallas, TX', lastContact: '18 May 2026', openDeals: 4 },
      compliance: { overall: 'PASS', items: [
        { text: 'Provider is contracted (effective through Dec 2026)', pass: true },
        { text: 'HIPAA · minimum-necessary records handling confirmed', pass: true },
        { text: 'Email content scanned — no PHI exposure beyond approved records', pass: true },
        { text: 'CC to Coding team matches policy for records-request acknowledgements', pass: true },
        { text: 'Template used: T1-ACK-002 (approved, last reviewed Mar 2026)', pass: true },
        { text: 'Sent within SLA window (< 4 hrs of receipt)', pass: true },
      ]},
      audit: [
        { time: '04:01', actor: 'Email gateway', action: 'Inbound email received', detail: 'BSW Provider Relations sent operative report + pre-op notes for CLM-9047. Attachment count: 2.' },
        { time: '04:02', actor: 'AI', action: 'Document classification', detail: 'Attachments classified: operative report, pre-op notes. Completeness: 2/2 expected docs present.' },
        { time: '04:03', actor: 'AI', action: 'Intent detection', detail: 'Email intent: records submission. Tone: professional. Auto-reply threshold met.' },
        { time: '04:11', actor: 'AI', action: 'Draft composed', detail: 'Tier-1 acknowledgement drafted using template T1-ACK-002. Coding team CC added per policy.' },
        { time: '04:12', actor: 'AI', action: 'Email sent', detail: 'Reply dispatched via SMTP. Message ID: <msg-20260519-0412-BSW>. Delivery confirmed.' },
        { time: '04:12', actor: 'AI', action: 'EHR updated', detail: 'Epic: interaction logged on CLM-9047, status updated to "Records received", next action set for 22 May.' },
      ],
      related: [
        { title: 'Eligibility verification · Anderson, M.', badge: 'DONE' as Badge, time: '03:40', detail: 'Eligibility valid — no action needed before adjudication.' },
        { title: 'Prior auth check · PA-77310', badge: 'READY' as Badge, time: 'Yesterday', detail: 'Approved record on file — claim can proceed.' },
      ],
    },
    c1: {
      customer: { name: 'Lopez, S.', cif: 'MEM-LPZ-3318-2204', segment: 'Individual', tier: 'Standard', health: 67, aum: '$24K/yr', since: '2023', rm: 'Jane Doe', city: 'Houston, TX', lastContact: '17 May 2026', openDeals: 1 },
      compliance: { overall: 'HOLD', items: [
        { text: 'Member eligibility-compliant (valid until Aug 2026)', pass: true },
        { text: 'HIPAA · 3-ID verification completed earlier', pass: true },
        { text: 'Email references appeal timing — state-specific rules require human review', pass: false },
        { text: 'Appeal-window quote requires KB-AH-APL-002 verification before dispatch', pass: false },
        { text: 'Draft commits to appeal window — hold is required', pass: true },
        { text: 'Recommend human review before sending', pass: false },
      ]},
      audit: [
        { time: '05:31', actor: 'Email gateway', action: 'Inbound email received', detail: 'Sarah Lopez asked for appeal window on denied claim CLM-8902 (denial code N290).' },
        { time: '05:32', actor: 'AI', action: 'Intent detection', detail: 'Intent: appeal-window inquiry. Sensitivity flag triggered — TX-specific timing rule applies.' },
        { time: '05:33', actor: 'AI', action: 'KB lookup', detail: 'Pulled appeal-window article KB-AH-APL-002. State-specific timing must be confirmed by agent.' },
        { time: '05:45', actor: 'AI', action: 'Draft composed', detail: 'Empathetic reply drafted with appeal options. OOP-max context included.' },
        { time: '05:48', actor: 'AI', action: 'Held for review', detail: 'Auto-send suspended. Flagged for Jane Doe review at 09:15 briefing.' },
      ],
      related: [
        { title: 'Claim CLM-8902 · denied (N290)', badge: 'FLAGGED' as Badge, time: '2 days ago', detail: 'Denial received — appeal options to be confirmed.' },
        { title: 'Appeal letter template · TX', badge: 'READY' as Badge, time: 'Today', detail: 'Pre-filled appeal letter — needs your submit.' },
      ],
    },
    s2: {
      customer: { name: 'Patel, R.', cif: 'MEM-PTL-8831-4012', segment: 'Individual', tier: 'Standard', health: 43, aum: '$18K/yr', since: '2022', rm: 'Jane Doe', city: 'Plano, TX', lastContact: '15 May 2026', openDeals: 0 },
      compliance: { overall: 'RISK', items: [
        { text: 'Eligibility expiry: 21 May 2026 — breach in 48 hrs', pass: false },
        { text: 'Member unreachable for 4 consecutive days', pass: false },
        { text: 'SLA breach prediction: 94% confidence', pass: false },
        { text: 'Reassignment to Aaron Kim within policy', pass: true },
        { text: 'Escalation to Team Lead if no response by EOD', pass: true },
      ]},
      audit: [
        { time: '11 May', actor: 'AI', action: 'Eligibility countdown started', detail: 'Eligibility expiry detected 12 days out. Reminder sequence initiated.' },
        { time: '13 May', actor: 'AI', action: 'First reminder sent', detail: 'Email + SMS reminder dispatched. No response.' },
        { time: '15 May', actor: 'AI', action: 'Second reminder sent', detail: 'Follow-up email sent. Still no response.' },
        { time: '17 May', actor: 'AI', action: 'SLA risk flag raised', detail: 'Member unreachable for 4 days. 48-hr breach prediction triggered.' },
        { time: '06:02', actor: 'AI', action: 'Reassignment proposed', detail: 'Aaron Kim identified as best alternate agent (lower workload, faster close rate). Pending approval.' },
      ],
      related: [
        { title: 'Eligibility reminder #1 · Patel', badge: 'SENT' as Badge, time: '13 May', detail: 'First automated reminder — no response.' },
        { title: 'Eligibility reminder #2 · Patel', badge: 'SENT' as Badge, time: '15 May', detail: 'Second reminder sent — no response.' },
      ],
    },
    s3: {
      customer: { name: 'Garcia family', cif: 'MEM-GAR-7731-2204', segment: 'Family', tier: 'Priority', health: 88, aum: '$36K/yr', since: '2022', rm: 'Jane Doe', city: 'Houston, TX', lastContact: '17 May 2026', openDeals: 1 },
      compliance: { overall: 'PASS', items: [
        { text: 'Eligibility valid until Feb 2027', pass: true },
        { text: 'Member-event-triggered offer (deductible reset) — within outreach policy', pass: true },
        { text: 'No unsolicited solicitation — triggered by benefit event', pass: true },
        { text: 'Supplemental rider offer compliant with state regs', pass: true },
        { text: 'Prep pack generated — no PHI beyond minimum necessary', pass: true },
      ]},
      audit: [
        { time: '05:50', actor: 'AI', action: 'Deductible reset detected', detail: 'Family annual deductible reset 14 May. NBA engine triggered for supplemental rider offer.' },
        { time: '05:51', actor: 'AI', action: 'Member profile scored', detail: 'Supplemental fit score: 87/100. Family size + utilization pattern flagged as viable.' },
        { time: '05:55', actor: 'AI', action: 'Prep pack generated', detail: 'Supplemental fit brief: 5 slides, bilingual Spanish copy included.' },
        { time: '06:24', actor: 'AI', action: 'Opportunity flagged', detail: 'Flagged for Jane Doe action. Priority: high (4-week window).' },
      ],
      related: [
        { title: 'Benefits walk · Garcia family', badge: 'REVIEW' as Badge, time: '25 Apr', detail: 'Previous walk — family asked about pediatric coverage.' },
        { title: 'Q1 utilization summary · Garcia', badge: 'DONE' as Badge, time: '12 Apr', detail: 'Family is well under deductible.' },
      ],
    },
  }

  return base[id] ?? {
    customer: { name: 'Customer', cif: '—', segment: '—', tier: '—', health: 70, aum: '—', since: '—', rm: 'Jane Doe', city: '—', lastContact: '—', openDeals: 0 },
    compliance: { overall: 'PASS', items: [
      { text: 'Eligibility status verified', pass: true },
      { text: 'No HIPAA flags', pass: true },
      { text: 'Policy compliance confirmed', pass: true },
    ]},
    audit: [
      { time: 'Overnight', actor: 'AI', action: 'Action executed', detail: 'Automated action completed per configured rules.' },
    ],
    related: [],
  }
}

// ─── Main page ─────────────────────────────────────────────────────────────────
function ActionDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('summary')
  const item = ALL_ITEMS.find(a => a.id === id)

  if (!item) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Action not found.</div>
        <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => router.push('/auto-actions')}>Back</button>
      </div>
    )
  }

  const ai = item.ai
  const ext = getExtended(id)
  const reviewing = item.needsAction && item.badge !== 'APPROVED'
  const complianceColor = ext.compliance.overall === 'PASS' ? '#16a34a' : ext.compliance.overall === 'HOLD' ? '#d97706' : '#dc2626'

  return (
    <div className="anim-fade" style={{ padding: '36px 40px', maxWidth: 1180, margin: '0 auto' }}>

      {/* Back */}
      <button onClick={() => router.push('/auto-actions')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28, padding: 0 }}>
        <Icon name="ChevronLeft" size={13} /> Auto-actions
      </button>

      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 0, flexWrap: 'wrap' }}>
        <div>
          <Mono style={{ marginBottom: 10 }}>{ai.kind} · {item.time} CT · 10 May 2026</Mono>
          <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.15, margin: 0, color: 'var(--text-primary)', maxWidth: 760 }}>
            {item.title.replace(/\.$/, '')}
          </h1>
          <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>{item.detail}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 4 }}>
          <BadgePill badge={item.badge} large />
          {reviewing && <>
            <button className="btn-primary" style={{ height: 36 }}>Approve & send</button>
            <button className="btn-secondary" style={{ height: 36 }}>Dismiss</button>
          </>}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginTop: 28, marginBottom: 32, overflowX: 'auto', gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            borderBottom: tab === t.id ? '2px solid var(--idfc-red-bright)' : '2px solid transparent',
            marginBottom: -1, whiteSpace: 'nowrap', transition: 'color 120ms',
          }}>
            <Icon name={t.icon} size={13} style={{ color: tab === t.id ? 'var(--idfc-red-bright)' : 'var(--text-tertiary)', flexShrink: 0 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SUMMARY ── */}
      {tab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI insight banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.05) 0%,var(--bg-card) 65%)', border: '1px solid rgba(220,38,38,0.16)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--idfc-red-bright)' }} />
                <Mono style={{ color: 'var(--idfc-red-bright)' }}>Access Health AI · Action Summary</Mono>
              </div>
              <div style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                {ai.reasoning?.[0] ?? 'Automated action executed per configured rules.'} {ai.reasoning?.[1] ?? ''} {ai.reasoning?.[2] ? `${ai.reasoning[2]}.` : ''}
              </div>
            </div>

            {/* What was done */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <Mono>What the AI did</Mono>
              </div>
              {(ai.metaItems ?? []).map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '11px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', alignItems: 'baseline' }}>
                  <Mono style={{ minWidth: 140 }}>{m.k}</Mono>
                  <span style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{m.v}</span>
                </div>
              ))}
            </div>

            {/* Quick tabs pointer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { tab: 'email' as TabId, icon: 'Mail', label: 'Original Email', sub: 'View what was received' },
                { tab: 'draft' as TabId, icon: 'Sparkles', label: 'AI Draft', sub: 'Review the reply' },
                { tab: 'analysis' as TabId, icon: 'BrainCircuit', label: 'AI Analysis', sub: `${ai.confidence ?? '—'}% confidence score` },
              ].map(c => (
                <button key={c.tab} onClick={() => setTab(c.tab)} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color 120ms' }} className="row-hover">
                  <Icon name={c.icon} size={18} style={{ color: 'var(--idfc-red-bright)' }} />
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Status card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '16px 18px' }}>
              <Mono style={{ marginBottom: 12 }}>Status</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <KVRow k="Badge" v={item.badge} />
                <KVRow k="Time" v={`${item.time} CT · 10 May`} />
                <KVRow k="Compliance" v={ext.compliance.overall} accent={complianceColor} />
                {ai.confidence !== undefined && <KVRow k="Confidence" v={`${ai.confidence}%`} accent={ai.confidence >= 80 ? '#16a34a' : '#d97706'} />}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)' }}><Mono>Jump to</Mono></div>
              {TABS.slice(4).map((t, i) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: 13 }} className="row-hover">
                  <Icon name={t.icon} size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ flex: 1 }}>{t.label}</span>
                  <Icon name="ChevronRight" size={12} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ORIGINAL EMAIL ── */}
      {tab === 'email' && (
        <div style={{ maxWidth: 780 }}>
          {ai.originalEmail ? (
            <>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '16px 22px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ai.to && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>TO</Mono><span style={{ fontSize: 14 }}>{ai.to}</span></div>}
                {ai.cc && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>CC</Mono><span style={{ fontSize: 14 }}>{ai.cc}</span></div>}
                {ai.subject && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>SUBJECT</Mono><span style={{ fontSize: 14, fontWeight: 600 }}>{ai.subject}</span></div>}
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', padding: '24px 28px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>{ai.originalEmail}</pre>
            </>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-tertiary)', fontSize: 14 }}>
              No inbound email for this action — it was triggered by a system event.
            </div>
          )}
        </div>
      )}

      {/* ── AI DRAFT ── */}
      {tab === 'draft' && (
        <div style={{ maxWidth: 780 }}>
          {ai.aiDraft ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--idfc-red-bright)' }} />
                <Mono style={{ color: 'var(--idfc-red-bright)' }}>AI-drafted reply · {ai.kind}</Mono>
                {ai.confidence && <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: ai.confidence >= 80 ? '#16a34a' : '#d97706', fontWeight: 700 }}>{ai.confidence}% confidence</span>}
              </div>
              {(ai.to || ai.subject) && (
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ai.to && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>TO</Mono><span style={{ fontSize: 14 }}>{ai.to}</span></div>}
                  {ai.cc && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>CC</Mono><span style={{ fontSize: 14 }}>{ai.cc}</span></div>}
                  {ai.subject && <div style={{ display: 'flex', gap: 16 }}><Mono style={{ minWidth: 64 }}>SUBJECT</Mono><span style={{ fontSize: 14, fontWeight: 600 }}>{ai.subject}</span></div>}
                </div>
              )}
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', padding: '24px 28px', background: 'var(--bg-card)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 10 }}>{ai.aiDraft}</pre>
              {reviewing && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn-primary">Approve & send this draft</button>
                  <button className="btn-secondary">Edit before sending</button>
                  <button className="btn-secondary">Dismiss</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-tertiary)', fontSize: 14 }}>
              No email draft for this action — it was a system update.
            </div>
          )}
        </div>
      )}

      {/* ── AI ANALYSIS ── */}
      {tab === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ai.confidence !== undefined && (
              <div style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.05) 0%,var(--bg-card) 65%)', border: '1px solid rgba(220,38,38,0.16)', borderRadius: 10, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                  <svg width={96} height={96} viewBox="0 0 96 96">
                    <circle cx={48} cy={48} r={38} fill="none" stroke="var(--border-subtle)" strokeWidth={8} />
                    <circle cx={48} cy={48} r={38} fill="none"
                      stroke={ai.confidence >= 80 ? '#16a34a' : ai.confidence >= 60 ? '#d97706' : '#dc2626'}
                      strokeWidth={8}
                      strokeDasharray={`${(ai.confidence / 100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                      strokeLinecap="round" transform="rotate(-90 48 48)"
                    />
                    <text x={48} y={54} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--text-primary)">{ai.confidence}%</text>
                  </svg>
                </div>
                <div>
                  <Mono style={{ color: 'var(--idfc-red-bright)', marginBottom: 8 }}>AI Confidence Score</Mono>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {ai.confidence >= 85 ? 'High — safe to auto-send' : ai.confidence >= 65 ? 'Moderate — review recommended' : 'Low — requires your judgement'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Scored across 6 factors: customer history, tone, policy compliance, deal stage, recency, context.</div>
                </div>
              </div>
            )}

            <div>
              <Mono style={{ marginBottom: 12 }}>Factor scores</Mono>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 22px' }}>
                <ScoreBar label="Customer relationship strength" value={82} color="#16a34a" />
                <ScoreBar label="Tone & sentiment analysis" value={91} color="#16a34a" />
                <ScoreBar label="Policy compliance" value={ai.confidence && ai.confidence < 70 ? 55 : 95} color={ai.confidence && ai.confidence < 70 ? '#d97706' : '#16a34a'} />
                <ScoreBar label="Deal stage relevance" value={78} color="#16a34a" />
                <ScoreBar label="Response recency" value={88} color="#16a34a" />
                <ScoreBar label="Contextual match" value={ai.confidence ?? 80} color={ai.confidence && ai.confidence < 70 ? '#d97706' : '#16a34a'} />
              </div>
            </div>

            {ai.reasoning && (
              <div>
                <Mono style={{ marginBottom: 12 }}>Reasoning chain</Mono>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
                  {ai.reasoning.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Icon name="Check" size={11} style={{ color: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ai.deck && (
              <div>
                <Mono style={{ marginBottom: 12 }}>Auto-generated deck</Mono>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, cursor: 'pointer' }} className="row-hover">
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--idfc-red-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                      <rect width="26" height="26" fill="#8B1A1A"/>
                      <rect x="1.5" y="1.5" width="23" height="23" fill="white"/>
                      <rect x="3.5" y="3.5" width="19" height="19" fill="#8B1A1A"/>
                      <rect x="5.5" y="5.5" width="15" height="4" fill="white"/>
                      <rect x="5.5" y="11.5" width="10" height="3.5" fill="white"/>
                      <rect x="5.5" y="17" width="5" height="3.5" fill="white"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{ai.deck}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 3 }}>Click to preview · auto-generated by Access Health AI</div>
                  </div>
                  <Icon name="ChevronRight" size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '16px 18px' }}>
              <Mono style={{ marginBottom: 12 }}>Context</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <KVRow k="Time" v={`${item.time} CT`} />
                {(ai.metaItems ?? []).map((m, i) => <KVRow key={i} k={m.k} v={m.v} />)}
              </div>
            </div>
            {reviewing && (
              <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 10, padding: '16px 18px' }}>
                <Mono style={{ color: 'var(--idfc-red-bright)', marginBottom: 10 }}>Awaiting review</Mono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Approve & send</button>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Dismiss</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CUSTOMER CONTEXT ── */}
      {tab === 'customer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '20px 22px' }}>
              <Mono style={{ marginBottom: 16 }}>Customer profile</Mono>
              <KVRow k="Name" v={ext.customer.name} />
              <KVRow k="CIF ID" v={ext.customer.cif} />
              <KVRow k="Segment" v={ext.customer.segment} />
              <KVRow k="Tier" v={ext.customer.tier} />
              <KVRow k="City" v={ext.customer.city} />
              <KVRow k="Customer since" v={ext.customer.since} />
              <KVRow k="Assigned RM" v={ext.customer.rm} />
              <KVRow k="Last contact" v={ext.customer.lastContact} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '20px 22px' }}>
              <Mono style={{ marginBottom: 16 }}>Financial snapshot</Mono>
              <KVRow k="AUM" v={ext.customer.aum} />
              <KVRow k="Health score" v={String(ext.customer.health)} accent={ext.customer.health >= 80 ? '#16a34a' : ext.customer.health >= 60 ? '#d97706' : '#dc2626'} />
              <KVRow k="Open deals" v={String(ext.customer.openDeals)} />
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 22px' }}>
              <Mono style={{ marginBottom: 14 }}>Relationship health</Mono>
              <ScoreBar label="Overall health" value={ext.customer.health} color={ext.customer.health >= 80 ? '#16a34a' : ext.customer.health >= 60 ? '#d97706' : '#dc2626'} />
              <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <button onClick={() => router.push(`/portfolio/${ALL_ITEMS.find(a => a.id === id)?.which === 'c' ? '1' : '2'}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--idfc-red-bright)', fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", padding: 0 }}>View full customer page →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLIANCE CHECK ── */}
      {tab === 'compliance' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: ext.compliance.overall === 'PASS' ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.05)', border: `1px solid ${complianceColor}30`, borderRadius: 10, marginBottom: 20 }}>
            <Icon name={ext.compliance.overall === 'PASS' ? 'ShieldCheck' : 'AlertTriangle'} size={24} style={{ color: complianceColor }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: complianceColor }}>{ext.compliance.overall === 'PASS' ? 'All checks passed' : ext.compliance.overall === 'HOLD' ? 'Action held — review required' : 'Risk detected — immediate review'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{ext.compliance.items.length} compliance checks run by Access Health AI</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)' }}><Mono>Check results</Mono></div>
            {ext.compliance.items.map((c: any, i: number) => <CheckItem key={i} text={c.text} pass={c.pass} />)}
          </div>
        </div>
      )}

      {/* ── AUDIT TRAIL ── */}
      {tab === 'audit' && (
        <div style={{ maxWidth: 700 }}>
          <Mono style={{ marginBottom: 20 }}>Complete step-by-step log · {ext.audit.length} events</Mono>
          <div style={{ paddingLeft: 8 }}>
            {ext.audit.map((step: any, i: number) => (
              <AuditStep key={i} idx={i} time={step.time} actor={step.actor} action={step.action} detail={step.detail} />
            ))}
          </div>
        </div>
      )}

      {/* ── RELATED ACTIONS ── */}
      {tab === 'related' && (
        <div style={{ maxWidth: 700 }}>
          <Mono style={{ marginBottom: 16 }}>Actions involving the same customer or workflow</Mono>
          {ext.related.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ext.related.map((r: any, i: number) => (
                <RelatedCard key={i} title={r.title} badge={r.badge} time={r.time} detail={r.detail} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-tertiary)', fontSize: 14 }}>No related actions found.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ActionDetailPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')
  return (
    <AppShell>
      <ActionDetailContent id={id} />
    </AppShell>
  )
}
