# Amazon Connect Integration — Access Healthcare

**Audience:** Access Healthcare contact-center leadership and AWS solutions team.
**Status:** Feasibility & shape — not a delivery plan. To be reviewed before the customer meeting.

---

## 1. Context

Access Healthcare runs its US contact-center workloads on **Amazon Connect**. Agents handle revenue-cycle workflows (appointment booking, eligibility verification, prior-auth follow-up, claim status, denial appeals). The current pain point Access Healthcare has flagged:

- Agents alt-tab between Amazon Connect (CCP), SharePoint (where SOPs live), and EHR/payer portals during live calls.
- The lookup tax slows handle time and drives SOP drift across the team.
- QA spends meaningful effort confirming SOP adherence after the fact.

Aivar's Agent Assist already exists as a Next.js workspace driven by a real-time transcript bus + Bedrock-powered suggestions. The goal of this integration is to bolt that experience onto Access Healthcare's existing Connect setup, using their SharePoint SOPs as the knowledge base — with **zero green-field rebuild on their side**.

---

## 2. Reference architecture (target state)

```
                                   ┌─────────────────────────────────────────┐
                                   │           Access Healthcare AWS         │
                                   │              (us-east-1 / us-west-2)    │
                                   └─────────────────────────────────────────┘

  Caller ── PSTN/SIP ── Amazon Connect ── Contact flow ──┬──► Contact Lens (real-time analytics)
                                                          │         │
                                                          │         ▼
                                                          │   Kinesis Data Stream
                                                          │         │
                                                          │         ▼
                                                          │   ┌──────────────────────────────┐
                                                          │   │  Aivar Agent Assist service  │
                                                          │   │  (Bedrock + KB orchestrator) │
                                                          │   └──────────────────────────────┘
                                                          │         │
                                                          │         │  WSS  ◄──────────────┐
                                                          │         ▼                      │
                                                          │   Bedrock Knowledge Base       │
                                                          │   (SharePoint connector)       │
                                                          │                                │
                                                          │                                │
                                                          ▼                                │
                                                  Amazon Connect Agent Workspace ──────────┘
                                                  ├─ CCP (call control)
                                                  ├─ Customer profile
                                                  └─ Aivar Agent Assist (3rd-party app iframe)
                                                       └─ live transcript + SOP step tracker + suggestions
```

**Two boundaries we care about:**

1. **Transcript ingress** — how Agent Assist learns what's being said on the call.
2. **UI surface** — where the agent sees the SOP tracker and suggestions without leaving Connect.

Both have well-supported AWS paths, detailed below.

---

## 3. Integration options (ranked)

### Option A — Recommended for first integration

**Contact Lens real-time + Agent Workspace third-party app**

- **Transcript:** Enable Contact Lens real-time analytics on the relevant contact flow. Subscribe to `RealTimeContactAnalysisSegment` events via Kinesis Data Stream. Agent Assist consumes these as the `transcript` / `partial` source.
- **UI:** Register Agent Assist as a **Third-party application in Amazon Connect Agent Workspace** (GA feature). The agent sees CCP + customer profile + our SOP-driven assist tab in one Connect-native browser shell — no tab switching to SharePoint.
- **KB:** Bedrock Knowledge Base with the **SharePoint connector** (GA) crawls Access Healthcare's existing SOP libraries. No content migration needed.

**Pros**
- Native to Connect. No audio fork, no media-streams plumbing.
- Agent stays inside the Connect Agent Workspace — eliminates the alt-tab pain directly.
- Contact Lens already surfaces sentiment + categories we can reuse for the persona panel.
- SharePoint connector means SOPs stay where Access Healthcare's content owners already maintain them.

**Cons / things to confirm**
- Contact Lens real-time has ~1–3 s segment latency. Acceptable for SOP-step prompts; not for word-by-word coaching.
- Contact Lens real-time pricing is per-minute on top of Connect base cost — should be modeled before commit.
- Third-party app must be served over HTTPS with strict CSP — covered by Amplify SSR.

### Option B — Lower-latency variant

**Kinesis Video Streams audio fork + Amazon Transcribe Streaming**

