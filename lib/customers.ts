// MOCK ONLY — no real PHI. Access Health RCM customer roster for the demo.
//
// 10 members keyed by E.164 phone number. When the live-call backend sends
// the caller's phone on the call_start event, the UI uses findByPhone() to
// hydrate the entire right-hand pane (member, claim, coverage, history,
// compliance) without any extra API call.
//
// Three demo flows are represented across the roster:
//   - claim_status        — denied / in-review / completed claim conversations
//   - eligibility_priorauth — verify coverage + prior-auth before service
//   - billing_refund       — credit balance, billing dispute, OOP question
//
// To add or change a customer, just edit/append to CUSTOMERS below. Keep the
// `phone` field unique and in E.164 format.

export type RcmFlow = 'claim_status' | 'eligibility_priorauth' | 'billing_refund'
export type Sentiment = 'positive' | 'neutral' | 'cooling' | 'negative'
export type PlanType = 'PPO' | 'HMO' | 'EPO' | 'POS' | 'HDHP' | 'Medicare Advantage' | 'Medicare + Supplement'
export type ClaimStatus = 'submitted' | 'in_review' | 'paid' | 'denied' | 'partial'
export type PriorAuthStatus = 'approved' | 'pending' | 'denied' | 'expired'
export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled'

export interface ClaimEntry {
  id: string
  serviceDate: string         // YYYY-MM-DD
  provider: string
  serviceType: string
  cpt?: string
  billed: number
  allowed: number
  planPaid: number
  patientResp: number
  status: ClaimStatus
  denialCode?: string         // e.g. "N290"
  denialReason?: string
  appealDeadline?: string     // YYYY-MM-DD
  notes?: string
}

export interface PriorAuthEntry {
  id: string                  // PA-77310
  procedure: string
  cpt?: string
  status: PriorAuthStatus
  effective?: string
  expires?: string
  orderingProvider: string
}

export interface EligibilityEvent {
  date: string
  type: '270/271' | 'refresh' | 'denial' | 'plan_change'
  result: string
  source: string
}

export interface Appointment {
  date: string
  provider: string
  type: string
  status: AppointmentStatus
  notes?: string
}

export interface CallHistoryEntry {
  date: string
  channel: 'call' | 'sms' | 'email' | 'portal'
  topic: string
  sentiment: Sentiment
  outcome: string
  agent: string
}

export interface Customer {
  // Identity
  phone: string               // E.164 — primary key
  phoneDisplay: string        // formatted for UI
  memberId: string
  name: string                // "Mr. Michael Anderson"
  firstName: string
  lastName: string
  initials: string
  dob: string                 // YYYY-MM-DD
  email: string
  city: string
  state: string               // 2-letter
  language: 'en' | 'es' | 'tl'

  // Plan
  payer: string               // "BCBS TX"
  planName: string            // "BCBS TX PPO Gold"
  planType: PlanType
  groupId: string
  effectiveDate: string
  pcp: string

  // Demo flow context
  flow: RcmFlow
  callReason: string          // one-line description of why they're calling
  sentiment: Sentiment
  activeClaimId?: string      // which claim is the focus of this call

  // Eligibility / benefits
  eligibility: {
    status: 'active' | 'inactive' | 'pending'
    asOf: string              // YYYY-MM-DD
    deductibleMet: number
    deductibleTotal: number
    oopMet: number
    oopTotal: number
    copaySpecialist: number
    coinsurancePct: number
    priorAuthRequired: string[]   // service types requiring PA
    events: EligibilityEvent[]
  }

  // History
  priorAuths: PriorAuthEntry[]
  claims: ClaimEntry[]
  appointments: Appointment[]
  callHistory: CallHistoryEntry[]

  // Balances
  arOutstanding: number       // accounts receivable open balance
  creditBalance?: number      // optional refundable credit

  // Free-text agent notes
  notes: string
}

