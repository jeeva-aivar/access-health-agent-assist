'use client'
import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'

function LogoMark({ size = 36 }: { size?: number }) {
  // Access Health caduceus logo (matches AppShell sidebar).
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Access Health"
      width={size}
      height={size}
      style={{ flexShrink: 0, borderRadius: Math.round(size * 0.18), objectFit: 'cover', display: 'block' }}
    />
  )
}

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<'creds' | 'otp'>('creds')
  const [user, setUser] = useState('afsheen.mohammed')
  const [pwd, setPwd] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (status === 'authenticated') router.replace('/morning-briefing')
  }, [status, router])

  const submitCreds = (e?: React.FormEvent) => {
    e?.preventDefault()
    setErr('')
    if (!user || !pwd) { setErr('Enter your credentials to continue.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('otp') }, 700)
  }

  const verifyOtp = async () => {
    setErr('')
    if (otp.join('').length < 6) { setErr('Enter the 6-digit code sent to ••••89.'); return }
    setLoading(true)
    const result = await signIn('credentials', {
      email: 'demo@accesshealthcare.com',
      password: 'demo',
      redirect: false,
    })
    if (result?.ok) {
      router.replace('/morning-briefing')
    } else {
      setLoading(false)
      setErr('Authentication failed. Please try again.')
    }
  }

  const setOtpDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = otp.slice(); next[i] = v; setOtp(next)
    if (v && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'Enter') verifyOtp()
  }

  const useDemoCredentials = () => {
    setUser('afsheen.mohammed')
    setPwd('demo')
    setTimeout(() => submitCreds(), 0)
  }

  const autoFillOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6'])
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, background: 'transparent', outline: 0, border: 0,
    color: '#fff', fontSize: 14,
  }

  const fieldWrap: React.CSSProperties = {
    height: 44, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8,
    display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(440px, 520px) 1fr', background: 'var(--bg-canvas)' }}>

      {/* ── Left: red gradient form panel ── */}
      <div style={{
        background: 'linear-gradient(165deg, var(--idfc-red) 0%, var(--idfc-red-deep) 100%)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        {/* dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px, 60px 60px',
        }} />

        <div className="anim-fade-up" style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: 32, color: '#fff', backdropFilter: 'blur(8px)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <LogoMark size={36} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.15 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', color: '#fff' }}>ACCESS <span style={{ color: 'var(--ah-celadon)' }}>HEALTH</span></span>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.6)' }}>Agent Workspace</span>
            </div>
          </div>

          {/* ── Step 1: Credentials ── */}
          {step === 'creds' && (
            <form onSubmit={submitCreds}>
              <div className="caption" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>EMPLOYEE AI WORKSPACE</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 8 }}>Welcome back, Afsheen</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Sign in to your AI workspace · Dallas Hub region</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="caption" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10.5 }}>EMPLOYEE ID / USERNAME</span>
                  <div style={fieldWrap}>
                    <Icon name="User" size={14} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                    <input value={user} onChange={e => setUser(e.target.value)} placeholder="afsheen.mohammed" style={inputStyle} />
                  </div>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="caption" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10.5 }}>PASSWORD</span>
                    <span className="caption" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10.5, textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => alert('Password reset link sent to your registered email.')}>Forgot?</span>
                  </div>
                  <div style={fieldWrap}>
                    <Icon name="Lock" size={14} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                    <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" style={inputStyle} />
                  </div>
                </label>

                {err && <div style={{ fontSize: 12, color: '#FFD3D3' }}>{err}</div>}

                <button type="submit" disabled={loading} style={{
                  height: 44, marginTop: 6, background: '#fff', color: 'var(--idfc-red-deep)',
                  borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading ? 'Sending OTP…' : 'Proceed to login'}
                  {!loading && <Icon name="ArrowRight" size={14} />}
                </button>

                <button type="button" onClick={useDemoCredentials} style={{
                  height: 36, background: 'transparent', color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                }}>
                  Use demo credentials
                </button>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  <Icon name="ShieldCheck" size={13} />
                  <span>Secured by Access Health · IT-Sec audit-grade · TLS 1.3</span>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <div className="anim-fade-up">
              <div className="caption" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>TWO-FACTOR AUTHENTICATION</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 8 }}>Verify it's you</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                We've sent a 6-digit code to <span style={{ fontFamily: 'monospace' }}>+91 ••••• ••89</span> · expires in 5:00
              </p>

              <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    value={d}
                    onChange={e => setOtpDigit(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    style={{
                      width: 48, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 600,
                      color: '#fff', background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, outline: 0,
                    }}
                  />
                ))}
              </div>

              {err && <div style={{ marginTop: 12, fontSize: 12, color: '#FFD3D3' }}>{err}</div>}

              <button onClick={verifyOtp} disabled={loading} style={{
                width: '100%', height: 44, marginTop: 20, background: '#fff',
                color: 'var(--idfc-red-deep)', borderRadius: 8, fontWeight: 600, fontSize: 14,
                border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </button>

              <button onClick={autoFillOtp} style={{
                width: '100%', height: 36, marginTop: 8, background: 'transparent',
                color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 8, fontSize: 13, cursor: 'pointer',
              }}>
                Auto-fill demo OTP
              </button>

              <button onClick={() => setStep('creds')} style={{
                marginTop: 16, background: 'transparent', color: 'rgba(255,255,255,0.7)',
                fontSize: 12, cursor: 'pointer', border: 'none', padding: 0,
              }}>
                ← Use a different account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: marketing panel ── */}
      <div style={{
        position: 'relative', padding: '64px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: 'var(--bg-canvas)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="caption" style={{ fontSize: 11 }}>FOR EMPLOYEES · INTERNAL USE ONLY</div>
          <div className="num caption" style={{ fontSize: 11 }}>v2.4 · WED 8 MAY</div>
        </div>

        <div className="anim-fade-up" style={{ animationDelay: '120ms', maxWidth: 540 }}>
          <div className="caption" style={{ color: 'var(--idfc-red)', fontSize: 11 }}>EMPLOYEE AI WORKSPACE</div>
          <h2 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)', marginTop: 12 }}>
            Your day, <span style={{ fontWeight: 600, color: 'var(--idfc-red)' }}>orchestrated</span> through Access Health AI.
          </h2>
          <p className="body-lg" style={{ color: 'var(--text-secondary)', maxWidth: 480, marginTop: 16 }}>
            Routine tasks automated for you. Priorities ranked and reasoned. Your judgement, where it matters most.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
            {[
              { ico: 'Sun',      l: 'MORNING BRIEFING', d: 'Your day, ranked' },
              { ico: 'Sparkles', l: 'AUTO-ACTIONS',     d: 'Routine, handled' },
              { ico: 'Moon',     l: 'DAILY DEBRIEF',    d: 'Quiet 90-sec read' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--idfc-red)' }}>
                  <Icon name={s.ico} size={15} />
                </div>
                <div className="caption" style={{ fontSize: 10.5, marginTop: 12 }}>{s.l}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="caption" style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>© 2026 Access Healthcare · All rights reserved</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {['Privacy', 'Terms', 'Help'].map(lbl => (
              <span key={lbl} className="caption" style={{ color: 'var(--text-tertiary)', fontSize: 11, cursor: 'pointer' }}
                onClick={() => alert(`${lbl} — opens in new tab in production.`)}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
