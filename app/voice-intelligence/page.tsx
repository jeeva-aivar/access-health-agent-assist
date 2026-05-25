'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { SopRail } from '@/components/voice/SopRail'
import { DEFAULT_WORKFLOW, workflowForFlow, type SopWorkflow } from '@/lib/sop-rcm'
import { inferSopState, type SopState } from '@/lib/sop-state'
import {
  CUSTOMERS, DEFAULT_CUSTOMER, findByPhone, activeClaim,
  type Customer, type ClaimEntry,
} from '@/lib/customers'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'CUSTOMER' | 'AGENT'
type AlertKind = 'compliance' | 'empathy' | 'belief' | 'buying' | 'general'
type CallStatus = 'waiting' | 'live' | 'ended'
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface Suggestion {
  id: string; text: string; kind?: AlertKind; done: boolean
  latencyMs?: number; timeToFirstToken?: number; inputTokens?: number; outputTokens?: number
  startedAt: number; triggerTurnIndex: number
  stepId?: string
}
interface Turn { id: string; role: Role; text: string; partial: boolean; callOffsetMs: number }
interface CallState { status: CallStatus; callSid: string | null; startedAt: number | null; endedAt: number | null }

// ServerEvent — call_start can now carry an optional `phone` (E.164) so the
// backend can tell the UI which member is calling. memberId is a fallback.
type ServerEvent =
  | { type: 'call_start'; callSid: string; phone?: string; memberId?: string }
  | { type: 'call_end'; callSid: string }
  | { type: 'partial'; label: Role; text: string }
  | { type: 'transcript'; label: Role; text: string; callOffset?: string }
  | { type: 'assist_chunk'; suggestionId: string; chunk: string; stepId?: string }
  | { type: 'assist_done'; suggestionId: string; kind: AlertKind; latencyMs: number; timeToFirstToken: number; inputTokens: number; outputTokens: number; fullText: string; stepId?: string }
  | { type: 'sop_state'; workflowId?: string; currentStepIndex: number; completedStepIds: string[] }

// ─── State machine ────────────────────────────────────────────────────────────

interface State {
  call: CallState
  turns: Turn[]
  partials: Record<Role, string>
  suggestions: Record<string, Suggestion>
  sopFromServer: SopState | null
  customer: Customer            // hydrated from phone on call_start (or picker)
  unresolvedPhone: string | null  // backend sent a phone we don't recognise
}

const init: State = {
  call: { status: 'waiting', callSid: null, startedAt: null, endedAt: null },
  turns: [], partials: { CUSTOMER: '', AGENT: '' }, suggestions: {},
  sopFromServer: null,
  customer: DEFAULT_CUSTOMER,
  unresolvedPhone: null,
}

type Action =
  | { type: 'reset'; callSid: string; customer: Customer; unresolvedPhone: string | null }
  | { type: 'pickCustomer'; customer: Customer }
  | { type: 'callEnd' }
  | { type: 'partial'; label: Role; text: string }
  | { type: 'turn'; label: Role; text: string }
  | { type: 'assistChunk'; id: string; chunk: string; stepId?: string }
  | { type: 'assistDone'; id: string; kind: AlertKind; latencyMs: number; timeToFirstToken: number; inputTokens: number; outputTokens: number; stepId?: string }
  | { type: 'sopState'; state: SopState }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'reset': return {
      ...init,
      call: { status: 'live', callSid: a.callSid, startedAt: Date.now(), endedAt: null },
      customer: a.customer, unresolvedPhone: a.unresolvedPhone,
    }
    case 'pickCustomer': return { ...s, customer: a.customer, unresolvedPhone: null }
    case 'callEnd': return { ...s, call: { ...s.call, status: 'ended', endedAt: Date.now() } }
    case 'partial': return { ...s, partials: { ...s.partials, [a.label]: a.text } }
    case 'turn': {
      const turn: Turn = { id: `t-${s.turns.length}-${Date.now()}`, role: a.label, text: a.text, partial: false, callOffsetMs: s.call.startedAt ? Date.now() - s.call.startedAt : 0 }
      return { ...s, turns: [...s.turns, turn], partials: { ...s.partials, [a.label]: '' } }
    }
    case 'assistChunk': {
      const existing = s.suggestions[a.id]
      const anchorIdx = (() => { for (let i = s.turns.length - 1; i >= 0; i--) { if (s.turns[i].role === 'CUSTOMER') return i } return s.turns.length - 1 })()
      if (existing) return { ...s, suggestions: { ...s.suggestions, [a.id]: { ...existing, text: existing.text + a.chunk, stepId: a.stepId ?? existing.stepId } } }
      return { ...s, suggestions: { ...s.suggestions, [a.id]: { id: a.id, text: a.chunk, done: false, startedAt: Date.now(), triggerTurnIndex: anchorIdx, stepId: a.stepId } } }
    }
    case 'assistDone': {
      const existing = s.suggestions[a.id]
      if (!existing) return s
      return { ...s, suggestions: { ...s.suggestions, [a.id]: { ...existing, done: true, kind: a.kind, latencyMs: a.latencyMs, timeToFirstToken: a.timeToFirstToken, inputTokens: a.inputTokens, outputTokens: a.outputTokens, stepId: a.stepId ?? existing.stepId } } }
    }
    case 'sopState': return { ...s, sopFromServer: a.state }
    default: return s
  }
}

