export type Badge = 'SENT' | 'REVIEW' | 'DONE' | 'FLAGGED' | 'READY' | 'APPROVED'

export type ActionItem = {
  id: string
  which: 'c' | 's'
  time: string
  title: string
  detail: string
  badge: Badge
  needsAction?: boolean
  ai: {
    kind: string
    to?: string
    cc?: string
    subject?: string
    originalEmail?: string
    aiDraft?: string
    confidence?: number
    reasoning?: string[]
    deck?: string
    metaItems?: { k: string; v: string }[]
  }
}

// MOCK ONLY — no real PHI. Healthcare RCM auto-actions for Access Health demo.

export const COMMS_DATA: ActionItem[] = [
  {
    id: 'c0', which: 'c',
    time: '04:12', title: 'Auto-replied to Baylor Scott & White portal.', detail: 'Confirmed receipt of operative report for CLM-9047. Cc\'d Coding.',
    badge: 'SENT',
    ai: {
      kind: 'TIER-1 AUTO-REPLY', to: 'provider-relations@bswhealth.example', cc: 'coding@accesshealthcare.com', subject: 'RE: Operative report received · CLM-9047-2206',
      originalEmail: `From: provider-relations@bswhealth.example
Date: 04:01 CT · 19 May 2026
Subject: Operative report · CLM-9047-2206

Hello Corebridge,

Per your records request dated 28 Apr, please find attached the operative report and pre-op notes for member ANH-2418-4421, DOS 22 Apr 2026 (CPT 70553 · MRI lumbar).

Let us know if anything further is needed for adjudication.

Regards,
BSW Provider Relations`,
      aiDraft: `Hello team,

Thanks for the prompt response. We have received the operative report and pre-op notes for CLM-9047-2206 (member ANH-2418-4421, DOS 22 Apr 2026).

The package has been routed to our Coding team (cc'd) for medical-necessity review. We expect adjudication to conclude by 22 May 2026 and will notify the patient on resolution.

Warm regards,
Afsheen Mohammed
Corebridge Financial · Dallas Hub`,
      confidence: 94,
      reasoning: [
        'Document set appears complete — operative report + pre-op notes attached',
        'Tier-1 provider, auto-reply threshold met (contracted provider)',
        'Coding CC policy active for records-request acknowledgements',
        'No PHI exposure beyond minimum necessary — safe to auto-send',
      ],
      metaItems: [{ k: 'Claim', v: 'CLM-9047-2206' }, { k: 'Stage', v: 'Records received' }, { k: 'SLA', v: 'Response within 4 hrs ✓' }],
    },
  },
  {
    id: 'c1', which: 'c',
    time: '05:48', title: 'Drafted reply to Sharma · denied claim appeal.', detail: 'Awaiting your nuance — appeal timing. Held for 09:15.',
    badge: 'REVIEW', needsAction: true,
    ai: {
      kind: 'DRAFT HELD FOR REVIEW', to: 'Jeeva Sharma <jeeva.sharma@example.com>', subject: 'RE: Appeal options · CLM-8902 · denial code N290',
      originalEmail: `From: Jeeva Sharma <jeeva.sharma@example.com>
Date: 05:31 CT · 19 May 2026
Subject: Appeal options · CLM-8902

Hi Afsheen,

I just got the denial letter (code N290 — missing modifier) for my March MRI claim. My provider's billing office says they can correct and resubmit. What's the appeal window if the resubmission also gets denied? My out-of-pocket on this is already at the OOP max.

Thanks,
Jeeva`,
      aiDraft: `Dear Jeeva,

Thank you for the quick follow-up — and I'm sorry the determination didn't land cleanly the first time.

A few facts for your situation:
  • Corrected resubmissions on N290 (missing modifier) typically clear within 14 business days.
  • If the resubmission is also denied, the formal appeal window is 180 days from the most recent denial date.
  • Since your OOP max is already met for the plan year, any approved adjudication will route plan-paid to the provider directly — no further patient responsibility.

I'll personally watch for the resubmission and notify you by phone or SMS once it lands. If you'd like a written summary of these options on letterhead, just reply YES and I'll send it within the hour.

Warm regards,
Afsheen Mohammed`,
      confidence: 61,
      reasoning: [
        'Member is at OOP max — extra-care messaging required',
        'Appeal window references must come from KB, not inferred — held for review',
        'Provider correction path is standard; appeal path needs human verification of state-specific timing',
        'Recommended: approve after confirming TX-specific appeal timing in KB article AH-APL-002',
      ],
      deck: 'Sharma · Denial Appeal Briefing (auto-generated) · 3 slides',
      metaItems: [{ k: 'Member', v: 'Jeeva Sharma · ANH-3318-2204' }, { k: 'Claim', v: 'CLM-8902 · DOS 14 Mar' }, { k: 'Held since', v: '05:48 CT' }],
    },
  },
  {
    id: 'c2', which: 'c',
    time: '06:02', title: 'Eligibility reminder · Singh, H.', detail: 'Pre-filled refresh form sent. Expires in 7 days.',
    badge: 'SENT',
    ai: {
      kind: 'ELIGIBILITY REMINDER — AUTO-SENT', to: 'Harpreet Singh <h.singh@example.com>', subject: 'Annual eligibility refresh · 7 days remaining',
      aiDraft: `Dear Mr. Singh,

This is a friendly reminder that your annual eligibility refresh is due by 26 May 2026 (7 days from today).

We've pre-filled the form using your last submission so this should take under 90 seconds. Only your current address and a recent contact-number confirmation are needed.

Please click the secure link to review and e-sign: accesshealthcare.com/elig/sign/SG-22841 (valid 7 days)

For assistance, call our Dallas Hub directly at +1 (214) 555-0100.

Warm regards,
Afsheen Mohammed`,
      confidence: 97,
      reasoning: [
        'Eligibility expiry in 7 days — within auto-reminder SLA window',
        'Form pre-populated from last submission (address unchanged)',
        'Standard PPO member — no exceptions required',
        'SMS reminder also dispatched at 06:03',
      ],
      metaItems: [{ k: 'Eligibility expiry', v: '26 May 2026' }, { k: 'Days remaining', v: '7' }, { k: 'Form pre-fill', v: '85% complete' }],
    },
  },
  {
    id: 'c3', which: 'c',
    time: '06:14', title: 'Eligibility reminder · Reyes Group plan.', detail: 'Expires in 11 days. Tier-1 template, low risk.',
    badge: 'SENT',
    ai: {
      kind: 'ELIGIBILITY REMINDER — AUTO-SENT', to: 'Deepak Reyes <d.reyes@reyesgroup.example>', subject: 'Group plan eligibility refresh · action by 30 May 2026',
      aiDraft: `Dear Mr. Reyes,

Your group plan eligibility is due for refresh by 30 May 2026. We've initiated the process early to avoid any disruption to your group's coverage.

A pre-filled refresh form has been prepared. Please confirm your registered group address and submit one recent census update to complete the refresh.

Secure link: accesshealthcare.com/elig/sign/RG-77104

Warm regards,
Afsheen Mohammed`,
      confidence: 98,
      reasoning: ['Eligibility expiry in 11 days — proactive reminder window', 'Tier-1 template applied (group plan, >100 lives)', 'No address change detected in last 2 years'],
      metaItems: [{ k: 'Eligibility expiry', v: '30 May 2026' }, { k: 'Days remaining', v: '11' }, { k: 'Risk', v: 'Low' }],
    },
  },
  {
    id: 'c4', which: 'c',
    time: '06:30', title: 'SMS · Vera Carter benefits desk.', detail: 'Out-of-office acknowledgement, follow-up scheduled 10:00.',
    badge: 'SENT',
    ai: {
      kind: 'SMS AUTO-REPLY', to: 'Vera Carter (+1 555 ••• ••12)', subject: 'SMS auto-acknowledgement',
      aiDraft: `Hi Vera,

Thanks for your message. Afsheen is on a member call until 09:30. Your query has been logged and she'll respond by 10:00 CT.

If urgent, please call our Dallas Hub directly: +1 (214) 555-0100.

— Corebridge AI (on behalf of Afsheen Mohammed)`,
      confidence: 99,
      reasoning: ['SMS received at 06:28 while agent unavailable', 'Standard OOO policy applied', 'Follow-up reminder set for 09:55 CT'],
      metaItems: [{ k: 'Channel', v: 'SMS · Twilio bridge' }, { k: 'Follow-up set', v: '09:55 CT' }, { k: 'Member tier', v: 'Priority' }],
    },
  },
  {
    id: 'c5', which: 'c',
    time: '07:15', title: 'Birthday greeting · Robert Chen.', detail: 'Personalised email + SMS sent. No gift attached (policy).',
    badge: 'SENT',
    ai: {
      kind: 'BIRTHDAY GREETING — AUTO-SENT', to: 'Robert Chen <r.chen@example.com>', subject: 'Wishing you a wonderful birthday, Mr. Chen',
      aiDraft: `Dear Mr. Chen,

Warmest birthday wishes from me and the entire Corebridge Financial family. We're grateful for your continued trust over the years.

Wishing you a year of excellent health and many milestones ahead.

Warm regards,
Afsheen Mohammed & team
Corebridge Financial · Dallas Hub`,
      confidence: 99,
      reasoning: ['Birthday date on file — annual trigger', 'Personal tone template applied for Priority tier', 'Sent at 07:15 to land before business hours'],
      metaItems: [{ k: 'Event', v: 'Birthday — Robert Chen' }, { k: 'Channel', v: 'Email + SMS' }, { k: 'Gift', v: 'None (policy)' }],
    },
  },
  {
    id: 'c6', which: 'c',
    time: '08:04', title: 'Follow-up · Davis & Park provider contract.', detail: 'Gentle nudge sent — no response in 72 hrs.',
    badge: 'SENT',
    ai: {
      kind: 'FOLLOW-UP NUDGE — AUTO-SENT', to: 'Nina Davis <n.davis@davispark.example>', subject: 'RE: Contracted-rate amendment · checking in',
      aiDraft: `Dear Nina,

I wanted to follow up on the contracted-rate amendment we shared on 16 May. I understand it may be moving through your billing committee.

Do let me know if you have any questions or need any adjustments — I'm happy to set up a 15-minute call at your convenience.

Warm regards,
Afsheen Mohammed`,
      confidence: 88,
      reasoning: ['No response to amendment in 72 hrs — follow-up SLA triggered', 'Polite nudge tone applied (not pushy)', 'Annual contract value $480K — Priority escalation threshold'],
      deck: 'Davis & Park · Amendment Summary (auto-generated) · 6 slides',
      metaItems: [{ k: 'Stage', v: 'Amendment sent' }, { k: 'Last contact', v: '16 May 2026' }, { k: 'Annual value', v: '$480K' }],
    },
  },
]

