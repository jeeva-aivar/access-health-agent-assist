'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

// ─── Full case detail ─────────────────────────────────────────────────────────
// MOCK ONLY — no real PHI. Three healthcare RCM cases for the demo.
const CUSTOMER_DETAIL: Record<string, any> = {
  '1': {
    id: 1, name: 'Anderson, M.', segment: 'Individual', tier: 'Priority', cifId: 'MEM-ANH-2418-4421',
    rm: 'Jane Doe', since: '2020', city: 'Dallas, TX', industry: 'BCBS TX · PPO Gold',
    revenue: 4.2, aum: 8.4, health: 62, creditLimit: 12, utilisation: 71,
    npa: false, kycDue: '2026-08-15', phone: '+1 (214) 555-0188', email: 'm.anderson@example.com',
    tags: ['Prior-auth pending', 'Appeal-eligible', 'Eligibility-due-Q3'],
    scores: { engagement: 58, repayment: 81, growth: 44, loyalty: 72 },
    products: [
      { name: 'Active claim · CLM-9047-2206 (MRI lumbar)', value: '$3,420', status: 'active', util: 71 },
      { name: 'Prior auth · PA-77310',                     value: 'Approved', status: 'active', util: 100 },
      { name: 'Supplemental rider',                        value: 'Eligible', status: 'opportunity' },
      { name: 'HSA balance',                               value: '$1,840',  status: 'active', util: 40 },
    ],
    revenue12m: [3.1, 3.4, 3.6, 3.8, 3.9, 3.7, 4.0, 4.1, 4.2, 3.9, 4.1, 4.2],
    balanceTrend: [7.2, 7.5, 7.8, 8.1, 7.9, 8.0, 8.2, 8.3, 8.1, 8.2, 8.4, 8.4],
    conversations: [
      { date: '18 May 2026', type: 'Call', summary: 'Discussed appeal timeline for denied claim. Caller wants written confirmation — held for review.', sentiment: 'neutral', aiDraft: true },
      { date: '11 May 2026', type: 'Email', summary: 'Sent operative report request to Baylor Scott & White. ETA 14 business days.', sentiment: 'positive', aiDraft: false },
      { date: '04 May 2026', type: 'Call', summary: 'Eligibility verified. Plan benefits explained. Caller confirmed PCP and copay.', sentiment: 'positive', aiDraft: false },
      { date: '22 Apr 2026', type: 'Email', summary: 'EOB delivery for prior visit. No action required.', sentiment: 'neutral', aiDraft: true },
      { date: '14 Apr 2026', type: 'Call', summary: 'Caller raised appeal timeline question on N290 denial — sentiment cooling, escalated.', sentiment: 'negative', aiDraft: false },
    ],
    importantDates: [
      { label: 'Claim adjudication ETA',     date: '22 May 2026', urgency: 'high',   icon: 'AlertCircle' },
      { label: 'Eligibility refresh due',    date: '15 Aug 2026', urgency: 'medium', icon: 'FileText' },
      { label: 'Birthday',                   date: '14 Apr 2027', urgency: 'low',    icon: 'Gift' },
      { label: 'Annual deductible reset',    date: '01 Jan 2027', urgency: 'medium', icon: 'Calendar' },
      { label: 'Prior-auth expiry · PA-77310', date: '20 Oct 2026', urgency: 'medium', icon: 'Landmark' },
    ],
    preferences: {
      contact: 'SMS + Email (no calls before 9am CT)',
      decisionStyle: 'Self-directed — patient handles all decisions himself',
      language: 'English (US)',
      meetingPreference: 'Phone callback; in-person only if necessary',
      keyRelationships: ['Michael Anderson (member)', 'Lisa Anderson (spouse, joint)', 'Dr. L. Okafor (PCP)'],
      sensitivities: 'OOP costs sensitive — currently at OOP max for the plan year',
    },
    aiInsight: 'Anderson is a moderate-risk member showing declining health score (-8 pts this quarter) driven by an unresolved denied claim. Adjudication ETA 22 May is the critical near-term event. Supplemental rider is a fit given his deductible activity. Recommend SMS confirmation of appeal window before today\'s call.',
  },
  '2': {
    id: 2, name: 'Garcia family', segment: 'Family', tier: 'Priority', cifId: 'MEM-GAR-7731-2204',
    rm: 'Jane Doe', since: '2022', city: 'Houston, TX', industry: 'Access Health Family PPO',
    revenue: 2.8, aum: 12.1, health: 88, creditLimit: 5, utilisation: 12,
    npa: false, kycDue: '2027-02-10', phone: '+1 (713) 555-0212', email: 'l.garcia@example.com',
    tags: ['Family · 3 dependents', 'Supplemental fit', 'Bilingual'],
    scores: { engagement: 91, repayment: 96, growth: 82, loyalty: 88 },
    products: [
      { name: 'Family PPO · medical',            value: 'Active', status: 'active', util: null },
      { name: 'Pediatric vision + dental rider', value: 'Active', status: 'active', util: null },
      { name: 'HSA family',                      value: '$3,200', status: 'active', util: null },
      { name: 'Supplemental Family rider',       value: 'Eligible', status: 'opportunity' },
    ],
    revenue12m: [2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8],
    balanceTrend: [9.8, 10.2, 10.5, 10.8, 11.0, 11.2, 11.0, 11.3, 11.5, 11.8, 12.0, 12.1],
    conversations: [
      { date: '17 May 2026', type: 'Call', summary: 'Discussed annual deductible reset and supplemental rider fit. Member interested — needs brochure.', sentiment: 'positive', aiDraft: true },
      { date: '25 Apr 2026', type: 'Meeting', summary: 'Benefits walk-through for whole family. Pediatric coverage confirmed for two dependents.', sentiment: 'positive', aiDraft: false },
      { date: '12 Apr 2026', type: 'Email', summary: 'Q1 utilization summary sent. Family is well under deductible.', sentiment: 'positive', aiDraft: false },
    ],
    importantDates: [
      { label: 'Supplemental enrollment window', date: '14 May 2026', urgency: 'high',   icon: 'TrendingUp' },
      { label: 'Open-enrollment season',          date: '01 Nov 2026', urgency: 'high',   icon: 'Calendar' },
      { label: 'Anniversary — onboarding',        date: '05 Jun 2026', urgency: 'low',    icon: 'Gift' },
      { label: 'Eligibility refresh',             date: '10 Feb 2027', urgency: 'low',    icon: 'FileText' },
    ],
    preferences: {
      contact: 'SMS preferred; email for documents',
      decisionStyle: 'Joint decision — include both spouses in benefit selections',
      language: 'English / Spanish (prefers Spanish for letters)',
      meetingPreference: 'Phone or video; in-person only for benefits-fair events',
      keyRelationships: ['Luis Garcia (primary)', 'Maria Garcia (joint)', 'Three dependents (ages 8, 12, 16)'],
      sensitivities: 'Conservative tone — avoid pushy upsell language; confirm pediatric coverage continuity',
    },
    aiInsight: 'Garcia family is a high-engagement, high-loyalty member. The deductible reset window (14 May) is the most time-sensitive supplemental-rider opportunity. Recommend bilingual Spanish brochure plus SMS reminder. Also a referral source — 2 families introduced in last 12 months.',
  },
  '9': {
    id: 9, name: 'Davis & Park', segment: 'Provider', tier: 'Priority', cifId: 'PRV-DPK-9124-0006',
    rm: 'Jane Doe', since: '2018', city: 'Frisco, TX', industry: 'Orthopedic Group · 14 providers',
    revenue: 5.2, aum: 18.4, health: 95, creditLimit: 20, utilisation: 8,
    npa: false, kycDue: '2027-06-30', phone: '+1 (469) 555-0177', email: 'contracts@davispark.example',
    tags: ['Contracted provider', 'High-volume', 'Board-level relationship'],
    scores: { engagement: 97, repayment: 98, growth: 92, loyalty: 95 },
    products: [
      { name: 'Provider contract · 2026',         value: '$480K/yr', status: 'active', util: null },
      { name: 'Fee-for-service schedule',         value: 'Tier A',   status: 'active', util: 20 },
      { name: 'Value-based bonus pool',           value: '$42K accrued', status: 'active', util: null },
      { name: 'Telemed expansion (out-of-network)', value: 'Eligible', status: 'opportunity' },
    ],
    revenue12m: [4.1, 4.3, 4.5, 4.7, 4.8, 4.9, 5.0, 5.1, 5.0, 5.1, 5.2, 5.2],
    balanceTrend: [14.2, 15.0, 15.6, 16.1, 16.5, 17.0, 17.2, 17.5, 17.8, 18.0, 18.2, 18.4],
    conversations: [
      { date: '15 May 2026', type: 'Meeting', summary: 'Q4 contract review. Claims throughput steady. Discussed expanding telemed.', sentiment: 'positive', aiDraft: false },
      { date: '02 May 2026', type: 'Email', summary: 'Telemed expansion brochure sent. Practice manager reviewing with board.', sentiment: 'positive', aiDraft: true },
    ],
    importantDates: [
      { label: 'Contract amendment review (Q2)', date: '30 Jun 2026', urgency: 'medium', icon: 'TrendingUp' },
      { label: 'Bonus pool true-up',             date: '15 Aug 2026', urgency: 'medium', icon: 'Landmark' },
      { label: 'Onboarding anniversary',         date: '10 Jun 2026', urgency: 'low',    icon: 'Gift' },
    ],
    preferences: {
      contact: 'Only through practice manager (Anita) — 9am–6pm CT weekdays',
      decisionStyle: 'Board-driven, data-first — prepare a one-page summary always',
      language: 'English only',
      meetingPreference: 'Their Frisco office or Access Health Dallas Hub lounge',
      keyRelationships: ['Dr. Nina Davis (managing partner)', 'Dr. Sam Park (partner)', 'Anita Patel (practice manager)'],
      sensitivities: 'Sensitive about reimbursement-delay metrics; very protective of practice operational data',
    },
    aiInsight: 'Davis & Park is the highest health score in your caseload (95). No immediate risks. Focus: telemed expansion — strong cross-sell potential. Contract amendment window opens June — begin redline conversation by May 30.',
  },
}