// ─── WebSocket hook ───────────────────────────────────────────────────────────

function useAgentSocket(onEvent: (e: ServerEvent) => void) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<number | null>(null)
  const downRef = useRef(false)
  const onRef = useRef(onEvent); onRef.current = onEvent

  useEffect(() => {
    downRef.current = false
    function connect() {
      if (downRef.current) return
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return
      setStatus('connecting')
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = process.env.NEXT_PUBLIC_AGENT_WS_URL ?? `${proto}//${location.host}/api/agent/live`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => setStatus('connected')
      ws.onmessage = ({ data }) => { try { onRef.current(JSON.parse(data) as ServerEvent) } catch { /* ignore */ } }
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null
        if (downRef.current) return
        setStatus('disconnected')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(connect, 3000)
      }
      ws.onerror = () => setStatus('disconnected')
    }
    connect()
    return () => {
      downRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      const ws = wsRef.current
      if (ws) { ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null; if (ws.readyState < 2) ws.close(); wsRef.current = null }
    }
  }, [])

  // Receive-only socket. The UI no longer sends commands (Ask Assist removed).
  return { status }
}

// ─── Helper fns ───────────────────────────────────────────────────────────────

function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
function fmtClock(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
function fmtDate(yyyymmdd: string) {
  const [y, m, d] = yyyymmdd.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`
}
function fmtMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function claimStatusColor(s: ClaimEntry['status']) {
  if (s === 'paid') return '#16a34a'
  if (s === 'denied') return '#dc2626'
  if (s === 'in_review' || s === 'submitted') return '#d97706'
  if (s === 'partial') return '#d97706'
  return 'var(--text-secondary)'
}
function claimStatusLabel(s: ClaimEntry['status']) {
  return { paid: 'Paid', denied: 'Denied', in_review: 'In review', submitted: 'Submitted', partial: 'Partial' }[s]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const KIND_STYLE: Record<string, { bg: string; border: string; label: string }> = {
  compliance: { bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)', label: 'HIPAA alert' },
  empathy:    { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', label: 'Empathy' },
  belief:     { bg: 'rgba(30,48,130,0.08)', border: 'rgba(30,48,130,0.25)', label: 'Consent' },
  buying:     { bg: 'rgba(59,86,183,0.08)', border: 'rgba(59,86,183,0.28)', label: 'Escalation' },
  general:    { bg: 'rgba(229,230,237,0.6)', border: 'rgba(229,230,237,1)', label: 'Suggestion' },
}

function SuggestionCard({ s, callStartedAt, workflow }: { s: Suggestion; callStartedAt: number | null; workflow: SopWorkflow }) {
  const [showWhy, setShowWhy] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)
  const style = KIND_STYLE[s.kind ?? 'general'] ?? KIND_STYLE.general
  const ts = callStartedAt ? fmtClock(s.startedAt) : ''
  const step = s.stepId ? workflow.steps.find(st => st.id === s.stepId) : null
  const stepIdx = step ? workflow.steps.indexOf(step) : -1

  // Split AI text into the "Say:" body and the "Why:" reasoning.
  // The model outputs: `Say: "…" Why: …` — we separate them so the card
  // body shows only the suggestion and the toggle reveals the rationale.
  const whySplit = /\bWhy:\s*/i.exec(s.text)
  const sayText = whySplit ? s.text.slice(0, whySplit.index).replace(/^Say:\s*/i, '').trim() : s.text
  const whyText = whySplit ? s.text.slice(whySplit.index + whySplit[0].length).trim() : null

  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10, padding: '14px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>◆ Corebridge AI · {style.label}</span>
        {stepIdx >= 0 && (
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ah-deep)', padding: '2px 6px', borderRadius: 4, background: 'rgba(59,86,183,0.12)', border: '1px solid rgba(59,86,183,0.3)' }}>Step {stepIdx + 1}</span>
        )}
        {ts && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{ts}</span>}
      </div>
      <p style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
        {sayText || (s.done ? '—' : '')}
      </p>
      {s.done && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {whyText && (
              <button
                onClick={() => { setShowWhy((w: boolean) => !w); setShowEscalate(false) }}
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 5, border: `1px solid ${showWhy ? 'var(--ah-emerald)' : style.border}`, background: showWhy ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)', color: 'var(--ah-emerald)', cursor: 'pointer' }}>
                Why this?
              </button>
            )}
            <button
              onClick={() => { setShowEscalate((e: boolean) => !e); setShowWhy(false) }}
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 5, border: `1px solid ${showEscalate ? '#dc2626' : style.border}`, background: showEscalate ? 'rgba(220,38,38,0.07)' : 'var(--bg-card)', color: showEscalate ? '#dc2626' : 'var(--ah-emerald)', cursor: 'pointer' }}>
              Escalate
            </button>
          </div>

          {showWhy && whyText && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 7, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-emerald)', marginBottom: 6 }}>Why this?</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{whyText}</p>
            </div>
          )}

          {showEscalate && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 7, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#dc2626' }}>Escalate to supervisor with context</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TurnRow({ turn, suggestions, callStartedAt, customer, workflow }: { turn: Turn; suggestions: Suggestion[]; callStartedAt: number | null; customer: Customer; workflow: SopWorkflow }) {
  const isCustomer = turn.role === 'CUSTOMER'
  const ts = callStartedAt ? fmtClock(callStartedAt + turn.callOffsetMs) : ''
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isCustomer ? 'var(--ah-emerald)' : 'var(--text-secondary)' }}>
          {isCustomer ? `Caller · ${customer.lastName}` : 'Agent · Afsheen'}
        </span>
        {ts && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{ts}</span>}
        {isCustomer && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Amazon Connect · {customer.state} bridge</span>}
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--text-primary)', margin: 0 }}>{turn.text}</p>
      {suggestions.map(s => <SuggestionCard key={s.id} s={s} callStartedAt={callStartedAt} workflow={workflow} />)}
    </div>
  )
}

function TranscriptPanel({ turns, partials, suggestionsByTurn, call, customer, unresolvedPhone, workflow }: {
  turns: Turn[]; partials: Record<Role, string>; suggestionsByTurn: Map<number, Suggestion[]>;
  call: CallState; customer: Customer; unresolvedPhone: string | null; workflow: SopWorkflow;
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sticky = useRef(true)
  const [, tick] = useState(0)

  useEffect(() => { if (call.status !== 'live') return; const id = setInterval(() => tick(t => t + 1), 1000); return () => clearInterval(id) }, [call.status])
  useEffect(() => {
    const root = scrollRef.current, sentinel = sentinelRef.current; if (!root || !sentinel) return
    const obs = new IntersectionObserver(([e]) => { sticky.current = e.isIntersecting }, { root, threshold: 0 })
    obs.observe(sentinel); return () => obs.disconnect()
  }, [])
  useLayoutEffect(() => { if (sticky.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight })

  const isLive = call.status === 'live'
  const elapsedMs = call.startedAt ? Date.now() - call.startedAt : 0
  const claim = activeClaim(customer)
  const elig = customer.eligibility

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? 'var(--ah-emerald)' : 'var(--text-tertiary)', animation: isLive ? 'pulse 1.5s infinite' : 'none', flexShrink: 0 }} />
          {isLive ? 'Recording live' : call.status === 'ended' ? 'Recording ended' : 'Standby'}
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>· Transcribing EN-US</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--text-tertiary)' }}>
          {fmtClock(Date.now())} · <strong style={{ color: 'var(--text-secondary)' }}>{fmtElapsed(elapsedMs)} elapsed</strong>
        </div>
      </div>

      {/* Unresolved-phone banner (rare) */}
      {unresolvedPhone && (
        <div style={{ padding: '8px 20px', background: 'rgba(217,119,6,0.08)', borderBottom: '1px solid rgba(217,119,6,0.25)', fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: '#d97706', letterSpacing: '0.06em' }}>
          ⚠ Unknown caller phone <strong>{unresolvedPhone}</strong> — showing default customer. Verify manually or update roster.
        </div>
      )}

      {/* Customer strip — fully driven by `customer` */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--ah-emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 18, fontWeight: 600, flexShrink: 0 }}>{customer.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: 'var(--text-primary)' }}>{customer.name}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
            <span><strong style={{ color: 'var(--text-secondary)' }}>Member ID</strong> {customer.memberId}</span>
            <span>·</span>
            <span><strong style={{ color: 'var(--text-secondary)' }}>Payer</strong> {customer.payer} · {customer.planType}</span>
            {claim && <><span>·</span><span><strong style={{ color: 'var(--text-secondary)' }}>Claim</strong> {claim.id}</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.06)', padding: '3px 10px', borderRadius: 6 }}>{elig.status === 'active' ? 'Eligibility valid' : 'Eligibility ' + elig.status}</span>
          {claim && (
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: claimStatusColor(claim.status), border: `1px solid ${claimStatusColor(claim.status)}66`, background: claimStatusColor(claim.status) === '#16a34a' ? 'rgba(22,163,74,0.06)' : 'rgba(217,119,6,0.06)', padding: '3px 10px', borderRadius: 6 }}>Claim {claimStatusLabel(claim.status)}</span>
          )}
        </div>
      </div>

      {/* Transcript scroll */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px' }}>
        {call.status === 'waiting' && turns.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>CALL CONTEXT · {customer.flow.replace('_', ' / ').toUpperCase()}</div>
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '14px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}><strong style={{ color: 'var(--text-primary)' }}>Call reason:</strong> {customer.callReason}</div>
              {customer.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}><strong>Note for agent:</strong> {customer.notes}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-tertiary)', paddingTop: 16, paddingBottom: 16 }}>
              <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 40, color: 'var(--border-subtle)', lineHeight: 1 }}>◎</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Awaiting call</div>
              <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>Live transcripts and AI suggestions will appear here once {customer.firstName}&apos;s call connects from Amazon Connect.</div>
            </div>
          </div>
        )}

        {turns.map((turn, idx) => (
          <TurnRow key={turn.id} turn={turn} suggestions={suggestionsByTurn.get(idx) ?? []} callStartedAt={call.startedAt} customer={customer} workflow={workflow} />
        ))}

        {partials.CUSTOMER && (
          <div style={{ padding: '10px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>Caller · {customer.lastName}</span>
            <p style={{ fontSize: 14.5, fontStyle: 'italic', color: 'var(--text-tertiary)', margin: '6px 0 0' }}>{partials.CUSTOMER}</p>
          </div>
        )}
        {partials.AGENT && (
          <div style={{ padding: '10px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Agent · Afsheen</span>
            <p style={{ fontSize: 14.5, fontStyle: 'italic', color: 'var(--text-tertiary)', margin: '6px 0 0' }}>{partials.AGENT}</p>
          </div>
        )}
        {isLive && turns.length === 0 && !partials.CUSTOMER && !partials.AGENT && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', color: 'var(--text-tertiary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ah-emerald)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Listening…</span>
          </div>
        )}
        {call.status === 'ended' && <div style={{ textAlign: 'center', padding: '14px 0', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>— call ended —</div>}

        <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
      </div>

      {/* Footer bar */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? 'var(--ah-emerald)' : 'var(--text-tertiary)', animation: isLive ? 'pulse 1.5s infinite' : 'none' }} />
          {isLive ? 'Mic open · Afsheen' : 'Mic idle'}
        </span>
        <span style={{ color: 'var(--border-subtle)' }}>·</span>
        <span>SNR 38 dB · EN-US</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['Add note', 'Flag PHI', 'Open EOB'].map(b => (
            <button key={b} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>{b}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Right rail tabs — all data-driven from `customer` ───────────────────────

type RailTab = 'member' | 'claim' | 'coverage' | 'history' | 'compliance'
const RAIL_TABS: { key: RailTab; label: string }[] = [
  { key: 'member', label: 'Member' }, { key: 'claim', label: 'Claim' },
  { key: 'coverage', label: 'Coverage' }, { key: 'history', label: 'History' }, { key: 'compliance', label: 'Compliance' },
]

function MetricBox({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, color: positive ? '#16a34a' : 'var(--text-primary)', lineHeight: 1 }}>
        {value}{sub && <small style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>{sub}</small>}
      </div>
    </div>
  )
}

function RailRow({ k, v, vColor }: { k: string; v: string; vColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{k}</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: vColor ?? 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
    </div>
  )
}

function SectionHead({ children, tag }: { children: React.ReactNode; tag?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 8px', fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
      <span>{children}</span>
      {tag && <span style={{ color: 'var(--ah-emerald)' }}>{tag}</span>}
    </div>
  )
}

function MemberTab({ customer }: { customer: Customer }) {
  const langLabel = customer.language === 'es' ? 'ES (Spanish-preferred)' : customer.language === 'tl' ? 'TL (Tagalog)' : 'EN-US'
  return (
    <>
      <SectionHead>Patient identity</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Full name" v={customer.name} />
        <RailRow k="Date of birth" v={fmtDate(customer.dob)} />
        <RailRow k="Member ID" v={customer.memberId} />
        <RailRow k="Group" v={customer.groupId} />
        <RailRow k="Plan" v={customer.planName} />
        <RailRow k="Effective" v={fmtDate(customer.effectiveDate)} vColor="#16a34a" />
        <RailRow k="PCP" v={customer.pcp} />
      </div>
      <SectionHead tag="Voice AI">Verification status</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricBox label="Member ID" value="✓" positive />
        <MetricBox label="Name confirmed" value="✓" positive />
      </div>
      <SectionHead>Contact preferences</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Mobile" v={customer.phoneDisplay} />
        <RailRow k="Email" v={customer.email} />
        <RailRow k="City" v={`${customer.city}, ${customer.state}`} />
        <RailRow k="Language" v={langLabel} />
      </div>
    </>
  )
}

function ClaimTab({ customer }: { customer: Customer }) {
  const claim = activeClaim(customer)
  if (!claim) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
        No active claim on file for this member.
      </div>
    )
  }
  return (
    <>
      <SectionHead>Active claim · {claim.id}</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Status" v={claimStatusLabel(claim.status)} vColor={claimStatusColor(claim.status)} />
        <RailRow k="Service date" v={fmtDate(claim.serviceDate)} />
        <RailRow k="Provider" v={claim.provider} />
        <RailRow k="Service type" v={claim.serviceType} />
        {claim.cpt && <RailRow k="CPT" v={claim.cpt} />}
        <RailRow k="Billed" v={fmtMoney(claim.billed)} />
        <RailRow k="Allowed" v={fmtMoney(claim.allowed)} />
        <RailRow k="Plan paid" v={fmtMoney(claim.planPaid)} />
        <RailRow k="Patient resp." v={fmtMoney(claim.patientResp)} />
      </div>
      {claim.status === 'denied' && claim.denialCode && (
        <>
          <SectionHead tag="Denial">{claim.denialCode}</SectionHead>
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            <strong>Reason:</strong> {claim.denialReason ?? '—'}
            {claim.appealDeadline && <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-secondary)' }}>Appeal deadline: <strong>{fmtDate(claim.appealDeadline)}</strong></div>}
          </div>
        </>
      )}
      {claim.notes && (
        <>
          <SectionHead tag="KB">Note</SectionHead>
          <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {claim.notes}
          </div>
        </>
      )}
      {(customer.creditBalance ?? 0) > 0 && (
        <>
          <SectionHead tag="Credit">Refundable</SectionHead>
          <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            Credit balance <strong>{fmtMoney(customer.creditBalance!)}</strong> available — refund via ACH (10-day SLA) or apply to next bill.
          </div>
        </>
      )}
    </>
  )
}

function CoverageTab({ customer }: { customer: Customer }) {
  const e = customer.eligibility
  return (
    <>
      <SectionHead>Plan benefits · {customer.planName}</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Network status" v="In-network" vColor="#16a34a" />
        <RailRow k="Deductible · ind." v={`${fmtMoney(e.deductibleMet)} met / ${fmtMoney(e.deductibleTotal)}`} />
        <RailRow k="OOP max · ind." v={e.oopTotal > 0 ? `${fmtMoney(e.oopMet)} met / ${fmtMoney(e.oopTotal)}` : 'No OOP max (MA + Supplement)'} />
        <RailRow k="Copay · specialist" v={fmtMoney(e.copaySpecialist)} />
        <RailRow k="Coinsurance" v={`${e.coinsurancePct}%${e.deductibleTotal > 0 ? ' after ded.' : ''}`} />
        {customer.priorAuths.length > 0 && customer.priorAuths.map(pa => (
          <RailRow key={pa.id} k={`Prior auth · ${pa.procedure.slice(0, 28)}`} v={`${pa.status === 'approved' ? 'Approved' : pa.status === 'pending' ? 'Pending' : pa.status === 'denied' ? 'Denied' : 'Expired'} · ${pa.id}`} vColor={pa.status === 'approved' ? '#16a34a' : pa.status === 'pending' ? '#d97706' : '#dc2626'} />
        ))}
      </div>
      <SectionHead tag="Eligibility">Live check · 270/271</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricBox label="Active" value={e.status === 'active' ? 'Yes' : 'No'} positive={e.status === 'active'} />
        <MetricBox label="Effective" value={customer.effectiveDate.slice(5).replace('-', '/') + '/' + customer.effectiveDate.slice(2, 4)} />
        <MetricBox label="Verified" value="Just now" />
        <MetricBox label="Source" value={customer.payer.split(' ')[0]} sub="270/271" />
      </div>
      {customer.eligibility.priorAuthRequired.length > 0 && (
        <>
          <SectionHead>Prior auth required for</SectionHead>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {customer.eligibility.priorAuthRequired.map(t => (
              <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.06em', color: '#d97706', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 4, padding: '3px 8px' }}>{t}</span>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function HistoryTab({ customer }: { customer: Customer }) {
  const recentCalls = customer.callHistory.slice(0, 6)
  return (
    <>
      <SectionHead>Recent claims</SectionHead>
      {customer.claims.length === 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', padding: '6px 0 12px' }}>No prior claims on file.</div>
      )}
      {customer.claims.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', width: 56, flexShrink: 0, marginTop: 1 }}>{fmtDate(c.serviceDate).slice(0, 6)}</span>
          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{c.id.split('-')[0]}-{c.id.split('-')[1]}</strong> · {c.serviceType.split(' (')[0]} · <span style={{ color: claimStatusColor(c.status) }}>{claimStatusLabel(c.status)}{c.status === 'paid' ? ` ${fmtMoney(c.patientResp)}` : c.status === 'denied' ? ` ${c.denialCode ?? ''}` : ''}</span>
          </span>
        </div>
      ))}
      <SectionHead>Recent appointments</SectionHead>
      {customer.appointments.length === 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', padding: '6px 0 12px' }}>No appointments on file.</div>
      )}
      {customer.appointments.map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', width: 56, flexShrink: 0, marginTop: 1 }}>{fmtDate(a.date).slice(0, 6)}</span>
          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{a.provider} · {a.type} · <span style={{ color: a.status === 'completed' ? '#16a34a' : a.status === 'scheduled' ? 'var(--text-secondary)' : '#dc2626' }}>{a.status}</span></span>
        </div>
      ))}
      <SectionHead>Recent contact</SectionHead>
      {recentCalls.length === 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', padding: '6px 0 12px' }}>No prior contact history.</div>
      )}
      {recentCalls.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', width: 56, flexShrink: 0, marginTop: 1 }}>{fmtDate(h.date).slice(0, 6)}</span>
          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.channel.toUpperCase()} · {h.topic} · <em style={{ color: h.sentiment === 'positive' ? '#16a34a' : h.sentiment === 'negative' ? '#dc2626' : 'var(--text-tertiary)' }}>{h.sentiment}</em></span>
        </div>
      ))}
    </>
  )
}

function ComplianceTab({ customer }: { customer: Customer }) {
  const flags = [
    { ok: true,  title: 'HIPAA · 3-ID verification in progress', sub: 'Name + Member ID captured. Claim ID still pending — do not disclose claim details yet.' },
    { ok: true,  title: 'Call recording consent · acknowledged',  sub: 'IVR consent captured at call start · retained per Corebridge policy' },
    { ok: false, title: 'PHI in transcript · auto-redaction on',  sub: 'Real-time PII/PHI masking active · review redaction log post-call' },
    { ok: true,  title: 'Authorization on file',                  sub: 'Patient signed Authorization for Use & Disclosure · valid through Dec 31, 2026' },
    { ok: customer.sentiment !== 'negative', title: 'Escalation path · supervisor available', sub: customer.sentiment === 'negative' ? 'Sentiment cooling — flag for warm transfer if unresolved within 5 min' : 'Tier-2 available if claim status is ambiguous' },
  ]
  return (
    <>
      <SectionHead>Compliance posture</SectionHead>
      {flags.map(f => (
        <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.ok ? '#16a34a' : '#d97706', flexShrink: 0, marginTop: 4 }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{f.sub}</div>
          </div>
        </div>
      ))}
      <SectionHead>AI autonomy · this call</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {[
          { label: 'Auto', color: '#16a34a', bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.2)', count: 3, desc: 'Surface SOP step · pull KB snippet · log call summary' },
          { label: 'Confirm', color: '#d97706', bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.2)', count: 2, desc: 'Draft EOB email · schedule provider callback' },
          { label: 'Approve', color: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)', count: 1, desc: customer.flow === 'claim_status' && customer.activeClaimId ? 'Initiate formal appeal on denial' : 'Initiate manual intervention' },
        ].map(t => (
          <div key={t.label} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.color }}>{t.label}</div>
            <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, color: 'var(--text-primary)', margin: '4px 0' }}>{t.count}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function RightRailPanel({ workflow, sopState, latestSuggestion, customer }: { workflow: SopWorkflow; sopState: SopState; latestSuggestion?: { text: string; kind?: string } | null; customer: Customer }) {
  const [active, setActive] = useState<RailTab>('member')
  const flowLabel = customer.flow === 'claim_status' ? 'Claim status' : customer.flow === 'eligibility_priorauth' ? 'Eligibility + PA' : 'Billing / refund'
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--ah-emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{customer.initials.charAt(0)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{customer.lastName}, {customer.firstName.charAt(0)}.</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{customer.planType} · {customer.payer} · {flowLabel}</div>
        </div>
      </div>

      <div style={{ padding: '12px 12px 0', flexShrink: 0 }}>
        <SopRail workflow={workflow} state={sopState} latestSuggestion={latestSuggestion ?? null} />
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '10px 12px 0', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, overflowX: 'auto' }}>
        {RAIL_TABS.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)} style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '6px 10px', borderRadius: '6px 6px 0 0', border: active === t.key ? '1px solid var(--border-subtle)' : '1px solid transparent',
            borderBottom: active === t.key ? '1px solid var(--bg-card)' : '1px solid transparent', marginBottom: active === t.key ? -1 : 0,
            background: active === t.key ? 'var(--bg-card)' : 'transparent',
            color: active === t.key ? 'var(--ah-emerald)' : 'var(--text-tertiary)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px' }}>
        {active === 'member'     && <MemberTab customer={customer} />}
        {active === 'claim'      && <ClaimTab customer={customer} />}
        {active === 'coverage'   && <CoverageTab customer={customer} />}
        {active === 'history'    && <HistoryTab customer={customer} />}
        {active === 'compliance' && <ComplianceTab customer={customer} />}
      </div>
    </div>
  )
}

// ─── Caller picker — demo simulator for "incoming call from..." ───────────────

function CallerPicker({ onPick, current }: { onPick: (c: Customer) => void; current: Customer }) {
  const [open, setOpen] = useState(false)
  const flowLabel = (f: Customer['flow']) => f === 'claim_status' ? 'Claim status' : f === 'eligibility_priorauth' ? 'Eligibility + PA' : 'Billing / refund'
  const flowColor = (f: Customer['flow']) => f === 'claim_status' ? '#3b82f6' : f === 'eligibility_priorauth' ? '#16a34a' : '#d97706'

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px',
        background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8,
        fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: flowColor(current.flow) }} />
        Simulate caller: <strong style={{ color: 'var(--text-primary)' }}>{current.lastName}</strong>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 38, right: 0, width: 360, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, boxShadow: '0 18px 40px -12px rgba(20,15,10,0.18)', overflow: 'hidden', zIndex: 50 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Demo · pick incoming caller
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {CUSTOMERS.map(c => (
              <button key={c.phone} onClick={() => { onPick(c); setOpen(false) }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', textAlign: 'left',
                background: c.phone === current.phone ? 'var(--bg-subtle)' : 'transparent', border: 'none',
                borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: flowColor(c.flow), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.lastName}, {c.firstName.charAt(0)}.</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.phoneDisplay} · {flowLabel(c.flow)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Top status bar ───────────────────────────────────────────────────────────

function StatusBar({ call, wsStatus }: { call: CallState; wsStatus: ConnectionStatus }) {
  const [, tick] = useState(0)
  useEffect(() => { if (call.status !== 'live') return; const id = setInterval(() => tick(t => t + 1), 1000); return () => clearInterval(id) }, [call.status])
  const elapsed = call.startedAt ? fmtElapsed(Date.now() - call.startedAt) : '00:00'
  const wsColor = wsStatus === 'connected' ? '#16a34a' : wsStatus === 'connecting' ? '#d97706' : '#dc2626'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: call.status === 'live' ? 'var(--ah-emerald)' : 'var(--text-tertiary)', flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: call.status === 'live' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          {call.status === 'live' ? `Live · ${elapsed}` : call.status === 'ended' ? 'Call ended' : 'Waiting for call'}
        </span>
        {call.callSid && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{call.callSid.slice(0, 16)}…</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: wsColor, flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>WS: {wsStatus}</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function VoiceIntelligenceContent() {
  const [state, dispatch] = useReducer(reducer, init)

  const handleEvent = useCallback((e: ServerEvent) => {
    switch (e.type) {
      case 'call_start': {
        // Resolve customer from backend-sent phone (preferred) or memberId.
        let resolved: Customer = DEFAULT_CUSTOMER
        let unresolved: string | null = null
        if (e.phone) {
          const hit = findByPhone(e.phone)
          if (hit) resolved = hit
          else unresolved = e.phone
        }
        dispatch({ type: 'reset', callSid: e.callSid, customer: resolved, unresolvedPhone: unresolved })
        break
      }
      case 'call_end':     dispatch({ type: 'callEnd' }); break
      case 'partial':      dispatch({ type: 'partial', label: e.label, text: e.text }); break
      case 'transcript':   dispatch({ type: 'turn', label: e.label, text: e.text }); break
      case 'assist_chunk': dispatch({ type: 'assistChunk', id: e.suggestionId, chunk: e.chunk, stepId: e.stepId }); break
      case 'assist_done':  dispatch({ type: 'assistDone', id: e.suggestionId, kind: e.kind, latencyMs: e.latencyMs, timeToFirstToken: e.timeToFirstToken, inputTokens: e.inputTokens, outputTokens: e.outputTokens, stepId: e.stepId }); break
      case 'sop_state':    dispatch({ type: 'sopState', state: { currentStepIndex: e.currentStepIndex, completedStepIds: e.completedStepIds } }); break
    }
  }, [])

  const { status: wsStatus } = useAgentSocket(handleEvent)

  const suggestionsByTurn = useMemo(() => {
    const map = new Map<number, Suggestion[]>()
    for (const s of Object.values(state.suggestions)) {
      if (!map.has(s.triggerTurnIndex)) map.set(s.triggerTurnIndex, [])
      map.get(s.triggerTurnIndex)!.push(s)
    }
    for (const list of map.values()) list.sort((a, b) => a.startedAt - b.startedAt)
    return map
  }, [state.suggestions])

  // Workflow chosen per the active customer's flow (claim_status /
  // eligibility_priorauth / billing_refund). Step IDs are stable across all
  // three so backend-sent stepIds on assist_* events still resolve correctly.
  const workflow: SopWorkflow = useMemo(() => workflowForFlow(state.customer.flow), [state.customer.flow])

  const inferredSopState = useMemo(
    () => inferSopState(workflow, state.turns.map(t => t.text)),
    [workflow, state.turns],
  )
  const effectiveSopState: SopState = state.sopFromServer ?? inferredSopState

  const latestSuggestion = useMemo(() => {
    const all = Object.values(state.suggestions)
    if (all.length === 0) return null
    const sorted = [...all].sort((a, b) => b.startedAt - a.startedAt)
    return { text: sorted[0].text, kind: sorted[0].kind }
  }, [state.suggestions])

  // Demo "simulate caller" picker — fires a synthetic call_start so the UI
  // behaves identically to a real backend-sent phone. Once the backend ships
  // the phone field on call_start, this picker becomes optional (still useful
  // for demo control + offline testing).
  const handlePickCaller = useCallback((c: Customer) => {
    dispatch({ type: 'reset', callSid: `demo-${c.lastName.toLowerCase()}-${Date.now()}`, customer: c, unresolvedPhone: null })
  }, [])

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Voice Intelligence</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
            Live call <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>assist</em>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <StatusBar call={state.call} wsStatus={wsStatus} />
            <CallerPicker onPick={handlePickCaller} current={state.customer} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 360px', gridTemplateRows: '1fr', gap: 16 }}>
        {/* Transcript — left column (scrolls independently) */}
        <div>
          <TranscriptPanel turns={state.turns} partials={state.partials} suggestionsByTurn={suggestionsByTurn} call={state.call} customer={state.customer} unresolvedPhone={state.unresolvedPhone} workflow={workflow} />
        </div>
        {/* Right rail — full height (scrolls independently) */}
        <div>
          <RightRailPanel workflow={workflow} sopState={effectiveSopState} latestSuggestion={latestSuggestion} customer={state.customer} />
        </div>
      </div>
    </div>
  )
}

export default function VoiceIntelligencePage() {
  return (
    <AppShell>
      <VoiceIntelligenceContent />
    </AppShell>
  )
}
