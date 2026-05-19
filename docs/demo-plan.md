# Access Health Agent Assist — Demo Plan (v3)

Owner: Jeeva (jeeva.kg@aivar.tech)
Working repo: `/Users/jeevakg/Documents/Work/Access Health demo`
Remote: `https://github.com/jeeva-aivar/access-health-agent-assist.git` (nothing pushed yet)
Branch: `dev`
Reference (READ-ONLY): `demo-idfc-rm-aiw-healthcare-agent-assist/IDFC-call-tapping/IDFC-agent-assist/app/`
Last verified: 2026-05-19

---

## The demo, in one paragraph

Access Healthcare runs Amazon Connect in the US. Agents currently alt-tab to SharePoint to follow SOPs during calls. Aivar's Live Call Assist (this repo's `/voice-intelligence`) listens to the live call via WebSocket, shows a SOP step tracker, surfaces real-time suggestions, and lets the agent type free-form questions answered from a KB. The other team has redeployed the **same backend host** (`idfc-call-tapping.aivar.app`) with a **claims-call SOP**. Our job: refactor the Next.js demo app — strip IDFC content, replace the right-rail tabs and SOP to match claims, rebrand the rest of the app to Access Health/RCM, and prepare the Amplify deploy. After the demo, we discuss Amazon Connect integration (`docs/amazon-connect-integration.md`).

---

## Ground rules (non-negotiable)

1. **No git commit, no push** without explicit per-action approval.
2. **Do not modify** anything under `demo-idfc-rm-aiw-healthcare-agent-assist/` — reference only.
3. **Do not touch** `app/api/auth/[...nextauth]/route.ts` (NextAuth). Session may keep "Priya"; UI reads `MOCK.rm`.
4. **No new AWS resources / Amplify app creation** without approval.
5. No destructive git ops, no `--no-verify`, no force-push, no `git add -A`.
6. Describe each change and wait for confirmation before editing.
7. Never claim done unless verified on disk **and** in the running UI.

---

## Decisions locked in (2026-05-19)

| Decision | Choice |
|---|---|
| SOP scenario | **Claims call** — matches deployed backend prompt |
| Backend host | **Reuse** `https://idfc-call-tapping.aivar.app` (already proxied; out of our scope to modify) |
| WS URL | Client: `${proto}//${host}/api/agent/live`, override `NEXT_PUBLIC_AGENT_WS_URL` |
| Ask Assist panel | Keep — already implemented (line 571 of current page) |
| `/voice-intelligence` strategy | **Refactor in place**, iteratively |
| Color palette | Emerald `#56BB64`, Moss `#52B960`, Celadon `#B8D8BC`, White `#FEFEFE` |
| Demo audience | **External — Access Healthcare stakeholders** (US). Mock data must look US-RCM. |
| Persona | **Jane Doe** (US-tailored, already wired into `/login`). |
| Session persona (NextAuth) | Leave as "Priya" — auth route off-limits. Brief audience that avatar name is mock. |
| Phase 3b CSS var rename | **Skip for demo.** Alias shim is functional; no stakeholder-visible impact. Defer as cosmetic cleanup. |
| Amplify app | **Create new app** for this repo (Phase 5.2). |
| Amplify region | `ap-south-1`, Gen 2 SSR (Web Compute) |
| Branch flow | `dev` → `uat` → `main` (never skip; never push directly to `main`) |
| Replayable transcript | Defer — out of our scope. Backend team owns the deployed endpoint; we wire UI to it and verify with whatever traffic they can drive. |

---

## What's actually on disk today (verified)

### Phase-2 surface (`app/voice-intelligence/page.tsx`, 736 lines, single client component)
**Already working:**
- `useAgentSocket` hook (line 103) — auto-reconnect 3 s, status `connecting|connected|disconnected`.
- Reads `process.env.NEXT_PUBLIC_AGENT_WS_URL`; falls back to `${proto}//${location.host}/api/agent/live`.
- Reducer handles all 8 server events from the contract (`call_start`, `call_end`, `partial`, `transcript`, `assist_chunk`, `assist_done`, `ask_chunk`, `ask_done`).
- 3-panel layout (`1fr 360px / 1fr 260px`):
  - `TranscriptPanel` (line 210) — live transcript + suggestion cards inline.
  - `RightRailPanel` (line 530) — currently shows SOP state + latest suggestion.
  - `AskPanel` (line 571) — Ask Assist input → emits `{type:'ask',askId,question}` over WS.

**Needs change:**
- SOP currently uses appointment-booking workflow (`lib/sop-rcm.ts`). Must switch to claims-call.
- IDFC banking copy throughout (19 hits in this file).
- 5-tab right-rail content (Overview / Holdings / Credit / History / Compliance) is all IDFC. Replace with claims-relevant tabs.
- Suggestion `kind` palette is banking-toned (compliance/empathy/belief/buying/general). Remap labels/colors for healthcare.
- Hard-coded reds and `var(--idfc-red-bright)` accents.