export const SYS_DATA: ActionItem[] = [
  {
    id: 's0', which: 's',
    time: '04:48', title: 'EHR notes synced.', detail: 'Yesterday\'s Iyer call notes formatted, tagged & saved to Epic.',
    badge: 'DONE',
    ai: {
      kind: 'EHR SYNC — COMPLETE',
      reasoning: ['Call transcript auto-transcribed and summarised', '3 action items extracted and added to task queue', 'Epic chart updated with latest interaction date'],
      metaItems: [{ k: 'Patient', v: 'Iyer, M.' }, { k: 'Notes', v: '3 action items extracted' }, { k: 'Tags applied', v: 'prior-auth, appeal, denial-code' }],
    },
  },
  {
    id: 's1', which: 's',
    time: '05:14', title: 'Claim status updated · CLM-8902 Sharma.', detail: 'Auto-adjudication cleared. Plan paid posted.',
    badge: 'DONE',
    ai: {
      kind: 'CLAIM UPDATE — COMPLETE',
      reasoning: ['Adjudication engine cleared claim with 0 exceptions', 'Plan-paid posted to provider via EFT', 'Member notified via SMS + EOB queued'],
      metaItems: [{ k: 'Claim', v: 'CLM-8902 · Sharma, S.' }, { k: 'Status', v: 'Paid → EOB queued' }, { k: 'Confidence', v: '94%' }],
    },
  },
  {
    id: 's2', which: 's',
    time: '06:02', title: 'SLA risk · Verma eligibility verification.', detail: '48-hr breach predicted. Suggesting reassignment to Aaron Kim.',
    badge: 'REVIEW', needsAction: true,
    ai: {
      kind: 'SLA RISK — NEEDS YOUR REVIEW',
      reasoning: [
        'Eligibility docs pending — member unreachable for 4 days',
        'SLA breach predicted in 48 hrs at current pace',
        'Aaron Kim has lower current workload (4 vs 11 open verifications)',
        'Auto-reassign blocked pending your approval',
      ],
      deck: 'Verma · Eligibility Risk Summary · 2 slides',
      metaItems: [{ k: 'Member', v: 'Verma, R.' }, { k: 'Eligibility deadline', v: '21 May 2026' }, { k: 'Suggested action', v: 'Reassign to Aaron Kim' }],
    },
  },
  {
    id: 's3', which: 's',
    time: '06:24', title: 'Cross-sell signal · Garcia family.', detail: 'Annual deductible reset — supplemental rider fit. NBA prepped.',
    badge: 'FLAGGED',
    ai: {
      kind: 'CROSS-SELL OPPORTUNITY — FLAGGED',
      reasoning: [
        'Annual deductible just reset — open enrollment window for supplemental',
        'Family has 3 dependents; supplemental rider fit score: 87/100',
        'NBA engine recommends Access Premium Family supplemental',
        'Prep pack auto-generated for your use',
      ],
      deck: 'Garcia Family · Supplemental Fit Brief · 5 slides',
      metaItems: [{ k: 'Member', v: 'Garcia family · Premium' }, { k: 'Event', v: 'Deductible reset · 4-wk window' }, { k: 'Recommended', v: 'Access Premium Family rider' }],
    },
  },
  {
    id: 's4', which: 's',
    time: '06:48', title: 'T&E ready · Houston site visit.', detail: 'OCR extracted 12 receipts. Submission pre-filled.',
    badge: 'READY',
    ai: {
      kind: 'T&E SUBMISSION — READY TO SEND',
      reasoning: ['Email attachments detected as receipts from Houston trip dates', 'OCR extracted amounts and merchant names', 'Concur submission form pre-filled — pending your digital signature'],
      metaItems: [{ k: 'Trip', v: 'Houston provider visit · 7–8 May' }, { k: 'Receipts', v: '12 extracted via OCR' }, { k: 'Total amount', v: '$182.40' }],
    },
  },
]

export const ALL_ITEMS: ActionItem[] = [...COMMS_DATA, ...SYS_DATA]

export const BADGE_STYLE: Record<Badge, { color: string; border: string }> = {
  SENT:     { color: '#16a34a', border: '#16a34a' },
  REVIEW:   { color: '#dc2626', border: '#dc2626' },
  DONE:     { color: '#6b7280', border: '#9ca3af' },
  FLAGGED:  { color: '#b45309', border: '#d97706' },
  READY:    { color: '#2563eb', border: '#3b82f6' },
  APPROVED: { color: '#16a34a', border: '#16a34a' },
}
