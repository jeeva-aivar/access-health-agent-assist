'use client'
import { useState } from 'react'
import { AgentPage, Field, TextInput, NumberInput, SelectInput, CheckboxGroup } from '@/components/agents/AgentShell'

const PURPOSES = [{ value: 'benefits_walkthrough', label: 'Benefits walk-through' }, { value: 'annual_review', label: 'Annual review' }, { value: 'plan_pitch', label: 'Plan / rider pitch' }, { value: 'onboarding', label: 'New-member onboarding' }, { value: 'renewal', label: 'Plan renewal' }, { value: 'escalation', label: 'Escalation' }]
const CHANNELS = [{ value: 'in_person', label: 'In person' }, { value: 'video', label: 'Video call' }, { value: 'phone', label: 'Phone' }]
const DEPTHS = [{ value: 'summary', label: 'Summary' }, { value: 'detailed', label: 'Detailed' }]
const SECTIONS = [{ value: 'plan_snapshot', label: 'Plan snapshot' }, { value: 'last_call_notes', label: 'Last call notes' }, { value: 'open_claims', label: 'Open claims' }, { value: 'care_context', label: 'Care context' }, { value: 'hipaa_flags', label: 'HIPAA flags' }]

export default function MeetingPreparerPage() {
  const [clientId, setClientId] = useState('MEM-ANH-2418-4421')
  const [meetingId, setMeetingId] = useState('MTG-2026-05-19-001')
  const [scheduledAt, setScheduledAt] = useState('2026-05-19T09:30')
  const [duration, setDuration] = useState('30')
  const [channel, setChannel] = useState('phone')
  const [purpose, setPurpose] = useState('benefits_walkthrough')
  const [depth, setDepth] = useState('detailed')
  const [include, setInclude] = useState(['plan_snapshot', 'last_call_notes', 'open_claims', 'care_context', 'hipaa_flags'])
  const [attendeeName, setAttendeeName] = useState('Michael Anderson')
  const [attendeeRole, setAttendeeRole] = useState('Member')

  const buildPayload = () => {
    if (!clientId || !meetingId || !scheduledAt) return null
    return {
      agent: 'meeting_preparer', version: '1.0', agent_id: 'AH-04812',
      meeting: {
        meeting_id: meetingId, member_id: clientId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_min: Number(duration), channel,
        attendees: [
          ...(attendeeName ? [{ name: attendeeName, role: attendeeRole, side: 'member' }] : []),
          { name: 'Jane Doe', role: 'Agent', side: 'access_health' },
        ],
      },
      meeting_purpose: purpose, depth, include,
    }
  }

  return (
    <AgentPage
      agentId="meeting_preparer" label="Meeting Preparer" icon="CalendarCheck"
      tagline="Pre-meeting brief with agenda, open claims & care context" color="#2563eb" latency="~20s"
      buildPayload={buildPayload}
      form={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Member ID"><TextInput value={clientId} onChange={setClientId} placeholder="MEM-ANH-2418-4421" /></Field>
            <Field label="Meeting ID"><TextInput value={meetingId} onChange={setMeetingId} placeholder="MTG-2026-05-19-001" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Scheduled at"><input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ height: 42, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box' }} /></Field>
            <Field label="Duration (minutes)"><NumberInput value={duration} onChange={setDuration} min={15} max={180} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Channel"><SelectInput value={channel} onChange={setChannel} options={CHANNELS} /></Field>
            <Field label="Meeting purpose"><SelectInput value={purpose} onChange={setPurpose} options={PURPOSES} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Brief depth"><SelectInput value={depth} onChange={setDepth} options={DEPTHS} /></Field>
          </div>
          <Field label="Key attendee (member side)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <TextInput value={attendeeName} onChange={setAttendeeName} placeholder="Name" />
              <TextInput value={attendeeRole} onChange={setAttendeeRole} placeholder="Role (e.g. Member, Spouse)" />
            </div>
          </Field>
          <Field label="Sections to include"><CheckboxGroup value={include} onChange={setInclude} options={SECTIONS} /></Field>
        </>
      }
    />
  )
}
