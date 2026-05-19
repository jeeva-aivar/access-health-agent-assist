'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { SopRail } from '@/components/voice/SopRail'
import { DEFAULT_WORKFLOW } from '@/lib/sop-rcm'
import { inferSopState, type SopState } from '@/lib/sop-state'

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

type ServerEvent =
  | { type: 'call_start'; callSid: string }
  | { type: 'call_end'; callSid: string }
  | { type: 'partial'; label: Role; text: string }
  | { type: 'transcript'; label: Role; text: string; callOffset?: string }
  | { type: 'assist_chunk'; suggestionId: string; chunk: string; stepId?: string }
  | { type: 'assist_done'; suggestionId: string; kind: AlertKind; latencyMs: number; timeToFirstToken: number; inputTokens: number; outputTokens: number; fullText: string; stepId?: string }
  | { type: 'ask_chunk'; askId: string; chunk: string }
  | { type: 'ask_done'; askId: string; fullText: string }
  | { type: 'sop_state'; workflowId?: string; currentStepIndex: number; completedStepIds: string[] }

// ─── State machine ────────────────────────────────────────────────────────────

interface State {
  call: CallState
  turns: Turn[]
  partials: Record<Role, string>
  suggestions: Record<string, Suggestion>
  askMessages: { id: string; role: 'user' | 'assistant'; text: string; done: boolean }[]
  sopFromServer: SopState | null
}

const init: State = {
  call: { status: 'waiting', callSid: null, startedAt: null, endedAt: null },
  turns: [], partials: { CUSTOMER: '', AGENT: '' }, suggestions: {}, askMessages: [],
  sopFromServer: null,
}

type Action =
  | { type: 'reset'; callSid: string }
  | { type: 'callEnd' }
  | { type: 'partial'; label: Role; text: string }
  | { type: 'turn'; label: Role; text: string }
  | { type: 'assistChunk'; id: string; chunk: string; stepId?: string }
  | { type: 'assistDone'; id: string; kind: AlertKind; latencyMs: number; timeToFirstToken: number; inputTokens: number; outputTokens: number; stepId?: string }
  | { type: 'askChunk'; id: string; chunk: string }
  | { type: 'askDone'; id: string; fullText: string }
  | { type: 'askSend'; id: string; question: string }
  | { type: 'sopState'; state: SopState }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'reset': return { ...init, call: { status: 'live', callSid: a.callSid, startedAt: Date.now(), endedAt: null } }
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
    case 'askSend': return { ...s, askMessages: [...s.askMessages, { id: a.id, role: 'user', text: a.question, done: true }] }
    case 'askChunk': {
      const msgs = s.askMessages; const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.id === a.id) return { ...s, askMessages: [...msgs.slice(0, -1), { ...last, text: last.text + a.chunk }] }
      return { ...s, askMessages: [...msgs, { id: a.id, role: 'assistant', text: a.chunk, done: false }] }
    }
    case 'askDone': {
      const msgs = s.askMessages; const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') return { ...s, askMessages: [...msgs.slice(0, -1), { ...last, text: a.fullText, done: true }] }
      return s
    }
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

  const send = useCallback((cmd: object) => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(cmd)) }, [])
  return { status, send }
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

// ─── Sub-components ───────────────────────────────────────────────────────────

