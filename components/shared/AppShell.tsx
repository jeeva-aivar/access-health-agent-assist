'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@/components/ui/Icon'
import { StatusDot } from '@/components/ui/StatusDot'
import { Blade } from '@/components/ui/Blade'
import { Modal } from '@/components/ui/Modal'
import { FieldLabel, TextInput, TextArea, Select, Switch, KV } from '@/components/ui/FormElements'
import { useApp } from '@/lib/app-context'
import { MOCK } from '@/lib/mock-data'

// ─── Nav config ─────────────────────────────────────────────────────────────
type NavChild = { id: string; label: string; path: string }
type NavItem = { id: string; label: string; icon: string; path: string; children?: NavChild[] }
type NavSection = { section: string; items: NavItem[] }
const NAV_SECTIONS: NavSection[] = [
  {
    section: 'TODAY',
    items: [
      { id: 'briefing',    label: 'Brief Dashboard',    icon: 'Sun',        path: '/morning-briefing' },
      { id: 'priority',    label: 'Priority Stack',     icon: 'ListChecks', path: '/priority-stack' },
      { id: 'actions',     label: 'Auto-actions',       icon: 'Sparkles',   path: '/auto-actions' },
      { id: 'debrief',     label: 'Daily Debrief',      icon: 'Moon',       path: '/daily-debrief' },
      { id: 'voice',       label: 'Live Call Assist',   icon: 'Mic',        path: '/voice-intelligence' },
      { id: 'avatar',      label: 'Patient Avatar',     icon: 'UserCircle', path: '/meeting-avatar' },
      // AI Agents temporarily hidden — backend agent runtimes not yet wired for
      // the healthcare demo. Restore this block when AgentCore ARNs in
      // app/api/agents/invoke/route.ts are updated.
      // { id: 'ai-agents',   label: 'AI Agents',          icon: 'Bot',        path: '/ai-agents',
      //   children: [
      //     { id: 'pitch-builder',     label: 'Benefits Pitch Builder',  path: '/ai-agents/pitch-builder' },
      //     { id: 'meeting-preparer',  label: 'Meeting Preparer',        path: '/ai-agents/meeting-preparer' },
      //     { id: 'earnings-reviewer', label: 'Denials Reviewer',        path: '/ai-agents/earnings-reviewer' },
      //     { id: 'model-builder',     label: 'Coverage Planner',        path: '/ai-agents/model-builder' },
      //     { id: 'memo-maker',        label: 'Appeal Drafter',          path: '/ai-agents/memo-maker' },
      //   ],
      // },
    ],
  },
  {
    section: 'CUSTOMERS',
    items: [
      { id: 'portfolio',   label: 'Caseload',         icon: 'Users',      path: '/portfolio' },
      { id: 'book',        label: 'All Cases',        icon: 'Wallet',     path: '/consolidated-book' },
    ],
  },
  {
    section: 'PERFORMANCE',
    items: [
      { id: 'leaderboard', label: 'Leaderboard',      icon: 'Trophy',     path: '/leaderboard' },
    ],
  },
]

const NOTIFICATIONS = [
  { t: '2 min ago',  title: 'Supervisor aligned on stack',  detail: 'All 4 priorities locked for the shift.',                tone: 'success' },
  { t: '18 min ago', title: 'SLA risk · Iyer auth',     detail: 'Prior-auth status overdue — review queued.',           tone: 'warning' },
  { t: '1 hr ago',   title: 'Sentiment swing · Garcia',     detail: '+18 pts after benefits clarification.',                tone: 'info' },
  { t: '3 hr ago',   title: 'Verma records received',       detail: 'Medical records auto-attached to case.',                tone: 'success' },
]

const SEARCH_RESULTS = [
  { kind: 'Patient',  label: 'Iyer, M. · Prior-auth pending',         icon: 'User' },
  { kind: 'Patient',  label: 'Garcia family · Eligibility · Cigna',       icon: 'User' },
  { kind: 'Patient',  label: 'Verma, R. · Claim resubmission Q4',         icon: 'User' },
  { kind: 'Task',     label: 'Q4 caseload review · sign-off',             icon: 'ListChecks' },
  { kind: 'Doc',      label: 'Eligibility verification SOP v3.1',          icon: 'FileText' },
  { kind: 'Doc',      label: 'Claims denial appeal pre-read · 12 pages',  icon: 'FileText' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function LogoMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/corebridge-logo.png"
      alt="Corebridge Financial"
      style={{
        display: 'block', flexShrink: 0,
        height: collapsed ? 20 : 26,
        width: 'auto',
        objectFit: 'contain',
        // Logo PNG has a black background; screen blend makes black transparent
        // so only the coloured elements render over the dark sidebar.
        mixBlendMode: 'screen',
        filter: 'brightness(1.8)',
      }}
    />
  )
}

