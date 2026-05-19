'use client'
import { useState } from 'react'
import { AgentPage, Field, TextInput, NumberInput, SelectInput, CheckboxGroup, TagInput } from '@/components/agents/AgentShell'

const MODEL_TYPES = [{ value: 'coverage_optimization', label: 'Coverage optimisation' }, { value: 'oop_projection', label: 'OOP projection' }, { value: 'rider_fit', label: 'Rider-fit score' }, { value: 'network_match', label: 'Network match' }]
const PLAN_YEARS = [{ value: '2026', label: '2026' }, { value: '2027', label: '2027' }]
const OBJECTIVES = [{ value: 'minimize_oop', label: 'Minimise out-of-pocket' }, { value: 'maximize_coverage', label: 'Maximise coverage breadth' }, { value: 'balance', label: 'Balance cost + coverage' }, { value: 'risk_parity', label: 'Risk parity across family' }]
const OUTPUT_FORMATS = [{ value: 'benefit_table', label: 'Benefit table' }, { value: 'cost_projection', label: 'Cost projection' }, { value: 'scenarios', label: 'Scenarios' }]

export default function CoveragePlannerPage() {
  const [clientId, setClientId] = useState('MEM-GAR-7731-2204')
  const [modelType, setModelType] = useState('coverage_optimization')
  const [planYear, setPlanYear] = useState('2026')
  const [horizon, setHorizon] = useState('12')
  const [objective, setObjective] = useState('minimize_oop')
  const [holdingsUri, setHoldingsUri] = useState('s3://ah-data/garcia_utilization.csv')
  const [cmaUri, setCmaUri] = useState('s3://ah-data/plan_benefits_2026.json')
  const [maxSpecialty, setMaxSpecialty] = useState('20')
  const [maxOutOfNetwork, setMaxOutOfNetwork] = useState('10')
  const [minPreventive, setMinPreventive] = useState('100')
  const [familySize, setFamilySize] = useState('5')
  const [excludePlans, setExcludePlans] = useState(['HMO-only', 'high-deductible'])
  const [outputFormats, setOutputFormats] = useState(['benefit_table', 'cost_projection', 'scenarios'])

  const buildPayload = () => {
    if (!clientId) return null
    return {
      agent: 'coverage_planner', version: '1.0', agent_id: 'AH-04812',
      model_type: modelType,
      target: { member_id: clientId, plan_year: planYear, horizon_months: Number(horizon) },
      inputs: {
        utilization_history_uri: holdingsUri,
        plan_benefits_uri: cmaUri,
        constraints: {
          max_specialty_visits_pct: Number(maxSpecialty),
          max_out_of_network_pct: Number(maxOutOfNetwork),
          min_preventive_pct: Number(minPreventive),
          family_size: Number(familySize),
          exclude_plan_types: excludePlans,
        },
        objective,
      },
      output_format: outputFormats,
    }
  }

  return (
    <AgentPage
      agentId="coverage_planner" label="Coverage Planner" icon="BarChart3"
      tagline="Benefit-fit modelling with rider deltas, OOP projections & scenarios" color="#7c3aed" latency="~35s"
      buildPayload={buildPayload}
      form={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Member ID"><TextInput value={clientId} onChange={setClientId} placeholder="MEM-GAR-7731-2204" /></Field>
            <Field label="Model type"><SelectInput value={modelType} onChange={setModelType} options={MODEL_TYPES} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Plan year"><SelectInput value={planYear} onChange={setPlanYear} options={PLAN_YEARS} /></Field>
            <Field label="Horizon (months)"><NumberInput value={horizon} onChange={setHorizon} min={6} max={120} /></Field>
          </div>
          <Field label="Optimisation objective"><SelectInput value={objective} onChange={setObjective} options={OBJECTIVES} /></Field>
          <Field label="Utilisation history (S3 URI)" hint="CSV of claims + visits"><TextInput value={holdingsUri} onChange={setHoldingsUri} placeholder="s3://ah-data/..." /></Field>
          <Field label="Plan benefits (S3 URI)" hint="JSON benefit table"><TextInput value={cmaUri} onChange={setCmaUri} placeholder="s3://ah-data/..." /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Max specialty (%)" hint="Specialty-visit cap"><NumberInput value={maxSpecialty} onChange={setMaxSpecialty} min={1} max={100} /></Field>
            <Field label="Max out-of-network (%)" hint="Out-of-network cap"><NumberInput value={maxOutOfNetwork} onChange={setMaxOutOfNetwork} min={0} max={100} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Min preventive (%)" hint="Required preventive utilisation"><NumberInput value={minPreventive} onChange={setMinPreventive} min={0} max={100} /></Field>
            <Field label="Family size" hint="Member + dependents"><NumberInput value={familySize} onChange={setFamilySize} min={1} max={12} /></Field>
          </div>
          <Field label="Exclude plan types" hint="Plan types to exclude — press Enter to add"><TagInput value={excludePlans} onChange={setExcludePlans} placeholder="e.g. HMO-only" /></Field>
          <Field label="Output formats"><CheckboxGroup value={outputFormats} onChange={setOutputFormats} options={OUTPUT_FORMATS} /></Field>
        </>
      }
    />
  )
}