// ─── 10 customer roster ───────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  // 1. Michael Anderson — primary demo subject (in-review claim)
  {
    phone: '+12145550188', phoneDisplay: '+1 (214) 555-0188',
    memberId: 'ANH-2418-4421', name: 'Mr. Michael Anderson',
    firstName: 'Michael', lastName: 'Anderson', initials: 'MA',
    dob: '1978-04-14', email: 'm.anderson@example.com',
    city: 'Dallas', state: 'TX', language: 'en',
    payer: 'BCBS TX', planName: 'BCBS TX PPO Gold', planType: 'PPO',
    groupId: 'GRP-TX-00112', effectiveDate: '2026-01-01', pcp: 'Dr. L. Okafor (Dallas Downtown)',
    flow: 'claim_status',
    callReason: 'Following up on prior-auth claim CLM-9047 (MRI lumbar) — wants adjudication ETA.',
    sentiment: 'neutral',
    activeClaimId: 'CLM-9047-2206',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 750, deductibleTotal: 1500,
      oopMet: 2140, oopTotal: 5000,
      copaySpecialist: 45, coinsurancePct: 20,
      priorAuthRequired: ['MRI', 'CT with contrast', 'Inpatient surgery'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Gold · effective 2026-01-01', source: 'BCBS TX EDI' },
        { date: '2026-01-04', type: 'plan_change', result: 'Silver → Gold (open-enrollment upgrade)', source: 'BCBS TX portal' },
      ],
    },
    priorAuths: [
      { id: 'PA-77310', procedure: 'MRI lumbar w/o contrast', cpt: '72148', status: 'approved', effective: '2026-04-20', expires: '2026-10-20', orderingProvider: 'Dr. L. Okafor' },
    ],
    claims: [
      { id: 'CLM-9047-2206', serviceDate: '2026-04-22', provider: 'Baylor Scott & White', serviceType: 'MRI lumbar (outpatient)', cpt: '72148', billed: 3420.00, allowed: 1810.00, planPaid: 1448.00, patientResp: 362.00, status: 'in_review', notes: 'Awaiting operative report from provider — requested 2026-04-28.' },
      { id: 'CLM-8821-1402', serviceDate: '2026-02-09', provider: 'Dr. L. Okafor', serviceType: 'Office visit', cpt: '99213', billed: 145.00, allowed: 95.00, planPaid: 55.00, patientResp: 40.00, status: 'paid' },
      { id: 'CLM-8617-0114', serviceDate: '2026-01-14', provider: 'Quest Diagnostics', serviceType: 'CMP + lipid panel', cpt: '80053', billed: 220.00, allowed: 165.00, planPaid: 53.00, patientResp: 112.00, status: 'paid' },
      { id: 'CLM-8104-1103', serviceDate: '2025-11-03', provider: 'Dr. P. Reddy (Cardiology)', serviceType: 'Specialist consult', cpt: '99244', billed: 280.00, allowed: 195.00, planPaid: 150.00, patientResp: 45.00, status: 'paid' },
      { id: 'CLM-7710-0912', serviceDate: '2025-09-12', provider: 'Dr. L. Okafor', serviceType: 'Annual physical (preventive)', cpt: '99396', billed: 240.00, allowed: 240.00, planPaid: 240.00, patientResp: 0, status: 'paid' },
    ],
    appointments: [
      { date: '2026-04-22', provider: 'Baylor Scott & White (Radiology)', type: 'MRI lumbar', status: 'completed' },
      { date: '2026-06-04', provider: 'Dr. L. Okafor', type: 'Follow-up — back pain', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-11', channel: 'email', topic: 'Records request status', sentiment: 'neutral', outcome: 'BSW Provider Relations confirmed records sent', agent: 'Jane Doe' },
      { date: '2026-05-04', channel: 'call', topic: 'Eligibility verify + plan walk', sentiment: 'positive', outcome: 'Confirmed PCP + copay', agent: 'Jane Doe' },
      { date: '2026-04-14', channel: 'call', topic: 'Appeal timeline question (N290)', sentiment: 'cooling', outcome: 'Escalated to Tier-2', agent: 'Jane Doe' },
    ],
    arOutstanding: 362.00,
    notes: 'OOP costs sensitive — currently at OOP max for the plan year.',
  },

  // 2. Sarah Lopez — denied claim with appeal options
  {
    phone: '+17135550212', phoneDisplay: '+1 (713) 555-0212',
    memberId: 'LPZ-3318-2204', name: 'Ms. Sarah Lopez',
    firstName: 'Sarah', lastName: 'Lopez', initials: 'SL',
    dob: '1985-09-23', email: 's.lopez@example.com',
    city: 'Houston', state: 'TX', language: 'en',
    payer: 'Aetna', planName: 'Aetna Silver HMO', planType: 'HMO',
    groupId: 'GRP-TX-00342', effectiveDate: '2025-07-01', pcp: 'Dr. R. Mahmood (Houston West)',
    flow: 'claim_status',
    callReason: 'Wants appeal options for denied MRI claim CLM-8902 — code N290 (missing modifier).',
    sentiment: 'negative',
    activeClaimId: 'CLM-8902-1404',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 1500, deductibleTotal: 1500,
      oopMet: 4000, oopTotal: 4000,    // already at OOP max
      copaySpecialist: 50, coinsurancePct: 25,
      priorAuthRequired: ['MRI', 'PET', 'Inpatient'],
      events: [
        { date: '2026-05-15', type: '270/271', result: 'Active · OOP max met for plan year', source: 'Aetna EDI' },
      ],
    },
    priorAuths: [
      { id: 'PA-66104', procedure: 'MRI knee w/ contrast', cpt: '73722', status: 'approved', effective: '2026-03-08', expires: '2026-09-08', orderingProvider: 'Dr. R. Mahmood' },
    ],
    claims: [
      { id: 'CLM-8902-1404', serviceDate: '2026-03-14', provider: 'Memorial Hermann', serviceType: 'MRI knee with contrast', cpt: '73722', billed: 2890.00, allowed: 0, planPaid: 0, patientResp: 2890.00, status: 'denied', denialCode: 'N290', denialReason: 'Missing modifier on procedure code (technical denial — correctable)', appealDeadline: '2026-09-10', notes: 'Provider can correct + resubmit; appeal window 180 days.' },
      { id: 'CLM-8455-0918', serviceDate: '2025-09-18', provider: 'Dr. R. Mahmood', serviceType: 'Office visit + injection', cpt: '99213+J3301', billed: 320.00, allowed: 240.00, planPaid: 190.00, patientResp: 50.00, status: 'paid' },
      { id: 'CLM-8203-0612', serviceDate: '2025-06-12', provider: 'Houston Imaging Center', serviceType: 'X-ray knee', cpt: '73564', billed: 180.00, allowed: 90.00, planPaid: 40.00, patientResp: 50.00, status: 'paid' },
    ],
    appointments: [
      { date: '2026-03-14', provider: 'Memorial Hermann', type: 'MRI knee', status: 'completed', notes: 'Service rendered but claim denied — see CLM-8902.' },
      { date: '2026-06-12', provider: 'Dr. R. Mahmood', type: 'Knee follow-up', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-10', channel: 'portal', topic: 'Denial inquiry', sentiment: 'negative', outcome: 'Acknowledged — appeal path explained', agent: 'Aaron Kim' },
      { date: '2026-03-20', channel: 'sms', topic: 'Claim status alert', sentiment: 'neutral', outcome: 'Auto-notification of denial', agent: 'system' },
    ],
    arOutstanding: 2890.00,
    notes: 'Member is at OOP max for plan year — if appeal succeeds, plan pays 100%. Lead with empathy + technical-correction path before formal appeal.',
  },

  // 3. Robert Chen — completed claim, EOB explanation
  {
    phone: '+12025550143', phoneDisplay: '+1 (202) 555-0143',
    memberId: 'CHN-7714-0908', name: 'Mr. Robert Chen',
    firstName: 'Robert', lastName: 'Chen', initials: 'RC',
    dob: '1962-11-08', email: 'r.chen@example.com',
    city: 'Washington', state: 'DC', language: 'en',
    payer: 'UnitedHealthcare', planName: 'UHC Medicare Advantage', planType: 'Medicare Advantage',
    groupId: 'GRP-DC-AARP-001', effectiveDate: '2024-01-01', pcp: 'Dr. M. Nguyen (Capitol Hill Internal Med)',
    flow: 'claim_status',
    callReason: 'Doesn\'t understand the EOB he received — wants the line items explained.',
    sentiment: 'neutral',
    activeClaimId: 'CLM-9112-0428',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 0, deductibleTotal: 0,   // Medicare Advantage — no deductible
      oopMet: 1240, oopTotal: 7550,
      copaySpecialist: 30, coinsurancePct: 0,
      priorAuthRequired: ['MRI', 'PET', 'CT', 'DME'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · MA plan · effective 2024-01-01', source: 'CMS EDI' },
      ],
    },
    priorAuths: [],
    claims: [
      { id: 'CLM-9112-0428', serviceDate: '2026-04-28', provider: 'MedStar Washington Hospital', serviceType: 'Outpatient lab + EKG', cpt: '80053, 93000', billed: 1840.00, allowed: 1620.00, planPaid: 1590.00, patientResp: 30.00, status: 'paid', notes: 'EOB sent 2026-05-12; payment posted EFT 2026-05-13.' },
      { id: 'CLM-9001-0312', serviceDate: '2026-03-12', provider: 'Dr. M. Nguyen', serviceType: 'Office visit', cpt: '99214', billed: 165.00, allowed: 132.00, planPaid: 102.00, patientResp: 30.00, status: 'paid' },
      { id: 'CLM-8678-0117', serviceDate: '2026-01-17', provider: 'Quest Diagnostics', serviceType: 'Lipid + CMP', cpt: '80053', billed: 180.00, allowed: 140.00, planPaid: 140.00, patientResp: 0, status: 'paid' },
    ],
    appointments: [
      { date: '2026-04-28', provider: 'MedStar Washington', type: 'Outpatient lab + EKG', status: 'completed' },
      { date: '2026-08-15', provider: 'Dr. M. Nguyen', type: 'Annual wellness visit', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-15', channel: 'call', topic: 'EOB question (CLM-9112)', sentiment: 'neutral', outcome: 'Walked through allowed vs billed; member satisfied', agent: 'Jane Doe' },
    ],
    arOutstanding: 30.00,
    notes: 'Senior member — explain plainly, avoid jargon. Allowed-vs-billed often confuses MA members.',
  },

  // 4. Marcus Williams — prior auth status (anxious, day-before)
  {
    phone: '+14045550199', phoneDisplay: '+1 (404) 555-0199',
    memberId: 'WIL-6629-1812', name: 'Mr. Marcus Williams',
    firstName: 'Marcus', lastName: 'Williams', initials: 'MW',
    dob: '1972-07-19', email: 'm.williams@example.com',
    city: 'Atlanta', state: 'GA', language: 'en',
    payer: 'Cigna', planName: 'Cigna PPO Bronze', planType: 'PPO',
    groupId: 'GRP-GA-COKE-104', effectiveDate: '2026-01-01', pcp: 'Dr. J. Patel (Buckhead Family Med)',
    flow: 'eligibility_priorauth',
    callReason: 'MRI knee scheduled tomorrow — wants to confirm prior auth has been approved.',
    sentiment: 'cooling',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 4200, deductibleTotal: 6000,
      oopMet: 6200, oopTotal: 9000,
      copaySpecialist: 60, coinsurancePct: 30,
      priorAuthRequired: ['MRI', 'CT', 'Inpatient surgery', 'Imaging > $1500'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Bronze · deductible 70% met', source: 'Cigna EDI' },
        { date: '2026-05-18', type: 'refresh', result: 'Eligibility refreshed pre-appointment', source: 'Jane Doe' },
      ],
    },
    priorAuths: [
      { id: 'PA-88421', procedure: 'MRI knee w/o contrast', cpt: '73721', status: 'pending', effective: '2026-05-20', orderingProvider: 'Dr. S. Hwang (Orthopedics)' },
    ],
    claims: [
      { id: 'CLM-9220-0508', serviceDate: '2026-05-08', provider: 'Dr. S. Hwang', serviceType: 'Ortho consult', cpt: '99244', billed: 320.00, allowed: 240.00, planPaid: 180.00, patientResp: 60.00, status: 'paid' },
      { id: 'CLM-8980-0220', serviceDate: '2026-02-20', provider: 'Dr. J. Patel', serviceType: 'Office visit', cpt: '99213', billed: 150.00, allowed: 100.00, planPaid: 40.00, patientResp: 60.00, status: 'paid' },
    ],
    appointments: [
      { date: '2026-05-20', provider: 'Piedmont Imaging', type: 'MRI knee', status: 'scheduled', notes: 'Awaiting PA-88421 approval.' },
      { date: '2026-06-03', provider: 'Dr. S. Hwang', type: 'MRI review', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-19', channel: 'call', topic: 'Pre-procedure check', sentiment: 'cooling', outcome: 'In-progress — current call', agent: 'Jane Doe' },
      { date: '2026-05-10', channel: 'portal', topic: 'PA-88421 submitted', sentiment: 'neutral', outcome: 'Auto-routed to medical-necessity review', agent: 'system' },
    ],
    arOutstanding: 0,
    notes: 'Service tomorrow — escalate to expedited PA review if not approved by EOD. Empathy first: member is anxious.',
  },

  // 5. Jennifer O'Connor — new PCP visit, eligibility check
  {
    phone: '+16175550234', phoneDisplay: '+1 (617) 555-0234',
    memberId: 'OCO-4488-3306', name: 'Dr. Jennifer O\'Connor',
    firstName: 'Jennifer', lastName: 'O\'Connor', initials: 'JO',
    dob: '1990-03-22', email: 'j.oconnor@example.com',
    city: 'Boston', state: 'MA', language: 'en',
    payer: 'BCBS MA', planName: 'BCBS MA HMO Silver', planType: 'HMO',
    groupId: 'GRP-MA-HARVARD-217', effectiveDate: '2026-04-01', pcp: 'Dr. S. Kim (Brigham Primary Care)',
    flow: 'eligibility_priorauth',
    callReason: 'First visit with new PCP next week — wants to confirm in-network coverage and copay.',
    sentiment: 'positive',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 0, deductibleTotal: 1500,
      oopMet: 0, oopTotal: 4500,
      copaySpecialist: 35, coinsurancePct: 20,
      priorAuthRequired: ['MRI', 'CT', 'PT > 6 visits', 'Inpatient'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Silver HMO · effective 2026-04-01', source: 'BCBS MA EDI' },
        { date: '2026-04-01', type: 'plan_change', result: 'New enrollment — employer-sponsored', source: 'Group plan setup' },
      ],
    },
    priorAuths: [],
    claims: [],
    appointments: [
      { date: '2026-05-26', provider: 'Dr. S. Kim', type: 'New-patient PCP visit', status: 'scheduled', notes: 'First visit on new plan.' },
    ],
    callHistory: [
      { date: '2026-05-19', channel: 'call', topic: 'Pre-visit coverage check', sentiment: 'positive', outcome: 'In-progress — current call', agent: 'Jane Doe' },
    ],
    arOutstanding: 0,
    notes: 'New member — high opportunity for retention and satisfaction. PCP visit is preventive ($0 copay if coded right).',
  },

  // 6. David Kim — credit balance / refund request
  {
    phone: '+12065550167', phoneDisplay: '+1 (206) 555-0167',
    memberId: 'KIM-5512-7720', name: 'Mr. David Kim',
    firstName: 'David', lastName: 'Kim', initials: 'DK',
    dob: '1981-12-04', email: 'd.kim@example.com',
    city: 'Seattle', state: 'WA', language: 'en',
    payer: 'Premera BCBS', planName: 'Premera BCBS PPO Gold', planType: 'PPO',
    groupId: 'GRP-WA-AMZN-3309', effectiveDate: '2024-01-01', pcp: 'Dr. T. Lee (Capitol Hill Med)',
    flow: 'billing_refund',
    callReason: 'Got a refund notice in the mail — wants to confirm credit balance and refund timeline.',
    sentiment: 'neutral',
    activeClaimId: 'CLM-8744-0228',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 1500, deductibleTotal: 1500,
      oopMet: 3200, oopTotal: 5000,
      copaySpecialist: 40, coinsurancePct: 20,
      priorAuthRequired: ['MRI', 'CT', 'Inpatient'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Gold PPO', source: 'Premera EDI' },
      ],
    },
    priorAuths: [],
    claims: [
      { id: 'CLM-8744-0228', serviceDate: '2026-02-28', provider: 'Swedish Medical', serviceType: 'Outpatient surgery — minor', cpt: '12001', billed: 1200.00, allowed: 900.00, planPaid: 720.00, patientResp: 180.00, status: 'paid', notes: 'Member paid $600.50 at point of service; plan-paid + patient-paid > patient-resp → $420.50 credit.' },
      { id: 'CLM-8612-0114', serviceDate: '2026-01-14', provider: 'Dr. T. Lee', serviceType: 'Office visit', cpt: '99213', billed: 150.00, allowed: 105.00, planPaid: 65.00, patientResp: 40.00, status: 'paid' },
    ],
    appointments: [
      { date: '2026-02-28', provider: 'Swedish Medical', type: 'Minor outpatient procedure', status: 'completed' },
      { date: '2026-07-10', provider: 'Dr. T. Lee', type: 'Annual physical', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-12', channel: 'email', topic: 'Refund notice generated', sentiment: 'neutral', outcome: 'Auto-notification of $420.50 credit', agent: 'system' },
    ],
    arOutstanding: 0,
    creditBalance: 420.50,
    notes: 'Refund issued via ACH (10-business-day SLA). Member can also opt for check or credit-toward-next-bill.',
  },

  // 7. Aisha Patel — surprise bill / in-network dispute
  {
    phone: '+13035550155', phoneDisplay: '+1 (303) 555-0155',
    memberId: 'PTL-7723-0011', name: 'Ms. Aisha Patel',
    firstName: 'Aisha', lastName: 'Patel', initials: 'AP',
    dob: '1976-05-14', email: 'a.patel@example.com',
    city: 'Denver', state: 'CO', language: 'en',
    payer: 'Anthem', planName: 'Anthem PPO Silver', planType: 'PPO',
    groupId: 'GRP-CO-OUTDOOR-91', effectiveDate: '2025-01-01', pcp: 'Dr. C. Aguilar (Highlands Family Med)',
    flow: 'billing_refund',
    callReason: 'Received an $1,840 bill after what she thought was an in-network procedure — wants a breakdown and dispute review.',
    sentiment: 'negative',
    activeClaimId: 'CLM-8855-0410',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 1800, deductibleTotal: 3000,
      oopMet: 4400, oopTotal: 6500,
      copaySpecialist: 50, coinsurancePct: 30,
      priorAuthRequired: ['MRI', 'Inpatient', 'Outpatient surgery > $5000'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Silver PPO', source: 'Anthem EDI' },
      ],
    },
    priorAuths: [],
    claims: [
      { id: 'CLM-8855-0410', serviceDate: '2026-04-10', provider: 'St. Joseph Hospital — Anesthesia by out-of-network MD', serviceType: 'Outpatient procedure + anesthesia (split billing)', cpt: '00400, 12032', billed: 6420.00, allowed: 3210.00, planPaid: 1370.00, patientResp: 1840.00, status: 'partial', notes: 'Hospital in-network ✓; anesthesia performed by out-of-network MD — surprise billing. NSA (No Surprises Act) likely applies.' },
      { id: 'CLM-8602-0205', serviceDate: '2026-02-05', provider: 'Dr. C. Aguilar', serviceType: 'Office visit', cpt: '99213', billed: 150.00, allowed: 110.00, planPaid: 60.00, patientResp: 50.00, status: 'paid' },
    ],
    appointments: [
      { date: '2026-04-10', provider: 'St. Joseph Hospital', type: 'Outpatient procedure', status: 'completed' },
    ],
    callHistory: [
      { date: '2026-05-14', channel: 'portal', topic: 'Billing dispute filed', sentiment: 'negative', outcome: 'Ticket #BIL-22841 — under review', agent: 'system' },
      { date: '2026-05-08', channel: 'call', topic: 'Initial surprise bill complaint', sentiment: 'negative', outcome: 'Escalated to Tier-2', agent: 'Aaron Kim' },
    ],
    arOutstanding: 1840.00,
    notes: 'Possible No Surprises Act protection — anesthesia OON at in-network facility. Recommend NSA dispute pathway before patient-responsibility commitment.',
  },

  // 8. Luis Hernandez — schedule specialist + start prior auth
  {
    phone: '+19155550112', phoneDisplay: '+1 (915) 555-0112',
    memberId: 'HRN-3344-2255', name: 'Mr. Luis Hernandez',
    firstName: 'Luis', lastName: 'Hernandez', initials: 'LH',
    dob: '1968-08-30', email: 'l.hernandez@example.com',
    city: 'El Paso', state: 'TX', language: 'es',
    payer: 'Humana', planName: 'Humana PPO Bronze', planType: 'PPO',
    groupId: 'GRP-TX-BORDER-002', effectiveDate: '2025-07-01', pcp: 'Dr. A. Garza (El Paso Primary)',
    flow: 'eligibility_priorauth',
    callReason: 'PCP referred him to cardiology — wants to schedule the consult and start prior auth process.',
    sentiment: 'neutral',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 800, deductibleTotal: 5500,
      oopMet: 1200, oopTotal: 8500,
      copaySpecialist: 75, coinsurancePct: 35,
      priorAuthRequired: ['Cardiac stress test', 'Echo', 'MRI', 'CT'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Bronze PPO', source: 'Humana EDI' },
      ],
    },
    priorAuths: [],
    claims: [
      { id: 'CLM-9165-0502', serviceDate: '2026-05-02', provider: 'Dr. A. Garza', serviceType: 'Office visit — chest discomfort', cpt: '99214', billed: 180.00, allowed: 140.00, planPaid: 0, patientResp: 75.00, status: 'paid', notes: 'Copay only — deductible not applied to copay.' },
    ],
    appointments: [
      { date: '2026-05-02', provider: 'Dr. A. Garza', type: 'PCP visit', status: 'completed' },
    ],
    callHistory: [
      { date: '2026-05-19', channel: 'call', topic: 'Schedule cardiology + PA', sentiment: 'neutral', outcome: 'In-progress — current call', agent: 'Jane Doe' },
      { date: '2026-05-02', channel: 'sms', topic: 'PCP referral notification', sentiment: 'neutral', outcome: 'Auto-sent referral details', agent: 'system' },
    ],
    arOutstanding: 0,
    notes: 'Spanish-language preferred for written follow-ups. PCP referral on file (no prior auth needed for specialist visit itself; stress test will need PA).',
  },

  // 9. Maria Walker — repeated denials pattern (family plan)
  {
    phone: '+12015550178', phoneDisplay: '+1 (201) 555-0178',
    memberId: 'WAL-6644-1188', name: 'Mrs. Maria Walker',
    firstName: 'Maria', lastName: 'Walker', initials: 'MW',
    dob: '1979-02-11', email: 'm.walker@example.com',
    city: 'Newark', state: 'NJ', language: 'en',
    payer: 'Horizon BCBS', planName: 'Horizon BCBS PPO Family', planType: 'PPO',
    groupId: 'GRP-NJ-FAMILY-005', effectiveDate: '2026-01-01', pcp: 'Dr. E. Bukhari (Newark Family)',
    flow: 'claim_status',
    callReason: 'Three of her family\'s claims have been denied with the same code in the last 60 days — wants to understand the pattern.',
    sentiment: 'negative',
    activeClaimId: 'CLM-7889-0418',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 3200, deductibleTotal: 4500,
      oopMet: 6800, oopTotal: 9000,
      copaySpecialist: 50, coinsurancePct: 25,
      priorAuthRequired: ['MRI', 'CT', 'Inpatient'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · Family PPO · 3 dependents', source: 'Horizon EDI' },
        { date: '2026-04-25', type: 'denial', result: 'Subscriber-ID mismatch — group plan + member record out of sync', source: 'Horizon EDI' },
      ],
    },
    priorAuths: [],
    claims: [
      { id: 'CLM-7889-0418', serviceDate: '2026-04-18', provider: 'Dr. K. Reyes (Pediatrics)', serviceType: 'Sick visit — daughter (age 8)', cpt: '99213', billed: 220.00, allowed: 0, planPaid: 0, patientResp: 0, status: 'denied', denialCode: 'M127', denialReason: 'Missing primary identifier (subscriber ID mismatch)', appealDeadline: '2026-10-15' },
      { id: 'CLM-7811-0402', serviceDate: '2026-04-02', provider: 'Dr. K. Reyes', serviceType: 'Sick visit — son (age 12)', cpt: '99213', billed: 220.00, allowed: 0, planPaid: 0, patientResp: 0, status: 'denied', denialCode: 'M127', denialReason: 'Missing primary identifier', appealDeadline: '2026-09-29' },
      { id: 'CLM-7780-0320', serviceDate: '2026-03-20', provider: 'Newark Urgent Care', serviceType: 'Urgent care — son (age 16)', cpt: '99284', billed: 480.00, allowed: 0, planPaid: 0, patientResp: 0, status: 'denied', denialCode: 'M127', denialReason: 'Missing primary identifier', appealDeadline: '2026-09-16' },
      { id: 'CLM-7610-0214', serviceDate: '2026-02-14', provider: 'Dr. E. Bukhari', serviceType: 'PCP visit — Maria', cpt: '99213', billed: 165.00, allowed: 115.00, planPaid: 65.00, patientResp: 50.00, status: 'paid' },
    ],
    appointments: [
      { date: '2026-04-18', provider: 'Dr. K. Reyes (Pediatrics)', type: 'Sick visit', status: 'completed' },
      { date: '2026-04-02', provider: 'Dr. K. Reyes', type: 'Sick visit', status: 'completed' },
    ],
    callHistory: [
      { date: '2026-05-15', channel: 'call', topic: 'Denial pattern complaint', sentiment: 'negative', outcome: 'Escalated to Tier-2 — root-cause review', agent: 'Aaron Kim' },
      { date: '2026-04-26', channel: 'portal', topic: '3rd denial received', sentiment: 'negative', outcome: 'Ticket #DEN-9921 opened', agent: 'system' },
    ],
    arOutstanding: 0,
    notes: 'ROOT CAUSE: 3 denials all M127 (subscriber-ID mismatch on dependents) — likely group-plan ID mapping issue from January renewal. All 3 are correctable + resubmittable. Lead with apology + root-cause acknowledgement.',
  },

  // 10. Olivia Brooks — pre-procedure OOP projection (Medicare + Supplement)
  {
    phone: '+16025550189', phoneDisplay: '+1 (602) 555-0189',
    memberId: 'BRK-9911-4422', name: 'Mrs. Olivia Brooks',
    firstName: 'Olivia', lastName: 'Brooks', initials: 'OB',
    dob: '1958-10-05', email: 'o.brooks@example.com',
    city: 'Phoenix', state: 'AZ', language: 'en',
    payer: 'Aetna (Medicare Supplement)', planName: 'Medicare Part A/B + Aetna Plan G', planType: 'Medicare + Supplement',
    groupId: 'GRP-AZ-RETIREE-7700', effectiveDate: '2023-06-01', pcp: 'Dr. P. Singh (Phoenix Senior Health)',
    flow: 'eligibility_priorauth',
    callReason: 'Hip replacement scheduled for next month — wants out-of-pocket cost projection and prior-auth status.',
    sentiment: 'cooling',
    eligibility: {
      status: 'active', asOf: '2026-05-19',
      deductibleMet: 0, deductibleTotal: 240,       // Medicare Part B deductible
      oopMet: 480, oopTotal: 0,                     // Plan G covers most cost-sharing; no OOP max published
      copaySpecialist: 0, coinsurancePct: 0,
      priorAuthRequired: ['Inpatient surgery', 'SNF stay', 'DME > $500'],
      events: [
        { date: '2026-05-19', type: '270/271', result: 'Active · MA Plan G + Original Medicare', source: 'CMS EDI' },
      ],
    },
    priorAuths: [
      { id: 'PA-99102', procedure: 'Total hip arthroplasty (right)', cpt: '27130', status: 'pending', effective: '2026-06-15', orderingProvider: 'Dr. F. Okonkwo (Orthopedics)' },
    ],
    claims: [
      { id: 'CLM-9088-0408', serviceDate: '2026-04-08', provider: 'Dr. F. Okonkwo', serviceType: 'Pre-surgical ortho consult', cpt: '99245', billed: 380.00, allowed: 280.00, planPaid: 280.00, patientResp: 0, status: 'paid' },
      { id: 'CLM-8950-0322', serviceDate: '2026-03-22', provider: 'Phoenix Imaging', serviceType: 'Hip X-ray + MRI', cpt: '73721, 73510', billed: 1480.00, allowed: 1180.00, planPaid: 1180.00, patientResp: 0, status: 'paid' },
    ],
    appointments: [
      { date: '2026-06-15', provider: 'St. Joseph\'s Hospital (Phoenix)', type: 'Total hip arthroplasty (right)', status: 'scheduled' },
      { date: '2026-06-20', provider: 'Home Health Network', type: 'Post-op PT eval', status: 'scheduled' },
    ],
    callHistory: [
      { date: '2026-05-19', channel: 'call', topic: 'OOP projection + PA status', sentiment: 'cooling', outcome: 'In-progress — current call', agent: 'Jane Doe' },
      { date: '2026-05-02', channel: 'call', topic: 'Pre-surgical questions', sentiment: 'neutral', outcome: 'Walked through surgical pathway', agent: 'Jane Doe' },
    ],
    arOutstanding: 0,
    notes: 'Plan G covers Part B coinsurance + Part A deductible. Estimated OOP for THA: ~$240 (Part B deductible if not yet met). Reassure on coverage; loop in Care Management for post-op coordination.',
  },
]

