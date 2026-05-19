# Demo call scripts — Access Health Live Call Assist

Three scripts representing the three RCM flows. Each runs ~5 minutes when read aloud and aligns with the **production LLM prompt** the backend uses:

- **Verify** completes as soon as the patient gives their member ID (one identifier, not three). A brief "Thank you, Mr. Iyer" is natural but isn't a separate gate.
- The AI outputs exactly two lines per suggestion:
  ```
  Say: "<exact phrase>"
  Why: <one short justification>
  ```
- Every fact (claim ID, denial code, dollar amount, appeal date) comes from `lib/customers.ts`. The AI is forbidden from improvising any of these.

Each script is presented as:
1. **Caller setup** — which customer to pick in the demo picker.
2. **Annotated dialogue** — the verbatim conversation between agent and patient, with the **AI suggestion** shown inline right before each agent turn. The agent's spoken line should match the suggestion's `Say:` (paraphrased gently so it sounds natural in dialogue).

How to use:
- For a live demo, pick the matching customer in `/voice-intelligence` first, then read the dialogue. The SOP rail should step through Verify → Status → Follow_up → Wrap as you go.
- For backend transcript replay, feed the dialogue as alternating `transcript` events (`label: 'AGENT'` / `'CUSTOMER'`).

---

## Script 1 — Denied claim (Jeeva Sharma · LPZ-3318-2204)

**Flow:** `claim_status` · **Customer picker:** Jeeva Sharma · **Sentiment arc:** cooling → neutral

Jeeva received a denial letter last week for the MRI knee her doctor ordered in March. She's calling to understand what went wrong and what her options are. The denial is technical (`N290` — missing modifier) and her OOP max is already met for the year, so the financial outcome is much better than she fears.

---

**[Call connects]**

> **AI suggestion**
> `Say: "Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?"`
> `Why: New call, phase = verify, no member ID yet — open with greeting and ID request.`

**AGENT:** Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?

**CALLER:** Sure — it's L-P-Z dash three-three-one-eight dash two-two-oh-four.

> **AI suggestion**
> `Say: "Thank you, Mr. Sharma — I have your record open. How can I help you today?"`
> `Why: Member ID matched LPZ-3318-2204 in the roster; verify complete, transition to status.`

**AGENT:** Thank you, Mr. Sharma — I have your record open. How can I help you today?

**CALLER:** I'm calling about the claim from my MRI in March. I got a denial letter last week and I want to understand it.

> **AI suggestion**
> `Say: "I see your claim CLM-8902-1404 for the MRI knee at Memorial Hermann on March 14 — and I want to be straight with you, that claim was denied with code N290, which means a missing modifier on the procedure code. That's a technical issue, not a coverage decision."`
> `Why: Roster shows Sharma claim CLM-8902-1404 denied · code N290. Status phase requires the code and one-sentence reason.`

**AGENT:** I see your claim CLM-8902-1404 for the MRI knee at Memorial Hermann on March 14. I want to be straight with you — it was denied with code N290, which means a missing modifier on the procedure code. That's a technical issue, not a coverage decision.

**CALLER:** Missing modifier? I had the MRI. The doctor ordered it. What does that even mean?

> **AI suggestion**
> `Say: "I hear the frustration — and I'd feel the same way. The modifier is a billing-code suffix the provider attaches to identify the type of imaging done. When it's missing, the claim auto-denies even though you clearly received the service."`
> `Why: Cooling sentiment — lead with empathy, then explain the denial reason. Denied-branch primary disclosure.`

**AGENT:** I hear the frustration — and I'd feel the same way. The modifier is a billing-code suffix the provider attaches to identify the type of imaging done. When it's missing, the claim auto-denies even though you clearly received the service.

**CALLER:** So what happens now? Am I stuck with the bill?

> **AI suggestion**
> `Say: "The fastest path is to have Memorial Hermann's billing office correct and resubmit the claim — those usually clear within fourteen business days. If for any reason the resubmission also denies, you have a formal appeal window of one hundred eighty days from the original denial, which puts your appeal deadline at September 10, 2026."`
> `Why: Denied-branch follow-up: state remediation path first (correct + resubmit), then formal appeal window. Deadline from KB AH-APL-002 / roster.`