### Proxy / backend config (`next.config.ts`) — already correct
- `/api/agent/:path*` → `${CONVOGENT_AGENT_URL || 'https://idfc-call-tapping.aivar.app'}/:path*`
- `/api/convogent/:path*` → `${CONVOGENT_BE_URL || 'https://idfc-call-tapping.aivar.app'}/api/:path*`
- `/api/avatar/:path*` → `https://avatar.aivar.app/api/:path*`
- Same-origin pattern: browser hits Next.js, Next.js proxies WSS upstream. Keep as-is — only env values change in Amplify.

### Colors (`app/globals.css`, `tailwind.config.ts`)
- Green tokens (`--ah-emerald`, `--ah-moss`, `--ah-celadon`) present. White `#FEFEFE` not yet a token — will add.
- `--idfc-red*` aliased to greens (shim). Variable names still say `idfc-red` everywhere (functional but misleading).

### Sitewide rebrand
- 17 files contain `idfc`; ~20 files contain banking copy (Priya, KYC, NPA, MCLR, sanction, Salesforce, ₹). Full list in Phase 3.

### Git
- Branch `dev`, all files untracked, zero commits, remote configured to `jeeva-aivar/access-health-agent-assist`.

---

## Event contract (canonical — from current page + reference)

**Server → Client:**
```
| { type:'call_start';   callSid:string }
| { type:'call_end';     callSid:string }
| { type:'partial';      label:'CUSTOMER'|'AGENT'; text:string }
| { type:'transcript';   label:'CUSTOMER'|'AGENT'; text:string; callOffset?:string }
| { type:'assist_chunk'; suggestionId:string; chunk:string }
| { type:'assist_done';  suggestionId:string; kind:AlertKind;
                         latencyMs:number; timeToFirstToken:number;
                         inputTokens:number; outputTokens:number; fullText:string }
| { type:'ask_chunk';    askId:string; chunk:string }
| { type:'ask_done';     askId:string; fullText:string }
```
**Client → Server:** `{ type:'ask', askId:string, question:string }` (only outbound message).

**No `sop_state`, no `stepId` from server.** SOP progress is inferred client-side from `turns[]` via `lib/sop-state.ts`.

---

## Phases

### Phase 0 — Plan sign-off (this doc)
Jeeva reviews. No code edits until approved.

---

### Phase 1 — SOP definition: Claims call

**Files:** rename `lib/sop-rcm.ts` → `lib/sop-claims.ts`; tune `lib/sop-state.ts inferSopState` cues.

Workflow (from reference `CALL_SOP.md` + `assist_system.md`):

```
Workflow: "Claims call"
  Step 1  Verify  — collect full name, member ID, claim ID
                    (do NOT disclose claim details until all three captured)
  Step 2  Status  — disclose claim status (In progress / Denied / Completed)
                    + one-line reason from KB
  Step 3  Branch  — status-specific follow-up:
             3a In progress: timeline, what's pending, notification path
             3b Denied:       primary reason, appeal window, supporting docs
             3c Completed:    settled amount, payment mode, date credited, EOB location
  Step 4  Wrap    — confirm question answered, share reference, close
```

Right-rail rendering: show Steps 1, 2, 3 (active sub-branch highlighted contextually based on latest `assist_done` content), 4. `completionCue` regexes per step, tuned against ≥3 canned transcripts.

**Acceptance:** feeding a canned claims transcript through `inferSopState` advances the displayed step correctly at the right transcript turn.

---

### Phase 2 — Refactor `/voice-intelligence` (in place, NOT rewrite)

Current file already has WS plumbing, reducer, 3 panels, Ask Assist. Edits are targeted:

1. **Swap SOP import** — `lib/sop-rcm.ts` → `lib/sop-claims.ts`. `DEFAULT_WORKFLOW` re-exports `CLAIMS_CALL`.
2. **Rebuild `RightRailPanel` (line 530)** — replace the 5 IDFC tabs (Overview/Holdings/Credit/History/Compliance) with claims-relevant tabs:
   - **Member** — name, member ID, plan, group, eligibility-as-of date
   - **Claim** — claim ID, service date, provider, billed/allowed/paid amounts, status pill
   - **History** — prior claims (last 5), each with status + date
   - **Coverage** — plan benefits relevant to current claim type (in-network, deductible met, OOP-max)
   - **Compliance** — HIPAA verification state, recording consent, escalation flag
   Plus the SOP step tracker stays on top of this panel.
