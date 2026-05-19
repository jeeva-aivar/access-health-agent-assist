# Access Health Agent Assist — Mock Data Reference

Single source of truth for the demo's mock data. Share with the team running the Live Call Assist backend so transcripts, LLM prompts, and KB content stay consistent with what the UI displays.

**Demo scenario:** Inbound patient call about a health insurance claim. Agent (Afsheen Mohammed, Dallas Hub) handles the call. Backend pushes WebSocket events; UI renders transcript, SOP tracker, real-time suggestions, and an Ask Assist panel.

Source files in the repo (do not edit these in isolation — if you change one, mirror the change here):
- `lib/sop-rcm.ts` — Claims SOP definition
- `lib/mock-data.ts` — `MOCK` constant (agent persona, priorities, comms, leaderboard, nav)
- `lib/auto-actions-data.ts` — `COMMS_DATA`, `SYS_DATA` for the auto-actions inbox
- `app/voice-intelligence/page.tsx` — WS event types, KIND_STYLE, active patient strip
- `app/portfolio/page.tsx` — patient/member/provider caseload (18 entries)
- `app/portfolio/[id]/page.tsx` — detail records for Iyer / Garcia / Davis & Park
- `app/priority-stack/page.tsx` — 22 daily tasks
- `app/auto-actions/[id]/page.tsx` — extended detail for 4 auto-actions
- `app/morning-briefing/page.tsx` — 4 signal cards
- `app/consolidated-book/page.tsx` — segment / exposure / cohort aggregates
- `app/meeting-avatar/page.tsx` — 8 meetings for the avatar picker
- `app/ai-agents/*` — 5 agent forms with healthcare defaults
- `components/shared/AppShell.tsx` — notifications + search seed data

---

## 1. WebSocket protocol (UI ⇄ backend contract)

Connection: `wss://<amplify-host>/api/agent/live` (proxied by Next.js to `${CONVOGENT_AGENT_URL}/live`, currently `https://idfc-call-tapping.aivar.app/live`). Auto-reconnect at 3-second intervals.

### Server → Client events

```ts
type ServerEvent =
  | { type: 'call_start';   callSid: string; phone?: string; memberId?: string }
  | { type: 'call_end';     callSid: string }
  | { type: 'partial';      label: 'CUSTOMER' | 'AGENT'; text: string }
  | { type: 'transcript';   label: 'CUSTOMER' | 'AGENT'; text: string; callOffset?: string }
  | { type: 'assist_chunk'; suggestionId: string; chunk: string; stepId?: string }
  | { type: 'assist_done';  suggestionId: string;
                            kind: 'compliance' | 'empathy' | 'belief' | 'buying' | 'general';
                            latencyMs: number; timeToFirstToken: number;
                            inputTokens: number; outputTokens: number;
                            fullText: string; stepId?: string }
  | { type: 'ask_chunk';    askId: string; chunk: string }
  | { type: 'ask_done';     askId: string; fullText: string }
  | { type: 'sop_state';    workflowId?: string;
                            currentStepIndex: number;
                            completedStepIds: string[] }
```

### Client → Server commands

```ts
type ClientCommand =
  | { type: 'ask'; askId: string; question: string }
```

That's the only outbound message. Everything else is server-pushed.

### Notes
- **`phone` on `call_start` is the key UI hydration signal.** When the backend sends it (E.164, e.g. `+12145550188`), the UI looks the customer up in `lib/customers.ts` and populates the entire right-hand pane — member identity, active claim, coverage, history, compliance — automatically. If `phone` is absent, the UI keeps the default customer (Iyer) so the demo still works. If the phone is present but unknown to the roster, the UI shows a yellow banner ("Unknown caller phone — verify manually") and keeps the default. See `lib/customers.ts` for the canonical roster (10 demo members across 3 RCM flows).
- `memberId` on `call_start` is a fallback identifier — useful when the call came in through a portal/IVR path that captured member ID instead of (or in addition to) phone. Today the UI prefers `phone`.
- `stepId` on `assist_chunk` / `assist_done` is optional. If sent, it must be one of the SOP step IDs (`verify`, `status`, `follow_up`, `wrap`). The UI shows a "Step N" chip when present.
- `sop_state` is optional. If the backend doesn't push it, the UI infers step state client-side from transcript text via the `completionCue` regexes (see SOP section below).
- `kind` is the only field that styles the suggestion card (color + label). Mapping: `compliance` → HIPAA alert (red), `empathy` → blue, `belief` → Consent (moss green), `buying` → Escalation (emerald), `general` → Suggestion (neutral celadon).
- Token / latency fields are displayed for transparency but don't gate the UI.