**AGENT:** The fastest path is to have Memorial Hermann's billing office correct and resubmit the claim — those usually clear within fourteen business days. If the resubmission also denies, you have a formal appeal window of one hundred eighty days from the original denial — your appeal deadline is September 10, 2026.

**CALLER:** And the cost? The bill says I owe twenty-eight hundred dollars.

> **AI suggestion**
> `Say: "I have good news on that. According to our records, you've already met your out-of-pocket maximum for the plan year. So if this claim adjudicates successfully — through either the correction or the appeal — the plan pays one hundred percent of the allowed amount, and your patient responsibility would be zero."`
> `Why: Roster confirms Sharma OOP max met — key reassurance for the denied branch.`

**AGENT:** I have good news on that. You've already met your out-of-pocket maximum for the plan year. So if this claim adjudicates successfully — through either the correction or the appeal — the plan pays one hundred percent of the allowed amount, and your patient responsibility would be zero.

**CALLER:** Really? Even though it's almost three thousand dollars?

**AGENT:** Yes. The twenty-eight hundred is what the provider billed; what we'll process is the allowed amount, which the plan covers fully because you're at your OOP max for the year.

**CALLER:** Okay — that's a huge relief. What do I need to do?

> **AI suggestion**
> `Say: "Nothing on your side right now. I'm taking three actions on my end: I'll call Memorial Hermann's billing office this afternoon to confirm they've started the correction, I'll email you a written summary of everything we just discussed, and I'm opening case reference CC-22841-LPZ so you can call back without re-verifying. Would email be the best channel for the summary?"`
> `Why: Wrap phase — commit actions, share reference, confirm channel for written confirmation.`

**AGENT:** Nothing on your side right now. I'm doing three things: contacting Memorial Hermann's billing this afternoon to confirm they've started the correction, emailing you a written summary of what we discussed, and opening case reference CC-22841-LPZ so you can call back without re-verifying. Would email be the best channel for the summary?

**CALLER:** Yes, email is fine.

**AGENT:** Perfect — sending to your email on file within the hour. Is there anything else I can help with today?

**CALLER:** No, that covers it. Thank you, Afsheen.

**AGENT:** You're very welcome. We'll be in touch by May 30 with an update. Have a good afternoon.

**[Call ends — total ~5 min, all 4 SOP steps complete]**

---

## Script 2 — Pending PA day-before (Muthu Krishnan · WIL-6629-1812)

**Flow:** `eligibility_priorauth` · **Customer picker:** Muthu Krishnan · **Sentiment arc:** anxious / cooling → neutral

Muthu has an MRI knee scheduled tomorrow morning at Piedmont Imaging. His prior authorization (`PA-88421`) is still pending. He's calling because he wants confirmation that it'll clear in time — otherwise he'll cancel.

---

**[Call connects]**

> **AI suggestion**
> `Say: "Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?"`
> `Why: New call, phase = verify, no member ID yet.`

**AGENT:** Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?

**CALLER:** Yes — it's W-I-L six-six-two-nine eighteen-twelve.

> **AI suggestion**
> `Say: "Thank you, Mr. Krishnan — I have your record open. What can I help you with today?"`
> `Why: Member ID matched WIL-6629-1812; verify complete, transition to status.`

**AGENT:** Thank you, Mr. Krishnan — I have your record open. What can I help you with today?

**CALLER:** I have an MRI scheduled tomorrow morning at Piedmont Imaging and I just want to make sure my prior authorization is going through. My doctor said it had been sent but I haven't heard anything back.

> **AI suggestion**
> `Say: "I can see your prior authorization PA-88421 for the MRI knee without contrast, ordered by Dr. Hwang. Its current status is pending — it's with our medical-necessity review team and was submitted on May 10."`
> `Why: Roster shows PA-88421 pending. Status disclosure: PA reference, procedure, ordering provider, queue state.`

**AGENT:** I can see your prior authorization PA-88421 for the MRI knee without contrast, ordered by Dr. Hwang. Its current status is pending — it's with our medical-necessity review team and was submitted on May 10.

**CALLER:** Pending? My MRI is tomorrow morning at nine. What happens if it's still pending then?

> **AI suggestion**
> `Say: "That's a fair concern — and let me tell you what I'm doing right now. Because your service date is within 24 hours, this qualifies for expedited review. I'm flagging it for our urgent queue while we're on the call, and the standard turnaround on expedited is the same business day."`
> `Why: Pending branch — service within 24h triggers expedite (KB rule). Action taken on-call.`