// Healthcare-tuned suggestion kinds. Backend still sends the original keys
// (compliance/empathy/belief/buying/general); we relabel for the RCM context.
//   compliance → HIPAA / PHI alert  (red — status, not brand)
//   empathy    → Empathy line       (celadon-leaning blue)
//   belief     → Consent prompt     (moss)
//   buying     → Escalation cue     (emerald)
//   general    → Suggestion         (neutral)
const KIND_STYLE: Record<string, { bg: string; border: string; label: string }> = {
  compliance: { bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)', label: 'HIPAA alert' },
  empathy:    { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', label: 'Empathy' },
  belief:     { bg: 'rgba(82,185,96,0.08)', border: 'rgba(82,185,96,0.25)', label: 'Consent' },
  buying:     { bg: 'rgba(86,187,100,0.08)', border: 'rgba(86,187,100,0.28)', label: 'Escalation' },
  general:    { bg: 'rgba(184,216,188,0.18)', border: 'rgba(184,216,188,0.45)', label: 'Suggestion' },
}

function SuggestionCard({ s, callStartedAt }: { s: Suggestion; callStartedAt: number | null }) {
  const style = KIND_STYLE[s.kind ?? 'general'] ?? KIND_STYLE.general
  const ts = callStartedAt ? fmtClock(s.startedAt) : ''
  const stepIdx = s.stepId ? DEFAULT_WORKFLOW.steps.findIndex(st => st.id === s.stepId) : -1
  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10, padding: '14px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>◆ Access Health AI · {style.label}</span>
        {stepIdx >= 0 && (
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ah-deep)', padding: '2px 6px', borderRadius: 4, background: 'rgba(86,187,100,0.12)', border: '1px solid rgba(86,187,100,0.3)' }}>Step {stepIdx + 1}</span>
        )}
        {ts && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{ts}</span>}
      </div>
      <p style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
        {s.text || (s.done ? '—' : '')}
      </p>
      {s.done && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {['Use line', 'Read aloud', 'Why this?', 'Open SOP source', 'Escalate'].map(b => (
            <button key={b} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 5, border: `1px solid ${style.border}`, background: 'var(--bg-card)', color: 'var(--ah-emerald)', cursor: 'pointer' }}>{b}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function TurnRow({ turn, suggestions, callStartedAt }: { turn: Turn; suggestions: Suggestion[]; callStartedAt: number | null }) {
  const isCustomer = turn.role === 'CUSTOMER'
  const ts = callStartedAt ? fmtClock(callStartedAt + turn.callOffsetMs) : ''
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isCustomer ? 'var(--ah-emerald)' : 'var(--text-secondary)' }}>
          {isCustomer ? 'Caller · Anderson' : 'Agent · Jane'}
        </span>
        {ts && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{ts}</span>}
        {isCustomer && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Amazon Connect · TX bridge</span>}
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--text-primary)', margin: 0 }}>{turn.text}</p>
      {suggestions.map(s => <SuggestionCard key={s.id} s={s} callStartedAt={callStartedAt} />)}
    </div>
  )
}

