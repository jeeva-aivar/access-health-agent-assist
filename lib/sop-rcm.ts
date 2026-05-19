// Demo SOPs for the Access Health Live Call Assist.
//
// Three workflows — one per RCM flow — that mirror the production LLM prompt:
//   - claim_status         → CLAIMS_CALL
//   - eligibility_priorauth → ELIGIBILITY_PRIORAUTH_CALL
//   - billing_refund       → BILLING_REFUND_CALL
//
// All three share the same 4 step IDs (verify · status · follow_up · wrap)
// so when the backend sends `stepId` on assist_chunk / assist_done events,
// the UI's "Step N" chip resolves correctly regardless of which workflow
// the caller is currently in.
//
// completionCue regexes are pragmatic starting points; the backend can override
// step state via sop_state events, so these only matter when the LLM doesn't
// emit them. Tune against real transcripts during dry-run.

import type { RcmFlow } from './customers'

export interface SopStep {
  id: string
  title: string
  description: string
  guidance: string
  completionCue: RegExp
}

export interface SopWorkflow {
  id: string
  name: string
  description: string
  steps: SopStep[]
}

// ─── claim_status — Claims-call SOP (unchanged) ──────────────────────────────

export const CLAIMS_CALL: SopWorkflow = {
  id: 'claims-call',
  name: 'Claims call',
  description:
    'Inbound patient call about a health insurance claim. Verify identity, disclose claim status, give status-specific follow-up, close.',
  steps: [
    {
      id: 'verify',
      title: 'Verify caller',
      description: 'Capture member ID; confirm name once roster row is hydrated.',
      guidance:
        'Greet the patient. Ask for the member ID — that is the only verification gate. Once the matching record is hydrated, confirm by name ("Thank you, Mr./Ms. …") and proceed. Do not disclose claim details before the member ID is captured.',
      completionCue: /\b(member\s*(id|number)|policy\s*(id|number))\b/i,
    },
    {
      id: 'status',
      title: 'Disclose claim status',
      description: 'State current status (In progress / Denied / Completed) with a one-line reason from the KB.',
      guidance:
        'State the current claim status clearly: In progress, Denied, or Completed. Add a one-sentence reason drawn from the claims system / KB. Do not improvise — escalate if status is ambiguous.',
      completionCue:
        /\b(claim\s+(is|status)|status\s+(is|of|update))\b[\s\S]{0,60}(in[-\s]progress|denied|completed|approved|settled|under\s+review)|\b(in[-\s]progress|denied|completed|approved|settled)\b[\s\S]{0,40}(claim|appeal|reimbursement)/i,
    },
    {
      id: 'follow_up',
      title: 'Status-specific follow-up',
      description:
        'In progress → timeline + pending items. Denied → reason + appeal window + docs. Completed → settled amount + mode + date + EOB.',
      guidance:
        'Branch on the status from Step 2.\n• In progress: expected resolution timeline; what is pending (documentation, adjudication, hospital response); how the patient will be notified.\n• Denied: primary denial reason; appeal deadline; supporting documents that would strengthen an appeal.\n• Completed: settled amount; payment mode (cashless to hospital / reimbursement to patient); date credited; where to download the EOB / settlement letter.',
      completionCue:
        /\b(timeline|expected\s+(by|resolution)|pending\s+(review|documentation|adjudication)|appeal\s+(window|by|deadline)|supporting\s+(docs|documents)|settled\s+amount|payment\s+(mode|method)|date\s+credited|explanation\s+of\s+benefits|\beob\b|settlement\s+letter)\b/i,
    },
    {
      id: 'wrap',
      title: 'Wrap-up',
      description: 'Confirm question answered, share reference number / next step, close politely.',
      guidance:
        "Confirm the patient's question is fully answered. Share a reference number for this call or a next-step link (e.g., document submission portal, callback time). Close per the Access Health closing script.",
      completionCue:
        /\b(reference\s+(number|id|#)|anything\s+else|callback\s+(time|number)|have\s+a\s+(good|great|nice)|thank\s+you\s+for\s+calling|is\s+there\s+anything\s+else)\b/i,
    },
  ],
}

// ─── eligibility_priorauth — Eligibility + PA SOP ────────────────────────────

export const ELIGIBILITY_PRIORAUTH_CALL: SopWorkflow = {
  id: 'eligibility-priorauth-call',
  name: 'Eligibility & prior-auth call',
  description:
    'Inbound call to verify coverage or confirm a prior authorisation before a scheduled service.',
  steps: [
    {
      id: 'verify',
      title: 'Verify caller',
      description: 'Capture member ID; confirm name once roster row is hydrated.',
      guidance:
        'Greet the patient and ask for the member ID. Once hydrated, confirm by name and proceed. Do not disclose eligibility or PA detail before the member ID is captured.',
      completionCue: /\b(member\s*(id|number)|policy\s*(id|number))\b/i,
    },
    {
      id: 'status',
      title: 'Eligibility & PA status',
      description: 'Confirm 270/271 eligibility (Active/Inactive, plan, effective date) and prior-auth status with PA reference.',
      guidance:
        'State eligibility status from the 270/271: Active or Inactive, plan name, effective date. Then state the prior-auth status — Approved, Pending, Denied, Expired, or Not required — with the PA reference if any.',
      completionCue:
        /\b(prior[-\s]auth|pre[-\s]?auth|pa[-\s]?\d{4,}|eligibility|coverage|effective|active|inactive)\b[\s\S]{0,60}(approved|pending|denied|expired|not\s+required|active|inactive)/i,
    },
    {
      id: 'follow_up',
      title: 'Service-day plan',
      description:
        'Approved → confirm covered + copay. Pending → timeline + expedited review if service ≤24h. Denied → reason + appeal. Not required → confirm + plan benefit.',
      guidance:
        'Branch on the PA status from Step 2.\n• Approved: reaffirm the procedure is covered; confirm the service date; state copay / coinsurance owed at point of service.\n• Pending: expected decision timeline; whether expedited review applies (service within 24h); what is needed from the ordering provider.\n• Denied: reason; peer-to-peer / appeal options; alternate covered codes if any.\n• Not required: explicitly confirm no PA needed; note plan benefit (deductible / copay).',
      completionCue:
        /\b(expedited|same[-\s]day|peer[-\s]to[-\s]peer|appeal\s+(window|options)|copay|coinsurance|in[-\s]network|out[-\s]of[-\s]network|deductible|alternate\s+(code|cpt))\b/i,
    },
    {
      id: 'wrap',
      title: 'Wrap-up',
      description: 'Confirm next step (book / escalate / send confirmation), share reference, close politely.',
      guidance:
        'Confirm the next step (book appointment, escalate PA, send written confirmation). Share a reference number for the call. Close per the Access Health closing script.',
      completionCue:
        /\b(reference\s+(number|id|#)|anything\s+else|callback\s+(time|number)|have\s+a\s+(good|great|nice)|thank\s+you\s+for\s+calling|is\s+there\s+anything\s+else|i'?ll\s+(call|email|send|escalate))\b/i,
    },
  ],
}

// ─── billing_refund — Billing / refund SOP ────────────────────────────────────

export const BILLING_REFUND_CALL: SopWorkflow = {
  id: 'billing-refund-call',
  name: 'Billing & refund call',
  description:
    'Inbound call about a balance, refund, or surprise bill. May trigger a No Surprises Act dispute.',
  steps: [
    {
      id: 'verify',
      title: 'Verify caller',
      description: 'Capture member ID; confirm name once roster row is hydrated.',
      guidance:
        'Greet the patient and ask for the member ID. Once hydrated, confirm by name and proceed. Do not disclose billing or refund detail before the member ID is captured.',
      completionCue: /\b(member\s*(id|number)|policy\s*(id|number))\b/i,
    },
    {
      id: 'status',
      title: 'Disclose balance',
      description: 'State balance situation factually: outstanding amount, credit balance, or surprise charge. Cite the source claim.',
      guidance:
        'State the balance situation factually. Cite the source claim where applicable. Do not improvise dollar amounts — pull from the roster / claim record.',
      completionCue:
        /\b(outstanding|credit\s+balance|refund|surprise|overcharged|patient\s+responsibility|allowed|billed)\b[\s\S]{0,60}(\$|amount|balance|claim)/i,
    },
    {
      id: 'follow_up',
      title: 'Resolution path',
      description:
        'Credit balance → refund mode + SLA. Outstanding → breakdown + payment plan. Surprise bill → NSA check + dispute pathway.',
      guidance:
        'Branch on the balance type.\n• Credit balance / refund: refund mode (ACH / cheque / apply-to-next-bill), SLA window (e.g. 10-day ACH), how the patient is notified.\n• Outstanding balance: breakdown (allowed vs billed vs patient responsibility), payment-plan options, payment channels.\n• Surprise bill: check whether No Surprises Act applies (in-network facility + out-of-network ancillary provider is the canonical case). If yes, walk the patient through the NSA dispute pathway before any patient-responsibility commitment.',
      completionCue:
        /\b(ach|cheque|check|payment\s+plan|no\s+surprises|nsa|dispute|in[-\s]network|out[-\s]of[-\s]network|breakdown|apply\s+(to|toward))\b/i,
    },
    {
      id: 'wrap',
      title: 'Wrap-up',
      description: 'Confirm the action (refund initiated / NSA dispute filed / payment plan set), share reference, close politely.',
      guidance:
        'Confirm the action being taken (refund initiated, NSA dispute filed, payment plan set). Share a reference number for the call. Close per the Access Health closing script.',
      completionCue:
        /\b(reference\s+(number|id|#)|anything\s+else|callback\s+(time|number)|have\s+a\s+(good|great|nice)|thank\s+you\s+for\s+calling|is\s+there\s+anything\s+else|initiated|filed|set\s+up)\b/i,
    },
  ],
}

// ─── Selector + back-compat default ──────────────────────────────────────────

export function workflowForFlow(flow: RcmFlow): SopWorkflow {
  switch (flow) {
    case 'claim_status':         return CLAIMS_CALL
    case 'eligibility_priorauth': return ELIGIBILITY_PRIORAUTH_CALL
    case 'billing_refund':       return BILLING_REFUND_CALL
  }
}

// Stable export for any importer that doesn't yet pass a flow.
export const DEFAULT_WORKFLOW = CLAIMS_CALL