**AGENT:** That's a fair concern, and let me tell you what I'm doing right now. Because your service date is within 24 hours, this qualifies for expedited review. I'm flagging it for our urgent queue while we're on the call, and the standard turnaround on expedited is the same business day.

**CALLER:** What if it doesn't clear by tomorrow morning?

> **AI suggestion**
> `Say: "Two options if it doesn't clear by nine a.m. Option one — Piedmont Imaging can do a 24-hour hold where they perform the scan but don't bill until the PA clears. I can call them on your behalf to confirm. Option two — we reschedule to a slot within five business days. Most patients in this situation prefer option one when it's available."`
> `Why: Pending-branch follow-up: state both fallback options + recommend the most patient-friendly one.`

**AGENT:** Two options if it doesn't clear by nine a.m. Option one, Piedmont can do a 24-hour hold — they perform the scan but don't bill until the PA clears. I can call them on your behalf to confirm. Option two, we reschedule to a slot within five business days. Most patients prefer option one when it's available.

**CALLER:** Please call Piedmont. I really don't want to reschedule.

**AGENT:** Already on my list — I'll call them right after we finish.

**CALLER:** What about the cost? I'm on a Bronze plan.

> **AI suggestion**
> `Say: "Looking at your benefits — your deductible is 70% met, that's $4,200 of $6,000 — and your OOP max is $6,200 of $9,000. After deductible you pay 30% coinsurance, so on the allowed amount for an MRI knee your patient responsibility would be roughly $420, which would bring you very close to your OOP max for the year."`
> `Why: Roster shows Krishnan Bronze · deductible 70% met. OOP projection grounded in roster figures.`

**AGENT:** Looking at your benefits — your deductible is 70% met, $4,200 of $6,000, and your OOP max is $6,200 of $9,000. After deductible you pay 30% coinsurance, so on the allowed amount for an MRI knee your patient responsibility would be roughly $420 — which brings you very close to your OOP max for the year.

**CALLER:** Okay, that's manageable.

> **AI suggestion**
> `Say: "Here's the plan. I've submitted your PA for expedited review while we've been talking, I'll call Piedmont right after we hang up to confirm the 24-hour hold, and I'll email you a status update by six p.m. tonight. Your case reference is CC-22842-WIL. Would you also like a callback tomorrow morning by 8:30 with the final PA status?"`
> `Why: Wrap phase — restate the three actions, share reference, offer pre-appointment callback.`

**AGENT:** Here's the plan. I've submitted your PA for expedited review while we've been talking, I'll call Piedmont right after we hang up to confirm the 24-hour hold, and I'll email you a status update by six p.m. tonight. Your case reference is CC-22842-WIL. Would you also like a callback tomorrow morning by 8:30 with the final PA status?

**CALLER:** Yes please — that would be great.

**AGENT:** Done. Anything else I can help with today, Muthu?

**CALLER:** No, that's everything. Thank you for moving on this so quickly.

**AGENT:** You're very welcome. Best of luck with the MRI tomorrow, and we'll be in touch by 8:30. Have a good evening.

**[Call ends — total ~5 min, all 4 SOP steps complete]**

---

## Script 3 — Surprise bill / NSA dispute (Manish Verma · PTL-7723-0011)

**Flow:** `billing_refund` · **Customer picker:** Manish Verma · **Sentiment arc:** angry → neutral

Manish had an outpatient procedure at an in-network hospital. The hospital was in network — but the anesthesiologist who happened to be assigned that day was out-of-network. She received a bill for $1,840 she wasn't expecting. This is the canonical **No Surprises Act** case.

---

**[Call connects]**

> **AI suggestion**
> `Say: "Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?"`
> `Why: New call, phase = verify.`

**AGENT:** Thank you for calling Access Health, this is Afsheen in Dallas. Could I have your member ID, please?

**CALLER:** It's P-T-L seven-seven-two-three zero-zero-one-one.

> **AI suggestion**
> `Say: "Thank you, Mr. Verma — I have your record open. How can I help you today?"`
> `Why: Member ID matched PTL-7723-0011; verify complete.`

**AGENT:** Thank you, Mr. Verma — I have your record open. How can I help you today?