function TranscriptPanel({ turns, partials, suggestionsByTurn, call }: { turns: Turn[]; partials: Record<Role, string>; suggestionsByTurn: Map<number, Suggestion[]>; call: CallState }) {
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

      {/* Customer strip */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--ah-emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 18, fontWeight: 600, flexShrink: 0 }}>MA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: 'var(--text-primary)' }}>Mr. Michael Anderson</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
            <span><strong style={{ color: 'var(--text-secondary)' }}>Member ID</strong> ANH-2418-4421</span>
            <span>·</span>
            <span><strong style={{ color: 'var(--text-secondary)' }}>Payer</strong> BCBS TX · PPO</span>
            <span>·</span>
            <span><strong style={{ color: 'var(--text-secondary)' }}>Claim</strong> CLM-9047-2206</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.06)', padding: '3px 10px', borderRadius: 6 }}>Eligibility valid</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.06)', padding: '3px 10px', borderRadius: 6 }}>Claim under review</span>
        </div>
      </div>

      {/* Transcript scroll */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px' }}>
        {call.status === 'waiting' && turns.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>TODAY&apos;S CALL QUEUE · LIVE ASSIST READY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { time: '09:30', customer: 'Michael Anderson', type: 'Claim status · CLM-9047', next: true },
                { time: '11:00', customer: 'Sarah Lopez',      type: 'Denied claim · appeal window', next: false },
                { time: '14:00', customer: 'David Kim',        type: 'EOB request · prior visit',    next: false },
              ].map(c => (
                <div key={c.time} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  {c.next
                    ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0, boxShadow: '0 0 0 2px rgba(22,163,74,0.2)' }} />
                    : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-subtle)', flexShrink: 0 }} />
                  }
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: 'var(--text-secondary)', width: 42, flexShrink: 0 }}>{c.time}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{c.customer}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.type}</span>
                  {c.next && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.06)', padding: '2px 7px', borderRadius: 4 }}>Next up</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-tertiary)', paddingTop: 32, paddingBottom: 16 }}>
              <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 40, color: 'var(--border-subtle)', lineHeight: 1 }}>◎</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Awaiting call</div>
              <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>Live transcripts and AI suggestions will appear here once a patient call connects from Amazon Connect.</div>
            </div>
          </div>
        )}

        {turns.map((turn, idx) => (
          <TurnRow key={turn.id} turn={turn} suggestions={suggestionsByTurn.get(idx) ?? []} callStartedAt={call.startedAt} />
        ))}

        {partials.CUSTOMER && (
          <div style={{ padding: '10px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>Caller · Anderson</span>
            <p style={{ fontSize: 14.5, fontStyle: 'italic', color: 'var(--text-tertiary)', margin: '6px 0 0' }}>{partials.CUSTOMER}</p>
          </div>
        )}
        {partials.AGENT && (
          <div style={{ padding: '10px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Agent · Jane</span>
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
          {isLive ? 'Mic open · Jane' : 'Mic idle'}
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

// ─── Right rail tabs ──────────────────────────────────────────────────────────

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
      <span style={{ fontSize: 12.5, fontWeight: 500, color: vColor ?? 'var(--text-primary)' }}>{v}</span>
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

function MemberTab() {
  return (
    <>
      <SectionHead>Patient identity</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Full name" v="Michael R. Anderson" />
        <RailRow k="Date of birth" v="Apr 14, 1978" />
        <RailRow k="Member ID" v="ANH-2418-4421" />
        <RailRow k="Group" v="GRP-TX-00112" />
        <RailRow k="Plan" v="BCBS TX PPO · Gold" />
        <RailRow k="Effective" v="Jan 01, 2026" vColor="#16a34a" />
        <RailRow k="PCP" v="Dr. L. Okafor · Dallas Downtown" />
      </div>
      <SectionHead tag="Voice AI">Verification status</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricBox label="Name confirmed" value="✓" positive />
        <MetricBox label="Member ID" value="✓" positive />
        <MetricBox label="Claim ID" value="·" sub="pending" />
        <MetricBox label="HIPAA cleared" value="—" sub="awaits 3rd ID" />
      </div>
      <SectionHead>Contact preferences</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Mobile" v="+1 (214) 555-0188" />
        <RailRow k="Email" v="m.anderson@example.com" />
        <RailRow k="Preferred channel" v="SMS" />
        <RailRow k="Language" v="EN-US" />
      </div>
    </>
  )
}

function ClaimTab() {
  return (
    <>
      <SectionHead>Active claim · CLM-9047-2206</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Status" v="In review" vColor="#d97706" />
        <RailRow k="Service date" v="Apr 22, 2026" />
        <RailRow k="Provider" v="Baylor Scott & White" />
        <RailRow k="Service type" v="Outpatient · MRI lumbar" />
        <RailRow k="Billed" v="$3,420.00" />
        <RailRow k="Allowed" v="$1,810.00" />
        <RailRow k="Plan paid" v="$1,448.00" />
        <RailRow k="Patient resp." v="$362.00" />
      </div>
      <SectionHead tag="KB">Pending items</SectionHead>
      <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
        Adjudication waiting on provider response to <strong>operative report</strong> request (sent Apr 28). Expected resolution by <strong>May 22, 2026</strong>.
      </div>
      <SectionHead>Documents</SectionHead>
      {[
        { d: 'Apr 24', t: 'Claim received · 837P from clearinghouse' },
        { d: 'Apr 26', t: 'Auto-adjudication held · medical-necessity check' },
        { d: 'Apr 28', t: 'Records request sent to provider' },
        { d: 'May 03', t: 'Provider acknowledged · ETA 14 days' },
      ].map(i => (
        <div key={i.d} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', width: 48, flexShrink: 0, marginTop: 1 }}>{i.d}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{i.t}</span>
        </div>
      ))}
    </>
  )
}

function CoverageTab() {
  return (
    <>
      <SectionHead>Plan benefits · BCBS TX PPO Gold</SectionHead>
      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 12px' }}>
        <RailRow k="Network status" v="In-network" vColor="#16a34a" />
        <RailRow k="Deductible · ind." v="$750 met / $1,500" />
        <RailRow k="OOP max · ind." v="$2,140 met / $5,000" />
        <RailRow k="Copay · specialist" v="$45" />
        <RailRow k="Coinsurance" v="20% after ded." />
        <RailRow k="Prior auth · MRI" v="Required" vColor="#d97706" />
        <RailRow k="Prior auth · status" v="Approved · PA-77310" vColor="#16a34a" />
      </div>
      <SectionHead tag="Eligibility">Live check · 270/271</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricBox label="Active" value="Yes" positive />
        <MetricBox label="Effective" value="01/01/26" />
        <MetricBox label="Verified" value="Just now" />
        <MetricBox label="Source" value="BCBS" sub="270/271" />
      </div>
    </>
  )
}

function HistoryTab() {
  return (
    <>
      <SectionHead>Recent claims</SectionHead>
      {[
        { d: 'Apr 22', t: 'CLM-9047 · MRI lumbar · in review' },
        { d: 'Feb 09', t: 'CLM-8821 · Office visit · paid $40' },
        { d: 'Jan 14', t: 'CLM-8617 · Lab panel · paid $112' },
        { d: 'Nov 03', t: 'CLM-8104 · Specialist visit · paid $45' },
        { d: 'Sep 12', t: 'CLM-7710 · Annual physical · paid $0 (preventive)' },
      ].map(i => (
        <div key={i.d} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', width: 48, flexShrink: 0, marginTop: 1 }}>{i.d}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{i.t}</span>
        </div>
      ))}
      <SectionHead>Contact history · 90d</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricBox label="Calls" value="3" />
        <MetricBox label="Avg handle" value="6:42" sub="min" />
        <MetricBox label="CSAT" value="4.7" sub="/ 5" positive />
        <MetricBox label="FCR" value="100%" positive />
      </div>
    </>
  )
}

function ComplianceTab() {
  const flags = [
    { ok: true,  title: 'HIPAA · 3-ID verification in progress', sub: 'Name + Member ID captured. Claim ID still pending — do not disclose claim details yet.' },
    { ok: true,  title: 'Call recording consent · acknowledged',  sub: 'IVR consent captured at 09:31 · retained per Access Health policy' },
    { ok: false, title: 'PHI in transcript · auto-redaction on',  sub: 'Real-time PII/PHI masking active · review redaction log post-call' },
    { ok: true,  title: 'Authorization on file',                  sub: 'Patient signed Authorization for Use & Disclosure · valid through Dec 31, 2026' },
    { ok: false, title: 'Escalation path · supervisor available', sub: 'If claim status is ambiguous, transfer to Tier-2 (warm) instead of guessing' },
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
          { label: 'Approve', color: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)', count: 1, desc: 'Initiate formal appeal on denial' },
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

function RightRailPanel({ sopState, latestSuggestion }: { sopState: SopState; latestSuggestion?: { text: string; kind?: string } | null }) {
  const [active, setActive] = useState<RailTab>('member')
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--ah-emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Anderson, M.</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>Member · 6 yrs · PPO Gold · BCBS TX</div>
        </div>
      </div>

      <div style={{ padding: '12px 12px 0', flexShrink: 0 }}>
        <SopRail state={sopState} latestSuggestion={latestSuggestion ?? null} />
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
        {active === 'member'     && <MemberTab />}
        {active === 'claim'      && <ClaimTab />}
        {active === 'coverage'   && <CoverageTab />}
        {active === 'history'    && <HistoryTab />}
        {active === 'compliance' && <ComplianceTab />}
      </div>
    </div>
  )
}

// ─── Ask panel ────────────────────────────────────────────────────────────────

function AskPanel({ messages, onAsk, wsStatus }: {
  messages: { id: string; role: 'user' | 'assistant'; text: string; done: boolean }[]
  onAsk: (q: string) => void
  wsStatus: ConnectionStatus
}) {
  const [q, setQ] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const submit = () => { const trimmed = q.trim(); if (!trimmed) return; onAsk(trimmed); setQ('') }
  const isReady = wsStatus === 'connected'
  const disabled = !q.trim() || !isReady

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>◆ Ask Access Health AI</span>
        <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: wsStatus === 'connected' ? '#16a34a' : wsStatus === 'connecting' ? '#d97706' : '#dc2626', flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{wsStatus}</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 12.5, lineHeight: 1.6 }}>
            Ask anything about this patient — claim status, plan benefits, prior auth, appeal window, EOB. Answers come from the Access Health KB.
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%',
            background: m.role === 'user' ? 'var(--ah-moss)' : 'var(--bg-subtle)',
            border: `1px solid ${m.role === 'user' ? 'transparent' : 'var(--border-subtle)'}`,
            borderRadius: 10, padding: '8px 12px',
            color: m.role === 'user' ? '#fff' : 'var(--text-primary)', fontSize: 13, lineHeight: 1.5,
          }}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Ask about this patient or claim…"
          style={{ flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
        />
        <button onClick={submit} disabled={disabled} style={{
          background: 'var(--ah-moss)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}>Ask</button>
      </div>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: call.status === 'live' ? 'var(--ah-emerald)' : 'var(--text-tertiary)', flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: call.status === 'live' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          {call.status === 'live' ? `Live · ${elapsed}` : call.status === 'ended' ? 'Call ended' : 'Waiting for call'}
        </span>
        {call.callSid && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{call.callSid.slice(0, 16)}…</span>}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
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
      case 'call_start':   dispatch({ type: 'reset', callSid: e.callSid }); break
      case 'call_end':     dispatch({ type: 'callEnd' }); break
      case 'partial':      dispatch({ type: 'partial', label: e.label, text: e.text }); break
      case 'transcript':   dispatch({ type: 'turn', label: e.label, text: e.text }); break
      case 'assist_chunk': dispatch({ type: 'assistChunk', id: e.suggestionId, chunk: e.chunk, stepId: e.stepId }); break
      case 'assist_done':  dispatch({ type: 'assistDone', id: e.suggestionId, kind: e.kind, latencyMs: e.latencyMs, timeToFirstToken: e.timeToFirstToken, inputTokens: e.inputTokens, outputTokens: e.outputTokens, stepId: e.stepId }); break
      case 'ask_chunk':    dispatch({ type: 'askChunk', id: e.askId, chunk: e.chunk }); break
      case 'ask_done':     dispatch({ type: 'askDone', id: e.askId, fullText: e.fullText }); break
      case 'sop_state':    dispatch({ type: 'sopState', state: { currentStepIndex: e.currentStepIndex, completedStepIds: e.completedStepIds } }); break
    }
  }, [])

  const { status: wsStatus, send } = useAgentSocket(handleEvent)

  const suggestionsByTurn = useMemo(() => {
    const map = new Map<number, Suggestion[]>()
    for (const s of Object.values(state.suggestions)) {
      if (!map.has(s.triggerTurnIndex)) map.set(s.triggerTurnIndex, [])
      map.get(s.triggerTurnIndex)!.push(s)
    }
    for (const list of map.values()) list.sort((a, b) => a.startedAt - b.startedAt)
    return map
  }, [state.suggestions])

  const handleAsk = useCallback((q: string) => {
    const id = `ask-${Date.now()}`
    dispatch({ type: 'askSend', id, question: q })
    send({ type: 'ask', askId: id, question: q })
  }, [send])

  const inferredSopState = useMemo(
    () => inferSopState(DEFAULT_WORKFLOW, state.turns.map(t => t.text)),
    [state.turns],
  )
  const effectiveSopState: SopState = state.sopFromServer ?? inferredSopState

  const latestSuggestion = useMemo(() => {
    const all = Object.values(state.suggestions)
    if (all.length === 0) return null
    const sorted = [...all].sort((a, b) => b.startedAt - a.startedAt)
    return { text: sorted[0].text, kind: sorted[0].kind }
  }, [state.suggestions])

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Voice Intelligence</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
            Live call <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>assist</em>
          </h1>
          <StatusBar call={state.call} wsStatus={wsStatus} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 360px', gridTemplateRows: '1fr 260px', gap: 16 }}>
        {/* Transcript — spans both rows on left */}
        <div style={{ gridRow: '1 / 3' }}>
          <TranscriptPanel turns={state.turns} partials={state.partials} suggestionsByTurn={suggestionsByTurn} call={state.call} />
        </div>
        {/* Right rail top */}
        <div>
          <RightRailPanel sopState={effectiveSopState} latestSuggestion={latestSuggestion} />
        </div>
        {/* Ask panel bottom right */}
        <div>
          <AskPanel messages={state.askMessages} onAsk={handleAsk} wsStatus={wsStatus} />
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
