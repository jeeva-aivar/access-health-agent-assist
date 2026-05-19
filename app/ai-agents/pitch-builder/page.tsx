'use client'
import { useState } from 'react'
import { AgentPage, Field, TextInput, NumberInput, SelectInput, CheckboxGroup, TagInput } from '@/components/agents/AgentShell'

const SEGMENTS = [{ value: 'Priority', label: 'Priority member' }, { value: 'Premium', label: 'Premium member' }, { value: 'Standard', label: 'Standard member' }, { value: 'Group', label: 'Group plan' }]
const COVERAGE_PROFILES = [{ value: 'conservative', label: 'Conservative (PPO Bronze)' }, { value: 'balanced', label: 'Balanced (PPO Silver)' }, { value: 'comprehensive', label: 'Comprehensive (PPO Gold)' }, { value: 'family', label: 'Family (with riders)' }]
const OBJECTIVES = [{ value: 'supplemental_rider', label: 'Supplemental rider cross-sell' }, { value: 'plan_upgrade', label: 'Plan-tier upgrade' }, { value: 'benefits_walkthrough', label: 'Benefits walk-through' }, { value: 'renewal', label: 'Plan renewal' }, { value: 'onboarding', label: 'New-member onboarding' }]
const PRODUCTS = [{ value: 'supplemental_family_rider', label: 'Access Premium Family rider' }, { value: 'vision_dental_rider', label: 'Vision + Dental rider' }, { value: 'telemed_expansion', label: 'Telemed expansion' }, { value: 'hsa_match', label: 'HSA employer match' }, { value: 'pediatric_coverage', label: 'Pediatric coverage' }]
const TONES = [{ value: 'consultative', label: 'Consultative' }, { value: 'formal', label: 'Formal' }, { value: 'friendly', label: 'Friendly' }]
const COMPLIANCE = [{ value: 'HIPAA-US', label: 'HIPAA (US Federal)' }, { value: 'TX-DOI', label: 'TX Department of Insurance' }, { value: 'NY-DFS', label: 'NY DFS' }, { value: 'CMS', label: 'CMS (Federal)' }]

export default function PitchBuilderPage() {
  const [clientName, setClientName] = useState('Garcia family')
  const [clientId, setClientId] = useState('MEM-GAR-7731-2204')
  const [segment, setSegment] = useState('Priority')
  const [annualValue, setAnnualValue] = useState('36000')
  const [coverageProfile, setCoverageProfile] = useState('family')
  const [state, setState] = useState('TX')
  const [objective, setObjective] = useState('supplemental_rider')
  const [products, setProducts] = useState(['supplemental_family_rider', 'pediatric_coverage'])
  const [maxSlides, setMaxSlides] = useState('8')
  const [tone, setTone] = useState('consultative')
  const [complianceRegion, setComplianceRegion] = useState('HIPAA-US')
  const [lastMeetingDate, setLastMeetingDate] = useState('2026-04-25')
  const [recentActions, setRecentActions] = useState(['deductible_reset', 'pediatric_visit_used'])

  const buildPayload = () => {
    if (!clientName || !clientId || !products.length) return null
    return {
      agent: 'pitch_builder', version: '1.0', agent_id: 'AH-04812',
      member: { member_id: clientId, name: clientName, segment, annual_benefit_value_usd: Number(annualValue), coverage_profile: coverageProfile, state },
      objective,
      products_in_scope: products,
      constraints: { max_slides: Number(maxSlides), tone, language: 'en', compliance_region: complianceRegion },
      context: { last_meeting_date: lastMeetingDate, open_opportunities: [], recent_benefit_events: recentActions },
    }
  }

  return (
    <AgentPage
      agentId="pitch_builder" label="Benefits Pitch Builder" icon="Presentation"
      tagline="Tailored plan-benefit walkthroughs & talking points for member meetings" color="#56BB64" latency="~53s"
      buildPayload={buildPayload}
      form={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Member / Family name"><TextInput value={clientName} onChange={setClientName} placeholder="Garcia family" /></Field>
            <Field label="Member ID"><TextInput value={clientId} onChange={setClientId} placeholder="MEM-GAR-7731-2204" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Segment"><SelectInput value={segment} onChange={setSegment} options={SEGMENTS} /></Field>
            <Field label="State"><TextInput value={state} onChange={setState} placeholder="TX" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Annual benefit value (USD)" hint="Estimated annual premium + benefit utilisation"><NumberInput value={annualValue} onChange={setAnnualValue} placeholder="36000" /></Field>
            <Field label="Coverage profile"><SelectInput value={coverageProfile} onChange={setCoverageProfile} options={COVERAGE_PROFILES} /></Field>
          </div>
          <Field label="Pitch objective"><SelectInput value={objective} onChange={setObjective} options={OBJECTIVES} /></Field>
          <Field label="Riders / products in scope"><CheckboxGroup value={products} onChange={setProducts} options={PRODUCTS} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="Max slides"><NumberInput value={maxSlides} onChange={setMaxSlides} min={4} max={20} /></Field>
            <Field label="Tone"><SelectInput value={tone} onChange={setTone} options={TONES} /></Field>
            <Field label="Compliance region"><SelectInput value={complianceRegion} onChange={setComplianceRegion} options={COMPLIANCE} /></Field>
          </div>
          <Field label="Last meeting date"><input type="date" value={lastMeetingDate} onChange={e => setLastMeetingDate(e.target.value)} style={{ height: 42, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box' }} /></Field>
          <Field label="Recent benefit events" hint="Press Enter to add each event"><TagInput value={recentActions} onChange={setRecentActions} placeholder="e.g. deductible_reset" /></Field>
        </>
      }
    />
  )
}