3. **Remap suggestion `AlertKind` semantics + colors:**
   | Current | Healthcare | Color |
   |---|---|---|
   | compliance | `compliance` (HIPAA/PHI) | red `#dc2626` (status, not brand) |
   | empathy | `empathy` | celadon |
   | belief | `consent` | moss |
   | buying | `escalation` | emerald |
   | general | `general` | neutral |
   (Keep type name `AlertKind` but update the union; lower risk than renaming the type.)
4. **Strip IDFC content** from `TranscriptPanel` header strip, mic footer strings, customer-card mock content (line ~210 onwards). Use mock claims patient from `lib/mock-data.ts` (rewritten in Phase 3).
5. **Replace brand-red accents** — `var(--idfc-red-bright)` callouts, `#fbf0f2` pill bgs → moss/celadon. Keep `#dc2626` only on the **compliance** suggestion badge and on status-FAIL semantic uses.
6. **TopBar / call-status strip** — copy reads "Access Health · Live Call Assist · {WS status}".

**Acceptance:**
- `next dev` opens `/voice-intelligence`, WS connects to `idfc-call-tapping.aivar.app/live` via the proxy.
- Right rail shows the 5 new tabs + SOP tracker on top.
- Live partials stream into transcript; assist suggestions appear with new kind badges.
- Ask Assist round-trip works.
- `npx tsc --noEmit` clean.

---

### Phase 3 — Sitewide rebrand sweep

Same as v2. Term map and file order below.

#### Term mapping
| IDFC / banking | Access Health / RCM |
|---|---|
| IDFC FIRST | Access Health |
| Priya (RM) | Jane Doe |
| Rohit Mehra (manager) | Michael Reed |
| Mumbai hub | Dallas hub |
| RM / Relationship Manager | Patient Access Specialist |
| Customer (banking sense) | Patient / Member |
| KYC | Eligibility verification |
| NPA | Denial |
| Sanction letter | Authorization |
| MCLR / WCDL / OD / CC limit | PMPM / contracted rate / benefit cap |
| Salesforce | EHR (Epic / Cerner) |
| Kapoor / Mehta etc. | Neutral patient/provider names |
| ₹ | $ |

#### File order (highest demo-path visibility first)
1. `lib/mock-data.ts`
2. `lib/auto-actions-data.ts`, `lib/api-contracts.ts`
3. `components/shared/AppShell.tsx`, `components/agents/AgentShell.tsx`
4. `app/login/page.tsx` (residual CSS-var refs + any banking copy)
5. `app/priority-stack/page.tsx` (incl. AI pill `#fbf0f2`/`#ecc3cb` → celadon/moss)
6. `app/portfolio/page.tsx`, `app/portfolio/[id]/page.tsx`
7. `app/auto-actions/page.tsx`, `app/auto-actions/[id]/page.tsx`
8. `app/morning-briefing/page.tsx`, `app/daily-debrief/page.tsx`
9. `app/meeting-avatar/page.tsx`, `app/ai-agents/page.tsx`, `app/consolidated-book/page.tsx`, `app/leaderboard/page.tsx`
10. `app/api/auto-actions/route.ts`, `app/api/morning-briefing/route.ts`
11. **Do NOT** touch `app/api/auth/[...nextauth]/route.ts`

#### Color cleanup
- Use new tokens; leave `--idfc-red*` alias shim in place for now (rename is optional Phase 3b).
- Keep `#dc2626` only where it means FAIL/critical status, not brand.

#### Optional Phase 3b — variable rename
Mechanical rename `--idfc-red*` → `--ah-*`; remove alias shim; rename tailwind tokens. Pure rename, no behavior change. Skip if low value before demo.

#### Acceptance
- `grep -rilE "idfc first|priya|\bkyc\b|\bnpa\b|mclr|salesforce|sanction letter" app components lib` → empty.
- Click-through of all routes shows no IDFC/banking copy and no brand-red surfaces.
- `npx tsc --noEmit` clean; `next build` clean.

---

### Phase 4 — Demo dry-run (gate before commit)

1. Kill stale dev server (PID 33421); restart fresh.
2. Login → demo path: Caseload → patient → priority stack → `/voice-intelligence` → live call playthrough → Ask Assist → wrap.
3. Disconnect backend (kill the upstream / block DNS): UI must degrade gracefully — WS status indicator goes red, no crashes, reconnect attempts visible.
4. Reconnect — auto-recovery via the 3 s reconnect loop.
5. Screen-record; share with Jeeva.

**Sign-off gate:** Jeeva confirms before Phase 5.

---

### Phase 5 — Commit, push, Amplify

Each step gated on Jeeva approval.

