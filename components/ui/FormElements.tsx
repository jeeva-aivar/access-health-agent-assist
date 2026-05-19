'use client'
import React from 'react'

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <span className="caption" style={{ fontSize: 10.5 }}>{children}</span>
      {hint && <span className="caption" style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>{hint}</span>}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props
  return (
    <input
      {...rest}
      style={{
        width: '100%', height: 38, padding: '0 12px', fontSize: 13.5,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 8, outline: 0, color: 'var(--text-primary)',
        ...(style || {}),
      }}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { style, ...rest } = props
  return (
    <textarea
      {...rest}
      style={{
        width: '100%', padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 8, outline: 0, color: 'var(--text-primary)',
        resize: 'vertical', fontFamily: 'inherit',
        ...(style || {}),
      }}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
  ...rest
}: {
  value: string
  onChange?: (val: string) => void
  options: (string | { value: string; label: string })[]
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...rest}
      style={{
        width: '100%', height: 38, padding: '0 12px', fontSize: 13.5,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 8, outline: 0, color: 'var(--text-primary)',
        appearance: 'none',
        backgroundImage: 'linear-gradient(45deg, transparent 50%, var(--text-tertiary) 50%), linear-gradient(135deg, var(--text-tertiary) 50%, transparent 50%)',
        backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 12px) 50%',
        backgroundSize: '4px 4px, 4px 4px',
        backgroundRepeat: 'no-repeat',
        paddingRight: 28,
      }}
    >
      {options.map((o) =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{
        width: 34, height: 20,
        background: checked ? 'var(--success)' : 'var(--border-default)',
        borderRadius: 999, position: 'relative', transition: 'background 140ms ease', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2,
          left: checked ? 16 : 2,
          width: 16, height: 16,
          background: '#fff', borderRadius: 999,
          transition: 'left 140ms ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      {label && <span style={{ fontSize: 13.5 }}>{label}</span>}
    </label>
  )
}

export function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 10, borderBottom: '1px dashed var(--border-subtle)' }}>
      <div className="caption" style={{ fontSize: 10.5, minWidth: 130, color: 'var(--text-tertiary)' }}>{k}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', flex: 1 }}>{v}</div>
    </div>
  )
}
