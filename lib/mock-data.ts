// MOCK DATA — Access Health RCM agent workspace
// Data shape preserved from the original RM workspace so page components don't need rewiring.

export const MOCK = {
  rm: {
    name: "Jane Doe",
    role: "RCM Agent · Dallas Hub",
    portfolio: 47,
    initials: "JD",
  },
  manager: {
    name: "Michael Reed",
    role: "Team Lead",
    quote: "Anderson first, prior-auth backlog second, Q4 audit prep critical for tomorrow.",
    aligned: "ALIGNED 4/4 · 3 taps to lock",
  },

  briefingStats: [
    { label: "TIER-1 REPLIES SENT",   value: "12",     sub: "across portals & email" },
    { label: "EHR RECORDS UPDATED",   value: "5",      sub: "auto-synced overnight" },
    { label: "ELIGIBILITY CHECKS",    value: "2",      sub: "pre-filled & dispatched" },
    { label: "TIME SAVED OVERNIGHT",  value: "1h 48m", sub: "vs your weekly baseline" },
  ],

  priorities: [
    {
      n: "01",
      time: "09:30",
      customer: "Anderson, M.",
      headline: "Prior-auth follow-up call",
      context: "Sentiment cooling 12%. Lead with denial code N290, then resubmission path.",
      contextLong: "$3,200 procedure. Prior auth denied (N290). Caller asked about appeal timeline on May 14.",
      why: "HIGHEST RISK",
      whyTone: "danger",
      status: "PREP READY",
      statusTone: "warning",
      prep: { icon: "ClipboardList", label: "Prep pack ready", detail: "Patient 360, denial detail, SOP scripted.", tag: "AUTO-PREPARED ✓" },
      expanded: [
        { k: "Member ID",            v: "ANH-2418-4421" },
        { k: "Payer",                v: "BCBS TX · PPO" },
        { k: "Procedure",            v: "CPT 70553 · MRI brain w/o contrast" },
        { k: "Denial code",          v: "N290 · missing modifier" },
        { k: "Sentiment",            v: "Cooling — 12% (last 14 days)" },
        { k: "Last touch",           v: "14 Apr — appeal timeline query" },
      ],
    },
    {
      n: "02",
      time: "11:00",
      customer: "Denials Committee",
      headline: "your review",
      context: "Score 92. 4 cases on the docket. Avatars dispatched to Coding & Appeals.",
      contextLong: "Score 92. 4 denial cases on the docket. Outcome will set tone for the quarter.",
      why: "DECISION-GRADE",
      whyTone: "info",
      status: "ALIGNED",
      statusTone: "info",
      prep: { icon: "Users", label: "Avatars dispatched", detail: "Coding (48), Appeals (87) — debrief at 11:45.", tag: "AGENT.AI ✓" },
      expanded: [
        { k: "Cases on docket",      v: "4" },
        { k: "Pre-read ready",       v: "12-page brief auto-summarized" },
        { k: "Avatars dispatched",   v: "Coding 09:00 · Appeals 09:30" },
        { k: "Recommended outcome",  v: "Resubmit 2 · Write-off 1 · Hold 1" },
      ],
    },
    {
      n: "03",
      time: "15:00",
      customer: "Q4 caseload review",
      headline: "sign-off",
      context: "Document Intelligence drafted; 2 sections await your judgement.",
      contextLong: "Drafted. 2 sections need judgement. Hub + region figures consolidated.",
      why: "90 MIN SAVED",
      whyTone: "success",
      status: "DRAFTED",
      statusTone: "warning",
      prep: { icon: "FileCheck2", label: "Sources verified", detail: "EHR + Clearinghouse + Compliance.", tag: "DOC INTEL ✓" },
      expanded: [
        { k: "Pages drafted",        v: "14 of 14" },
        { k: "Awaiting judgement",   v: "§4 commentary, §7 risk outlook" },
        { k: "Sources",              v: "EHR · Clearinghouse · Compliance" },
        { k: "Reviewer",             v: "Team Lead — due 16:00" },
      ],
    },
    {
      n: "04",
      time: "16:00",
      customer: "Garcia family",
      headline: "benefits walk-through",
      context: "NBA flagged a high-signal moment. Annual deductible reset — script ready.",
      contextLong: "Conservative tone. Deductible reset — high signal moment.",
      why: "NBA",
      whyTone: "info",
      status: "SURFACED",
      statusTone: "info",
      prep: { icon: "MessageSquareQuote", label: "Script ready", detail: "Tone-tuned for family preference.", tag: "DOC INTEL ✓" },
      expanded: [
        { k: "Plan",                 v: "Family PPO · effective 1 May" },
        { k: "Suggested next step",  v: "Confirm in-network PCP · schedule wellness" },
        { k: "Tone signal",          v: "Family-led decisions, Spanish-preferred" },
        { k: "Last conversation",    v: "28 Apr — pediatric coverage" },
      ],
    },
  ],

  comms: [
    { time: "04:12", title: "Auto-replied to Patel, R.", detail: "Confirmed receipt of medical-records release. Cc'd Compliance.", status: "SENT", tone: "success",
      detailFull: {
        kind: "Email · auto-reply",
        to: "ravi.patel@example.com",
        cc: "compliance@accesshealthcare.com",
        subject: "Re: Records release · CC-22841 · received",
        body: "Dear Mr. Patel,\n\nThanking you for sharing the records release for case CC-22841. I confirm receipt of all 14 attachments. Compliance has been copied for parallel review.\n\nWe will revert with the consolidated determination by Fri 9 May, 17:00 CT.\n\nWarm regards,\nJane Doe\nAccess Healthcare · Dallas Hub",
        meta: [{ k: "Template", v: "Records acknowledgement v3.1" }, { k: "Risk score", v: "Low (0.18)" }, { k: "Tier", v: "1 — fully autonomous" }],
      }
    },
    { time: "05:48", title: "Drafted reply to Joshi & Co.", detail: "Awaiting your nuance — coverage question. Held for 09:15.", status: "REVIEW", tone: "warning", needsAction: true,
      detailFull: {
        kind: "Email · drafted (held for review)",
        to: "amit.joshi@joshi-co.example",
        cc: "—",
        subject: "Re: Out-of-network coverage · Q4 inquiry",
        body: "Dear Mr. Joshi,\n\nThank you for the call yesterday. On the out-of-network coverage question — based on your plan profile, we can confirm:\n\n  • Tier A · 70% allowable\n  • Tier B · 50% allowable (event-linked)\n\n[AI NOTE: this is the standard quote. Recommend manual nuance — the caller hinted at a competitor plan with lower out-of-pocket; consider mentioning the supplemental benefits rider.]\n\nKind regards,\nJane",
        meta: [{ k: "Why held", v: "Coverage query · risk score 0.62 (above tier-1 ceiling)" }, { k: "Suggested edit", v: "Mention supplemental benefits" }, { k: "If approved", v: "Sends within 30 sec" }],
      }
    },
    { time: "06:02", title: "Eligibility reminder · Singh, H.", detail: "Form pre-filled with last year's data. Expires in 7 days.", status: "SENT", tone: "success",
      detailFull: { kind: "SMS + Email · eligibility reminder", to: "harpreet.singh@example.com · +1 (555) ••• ••27", cc: "—", subject: "Annual eligibility refresh · 7 days remaining",
        body: "Hi Harpreet,\n\nQuick reminder — your annual eligibility refresh is due by 15 May. We've pre-filled the form with last year's data; please review and e-sign.\n\nLink: accesshealthcare.com/elig/sign/SG-22841 (valid 7 days)\n\nThanks,\nAccess Healthcare",
        meta: [{ k: "Pre-filled fields", v: "12 of 14" }, { k: "Caller effort", v: "~90 seconds" }, { k: "Channels", v: "SMS + Email" }] }
    },
    { time: "06:14", title: "Eligibility reminder · Mehra Logistics group plan.", detail: "Expires in 11 days. Tier-1 template, low risk.", status: "SENT", tone: "success",
      detailFull: { kind: "Email · eligibility reminder", to: "ops@mehralogistics.example", cc: "—", subject: "Eligibility refresh · 11 days",
        body: "Standard tier-1 template. Pre-filled, low-risk group plan.",
        meta: [{ k: "Risk", v: "Low (0.12)" }, { k: "Template", v: "Tier-1 eligibility v2" }] }
    },
    { time: "06:30", title: "SMS · Verma Capital benefits desk.", detail: "Out-of-office acknowledgement, follow-up scheduled 10:00.", status: "SENT", tone: "success",
      detailFull: { kind: "SMS · auto-acknowledge", to: "+1 (555) ••• ••12", cc: "—", subject: "OOO bounce-back",
        body: "Thanks for your message. Jane is on a member call until 09:30. Your query has been logged — she'll respond by 10:00 CT.",
        meta: [{ k: "Triggered by", v: "OOO calendar block 09:00-09:30" }, { k: "Follow-up scheduled", v: "10:00 CT" }] }
    },
    { time: "07:12", title: "Birthday greeting · Rajesh Mehta.", detail: "Personalized by member tier (Priority).", status: "SENT", tone: "success",
      detailFull: { kind: "Email · greeting", to: "rajesh@example.com", cc: "—", subject: "Wishing you a wonderful birthday, Mr. Mehta",
        body: "Dear Mr. Mehta,\n\nOn behalf of the Access Healthcare family, wishing you a wonderful year ahead — health, joy, and continued success.\n\nWith warm regards,\nJane Doe & team",
        meta: [{ k: "Tier", v: "Priority" }, { k: "Tone", v: "Formal warm" }] }
    },
    { time: "07:45", title: "Plan renewal reminder · Lakshmi Iyer.", detail: "Renewal options pre-filled, dispatched via email.", status: "SENT", tone: "success",
      detailFull: { kind: "Email · plan renewal", to: "lakshmi.iyer@example.com", cc: "—", subject: "Your plan renews 22 May · options inside",
        body: "Dear Mrs. Iyer,\n\nYour plan #PL-44219 renews on 22 May 2026. Options:\n  • Bronze · $245/mo\n  • Silver · $312/mo\n  • Gold   · $418/mo\n\nReply YES + tier to lock today's premium.",
        meta: [{ k: "Renewal premium", v: "from $245/mo" }, { k: "Today's best tier", v: "Silver" }] }
    },
    { time: "03:22", title: "Auto-replied to Goyal Pharma.", detail: "Site visit confirmation sent, calendar block created.", status: "SENT", tone: "success",
      detailFull: { kind: "Email · auto-reply", to: "anand.goyal@goyalpharma.example", cc: "—", subject: "Re: Site visit confirmation · 9 May",
        body: "Dear Mr. Goyal,\n\nConfirming Jane's visit on 9 May at 14:00. Calendar invite attached. Please ensure the operations team is available for a 20-min floor walk.\n\nWarm regards,\nJane Doe · Access Healthcare",
        meta: [{ k: "Calendar block", v: "9 May 14:00-15:00" }, { k: "Tier", v: "1 — autonomous" }] }
    },
    { time: "03:45", title: "Wellness greeting batch · 38 members.", detail: "Tier-personalized, queued for 09:15 your review.", status: "REVIEW", tone: "warning", needsAction: true,
      detailFull: { kind: "Email batch · greeting (held for review)", to: "38 members · Priority + Premium tiers", cc: "—", subject: "Wellness greetings · personalized batch",
        body: "Batch of 38 greeting emails personalized by member tier, language preference, and last interaction. Priority members get hand-written style. Premium members get formal English.\n\n[AI NOTE: Held for your review at 09:15. 3 emails flagged for extra care — Mehta, Iyer family, Sharma group.]",
        meta: [{ k: "Total batch", v: "38 emails" }, { k: "Flagged for review", v: "3 (Priority tier)" }, { k: "Languages", v: "English (28), Spanish (8), Tagalog (2)" }] }
    },
    { time: "05:20", title: "Nair Exports · benefit-change alert sent.", detail: "PPO out-of-pocket reset — opportunity window 4hrs.", status: "SENT", tone: "success",
      detailFull: { kind: "SMS · benefits alert", to: "+1 (555) ••• ••43", cc: "—", subject: "Benefits opportunity window — 4hr",
        body: "Good morning. Your annual deductible has reset as of 05:15 — elective procedures are now within your preferred coverage range. Window estimated 4 weeks. Shall I block your specialist consult slot?\n\n— Access Healthcare benefits desk, on behalf of Jane",
        meta: [{ k: "Benefit", v: "Deductible reset" }, { k: "Window estimate", v: "4 weeks" }, { k: "Open balance", v: "$120 copay open" }] }
    },
    { time: "06:55", title: "Anand Sons · enrollment query pre-answered.", detail: "Enrollment checklist pre-filled, SMS sent.", status: "SENT", tone: "success",
      detailFull: { kind: "SMS · query response", to: "+1 (555) ••• ••61", cc: "—", subject: "Dependent enrollment — walk-in today",
        body: "Hello! We received your query about dependent enrollment. I've attached a pre-filled checklist based on the details you provided. When you visit today, please bring:\n1. Government ID (original + copy)\n2. Proof of residence\n3. SSN card\n\nI'll personally attend to you. — Jane",
        meta: [{ k: "Query type", v: "Dependent enrollment" }, { k: "Walk-in time", v: "Today 10:50" }, { k: "Pre-filled fields", v: "7 of 12" }] }
    },
  ],

  systemUpdates: [
    { time: "04:48", title: "EHR notes synced.", detail: "Yesterday's Anderson call notes formatted, tagged & saved.", status: "DONE", tone: "success",
      detailFull: { kind: "EHR update · Epic", to: "Anderson, M. — chart", cc: "—", subject: "Call notes · 8 May 16:30 — sentiment cooling",
        body: "Auto-formatted notes from voice memo (4 min 22 sec).\n\nKey points:\n  • Caller raised appeal timeline question (14 Apr follow-up)\n  • Sentiment cooling — concerns on denial code\n  • Mentioned switching plans\n  • Action: send revised determination by Fri",
        meta: [{ k: "Source", v: "Voice memo · transcribed" }, { k: "Tags applied", v: "prior-auth, appeal, denial-code" }, { k: "Linked to", v: "Case #CC-9912" }] }
    },
    { time: "05:14", title: "Pipeline updated · Sharma group plan.", detail: "Stage moved to \"verbal commit\". Confidence 82%.", status: "DONE", tone: "success",
      detailFull: { kind: "CRM update · pipeline stage", to: "Sharma group plan · Opp #OPP-9904", cc: "—", subject: "Stage: Negotiation → Verbal commit",
        body: "Trigger: caller's email line \"we are good to proceed\" matched verbal-commit pattern with 82% confidence.",
        meta: [{ k: "Stage moved", v: "Negotiation → Verbal commit" }, { k: "Confidence", v: "82%" }, { k: "Plan value", v: "$1.2M annual" }] }
    },
    { time: "06:02", title: "SLA risk · Kapoor eligibility.", detail: "48-hr breach predicted. Suggesting reassignment to Amit.", status: "REVIEW", tone: "warning", needsAction: true,
      detailFull: { kind: "Risk · SLA breach prediction", to: "Kapoor case · eligibility ticket #ELG-3389", cc: "Amit Verma (proposed)", subject: "Predicted SLA breach in 48 hrs · auto-reassign?",
        body: "Ticket has been open 7 days. Caller has not responded to 3 outreach attempts. Standard SLA = 9 days; predicted breach 12 May 14:00.\n\nSuggested action: reassign to Amit Verma (Dallas Hub South, currently 4 open eligibility tickets vs your 11). Amit has historical 1.4× faster close rate on Kapoor-tier accounts.",
        meta: [{ k: "Predicted breach", v: "12 May 14:00 CT" }, { k: "Confidence", v: "0.91" }, { k: "Suggested owner", v: "Amit Verma · Dallas South" }, { k: "If approved", v: "Reassigns + handoff note auto-sent" }] }
    },
    { time: "06:24", title: "Cross-sell signal · Garcia family.", detail: "Plan renewing — supplemental rider fit. NBA prepped.", status: "FLAGGED", tone: "danger", needsAction: true,
      detailFull: { kind: "Next-best-action · supplemental fit", to: "Garcia family · Premium", cc: "—", subject: "Plan renewing 14 May · supplemental fit",
        body: "Plan renewing 14 May. Member profile (family, conservative) maps to Access Premium supplemental rider.\n\nAI prepared a 4-paragraph script tone-tuned for the Garcia family preference (formal Spanish greeting, pediatric coverage context from last conversation).",
        meta: [{ k: "Trigger", v: "Renewal in 5 days" }, { k: "Recommended rider", v: "Access Premium Family" }, { k: "Script ready", v: "Yes — 4 paragraphs, tone-tuned" }, { k: "Expected uplift", v: "+$60/mo + retention" }] }
    },
    { time: "06:48", title: "T&E ready · Houston trip.", detail: "OCR extracted 12 receipts. Submission pre-filled.", status: "READY", tone: "info",
      detailFull: { kind: "Expense submission · ready", to: "Concur · T&E", cc: "—", subject: "Houston trip · 7–8 May · $182.40",
        body: "OCR processed 12 receipts (rideshare, hotel, meals). All matched to calendar entries. Ready for one-click submit.",
        meta: [{ k: "Total", v: "$182.40" }, { k: "Receipts processed", v: "12 of 12" }, { k: "Policy violations", v: "0" }] }
    },
    { time: "03:58", title: "Anderson prep pack assembled.", detail: "Patient 360, denial code rationale, appeal SOP.", status: "DONE", tone: "success",
      detailFull: { kind: "Prep pack · automated assembly", to: "Anderson, M. · Case #CC-9912", cc: "—", subject: "Prep pack ready: 09:30 call",
        body: "Auto-assembled prep pack:\n\n1. Patient 360: BCBS TX PPO, MRI 70553, denied N290 (missing modifier)\n2. Last 3 touches: 8 May call (sentiment cooling), 4 May email (appeal query), 14 Apr timeline request\n3. Competitive intelligence: alternate payer Aetna offers single-step appeal; ours requires 2-step but faster median TAT\n4. Talk-track: open with denial code clarification, pivot to corrected resubmission before caller raises appeal\n5. NBA: once corrected claim accepted, offer claim-status SMS opt-in",
        meta: [{ k: "Sentiment", v: "-12% (cooling)" }, { k: "Denial code", v: "N290" }, { k: "Talk-track confidence", v: "0.88" }] }
    },
    { time: "07:00", title: "Weekly MIS report compiled.", detail: "Caseload $1.2M · 47 members · 3 SLA flags.", status: "READY", tone: "info",
      detailFull: { kind: "MIS · weekly report", to: "michael.reed@accesshealthcare.com", cc: "—", subject: "Weekly MIS · Dallas Hub · Jane Doe · 6-9 May",
        body: "Weekly performance summary:\n\n• Caseload: $1.2M cycle value, 47 members\n• Week wins: Sharma group plan $12K, Anderson appeal advanced\n• Pipeline: $84K in negotiation, $32K in verbal commit\n• SLA: 0 breaches (Kapoor reassigned proactively)\n• Points: 2418 (Rank #3 Dallas Hub)\n\nReady to send on your approval.",
        meta: [{ k: "Coverage", v: "6-9 May 2026" }, { k: "Awaiting approval", v: "Yes — 1-tap send" }] }
    },
  ],

  defaultRules: [
    { id: "tier1-replies",   label: "Send tier-1 replies automatically",         desc: "Routine acknowledgements, OOO bounce-backs, document receipts.", on: true,  threshold: "Risk < 0.30" },
    { id: "kyc-low",         label: "Auto-fire eligibility reminders for low-risk tier", desc: "Pre-filled forms dispatched 7/14/21 days before expiry.",        on: true,  threshold: "Risk < 0.40" },
    { id: "salesforce-sync", label: "Auto-sync call notes to EHR",                desc: "Voice memo → transcript → tagged chart note.",                   on: true,  threshold: "Always" },
    { id: "sla-reassign",    label: "Suggest reassignment for predicted breach",  desc: "Hold for your approval before any reassignment.",                on: true,  threshold: "Confidence > 0.85" },
    { id: "birthday",        label: "Birthday & anniversary greetings",          desc: "Tier-personalized for Priority and Premium members.",            on: true,  threshold: "Always" },
    { id: "fd-renewal",      label: "Plan renewal options",                      desc: "Email + SMS 14 days before renewal.",                            on: true,  threshold: "Always" },
    { id: "pipeline-move",   label: "Move case stage on signal",                 desc: "Verbal-commit pattern, claim accepted, kickoff scheduled.",      on: false, threshold: "Confidence > 0.80" },
    { id: "te-submit",       label: "Auto-submit expense reports",               desc: "After OCR + policy check, no violations.",                       on: false, threshold: "Violations = 0" },
  ],

  debriefStats: [
    { label: "MEMBER TIME",  value: "5h 42m", sub: "of 8h" },
    { label: "AUTO-ACTIONS", value: "142",    sub: "" },
    { label: "SLA BREACHES", value: "0",      sub: "" },
  ],

  debriefTimeline: [
    { time: "09:30", headline: "Anderson call · sentiment swung warm", detail: "+18 points; corrected claim filed at 15:48.",          outcome: "WIN",        tone: "success",   date: "9 May" },
    { time: "10:00", headline: "Sharma group plan · $12K closed",      detail: "Plan administrator video congratulation in 27 min.",   outcome: "WIN",        tone: "success",   date: "8 May" },
    { time: "11:00", headline: "3 meetings, 1 you",                    detail: "Avatars debriefed. Zero context lost.",                outcome: "MULTIPLIED", tone: "gold",      date: "8 May" },
    { time: "12:30", headline: "Patel eligibility · breach prevented",detail: "Reassigned to Aaron 48 hrs ahead of risk window.",      outcome: "SAVED",      tone: "info",      date: "7 May" },
    { time: "16:00", headline: "Garcia family · benefits walk landed", detail: "Supplemental rider signal converted, follow-up Wed.",  outcome: "SURFACED",   tone: "redbright", date: "28 Apr" },
  ],

  leaderboard: {
    week: [
      { rank: 1, name: "Anjali Desai",    streak: "12d", points: 2840, delta: "→",   deltaTone: "secondary" },
      { rank: 2, name: "Rohit Kulkarni",  streak: "9d",  points: 2612, delta: "▲ 1", deltaTone: "success" },
      { rank: 3, name: "Jane Doe · you",  streak: "7d",  points: 2418, delta: "▼ 1", deltaTone: "danger", you: true },
      { rank: 4, name: "Michael Reed",    streak: "5d",  points: 2308, delta: "→",   deltaTone: "secondary" },
      { rank: 5, name: "Neha Iyer",       streak: "3d",  points: 2140, delta: "▲ 2", deltaTone: "success" },
      { rank: 6, name: "Arjun Patel",     streak: "1d",  points: 2012, delta: "▼ 2", deltaTone: "danger" },
    ],
    month: [
      { rank: 1, name: "Rohit Kulkarni",  streak: "23d", points: 11240, delta: "▲ 1", deltaTone: "success" },
      { rank: 2, name: "Jane Doe · you",  streak: "18d", points: 10982, delta: "▲ 2", deltaTone: "success", you: true },
      { rank: 3, name: "Anjali Desai",    streak: "21d", points: 10840, delta: "▼ 2", deltaTone: "danger" },
      { rank: 4, name: "Neha Iyer",       streak: "12d", points: 9410,  delta: "→",   deltaTone: "secondary" },
      { rank: 5, name: "Michael Reed",    streak: "9d",  points: 8980,  delta: "▼ 1", deltaTone: "danger" },
      { rank: 6, name: "Arjun Patel",     streak: "7d",  points: 8412,  delta: "→",   deltaTone: "secondary" },
    ],
    quarter: [
      { rank: 1, name: "Anjali Desai",    streak: "47d", points: 32140, delta: "→",   deltaTone: "secondary" },
      { rank: 2, name: "Rohit Kulkarni",  streak: "42d", points: 31822, delta: "▲ 1", deltaTone: "success" },
      { rank: 3, name: "Neha Iyer",       streak: "38d", points: 30640, delta: "▲ 3", deltaTone: "success" },
      { rank: 4, name: "Jane Doe · you",  streak: "35d", points: 29918, delta: "▼ 1", deltaTone: "danger", you: true },
      { rank: 5, name: "Michael Reed",    streak: "29d", points: 28210, delta: "▼ 2", deltaTone: "danger" },
      { rank: 6, name: "Arjun Patel",     streak: "22d", points: 26080, delta: "▼ 1", deltaTone: "danger" },
    ],
  },

  navItems: [
    { section: "TODAY", items: [
      { id: "briefing",    label: "Morning Briefing", icon: "Sun",        path: "/morning-briefing" },
      { id: "priority",    label: "Priority Stack",   icon: "ListChecks", path: "/priority-stack" },
      { id: "actions",     label: "Auto-actions",     icon: "Sparkles",   path: "/auto-actions" },
      { id: "debrief",     label: "Daily Debrief",    icon: "Moon",       path: "/daily-debrief" },
    ]},
    { section: "CUSTOMERS", items: [
      { id: "portfolio",   label: "Caseload",        icon: "Users",      path: "/portfolio" },
      { id: "book",        label: "All Cases",       icon: "Wallet",     path: "/consolidated-book" },
    ]},
    { section: "PERFORMANCE", items: [
      { id: "leaderboard", label: "Leaderboard",      icon: "Trophy",     path: "/leaderboard" },
    ]},
  ],
}