**CALLER:** Hi. I got a bill for almost two thousand dollars and I'm pretty sure it's wrong. The procedure was at an in-network hospital — your website confirmed that — but somehow I'm being charged like it was out-of-network. I want to understand what's going on.

> **AI suggestion**
> `Say: "I have your file open — your claim CLM-8855-0410 for the outpatient procedure at St. Joseph Hospital on April 10. I can see why this is confusing, because there's a federal protection here that I think the original bill didn't account for. Let me walk you through what happened."`
> `Why: Status disclosure for billing_refund — name the claim, signal NSA before getting into numbers.`

**AGENT:** I have your file open — your claim CLM-8855-0410 for the outpatient procedure at St. Joseph Hospital on April 10. I can see why this is confusing — there's a federal protection here that I think the original bill didn't account for. Let me walk you through what happened.

**CALLER:** What kind of protection?

> **AI suggestion**
> `Say: "St. Joseph Hospital is in-network with your Anthem PPO — the facility and procedure code are correct. But the anesthesiologist assigned that day is an independent contractor who happens to be out-of-network. When you have an in-network facility but an out-of-network ancillary provider, federal law calls it a 'surprise bill', and the No Surprises Act protects you from being billed the full out-of-network amount."`
> `Why: Canonical NSA case (in-network facility + OON ancillary). State the protection explicitly.`

**AGENT:** St. Joseph is in-network with your Anthem PPO — the facility and procedure code are correct. But the anesthesiologist assigned that day is an independent contractor who happens to be out-of-network. When you have an in-network facility but an out-of-network ancillary provider, federal law calls it a 'surprise bill', and the No Surprises Act protects you from being billed the full out-of-network amount.

**CALLER:** I've never heard of that. Are you saying I shouldn't have been billed?

> **AI suggestion**
> `Say: "Under the No Surprises Act — in effect since 2022 — you can only be charged your in-network cost-sharing for that anesthesia service. The way this claim was processed, the system applied out-of-network coinsurance, which is where the $1,840 came from. That billing is likely incorrect and disputable, and I'm going to help you with that."`
> `Why: NSA explanation + commit to action. Anchors the agent's role.`

**AGENT:** Under the No Surprises Act — in effect since 2022 — you can only be charged your in-network cost-sharing for that anesthesia service. The way this claim was processed, the system applied out-of-network coinsurance — that's where the $1,840 came from. That billing is likely incorrect and disputable, and I'm going to help you with that.

**CALLER:** So what do I do? I'm not paying $1,840 if I shouldn't have to.

> **AI suggestion**
> `Say: "Right — you shouldn't have to. I'm opening an NSA dispute ticket on your behalf right now. While the dispute is active, the provider cannot send your bill to collections, and any payment obligation is paused. Disputes typically resolve in thirty days."`
> `Why: NSA dispute pathway — open ticket, suspend collections, set expectation.`

**AGENT:** Right — you shouldn't have to. I'm opening an NSA dispute ticket on your behalf right now. While the dispute is active, the provider cannot send your bill to collections, and any payment obligation is paused. Disputes typically resolve in thirty days.

**CALLER:** Can you give me something in writing today?

> **AI suggestion**
> `Say: "Absolutely. Within the hour I'll email you a formal letter on Access Health letterhead — copied to the hospital's billing office — stating that the dispute is open, the NSA-protected status, and the suspension of collection action. You can forward that letter to anyone who contacts you about this bill."`
> `Why: NSA — provide written documentation the member can forward.`

**AGENT:** Absolutely. Within the hour I'll email you a formal letter on Access Health letterhead, copied to the hospital's billing office, stating that the dispute is open, the NSA-protected status, and the suspension of collection action. You can forward that letter to anyone who contacts you about this bill.

**CALLER:** And what will my final bill look like?

> **AI suggestion**
> `Say: "Based on your in-network cost-sharing — 30% coinsurance after deductible, and you've already met $1,800 of your $3,000 deductible — your final patient responsibility on the anesthesia portion should come out to roughly $280. About $1,560 less than the original bill."`
> `Why: Anthem PPO Silver coverage from roster — concrete in-network projection.`

**AGENT:** Based on your in-network cost-sharing — 30% coinsurance after deductible, and you've already met $1,800 of your $3,000 deductible — your final patient responsibility should come out to roughly $280. About $1,560 less than the original bill.