function ProfileBlade({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rm = MOCK.rm
  return (
    <Blade open={open} onClose={onClose} eyebrow="AGENT AI WORKSPACE" title={rm.name} width={520}
      footer={<div style={{ display: 'flex', gap: 8 }}><button className="btn-secondary" onClick={onClose}>Close</button></div>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{rm.initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{rm.name}</div>
          <div className="caption" style={{ marginTop: 4, textTransform: 'none', letterSpacing: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{rm.role} · Employee #AH-44219</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <KV k="Email"          v="afsheen.mohammed@accesshealthcare.com" />
        <KV k="Mobile"         v="+1 (555) ••• ••89" />
        <KV k="Location"       v="Dallas Hub · Floor 3" />
        <KV k="Reports to"     v="Michael Reed · Team Lead" />
        <KV k="Caseload"       v={`${rm.portfolio} active cases`} />
        <KV k="Joined"         v="Mar 2021 · 5 yrs 2 mo" />
        <KV k="Certifications" v="CRCR · HIPAA · AAHAM CRCS" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
        {[['CASES HANDLED','1,240'],['FCR','62%'],['CSAT','+58']].map(([label, val]) => (
          <div key={label} style={{ padding: 14, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
            <div className="caption" style={{ fontSize: 10.5 }}>{label}</div>
            <div className="num" style={{ marginTop: 4, fontSize: 20, fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>
    </Blade>
  )
}

function PreferencesModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [theme, setTheme] = useState('System')
  const [lang, setLang] = useState('English')
  const [tz, setTz] = useState('America/Chicago (CT)')
  const [aiVoice, setAiVoice] = useState('Concise')
  const [autoBrief, setAutoBrief] = useState(true)
  return (
    <Modal open={open} onClose={onClose} eyebrow="PREFERENCES" title="Tune your workspace" width={520}
      footer={<div style={{ display: 'flex', gap: 8 }}><button className="btn-primary" onClick={onSave}>Save</button><button className="btn-secondary" onClick={onClose}>Cancel</button></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><FieldLabel>THEME</FieldLabel><Select value={theme} onChange={setTheme} options={['System','Light','Dark']} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><FieldLabel>LANGUAGE</FieldLabel><Select value={lang} onChange={setLang} options={['English','Spanish','Tagalog']} /></div>
          <div><FieldLabel>TIMEZONE</FieldLabel><Select value={tz} onChange={setTz} options={['America/Chicago (CT)','America/New_York (ET)','America/Los_Angeles (PT)']} /></div>
        </div>
        <div><FieldLabel>AI ASSISTANT VOICE</FieldLabel><Select value={aiVoice} onChange={setAiVoice} options={['Concise','Detailed','Coaching']} /></div>
        <div style={{ marginTop: 8 }}><Switch checked={autoBrief} onChange={setAutoBrief} label="Open Morning Briefing automatically at login" /></div>
      </div>
    </Modal>
  )
}

function NotificationSettingsModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [s, setS] = useState({ sla: true, sentiment: true, manager: true, deals: true, leaderboard: false, quiet: true, pushDigest: false })
  const set = (k: string, v: boolean) => setS(x => ({ ...x, [k]: v }))
  const items: [string, string, string][] = [
    ['sla',         'SLA breach risk',          'Predictive 48-hr SLA alerts'],
    ['sentiment',   'Sentiment swings',         'Caller sentiment shifts ±10 pts'],
    ['manager',     'Supervisor alignment',     'When your team lead pins or comments'],
    ['deals',       'Case stage changes',       'Verified, in-review, resolved'],
    ['leaderboard', 'Leaderboard rank changes', 'When you move up or down'],
  ]
  return (
    <Modal open={open} onClose={onClose} eyebrow="NOTIFICATIONS" title="What should buzz you?" width={520}
      footer={<div style={{ display: 'flex', gap: 8 }}><button className="btn-primary" onClick={onSave}>Save</button><button className="btn-secondary" onClick={onClose}>Cancel</button></div>}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
              <div className="body" style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{desc}</div>
            </div>
            <Switch checked={(s as Record<string,boolean>)[k]} onChange={(v) => set(k, v)} label={(s as Record<string,boolean>)[k] ? 'On' : 'Off'} />
          </div>
        ))}
        <div style={{ padding: '14px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <Switch checked={s.quiet} onChange={(v) => set('quiet', v)} label="Quiet hours · 19:00 – 07:00 CT" />
        </div>
        <div style={{ padding: '0 0 14px 0' }}>
          <Switch checked={s.pushDigest} onChange={(v) => set('pushDigest', v)} label="Mobile push (daily digest only)" />
        </div>
      </div>
    </Modal>
  )
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = [
    { ico: 'BookOpen',      t: 'Read the agent playbook',        d: 'How Agent AI Workspace fits your day · 12 min read' },
    { ico: 'PlayCircle',    t: 'Watch the 3-min walkthrough',    d: 'Morning briefing → debrief in one video' },
    { ico: 'MessageCircle', t: 'Chat with the Corebridge AI bot', d: 'Avg response 12 sec · 24×7' },
    { ico: 'Phone',         t: 'Call IT helpdesk',               d: '+1 (888) 555-4332 · Mon–Sat 08:00–22:00 CT' },
    { ico: 'Mail',          t: 'Email support',                  d: 'agent.workspace.support@accesshealthcare.com' },
  ]
  return (
    <Modal open={open} onClose={onClose} eyebrow="HELP & SUPPORT" title="We're here to help" width={520}
      footer={<div style={{ display: 'flex', gap: 8 }}><button className="btn-secondary" onClick={onClose}>Close</button></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it) => (
          <div key={it.t} className="row-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, background: 'var(--bg-subtle)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--idfc-red)', flexShrink: 0 }}>
              <Icon name={it.ico} size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{it.t}</div>
              <div className="body" style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{it.d}</div>
            </div>
            <Icon name="ChevronRight" size={14} style={{ color: 'var(--text-tertiary)', marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div className="caption" style={{ marginTop: 16, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)', fontSize: 12 }}>
        Agent AI Workspace v2.4 · Build 2026.05.19 · Patch notes →
      </div>
    </Modal>
  )
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

function Topbar({ title, sidebarW }: { title: string; sidebarW: number }) {
  const app = useApp()
  const [open, setOpen] = useState<'search' | 'bell' | 'profile' | null>(null)
  const [q, setQ] = useState('')
  const [profileBlade, setProfileBlade] = useState<string | null>(null)
  const [notifs] = useState(NOTIFICATIONS.map(n => ({ ...n, read: false })))
  const wrapRef = useRef<HTMLElement>(null)

  const unreadCount = notifs.filter(n => !n.read).length

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen('search') }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [])

  const filtered = SEARCH_RESULTS.filter(r => !q || r.label.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <header
        ref={wrapRef}
        style={{
          position: 'fixed', top: 0, left: sidebarW, right: 0,
          height: 'var(--topbar-h)',
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
          zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', transition: 'left 200ms ease',
        }}
      >
        {/* Left: title + timestamp */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>09:30 CT · TUE 19 MAY 2026</div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Toast */}
          {app.toastMsg && (
            <div className="anim-fade" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 8, background: '#eef4ee', border: '1px solid #c8dccd', color: 'var(--success)', fontSize: 12, fontWeight: 500 }}>
              <Icon name="Check" size={14} /><span>{app.toastMsg}</span>
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(open === 'search' ? null : 'search')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: 12, minWidth: 280, cursor: 'pointer' }}
            >
              <Icon name="Search" size={14} />
              <span>Search patients, cases, docs…</span>
              <span className="font-mono" style={{ fontSize: 11, opacity: 0.7, marginLeft: 'auto' }}>⌘K</span>
            </button>
            {open === 'search' && (
              <div className="anim-fade-up" style={{ position: 'absolute', right: 0, top: 38, width: 420, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, boxShadow: '0 18px 40px -12px rgba(20,15,10,0.18)', overflow: 'hidden', zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Icon name="Search" size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type to filter…" style={{ flex: 1, background: 'transparent', outline: 0, border: 0, fontSize: 14 }} />
                  <span className="caption" style={{ fontSize: 10 }}>Esc</span>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {filtered.length === 0 && <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No matches</div>}
                  {filtered.map((r, i) => (
                    <div key={i} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }} onClick={() => setOpen(null)}>
                      <Icon name={r.icon} size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{r.label}</div>
                      <span className="caption" style={{ fontSize: 10 }}>{r.kind}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(open === 'bell' ? null : 'bell')}
              className="btn-ghost"
              style={{ height: 32, width: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              title="Notifications"
            >
              <Icon name="Bell" size={16} />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, borderRadius: 999, background: 'var(--idfc-red-bright)' }} />}
            </button>
            {open === 'bell' && (
              <div className="anim-fade-up" style={{ position: 'absolute', right: 0, top: 38, width: 360, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, boxShadow: '0 18px 40px -12px rgba(20,15,10,0.18)', overflow: 'hidden', zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="caption" style={{ fontSize: 11 }}>NOTIFICATIONS · {NOTIFICATIONS.length}</div>
                  <button className="btn-ghost" style={{ height: 24, fontSize: 12 }}>Mark all read</button>
                </div>
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="row-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                    <span className={'dot dot-' + n.tone} style={{ marginTop: 7 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{n.title}</div>
                      <div className="body" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{n.detail}</div>
                      <div className="font-mono caption" style={{ fontSize: 10, marginTop: 4 }}>{n.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(open === 'profile' ? null : 'profile')}
              className="avatar"
              style={{ width: 30, height: 30, fontSize: 11, cursor: 'pointer', outline: open === 'profile' ? '2px solid var(--idfc-red)' : 'none', outlineOffset: 1 }}
            >
              {MOCK.rm.initials}
            </button>
            {open === 'profile' && (
              <div className="anim-fade-up" style={{ position: 'absolute', right: 0, top: 38, width: 260, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, boxShadow: '0 18px 40px -12px rgba(20,15,10,0.18)', overflow: 'hidden', zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{MOCK.rm.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{MOCK.rm.name}</div>
                    <div className="caption" style={{ fontSize: 10.5, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>afsheen.mohammed@accesshealthcare · Agent</div>
                  </div>
                </div>
                {[
                  { ico: 'User',       label: 'View profile',         action: () => { setOpen(null); setProfileBlade('profile') } },
                  { ico: 'Settings',   label: 'Preferences',          action: () => { setOpen(null); setProfileBlade('prefs') } },
                  { ico: 'BellRing',   label: 'Notification settings', action: () => { setOpen(null); setProfileBlade('notifs') } },
                  { ico: 'HelpCircle', label: 'Help & support',        action: () => { setOpen(null); setProfileBlade('help') } },
                ].map((it) => (
                  <div key={it.label} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: '1px solid var(--border-subtle)', fontSize: 13.5 }} onClick={it.action}>
                    <Icon name={it.ico} size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{it.label}</span>
                  </div>
                ))}
                <div className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderTop: '1px solid var(--border-subtle)', fontSize: 13.5, color: 'var(--idfc-red)' }} onClick={() => { setOpen(null); signOut({ callbackUrl: '/login' }) }}>
                  <Icon name="LogOut" size={14} />
                  <span>Sign out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile blades / modals */}
      <ProfileBlade open={profileBlade === 'profile'} onClose={() => setProfileBlade(null)} />
      <PreferencesModal open={profileBlade === 'prefs'} onClose={() => setProfileBlade(null)} onSave={() => { setProfileBlade(null); app.toast('Preferences saved') }} />
      <NotificationSettingsModal open={profileBlade === 'notifs'} onClose={() => setProfileBlade(null)} onSave={() => { setProfileBlade(null); app.toast('Notification settings updated') }} />
      <HelpModal open={profileBlade === 'help'} onClose={() => setProfileBlade(null)} />
    </>
  )
}

// ─── Main shell ──────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  const sidebarW = collapsed ? 72 : 240

  // Determine active nav item (check children too)
  const allItems: { id: string; label: string; icon?: string; path: string }[] = NAV_SECTIONS.flatMap(s =>
    s.items.flatMap(i => [i, ...((i.children ?? []).map(c => ({ ...c, icon: '' })))])
  )
  const activeId = allItems.find(i => i.path === pathname)?.id ?? ''
  const activeParentId = NAV_SECTIONS.flatMap(s => s.items).find(i => i.children?.some(c => c.path === pathname))?.id ?? ''

  // Determine page title
  const pageTitle = allItems.find(i => i.path === pathname)?.label ?? 'Corebridge Agent Workspace'

  const [expandedId, setExpandedId] = useState<string>(activeParentId)

  const navigate = (path: string) => router.push(path)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Fixed sidebar */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh',
          width: sidebarW, flexShrink: 0,
          background: '#0E0E0E', borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 200ms ease', zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ height: 'var(--topbar-h)', padding: collapsed ? 0 : '0 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)', gap: 10 }}>
          <LogoMark collapsed={collapsed} />
          {!collapsed && (
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', color: 'rgba(200,194,187,0.55)', marginLeft: 2 }}>Agent Workspace</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 24px' }}>
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.section} style={{ marginBottom: 20 }}>
              {!collapsed && <div style={{ padding: '0 12px', marginBottom: 8, fontFamily: "'JetBrains Mono','SF Mono',ui-monospace,monospace", fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(200,194,187,0.45)' }}>{sec.section}</div>}
              {collapsed && <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 8px 10px' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sec.items.map((it) => {
                  const hasChildren = !!(it.children && it.children.length > 0)
                  const isActive = activeId === it.id || activeParentId === it.id
                  const isExpanded = expandedId === it.id
                  return (
                    <div key={it.id}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          height: collapsed ? 36 : 32,
                          padding: collapsed ? 0 : '0 12px',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13.5,
                          color: isActive ? '#EDE8E1' : '#C8C2BB',
                          background: isActive ? 'rgba(59,86,183,0.14)' : 'transparent',
                          borderLeft: isActive ? '2px solid #3B56B7' : '2px solid transparent',
                          fontWeight: isActive ? 500 : 400,
                          transition: 'background 100ms ease',
                        }}
                        onClick={() => {
                          if (hasChildren) { setExpandedId(isExpanded ? '' : it.id) }
                          else navigate(it.path)
                        }}
                        title={collapsed ? it.label : undefined}
                      >
                        <Icon name={it.icon} size={collapsed ? 17 : 15} style={{ color: isActive ? 'var(--idfc-red-bright)' : '#E8E4DF' }} />
                        {!collapsed && <span style={{ flex: 1 }}>{it.label}</span>}
                        {!collapsed && hasChildren && <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={12} style={{ color: '#C8C2BB' }} />}
                      </div>
                      {!collapsed && hasChildren && isExpanded && (
                        <div style={{ marginLeft: 16, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {it.children!.map(child => {
                            const childActive = activeId === child.id
                            return (
                              <div
                                key={child.id}
                                onClick={() => navigate(child.path)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  height: 28, padding: '0 12px',
                                  borderRadius: 6, cursor: 'pointer', fontSize: 12.5,
                                  color: childActive ? '#EDE8E1' : 'rgba(200,194,187,0.7)',
                                  background: childActive ? 'rgba(59,86,183,0.12)' : 'transparent',
                                  borderLeft: childActive ? '2px solid #3B56B7' : '2px solid transparent',
                                  fontWeight: childActive ? 500 : 400,
                                  transition: 'background 100ms ease',
                                }}
                              >
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: childActive ? '#3B56B7' : 'rgba(200,194,187,0.4)', flexShrink: 0 }} />
                                {child.label}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            margin: collapsed ? '0 auto 12px' : '0 16px 12px',
            height: 32, width: collapsed ? 32 : 'auto',
            padding: collapsed ? 0 : '0 10px',
            display: 'inline-flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)',
            fontSize: 12, color: '#C8C2BB', cursor: 'pointer',
          }}
        >
          <Icon name={collapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={14} />
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User */}
        <div style={{ padding: collapsed ? '12px 0' : '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10 }}>
          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{MOCK.rm.initials}</div>
          {!collapsed && (
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#EDE8E1' }}>{MOCK.rm.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(200,194,187,0.45)' }}>{MOCK.rm.role}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main area — offset by sidebar */}
      <div style={{ marginLeft: sidebarW, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'margin-left 200ms ease' }}>
        <Topbar title={pageTitle} sidebarW={sidebarW} />
        {/* Push content below fixed topbar */}
        <main style={{ flex: 1, overflowY: 'auto', marginTop: 'var(--topbar-h)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
