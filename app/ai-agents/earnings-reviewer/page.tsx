'use client'
import { useState } from 'react'
import { AgentPage, Field, TextInput, SelectInput, TagInput } from '@/components/agents/AgentShell'

const DEPTHS = [{ value: 'summary', label: 'Summary' }, { value: 'standard', label: 'Standard' }, { value: 'deep', label: 'Deep dive' }]
const KB_SOURCES = [{ value: 'corebridge_kb', label: 'Live assist KB' }, { value: 'sharepoint', label: 'SharePoint guidelines' }, { value: 'cms_lcd', label: 'CMS LCD database' }]

export default function DenialsReviewerPage() {
  const [denialCode, setDenialCode] = useState('N290')
  const [period, setPeriod] = useState('Q2-2026')
  const [analysisDate, setAnalysisDate] = useState('2026-05-19')
  const [transcriptUri, setTranscriptUri] = useState('s3://ah-research/denial_log_q2.csv')
  const [policyUri, setPolicyUri] = useState('s3://ah-research/payer_policies_q2.pdf')
  const [casesUri, setCasesUri] = useState('s3://ah-research/cases_n290.xlsx')
  const [priorPeriod, setPriorPeriod] = useState('Q1-2026')
  const [kbSource, setKbSource] = useState('access_health_kb')
  const [memberScope, setMemberScope] = useState(['MEM-ANH-2418-4421', 'MEM-LPZ-3318-2204'])
  const [outputDepth, setOutputDepth] = useState('standard')

  const buildPayload = () => {
    if (!denialCode || !period) return null
    return {
      agent: 'denials_reviewer', version: '1.0', agent_id: 'AH-04812',
      denial_code: denialCode.toUpperCase(), period, analysis_date: analysisDate,
      sources: [
        { type: 'denial_log', uri: transcriptUri },
        { type: 'payer_policies', uri: policyUri },
        { type: 'case_set', uri: casesUri },
      ].filter(s => s.uri),
      compare_to: { prior_period: priorPeriod, kb_source: kbSource },
      member_exposure_scope: memberScope,
      output_depth: outputDepth,
    }
  }

  return (
    <AgentPage
      agentId="denials_reviewer" label="Denials Reviewer" icon="TrendingUp"
      tagline="Synthesise denial codes & appeal patterns into per-member action briefs" color="#16a34a" latency="~25s"
      buildPayload={buildPayload}
      form={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Denial code"><TextInput value={denialCode} onChange={setDenialCode} placeholder="N290" /></Field>
            <Field label="Period"><TextInput value={period} onChange={setPeriod} placeholder="Q2-2026" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Analysis date"><input type="date" value={analysisDate} onChange={e => setAnalysisDate(e.target.value)} style={{ height: 42, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box' }} /></Field>
            <Field label="Output depth"><SelectInput value={outputDepth} onChange={setOutputDepth} options={DEPTHS} /></Field>
          </div>
          <Field label="Denial log (S3 URI)" hint="s3://bucket/path/to/denial_log.csv"><TextInput value={transcriptUri} onChange={setTranscriptUri} placeholder="s3://ah-research/..." /></Field>
          <Field label="Payer policies (S3 URI)" hint="s3://bucket/path/to/policies.pdf"><TextInput value={policyUri} onChange={setPolicyUri} placeholder="s3://ah-research/..." /></Field>
          <Field label="Case set (S3 URI)" hint="s3://bucket/path/to/cases.xlsx"><TextInput value={casesUri} onChange={setCasesUri} placeholder="s3://ah-research/..." /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Prior period to compare"><TextInput value={priorPeriod} onChange={setPriorPeriod} placeholder="Q1-2026" /></Field>
            <Field label="KB source"><SelectInput value={kbSource} onChange={setKbSource} options={KB_SOURCES} /></Field>
          </div>
          <Field label="Member exposure scope" hint="Member IDs affected by this denial pattern — press Enter to add"><TagInput value={memberScope} onChange={setMemberScope} placeholder="MEM-ANH-2418-4421" /></Field>
        </>
      }
    />
  )
}