---

## 2. Claims-call SOP — verbatim from `lib/sop-rcm.ts`

This is the contract between the backend prompt and the on-screen step tracker. The LLM prompt at the backend must follow the same 4 phases in order, and either emit `sop_state` events as it advances OR produce text that matches the `completionCue` regexes so the client can infer state.

### Workflow
- **ID:** `claims-call`
- **Name:** `Claims call`
- **Description:** Inbound patient call about a health insurance claim. Verify identity, disclose claim status, give status-specific follow-up, close.

### Step 1 — Verify caller (`id: verify`)
- **Title:** Verify caller
- **Goal:** Capture full name, member ID, and claim ID before disclosing any claim details.
- **Guidance to agent:**
  > Greet the patient. Collect (1) full name, (2) member ID / policy number, (3) claim ID. Do not disclose claim details until all three are captured. Confirm match against the claims system before proceeding.
- **Completion cue (regex):** `\b(claim\s*(id|number|reference|#))\b` — case-insensitive. Mention of the claim ID is the trigger because per the SOP it's the last identifier collected.

### Step 2 — Disclose claim status (`id: status`)
- **Title:** Disclose claim status
- **Goal:** State current status (In progress / Denied / Completed) with a one-line reason from the KB.
- **Guidance:**
  > State the current claim status clearly: In progress, Denied, or Completed. Add a one-sentence reason drawn from the claims system / KB. Do not improvise — escalate if status is ambiguous.
- **Completion cue (regex):**
  ```
  \b(claim\s+(is|status)|status\s+(is|of|update))\b[\s\S]{0,60}
    (in[-\s]progress|denied|completed|approved|settled|under\s+review)
  | \b(in[-\s]progress|denied|completed|approved|settled)\b[\s\S]{0,40}
    (claim|appeal|reimbursement)
  ```

### Step 3 — Status-specific follow-up (`id: follow_up`)
- **Title:** Status-specific follow-up
- **Goal:** Branch on the status from Step 2:
  - **In progress:** timeline, what's pending, notification path
  - **Denied:** primary reason, appeal window, supporting docs
  - **Completed:** settled amount, payment mode, date credited, EOB location
- **Guidance:**
  > Branch on the status from Step 2.
  > • In progress: expected resolution timeline; what is pending (documentation, adjudication, hospital response); how the patient will be notified.
  > • Denied: primary denial reason; appeal deadline; supporting documents that would strengthen an appeal.
  > • Completed: settled amount; payment mode (cashless to hospital / reimbursement to patient); date credited; where to download the EOB / settlement letter.
- **Completion cue (regex):**
  ```
  \b(timeline|expected\s+(by|resolution)|
     pending\s+(review|documentation|adjudication)|
     appeal\s+(window|by|deadline)|
     supporting\s+(docs|documents)|
     settled\s+amount|payment\s+(mode|method)|
     date\s+credited|explanation\s+of\s+benefits|\beob\b|
     settlement\s+letter)\b
  ```

### Step 4 — Wrap-up (`id: wrap`)
- **Title:** Wrap-up
- **Goal:** Confirm question answered, share reference number / next step, close politely.
- **Guidance:**
  > Confirm the patient's question is fully answered. Share a reference number for this call or a next-step link (e.g., document submission portal, callback time). Close per the Access Health closing script.
- **Completion cue (regex):**
  ```
  \b(reference\s+(number|id|#)|anything\s+else|
     callback\s+(time|number)|have\s+a\s+(good|great|nice)|
     thank\s+you\s+for\s+calling|is\s+there\s+anything\s+else)\b
  ```

