'use client'
import { useState, useMemo } from 'react'
import { AppShell } from '@/components/shared/AppShell'
import { useApp } from '@/lib/app-context'
import { MOCK } from '@/lib/mock-data'

type Tab = 'week' | 'month' | 'quarter'

function deltaColor(tone: string) {
  if (tone === 'success') return 'var(--success)'
  if (tone === 'danger') return 'var(--danger)'
  return 'var(--text-secondary)'
}

function LeaderboardContent() {
  const app = useApp()
  const [tab, setTab] = useState<Tab>('week')

  const baseRows = MOCK.leaderboard[tab]
  const rows = useMemo(() => {
    return baseRows
      .map(r => r.you ? { ...r, points: r.points + app.state.sessionPoints } : r)
      .sort((a, b) => b.points - a.points)
      .map((r, i) => ({ ...r, rank: i + 1 }))
  }, [baseRows, app.state.sessionPoints])

  const me = rows.find(r => r.you)

  return (
    <div className="anim-fade" style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div className="h1">Leaderboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="caption" style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>MUMBAI N · 28 RMS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            {([['week', 'This Week'], ['month', 'This Month'], ['quarter', 'This Quarter']] as [Tab, string][]).map(([k, lbl]) => (
              <button key={k} className={'tab ' + (tab === k ? 'active' : '')} onClick={() => setTab(k)}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 32 }}>
        {/* Left: rank + table */}
        <div>
          {/* Rank & streak hero */}
          <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 40, animationDelay: '60ms' }}>
            <div>
              <div className="caption" style={{ fontSize: 11 }}>YOUR RANK</div>
              <div className="num" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 12 }}>#{me ? me.rank : '—'}</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: deltaColor(me?.deltaTone ?? 'secondary') }}>
                <span className="num">{me?.delta}</span>
                <span style={{ color: 'var(--text-secondary)' }}>vs last {tab === 'week' ? 'week' : tab === 'month' ? 'month' : 'quarter'}</span>
              </div>
            </div>
            <div>
              <div className="caption" style={{ fontSize: 11 }}>STREAK</div>
              <div style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 12 }}>
                {me?.streak.replace('d', '')} <span style={{ fontSize: 24, color: 'var(--text-tertiary)', fontWeight: 400 }}>days</span>
              </div>
              <div className="caption" style={{ marginTop: 12, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>personal best: 12 days</div>
            </div>
          </div>

          {/* Table */}
          <div className="anim-fade-up" style={{ animationDelay: '120ms' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 100px 80px', alignItems: 'center', padding: '8px 16px' }} className="caption">
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10.5 }}>#</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 10.5 }}>NAME</div>
              <div className="num" style={{ color: 'var(--text-tertiary)', fontSize: 10.5, textAlign: 'right' }}>STREAK</div>
              <div className="num" style={{ color: 'var(--text-tertiary)', fontSize: 10.5, textAlign: 'right' }}>POINTS</div>
              <div className="num" style={{ color: 'var(--text-tertiary)', fontSize: 10.5, textAlign: 'right' }}>Δ</div>
            </div>
            {rows.map(r => (
              <div
                key={r.name}
                style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 80px 100px 80px',
                  alignItems: 'center', padding: '14px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: r.you ? 'var(--bg-subtle)' : 'transparent',
                  borderLeft: r.you ? '2px solid var(--idfc-red)' : '2px solid transparent',
                  paddingLeft: r.you ? 14 : 16,
                  cursor: 'pointer', transition: 'background 120ms ease',
                }}
              >
                <div className="font-mono num" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{String(r.rank).padStart(2, '0')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                    {r.name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: r.you ? 600 : 500 }}>{r.name}</span>
                </div>
                <div className="num font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>{r.streak}</div>
                <div className="num font-mono" style={{ fontSize: 14, fontWeight: 500, textAlign: 'right' }}>{r.points.toLocaleString()}</div>
                <div className="num font-mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: deltaColor(r.deltaTone) }}>{r.delta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: points guide */}
        <aside className="card density-card anim-fade-up" style={{ padding: 22, alignSelf: 'start', animationDelay: '180ms' }}>
          <div className="caption" style={{ fontSize: 11 }}>HOW POINTS WORK</div>
          <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { delta: '+50',  label: 'Auto-action approved',    tone: 'success' },
              { delta: '+100', label: 'Priority task completed', tone: 'success' },
              { delta: '+200', label: 'NBA converted',           tone: 'success' },
              { delta: '−150', label: 'SLA breach',              tone: 'danger' },
            ].map(p => (
              <li key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="body" style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                <span className="font-mono num" style={{ fontSize: 13, fontWeight: 600, color: p.tone === 'success' ? 'var(--success)' : 'var(--danger)' }}>{p.delta} pts</span>
              </li>
            ))}
          </ul>
          {app.state.sessionPoints > 0 && (
            <div className="anim-fade" style={{ marginTop: 20, background: '#eef4ee', border: '1px solid #c8dccd', borderRadius: 8, padding: 12 }}>
              <div className="caption" style={{ color: 'var(--success)', fontSize: 10.5 }}>SESSION GAIN</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)', marginTop: 4 }}>+{app.state.sessionPoints} pts</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <AppShell>
      <LeaderboardContent />
    </AppShell>
  )
}