#### 5.1 Git
1. `git add` **specific files only** (never `-A`/`.`). Stage in 3 chunks:
   - (a) SOP + voice-intelligence refactor
   - (b) Sitewide rebrand sweep
   - (c) Docs (`demo-plan.md`, any updates to `amazon-connect-integration.md`)
2. Commit on `dev` with conventional messages. No co-author tag unless asked.
3. `git push -u origin dev` to `jeeva-aivar/access-health-agent-assist`.
4. PR `dev` → `uat` when ready. Do not auto-merge. Eventually `uat` → `main` per branch flow.

#### 5.2 Amplify setup (Gen 2 Web Compute, region `ap-south-1`)

**Critical configuration:**
- **SSR Compute Role** — MUST be attached under App Settings → IAM Roles → Compute Role. This is *separate* from `AmplifySSRLoggingRole` (logging only). Required so any runtime `defaultProvider()` calls (e.g., Bedrock SigV4) can resolve AWS creds. If we ever invoke Bedrock from SSR, this role is the unlock.
- **Env var prefix restriction** — Amplify blocks env vars prefixed `AWS_`. For any AWS-related runtime config, use a different prefix (e.g., `BEDROCK_`, `HEALTH_`).
- **SSR Lambda timeout ~29 s vs Bedrock AgentCore ~35 s** — known unresolved issue. For Live Call Assist this doesn't bite (WS path is proxied, not Lambda-invoked), but if we wire Bedrock calls from SSR, stream early / queue work. Out of scope for this demo.
- **NextAuth** — DO NOT MODIFY auth files. Just set env vars.

**Env vars to set in Amplify branch config:**
```
CONVOGENT_AGENT_URL = https://idfc-call-tapping.aivar.app
CONVOGENT_BE_URL    = https://idfc-call-tapping.aivar.app
NEXT_PUBLIC_AGENT_WS_URL =                              # leave empty → uses /api/agent/live proxy
NEXTAUTH_SECRET     = <generate fresh per env>
NEXTAUTH_URL        = https://<amplify-branch-domain>
NEXT_PUBLIC_DATA_MODE = mock
DATABASE_URL        = <postgres URL or leave blank if mock-only>
```
**Do NOT** set `AWS_*` env vars in Amplify (blocked). If we need AWS creds at runtime, that comes via the SSR Compute Role.

**Branch flow:** `dev` → `uat` → `main`. Never push directly to `main`. Never skip `uat`.

**No `amplify.yml` in repo** — build settings live in the Amplify console (existing pattern; carry forward).

---

### Phase 6 — Amazon Connect integration talk-track (post-demo)

Source: `docs/amazon-connect-integration.md` (already on disk).
- Recommended path: Contact Lens + Agent Workspace 3rd-party app (Connect-native, HIPAA-eligible).
- Alt: KVS + Transcribe (more control, more lift).
- Comparison: Q-in-Connect (out-of-the-box but less customizable).
- KB plumbing: SharePoint → Bedrock Knowledge Bases — the path that kills the alt-tabbing problem.
- HIPAA: BAA in place; PHI boundaries.
- Open meeting questions are listed in the doc itself.

Action: review with Jeeva pre-customer-meeting. **No code changes.**

---

## Out of scope
- Auth route edits.
- Prisma schema changes.
- Backend (claims orchestrator) modifications — other team owns the deployed endpoint.
- Real PHI / production data — all data stays mock.
- Amplify app creation (gated to Phase 5; separate approval).
- The avatar service (`avatar.aivar.app`) — proxied but unused on the demo path.

---

## Open items
All items resolved 2026-05-19 — see "Decisions locked in" table above. Plan signed off; iteration in progress.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Backend changes shape (new event types) | Reducer ignores unknown events; warn-log. |
| Backend down during demo | Pre-flight check 30 min before; record fallback walkthrough. |
| SOP step inference mis-fires on edge phrasing | Tune `completionCue` against ≥3 canned transcripts; have Jeeva review. |
| Stale dev server (PID 33421) serves old build | Kill at start of Phase 2 work; document in Phase 4 script. |
| HIPAA: real PHI accidentally in mock data | `lib/mock-data.ts` header comment: "MOCK ONLY — no real PHI". |
| Pre-commit secret scan blocks push | `.env*` gitignored; check `git diff --cached` before each push. |
| Auth route edited by mistake | Rule restated here + at top of CLAUDE.md (TBD update). |
| Amplify SSR Compute Role forgotten | Phase 5.2 checklist item. Without it, any Bedrock SigV4 fails at runtime. |
| `AWS_*` env var set in Amplify | Phase 5.2 callout. Use `BEDROCK_*` / `HEALTH_*` prefixes if needed. |
| Bedrock 35 s vs Lambda 29 s | Not on Live Call Assist path. If we add Bedrock-from-SSR later, design async. |