---

## 3. Personas

### 3.1 Agent (logged-in user)

| Field | Value |
|---|---|
| Name | Afsheen Mohammed |
| Role | RCM Agent · Dallas Hub |
| Initials | JD |
| Employee # | AH-44219 |
| Email | `jane.doe@accesshealthcare.com` |
| Mobile | +1 (555) ••• ••89 |
| Reports to | Michael Reed · Team Lead |
| Caseload | 47 active cases |
| Joined | Mar 2021 (5 yrs 2 mo) |
| Certifications | CRCR · HIPAA · AAHAM CRCS |
| Lifetime cases handled | 1,240 |
| FCR | 62% |
| CSAT | +58 |

### 3.2 Team Lead

| Field | Value |
|---|---|
| Name | Michael Reed |
| Initials | MR |
| Role | Team Lead |
| Email | `michael.reed@accesshealthcare.com` |
| Quote (shown on briefing) | "Iyer first, prior-auth backlog second, Q4 audit prep critical for tomorrow." |
| Alignment indicator | ALIGNED 4/4 · 3 taps to lock |

### 3.3 Leaderboard (rivals/peers)

| Name | Week pts | Month pts | Quarter pts | Notes |
|---|---|---|---|---|
| Anjali Desai | 2840 | 10840 | 32140 | Week #1 |
| Rohit Kulkarni | 2612 | 11240 | 31822 | Month #1 |
| **Afsheen Mohammed (you)** | **2418** | **10982** | **29918** | Week #3, Month #2, Quarter #4 |
| Michael Reed | 2308 | 8980 | 28210 | |
| Neha Iyer | 2140 | 9410 | 30640 | |
| Arjun Verma | 2012 | 8412 | 26080 | |

---

## 4. Caller roster — see `lib/customers.ts` (canonical)

The full demo roster lives in **`lib/customers.ts`** as a typed `CUSTOMERS: Customer[]` array. That file is the single source of truth — this section is just an at-a-glance index.

**10 members keyed by E.164 phone.** When the backend sends `phone` on `call_start`, the UI calls `findByPhone(phone)` and hydrates the entire right-hand pane (Member / Claim / Coverage / History / Compliance) from the matching record. No additional fetch.

| # | Phone (E.164) | Display | Member ID | Name | Flow | Call reason |
|---|---|---|---|---|---|---|
| 1 | `+12145550188` | (214) 555-0188 | ANH-2418-4421 | Vishnu Iyer | `claim_status` | Following up on prior-auth MRI claim (in review) |
| 2 | `+17135550212` | (713) 555-0212 | LPZ-3318-2204 | Jeeva Sharma | `claim_status` | Appeal options for denied claim (code N290) |
| 3 | `+12025550143` | (202) 555-0143 | CHN-7714-0908 | Robert Chen | `claim_status` | EOB explanation request (completed claim) |
| 4 | `+14045550199` | (404) 555-0199 | WIL-6629-1812 | Muthu Krishnan | `eligibility_priorauth` | Confirm MRI prior-auth before tomorrow's appt |
| 5 | `+16175550234` | (617) 555-0234 | OCO-4488-3306 | Jennifer O'Connor | `eligibility_priorauth` | First PCP visit — coverage check |
| 6 | `+12065550167` | (206) 555-0167 | KIM-5512-7720 | David Kim | `billing_refund` | Refund timeline on credit balance |
| 7 | `+13035550155` | (303) 555-0155 | PTL-7723-0011 | Manish Verma | `billing_refund` | Surprise bill — suspected NSA case |
| 8 | `+19155550112` | (915) 555-0112 | HRN-3344-2255 | Luis Hernandez | `eligibility_priorauth` | Schedule cardiology + start PA |
| 9 | `+12015550178` | (201) 555-0178 | WAL-6644-1188 | Maria Walker (family) | `claim_status` | 3 repeat denials (M127 subscriber-ID mismatch) |
| 10 | `+16025550189` | (602) 555-0189 | BRK-9911-4422 | Olivia Brooks | `eligibility_priorauth` | Pre-op OOP projection (hip arthroplasty) |

