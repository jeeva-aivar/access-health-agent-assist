'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

const TODAY_MEETINGS = [
  { id: 1, time: '08:45', duration: '15m', title: 'Hub huddle',                              with: 'Michael Reed',          type: 'In-person',   link: '', score: 38, reason: 'Routine standup — low information density for you.' },
  { id: 2, time: '09:30', duration: '30m', title: 'Prior-auth call · Iyer, M.',          with: 'Vishnu Iyer',      type: 'Call',        link: '', score: 92, reason: 'High-value member call — your presence required.' },
  { id: 3, time: '11:00', duration: '45m', title: 'Denials committee',                       with: 'Hub team',              type: 'In-person',   link: '', score: 87, reason: 'Key decision gate — your input needed on the Verma case.' },
  { id: 4, time: '11:00', duration: '30m', title: 'Hub standup',                             with: 'Ops team',              type: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij', score: 44, reason: 'Status round — avatar can take notes and debrief you.' },
  { id: 5, time: '14:00', duration: '60m', title: 'Quarterly review · Davis & Park',         with: 'Davis & Park practice', type: 'Google Meet', link: 'https://meet.google.com/mse-cjyq-rsr', score: 71, reason: 'Provider contract review — avatar can attend and surface action items.' },
  { id: 6, time: '15:00', duration: '45m', title: 'Q4 caseload sign-off',                    with: 'Internal',              type: 'Teams',       link: 'https://teams.microsoft.com/l/meetup-join/abc123', score: 55, reason: 'Doc review — avatar can capture decisions and draft memo.' },
  { id: 7, time: '16:00', duration: '30m', title: 'Benefits walk-through · Garcia family',   with: 'Luis Garcia',           type: 'Call',        link: '', score: 88, reason: 'Supplemental-rider moment — your relationship matters here.' },
  { id: 8, time: '17:30', duration: '20m', title: 'EOD debrief · 1:1',                       with: 'Michael Reed',          type: 'In-person',   link: '', score: 60, reason: 'Team Lead 1:1 — your presence expected.' },
]

function scoreColor(score: number) {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#d97706'
  return 'var(--text-tertiary)'
}

function typeIcon(type: string) {
  if (type === 'Google Meet') return 'Video'
  if (type === 'Teams') return 'Video'
  if (type === 'Call') return 'Phone'
  return 'Users'
}

export default function MeetingAvatarPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [avatarJoined, setAvatarJoined] = useState<Set<number>>(new Set())

  // Adhoc dispatcher state
  const [adhocLink, setAdhocLink] = useState('')
  const [adhocStatus, setAdhocStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function toggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function dispatchSelected() {
    // Mock — mark all selected as avatar joined
    setAvatarJoined(prev => new Set([...prev, ...selected]))
    setSelected(new Set())
  }

  function removeAvatar(id: number) {
    setAvatarJoined(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  async function dispatchAdhoc() {
    if (!adhocLink.trim()) return
    setAdhocStatus('loading')
    try {
      const res = await fetch('/api/avatar/join-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_url: adhocLink }),
      })
      setAdhocStatus(res.ok ? 'success' : 'error')
      if (res.ok) setAdhocLink('')
    } catch {
      setAdhocStatus('error')
    }
  }

  const selectedCount = selected.size

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--ah-emerald)', marginBottom: 10 }}>19 MAY 2026 · JANE&apos;S CALENDAR</div>
          <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            Your meetings today — <em style={{ color: 'var(--ah-emerald)', fontStyle: 'italic' }}>select which the avatar attends.</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6, maxWidth: 620 }}>
            AI scores each meeting against your priorities. Select the ones you want the avatar to join — it will take notes and send you a debrief.
          </p>
        </div>

        {/* Adhoc dispatcher */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px 20px 16px', marginBottom: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 12 }}>DISPATCH AVATAR TO AN AD-HOC MEETING</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={adhocLink}
              onChange={e => { setAdhocLink(e.target.value); setAdhocStatus('idle') }}
              placeholder="Paste Google Meet link…"
              style={{ flex: 1, height: 40, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0 14px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={dispatchAdhoc}
              disabled={!adhocLink.trim() || adhocStatus === 'loading'}
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', height: 40, padding: '0 20px', borderRadius: 8, border: 'none', background: adhocLink.trim() ? 'var(--idfc-red)' : 'var(--bg-subtle)', color: adhocLink.trim() ? '#fff' : 'var(--text-tertiary)', cursor: adhocLink.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
            >
              {adhocStatus === 'loading' ? 'DISPATCHING…' : 'DISPATCH AVATAR'}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
            {adhocStatus === 'success' && <span style={{ color: '#16a34a' }}>Avatar dispatched — debrief will arrive after the meeting.</span>}
            {adhocStatus === 'error' && <span style={{ color: 'var(--idfc-red-bright)' }}>Dispatch failed. Check the link and try again.</span>}
            {adhocStatus === 'idle' && <span style={{ color: 'var(--text-tertiary)' }}>Avatar will join, take notes, and send you a debrief.</span>}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, marginTop: 20 }}>
          {[{ color: '#16a34a', label: 'Score 80+ · attend yourself' }, { color: '#d97706', label: 'Score 60–79 · your call' }, { color: 'var(--text-tertiary)', label: 'Score <60 · good for avatar' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono',monospace" }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Meeting list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {TODAY_MEETINGS.map(m => {
            const isSelected = selected.has(m.id)
            const isJoined = avatarJoined.has(m.id)

            return (
              <div
                key={m.id}
                onClick={() => !isJoined && toggle(m.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto',
                  alignItems: 'center', gap: 16,
                  background: isJoined ? 'rgba(22,163,74,0.04)' : isSelected ? 'rgba(139,26,26,0.05)' : 'var(--bg-card)',
                  border: isJoined ? '1px solid rgba(22,163,74,0.25)' : isSelected ? '1px solid rgba(139,26,26,0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: 10, padding: '14px 18px',
                  cursor: isJoined ? 'default' : 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {/* Time */}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {m.time}
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{m.duration}</div>
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name={typeIcon(m.type)} size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</span>
                    {isJoined && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 4, padding: '2px 6px' }}>AVATAR JOINING</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 3 }}>{m.with} · {m.type}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>{m.reason}</div>
                </div>

                {/* Score + checkbox/remove */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 28, fontWeight: 700, color: scoreColor(m.score), lineHeight: 1 }}>{m.score}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>SCORE</div>
                  </div>
                  {isJoined ? (
                    <button
                      onClick={e => { e.stopPropagation(); removeAvatar(m.id) }}
                      title="Remove avatar"
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Icon name="X" size={12} style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: isSelected ? '2px solid var(--idfc-red)' : '2px solid var(--border-subtle)',
                      background: isSelected ? 'var(--idfc-red)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 120ms ease',
                    }}>
                      {isSelected && <Icon name="Check" size={13} style={{ color: '#fff' }} />}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Dispatch bar */}
        <div style={{ position: 'sticky', bottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <Icon name="Bot" size={18} style={{ color: selectedCount > 0 ? 'var(--idfc-red)' : 'var(--text-tertiary)' }} />
          <div style={{ flex: 1 }}>
            {selectedCount === 0
              ? <span style={{ fontSize: 13.5, color: 'var(--text-tertiary)' }}>Select meetings above to assign the avatar — click any row to select.</span>
              : <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{selectedCount} meeting{selectedCount > 1 ? 's' : ''} selected — avatar will join and debrief you after.</span>
            }
          </div>
          <button
            onClick={dispatchSelected}
            disabled={selectedCount === 0}
            style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: selectedCount > 0 ? 'var(--idfc-red)' : 'var(--bg-subtle)',
              color: selectedCount > 0 ? '#fff' : 'var(--text-tertiary)',
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 120ms ease',
            }}
          >
            {`ASSIGN AVATAR${selectedCount > 1 ? 'S' : ''}`}
          </button>
        </div>

      </div>
    </AppShell>
  )
}