// ─── Lookup helpers ──────────────────────────────────────────────────────────

// Normalise any phone string to E.164 (US-default). Returns null if it can't be parsed.
export function toE164(raw: string | undefined | null): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (!t) return null
  const sign = t.startsWith('+') ? '+' : ''
  const digits = t.replace(/\D/g, '')
  if (!sign && digits.length === 10) return `+1${digits}`
  if (!sign && digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (sign && digits.length >= 11 && digits.length <= 15) return `+${digits}`
  return null
}

export function findByPhone(rawPhone: string | undefined | null): Customer | null {
  const e164 = toE164(rawPhone)
  if (!e164) return null
  return CUSTOMERS.find(c => c.phone === e164) ?? null
}

export function findByMemberId(memberId: string): Customer | null {
  return CUSTOMERS.find(c => c.memberId === memberId) ?? null
}

// Returns the active claim for a customer (the one tied to today's call), or
// the most recent claim if no `activeClaimId` is set.
export function activeClaim(c: Customer): ClaimEntry | null {
  if (c.activeClaimId) {
    const hit = c.claims.find(cl => cl.id === c.activeClaimId)
    if (hit) return hit
  }
  return c.claims[0] ?? null
}

// Default fallback customer (Anderson) — used when the WS hasn't sent a phone
// yet, so the demo screen looks populated on first load.
export const DEFAULT_CUSTOMER = CUSTOMERS[0]