// Fallback for cases without full detail
function getFallback(id: string, name: string): any {
  return {
    id, name, segment: 'Individual', tier: 'Standard', cifId: `MEM-${id}-DEMO`,
    rm: 'Jane Doe', since: '2022', city: 'Dallas, TX', industry: 'Access Health Standard',
    revenue: 2.0, aum: 4.0, health: 70, creditLimit: 6, utilisation: 55,
    npa: false, kycDue: '2026-12-01', phone: '+1 (214) 555-0100', email: 'contact@example.com',
    tags: ['Standard'],
    scores: { engagement: 68, repayment: 75, growth: 60, loyalty: 70 },
    products: [
      { name: 'Active plan',          value: 'PPO',  status: 'active', util: 55 },
      { name: 'Supplemental rider',   value: 'None', status: 'opportunity' },
    ],
    revenue12m: [1.6, 1.7, 1.8, 1.9, 2.0, 1.9, 2.0, 2.1, 2.0, 2.0, 2.0, 2.0],
    balanceTrend: [3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 4.0, 4.0, 3.9, 4.0, 4.0, 4.0],
    conversations: [
      { date: '11 May 2026', type: 'Call', summary: 'Routine check-in. No immediate concerns flagged.', sentiment: 'neutral', aiDraft: false },
    ],
    importantDates: [
      { label: 'Eligibility refresh', date: '01 Dec 2026', urgency: 'medium', icon: 'FileText' },
    ],
    preferences: {
      contact: 'Email preferred',
      decisionStyle: 'Self-directed',
      language: 'English',
      meetingPreference: 'Phone',
      keyRelationships: ['Member (primary)'],
      sensitivities: 'None flagged',
    },
    aiInsight: 'Stable case. No immediate risks or opportunities flagged. Maintain regular check-in cadence.',
  }
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']

function MiniBarChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
        {data.map((v, i) => {
          const h = max === min ? 50 : Math.round(((v - min) / (max - min)) * 44) + 8
          const isLast = i === data.length - 1
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: h, background: isLast ? color : `${color}55`, borderRadius: '3px 3px 0 0', position: 'relative' }}>
                {isLast && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: 8.5, fontWeight: 600, color, whiteSpace: 'nowrap', marginBottom: 2 }}>{v}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
        {MONTHS.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{m}</div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ─── Radar / score ring ───────────────────────────────────────────────────────
function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 22, circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={58} height={58} viewBox="0 0 58 58">
        <circle cx={29} cy={29} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={5} />
        <circle cx={29} cy={29} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 29 29)" />
        <text x={29} y={33} textAnchor="middle" fill="var(--text-primary)" fontSize={11} fontWeight={600}>{value}</text>
      </svg>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

// ─── Sentiment dot ────────────────────────────────────────────────────────────
const SENTIMENT_COLOR: Record<string, string> = { positive: '#16a34a', neutral: '#c49e62', negative: '#dc2626' }
const TYPE_ICON: Record<string, string> = { Call: 'Phone', Email: 'Mail', Meeting: 'Users' }

// ─── Health bar ──────────────────────────────────────────────────────────────
function HealthBar({ val, wide }: { val: number; wide?: boolean }) {
  const color = val >= 80 ? '#16a34a' : val >= 60 ? '#c49e62' : '#dc2626'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: wide ? 120 : 64, height: 6, borderRadius: 999, background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ width: `${val}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>{val}</span>
    </div>
  )
}

// ─── Urgency badge ────────────────────────────────────────────────────────────
const URGENCY_STYLE: Record<string, any> = {
  high: { bg: 'rgba(220,38,38,0.08)', color: '#b91c1c' },
  medium: { bg: 'rgba(196,158,98,0.12)', color: '#92400e' },
  low: { bg: 'var(--bg-subtle)', color: 'var(--text-tertiary)' },
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Conversations', 'Products', 'Preferences', 'Dates']

function CustomerDetailContent({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState('Overview')
  const c = CUSTOMER_DETAIL[customerId] ?? getFallback(customerId, `Customer #${customerId}`)

  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Back nav */}
      <button
        onClick={() => router.push('/portfolio')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24, padding: 0 }}
      >
        <Icon name="ChevronLeft" size={13} />
        Portfolio
      </button>

      {/* Hero row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            {c.cifId} · {c.segment} · {c.tier} · {c.city}
          </div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1.1, margin: 0, color: 'var(--text-primary)' }}>
            {c.name}
          </h1>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {c.tags.map((t: string) => (
              <span key={t} style={{ display: 'inline-flex', height: 20, padding: '0 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--bg-subtle)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'inherit' }}>
            <Icon name="Phone" size={13} /> Call
          </a>
          <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'inherit' }}>
            <Icon name="Mail" size={13} /> Email
          </a>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--idfc-red-bright)', fontSize: 13, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
            <Icon name="Plus" size={13} /> Log interaction
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 28, borderTop: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
        {[
          { label: 'Revenue (12m)', value: `$${(c.revenue * 100).toFixed(0)}K` },
          { label: 'Case value',    value: `$${(c.aum * 10).toFixed(0)}K` },
          { label: 'Plan limit',    value: `$${c.creditLimit}K` },
          { label: 'Utilisation',   value: `${c.utilisation}%` },
          { label: 'Member since',  value: c.since },
        ].map(k => (
          <div key={k.label} style={{ padding: '18px 22px', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div className="num" style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: 28 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
            borderBottom: tab === t ? '2px solid var(--idfc-red-bright)' : '2px solid transparent',
            marginBottom: -1, transition: 'color 120ms ease',
          }}>{t}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Insight */}
            <div style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.04) 0%,var(--bg-card) 60%)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--idfc-red-bright)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--idfc-red-bright)', fontWeight: 600 }}>Access Health AI · Relationship Insight</span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-primary)' }}>{c.aiInsight}</p>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 20px' }}>
                <MiniBarChart data={c.revenue12m} color="var(--ah-emerald)" label="Revenue $K · 12 months" />
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 20px' }}>
                <MiniBarChart data={c.balanceTrend} color="#2563eb" label="Case value $K · 12 months" />
              </div>
            </div>

            {/* Relationship scores */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>Relationship Scores</div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <ScoreRing label="Engagement" value={c.scores.engagement} color="#dc2626" />
                <ScoreRing label="Repayment" value={c.scores.repayment} color="#16a34a" />
                <ScoreRing label="Growth" value={c.scores.growth} color="#2563eb" />
                <ScoreRing label="Loyalty" value={c.scores.loyalty} color="#c49e62" />
              </div>
            </div>

            {/* Recent conversations (last 2) */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Recent Interactions</div>
                <button onClick={() => setTab('Conversations')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--idfc-red-bright)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>View all →</button>
              </div>
              {c.conversations.slice(0, 2).map((cv: any, i: number) => (
                <div key={i} style={{ padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', display: 'flex', gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={TYPE_ICON[cv.type] ?? 'MessageSquare'} size={14} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cv.type}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-tertiary)' }}>{cv.date}</span>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: SENTIMENT_COLOR[cv.sentiment], marginLeft: 'auto' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cv.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Health */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Relationship Health</div>
              <HealthBar val={c.health} wide />
              <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {c.health >= 80 ? 'Strong — no immediate action required.' : c.health >= 60 ? 'Moderate — monitor closely this week.' : 'At-risk — immediate attention needed.'}
              </div>
            </div>

            {/* Upcoming dates */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Important Dates</div>
              </div>
              {[...c.importantDates].sort((a: any, b: any) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]).map((d: any, i: number) => (
                <div key={i} style={{ padding: '12px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: URGENCY_STYLE[d.urgency].bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={d.icon} size={13} style={{ color: URGENCY_STYLE[d.urgency].color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{d.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: URGENCY_STYLE[d.urgency].color, marginTop: 2 }}>{d.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preferences summary */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Preferences</div>
              {[
                { label: 'Contact', value: c.preferences.contact },
                { label: 'Language', value: c.preferences.language },
                { label: 'Style', value: c.preferences.decisionStyle },
              ].map(p => (
                <div key={p.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45 }}>{p.value}</div>
                </div>
              ))}
              <button onClick={() => setTab('Preferences')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--idfc-red-bright)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', padding: 0 }}>View full profile →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONVERSATIONS ── */}
      {tab === 'Conversations' && (
        <div style={{ maxWidth: 820 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            {c.conversations.map((cv: any, i: number) => (
              <div key={i} style={{ padding: '20px 24px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', display: 'flex', gap: 16 }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={TYPE_ICON[cv.type] ?? 'MessageSquare'} size={15} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{cv.type}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>{cv.date}</span>
                    <span style={{ display: 'inline-flex', height: 18, padding: '0 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: `${SENTIMENT_COLOR[cv.sentiment]}18`, color: SENTIMENT_COLOR[cv.sentiment] }}>{cv.sentiment}</span>
                    {cv.aiDraft && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 18, padding: '0 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(220,38,38,0.07)', color: 'var(--idfc-red-bright)' }}>AI draft available</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{cv.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'Products' && (
        <div style={{ maxWidth: 860 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 130px 140px', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['Product', 'Value', 'Status', 'Utilisation'].map(h => (
                <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{h}</div>
              ))}
            </div>
            {c.products.map((p: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 130px 140px', padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', alignItems: 'center' }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                <div className="num" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.value}</div>
                <div>
                  <span style={{ display: 'inline-flex', height: 20, padding: '0 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: p.status === 'active' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.06)', color: p.status === 'active' ? '#166534' : 'var(--idfc-red-bright)' }}>{p.status}</span>
                </div>
                <div>
                  {p.util !== null && p.util !== undefined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 5, borderRadius: 999, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                        <div style={{ width: `${p.util}%`, height: '100%', background: p.util > 85 ? '#dc2626' : p.util > 60 ? '#c49e62' : '#16a34a', borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{p.util}%</span>
                    </div>
                  ) : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PREFERENCES ── */}
      {tab === 'Preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
          {[
            { label: 'Preferred Contact Method', value: c.preferences.contact },
            { label: 'Decision Making Style', value: c.preferences.decisionStyle },
            { label: 'Language Preference', value: c.preferences.language },
            { label: 'Meeting Preference', value: c.preferences.meetingPreference },
            { label: 'Sensitivities / Watch-outs', value: c.preferences.sensitivities },
          ].map(p => (
            <div key={p.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{p.value}</div>
            </div>
          ))}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '18px 22px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Key Relationships</div>
            {c.preferences.keyRelationships.map((r: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {r.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <span style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DATES ── */}
      {tab === 'Dates' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            {[...c.importantDates].sort((a: any, b: any) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]).map((d: any, i: number) => (
              <div key={i} style={{ padding: '18px 22px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: URGENCY_STYLE[d.urgency].bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={d.icon} size={16} style={{ color: URGENCY_STYLE[d.urgency].color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{d.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: URGENCY_STYLE[d.urgency].color }}>{d.date}</div>
                </div>
                <span style={{ display: 'inline-flex', height: 20, padding: '0 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: URGENCY_STYLE[d.urgency].bg, color: URGENCY_STYLE[d.urgency].color }}>{d.urgency}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CustomerDetailPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')
  return (
    <AppShell>
      <CustomerDetailContent customerId={id} />
    </AppShell>
  )
}