- Connect contact flow forks raw audio into Kinesis Video Streams. A Fargate consumer reads KVS, sends to Amazon Transcribe Streaming (Medical or general, `en-US`), and emits transcript events to Agent Assist.
- UI remains the third-party app in Agent Workspace (Option A's UI path).

**Pros**
- Sub-second transcript latency. Better for word-by-word prompts and compliance interrupts.
- Vocabulary control via custom vocab / language models.

**Cons**
- More infrastructure to operate (KVS consumer, Transcribe quota, dead-letter handling).
- Two transcript pipelines if Contact Lens is also kept for sentiment/QA — needs reconciliation.

### Option C — Native, lowest-custom

**Amazon Q in Connect (formerly Wisdom)**

- Use Amazon Q in Connect for in-Workspace answer recommendations driven directly by Contact Lens real-time.
- Q in Connect has its own SharePoint connector and surfaces snippets to the agent.

**Pros**
- Fully native — no Aivar service to run.

**Cons**
- Generic Q&A retrieval, not SOP-step orchestration. The 3–4 step tracker, step-state inference, and "are required steps complete?" view are **not** native features and would need a separate side-car app anyway.
- Less control over UI surface, prompt construction, and what triggers a suggestion.

> **Recommendation:** start with **Option A** for the demo and first pilot. Hold Option B in reserve for workflows where latency matters. Position Option C as a complementary native fallback for ad-hoc Q&A — but not as the SOP-tracker surface.

---

## 4. KB ingestion from SharePoint

**Service:** Bedrock Knowledge Bases — SharePoint Online connector (GA).

**Setup steps Access Healthcare will need:**

1. Microsoft Graph app registration in their tenant with `Sites.Read.All` (delegated or app-only depending on policy).
2. Identify the SharePoint site collections / document libraries that hold the SOPs (one KB can ingest multiple libraries).
3. Choose an embeddings model (Titan Text Embeddings v2 recommended).
4. Choose a vector store — OpenSearch Serverless (fastest path) or Aurora pgvector if they prefer relational.
5. Configure chunking — start with hierarchical chunking (default), tune by document type (SOPs vs reference guides vs scripts).
6. Set up metadata filters — at minimum: workflow type (appointment, eligibility, prior-auth, denial), payer, region.
7. Sync cadence — daily incremental, manual full re-sync option for SOP rewrites.

**Aivar Agent Assist queries the KB** at SOP-step boundaries (or on agent click of "Open SOP source") with a filtered query that constrains by current workflow + current step. The retrieved chunk is what gets shown in the step-detail expand and used as `{retrieved_context}` in the prompt.

---

## 5. Data residency & compliance

- **Region:** keep the entire Connect + KB + Bedrock + Agent Assist stack inside one US region (recommend `us-east-1`). Cross-region calls add latency and complicate BAAs.
- **HIPAA:** Amazon Connect, Contact Lens, Bedrock, Bedrock Knowledge Bases, KVS, Transcribe, OpenSearch Serverless, Lambda, S3 are all HIPAA-eligible under AWS BAA. Access Healthcare's existing AWS BAA should cover this stack — confirm before processing PHI.
- **PHI in logs:** Agent Assist must be configured to redact PHI from app logs and observability traces. Transcripts go to a dedicated, encrypted log group with short retention; suggestion text the same.
- **At-rest:** S3 + OpenSearch with KMS CMK in Access Healthcare's account. Bedrock KB inherits this when configured with their bucket.
- **Access control:** SSO from Access Healthcare's IdP to the Connect instance; Agent Workspace third-party app inherits the agent's Connect session.

---

## 6. Customization checklist for Access Healthcare's environment

Before pilot:

- [ ] Map current SharePoint SOP structure to Bedrock KB connector configuration (sites, libraries, metadata).
- [ ] Define 1–2 pilot workflows with explicit step lists (we'll start with **Appointment Booking** in the demo).
- [ ] Confirm Connect instance has Contact Lens real-time enabled on the pilot queues.
- [ ] Register Aivar Agent Assist as a third-party application in Agent Workspace.
- [ ] Wire SSO so agents don't see a second login when the app loads in Workspace.
- [ ] Define the suggestion + step-state event contract (what Agent Assist will emit on `assist_done` and `sop_state`).
- [ ] QA flow: how supervisors review the SOP-adherence audit trail (Contact Lens + Agent Assist combined).
- [ ] Run-time guardrails: max suggestion latency, fallback when KB is empty, behavior when Contact Lens drops.

---

## 7. What changes in our codebase to talk to Connect

The current demo code already has a stable WebSocket-event contract on the client. To switch from the existing Convogent telephony source to Amazon Connect, the boundary is the **TelephonyAdapter** on the backend, not the UI.

Concretely:

- The `TelephonyAdapter` interface stays. We add a `connect-contact-lens` adapter that subscribes to the Kinesis stream and emits the same `partial` / `transcript` / `call_start` / `call_end` events.
- The `assist_done` event already streams. We add an optional `stepId` and a sibling `sop_state` event (already wired defensively on the client — see `app/voice-intelligence/page.tsx`).
- The SOP source of truth moves from the in-repo `lib/sop-rcm.ts` to the orchestrator pulling SOP step definitions from the KB at call start. The client UI does not change.
- KB queries swap from the demo's local in-memory store to Bedrock Knowledge Bases via the AWS SDK.
- Agent identity: come from Connect Agent Workspace context, not NextAuth.

Nothing about the **right-rail SOP tracker**, suggestion cards, ask panel, or transcript view needs to change — those are already data-driven.

---

## 8. Open questions to take into the meeting

1. Which Connect region(s) and contact-flow queues do they want piloted first?
2. Is Contact Lens real-time already enabled? If not, who owns turning it on for the pilot queues?
3. Which SharePoint libraries hold the SOPs we'd ingest? What's the access path for Bedrock KB?
4. Is the Agent Workspace already in use, or are agents still on the classic CCP? (Workspace is required for the third-party app embed.)
5. Who's the AWS account owner on their side — and is the BAA already in place for Bedrock?
6. SOP authoring: do SOPs change weekly, monthly, quarterly? Drives the KB sync cadence.
7. QA reporting: what does SOP-adherence reporting need to look like for supervisors?