### Three demo flows in the roster

| Flow | Customers | What the LLM should do |
|---|---|---|
| `claim_status` | 1 (in review), 2 (denied), 3 (completed), 9 (repeated denial pattern) | Standard 4-step SOP. Branch the follow-up on status: timeline for in-progress, appeal options for denied, EOB walkthrough for completed. For Walker (#9), call out the M127 root cause pattern explicitly. |
| `eligibility_priorauth` | 4, 5, 8, 10 | Verify caller → confirm eligibility from 270/271 → state prior-auth status → schedule or inform. For Krishnan (#4) flag urgency (service tomorrow). For Brooks (#10) emphasize Plan G coverage = ~$240 OOP. |
| `billing_refund` | 6 (credit balance), 7 (surprise bill) | Verify caller → look up balance/claim → explain breakdown (Kim: refund timeline; Verma: NSA dispute path). For Verma surface NSA protection — anesthesia OON at in-network facility. |

### Per-customer rich detail

Each `Customer` record includes:

- **Identity:** phone (primary key), member ID, name, DOB, email, city/state, language
- **Plan:** payer, plan name, plan type, group ID, effective date, PCP
- **Eligibility:** 270/271 status, deductible/OOP progress, copay, coinsurance, services requiring prior auth, recent eligibility events
- **Prior auths:** id, procedure, CPT, status (approved/pending/denied/expired), effective + expiry, ordering provider
- **Claims:** id, service date, provider, service type, CPT, billed/allowed/plan-paid/patient-resp, status, denial code + reason + appeal deadline if denied, free-text notes
- **Appointments:** scheduled/completed/no-show/cancelled with provider and type
- **Call history:** prior contact channel + topic + sentiment + outcome + agent
- **Balances:** outstanding AR, optional credit balance for refund flows
- **Free-text notes:** agent-facing context (e.g., "OOP max met — appeal success means plan pays 100%")

### Adding a customer

Append to `CUSTOMERS` in `lib/customers.ts`. Required: unique E.164 `phone`. Everything else has fallbacks but the demo lands better with realistic detail. No code changes elsewhere — the UI hydrates from the record automatically.

## 5. Active call context (what the Live Call Assist screen displays)

When `call_start` fires, the customer strip and SopRail render with these defaults. The transcript area starts empty until `partial` / `transcript` events arrive.

```yaml
customer_strip:
  avatar: "MA"
  name: "Mr. Vishnu Iyer"
  member_id: "ANH-2418-4421"
  payer: "BCBS TX · PPO"
  active_claim: "CLM-9047-2206"
  badges:
    - "Eligibility valid" (green)
    - "Claim under review" (amber)

right_rail_tabs:
  - "Member"     ← patient identity (full name, DOB, member ID, group, plan, PCP)
  - "Claim"      ← active claim CLM-9047-2206 with billed/allowed/paid breakdown
  - "Coverage"   ← BCBS TX PPO Gold benefits (deductible, OOP max, copay, prior auth)
  - "History"    ← last 5 claims (see Iyer claim history above)
  - "Compliance" ← HIPAA verification + recording consent + auto-redaction state

waiting_state_queue:
  - { time: "09:30", customer: "Vishnu Iyer",  type: "Claim status · CLM-9047",   next: true }
  - { time: "11:00", customer: "Jeeva Sharma",       type: "Denied claim · appeal window" }
  - { time: "14:00", customer: "David Kim",         type: "EOB request · prior visit" }
```

---

## 6. Sample auto-actions (auto-actions inbox + detail)

Daily overnight activity the AI has performed or held for review. Items have a `kind` (`SENT`, `REVIEW`, `DONE`, `FLAGGED`, `READY`, `APPROVED`). Used by `/auto-actions` and `/auto-actions/[id]`.

### 6.1 Communications (7 items)

| ID | Time | Title | Badge | Audience |
|---|---|---|---|---|
| c0 | 04:12 | Auto-replied to Baylor Scott & White portal (operative report received) | SENT | Provider |
| c1 | 05:48 | Drafted reply to Sharma · denied claim appeal | **REVIEW** | Member (held for nuance — appeal window question) |
| c2 | 06:02 | Eligibility reminder · Singh, H. — pre-filled refresh (expires 7 days) | SENT | Member |
| c3 | 06:14 | Eligibility reminder · Reyes Group plan (expires 11 days) | SENT | Group |
| c4 | 06:30 | SMS · Vera Carter benefits desk (out-of-office ack, follow-up 10:00) | SENT | Member |
| c5 | 07:15 | Birthday greeting · Robert Chen (personalized email + SMS) | SENT | Member |
| c6 | 08:04 | Follow-up · Davis & Park provider contract (gentle nudge after 72h) | SENT | Provider |

### 6.2 System updates (5 items)

| ID | Time | Title | Badge |
|---|---|---|---|
| s0 | 04:48 | EHR notes synced (Iyer call → Epic) | DONE |
| s1 | 05:14 | Claim status updated · CLM-8902 Sharma — auto-adjudication cleared | DONE |
| s2 | 06:02 | SLA risk · Verma eligibility verification — 48-hr breach predicted | **REVIEW** (suggests reassign to Aaron Kim) |
| s3 | 06:24 | Cross-sell signal · Garcia family — deductible reset, supplemental fit | FLAGGED |
| s4 | 06:48 | T&E ready · Houston site visit ($182.40, 12 receipts) | READY |

---

## 7. Daily priority stack (22 tasks)

Lives in `app/priority-stack/page.tsx`. Each task has `source` (`ai` / `mgr` / `ad`), `tag`, `status`, `value`. AI-priority tasks 01-04 are the demo focus.

### AI priority
| Time | Customer | Title | Tag | Value |
|---|---|---|---|---|
| 09:30 | Iyer, M. | Prior-auth follow-up · CLM-9047 | HIGHEST RISK | $3,420 |
| 11:00 | Denials Committee | Quarterly review · your call | DECISION | — |
| 15:00 | Q4 caseload | Review & sign-off | 90 MIN SAVED | — |
| 16:00 | Garcia family | Benefits walk-through · deductible reset | NBA | 4-wk window |

### Manager-assigned (by Michael Reed)
| Time | Customer | Title |
|---|---|---|
| 08:45 | Hub huddle | Stand-up · brief Michael |
| 10:15 | Baylor Scott & White | Provider records follow-up ($85K) |
| 12:00 | Sharma · denial | Appeal-window draft · sign off |
| 13:30 | Member outreach | Open-enrollment campaign approval |
| 14:30 | Sharma group plan | Onboarding checklist · escalation ($210K) |
| 17:30 | Michael Reed | EOD debrief · 1:1 |

### Routine / planned (AI-sourced)
| Time | Customer | Title | Channel |
|---|---|---|---|
| 07:30 | Inbox triage | Clear overnight queue | Email (DONE) |
| 10:30 | Verma, R. | Eligibility refresh · check-in | Call |
| 11:45 | Vera Carter | Confirm callback window | SMS |
| 12:30 | Iyer, L. | Plan renewal · confirm tier ($418/mo) | Email |
| 14:00 | Singh, H. | Eligibility refresh · call | Call |
| 15:45 | Reyes Group | Cross-sell · supplemental rider ($60/mo) | Call |
| 16:45 | Davis & Park | Provider-rate amendment window ($480K) | Call (TIME-BOXED) |

### Ad-hoc
| Time | Customer | Title | Tag |
|---|---|---|---|
| 09:05 | Robert Gupta | Urgent: claim denied at point-of-care | URGENT (NEW) |
| 10:50 | Anand & Sons | Walk-in · dependent enrollment | WALK-IN |
| 11:20 | Kavita Sheth | EOB dispute · last 3 claims | DISPUTE |
| 13:00 | Internal verification | Verification ref · new member | INTERNAL |
| 15:20 | Compliance | HIPAA audit · Reyes Group log | COMPLIANCE |
| 16:30 | Operations | EFT reconciliation exception ($3,420) | OPS (DONE) |

---

## 8. Morning-briefing signal cards

```yaml
signals:
  - text: "Garcia family · deductible reset 14 May"
    sub:  "High signal moment — supplemental rider window"
    href: /priority-stack
    color: "#d97706"
  - text: "Iyer, M. · prior-auth call at 09:30"
    sub:  "Prep brief ready — review before call"
    href: /voice-intelligence
    color: "#2563eb"
  - text: "Verma, R. · eligibility overdue — SLA risk"
    sub:  "Eligibility refresh needed — breach in 48 hrs"
    href: /auto-actions
    color: "#dc2626"
  - text: "Davis & Park · provider-rate amendment pending"
    sub:  "Contract update needed — close-of-quarter"
    href: /portfolio
    color: "#7c3aed"
```

Overnight stats shown on Briefing & Auto-actions:
- TIER-1 REPLIES SENT: 12
- EHR RECORDS UPDATED: 5
- ELIGIBILITY REMINDERS: 2
- TIME SAVED OVERNIGHT: 1h 48m

---

## 9. Daily-debrief timeline (5 events)

| Time | Headline | Detail | Outcome | Date |
|---|---|---|---|---|
| 09:30 | Iyer call · sentiment swung warm | +18 points; corrected claim filed at 15:48 | WIN | 9 May |
| 10:00 | Sharma group plan · $12K closed | Plan administrator video congratulation in 27 min | WIN | 8 May |
| 11:00 | 3 meetings, 1 you | Avatars debriefed. Zero context lost | MULTIPLIED | 8 May |
| 12:30 | Verma eligibility · breach prevented | Reassigned to Aaron 48 hrs ahead of risk window | SAVED | 7 May |
| 16:00 | Garcia family · benefits walk landed | Supplemental rider signal converted, follow-up Wed | SURFACED | 28 Apr |

---

## 10. Consolidated book (caseload aggregates)

```yaml
segments:
  - { label: "Individual members", value: 38.4, color: "#56BB64" }  # ~$384K
  - { label: "Family plans",       value: 22.1, color: "#52B960" }  # ~$221K
  - { label: "Group plans",        value: 14.2, color: "#86C98F" }  # ~$142K
  - { label: "Providers",          value:  9.5, color: "#B8D8BC" }  # ~$ 95K

exposure:
  - { product: "Active claims",         amount: 28.4 }
  - { product: "Prior auths in flight", amount: 19.2 }
  - { product: "Open enrollments",      amount: 22.1 }
  - { product: "Provider contracts",    amount: 14.2 }
  - { product: "Appeals / disputes",    amount:  0.3 }

revenue_trend_6mo:  # $K/month
  - { month: Dec, revenue: 310 }
  - { month: Jan, revenue: 340 }
  - { month: Feb, revenue: 300 }
  - { month: Mar, revenue: 380 }
  - { month: Apr, revenue: 360 }
  - { month: May, revenue: 410 }

top_movers:
  - { name: "Iyer, M.",       delta: "+8%",  direction: up,   note: "Prior-auth advanced" }
  - { name: "Sharma group plan",  delta: "+12%", direction: up,   note: "Onboarding closed" }
  - { name: "Bose, A.",           delta: "-6%",  direction: down, note: "Denial flagged" }
  - { name: "Carter family",      delta: "-3%",  direction: down, note: "Eligibility stalled — reassign" }
  - { name: "Davis & Park",       delta: "+4%",  direction: up,   note: "Contract amendment signed off" }

kpis:
  total_case_value:  "$842K"
  revenue_book:      "$410K (May run-rate)"
  new_cases_ytd:     "$1.24M"
  in_negotiation:    "$840K"
```

---

## 11. Meeting Avatar — 8 calendar entries

| Time | Title | With | Type | AI Score | Reason |
|---|---|---|---|---|---|
| 08:45 | Hub huddle | Michael Reed | In-person | 38 | Routine standup |
| 09:30 | Prior-auth call · Iyer, M. | Vishnu Iyer | Call | 92 | High-value member call |
| 11:00 | Denials committee | Hub team | In-person | 87 | Decision gate · Verma case |
| 11:00 | Hub standup | Ops team | Google Meet | 44 | Status round (avatar can attend) |
| 14:00 | Quarterly review · Davis & Park | Davis & Park practice | Google Meet | 71 | Provider contract review |
| 15:00 | Q4 caseload sign-off | Internal | Teams | 55 | Doc review |
| 16:00 | Benefits walk-through · Garcia family | Luis Garcia | Call | 88 | Supplemental rider moment |
| 17:30 | EOD debrief · 1:1 | Michael Reed | In-person | 60 | Team Lead 1:1 |

---

## 12. AI Agents — 5 healthcare agents on `/ai-agents`

Each has its own form with defaults. Backend currently does NOT power these — they POST to `/api/agents/invoke` (local Next.js route, stub).

| Slug | Label | Default member | Default action |
|---|---|---|---|
| `pitch-builder` | Benefits Pitch Builder | Garcia family | Supplemental rider cross-sell |
| `meeting-preparer` | Meeting Preparer | Iyer, M. | Benefits walk-through (09:30) |
| `earnings-reviewer` | Denials Reviewer | Iyer + Sharma | Denial code N290, Q2-2026 |
| `model-builder` | Coverage Planner | Garcia family | OOP minimisation, plan year 2026 |
| `memo-maker` | Appeal Drafter | Sharma, S. + CLM-8902-1404 | Formal appeal letter for denial N290 |

Suggestion `kind` color/label remap for healthcare:

| Backend `kind` | UI label | Color |
|---|---|---|
| `compliance` | HIPAA alert | red (`#dc2626`) — status, not brand |
| `empathy` | Empathy | blue (`#3b82f6` family) |
| `belief` | Consent | moss (`#52B960`) |
| `buying` | Escalation | emerald (`#56BB64`) |
| `general` | Suggestion | celadon (`#B8D8BC`) |

---

## 13. Notifications + search seed (chrome)

### Notifications (top-right bell)
1. Supervisor aligned on stack — All 4 priorities locked for the shift (success)
2. SLA risk · Iyer auth — Prior-auth status overdue, review queued (warning)
3. Sentiment swing · Garcia — +18 pts after benefits clarification (info)
4. Verma records received — Medical records auto-attached to case (success)

### Search seed (⌘K)
- Patient: Iyer, M. · Prior-auth pending
- Patient: Garcia family · Eligibility · Cigna
- Patient: Verma, R. · Claim resubmission Q4
- Task: Q4 caseload review · sign-off
- Doc: Eligibility verification SOP v3.1
- Doc: Claims denial appeal pre-read · 12 pages

---

## 14. KB topics the LLM should be able to answer

Inferred from the SOP, member sensitivities, and the Ask Assist prompt placeholder. Backend KB should cover:

- Eligibility verification (270/271 transactions, refresh windows, breach SLAs)
- Plan benefits per payer (BCBS TX PPO Gold benefit table, deductible & OOP-max math)
- Prior-auth status lookup (`PA-77310` style references)
- Denial codes — especially `N290` (missing modifier) and the corresponding correction path
- Appeal windows — state-specific (TX-DOI rule referenced as KB article `AH-APL-002`)
- EOB delivery and re-issue
- Recording consent (IVR-captured at call start)
- HIPAA minimum-necessary boundaries for provider records exchanges
- Escalation paths to Tier-2 supervisor

---

## 15. Demo path the audience follows

When walking a stakeholder through the app, the on-screen order is:

1. `/login` → demo credentials button → OTP step → `/morning-briefing`
2. `/priority-stack` → click Iyer 09:30 task
3. `/voice-intelligence` → live transcript starts → SOP rail advances → Ask Assist round-trip
4. `/portfolio/1` (Iyer detail) → show claim history + AI insight card
5. `/auto-actions` → open `c1` (Sharma held-for-review draft) → show compliance audit trail
6. `/daily-debrief` → wrap with the day's win/save outcomes

Backend should be reachable and producing realistic claims-call transcripts at step 3. If the WS is down, the page degrades gracefully (header shows red dot, no crashes).
