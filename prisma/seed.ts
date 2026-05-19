import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const PRIYA_ID = 'rm-priya-sharma-001'
const DEMO_DATE = new Date('2026-05-08T00:00:00.000Z') // Friday — the demo day

function d(offsetDays: number, hour = 0, min = 0) {
  const dt = new Date(DEMO_DATE)
  dt.setDate(dt.getDate() + offsetDays)
  dt.setHours(hour, min, 0, 0)
  return dt
}

async function main() {
  await prisma.$transaction([
    prisma.agentRunLog.deleteMany(),
    prisma.cBSAlert.deleteMany(),
    prisma.nBASignalEvent.deleteMany(),
    prisma.customerNote.deleteMany(),
    prisma.callLog.deleteMany(),
    prisma.meetingInvite.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.email.deleteMany(),
    prisma.emailThread.deleteMany(),
    prisma.customerMilestone.deleteMany(),
    prisma.productHolding.deleteMany(),
    prisma.prepPack.deleteMany(),
    prisma.priority.deleteMany(),
    prisma.autoAction.deleteMany(),
    prisma.overnightStats.deleteMany(),
    prisma.debriefEvent.deleteMany(),
    prisma.dailyDebrief.deleteMany(),
    prisma.leaderboard.deleteMany(),
    prisma.managerAlignment.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.rM.deleteMany(),
  ])

  // ── RM: Priya Sharma ─────────────────────────────────────────────────────
  const priya = await prisma.rM.create({
    data: {
      id: PRIYA_ID,
      name: 'Priya Sharma',
      email: 'priya.sharma@idfcfirst.com',
      cluster: 'Mumbai N',
      segment: 'Retail + Business',
      portfolioSize: 47,
      streakDays: 7,
      rank: 3,
      weeklyPoints: 2418,
      joinedAt: new Date('2019-03-15'),
    },
  })

  // ── CUSTOMERS ─────────────────────────────────────────────────────────────

  const mehta = await prisma.customer.create({
    data: {
      name: 'Mehta Group',
      contactName: 'Rajesh Mehta',
      company: 'Mehta Industries Pvt. Ltd.',
      segment: 'Business',
      subSegment: 'Mid-Corporate',
      aum: 32000000,
      annualRevenue: 280000000,
      signalType: 'SANCTION_CALL',
      nbaProduct: 'TERM_LOAN',
      riskFlag: true,
      riskReason: 'Sentiment cooling — competitor offering 25bps lower',
      city: 'Mumbai',
      sector: 'Manufacturing',
      relationshipSince: new Date('2021-06-12'),
      phoneNumber: '+91-98201-44321',
      emailAddress: 'rajesh.mehta@mehtaindustries.com',
      cifId: 'CIF-MH-004412',
      creditScore: 768,
      loyaltyTier: 'PLATINUM',
      lastInteraction: d(-1, 16, 30),
    },
  })

  const iyer = await prisma.customer.create({
    data: {
      name: 'Iyer Family',
      contactName: 'Srinivas Iyer',
      segment: 'Wealth',
      subSegment: 'Priority',
      aum: 8500000,
      signalType: 'RD_MATURITY',
      nbaProduct: 'WEALTH_MANAGEMENT',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'Professional Services',
      relationshipSince: new Date('2022-08-20'),
      phoneNumber: '+91-98201-77821',
      emailAddress: 'srinivas.iyer@gmail.com',
      cifId: 'CIF-WM-007731',
      creditScore: 812,
      loyaltyTier: 'GOLD',
      lastInteraction: d(-2, 14, 0),
    },
  })

  const kapoor = await prisma.customer.create({
    data: {
      name: 'Kapoor Group',
      contactName: 'Vikram Kapoor',
      company: 'Kapoor Textiles Ltd.',
      segment: 'Priority',
      subSegment: 'Business Premium',
      aum: 5600000,
      annualRevenue: 120000000,
      signalType: 'KYC_EXPIRY',
      riskFlag: true,
      riskReason: 'KYC expires in 7 days — SLA breach risk in 48 hrs',
      city: 'Mumbai',
      sector: 'Textiles',
      relationshipSince: new Date('2020-11-03'),
      phoneNumber: '+91-98201-33421',
      emailAddress: 'vikram@kapoortextiles.com',
      cifId: 'CIF-PR-002218',
      creditScore: 734,
      loyaltyTier: 'SILVER',
      lastInteraction: d(-4, 11, 0),
    },
  })

  const sharma = await prisma.customer.create({
    data: {
      name: 'Sharma Industries',
      contactName: 'Anil Sharma',
      company: 'Sharma IT Solutions Pvt. Ltd.',
      segment: 'Business',
      subSegment: 'SME',
      aum: 12000000,
      annualRevenue: 85000000,
      signalType: 'PIPELINE_COMMIT',
      nbaProduct: 'WORKING_CAPITAL',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'IT Services',
      relationshipSince: new Date('2023-01-18'),
      phoneNumber: '+91-98201-55621',
      emailAddress: 'anil@sharmait.in',
      cifId: 'CIF-BK-009901',
      creditScore: 791,
      loyaltyTier: 'GOLD',
      lastInteraction: d(0, 10, 0),
    },
  })

  const patel = await prisma.customer.create({
    data: {
      name: 'Patel Industries',
      contactName: 'Kiran Patel',
      company: 'Patel Construction Pvt. Ltd.',
      segment: 'Business',
      subSegment: 'SME',
      aum: 8000000,
      annualRevenue: 150000000,
      signalType: 'RENEWAL_DOCS',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'Construction',
      relationshipSince: new Date('2021-09-05'),
      phoneNumber: '+91-98201-11231',
      emailAddress: 'kiran.patel@patelconstruction.co.in',
      cifId: 'CIF-BK-006634',
      creditScore: 756,
      loyaltyTier: 'SILVER',
      lastInteraction: d(-1, 9, 0),
    },
  })

  const joshi = await prisma.customer.create({
    data: {
      name: 'Joshi & Co',
      contactName: 'Pradeep Joshi',
      company: 'Joshi Trading Co.',
      segment: 'Priority',
      subSegment: 'Business Premium',
      aum: 6200000,
      annualRevenue: 95000000,
      signalType: 'COMPETITOR_OFFER',
      riskFlag: true,
      riskReason: 'Axis Bank made contact — pricing sensitivity high',
      city: 'Mumbai',
      sector: 'Trading',
      relationshipSince: new Date('2020-04-22'),
      phoneNumber: '+91-98201-22341',
      emailAddress: 'pradeep.joshi@joshitrading.in',
      cifId: 'CIF-PR-003345',
      creditScore: 748,
      loyaltyTier: 'SILVER',
      lastInteraction: d(-3, 15, 30),
    },
  })

  const singh = await prisma.customer.create({
    data: {
      name: 'Singh Trading',
      contactName: 'Harpreet Singh',
      company: 'Singh Import Export Pvt. Ltd.',
      segment: 'Business',
      subSegment: 'SME',
      aum: 3200000,
      annualRevenue: 65000000,
      signalType: 'KYC_EXPIRY',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'Import/Export',
      relationshipSince: new Date('2022-03-14'),
      phoneNumber: '+91-98201-88431',
      emailAddress: 'harpreet@singhimpex.com',
      cifId: 'CIF-BK-008821',
      creditScore: 722,
      loyaltyTier: 'BRONZE',
      lastInteraction: d(-5, 14, 0),
    },
  })

  const mehra = await prisma.customer.create({
    data: {
      name: 'Mehra Logistics',
      contactName: 'Deepak Mehra',
      company: 'Mehra Freight Solutions',
      segment: 'Business',
      subSegment: 'SME',
      aum: 2800000,
      annualRevenue: 48000000,
      signalType: 'KYC_EXPIRY',
      riskFlag: false,
      city: 'Thane',
      sector: 'Logistics',
      relationshipSince: new Date('2023-06-01'),
      phoneNumber: '+91-98201-99121',
      emailAddress: 'deepak@mehrafreight.in',
      cifId: 'CIF-BK-011203',
      creditScore: 709,
      loyaltyTier: 'BRONZE',
      lastInteraction: d(-6, 16, 0),
    },
  })

  const verma = await prisma.customer.create({
    data: {
      name: 'Verma Capital',
      contactName: 'Anita Verma',
      company: 'Verma Capital Advisors',
      segment: 'Wealth',
      subSegment: 'HNI',
      aum: 24000000,
      signalType: 'PORTFOLIO_REVIEW',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'Finance',
      relationshipSince: new Date('2020-01-10'),
      phoneNumber: '+91-98201-44561',
      emailAddress: 'anita.verma@vermacapital.in',
      cifId: 'CIF-WM-001102',
      creditScore: 845,
      loyaltyTier: 'PLATINUM',
      lastInteraction: d(-7, 10, 30),
    },
  })

  const desai = await prisma.customer.create({
    data: {
      name: 'Desai Family',
      contactName: 'Ramesh Desai',
      segment: 'Retail',
      subSegment: 'Salaried Premium',
      aum: 1800000,
      signalType: 'SALARY_HIKE',
      nbaProduct: 'PREMIUM_WEALTH',
      riskFlag: false,
      city: 'Mumbai',
      sector: 'Technology',
      relationshipSince: new Date('2024-02-28'),
      phoneNumber: '+91-98201-66781',
      emailAddress: 'ramesh.desai@techcorp.com',
      cifId: 'CIF-RT-015567',
      creditScore: 801,
      loyaltyTier: 'SILVER',
      lastInteraction: d(-2, 17, 0),
    },
  })

  // ── PRODUCT HOLDINGS ──────────────────────────────────────────────────────

  await prisma.productHolding.createMany({
    data: [
      // Mehta Group
      { customerId: mehta.id, productCode: 'TERM_LOAN', productName: 'Term Loan — Machinery', value: 25000000, startDate: d(-730), interestRate: 10.5, status: 'ACTIVE', accountRef: 'TL-2024-MH-004' },
      { customerId: mehta.id, productCode: 'OD', productName: 'Overdraft Facility', value: 5000000, startDate: d(-365), interestRate: 11.0, status: 'ACTIVE', accountRef: 'OD-2025-MH-001' },
      { customerId: mehta.id, productCode: 'CASA', productName: 'Current Account', value: 4200000, startDate: d(-1460), status: 'ACTIVE', accountRef: 'CA-IDFC-MH-009' },
      // Iyer Family
      { customerId: iyer.id, productCode: 'RD', productName: 'Recurring Deposit', value: 3600000, startDate: d(-365), maturityDate: d(14), interestRate: 7.25, status: 'ACTIVE', accountRef: 'RD-2025-IY-002' },
      { customerId: iyer.id, productCode: 'MF', productName: 'Mutual Fund Portfolio', value: 4900000, startDate: d(-730), status: 'ACTIVE', accountRef: 'MF-IDFC-IY-003' },
      // Kapoor Group
      { customerId: kapoor.id, productCode: 'CC', productName: 'Business Credit Card', value: 500000, startDate: d(-900), status: 'ACTIVE', accountRef: 'CC-IDFC-KP-007' },
      { customerId: kapoor.id, productCode: 'CASA', productName: 'Current Account', value: 2100000, startDate: d(-1800), status: 'ACTIVE', accountRef: 'CA-IDFC-KP-001' },
      // Sharma Industries
      { customerId: sharma.id, productCode: 'WC', productName: 'Working Capital Line', value: 12000000, startDate: d(-180), interestRate: 10.75, status: 'PENDING', accountRef: 'WC-2026-SH-001' },
      // Patel Industries
      { customerId: patel.id, productCode: 'TERM_LOAN', productName: 'Term Loan — Equipment', value: 8000000, startDate: d(-545), maturityDate: d(180), interestRate: 10.25, status: 'ACTIVE', accountRef: 'TL-2024-PT-003' },
      // Desai Family
      { customerId: desai.id, productCode: 'SB', productName: 'Savings Account', value: 420000, startDate: d(-450), status: 'ACTIVE', accountRef: 'SB-IDFC-DS-021' },
      { customerId: desai.id, productCode: 'SIP', productName: 'SIP — Balanced Fund', value: 1380000, startDate: d(-365), interestRate: 11.2, status: 'ACTIVE', accountRef: 'SIP-IDFC-DS-005' },
      // Verma Capital
      { customerId: verma.id, productCode: 'PMS', productName: 'Portfolio Management Service', value: 24000000, startDate: d(-1095), status: 'ACTIVE', accountRef: 'PMS-IDFC-VC-001' },
    ],
  })

  // ── OVERNIGHT STATS (demo day) ───────────────────────────────────────────
  await prisma.overnightStats.create({
    data: {
      rmId: priya.id,
      date: DEMO_DATE,
      tier1RepliesSent: 12,
      salesforceUpdated: 5,
      kycRemindersSent: 2,
      timeSavedMinutes: 108,
      actionsComplete: 12,
      actionsAwaitingReview: 2,
    },
  })

  // ── PRIORITIES (demo day) ─────────────────────────────────────────────────
  const p1 = await prisma.priority.create({
    data: {
      rmId: priya.id, customerId: mehta.id, rank: 1, timeSlot: '09:30',
      date: DEMO_DATE,
      title: 'Mehta Group · ₹3.2 Cr sanction call',
      description: 'Sentiment cooling 12%. Lead with locked rate, then prepayment waiver (asked Aug 14).',
      whyNow: 'WHY NOW', urgencyBadge: 'HIGHEST_RISK', status: 'PREP_READY',
      dealValue: 32000000, priorityScore: 94.2, managerAligned: true,
    },
  })
  await prisma.prepPack.create({ data: { priorityId: p1.id, label: 'Prep pack ready', detail: 'Customer 360, competitor rate analysis, prepayment waiver script.', badge: 'AUTO_PREPARED', completed: true } })

  const p2 = await prisma.priority.create({
    data: {
      rmId: priya.id, customerId: mehta.id, rank: 2, timeSlot: '11:00',
      date: DEMO_DATE,
      title: 'NPA Committee — your call (Score 92)',
      description: 'Avatars dispatched to Standup & Credit. Unified debrief at 11:45.',
      whyNow: 'WHY NOW', urgencyBadge: 'DECISION_GRADE', status: 'ALIGNED',
      managerAligned: true, priorityScore: 92.0,
    },
  })
  await prisma.prepPack.create({ data: { priorityId: p2.id, label: 'Avatars dispatched', detail: 'Standup (48), Credit (87) — debrief at 11:45.', badge: 'EMPLOYEE_AI', completed: true } })

  const p3 = await prisma.priority.create({
    data: {
      rmId: priya.id, customerId: sharma.id, rank: 3, timeSlot: '15:00',
      date: DEMO_DATE,
      title: 'Q4 Prep · review & sign-off',
      description: 'Document Intelligence drafted; 2 sections await your judgement.',
      whyNow: 'WHY NOW', urgencyBadge: 'TIME_SAVED', status: 'DRAFTED',
      managerAligned: true,
    },
  })
  await prisma.prepPack.create({ data: { priorityId: p3.id, label: 'Sources verified', detail: 'SF + Core Banking + Compliance.', badge: 'DOC_INTEL', completed: true } })

  const p4 = await prisma.priority.create({
    data: {
      rmId: priya.id, customerId: iyer.id, rank: 4, timeSlot: '16:00',
      date: DEMO_DATE,
      title: 'Iyer family · wealth cross-sell',
      description: 'NBA flagged a high-signal moment. Pitch ready in Workspace.',
      whyNow: 'WHY NOW', urgencyBadge: 'NBA', status: 'SURFACED',
      managerAligned: true,
    },
  })
  await prisma.prepPack.create({ data: { priorityId: p4.id, label: 'Pitch script ready', detail: 'Tone-tuned for family preference. Private equity fund framing.', badge: 'DOC_INTEL', completed: true } })

  // ── AUTO ACTIONS (demo day overnight) ────────────────────────────────────
  await prisma.autoAction.createMany({
    data: [
      { rmId: priya.id, customerId: patel.id, column: 'COMMUNICATIONS', timestamp: '04:12', title: 'Auto-replied to Patel Industries.', detail: "Confirmed receipt of facility renewal docs. Cc'd Risk team.", status: 'SENT', category: 'EMAIL', agentSource: 'EMAIL_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: joshi.id, column: 'COMMUNICATIONS', timestamp: '05:48', title: 'Drafted reply to Joshi & Co.', detail: 'Awaiting your nuance — pricing question. Held for 09:15.', status: 'REVIEW', category: 'EMAIL', agentSource: 'EMAIL_AGENT', actionable: true, date: DEMO_DATE },
      { rmId: priya.id, customerId: singh.id, column: 'COMMUNICATIONS', timestamp: '06:02', title: 'KYC reminder · Singh Trading.', detail: "Form pre-filled with last year's data. Expires in 7 days.", status: 'SENT', category: 'KYC', agentSource: 'KYC_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: mehra.id, column: 'COMMUNICATIONS', timestamp: '06:14', title: 'KYC reminder · Mehra Logistics.', detail: 'Expires in 11 days. Tier-1 template, low risk.', status: 'SENT', category: 'KYC', agentSource: 'KYC_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: verma.id, column: 'COMMUNICATIONS', timestamp: '06:30', title: 'WhatsApp · Verma Capital.', detail: 'Out-of-office acknowledgement, follow-up scheduled 10:00.', status: 'SENT', category: 'WHATSAPP', agentSource: 'EMAIL_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, column: 'SYSTEM_UPDATES', timestamp: '04:48', title: 'Salesforce notes synced.', detail: "Yesterday's Mehta call notes formatted, tagged & saved.", status: 'DONE', category: 'CRM', agentSource: 'MIS_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: sharma.id, column: 'SYSTEM_UPDATES', timestamp: '05:14', title: 'Pipeline updated · Sharma Industries.', detail: 'Stage moved to "verbal commit". Confidence 82%.', status: 'DONE', category: 'PIPELINE', agentSource: 'NBA_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: kapoor.id, column: 'SYSTEM_UPDATES', timestamp: '06:02', title: 'SLA risk · Kapoor Group KYC.', detail: '48-hr breach predicted. Suggesting reassignment to Amit.', status: 'REVIEW', category: 'COMPLIANCE', agentSource: 'KYC_AGENT', actionable: true, date: DEMO_DATE },
      { rmId: priya.id, customerId: iyer.id, column: 'SYSTEM_UPDATES', timestamp: '06:24', title: 'Cross-sell signal · Iyer family.', detail: 'Recurring deposit maturing — wealth product fit. NBA prepped.', status: 'FLAGGED', category: 'CRM', agentSource: 'NBA_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, column: 'SYSTEM_UPDATES', timestamp: '06:48', title: 'T&E ready · Pune trip.', detail: 'OCR extracted 12 receipts. Submission pre-filled.', status: 'READY', category: 'CRM', agentSource: 'MIS_AGENT', actionable: false, date: DEMO_DATE },
      { rmId: priya.id, customerId: desai.id, column: 'SYSTEM_UPDATES', timestamp: '05:32', title: 'Salary hike signal · Desai family.', detail: '₹45L → ₹72L detected via salary credit. NBA: Premium wealth pitch queued.', status: 'FLAGGED', category: 'CRM', agentSource: 'NBA_AGENT', actionable: true, date: DEMO_DATE },
      { rmId: priya.id, customerId: mehta.id, column: 'COMMUNICATIONS', timestamp: '03:58', title: 'Mehta Group prep pack assembled.', detail: 'Customer 360, competitor rate sheet, prepayment waiver clause extracted.', status: 'DONE', category: 'CRM', agentSource: 'MIS_AGENT', actionable: false, date: DEMO_DATE },
    ],
  })

  // ── DAILY DEBRIEF (demo day) ──────────────────────────────────────────────
  const debrief = await prisma.dailyDebrief.create({
    data: {
      rmId: priya.id, date: d(0, 17),
      customerTimeMin: 342, autoActionsCount: 142, slaBreachers: 0,
      totalCalls: 6, dealsProgressed: 3, revenueInfluenced: 44000000,
      headline: 'You did the job you were hired to do.',
      tomorrowPreview: '3 customer calls before lunch · Patel renewal docs land overnight · Diwali greetings ready for your review at 09:15.',
    },
  })
  await prisma.debriefEvent.createMany({
    data: [
      { debriefId: debrief.id, timeSlot: '09:30', title: 'Mehta call · sentiment swung warm', detail: '+18 points; sanction sign-off cleared at 15:48.', outcome: 'WIN' },
      { debriefId: debrief.id, timeSlot: '10:00', title: 'Sharma Industries · ₹12 Cr closed', detail: 'Chairman video congratulation delivered in 27 min.', outcome: 'WIN' },
      { debriefId: debrief.id, timeSlot: '11:00', title: '3 meetings, 1 you', detail: 'Avatars debriefed. Zero context lost.', outcome: 'MULTIPLIED' },
      { debriefId: debrief.id, timeSlot: '12:30', title: 'Kapoor KYC · breach prevented', detail: 'Reassigned to Amit 48 hrs ahead of risk window.', outcome: 'SAVED' },
      { debriefId: debrief.id, timeSlot: '16:00', title: 'Iyer family · wealth pitch landed', detail: 'Cross-sell signal converted, follow-up next Wed.', outcome: 'SURFACED' },
      { debriefId: debrief.id, timeSlot: '17:00', title: 'Desai salary hike actioned', detail: 'Pitch call booked for Monday. Premium wealth package prepped.', outcome: 'SURFACED' },
    ],
  })

  // ── HISTORICAL DEBRIEFS (4 prior days) ───────────────────────────────────
  const debriefData = [
    {
      date: d(-4, 17), customerTimeMin: 298, autoActionsCount: 118, slaBreachers: 1,
      totalCalls: 5, dealsProgressed: 2, revenueInfluenced: 8500000,
      headline: 'Solid day. One SLA slip — owned it.',
      tomorrowPreview: 'Mehta rate call early · Iyer RD advisory · Kapoor KYC second attempt.',
      events: [
        { timeSlot: '09:00', title: 'Verma Capital quarterly review', detail: 'PMS performance at 18.2% YTD. Client satisfied.', outcome: 'WIN' },
        { timeSlot: '11:30', title: 'Kapoor KYC — no answer', detail: 'Third attempt. Email + WhatsApp triggered.', outcome: 'SAVED' },
        { timeSlot: '14:00', title: 'Joshi FX query resolved', detail: 'Rate offered within band. Auto-reply approved.', outcome: 'WIN' },
        { timeSlot: '16:30', title: 'SLA slip — Mehra Logistics', detail: 'Doc request delayed 2 hrs. Apology sent.', outcome: 'SAVED' },
      ],
    },
    {
      date: d(-3, 17), customerTimeMin: 321, autoActionsCount: 127, slaBreachers: 0,
      totalCalls: 6, dealsProgressed: 2, revenueInfluenced: 14000000,
      headline: 'Six calls, zero breaches. The AI ran clean overnight.',
      tomorrowPreview: 'Sharma Industries follow-up · Patel docs expected · Desai salary signal being evaluated.',
      events: [
        { timeSlot: '09:30', title: 'Mehta rate negotiation call', detail: 'Rajesh flagged Kotak offering 10.0%. Priya offered lock-in at 10.25% with waiver option.', outcome: 'WIN' },
        { timeSlot: '11:00', title: 'Singh Trading KYC docs received', detail: 'Form pre-filled by AI. Submitted within 30 min.', outcome: 'WIN' },
        { timeSlot: '14:00', title: 'Iyer RD pre-advisory call', detail: 'Srinivas open to private equity fund. Pitch prep requested.', outcome: 'SURFACED' },
        { timeSlot: '15:30', title: 'Sharma verbal commit — ₹12Cr WC', detail: 'Anil confirmed verbal commitment. Pipeline at 82%.', outcome: 'WIN' },
      ],
    },
    {
      date: d(-2, 17), customerTimeMin: 356, autoActionsCount: 134, slaBreachers: 0,
      totalCalls: 7, dealsProgressed: 3, revenueInfluenced: 28000000,
      headline: 'The week\'s best day. All three big calls converted.',
      tomorrowPreview: 'NPA committee tomorrow — avatars dispatched · Mehta final sanction call.',
      events: [
        { timeSlot: '10:00', title: 'Sharma Industries · docs signed', detail: 'Working capital facility agreement executed.', outcome: 'WIN' },
        { timeSlot: '11:00', title: 'NPA pre-meeting prep', detail: 'Avatars briefed for committee tomorrow.', outcome: 'MULTIPLIED' },
        { timeSlot: '14:30', title: 'Desai salary hike confirmed', detail: 'CBS alert: ₹72L salary credit. NBA triggered automatically.', outcome: 'SURFACED' },
        { timeSlot: '16:00', title: 'Patel docs received', detail: 'Facility renewal docs received overnight. AI auto-replied.', outcome: 'SAVED' },
      ],
    },
    {
      date: d(-1, 17), customerTimeMin: 280, autoActionsCount: 109, slaBreachers: 0,
      totalCalls: 4, dealsProgressed: 1, revenueInfluenced: 5000000,
      headline: 'Light day — NPA committee took 3 hrs. Avatars handled the rest.',
      tomorrowPreview: 'Mehta sanction call 09:30 · Sharma close 10:00 · Kapoor KYC escalation.',
      events: [
        { timeSlot: '10:00', title: 'NPA committee (avatar attended)', detail: 'Standup + Credit — debrief completed at 11:45.', outcome: 'MULTIPLIED' },
        { timeSlot: '13:00', title: 'Joshi pricing query — held', detail: 'Competitor pressure. Draft held for morning review.', outcome: 'SAVED' },
        { timeSlot: '15:30', title: 'Kapoor KYC escalated', detail: 'SLA breach in 48 hrs. Reassignment to Amit recommended.', outcome: 'SAVED' },
      ],
    },
  ]

  for (const dd of debriefData) {
    const { events, ...debriefFields } = dd
    const deb = await prisma.dailyDebrief.create({ data: { rmId: priya.id, ...debriefFields } })
    await prisma.debriefEvent.createMany({ data: events.map(e => ({ debriefId: deb.id, ...e })) })
  }

  // ── LEADERBOARD ───────────────────────────────────────────────────────────
  const lbEntries = [
    { rmName: 'Anjali Desai', rank: 1, points: 2840, streakDays: 12, delta: 0, isCurrentUser: false },
    { rmName: 'Ravi Kumar', rank: 2, points: 2612, streakDays: 9, delta: 1, isCurrentUser: false },
    { rmName: 'Priya Sharma', rank: 3, points: 2418, streakDays: 7, delta: -1, isCurrentUser: true },
    { rmName: 'Suresh Menon', rank: 4, points: 2308, streakDays: 5, delta: 0, isCurrentUser: false },
    { rmName: 'Neha Gupta', rank: 5, points: 2140, streakDays: 3, delta: 2, isCurrentUser: false },
    { rmName: 'Amit Jain', rank: 6, points: 2012, streakDays: 1, delta: -2, isCurrentUser: false },
  ]
  await prisma.leaderboard.createMany({
    data: lbEntries.map(e => ({
      rmId: priya.id, period: 'THIS_WEEK', cluster: 'Mumbai N',
      weekOf: DEMO_DATE, ...e,
    })),
  })

  // Monthly leaderboard (Priya at #2 — better month)
  const lbMonthly = [
    { rmName: 'Anjali Desai', rank: 1, points: 11240, streakDays: 18, delta: 0, isCurrentUser: false },
    { rmName: 'Priya Sharma', rank: 2, points: 10870, streakDays: 7, delta: 1, isCurrentUser: true },
    { rmName: 'Ravi Kumar', rank: 3, points: 9980, streakDays: 12, delta: -1, isCurrentUser: false },
    { rmName: 'Suresh Menon', rank: 4, points: 9340, streakDays: 8, delta: 2, isCurrentUser: false },
    { rmName: 'Neha Gupta', rank: 5, points: 8820, streakDays: 5, delta: -1, isCurrentUser: false },
    { rmName: 'Amit Jain', rank: 6, points: 8100, streakDays: 3, delta: 0, isCurrentUser: false },
  ]
  await prisma.leaderboard.createMany({
    data: lbMonthly.map(e => ({
      rmId: priya.id, period: 'THIS_MONTH', cluster: 'Mumbai N',
      weekOf: DEMO_DATE, ...e,
    })),
  })

  // ── MANAGER ALIGNMENT ─────────────────────────────────────────────────────
  await prisma.managerAlignment.create({
    data: {
      rmId: priya.id, date: DEMO_DATE,
      alignedCount: 4, totalCount: 4,
      managerName: 'Vikram Joshi',
      managerEmail: 'vikram.joshi@idfcfirst.com',
      message: 'Mehta first, NPA second, Q4 prep critical for tomorrow.',
    },
  })

  // ── EMAIL THREADS & EMAILS ────────────────────────────────────────────────

  // Thread 1: Mehta Group — Sanction Rate Negotiation (3-email chain over 5 days)
  const thread1 = await prisma.emailThread.create({
    data: {
      subject: 'Re: Term Loan Sanction — Rate Discussion & Timeline',
      customerId: mehta.id, rmId: priya.id,
      initiatedBy: 'CUSTOMER', startedAt: d(-4, 9, 22),
      lastActivity: d(-1, 16, 44), status: 'PENDING_RM',
      priority: 'HIGH', aiClassification: 'LOAN_QUERY',
      sentimentScore: -12, competitorFlag: true,
    },
  })
  await prisma.email.createMany({
    data: [
      {
        threadId: thread1.id, fromAddress: 'rajesh.mehta@mehtaindustries.com', fromName: 'Rajesh Mehta',
        toAddress: 'priya.sharma@idfcfirst.com', toName: 'Priya Sharma',
        subject: 'Term Loan Sanction — Rate Discussion', bodyText: `Dear Priya,

Thank you for our call last week. I have been reviewing the sanction terms and I must say I am a bit concerned about the interest rate of 10.5%.

I have received a preliminary offer from Kotak Mahindra Bank at 10.0% for the same facility amount. While I value our long relationship with IDFC FIRST, I need to ensure I am getting competitive terms for my business.

Could you please let me know if there is any flexibility on the rate? Also, we discussed a prepayment waiver for the first 24 months — I would need that in writing before we proceed.

Regards,
Rajesh Mehta
Managing Director, Mehta Industries Pvt. Ltd.`,
        sentAt: d(-4, 9, 22), direction: 'INBOUND', generatedBy: 'CUSTOMER',
        classification: 'LOAN_QUERY', sentiment: 'NEGATIVE',
        entities: { competitor: 'Kotak Mahindra', rate_competitor: '10.0%', rate_offered: '10.5%', ask: 'prepayment_waiver' },
      },
      {
        threadId: thread1.id, fromAddress: 'priya.sharma@idfcfirst.com', fromName: 'Priya Sharma',
        toAddress: 'rajesh.mehta@mehtaindustries.com', toName: 'Rajesh Mehta',
        subject: 'Re: Term Loan Sanction — Rate Discussion', bodyText: `Dear Rajesh,

Thank you for your transparency — I really appreciate you bringing this to me directly rather than simply moving forward with another bank.

I have escalated your request to our Credit team and I am glad to inform you that we can offer you a locked rate of 10.25% for the full tenure of the loan, subject to sanction. This reflects a 25bps reduction from the original offer, and I believe it positions us competitively.

On the prepayment waiver — I am able to confirm a waiver on prepayment charges for the first 24 months of the facility. I will get this included in the sanction letter.

I would like to schedule a call tomorrow at 09:30 to walk you through the final sanction terms and get your verbal confirmation. Would that work?

Warm regards,
Priya Sharma
Relationship Manager, IDFC FIRST Bank`,
        sentAt: d(-3, 14, 17), direction: 'OUTBOUND', generatedBy: 'RM',
        classification: 'LOAN_RESPONSE', sentiment: 'POSITIVE',
        entities: { rate_offered: '10.25%', prepayment_waiver: '24 months', action: 'call_scheduled' },
      },
      {
        threadId: thread1.id, fromAddress: 'rajesh.mehta@mehtaindustries.com', fromName: 'Rajesh Mehta',
        toAddress: 'priya.sharma@idfcfirst.com', toName: 'Priya Sharma',
        subject: 'Re: Term Loan Sanction — URGENT: Timeline?', bodyText: `Dear Priya,

Thank you for the revised rate — that is better, and I appreciate the quick turnaround.

However, I need to be candid: Kotak has given me a deadline of May 10th (this Sunday) to confirm with them. If the sanction from IDFC FIRST is not finalised by Friday May 8th, I may have no choice but to proceed with them.

I understand these things take time but this facility is critical for our new machinery acquisition scheduled for June 1st. I really hope we can get this done.

Could you confirm the call for tomorrow 09:30 IST?

Best,
Rajesh`,
        sentAt: d(-1, 16, 44), direction: 'INBOUND', generatedBy: 'CUSTOMER',
        classification: 'URGENT_FOLLOWUP', sentiment: 'NEGATIVE',
        entities: { deadline: '2026-05-10', competing_deadline: 'Kotak May 10', urgency: 'HIGH' },
      },
    ],
  })

  // Thread 2: Patel Industries — Facility Renewal
  const thread2 = await prisma.emailThread.create({
    data: {
      subject: 'RE: Facility Renewal — Documents Submitted',
      customerId: patel.id, rmId: priya.id,
      initiatedBy: 'RM', startedAt: d(-5, 11, 0),
      lastActivity: d(0, 4, 12), status: 'RESOLVED',
      priority: 'MEDIUM', aiClassification: 'DOCUMENT_REQUEST',
      sentimentScore: 8, competitorFlag: false,
    },
  })
  await prisma.email.createMany({
    data: [
      {
        threadId: thread2.id, fromAddress: 'priya.sharma@idfcfirst.com', fromName: 'Priya Sharma',
        toAddress: 'kiran.patel@patelconstruction.co.in', toName: 'Kiran Patel',
        subject: 'Facility Renewal — Documents Required',
        bodyText: `Dear Kiran,

I hope you are well. Your existing Term Loan facility (TL-2024-PT-003, ₹8.0 Cr) is due for renewal in 180 days, and I would like to start the process early to ensure a smooth experience.

Could you please share the following documents at your earliest convenience:
1. Latest audited financials (FY2025–26)
2. GST returns — last 6 months
3. Bank statement — all accounts, last 6 months
4. KYC update (your CIF details need a refresh)

I will have our team prepare the renewal proposal in parallel.

Please feel free to call me if you have any questions.

Warm regards,
Priya`,
        sentAt: d(-5, 11, 0), direction: 'OUTBOUND', generatedBy: 'RM',
        classification: 'DOCUMENT_REQUEST', sentiment: 'NEUTRAL',
        entities: { facility: 'TL-2024-PT-003', amount: '8Cr', docs_requested: ['financials', 'GST', 'bank_statement', 'KYC'] },
      },
      {
        threadId: thread2.id, fromAddress: 'kiran.patel@patelconstruction.co.in', fromName: 'Kiran Patel',
        toAddress: 'priya.sharma@idfcfirst.com', toName: 'Priya Sharma',
        subject: 'RE: Facility Renewal — Documents Submitted',
        bodyText: `Dear Priya,

Thank you for the proactive outreach. I have attached all the required documents.

1. Audited financials FY2025-26 — attached
2. GST returns (Nov 2025 – Apr 2026) — attached
3. Bank statements (all 3 accounts) — attached
4. KYC — I will send the PAN and Aadhaar scan separately on a secure link

Our business has had a strong year — revenue up 28% to ₹150 Cr. I expect the renewal should be straightforward.

Let me know what the next steps are.

Best regards,
Kiran Patel`,
        sentAt: d(-1, 23, 12), direction: 'INBOUND', generatedBy: 'CUSTOMER',
        classification: 'DOCUMENT_SUBMISSION', sentiment: 'POSITIVE',
        entities: { docs_submitted: ['financials', 'GST', 'bank_statement'], revenue_growth: '28%' },
        attachments: [
          { name: 'Patel_Audited_FY2026.pdf', size: '2.4MB', type: 'PDF' },
          { name: 'GST_Returns_6Months.pdf', size: '1.1MB', type: 'PDF' },
          { name: 'Bank_Statements_Mar26.pdf', size: '3.2MB', type: 'PDF' },
        ],
      },
      {
        threadId: thread2.id, fromAddress: 'priya.sharma@idfcfirst.com', fromName: 'IDFC FIRST AI — Email Agent',
        toAddress: 'kiran.patel@patelconstruction.co.in', toName: 'Kiran Patel',
        subject: 'RE: Facility Renewal — Documents Received ✓',
        bodyText: `Dear Kiran,

Thank you for submitting the documents. I can confirm that we have received:
✓ Audited financials FY2025-26
✓ GST returns (6 months)
✓ Bank statements (all accounts)

The KYC documents are pending — please share at your earliest convenience.

Our team will review the submission and Priya will be in touch with the next steps by end of day May 8th.

Regards,
Priya Sharma
Relationship Manager, IDFC FIRST Bank

[This acknowledgement was generated by IDFC FIRST AI at 04:12 IST, May 8, 2026]`,
        sentAt: d(0, 4, 12), direction: 'OUTBOUND', generatedBy: 'AI_AGENT',
        aiConfidence: 0.97, approved: false,
        classification: 'ACKNOWLEDGEMENT', sentiment: 'POSITIVE',
        entities: { docs_confirmed: 3, docs_pending: ['KYC'] },
      },
    ],
  })

  // Thread 3: Joshi & Co — Pricing Query (held for RM review)
  const thread3 = await prisma.emailThread.create({
    data: {
      subject: 'Urgent: FX Rate Query — Competitor Quote Received',
      customerId: joshi.id, rmId: priya.id,
      initiatedBy: 'CUSTOMER', startedAt: d(0, 23, 47),
      lastActivity: d(0, 5, 48), status: 'PENDING_RM',
      priority: 'HIGH', aiClassification: 'PRICING_QUERY',
      sentimentScore: -8, competitorFlag: true,
    },
  })
  await prisma.email.createMany({
    data: [
      {
        threadId: thread3.id, fromAddress: 'pradeep.joshi@joshitrading.in', fromName: 'Pradeep Joshi',
        toAddress: 'priya.sharma@idfcfirst.com', toName: 'Priya Sharma',
        subject: 'Urgent: FX Rate Query — Competitor Quote',
        bodyText: `Hi Priya,

I know it's late but I wanted to flag this before morning.

I received a quote from Axis Bank for my USD 2M export remittance — they are offering ₹83.42/USD with zero transaction charges. Our current deal with IDFC FIRST is at ₹83.18/USD with the standard charges.

This is a significant difference for the volume we do. I would hate to move this business but I need to be commercially prudent.

Can you help? I need an answer before 10 AM tomorrow.

Pradeep`,
        sentAt: d(0, 23, 47), direction: 'INBOUND', generatedBy: 'CUSTOMER',
        classification: 'PRICING_QUERY', sentiment: 'NEGATIVE',
        entities: { amount: 'USD 2M', current_rate: '83.18', competitor_rate: '83.42', competitor: 'Axis Bank', deadline: '10:00 IST' },
      },
      {
        threadId: thread3.id, fromAddress: 'priya.sharma@idfcfirst.com', fromName: 'IDFC FIRST AI — Email Agent',
        toAddress: 'pradeep.joshi@joshitrading.in', toName: 'Pradeep Joshi',
        subject: 'Re: Urgent: FX Rate Query — I\'m on this',
        bodyText: `Dear Pradeep,

Thank you for reaching out. I have noted your query and I will personally review this first thing in the morning.

I understand the commercial sensitivity — please hold on moving any business until I have spoken to you. I am confident we can work something out that works for both of us.

I will call you at 09:15 IST sharp.

Regards,
Priya Sharma

[DRAFT PREPARED BY IDFC FIRST AI at 05:48 IST — Awaiting Priya's review and approval before sending. The rate adjustment requires RM judgement.]`,
        sentAt: d(0, 5, 48), direction: 'OUTBOUND', generatedBy: 'AI_AGENT',
        aiConfidence: 0.81, approved: false,
        classification: 'PRICING_RESPONSE_DRAFT', sentiment: 'POSITIVE',
        entities: { action: 'call_at_9:15', note: 'RM_judgement_required_for_rate' },
      },
    ],
  })

  // Thread 4: Internal — KYC Alerts (system-to-RM)
  const thread4 = await prisma.emailThread.create({
    data: {
      subject: 'ACTION REQUIRED: KYC Expiry Alerts — 3 Customers',
      customerId: null, rmId: priya.id,
      initiatedBy: 'AI_AGENT', startedAt: d(-7, 6, 0),
      lastActivity: d(0, 6, 14), status: 'OPEN',
      priority: 'HIGH', aiClassification: 'KYC_COMPLIANCE',
      sentimentScore: 0, competitorFlag: false,
    },
  })
  await prisma.email.createMany({
    data: [
      {
        threadId: thread4.id, fromAddress: 'kyc.agent@idfcfirst.com', fromName: 'IDFC FIRST KYC Agent',
        toAddress: 'priya.sharma@idfcfirst.com', toName: 'Priya Sharma',
        subject: 'ACTION REQUIRED: Kapoor Group KYC Expires in 7 Days',
        bodyText: `Dear Priya,

This is an automated alert from the KYC Monitoring Agent.

CUSTOMER: Kapoor Group (Vikram Kapoor) | CIF: CIF-PR-002218
KYC EXPIRY DATE: May 15, 2026 (7 days remaining)
SLA BREACH PREDICTED: May 10, 2026 (48 hours)
RISK LEVEL: HIGH

Action Required: Customer has not responded to 2 previous outreach attempts (May 4 and May 6). If KYC is not renewed by May 10, transactions will be blocked and an SLA breach will be recorded.

Recommendation: Escalate to colleague Amit Jain for reassignment if no response today. Form pre-filled from 2024 KYC data — available in Workspace.

IDFC FIRST KYC Agent`,
        sentAt: d(-1, 6, 5), direction: 'INBOUND', generatedBy: 'AI_AGENT',
        classification: 'KYC_ALERT', sentiment: 'NEUTRAL',
        entities: { customer: 'Kapoor Group', expiry_days: 7, sla_breach_days: 2, action: 'escalate_to_amit' },
      },
    ],
  })

  // ── CALL LOGS (5 days of history) ─────────────────────────────────────────

  await prisma.callLog.createMany({
    data: [
      // Day -4 (Monday)
      {
        rmId: priya.id, customerId: verma.id,
        scheduledAt: d(-4, 9, 0), startedAt: d(-4, 9, 3), endedAt: d(-4, 9, 48),
        durationMin: 45, direction: 'OUTBOUND', channel: 'VIDEO',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 2,
        keyTopics: ['PMS performance', 'equity allocation', 'international diversification'],
        transcriptSummary: 'Quarterly review. PMS at 18.2% YTD. Anita interested in increasing equity allocation by 10%. Next review in August.',
        actionItems: [{ task: 'Send revised allocation proposal', due: 'May 12' }],
        outcomeLabel: 'WIN', dealValue: null,
      },
      {
        rmId: priya.id, customerId: kapoor.id,
        scheduledAt: d(-4, 11, 30), startedAt: null, endedAt: null,
        durationMin: null, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'NO_ANSWER', sentimentPre: 'NEUTRAL', sentimentPost: null, sentimentDelta: 0,
        keyTopics: ['KYC renewal'],
        transcriptSummary: 'No answer. Voicemail left. Third attempt.',
        actionItems: [{ task: 'Send WhatsApp reminder', due: 'immediately' }],
        outcomeLabel: 'FOLLOW_UP',
      },
      // Day -3 (Tuesday)
      {
        rmId: priya.id, customerId: mehta.id,
        scheduledAt: d(-3, 9, 30), startedAt: d(-3, 9, 32), endedAt: d(-3, 10, 12),
        durationMin: 40, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'COLD', sentimentPost: 'NEUTRAL', sentimentDelta: 14,
        keyTopics: ['rate negotiation', 'competitor Kotak', 'prepayment waiver', 'sanction timeline'],
        transcriptSummary: 'Rajesh confirmed Kotak offer at 10.0%. Priya offered 10.25% locked + prepayment waiver for 24M. Rajesh asked for 48 hrs to think. Priya to escalate to Credit.',
        actionItems: [
          { task: 'Get Credit sign-off on 10.25% rate lock', due: 'May 6 EOD' },
          { task: 'Prepare prepayment waiver letter', due: 'May 7' },
        ],
        outcomeLabel: 'IN_PROGRESS', dealValue: 32000000,
      },
      {
        rmId: priya.id, customerId: singh.id,
        scheduledAt: d(-3, 14, 0), startedAt: d(-3, 14, 5), endedAt: d(-3, 14, 22),
        durationMin: 17, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'NEUTRAL', sentimentPost: 'WARM', sentimentDelta: 8,
        keyTopics: ['KYC renewal', 'document collection'],
        transcriptSummary: 'Harpreet agreed to complete KYC within 2 days. Pre-filled form sent via email. Confirmed docs to follow.',
        actionItems: [{ task: 'Follow up on KYC docs if not received by May 6', due: 'May 6' }],
        outcomeLabel: 'WIN',
      },
      {
        rmId: priya.id, customerId: iyer.id,
        scheduledAt: d(-3, 15, 30), startedAt: d(-3, 15, 35), endedAt: d(-3, 16, 5),
        durationMin: 30, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 5,
        keyTopics: ['RD maturity', 'reinvestment options', 'private equity fund', 'wealth planning'],
        transcriptSummary: 'Srinivas confirmed RD matures May 22. Open to Private Equity Fund (₹36L ticket). Asked for detailed pitch document. Priya to prep for May 8 meeting.',
        actionItems: [{ task: 'Prepare PE fund pitch with Iyer family risk profile', due: 'May 8' }],
        nbaTriggered: true, outcomeLabel: 'IN_PROGRESS',
      },
      // Day -2 (Wednesday)
      {
        rmId: priya.id, customerId: sharma.id,
        scheduledAt: d(-2, 10, 0), startedAt: d(-2, 10, 3), endedAt: d(-2, 10, 45),
        durationMin: 42, direction: 'OUTBOUND', channel: 'VIDEO',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 18,
        keyTopics: ['working capital terms', 'disbursement timeline', 'documentation'],
        transcriptSummary: 'Anil confirmed verbal commitment for ₹12Cr WC facility. Agreement draft to be sent by May 8. Anil needs funds by May 20 for Q1 FY27 operations.',
        actionItems: [
          { task: 'Send facility agreement by May 8', due: 'May 8' },
          { task: 'Confirm disbursement timeline with Ops', due: 'May 9' },
        ],
        outcomeLabel: 'WIN', dealValue: 12000000,
      },
      {
        rmId: priya.id, customerId: desai.id,
        scheduledAt: d(-2, 14, 30), startedAt: d(-2, 14, 33), endedAt: d(-2, 14, 58),
        durationMin: 25, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 12,
        keyTopics: ['salary hike', 'wealth planning', 'investment options', 'premium account'],
        transcriptSummary: 'Congratulated Ramesh on promotion to VP. Discussed moving to premium wealth account tier. Ramesh interested in SIP increase and mutual fund diversification. Agreed to call on Monday.',
        actionItems: [{ task: 'Prep premium wealth package for Desai call Monday', due: 'May 11' }],
        nbaTriggered: true, outcomeLabel: 'IN_PROGRESS',
      },
      // Day -1 (Thursday)
      {
        rmId: priya.id, customerId: joshi.id,
        scheduledAt: d(-1, 13, 0), startedAt: d(-1, 13, 5), endedAt: d(-1, 13, 20),
        durationMin: 15, direction: 'INBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'COLD', sentimentPost: 'NEUTRAL', sentimentDelta: 6,
        keyTopics: ['FX pricing', 'competitor offer', 'relationship value'],
        transcriptSummary: 'Pradeep called about Axis offer. Priya assured pricing review in progress. Asked him to hold off until morning. Pradeep agreed to wait for 09:15 call.',
        actionItems: [{ task: 'Get treasury FX quote before 09:00 May 8', due: 'May 8 09:00' }],
        outcomeLabel: 'IN_PROGRESS',
      },
      // Day 0 (Demo day - Friday)
      {
        rmId: priya.id, customerId: mehta.id,
        scheduledAt: d(0, 9, 30), startedAt: d(0, 9, 32), endedAt: d(0, 10, 18),
        durationMin: 46, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'NEUTRAL', sentimentPost: 'WARM', sentimentDelta: 18,
        keyTopics: ['final sanction', 'rate lock confirmation', 'prepayment waiver', 'disbursement'],
        transcriptSummary: 'Rajesh confirmed acceptance of 10.25% locked rate with prepayment waiver. Sign-off cleared at 15:48. Sanction letter to be issued Monday.',
        actionItems: [{ task: 'Issue sanction letter Monday AM', due: 'May 11' }],
        outcomeLabel: 'WIN', dealValue: 32000000,
      },
      {
        rmId: priya.id, customerId: sharma.id,
        scheduledAt: d(0, 10, 0), startedAt: d(0, 10, 2), endedAt: d(0, 10, 28),
        durationMin: 26, direction: 'OUTBOUND', channel: 'PHONE',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 20,
        keyTopics: ['deal closure', 'agreement sign-off', 'disbursement date'],
        transcriptSummary: 'Anil signed off on ₹12Cr WC facility. Docs to ops for processing. Disbursement confirmed May 17. Congratulatory video from Cluster Head Vikram Joshi sent at 10:27.',
        actionItems: [{ task: 'Track disbursement May 17', due: 'May 17' }],
        outcomeLabel: 'WIN', dealValue: 12000000,
      },
      {
        rmId: priya.id, customerId: iyer.id,
        scheduledAt: d(0, 16, 0), startedAt: d(0, 16, 4), endedAt: d(0, 16, 48),
        durationMin: 44, direction: 'OUTBOUND', channel: 'VIDEO',
        outcome: 'COMPLETED', sentimentPre: 'WARM', sentimentPost: 'WARM', sentimentDelta: 10,
        keyTopics: ['RD maturity reinvestment', 'Private Equity Fund', 'family wealth goals'],
        transcriptSummary: 'Presented PE fund pitch. Srinivas and Lakshmi both on call. Approved ₹36L investment. Follow-up meeting booked for May 13 to complete paperwork.',
        actionItems: [{ task: 'Send PE fund application docs by May 9', due: 'May 9' }],
        nbaTriggered: true, outcomeLabel: 'WIN',
      },
    ],
  })

  // ── NBA SIGNAL EVENTS ─────────────────────────────────────────────────────

  await prisma.nBASignalEvent.createMany({
    data: [
      {
        customerId: iyer.id, rmId: priya.id,
        signalType: 'RD_MATURITY',
        signalData: { maturityDate: '2026-05-22', maturityAmount: 3600000, currentFund: 'RD', recommendedFund: 'Private Equity' },
        detectedAt: d(-7, 6, 0),
        nbaProduct: 'PRIVATE_EQUITY_FUND',
        nbaScript: 'Srinivas, your recurring deposit of ₹36 lakhs matures on May 22nd. Given your current AUM and long-term wealth goals, I think this is an excellent moment to explore our Private Equity Fund — it\'s delivered 22% over 3 years for similar profiles.',
        confidence: 0.87,
        status: 'CONVERTED', outcome: 'CONVERTED', resolvedAt: d(0, 16, 48),
      },
      {
        customerId: desai.id, rmId: priya.id,
        signalType: 'SALARY_HIKE',
        signalData: { previousSalary: 4500000, newSalary: 7200000, changePercent: 60, employer: 'TechCorp' },
        detectedAt: d(-2, 5, 14),
        nbaProduct: 'PREMIUM_WEALTH_ACCOUNT',
        nbaScript: 'Congratulations on the promotion, Ramesh! A 60% salary increase is a significant milestone. This is a great time to review your wealth strategy — our Premium account comes with a dedicated wealth advisor, zero-fee forex, and priority access to IPOs.',
        confidence: 0.91,
        status: 'PENDING',
      },
      {
        customerId: mehta.id, rmId: priya.id,
        signalType: 'COMPETITOR_OFFER',
        signalData: { competitor: 'Kotak Mahindra', competitorRate: '10.0%', currentRate: '10.5%', facility: 'Term Loan' },
        detectedAt: d(-4, 10, 0),
        nbaProduct: 'RETENTION_OFFER',
        nbaScript: 'Rajesh, I understand you\'ve received a competitive offer. Our counter: 10.25% locked for full tenure with prepayment waiver for 24 months. The stability of a locked rate protects you from any rate hikes over the next 3 years.',
        confidence: 0.78,
        status: 'CONVERTED', outcome: 'CONVERTED', resolvedAt: d(0, 9, 45),
      },
      {
        customerId: kapoor.id, rmId: priya.id,
        signalType: 'KYC_EXPIRY',
        signalData: { expiryDate: '2026-05-15', daysToBreach: 2, previousAttempts: 3 },
        detectedAt: d(-7, 6, 0),
        nbaProduct: 'KYC_RENEWAL',
        nbaScript: null,
        confidence: 0.99,
        status: 'PENDING',
      },
    ],
  })

  // ── CBS ALERTS ─────────────────────────────────────────────────────────────

  await prisma.cBSAlert.createMany({
    data: [
      {
        customerId: kapoor.id, rmId: priya.id,
        alertType: 'KYC_EXPIRY', severity: 'HIGH',
        message: 'KYC for Kapoor Group (CIF-PR-002218) expires May 15, 2026. SLA breach predicted in 48 hours if no action.',
        triggeredAt: d(-7, 6, 0), dueDate: d(-2, 23, 59),
        status: 'OPEN',
      },
      {
        customerId: singh.id, rmId: priya.id,
        alertType: 'KYC_EXPIRY', severity: 'MEDIUM',
        message: 'KYC for Singh Trading (CIF-BK-008821) expires in 7 days.',
        triggeredAt: d(-3, 6, 0), dueDate: d(4, 23, 59),
        status: 'ACTIONED', actionTaken: 'KYC reminder sent with pre-filled form.',
      },
      {
        customerId: mehra.id, rmId: priya.id,
        alertType: 'KYC_EXPIRY', severity: 'MEDIUM',
        message: 'KYC for Mehra Logistics (CIF-BK-011203) expires in 11 days.',
        triggeredAt: d(-2, 6, 0), dueDate: d(8, 23, 59),
        status: 'ACTIONED', actionTaken: 'KYC reminder sent.',
      },
      {
        customerId: iyer.id, rmId: priya.id,
        alertType: 'FD_MATURITY', severity: 'LOW',
        message: 'Recurring Deposit (RD-2025-IY-002) for Iyer Family matures May 22, 2026. Value: ₹36L.',
        triggeredAt: d(-7, 6, 0), dueDate: d(14, 23, 59),
        status: 'ACTIONED', actionTaken: 'NBA triggered. Cross-sell pitch prepared and presented.',
        resolvedAt: d(0, 16, 48),
      },
      {
        customerId: desai.id, rmId: priya.id,
        alertType: 'LARGE_CREDIT', severity: 'LOW',
        message: 'Large salary credit detected on Desai Family account: ₹72L (prev. ₹45L). NBA opportunity flagged.',
        triggeredAt: d(-2, 5, 0), dueDate: d(7, 23, 59),
        status: 'OPEN',
      },
    ],
  })

  // ── CUSTOMER NOTES ────────────────────────────────────────────────────────

  await prisma.customerNote.createMany({
    data: [
      {
        customerId: mehta.id, rmId: priya.id,
        content: 'Rajesh is very rate-sensitive. Always compare with Kotak and HDFC. He responds well to locked-rate commitments. Prefers calls over emails. Best time: 9–10 AM. Family man — references his sons in the business.',
        noteType: 'PREFERENCE', source: 'RM', createdAt: d(-30),
      },
      {
        customerId: mehta.id, rmId: priya.id,
        content: 'Call outcome May 8: Sentiment swung from cold to warm. Locked rate 10.25% accepted. Prepayment waiver for 24M confirmed verbally. Sanction letter to be issued Monday. Rajesh mentioned new machinery purchase by June 1.',
        noteType: 'CALL_SUMMARY', source: 'AI_TRANSCRIPTION', createdAt: d(0, 10, 20),
      },
      {
        customerId: iyer.id, rmId: priya.id,
        content: 'Srinivas and Lakshmi are both involved in investment decisions. Srinivas leads but always checks with Lakshmi. Conservative risk appetite — prefer fixed returns but open to PE with 3-year horizon. Do NOT pitch equity MF directly.',
        noteType: 'PREFERENCE', source: 'RM', createdAt: d(-60),
      },
      {
        customerId: sharma.id, rmId: priya.id,
        content: 'Anil moves fast. Decisions in 1 call. He values speed over price. Always lead with how quickly we can disburse. ₹12Cr WC closed May 8. Disbursement expected May 17.',
        noteType: 'CALL_SUMMARY', source: 'RM', createdAt: d(0, 10, 30),
      },
      {
        customerId: kapoor.id, rmId: priya.id,
        content: 'WARNING: Vikram has missed 3 KYC outreach attempts. High non-responsive risk. SLA breach in 48 hrs. Escalated to Amit Jain for reassignment. Priya to remain primary RM.',
        noteType: 'RISK', source: 'RM', createdAt: d(0, 12, 30),
      },
      {
        customerId: joshi.id, rmId: priya.id,
        content: 'Pradeep is price-driven. Axis Bank has been actively targeting him. FX business (~USD 2M/month) is at risk. He sent a pricing query at 23:47 — signals he is seriously evaluating switching. Need to retain with treasury rate improvement.',
        noteType: 'RISK', source: 'RM', createdAt: d(-1, 14, 0),
      },
      {
        customerId: desai.id, rmId: priya.id,
        content: 'Ramesh just got promoted to VP at TechCorp. Salary jumped 60% to ₹72L. Very fintech-savvy — uses Zerodha and Groww. He will respond to data-driven pitch. Lead with performance benchmarks, not brand.',
        noteType: 'PREFERENCE', source: 'RM', createdAt: d(-2, 15, 0),
      },
    ],
  })

  // ── CUSTOMER MILESTONES ───────────────────────────────────────────────────

  await prisma.customerMilestone.createMany({
    data: [
      { customerId: sharma.id, milestoneType: 'DEAL_CLOSED', occurredAt: d(0, 10, 28), value: 12000000, description: '₹12 Cr Working Capital facility closed. Priya\'s biggest single deal this quarter.', flaggedForRM: false },
      { customerId: mehta.id, milestoneType: 'DEAL_CLOSED', occurredAt: d(0, 15, 48), value: 32000000, description: '₹3.2 Cr sanction confirmed. Sentiment recovery from cold to warm during call.', flaggedForRM: false },
      { customerId: iyer.id, milestoneType: 'NBA_CONVERTED', occurredAt: d(0, 16, 48), value: 3600000, description: 'RD maturity converted to Private Equity Fund. Cross-sell success.', flaggedForRM: false },
      { customerId: desai.id, milestoneType: 'SALARY_HIKE', occurredAt: d(-2, 5, 14), value: 7200000, description: 'Annual salary increased to ₹72L. Flagged for premium wealth upgrade pitch.', flaggedForRM: true },
      { customerId: mehta.id, milestoneType: 'RELATIONSHIP_ANNIVERSARY', occurredAt: d(-15), description: '5-year relationship anniversary with IDFC FIRST Bank.', flaggedForRM: true },
      { customerId: verma.id, milestoneType: 'AUM_MILESTONE', occurredAt: d(-30), value: 24000000, description: 'AUM crossed ₹2.4 Cr threshold. Eligible for private banking upgrade.', flaggedForRM: true },
    ],
  })

  // ── AGENT RUN LOGS ────────────────────────────────────────────────────────

  await prisma.agentRunLog.createMany({
    data: [
      {
        rmId: priya.id, agentType: 'EMAIL_AGENT', runAt: d(0, 4, 0), trigger: 'SCHEDULED',
        inputSummary: '23 emails scanned (22:00–04:00 IST window). 3 inbound customer emails, 20 internal.',
        outputSummary: 'Auto-replied: Patel (acknowledgement). Drafted: Joshi (pricing query, held for RM). Flagged: Mehta thread for priority 1 attention.',
        actionsCount: 3, tokensUsed: 8420, latencyMs: 2340, status: 'SUCCESS',
      },
      {
        rmId: priya.id, agentType: 'KYC_AGENT', runAt: d(0, 6, 0), trigger: 'SCHEDULED',
        inputSummary: 'Scanned 47 customers for KYC expiry. Found 3 actionable (Kapoor: 7d, Singh: 7d, Mehra: 11d).',
        outputSummary: 'Kapoor: SLA breach in 48h — flagged HIGH, sent to RM. Singh: reminder sent with pre-filled form. Mehra: reminder sent.',
        actionsCount: 3, tokensUsed: 3200, latencyMs: 890, status: 'SUCCESS',
      },
      {
        rmId: priya.id, agentType: 'NBA_AGENT', runAt: d(0, 5, 0), trigger: 'EVENT',
        inputSummary: 'CBS event received: salary credit ₹72L for Desai Family account. Previous salary: ₹45L.',
        outputSummary: 'NBA signal generated: Premium Wealth Account upgrade. Pitch script prepared. Priority queued for RM.',
        actionsCount: 2, tokensUsed: 4100, latencyMs: 1200, status: 'SUCCESS',
      },
      {
        rmId: priya.id, agentType: 'MIS_AGENT', runAt: d(0, 4, 30), trigger: 'SCHEDULED',
        inputSummary: 'Yesterday\'s call logs, email events, deal pipeline changes pulled from CRM.',
        outputSummary: 'Salesforce notes synced for Mehta (call of May 7). Pipeline updated for Sharma Industries. T&E receipt OCR run on 12 Pune receipts.',
        actionsCount: 3, tokensUsed: 5800, latencyMs: 3100, status: 'SUCCESS',
      },
    ],
  })

  console.log('✅ Priya Sharma\'s world seeded successfully.')
  console.log('   → 10 customers | 4 priorities | 12 auto-actions | 5 debriefs')
  console.log('   → 4 email threads | 10+ emails | 11 call logs | 6 NBA signals')
  console.log('   → 4 agent run logs | 5 CBS alerts | 7 customer notes | 6 milestones')
}

main().catch(console.error).finally(() => prisma.$disconnect())
