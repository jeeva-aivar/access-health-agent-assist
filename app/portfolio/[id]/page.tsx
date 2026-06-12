'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'
import {
  CUSTOMERS, DEFAULT_CUSTOMER, findByMemberId, activeClaim,
  type Customer, type ClaimEntry, type PriorAuthEntry, type CallHistoryEntry, type Appointment,
} from '@/lib/customers'

// ─── Adapter: Customer (roster) → rich detail-view shape (UI-facing) ─────────
//
// The detail page UI was originally built against a different (banking) shape.
// Rather than rewriting the page, we adapt the typed Customer record into the
// shape the UI already consumes. Every field below is derived from the canonical
// Customer in lib/customers.ts — no data lives only on the detail page.

type DetailView = {
  cifId: string; segment: string; tier: string; city: string; name: string
  rm: string; since: string; industry: string
  phone: string; email: string
  revenue: number; aum: number; creditLimit: number; utilisation: number
  health: number
  tags: string[]
  scores: { engagement: number; repayment: number; growth: number; loyalty: number }
  products: { name: string; value: string; status: string; util?: number | null }[]
  revenue12m: number[]
  balanceTrend: number[]
  conversations: { type: 'Call'|'Email'|'Meeting'; date: string; summary: string; sentiment: 'positive'|'neutral'|'negative'; aiDraft: boolean }[]
  importantDates: { label: string; date: string; urgency: 'high'|'medium'|'low'; icon: string }[]
  preferences: {
    contact: string; decisionStyle: string; language: string;
    meetingPreference: string; keyRelationships: string[]; sensitivities: string;
  }
  aiInsight: string
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtShortDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split('-')
  return `${parseInt(d, 10)} ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
}

function sentimentFor(s: Customer['sentiment']): 'positive' | 'neutral' | 'negative' {
  if (s === 'positive') return 'positive'
  if (s === 'negative' || s === 'cooling') return 'negative'
  return 'neutral'
}

// Convert a CallHistoryEntry's channel into the Call/Email/Meeting bucket the
// UI's TYPE_ICON map understands.
function callKind(h: CallHistoryEntry): 'Call' | 'Email' | 'Meeting' {
  if (h.channel === 'email') return 'Email'
  if (h.channel === 'sms' || h.channel === 'portal') return 'Email'
  return 'Call'
}

function toDetailView(c: Customer): DetailView {
  const totalBilled = c.claims.reduce((s, cl) => s + cl.billed, 0)
  const totalPlanPaid = c.claims.reduce((s, cl) => s + cl.planPaid, 0)
  const paidClaims = c.claims.filter(cl => cl.status === 'paid').length
  const deniedClaims = c.claims.filter(cl => cl.status === 'denied').length
  const repaymentScore = c.claims.length === 0 ? 80 : Math.max(0, Math.round((paidClaims / c.claims.length) * 100))
  const denialPenalty = deniedClaims * 15
  const engagementScore = Math.max(20, Math.min(95, c.healthScore + (c.sentiment === 'positive' ? 8 : c.sentiment === 'negative' ? -10 : 0)))
  const growthScore = Math.max(40, Math.min(95, c.healthScore + (c.tier === 'Priority' ? 10 : 0) - denialPenalty / 2))
  const loyaltyYears = Math.max(1, new Date().getFullYear() - parseInt(c.memberSince.slice(0, 4), 10))
  const loyaltyScore = Math.min(95, 55 + loyaltyYears * 6)

  // Tags surfaced as quick chips on the hero — derived from member state.
  const tags: string[] = []
  if (c.tier === 'Priority') tags.push('Priority member')
  if (c.healthScore < 60) tags.push('At-risk')
  if (deniedClaims > 0) tags.push(`${deniedClaims} denied claim${deniedClaims > 1 ? 's' : ''}`)
  if ((c.creditBalance ?? 0) > 0) tags.push('Credit balance')
  if (c.language === 'es') tags.push('Spanish-preferred')
  if (c.priorAuths.some(pa => pa.status === 'pending')) tags.push('PA pending')
  if (c.flow === 'eligibility_priorauth') tags.push('Eligibility + PA')
  if (c.flow === 'billing_refund') tags.push('Billing flow')
  if (c.flow === 'claim_status') tags.push('Claim flow')
  if (tags.length === 0) tags.push('Standard member')

  // "Products" repurposed as the member's active plan + riders + claims.
  const products: DetailView['products'] = [
    { name: `Active plan · ${c.planName}`, value: 'Active', status: 'active', util: c.eligibility.deductibleTotal > 0 ? Math.round((c.eligibility.deductibleMet / c.eligibility.deductibleTotal) * 100) : null },
    ...c.priorAuths.map(pa => ({
      name: `Prior auth · ${pa.procedure}`,
      value: pa.id,
      status: pa.status === 'approved' ? 'active' : pa.status === 'pending' ? 'pending' : 'opportunity',
      util: null as number | null,
    })),
    ...(c.activeClaimId && activeClaim(c) ? [{
      name: `Active claim · ${activeClaim(c)!.serviceType}`,
      value: `$${activeClaim(c)!.billed.toFixed(0)}`,
      status: activeClaim(c)!.status === 'paid' ? 'active' : activeClaim(c)!.status === 'denied' ? 'opportunity' : 'pending',
      util: null as number | null,
    }] : []),
    ...((c.creditBalance ?? 0) > 0 ? [{ name: 'Refundable credit balance', value: `$${(c.creditBalance ?? 0).toFixed(2)}`, status: 'opportunity', util: null as number | null }] : []),
  ]

  // Synthesise 12-month revenue (claim billed amounts spread over the year).
  // Realistic enough to render a trend chart; not load-bearing.
  const baseMonthly = totalBilled > 0 ? totalBilled / 12 : 50
  const revenue12m = Array.from({ length: 12 }, (_, i) => Math.max(20, Math.round(baseMonthly * (0.7 + (i % 5) * 0.12))))
  const balanceTrend = Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(totalPlanPaid / 12 * (0.6 + (i % 4) * 0.18))))

  // Conversations: derived from callHistory (the canonical record).
  const conversations: DetailView['conversations'] = c.callHistory.map(h => ({
    type: callKind(h),
    date: fmtShortDate(h.date),
    summary: `${h.topic} — ${h.outcome}.`,
    sentiment: sentimentFor(h.sentiment),
    aiDraft: h.agent === 'system' || h.channel === 'email',
  }))

  // Important dates: roll claim deadlines, prior-auth expiries, appointments,
  // and eligibility refreshes into one sorted list.
  const importantDates: DetailView['importantDates'] = []
  for (const cl of c.claims) {
    if (cl.appealDeadline) importantDates.push({ label: `Appeal deadline · ${cl.id}`, date: fmtShortDate(cl.appealDeadline), urgency: 'high', icon: 'AlertCircle' })
  }
  for (const pa of c.priorAuths) {
    if (pa.expires) importantDates.push({ label: `Prior auth expires · ${pa.id}`, date: fmtShortDate(pa.expires), urgency: pa.status === 'pending' ? 'high' : 'medium', icon: 'FileText' })
  }
  for (const ap of c.appointments) {
    if (ap.status === 'scheduled') importantDates.push({ label: `${ap.type}`, date: fmtShortDate(ap.date), urgency: 'medium', icon: 'Calendar' })
  }
  if (c.eligibility.events[0]?.type === '270/271') {
    // No explicit renewal date in the roster; flag a generic refresh entry.
  }
  if (importantDates.length === 0) importantDates.push({ label: 'No upcoming items', date: '—', urgency: 'low', icon: 'Check' })

  // Preferences: derived from language + planType + notes.
  const lang = c.language === 'es' ? 'Spanish-preferred (EN OK for documents)' : c.language === 'tl' ? 'Tagalog' : 'English (US)'
  const contactPref = c.callHistory.some(h => h.channel === 'sms') ? 'SMS + Email · phone OK during business hours' : 'Email + phone · prefers callbacks'
  const decisionStyle = c.segment === 'Family' ? 'Joint with spouse — include both adults on policy decisions' : c.tier === 'Priority' ? 'Self-directed; values detail + written follow-up' : 'Self-directed; concise verbal explanation preferred'
  const meetingPref = c.callHistory.some(h => h.topic.toLowerCase().includes('in-person')) ? 'In-person at Dallas Hub when possible' : 'Phone or video; in-person only for benefits-fair events'
  const keyRel: string[] = [`${c.firstName} ${c.lastName} (member)`]
  if (c.segment === 'Family') keyRel.push('Spouse (joint policyholder)', 'Dependents on plan')
  keyRel.push(c.pcp.split(' (')[0])
  const sensitivities = c.notes || 'None flagged'

  const aiInsight = (() => {
    const status = c.healthScore >= 80 ? 'strong' : c.healthScore >= 60 ? 'moderate' : 'declining'
    const flowSuffix = c.flow === 'claim_status' ? `Active claim ${c.activeClaimId ?? '—'} is the focus.` : c.flow === 'eligibility_priorauth' ? 'Eligibility verification + prior-auth coordination is the focus.' : 'Billing/refund resolution is the focus.'
    const denialNote = deniedClaims > 1 ? ` ${deniedClaims} denials on file — investigate root-cause pattern before another resubmission.` : deniedClaims === 1 ? ' One denied claim — confirm correction path or appeal window with the member.' : ''
    return `${c.firstName} ${c.lastName} is a ${status} relationship (health ${c.healthScore}). ${flowSuffix}${denialNote} Note: ${c.notes}`
  })()

  return {
    cifId: c.memberId,
    segment: c.segment,
    tier: c.tier,
    city: `${c.city}, ${c.state}`,
    name: `${c.firstName} ${c.lastName}`,
    rm: 'Afsheen Mohammed',
    since: c.memberSince.slice(0, 4),
    industry: c.planName,
    phone: c.phoneDisplay,
    email: c.email,
    revenue: Math.round(totalBilled) / 1000,
    aum: Math.round(totalBilled) / 1000,
    creditLimit: c.planType.includes('Gold') ? 15 : c.planType.includes('Silver') ? 10 : c.planType === 'Medicare + Supplement' ? 20 : 5,
    utilisation: c.eligibility.deductibleTotal > 0 ? Math.round((c.eligibility.deductibleMet / c.eligibility.deductibleTotal) * 100) : 0,
    health: c.healthScore,
    tags,
    scores: { engagement: engagementScore, repayment: Math.min(98, repaymentScore + 10), growth: Math.round(growthScore), loyalty: loyaltyScore },
    products,
    revenue12m,
    balanceTrend,
    conversations,
    importantDates,
    preferences: { contact: contactPref, decisionStyle, language: lang, meetingPreference: meetingPref, keyRelationships: keyRel, sensitivities },
    aiInsight,
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
  const found = findByMemberId(customerId)
  const customer = found ?? DEFAULT_CUSTOMER
  const c = toDetailView(customer)

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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--idfc-red-bright)', fontWeight: 600 }}>Live assist · Relationship Insight</span>
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