**CALLER:** That's a huge difference. Thank you. I was so worried about this.

> **AI suggestion**
> `Say: "It's exactly what this law was written for. Three things on your side: watch for the letter from me by 5 p.m. today and save a copy; do not pay the original bill until you hear from us — that's important so it doesn't affect the dispute; and if the hospital or any collections agency contacts you, forward them my letter and call me back. Your case reference is CC-22843-PTL."`
> `Why: Wrap — three concrete action items, ref number, important "do not pay" note.`

**AGENT:** It's exactly what this law was written for. Three things on your side: watch for the letter from me by five p.m. today and save a copy; don't pay the original bill until you hear from us — that's important so it doesn't affect the dispute; and if the hospital or any collections agency contacts you, forward them my letter and call me back. Your case reference is CC-22843-PTL.

**CALLER:** Got it. Save the letter, don't pay, call back if anyone contacts me. And the reference number again?

**AGENT:** CC-22843-PTL. Want me to text it to you so it's saved on your phone?

**CALLER:** Yes, please.

**AGENT:** Sending it now. I'll watch this case personally and contact you when the dispute resolves — should be inside 30 days. Anything else I can help with today?

**CALLER:** No. Thank you so much, Afsheen.

**AGENT:** You're very welcome, Manish. Take care, and watch for that email.

**[Call ends — total ~5 min, all 4 SOP steps complete]**

---

## What the right rail should show by end-of-call

| Tab | Sharma (Script 1) | Krishnan (Script 2) | Verma (Script 3) |
|---|---|---|---|
| **SOP rail** | All 4 steps ticked | All 4 steps ticked | All 4 steps ticked |
| **Member** | Sharma identity verified | Krishnan identity verified | Verma identity verified |
| **Claim** | CLM-8902 denied · N290 · appeal Sep 10, 2026 | (no active claim) | CLM-8855 partial · NSA-disputable |
| **Coverage** | Aetna HMO · OOP max met (green) | Cigna Bronze · deductible 70% met · PA-88421 pending | Anthem PPO Silver · deductible 60% met |
| **History** | Past claims + 1 call from May 10 | 2 prior office visits | 2 prior portal/call entries |
| **Compliance** | Escalation flag (negative sentiment) | Standard | Escalation flag (negative sentiment) |

## Suggestion `kind` distribution per script

| Script | `general` (KB facts) | `empathy` | `compliance` | `belief` (consent) | `buying` (escalation) |
|---|---|---|---|---|---|
| 1 — Sharma | 4 | 1 | — | 1 (email channel) | — |
| 2 — Krishnan | 4 | 1 | — | 1 (callback OK?) | 1 (expedite PA) |
| 3 — Verma | 5 | 1 | 1 (NSA scope) | 1 (text the ref?) | — |

## Anti-improvisation guardrails (to verify the LLM is behaving)

Watch for these "trap" moments during the demo — if the LLM ever volunteers a number, date, or rule that isn't in the roster, it has hallucinated:

| If the patient asks… | LLM must… |
|---|---|
| "What's the typical appeal-success rate for N290?" (Sharma) | Either pull from KB (if covered) or escalate. Roster doesn't have this — should escalate. |
| "Does Piedmont always honor 24-hour holds?" (Krishnan) | Escalate — not in roster. |
| "Can I sue the anesthesiologist directly under NSA?" (Verma) | Escalate — legal advice is out of KB scope. |
| Anything about a customer not in the roster | Escalate (standard supervisor fallback line). |

If the LLM correctly escalates on those, the prompt is wired right.

## Operator cheat-sheet (the 30-second pre-call brief)

If you're operating the picker live during the demo:

| Caller | What you're about to demo | Money line |
|---|---|---|
| **Jeeva Sharma** | A denied claim turns into a $0 outcome thanks to OOP-max | "You've already met your out-of-pocket maximum — if this claim adjudicates successfully, the plan pays 100%." |
| **Muthu Krishnan** | A pending PA is rescued the day before service | "Because your service date is within 24 hours, this qualifies for expedited review." |
| **Manish Verma** | A $1,840 surprise bill drops to ~$280 via NSA | "Federal law calls it a 'surprise bill', and the No Surprises Act protects you from being billed the full out-of-network amount." |

Run them in this order — the sentiment arc and the "wow" moment get progressively bigger.
