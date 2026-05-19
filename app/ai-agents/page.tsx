'use client'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { Icon } from '@/components/ui/Icon'

const AGENTS = [
  {
    id: 'pitch-builder',
    label: 'Benefits Pitch Builder',
    icon: 'Presentation',
    tagline: 'Generate tailored plan-benefit walkthroughs & talking points for member meetings',
    latency: '~53s',
    color: 'var(--ah-emerald)',
    colorRaw: '#56BB64',
    fields: ['Member or family', 'Plan tier & event', 'Riders in scope', 'Meeting objective'],
  },
  {
    id: 'meeting-preparer',
    label: 'Meeting Preparer',
    icon: 'CalendarCheck',
    tagline: 'Pre-meeting brief with agenda, open claims & care context',
    latency: '~20s',
    color: '#2563eb',
    colorRaw: '#2563eb',
    fields: ['Member & meeting details', 'Duration & channel', 'Sections to include', 'Meeting purpose'],
  },
  {
    id: 'earnings-reviewer',
    label: 'Denials Reviewer',
    icon: 'TrendingUp',
    tagline: 'Synthesise denial codes & appeal patterns into per-member action briefs',
    latency: '~25s',
    color: '#16a34a',
    colorRaw: '#16a34a',
    fields: ['Member or cohort', 'Date range', 'Denial codes in scope', 'Output depth'],
  },
  {
    id: 'model-builder',
    label: 'Coverage Planner',
    icon: 'BarChart3',
    tagline: 'Benefit fit modelling with rider deltas, out-of-pocket projections & scenarios',
    latency: '~35s',
    color: '#7c3aed',
    colorRaw: '#7c3aed',
    fields: ['Member & plan year', 'Care horizon', 'Optimisation objective', 'Coverage constraints'],
  },
  {
    id: 'memo-maker',
    label: 'Appeal Drafter',
    icon: 'FileText',
    tagline: 'Post-call recap with appeal narrative, action items & HIPAA flags',
    latency: '~27s',
    color: '#d97706',
    colorRaw: '#d97706',
    fields: ['Member & claim IDs', 'Appeal type & audience', 'Sections to include', 'Compliance region'],
  },
]

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/ai-agents/${agent.id}`)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'border-color 150ms, box-shadow 150ms', display: 'flex', flexDirection: 'column', gap: 16 }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = agent.colorRaw + '50'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${agent.colorRaw}12` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${agent.colorRaw}15`, border: `1px solid ${agent.colorRaw}30`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name={agent.icon} size={20} style={{ color: agent.colorRaw }} />
        </div>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginTop: 4 }}>{agent.latency}</span>
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{agent.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{agent.tagline}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {agent.fields.map(f => (
          <span key={f} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '3px 8px' }}>{f}</span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: agent.colorRaw, fontSize: 13, fontWeight: 500, marginTop: 'auto' }}>
        <span>Open agent</span>
        <Icon name="ArrowRight" size={14} style={{ color: agent.colorRaw }} />
      </div>
    </div>
  )
}

function HubContent() {
  return (
    <div style={{ padding: '36px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>AWS Bedrock AgentCore · us-east-1</div>
        <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 44, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.1 }}>
          AI <em style={{ fontStyle: 'italic', color: 'var(--ah-emerald)' }}>Agents</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          Five specialised agents ready to run. Select one, fill in the details, and get a structured output in seconds.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, border: '1px solid var(--border-subtle)', marginBottom: 36 }}>
        {[
          { label: 'AGENTS DEPLOYED', value: '5' },
          { label: 'AVG RESPONSE TIME', value: '32s' },
          { label: 'AUTH', value: 'SigV4' },
        ].map((k, i) => (
          <div key={k.label} style={{ padding: '16px 22px', borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 28, color: 'var(--ah-emerald)', lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>

      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
        <Icon name="ShieldCheck" size={13} />
        <span>All agent requests are signed server-side with AWS SigV4 — credentials never exposed to the browser.</span>
      </div>
    </div>
  )
}

export default function AIAgentsHub() {
  return <AppShell><HubContent /></AppShell>
}
