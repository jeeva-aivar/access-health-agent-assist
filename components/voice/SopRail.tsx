'use client'
import { useState } from 'react'
import { DEFAULT_WORKFLOW, type SopWorkflow } from '@/lib/sop-rcm'
import { stepStatus, type SopState } from '@/lib/sop-state'

interface Props {
  workflow?: SopWorkflow
  state: SopState
  latestSuggestion?: { text: string; kind?: string } | null
}

const STATUS_STYLE = {
  done:    { bg: 'rgba(30,48,130,0.10)',  border: '#1E3082', text: '#131F53', label: 'Done' },
  current: { bg: 'rgba(59,86,183,0.18)', border: '#3B56B7', text: '#1F5E2A', label: 'Current' },
  pending: { bg: 'var(--bg-subtle)',      border: 'var(--border-subtle)', text: 'var(--text-tertiary)', label: 'Pending' },
} as const

export function SopRail({ workflow = DEFAULT_WORKFLOW, state, latestSuggestion }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(workflow.steps[state.currentStepIndex]?.id ?? null)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ah-emerald)' }}>SOP</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono',monospace" }}>· {state.completedStepIds.length}/{workflow.steps.length}</span>
      </div>
      <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }}>
        {workflow.name}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
        {workflow.description}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {workflow.steps.map((step, idx) => {
          const status = stepStatus(workflow, state, idx)
          const style = STATUS_STYLE[status]
          const expanded = expandedId === step.id
          const isCurrent = status === 'current'
          return (
            <div
              key={step.id}
              onClick={() => setExpandedId(expanded ? null : step.id)}
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: status === 'done' ? '#1E3082' : status === 'current' ? '#3B56B7' : 'transparent',
                  border: status === 'pending' ? `1.5px solid ${style.border}` : 'none',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
                }}>
                  {status === 'done' ? '✓' : <span style={{ color: status === 'pending' ? 'var(--text-tertiary)' : '#fff' }}>{idx + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, lineHeight: 1.35 }}>{step.description}</div>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: style.text,
                  padding: '2px 6px', borderRadius: 4,
                  border: `1px solid ${style.border}`, background: 'var(--bg-card)',
                  flexShrink: 0,
                }}>{style.label}</span>
              </div>

              {expanded && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border-subtle)', fontSize: 11.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  {step.guidance}
                </div>
              )}

              {isCurrent && latestSuggestion?.text && (
                <div style={{
                  marginTop: 8, padding: '8px 10px', borderRadius: 6,
                  background: 'rgba(59,86,183,0.10)', border: '1px solid rgba(59,86,183,0.3)',
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ah-deep)', marginBottom: 4 }}>
                    ◆ AI · suggested next line
                  </div>
                  <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 13, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {latestSuggestion.text}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
