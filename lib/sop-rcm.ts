// Demo SOP for the Access Health Live Call Assist.
//
// Models the Claims-call SOP that the deployed backend's LLM prompt follows
// (see reference: demo-idfc-rm-aiw-healthcare-agent-assist/IDFC-call-tapping/
// IDFC-agent-assist/app/docs/CALL_SOP.md and backend/prompts/assist_system.md).
//
// Single source of truth for the right-rail step tracker. The backend does NOT
// emit sop_state / stepId events, so step progress is inferred client-side
// from transcript text via lib/sop-state.ts inferSopState().
//
// completionCue regexes are starting points and need tuning against real
// transcripts during demo dry-run.

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

export const CLAIMS_CALL: SopWorkflow = {
  id: 'claims-call',
  name: 'Claims call',
  description:
    'Inbound patient call about a health insurance claim. Verify identity, disclose claim status, give status-specific follow-up, close.',
  steps: [
    {
      id: 'verify',
      title: 'Verify caller',
      description: 'Capture full name, member ID, and claim ID before disclosing any claim details.',
      guidance:
        'Greet the patient. Collect (1) full name, (2) member ID / policy number, (3) claim ID. Do not disclose claim details until all three are captured. Confirm match against the claims system before proceeding.',
      // Per SOP order claim ID is the last identifier captured, so its mention is the trigger.
      completionCue: /\b(claim\s*(id|number|reference|#))\b/i,
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

// Stable export so importers (voice-intelligence/page.tsx, SopRail.tsx, sop-state.ts) don't change.
export const DEFAULT_WORKFLOW = CLAIMS_CALL
