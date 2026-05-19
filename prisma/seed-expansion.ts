import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const RM_ID = 'rm-priya-sharma-001'

// IST offset helper — IST = UTC+5:30
const ist = (dateStr: string) => new Date(dateStr)

async function main() {
  console.log('🌍 Starting world expansion seed…')

  // Look up customer IDs dynamically by cifId so re-seeds always work
  const customers = await prisma.customer.findMany({ select: { id: true, cifId: true } })
  const byCif = Object.fromEntries(customers.map(c => [c.cifId, c.id]))
  const C = {
    mehta:  byCif['CIF-MH-004412'],
    iyer:   byCif['CIF-WM-007731'],
    kapoor: byCif['CIF-PR-002218'],
    sharma: byCif['CIF-BK-009901'],
    patel:  byCif['CIF-BK-006634'],
    joshi:  byCif['CIF-PR-003345'],
    singh:  byCif['CIF-BK-008821'],
    mehra:  byCif['CIF-BK-011203'],
    verma:  byCif['CIF-WM-001102'],
    desai:  byCif['CIF-RT-015567'],
  }
  const missing = Object.entries(C).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) throw new Error(`Customers not found — run seed.ts first: ${missing.join(', ')}`)

  // ─── EMAIL THREADS + EMAILS ─────────────────────────────────────────────────

  const threads = [

    // ── CAT 1: CUSTOMER URGENT ────────────────────────────────────────────────

    {
      thread: {
        subject: 'Urgent: HDFC offering better rate — need your response',
        customerId: C.mehta, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T16:44:00Z'),
        lastActivity: ist('2026-05-07T23:15:00Z'),
        status: 'PENDING_REPLY', priority: 'HIGH',
        aiClassification: 'competitor_threat', sentimentScore: -30, competitorFlag: true,
      },
      emails: [
        {
          fromAddress: 'rajesh@mehtagroup.in', fromName: 'Rajesh Mehta',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Urgent: HDFC offering better rate — need your response before tomorrow',
          bodyText: `Dear Priya,

I hope this email finds you well. I wanted to reach out before tomorrow's call.

I've had an approach from HDFC Commercial Banking — they've offered us a working capital facility at 10.07% with a 90-day prepayment waiver included as standard. Given our long relationship with IDFC FIRST, I wanted to give you a chance to respond before I make any decision.

The rate difference over 7 years on ₹3.2 Cr is significant — roughly ₹38L in additional interest cost at your current rate.

I'd appreciate your response before 09:30 tomorrow.

Best regards,
Rajesh Mehta
Chairman, Mehta Group`,
          sentAt: ist('2026-05-07T16:44:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'competitor_threat', sentiment: 'negative',
          entities: { competitor: 'HDFC', rate: '10.07%', product: 'working capital facility' },
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'rajesh@mehtagroup.in', toName: 'Rajesh Mehta',
          subject: 'Re: Urgent: HDFC offering better rate — need your response before tomorrow',
          bodyText: `Dear Mr. Mehta,

Thank you for your trust in reaching out before tomorrow's call.

I have noted the HDFC proposal and would like to present our counter-proposal in person at 09:30. I am prepared to discuss:

1. Rate matching on the ₹3.2 Cr facility — I have escalated for same-day approval
2. The prepayment waiver you requested in August — approval secured
3. A relationship package that accounts for your full book with us (₹2.4 Cr outstanding + trade finance sub-limit)

The numbers we discuss tomorrow will speak for themselves. Looking forward to the conversation.

Warm regards,
Priya Sharma
Relationship Manager | IDFC FIRST Bank | Mumbai N
[AI NOTE: Draft held for review — competitor flag raised. Recommend RM personalise before sending.]`,
          sentAt: ist('2026-05-07T23:15:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_DRAFT',
          aiConfidence: 0.71, approved: false, classification: 'competitor_response', sentiment: 'positive',
        },
      ],
    },

    {
      thread: {
        subject: 'Facility renewal CC-22841 — Schedule 3 resubmission',
        customerId: C.patel, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-06T10:52:00Z'),
        lastActivity: ist('2026-05-07T03:45:00Z'),
        status: 'OPEN', priority: 'HIGH',
        aiClassification: 'document_submission', sentimentScore: 10, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'ravi.patel@patelindustries.in', fromName: 'Ravi Patel',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: Facility renewal CC-22841 — missing Schedule 3',
          bodyText: `Priya,

Following up on the renewal pack I sent last week. I noticed Schedule 3 (the collateral valuation report) was not included in my original submission — my CA's oversight. Attaching the corrected document now.

Please confirm receipt and whether this unblocks the processing timeline. We are eager to complete this before quarter end — our Board meeting is 12 May and we need the facility confirmed.

Thanks,
Ravi Patel
MD, Patel Industries`,
          sentAt: ist('2026-05-06T10:52:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'document_submission',
          attachments: [{ name: 'Schedule_3_Collateral_Valuation.pdf', size: '2.4 MB' }],
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'ravi.patel@patelindustries.in', toName: 'Ravi Patel',
          ccAddress: 'risk-team@idfcfirstbank.com',
          subject: 'Re: Facility renewal CC-22841 — Schedule 3 received',
          bodyText: `Dear Mr. Patel,

Thank you for sending Schedule 3 — I confirm receipt of the corrected collateral valuation document (stamped 5 May 2026, Chartered Accountant: M/s Sharma & Associates).

This has been uploaded to the renewal file CC-22841 and the Risk team has been notified for parallel review. We remain on track for the consolidated quote by Wednesday 8 May, 17:00 IST.

Please do not hesitate to reach out if anything else is required.

Warm regards,
Priya Sharma`,
          sentAt: ist('2026-05-06T11:18:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.94, approved: true, classification: 'acknowledgement',
        },
        {
          fromAddress: 'ravi.patel@patelindustries.in', fromName: 'Ravi Patel',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: CC-22841 — timeline check',
          bodyText: `Priya,

Quick check — has the Risk team had a chance to look at the docs? Our Board meeting is on 12 May and we need the facility confirmed before then. Can you give me a realistic timeline?

R`,
          sentAt: ist('2026-05-07T03:45:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'follow_up', sentiment: 'neutral',
        },
      ],
    },

    {
      thread: {
        subject: 'Congratulations — ₹12 Cr facility sanctioned + next steps',
        customerId: C.sharma, rmId: RM_ID,
        initiatedBy: 'rm', startedAt: ist('2026-05-05T05:00:00Z'),
        lastActivity: ist('2026-05-06T04:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'deal_closed', sentimentScore: 85, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'chairman@sharmaindustries.com', toName: 'Suresh Sharma',
          ccAddress: 'ankit.cfo@sharmaindustries.com',
          subject: 'Congratulations — ₹12 Cr facility sanctioned',
          bodyText: `Dear Mr. Sharma,

It is my great pleasure to confirm that your ₹12 Cr term loan facility has been sanctioned and documentation is complete.

On behalf of the entire IDFC FIRST team, congratulations on this milestone — a testament to Sharma Industries' strong fundamentals and the trust you have placed in us.

Key details:
• Facility: ₹12,00,00,000 (₹12 Cr)
• Effective date: 6 May 2026
• First drawdown available: 9 May 2026
• Rate: 10.85% fixed, 84-month tenor

I will personally ensure your onboarding is smooth. Would you be available for a brief 15-minute call on 12 May to review the drawdown plan with your CFO?

Warm regards,
Priya Sharma
Relationship Manager | IDFC FIRST Bank | Mumbai N`,
          sentAt: ist('2026-05-05T05:00:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'deal_notification', sentiment: 'positive',
        },
        {
          fromAddress: 'chairman@sharmaindustries.com', fromName: 'Suresh Sharma',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: Congratulations — ₹12 Cr facility sanctioned',
          bodyText: `Dear Priya,

Thank you and the entire IDFC FIRST team. We are very happy with the speed and professionalism shown throughout this process.

Yes, 12 May works well for the call. Our CFO Ankit will join as well — please send the agenda ahead of time so he can prepare the drawdown schedule questions.

Best regards,
Suresh Sharma
Chairman, Sharma Industries`,
          sentAt: ist('2026-05-05T05:32:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'positive_response', sentiment: 'positive',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'chairman@sharmaindustries.com', toName: 'Suresh Sharma',
          subject: 'Onboarding checklist — 3 items pending your action',
          bodyText: `Dear Mr. Sharma,

Attaching the onboarding checklist for your ₹12 Cr facility. Three items pending your action:

1. Board resolution — please send certified copy (template attached)
2. Insurance policy endorsement — name IDFC FIRST Bank as loss payee
3. NACH mandate for EMI — pre-filled form attached, sign and return

Everything else is complete on our end. First drawdown can proceed the moment these three are received.

Priya`,
          sentAt: ist('2026-05-06T04:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'onboarding',
          attachments: [{ name: 'Onboarding_Checklist_SharmaIndustries.pdf', size: '380 KB' }],
        },
      ],
    },

    {
      thread: {
        subject: 'RD maturing 14 May — urgent: what should we do with the proceeds?',
        customerId: C.iyer, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T14:00:00Z'),
        lastActivity: ist('2026-05-07T23:40:00Z'),
        status: 'PENDING_REPLY', priority: 'HIGH',
        aiClassification: 'product_maturity', sentimentScore: 40, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'lakshmi.iyer@gmail.com', fromName: 'Lakshmi Iyer',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'RD maturing 14 May — urgent: what should we do?',
          bodyText: `Dear Priya,

My son Arjun pointed out that our Recurring Deposit of ₹38 lakhs matures on 14 May — just 7 days away! We are not sure what to do with the proceeds.

Arjun prefers equity mutual funds but I am more conservative and prefer something safer. My husband says we should just renew the RD. Can you advise?

Also, is there a tax-efficient option? We don't want to pay unnecessary capital gains.

Please call us or send options — we want to decide by this weekend.

Regards,
Lakshmi Iyer`,
          sentAt: ist('2026-05-07T14:00:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'wealth_query', sentiment: 'neutral',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'lakshmi.iyer@gmail.com', toName: 'Lakshmi Iyer',
          subject: 'Re: RD maturing 14 May — three options prepared for your family',
          bodyText: `Dear Mrs. Iyer,

Thank you for writing in ahead of the maturity — you have plenty of time to decide.

I have prepared three options for your family's consideration and would love to walk you through them at 16:00 today:

OPTION 1 — FIRST Wealth Conservative Portfolio
• 6.8% blended yield, capital-safe, principal guaranteed
• Best for: your preference (conservative, no market risk)
• Tax: interest taxed as per slab, LTCG not applicable

OPTION 2 — Systematic Transfer Plan (STP)
• Park in liquid fund today, transfer ₹2L/month to equity fund
• Best for: Arjun's preference (equity exposure, managed risk)
• Tax: liquid fund gains taxable; equity gains at 10% LTCG after 1 year

OPTION 3 — RD Renewal
• 36 months at today's best rate: 7.20% p.a. (locked in today)
• Best for: simplicity + your husband's preference
• Tax: interest taxable annually as per slab

All three options are available for same-day execution. I'll bring the paperwork for the one you choose to our 16:00 call.

[AI NOTE: Pitch script prepared, tone-tuned for Iyer family (formal, family-consensus style). Held for RM review before sending.]

Priya`,
          sentAt: ist('2026-05-07T23:40:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_DRAFT',
          aiConfidence: 0.83, approved: false, classification: 'wealth_advisory', sentiment: 'positive',
        },
      ],
    },

    {
      thread: {
        subject: 'Working capital pricing — Axis Bank has offered MCLR + 1.65%',
        customerId: C.joshi, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T12:15:00Z'),
        lastActivity: ist('2026-05-07T23:18:00Z'),
        status: 'PENDING_REPLY', priority: 'HIGH',
        aiClassification: 'competitor_threat', sentimentScore: -20, competitorFlag: true,
      },
      emails: [
        {
          fromAddress: 'amit.joshi@joshi-co.in', fromName: 'Amit Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Working capital pricing — Axis Bank has offered MCLR + 1.65%',
          bodyText: `Priya,

Following our call yesterday — I spoke with Axis and they are offering MCLR + 1.65% for the full ₹6 Cr limit with no tranching. That's 20 bps better than your last quote and simpler.

I want to give IDFC FIRST a chance to match. Also their FX desk waived the hedging fee for the first year.

Can you come back to me by 10:00 tomorrow? I have a board decision to make.

Amit`,
          sentAt: ist('2026-05-07T12:15:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'competitor_threat', sentiment: 'negative',
          entities: { competitor: 'Axis Bank', rate: 'MCLR+1.65%', limit: '₹6 Cr' },
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'amit.joshi@joshi-co.in', toName: 'Amit Joshi',
          subject: 'Re: Working capital pricing — revised proposal by 09:30',
          bodyText: `Dear Mr. Joshi,

Thank you for sharing the Axis quote — I appreciate your transparency and loyalty in giving us a chance to respond.

I am preparing a revised proposal and will revert by 09:30 (ahead of your 10:00 deadline).

I believe we can match the rate and offer additional relationship value that Axis cannot match — including our AI-powered overnight actions that saved your team 3.5 hours last month, and dedicated same-day RM access.

[AI NOTE: Rate match needs credit approval — escalating to Vikram (approval in discretionary range +15 bps). FX hedging waiver is within RM discretionary limit. Recommend adding waiver + relationship value pitch. Draft held for RM personalisation before sending.]

Priya`,
          sentAt: ist('2026-05-07T23:18:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_DRAFT',
          aiConfidence: 0.62, approved: false, classification: 'competitor_response',
        },
      ],
    },

    {
      thread: {
        subject: 'KYC deadline — third reminder · action required before 10 May',
        customerId: C.kapoor, rmId: RM_ID,
        initiatedBy: 'rm', startedAt: ist('2026-05-01T03:30:00Z'),
        lastActivity: ist('2026-05-03T08:30:00Z'),
        status: 'OPEN', priority: 'HIGH',
        aiClassification: 'kyc_compliance', sentimentScore: -50, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'kapoor@kapoorgroup.com', toName: 'Mr. Kapoor',
          subject: 'THIRD REMINDER: Annual KYC refresh due 10 May — action required',
          bodyText: `Dear Mr. Kapoor,

This is our third and final reminder regarding your annual KYC refresh, due 10 May 2026.

Failure to complete by this date will result in a temporary restriction on all account transactions as per RBI Circular RBI/2024-25/KYC/112.

The pre-filled form takes approximately 90 seconds to complete. E-sign link: [KYC portal — valid until 10 May 23:59 IST]

Pre-filled fields: 12 of 14
Outstanding: Overseas address update, beneficial ownership declaration

Regards,
Priya Sharma`,
          sentAt: ist('2026-05-01T03:30:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.96, approved: true, classification: 'kyc_reminder',
        },
        {
          fromAddress: 'pa.kapoor@kapoorgroup.com', fromName: "PA to Mr. Kapoor",
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: KYC — Mr. Kapoor traveling abroad until 11 May',
          bodyText: `Ms. Sharma,

Mr. Kapoor is currently traveling abroad (Singapore, Dubai) until 11 May. He will complete the KYC upon return.

Please extend the deadline as a courtesy given the long banking relationship.

Regards,
PA to Mr. Kapoor`,
          sentAt: ist('2026-05-03T06:00:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'kyc_delay',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'pa.kapoor@kapoorgroup.com', toName: "PA to Mr. Kapoor",
          ccAddress: 'amit.verma@idfcfirstbank.com',
          subject: 'Re: KYC — reassigning to Amit Verma for remote coordination',
          bodyText: `Dear PA,

Thank you for informing us. Unfortunately RBI guidelines do not permit deadline extensions — a temporary account restriction would apply from 11 May if the KYC is not completed.

To avoid any disruption, I am initiating a temporary coordination handoff to my colleague Amit Verma, who can facilitate the e-signature remotely at Mr. Kapoor's convenience (even from abroad via video call).

Amit Verma | amit.verma@idfcfirstbank.com | +91 98765 43210

Amit will reach out to you by end of today to schedule a convenient 5-minute video call.

Regards,
Priya Sharma`,
          sentAt: ist('2026-05-03T08:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'kyc_escalation',
        },
      ],
    },

    {
      thread: {
        subject: 'USD/INR at 84.2 — shall we book ₹50L?',
        customerId: C.desai, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-08T00:00:00Z'),
        lastActivity: ist('2026-05-08T00:40:00Z'),
        status: 'PENDING_REPLY', priority: 'HIGH',
        aiClassification: 'fx_opportunity', sentimentScore: 60, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'finance@desaiexports.com', fromName: 'Naveen Desai',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'USD/INR at 84.2 — saw your alert, let\'s book ₹50L',
          bodyText: `Priya,

Saw your WhatsApp alert this morning. Yes — let's book ₹50 lakhs at 84.2.

What's the process? Do I call the Treasury desk directly or go through you? We also have another $70K exposure coming up in June — should we cover that too while the rate is good?

Naveen Desai
Finance Director, Desai Exports`,
          sentAt: ist('2026-05-08T00:00:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'fx_booking', sentiment: 'positive',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'finance@desaiexports.com', toName: 'Naveen Desai',
          subject: 'Re: FX booking — initiating ₹50L at 84.2 now',
          bodyText: `Dear Naveen,

Great — initiating the booking right now through our Treasury desk.

For ₹50L at 84.2:
• Deal ticket will be sent to your registered email within 15 minutes
• Reference rate confirmed: 84.2050 (mid-market 05:00 IST)
• Net: ₹42,02,500 (after standard forex markup of 0.05%)

On the June $70K exposure — I'd recommend partial forward cover at today's rate (rate window for 60-day forwards: 84.45). Let me prepare a hedging strategy note and send by noon.

You have time on the June exposure, but today's rate is strong — worth locking.

[AI NOTE: Draft ready for approval. Confidence 0.89 — standard FX acknowledgement pattern.]

Priya`,
          sentAt: ist('2026-05-08T00:40:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_DRAFT',
          aiConfidence: 0.89, approved: false, classification: 'fx_confirmation',
        },
      ],
    },

    {
      thread: {
        subject: 'Card declined at client meeting — extremely embarrassing',
        customerId: C.verma, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-08T03:35:00Z'),
        lastActivity: ist('2026-05-08T03:40:00Z'),
        status: 'PENDING_REPLY', priority: 'HIGH',
        aiClassification: 'complaint', sentimentScore: -80, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'rajesh.gupta@vermacapital.in', fromName: 'Rajesh Gupta',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Card declined at client meeting — extremely embarrassing',
          bodyText: `Priya,

I am extremely upset. My IDFC FIRST business card was declined at a client lunch today at the Taj Lands End. The client was a potential ₹2 Cr borrower for my firm.

This is the SECOND time in 3 months. I asked the waiter to try twice — declined both times. I had to pay from personal savings. This is completely unacceptable.

I am seriously reconsidering my entire banking relationship with IDFC FIRST.

Please call me NOW. If I don't hear from you within the hour I am escalating to your Branch Head.

Rajesh Gupta`,
          sentAt: ist('2026-05-08T03:35:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'complaint', sentiment: 'negative',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'rajesh.gupta@vermacapital.in', toName: 'Rajesh Gupta',
          subject: 'Re: Card declined — personal apology + immediate escalation',
          bodyText: `Dear Mr. Gupta,

I sincerely apologize for this experience — this is unacceptable and I take full responsibility for resolving it today.

I am escalating to our Cards Operations team immediately (Ref: CARD-ESCL-2026-0518) and will call you within 10 minutes with a resolution.

[AI NOTE: Complaint severity HIGH — sentiment -80. Draft held. Recommend RM make personal call FIRST, then send this email as follow-up with resolution details filled in. Do not send before calling.]

Priya`,
          sentAt: ist('2026-05-08T03:40:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_DRAFT',
          aiConfidence: 0.55, approved: false, classification: 'complaint_response',
        },
      ],
    },

    // ── CAT 2: CUSTOMER ROUTINE ────────────────────────────────────────────────

    {
      thread: {
        subject: 'Annual account review — scheduling for May',
        customerId: C.singh, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-04T09:30:00Z'),
        lastActivity: ist('2026-05-04T11:00:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'relationship_maintenance', sentimentScore: 30, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'harpreet.singh@singhtrading.com', fromName: 'Harpreet Singh',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Annual account review — scheduling for May',
          bodyText: `Priya,

It's been almost a year since we last did a formal review. I'd like to do one before end of May. Can we find a 45-min slot?

Also, I'm thinking of adding a current account for our new Delhi subsidiary — can you prepare the paperwork in advance?

Thanks,
Harpreet Singh`,
          sentAt: ist('2026-05-04T09:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'review_request',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'harpreet.singh@singhtrading.com', toName: 'Harpreet Singh',
          subject: 'Re: Annual review — 20 May confirmed + Delhi subsidiary pre-filled',
          bodyText: `Dear Harpreet,

Lovely to hear from you! I've blocked 20 May (Monday) 11:00–11:45 for your annual review — calendar invite attached.

On the Delhi subsidiary current account, I've started the pre-filled application based on your existing KYC — I'll have it ready for your signature at our meeting.

See you on the 20th.

Priya`,
          sentAt: ist('2026-05-04T11:00:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.93, approved: true, classification: 'scheduling',
        },
      ],
    },

    {
      thread: {
        subject: 'FY2025-26 account statement for CA',
        customerId: C.iyer, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-03T05:30:00Z'),
        lastActivity: ist('2026-05-03T06:00:00Z'),
        status: 'CLOSED', priority: 'LOW',
        aiClassification: 'statement_request', sentimentScore: 20, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'lakshmi.iyer@gmail.com', fromName: 'Lakshmi Iyer',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Account statement request — FY 2025-26',
          bodyText: `Dear Priya,

Could you send the account statement for FY 2025-26 for our CA? We need it for our tax filing. Thank you.

Regards,
Lakshmi`,
          sentAt: ist('2026-05-03T05:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'lakshmi.iyer@gmail.com', toName: 'Lakshmi Iyer',
          subject: 'Re: Account statement — FY 2025-26 attached',
          bodyText: `Dear Mrs. Iyer,

Statement for FY 2025-26 is attached (PDF, password-protected — password is your date of birth in DDMMYYYY format).

Account No: ••••4219 | Period: 1 Apr 2025 – 31 Mar 2026

Please let me know if your CA needs any additional certification.

Priya`,
          sentAt: ist('2026-05-03T06:00:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.97, approved: true, classification: 'statement_delivery',
          attachments: [{ name: 'Statement_IyerFamily_FY2526.pdf', size: '580 KB' }],
        },
      ],
    },

    {
      thread: {
        subject: 'Import LC — aluminium sheets from Germany',
        customerId: C.mehta, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-04T07:00:00Z'),
        lastActivity: ist('2026-05-04T08:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'trade_finance', sentimentScore: 40, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'rajesh@mehtagroup.in', fromName: 'Rajesh Mehta',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'LC for import — aluminium sheets · EUR 85,000',
          bodyText: `Priya,

We have an import order from Germany — 200MT aluminium sheets, EUR 85,000. Need a Letter of Credit. The supplier requires LC confirmation within 5 working days.

How quickly can your Trade Finance desk process this? Our sub-limit should have headroom.

Rajesh`,
          sentAt: ist('2026-05-04T07:00:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
          classification: 'trade_finance_request',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'rajesh@mehtagroup.in', toName: 'Rajesh Mehta',
          subject: 'Re: Import LC — 2 working days, application attached',
          bodyText: `Dear Mr. Mehta,

Good news — Trade Finance can issue the LC within 2 working days for existing customers at your tier.

I've initiated the request (Ref: TF-2026-0490). Application form is attached — please sign page 3 and return by email.

Sub-limit check: Your trade finance sub-limit has ₹1.2 Cr headroom (EUR 85,000 ≈ ₹76L at today's rate). Sufficient for this transaction.

Charges: LC issuance fee 0.125% per quarter + SWIFT charges ₹1,800. I'll send the final debit advice once the LC is issued.

Priya`,
          sentAt: ist('2026-05-04T08:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'trade_finance_response',
          attachments: [{ name: 'LC_Application_MehtaGroup.pdf', size: '210 KB' }],
        },
      ],
    },

    {
      thread: {
        subject: 'Statement dispute — 3 unrecognised charges in April',
        customerId: C.verma, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T05:50:00Z'),
        lastActivity: ist('2026-05-07T08:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'dispute', sentimentScore: -40, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'kavita@vermacapital.in', fromName: 'Kavita Sheth',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Statement dispute — 3 unrecognised charges in April',
          bodyText: `Dear Ms. Sharma,

I see 3 charges in my April statement that I don't recognise:
1. ₹2,340 on 15 Apr — merchant: "DGTL-SRV-441"
2. ₹1,180 on 22 Apr — merchant: "RECUR-PAY-228"
3. ₹890 on 28 Apr — merchant: "AUTO-SUB-117"

Total: ₹4,410. Please investigate and reverse if unauthorised.

I have also filed a complaint with the Banking Ombudsman as a precaution.

Kavita Sheth`,
          sentAt: ist('2026-05-07T05:50:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'dispute', sentiment: 'negative',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'kavita@vermacapital.in', toName: 'Kavita Sheth',
          subject: 'Re: Statement dispute — investigation raised, Ref FD-2026-0522',
          bodyText: `Dear Ms. Sheth,

Thank you for flagging this. I have raised an investigation request with our Fraud & Disputes team.

Reference: FD-2026-0522
Timeline: Resolution within 3 working days (by 10 May)
If charges are found unauthorised: auto-reversed with applicable interest

Preliminary check: "DGTL-SRV" codes typically indicate digital subscription services — I'll check if any auto-renewals were linked to your account.

Regarding the Ombudsman filing — I understand and appreciate the precaution. Please give us until 10 May to resolve before the Ombudsman takes it forward. I'll personally update you by EOD 10 May.

Priya`,
          sentAt: ist('2026-05-07T08:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'dispute_response',
        },
      ],
    },

    {
      thread: {
        subject: 'Trade finance limit enhancement request — 40% volume growth',
        customerId: C.mehra, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-02T05:30:00Z'),
        lastActivity: ist('2026-05-02T10:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'limit_enhancement', sentimentScore: 20, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'rohit.cfo@mehralogistics.com', fromName: 'Rohit Mehra',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Trade finance limit enhancement — 40% volume growth this year',
          bodyText: `Hi Priya,

Our trade volumes have grown 40% this year. The current limit feels tight — we're having to break shipments into smaller lots to stay within limits, which costs us 3-4% in logistics inefficiency.

Can we discuss a trade limit enhancement? Rough number: we need ₹60L headroom above current.

Rohit Mehra, CFO
Mehra Logistics`,
          sentAt: ist('2026-05-02T05:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
          classification: 'limit_enhancement',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'rohit.cfo@mehralogistics.com', toName: 'Rohit Mehra',
          subject: 'Re: Trade limit enhancement — initiating review, target 9 May',
          bodyText: `Dear Rohit,

Congratulations on the 40% growth — that's a strong signal.

I've initiated a limit enhancement review. Preliminary assessment: ₹60L enhancement is feasible based on your last 6 months' utilisation (avg 78%, peak 94%) and the clean repayment track record.

Credit team will complete the review by 9 May. I'll call you that afternoon with the outcome.

While the review is in progress, if you have an urgent shipment that's running against the limit, call me directly — I can arrange a temporary manual override for single transactions above ₹10L.

Priya`,
          sentAt: ist('2026-05-02T10:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'limit_enhancement_response',
        },
      ],
    },

    // ── CAT 3: INTERNAL ───────────────────────────────────────────────────────

    {
      thread: {
        subject: "Today's stack — aligned? One override from me",
        customerId: null, rmId: RM_ID,
        initiatedBy: 'manager', startedAt: ist('2026-05-08T00:58:00Z'),
        lastActivity: ist('2026-05-08T01:15:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'manager_alignment', sentimentScore: 50, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'vikram.joshi@idfcfirstbank.com', fromName: 'Vikram Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: "Today's stack — aligned? One note from me",
          bodyText: `Priya,

Saw your stack update last night. Mehta first — absolutely right call.

Two things:
1. Goyal site visit — important you bring back a signed NDA before showing any term sheet. Legal is insisting on this for all new-to-bank SME customers above ₹2 Cr.
2. Joshi & Co rate question — it's above your discretionary limit. I'm pre-approving a concession of +15 bps (so you can go down to MCLR + 1.70%). Use it wisely — this is relationship preservation, not precedent.

See you at standup.

VJ`,
          sentAt: ist('2026-05-08T00:58:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'manager_instruction', sentiment: 'positive',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'vikram.joshi@idfcfirstbank.com', toName: 'Vikram Joshi',
          subject: "Re: Stack alignment — noted on NDA and Joshi concession",
          bodyText: `Vikram,

Noted on both — NDA template pulled, will get signed before leaving Goyal site. And confirmed on the Joshi concession ceiling.

Will update you post-standup.

P`,
          sentAt: ist('2026-05-08T01:15:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'acknowledgement',
        },
      ],
    },

    {
      thread: {
        subject: 'May OKRs — mid-month check · 3-liner needed',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'manager', startedAt: ist('2026-05-05T10:30:00Z'),
        lastActivity: ist('2026-05-05T12:00:00Z'),
        status: 'CLOSED', priority: 'NORMAL',
        aiClassification: 'performance_review', sentimentScore: 50, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'vikram.joshi@idfcfirstbank.com', fromName: 'Vikram Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'May OKRs — mid-month check',
          bodyText: `Priya,

How are we tracking against May OKRs before I prep the cluster report? Quick 3-liner:
1. Pipeline value vs target
2. NPA resolution status
3. Cross-sell conversions

VJ`,
          sentAt: ist('2026-05-05T10:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'vikram.joshi@idfcfirstbank.com', toName: 'Vikram Joshi',
          subject: 'Re: May OKRs — on track for 85%+',
          bodyText: `Vikram,

Quick update:

1. Pipeline: ₹8.4 Cr active, ₹3.2 Cr verbal commit stage, ₹12 Cr CLOSED (Sharma Industries — WIN). On track vs ₹18 Cr monthly target.

2. NPA: Kapoor KYC SLA — proactive reassign to Amit, breach prevented. Mehra EDD closing 12 May, no breach expected.

3. Cross-sell: Iyer family RD (₹38L) conversion call today 16:00. Nair/Desai FX opportunity active — booking in progress.

Overall: 85%+ OKR achievement likely. Mehta sanction outcome (today 09:30) could push it to 95%+.

P`,
          sentAt: ist('2026-05-05T12:00:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'okr_update',
        },
      ],
    },

    {
      thread: {
        subject: 'Credit note — Mehta Group ₹3.2 Cr · conditions attached',
        customerId: C.mehta, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-07T11:30:00Z'),
        lastActivity: ist('2026-05-07T12:15:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'credit_approval', sentimentScore: 30, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'credit.mumbai@idfcfirstbank.com', fromName: 'Credit Team — Mumbai',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Credit note — Mehta Group ₹3.2 Cr · conditions for tomorrow\'s call',
          bodyText: `Dear Priya,

The Mehta Group credit note is ready for your 09:30 call tomorrow. Key conditions:

1. RATE FLOOR: 10.25%. We cannot go below 10.07% even with concession — cost of funds constraint. If customer pushes below this, escalate to ZCH before committing.

2. PREPAYMENT WAIVER: Approved for first 3 years only (customer requested Aug 14). After year 3, standard 2% prepayment penalty applies.

3. CROSS-SELL MANDATORY: Trade finance sub-limit ₹80L must be part of the package — this is a condition from Risk, not optional.

4. VALIDITY: Term sheet valid until 11 May 2026.

Please do not communicate any rate below 10.07% without further escalation.

Credit Team, Mumbai`,
          sentAt: ist('2026-05-07T11:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'credit_conditions',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'credit.mumbai@idfcfirstbank.com', toName: 'Credit Team — Mumbai',
          subject: 'Re: Mehta credit note — understood, will lead with waiver',
          bodyText: `Team,

Understood on all four points. Strategy for tomorrow:
• Lead with rate lock at 10.25% (do not open at higher — customer knows market rate)
• Offer prepayment waiver as relationship sweetener (customer asked for this Aug 14 — they'll remember)
• Trade finance sub-limit — will position as additional headroom, not a condition
• Will not go below 10.07% without calling you first

Will update post-call.

Priya`,
          sentAt: ist('2026-05-07T12:15:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'acknowledgement',
        },
      ],
    },

    {
      thread: {
        subject: 'EDD Mehra Logistics — source of funds still pending',
        customerId: C.mehra, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-02T03:30:00Z'),
        lastActivity: ist('2026-05-05T05:30:00Z'),
        status: 'OPEN', priority: 'HIGH',
        aiClassification: 'compliance', sentimentScore: -10, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'compliance@idfcfirstbank.com', fromName: 'Compliance Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'EDD Mehra Logistics — documents required by 5 May',
          bodyText: `Dear Priya,

EDD review for Mehra Logistics (Account: ML-2022-0891) is pending the following:

1. Ultimate Beneficial Owner (UBO) declaration — all owners >25% stake
2. Last 2 years audited financial statements (FY24, FY25)
3. Source of funds declaration for international transactions (SWIFT credits >$50K)

Please collect and upload to the Compliance portal by 5 May 2026. Account limit will remain restricted until EDD is cleared.

Compliance Team`,
          sentAt: ist('2026-05-02T03:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'compliance_request',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'compliance@idfcfirstbank.com', toName: 'Compliance Team',
          subject: 'Re: EDD Mehra — requesting from customer today',
          bodyText: `Team, sending request to Mehra today. Will follow up daily until received. P`,
          sentAt: ist('2026-05-02T05:00:00Z'), direction: 'OUTBOUND', generatedBy: 'RM', approved: true,
        },
        {
          fromAddress: 'compliance@idfcfirstbank.com', fromName: 'Compliance Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: EDD Mehra — UBO and financials received, source of funds still pending',
          bodyText: `Priya,

UBO declaration and audited financials (FY24, FY25) received and uploaded — thank you.

Source of funds declaration for international SWIFT credits is still pending. This is the most critical item for RBI compliance — please collect urgently.

Customer has until 12 May before we must file a Suspicious Transaction Report (STR).

Compliance`,
          sentAt: ist('2026-05-05T05:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'compliance_followup',
        },
      ],
    },

    {
      thread: {
        subject: 'Diwali greeting batch — 38 customers · approval by 10:00',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-07T03:30:00Z'),
        lastActivity: ist('2026-05-08T04:15:00Z'),
        status: 'CLOSED', priority: 'NORMAL',
        aiClassification: 'marketing', sentimentScore: 40, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'marketing@idfcfirstbank.com', fromName: 'Marketing Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Diwali greeting batch — 38 customers · your approval needed by 10:00',
          bodyText: `Dear Priya,

AI has generated personalised Diwali greetings for your 38 Priority and Wealth customers. Batch is ready for your review at 09:15.

Summary:
• 38 emails total (28 English, 8 Hindi, 2 Marathi)
• Personalised by: tier, language preference, last interaction topic
• 3 emails flagged for your personal review before sending: Mehta Group (Priority A — competitor situation), Iyer family (Wealth — RD maturity sensitivity), Sharma Industries (new facility — opportunity to reinforce relationship)

Approval deadline: 10:00 today. Sending window: 10:15–10:30.

Marketing Team`,
          sentAt: ist('2026-05-07T03:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'marketing_approval',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'marketing@idfcfirstbank.com', toName: 'Marketing Team',
          subject: 'Re: Diwali batch — approved with 3 edits',
          bodyText: `Approved with edits to the 3 flagged emails — comments added in the portal.

Mehta: removed the product mention (too salesy given current rate negotiation).
Iyer: changed tone to family-first, added son's name (Arjun).
Sharma: added congratulations reference to the new facility.

Rest of batch looks great. Send at 10:15.

Priya`,
          sentAt: ist('2026-05-08T04:15:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'marketing_approval',
        },
      ],
    },

    {
      thread: {
        subject: 'NPA Committee pre-read — 4 cases · your call is 11:00',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'manager', startedAt: ist('2026-05-07T14:30:00Z'),
        lastActivity: ist('2026-05-07T14:30:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'internal_meeting', sentimentScore: 20, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'vikram.joshi@idfcfirstbank.com', fromName: 'Vikram Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'NPA Committee pre-read — 4 cases · your call is 11:00 tomorrow',
          bodyText: `Priya,

Attaching pre-read for tomorrow's NPA committee. 4 cases from your book:

1. Kapoor Group — Recommend: HOLD (KYC breach being remediated, no underlying credit risk)
2. Verma Capital — Recommend: RESTRUCTURE (80-month repayment extension, rate step-down)
3. Singh Trading — Recommend: WATCHLIST (seasonal stress, recovery expected Q2)
4. Anand Group — Recommend: PROVISION 25% (missing 3 payments, no contact in 45 days)

Your call is 11:00, Room 4B at Head Office, BKC. Be prepared to defend the Kapoor "Hold" recommendation — there may be pushback from Risk who wants to classify it.

Our avatars are attending Standup (09:00) and Credit (09:30) simultaneously. Debrief at 11:45.

VJ`,
          sentAt: ist('2026-05-07T14:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'meeting_prep',
          attachments: [{ name: 'NPA_Committee_PreRead_8May.pdf', size: '1.8 MB' }],
        },
      ],
    },

    {
      thread: {
        subject: 'Salesforce CRM login issue — 403 error',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'rm', startedAt: ist('2026-05-04T03:30:00Z'),
        lastActivity: ist('2026-05-04T04:00:00Z'),
        status: 'CLOSED', priority: 'LOW',
        aiClassification: 'it_support', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'helpdesk@idfcfirstbank.com', toName: 'IT Helpdesk',
          subject: 'Urgent: Salesforce CRM login issue — 403 error',
          bodyText: `Hi,

Unable to access Salesforce since yesterday afternoon — getting a 403 Forbidden error. My deals pipeline review is scheduled for 10:00 today and I need access.

Browser: Chrome 124 | Device: MacBook Pro | User: priya.sharma@idfcfirstbank.com

Please resolve urgently.

Priya Sharma, RM Mumbai N`,
          sentAt: ist('2026-05-04T03:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM', approved: true,
        },
        {
          fromAddress: 'helpdesk@idfcfirstbank.com', fromName: 'IT Helpdesk',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Re: Salesforce CRM — resolved (Ticket #HD-82291)',
          bodyText: `Dear Ms. Sharma,

Issue resolved — your Salesforce session token had expired due to the security policy update on 3 May (sessions now expire after 12 hours of inactivity, down from 24 hours).

Reset complete. Please log in fresh. If you see the 403 again within the hour, clear browser cache and cookies.

Ticket #HD-82291 closed.

IT Helpdesk`,
          sentAt: ist('2026-05-04T04:00:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'it_resolution',
        },
      ],
    },

    // ── CAT 4: MEETING INVITES ─────────────────────────────────────────────────

    {
      thread: {
        subject: 'Meeting request: Mehta Group facility discussion · 9 May 09:30',
        customerId: C.mehta, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T12:30:00Z'),
        lastActivity: ist('2026-05-07T12:35:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'meeting_invite', sentimentScore: 20, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'rajesh@mehtagroup.in', fromName: 'Rajesh Mehta',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Meeting request: Mehta Group · ₹3.2 Cr facility · 9 May 09:30',
          bodyText: `Priya,

Sending a formal meeting request for our call tomorrow. Details:

Date: 9 May 2026 (Thursday)
Time: 09:30–10:00 IST
Format: Zoom (link in calendar invite)
Agenda: ₹3.2 Cr facility rate discussion and next steps

My CFO Deepak will join for the last 10 minutes to discuss the drawdown schedule.

Please confirm.

Rajesh`,
          sentAt: ist('2026-05-07T12:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
          classification: 'meeting_invite',
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'rajesh@mehtagroup.in', toName: 'Rajesh Mehta',
          subject: 'Re: Confirmed — 9 May 09:30',
          bodyText: `Rajesh, confirmed — calendar accepted. See you and Deepak tomorrow at 09:30. Priya`,
          sentAt: ist('2026-05-07T12:35:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.98, approved: true, classification: 'meeting_confirmation',
        },
      ],
    },

    {
      thread: {
        subject: 'Mandatory: RBI KYC circular webinar · 10 May 14:00',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-06T04:30:00Z'),
        lastActivity: ist('2026-05-06T04:45:00Z'),
        status: 'CLOSED', priority: 'NORMAL',
        aiClassification: 'training', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'training@idfcfirstbank.com', fromName: 'Learning & Development',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Mandatory: RBI KYC circular webinar · 10 May 14:00',
          bodyText: `Dear Priya,

Mandatory webinar on the revised RBI KYC Master Circular (RBI/2025-26/KYC/88) — 10 May 2026, 14:00–15:30 IST.

Attendance is compulsory for all Relationship Managers. Assessment will follow.

Webinar link: [Teams link — sent separately]
Pre-read: Attached (12 pages — key changes highlighted)

L&D Team`,
          sentAt: ist('2026-05-06T04:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'training',
          attachments: [{ name: 'RBI_KYC_Circular_Summary_2026.pdf', size: '890 KB' }],
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'training@idfcfirstbank.com', toName: 'Learning & Development',
          subject: 'Re: Webinar confirmed — calendar blocked',
          bodyText: `Registered. Calendar blocked 10 May 14:00–15:30. P`,
          sentAt: ist('2026-05-06T04:45:00Z'), direction: 'OUTBOUND', generatedBy: 'AI_AUTO',
          aiConfidence: 0.99, approved: true,
        },
      ],
    },

    {
      thread: {
        subject: 'Q4 cluster presentation slot confirmed — 15 May 15:00',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'manager', startedAt: ist('2026-05-07T05:30:00Z'),
        lastActivity: ist('2026-05-07T05:30:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'presentation', sentimentScore: 30, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'vikram.joshi@idfcfirstbank.com', fromName: 'Vikram Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Q4 cluster presentation — your slot: 15 May 15:00',
          bodyText: `Priya,

Your slot for the Q4 cluster presentation is confirmed: 15 May, 15:00–15:30 IST.

Audience: Regional Head + CFO (both will be there in person).

Suggested structure:
• 3 min: Q4 wins (lead with Sharma deal ₹12 Cr, Mehta progress)
• 8 min: Pipeline + May OKR tracking
• 4 min: One risk item (Kapoor — frame proactively)
• 5 min: Q1 FY27 outlook and ask

Lead with numbers. Keep slides to 5 max.

VJ`,
          sentAt: ist('2026-05-07T05:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'presentation_brief',
        },
      ],
    },

    // ── CAT 5: SYSTEM / BANK ALERTS ───────────────────────────────────────────

    {
      thread: {
        subject: 'ALERT: Large value credit — Sharma Industries ₹12 Cr',
        customerId: C.sharma, rmId: RM_ID,
        initiatedBy: 'system', startedAt: ist('2026-05-05T05:25:00Z'),
        lastActivity: ist('2026-05-05T05:25:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'system_alert', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'cbs-alerts@idfcfirstbank.com', fromName: 'Core Banking System',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'AUTOMATED ALERT: Large value credit — Sharma Industries ₹12 Cr',
          bodyText: `AUTOMATED ALERT — Core Banking System

Transaction Type: CREDIT — FACILITY DISBURSEMENT
Account: #ACC-SI-2026-004
Customer: Sharma Industries
Amount: ₹12,00,00,000 (₹12 Cr)
Timestamp: 5 May 2026, 10:55:12 IST
Reference: CBS-2026-05-0512
RM: Priya Sharma (IDFC-44219)

If this transaction was NOT expected or authorised, contact Operations immediately on 1800-XXX-XXXX.

This is an automated notification. Do not reply to this email.`,
          sentAt: ist('2026-05-05T05:25:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'system_alert',
        },
      ],
    },

    {
      thread: {
        subject: 'Compliance: FATF country list updated — portfolio review required',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-06T06:30:00Z'),
        lastActivity: ist('2026-05-07T03:30:00Z'),
        status: 'CLOSED', priority: 'NORMAL',
        aiClassification: 'compliance', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'compliance@idfcfirstbank.com', fromName: 'Compliance Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Action required: FATF high-risk country list updated — portfolio review by 30 May',
          bodyText: `Dear All RMs,

RBI has updated the FATF high-risk and non-cooperative jurisdictions list effective 1 June 2026. Two countries newly added: Country A, Country B.

Action required: Review your portfolio for any counterparty, beneficial owner, or correspondent bank exposure to newly listed countries. File a disclosure form (attached) by 30 May if applicable.

Compliance Team`,
          sentAt: ist('2026-05-06T06:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'compliance_circular',
          attachments: [{ name: 'FATF_Disclosure_Form_2026.pdf', size: '120 KB' }],
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'compliance@idfcfirstbank.com', toName: 'Compliance Team',
          subject: 'Re: FATF review — no exposure in my portfolio',
          bodyText: `Team,

Reviewed my portfolio of 47 customers. No direct or indirect exposure to newly listed FATF jurisdictions. Desai Exports ships to US/EU only. No other international counterparties.

No disclosure filing required.

Priya`,
          sentAt: ist('2026-05-07T03:30:00Z'), direction: 'OUTBOUND', generatedBy: 'RM',
          approved: true, classification: 'compliance_response',
        },
      ],
    },

    {
      thread: {
        subject: 'Expense report due — Pune trip 5-6 May · ₹14,820',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-07T03:30:00Z'),
        lastActivity: ist('2026-05-07T03:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'expense', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'finance@idfcfirstbank.com', fromName: 'Finance Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Expense report due: Pune trip 5-6 May · ₹14,820 · submit by 10 May',
          bodyText: `Dear Priya,

Your Pune trip (5-6 May 2026) expense report is due by 10 May.

Our system shows 12 receipts uploaded via the mobile app:
• Cab (Mumbai-Pune-Mumbai): ₹4,200
• Hotel (Marriott Pune, 1 night): ₹7,800
• Meals: ₹1,840
• Misc (parking, tips): ₹980
Total: ₹14,820

All receipts matched to calendar entries. Zero policy violations. Click below to review and submit (one tap).

Finance Team`,
          sentAt: ist('2026-05-07T03:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'expense_reminder',
        },
      ],
    },

    {
      thread: {
        subject: 'FY2026 performance review — self-assessment due 20 May',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-05T03:30:00Z'),
        lastActivity: ist('2026-05-05T03:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'hr', sentimentScore: 0, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'hr@idfcfirstbank.com', fromName: 'HR Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'FY2026 performance review — self-assessment due 20 May',
          bodyText: `Dear Priya,

The FY2026 performance review cycle opens today. Please complete your self-assessment by 20 May 2026.

Key sections:
1. OKR achievement vs target (auto-populated from Salesforce — review and comment)
2. Customer NPS feedback (your score: +58 — top quartile)
3. Learning & development goals achieved
4. Next year OKR proposals

Portal: [HR portal link]

HR Team`,
          sentAt: ist('2026-05-05T03:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'hr',
        },
      ],
    },

    // ── CAT 6: NEWSLETTERS / CIRCULARS ────────────────────────────────────────

    {
      thread: {
        subject: 'RBI holds repo at 6.25% — implications for your portfolio',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-07T08:30:00Z'),
        lastActivity: ist('2026-05-07T08:30:00Z'),
        status: 'CLOSED', priority: 'NORMAL',
        aiClassification: 'market_update', sentimentScore: 30, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'research@idfcfirstbank.com', fromName: 'Research & Strategy',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'RBI MPC: Repo held at 6.25% · implications for lending portfolio',
          bodyText: `RBI MPC DECISION — 8 May 2026

Repo rate: HELD at 6.25% (4th consecutive hold)
Stance: Withdrawal of accommodation

Key implications for your RM portfolio:

1. MCLR STABLE — no immediate repricing of floating rate loans. Use this in conversations with customers worried about rate hikes.

2. FD RATES STABLE — Iyer family RD renewal pitch at 7.20% remains compelling vs alternatives.

3. SENTIMENT — RBI language suggests 50% probability of cut in August MPC. Position longer-tenor FDs now.

4. WORKING CAPITAL — customers like Joshi & Co on floating rates get relief. Lead with stability in rate conversations.

Research & Strategy`,
          sentAt: ist('2026-05-07T08:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'market_update',
        },
      ],
    },

    {
      thread: {
        subject: 'New product: SME Growth Loan — ₹50L to ₹5 Cr, 48hr sanction',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-05T05:30:00Z'),
        lastActivity: ist('2026-05-05T05:30:00Z'),
        status: 'OPEN', priority: 'NORMAL',
        aiClassification: 'product_update', sentimentScore: 20, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'products@idfcfirstbank.com', fromName: 'Products Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'New: SME Growth Loan — ₹50L to ₹5 Cr · 48hr in-principle sanction',
          bodyText: `Dear RM Team,

Launching 1 June 2026: SME Growth Loan

Key features:
• Amount: ₹50L – ₹5 Cr
• In-principle sanction: 48 hours
• Combined equipment + working capital in one facility
• No collateral required up to ₹1 Cr (CGTSME guaranteed)
• Rate: MCLR + 1.80% to MCLR + 2.50% based on score

RELEVANT FOR YOUR PORTFOLIO:
• Mehra Logistics — trade limit enhancement candidate
• Singh Trading — Delhi subsidiary working capital
• Verma Capital — business expansion (post dispute resolution)

Product deck and objection-handler attached.

Products Team`,
          sentAt: ist('2026-05-05T05:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'product_update',
          attachments: [{ name: 'SME_Growth_Loan_RM_Deck.pdf', size: '1.2 MB' }],
        },
      ],
    },

    {
      thread: {
        subject: 'Competitor intel: HDFC Commercial aggressive in Mumbai N this quarter',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'manager', startedAt: ist('2026-05-06T13:30:00Z'),
        lastActivity: ist('2026-05-06T13:30:00Z'),
        status: 'CLOSED', priority: 'HIGH',
        aiClassification: 'competitor_intel', sentimentScore: -10, competitorFlag: true,
      },
      emails: [
        {
          fromAddress: 'vikram.joshi@idfcfirstbank.com', fromName: 'Vikram Joshi',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Heads up: HDFC Commercial running aggressive rate campaign in Mumbai N',
          bodyText: `Team,

FYI — HDFC Commercial Banking is running an aggressive rate campaign in Mumbai N this quarter. I've confirmed 3 approaches to our cluster customers (including at least one in your book, Priya — I expect that's the Mehta situation).

Their playbook: 10-15 bps rate cut + LC fee waivers + faster TAT promises.

Our counter-playbook:
1. Lead with relationship value and RM accessibility (not just rate)
2. AI Workspace differentiators — overnight actions, prep packs, sentiment monitoring — things HDFC cannot match today
3. Speed: our TAT on renewals and LCs is already faster than theirs
4. Don't open with rate matching — make them work for it

Priya — Mehta is the priority. Whatever you need from me for the 09:30 call, text me tonight.

VJ`,
          sentAt: ist('2026-05-06T13:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'competitor_intel',
        },
      ],
    },

    {
      thread: {
        subject: 'AI Workspace v2.4 released — new features for your workflow',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-06T04:30:00Z'),
        lastActivity: ist('2026-05-06T04:30:00Z'),
        status: 'CLOSED', priority: 'LOW',
        aiClassification: 'product_update', sentimentScore: 30, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'workspace@idfcfirstbank.com', fromName: 'AI Workspace Team',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'AI Workspace v2.4 — new features released today',
          bodyText: `Dear Priya,

AI Workspace v2.4 is live as of this morning. New features:

1. Sentiment trend graph — 14-day customer sentiment sparklines on Customer 360
2. FX rate auto-alert — WhatsApp trigger when customer's preferred rate band is hit
3. NPA committee pre-read auto-summariser — 12-page brief → 3 bullet points in 4 seconds
4. Overnight action audit trail — full agent run log now visible in Auto-actions screen

Known issues: Dashboard load time +0.3s on first login (cache warm-up). Fix in v2.4.1 next week.

Full release notes: [link]

AI Workspace Team`,
          sentAt: ist('2026-05-06T04:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'product_update',
        },
      ],
    },

    {
      thread: {
        subject: 'Weekly FX update: USD/INR range 83.8–84.3 · action alert',
        customerId: null, rmId: RM_ID,
        initiatedBy: 'internal', startedAt: ist('2026-05-05T02:30:00Z'),
        lastActivity: ist('2026-05-05T02:30:00Z'),
        status: 'CLOSED', priority: 'LOW',
        aiClassification: 'market_update', sentimentScore: 10, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'treasury@idfcfirstbank.com', fromName: 'Treasury Research',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Weekly FX: USD/INR 83.8–84.3 · next week outlook: up to 84.5',
          bodyText: `Weekly FX Research — Week of 5 May 2026

USD/INR: Traded 83.8–84.3 this week. RBI intervention capped upside at 84.3 on Wednesday.

Next week outlook: US CPI (Thursday) may push toward 84.5 if hotter than expected. Watch for RBI open market ops.

ACTION FOR RMs: Alert export customers with open USD exposure above $50K to consider booking forwards this week. Window may tighten after Thursday CPI print.

Relevant for your book: Desai Exports ($120K open), Mehra Logistics ($45K open).

Treasury Research`,
          sentAt: ist('2026-05-05T02:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER',
          approved: true, classification: 'market_update',
        },
      ],
    },

    {
      thread: {
        subject: 'Q4 FY26 portfolio report commentary — Sharma Industries mention request',
        customerId: C.sharma, rmId: RM_ID,
        initiatedBy: 'customer', startedAt: ist('2026-05-07T04:30:00Z'),
        lastActivity: ist('2026-05-07T06:00:00Z'),
        status: 'CLOSED', priority: 'LOW',
        aiClassification: 'relationship_maintenance', sentimentScore: 40, competitorFlag: false,
      },
      emails: [
        {
          fromAddress: 'chairman@sharmaindustries.com', fromName: 'Suresh Sharma',
          toAddress: 'priya.sharma@idfcfirstbank.com', toName: 'Priya Sharma',
          subject: 'Q4 portfolio report — could you mention the Sharma deal?',
          bodyText: `Dear Priya,

Vikram mentioned you're preparing the Q4 cluster report. We'd appreciate a 2-line mention of the Sharma Industries deal in the wins section — helpful for our relationship with IDFC FIRST senior management.

Please let me know if you need any data points from our side.

Suresh`,
          sentAt: ist('2026-05-07T04:30:00Z'), direction: 'INBOUND', generatedBy: 'CUSTOMER', approved: true,
        },
        {
          fromAddress: 'priya.sharma@idfcfirstbank.com', fromName: 'Priya Sharma',
          toAddress: 'chairman@sharmaindustries.com', toName: 'Suresh Sharma',
          subject: 'Re: Q4 report — Sharma Industries is the headline win',
          bodyText: `Dear Mr. Sharma,

Absolutely — the Sharma Industries ₹12 Cr sanction is the headline win for Q4 and will feature prominently. I'll send you the draft paragraph for your review before publishing.

Priya`,
          sentAt: ist('2026-05-07T06:00:00Z'), direction: 'OUTBOUND', generatedBy: 'RM', approved: true,
        },
      ],
    },

  ]

  // ─── CREATE ALL THREADS ──────────────────────────────────────────────────────
  let threadCount = 0
  let emailCount = 0

  for (const { thread, emails } of threads) {
    const created = await prisma.emailThread.create({
      data: {
        ...thread,
        emails: {
          create: emails,
        },
      },
    })
    threadCount++
    emailCount += emails.length
    console.log(`  ✉  Thread ${threadCount}: "${created.subject.slice(0, 60)}…" (${emails.length} emails)`)
  }

  // ─── CALENDAR EVENTS ────────────────────────────────────────────────────────
  console.log('\n📅 Creating calendar events…')

  const calendarEvents = [
    // Monday 5 May
    { rmId: RM_ID, title: 'Cluster standup · Vikram Joshi', eventType: 'STANDUP', startAt: ist('2026-05-05T03:15:00Z'), endAt: ist('2026-05-05T03:30:00Z'), location: 'Branch war room — Andheri West', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Sharma Industries — ₹12 Cr facility signing ceremony', eventType: 'CUSTOMER_CALL', customerId: C.sharma, startAt: ist('2026-05-05T04:30:00Z'), endAt: ist('2026-05-05T06:00:00Z'), location: 'IDFC FIRST Bank — Andheri West branch', status: 'CONFIRMED', attendees: [{ name: 'Suresh Sharma', role: 'Chairman' }, { name: 'Ankit Jain', role: 'CFO' }] },
    { rmId: RM_ID, title: 'Credit committee — Sharma facility final approval', eventType: 'INTERNAL_MEETING', startAt: ist('2026-05-05T08:30:00Z'), endAt: ist('2026-05-05T09:00:00Z'), location: 'Video call', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Portfolio self-review — weekly', eventType: 'REVIEW', startAt: ist('2026-05-05T10:30:00Z'), endAt: ist('2026-05-05T11:00:00Z'), status: 'CONFIRMED', aiGenerated: true },

    // Tuesday 6 May
    { rmId: RM_ID, title: 'Cluster standup · Vikram Joshi', eventType: 'STANDUP', startAt: ist('2026-05-06T03:15:00Z'), endAt: ist('2026-05-06T03:30:00Z'), location: 'Branch war room', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Mehra Logistics — EDD document collection call', eventType: 'CUSTOMER_CALL', customerId: C.mehra, startAt: ist('2026-05-06T04:30:00Z'), endAt: ist('2026-05-06T05:30:00Z'), location: 'Phone call', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Pune site visit — Verma Capital', eventType: 'SITE_VISIT', customerId: C.verma, startAt: ist('2026-05-06T08:30:00Z'), endAt: ist('2026-05-06T09:30:00Z'), location: 'Verma Capital HQ — Koregaon Park, Pune', description: 'Relationship visit + expansion discussion', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Travel — Pune return', eventType: 'PERSONAL', startAt: ist('2026-05-06T10:30:00Z'), endAt: ist('2026-05-06T12:00:00Z'), status: 'CONFIRMED' },

    // Wednesday 8 May — DEMO DAY
    { rmId: RM_ID, title: 'Morning briefing review — AI daily brief', eventType: 'REVIEW', startAt: ist('2026-05-08T01:00:00Z'), endAt: ist('2026-05-08T01:15:00Z'), description: 'Review AI-generated morning briefing, approve overnight actions', status: 'CONFIRMED', aiGenerated: true },
    { rmId: RM_ID, title: 'Cluster standup · Vikram Joshi', eventType: 'STANDUP', startAt: ist('2026-05-08T03:15:00Z'), endAt: ist('2026-05-08T03:30:00Z'), location: 'Branch war room — Andheri West', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Mehta Group — ₹3.2 Cr facility rate call', eventType: 'CUSTOMER_CALL', customerId: C.mehta, startAt: ist('2026-05-08T04:00:00Z'), endAt: ist('2026-05-08T04:30:00Z'), location: 'Zoom', description: 'Rate discussion, prepayment waiver, counter-HDFC proposal', status: 'CONFIRMED', attendees: [{ name: 'Rajesh Mehta', role: 'Chairman' }, { name: 'Deepak', role: 'CFO' }] },
    { rmId: RM_ID, title: 'NPA Committee — quarterly review · 4 cases', eventType: 'INTERNAL_MEETING', startAt: ist('2026-05-08T05:30:00Z'), endAt: ist('2026-05-08T06:30:00Z'), location: 'Head Office, BKC — Room 4B', description: 'Kapoor Hold, Verma Restructure, Singh Watchlist, Anand Provision', status: 'CONFIRMED' },
    { rmId: RM_ID, title: 'Goyal Pharma — site visit · equipment loan + LC', eventType: 'SITE_VISIT', startAt: ist('2026-05-08T08:30:00Z'), endAt: ist('2026-05-08T09:30:00Z'), location: 'Goyal Pharma plant — Bhiwandi, Thane', description: 'Equipment loan ₹2.5 Cr, export LC, working capital enhancement', status: 'CONFIRMED', attendees: [{ name: 'Anand Goyal', role: 'MD' }, { name: 'Goyal CFO', role: 'CFO' }, { name: 'Plant Head', role: 'Operations' }] },
    { rmId: RM_ID, title: 'Q4 Portfolio review — sign-off · 14 pages', eventType: 'REVIEW', startAt: ist('2026-05-08T09:30:00Z'), endAt: ist('2026-05-08T10:15:00Z'), location: 'Desk', description: 'Review AI-drafted Q4 report — 2 sections need RM judgement', status: 'CONFIRMED', aiGenerated: true },
    { rmId: RM_ID, title: 'Iyer family — wealth advisory call · RD maturity ₹38L', eventType: 'CUSTOMER_CALL', customerId: C.iyer, startAt: ist('2026-05-08T10:30:00Z'), endAt: ist('2026-05-08T11:00:00Z'), location: 'Phone call', description: 'Present 3 options for ₹38L RD maturity proceeds', status: 'CONFIRMED', attendees: [{ name: 'Lakshmi Iyer', role: 'Primary' }, { name: 'Mr. Iyer', role: 'Spouse' }, { name: 'Arjun Iyer', role: 'Son' }] },
  ]

  for (const event of calendarEvents) {
    await prisma.calendarEvent.create({ data: event as any })
  }
  console.log(`  ✅ ${calendarEvents.length} calendar events created`)

  // ─── MEETING INVITES ────────────────────────────────────────────────────────
  console.log('\n📬 Creating meeting invites…')

  const meetingInvites = [
    { rmId: RM_ID, subject: '₹3.2 Cr facility discussion · 9 May 09:30', fromName: 'Rajesh Mehta', fromEmail: 'rajesh@mehtagroup.in', proposedAt: ist('2026-05-09T04:00:00Z'), durationMin: 30, location: 'Zoom', body: 'Formal meeting request for facility rate discussion and next steps. CFO Deepak will join last 10 minutes.', receivedAt: ist('2026-05-07T12:30:00Z'), response: 'ACCEPTED', respondedAt: ist('2026-05-07T12:35:00Z'), priority: 'HIGH', customerId: C.mehta },
    { rmId: RM_ID, subject: 'Weekly 1:1 · Thursday 17:30', fromName: 'Vikram Joshi', fromEmail: 'vikram.joshi@idfcfirstbank.com', proposedAt: ist('2026-05-08T12:00:00Z'), durationMin: 20, location: 'Branch — Cluster Head cabin', body: 'Agenda: (1) Mehta call outcome; (2) Joshi & Co rate decision; (3) Weekly OKR check. VJ', receivedAt: ist('2026-05-05T02:30:00Z'), response: 'ACCEPTED', respondedAt: ist('2026-05-05T02:45:00Z'), priority: 'NORMAL' },
    { rmId: RM_ID, subject: 'Mandatory RBI KYC webinar · 10 May 14:00', fromName: 'Learning & Development', fromEmail: 'training@idfcfirstbank.com', proposedAt: ist('2026-05-10T08:30:00Z'), durationMin: 90, location: 'Microsoft Teams', body: 'Mandatory webinar on RBI KYC Master Circular. Assessment follows. Attendance compulsory for all RMs.', receivedAt: ist('2026-05-06T04:30:00Z'), response: 'ACCEPTED', respondedAt: ist('2026-05-06T04:45:00Z'), priority: 'NORMAL' },
    { rmId: RM_ID, subject: 'Credit committee slot — Goyal Pharma ₹2.5 Cr · 20 May', fromName: 'Credit Team Mumbai', fromEmail: 'credit.mumbai@idfcfirstbank.com', proposedAt: ist('2026-05-20T04:30:00Z'), durationMin: 60, location: 'Head Office BKC — Credit Committee Room', body: 'Following today\'s site visit, submit credit memo by 15 May. Slot confirmed: 20 May 10:00. Template attached.', receivedAt: ist('2026-05-08T02:30:00Z'), response: 'TENTATIVE', priority: 'HIGH' },
    { rmId: RM_ID, subject: 'Q4 cluster presentation · 15 May 15:00 · Regional Head + CFO', fromName: 'Vikram Joshi', fromEmail: 'vikram.joshi@idfcfirstbank.com', proposedAt: ist('2026-05-15T09:30:00Z'), durationMin: 30, location: 'Head Office BKC — Conference Room A', body: 'Your slot: 15 May 15:00–15:30. Audience: Regional Head + CFO. 5 slides max. Lead with numbers.', receivedAt: ist('2026-05-07T05:30:00Z'), response: 'ACCEPTED', respondedAt: ist('2026-05-07T05:40:00Z'), priority: 'HIGH' },
    { rmId: RM_ID, subject: 'Sharma Industries CFO onboarding call · 12 May 11:00', fromName: 'Ankit Jain (CFO)', fromEmail: 'ankit.cfo@sharmaindustries.com', proposedAt: ist('2026-05-12T05:30:00Z'), durationMin: 30, location: 'Phone / Zoom', body: 'Drawdown plan review + Board resolution clarification questions. Suresh Sharma will join briefly.', receivedAt: ist('2026-05-05T06:00:00Z'), response: 'ACCEPTED', respondedAt: ist('2026-05-05T06:15:00Z'), priority: 'NORMAL', customerId: C.sharma },
    { rmId: RM_ID, subject: 'All-RM townhall · 16 May 11:00 · Regional Head address', fromName: 'Vikram Joshi', fromEmail: 'vikram.joshi@idfcfirstbank.com', proposedAt: ist('2026-05-16T05:30:00Z'), durationMin: 90, location: 'Head Office BKC — Main auditorium', body: 'Quarterly townhall. Regional Head + Product team presenting FY27 strategy. Q&A session included.', receivedAt: ist('2026-05-06T06:00:00Z'), response: 'PENDING', priority: 'LOW' },
    { rmId: RM_ID, subject: 'HDFC competitor intel briefing · 9 May 09:00 (DECLINED)', fromName: 'Strategy Team', fromEmail: 'strategy@idfcfirstbank.com', proposedAt: ist('2026-05-09T03:30:00Z'), durationMin: 30, location: 'Video call', body: 'Internal briefing on HDFC Commercial\'s Q1 FY27 strategy and pricing moves. Priya declined — conflict with Mehta call.', receivedAt: ist('2026-05-07T07:00:00Z'), response: 'DECLINED', respondedAt: ist('2026-05-07T07:10:00Z'), priority: 'LOW' },
  ]

  for (const invite of meetingInvites) {
    await prisma.meetingInvite.create({ data: invite as any })
  }
  console.log(`  ✅ ${meetingInvites.length} meeting invites created`)

  console.log(`\n✅ World expansion complete:`)
  console.log(`   📧 ${threadCount} email threads · ${emailCount} individual emails`)
  console.log(`   📅 ${calendarEvents.length} calendar events (Mon–Wed demo week)`)
  console.log(`   📬 ${meetingInvites.length} meeting invites`)
  console.log(`\n   Total emails in Priya's world: existing + ${emailCount} new = rich agent input ready`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
