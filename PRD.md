# PRD — AgeTech SF Hackathon Project

**Event:** AgeTech SF Hackathon: Closing the Emergency Detection Gap
**Date:** Saturday, May 30, 2026, 9AM–6PM · Downtown San Francisco
**Team:** 3 people, one build day
**Status:** Build plan LOCKED

---

# Part 1 — Product Spec

## One-line summary

A web app that adds an intelligent, **user-configurable, severity-based escalation layer** on top of existing elder-care detection systems (like Routines AI) — turning a single "something's off" alert into a coordinated response that keeps routing until a human takes ownership.

## The problem

Detection systems for older adults living alone are good at noticing that something happened — a routine deviation, a fall — but they stop short of *follow-through*. A system can detect "not in kitchen at 11am" and message one emergency contact, but there is no severity judgment, no fallback if that contact doesn't answer, and no path to emergency services. This is the gap inside the gap: **detection without follow-through.** A missed notification can turn a survivable incident into a serious one.

## Where we sit in the ecosystem

We are the **software coordination layer on top of** detection infrastructure — not a competitor to sensor/CV companies like Routines or SafelyYou. Their detection signal is our input; our value is what happens next. SafelyYou's follow-up product targets *staffed senior-living facilities* with on-call staff. Our focus is the older adult living **alone at home**, where the responder pool is informal and unreliable — a fundamentally different escalation problem.

## How it works

1. **Input** — A free-text description of a routine disruption is typed into the app. At the demo, a judge types it themselves (e.g. "Margaret hasn't gotten out of bed and it's 1pm"), so the system reasons live rather than running a hardcoded script. *Scope decision: no medical-history factoring, to keep the build realistic for one day.*
2. **Classification** — The text goes to the Claude API, which classifies the event into one of three severity tiers (minor / medium / major) **and returns its reasoning, which renders on screen.** This visible reasoning is the clearest signal of intelligence over a dumb if-statement.
3. **Escalation** — The matching tier runs a **user-configured** ordered procedure that executes visibly, step by step, with live timers. 911 is shown as an intent state, never dialed.
4. **AI voice agent** *(stretch)* — Real telephony is deferred. On day one, `voice_call` runs as a **simulated** step.

## Who configures it

The **emergency contact** (family member or caregiver), via a caregiver-style dashboard. The older adult does not set up, wear, or do anything — non-intrusive and dignity-preserving.

## Why it fits this hackathon

- Closes the named gap: detection without follow-through.
- No wearable dependence (pendants stay in drawers, watches come off at night).
- Sponsor-aligned: sits on top of Routines/SafelyYou detection.
- Dignity-preserving: invisible until needed.
- Demoable: pure software, live reasoning, clean severity contrast.

---

# Part 2 — Build Addendum (LOCKED)

## Locked stack

- **Frontend:** Vite + React + TypeScript + Tailwind, single-page app.
- **Backend:** one Vercel serverless function (`/api/classify`) proxies the Claude API. **The Anthropic API key never touches frontend code** — it lives only in a Vercel env var read server-side.
- **Models** (verified against docs.claude.com on 2026-05-30):
  - Classifier: `claude-sonnet-4-6` (better visible reasoning).
  - Fast fallback: `claude-haiku-4-5-20251001`.
  - Use full versioned strings — never bare aliases.
- **3D:** Spline for a hero/accent only, **lazy-loaded**. The app must look polished and demo-ready even if the Spline scene fails to load.
- **Design reference:** Figma (screenshots into Claude Code, or Figma MCP).
- **API key:** Tarun's own Anthropic key powers both Claude Code (building) and product inference.

## Final demo scope

**In scope (must work):**
- Judge types a scenario → Claude classifies (minor/medium/major) → reasoning renders on screen.
- Caregiver dashboard where the user edits tiers and, per tier, an ordered list of escalation steps.
- Client-side escalation engine that executes **whatever config the user built**, step by step, with visible countdown timers.
- A major scenario escalates all the way to a shown-but-not-dialed "calling 911" state.

**Simulated on day one:**
- `voice_call` steps (no real telephony).

**Out of scope:**
- Real phone calls / Twilio / Retell integration (later stretch).
- Medical-history factoring.
- Persistence beyond the session (in-memory state is fine; localStorage optional).
- Auth / multi-user accounts.

## Configurable escalation requirements

- Escalation is a **core, user-editable feature — nothing hardcoded.**
- The dashboard lets the user manage all three tiers and, per tier, edit an ordered list of steps.
- Each step matches the shared schema (see `src/types/escalation.ts`):
  `{ type: "voice_call" | "contact" | "call_911", target, timeoutSeconds, onNoResponse }`.
- The engine is a **client-side state machine** that walks the active tier's step array in order, waiting `timeoutSeconds` at each step, then either advancing (`next_step`) or halting (`stop`).
- Example flow a user can build: AI voice agent calls → no answer in N min → emergency contact 1 → no answer in N min → 911-intent.

## Resolved open decisions (from spec)

- **Voice-agent de-escalation:** deferred — `voice_call` is simulated, so no real de-escalation logic on day one. The engine treats a simulated answer as a normal step outcome.
- **Severity rising over time:** out of scope for day one. The engine executes a single tier's procedure; it does not auto-promote tiers.
- **Stack & build sequence:** resolved below.

---

# Part 3 — Build Sequence (Three Parallel Tracks)

## Phase 0 — Lock the seam (together, ~45 min)

**All three people, first thing.** Build and agree on `src/types/escalation.ts` AND the classifier output shape. This is the contract. Nothing else starts until these types compile and all three people have read them. The schema ships with **mock fixtures** so B and C can build the entire UI and visualization against fake data without waiting on the engine.

**Acceptance:** types compile; `mockConfig`, `mockClassifierResult`, and `mockRuntimeSequence` are exported and importable; all three can `import` the types in a scratch file with no errors.

## Phase 1 — Parallel build (until midday integration)

### Track A — Logic (Person A: knows Claude Code)
- A1. Vercel serverless proxy `/api/classify`: reads key from env, calls Sonnet, returns `{ tier, reasoning }` JSON. Haiku fallback path on error/timeout.
- A2. Classifier client wrapper: typed `classify(text): Promise<ClassifierResult>`.
- A3. Escalation state machine: pure module that takes an `EscalationConfig` + a tier, walks the step array with timers, emits `EscalationRuntimeEvent`s. No UI, no hardcoded flows.
- A4. Drive A3 from a test harness (console or throwaway page) against `mockConfig`.

**Acceptance (A):** `curl`-ing the deployed function with a sample sentence returns valid `{tier,reasoning}`; the state machine, fed `mockConfig`, emits the correct ordered step transitions with timeouts in a console log.

### Track B — UI + Dashboard (Person B: newer to Claude Code)
- B1. App shell + Tailwind theme + Spline hero (lazy-loaded, with a static fallback).
- B2. Caregiver dashboard layout from the Figma screenshot.
- B3. Step-list editor: add/remove/reorder steps, edit `type / target / timeoutSeconds / onNoResponse`, per tier. Built entirely against `mockConfig`.

**Acceptance (B):** dashboard renders and edits `mockConfig` in state; step editor correctly adds/removes/reorders steps for all three tiers — all without the real engine.

### Track C — Mocks + EscalationView + QA (Person C)
- C1. **First and immediately after Phase 0:** write `src/mocks/index.ts` exporting `mockConfig`, `mockClassifierResult`, and `mockRuntimeSequence` — this unblocks B's dashboard work.
- C2. `EscalationView` component: renders the active tier's steps as a vertical timeline with active-step highlight and countdown timers. Driven entirely by `mockRuntimeSequence` stubs. Do not touch the state machine.
- C3. Demo scenario strings: 6–8 judge-ready input strings covering all three tiers (see `docs/demo-scenarios.md`).
- C4. UI copy: button labels, status messages, "calling 911" state label, empty/error states.

**Acceptance (C):** `EscalationView` animates the full `mockRuntimeSequence` end-to-end including the shown "calling 911" state — entirely off mocks. Mocks are importable by B immediately after Phase 0.

## Phase 2 — INTEGRATION POINT (together, midday, ~60 min)

Wire the real pieces to the real UI:
- Replace C's stubbed events in `EscalationView` with A's real state-machine events.
- Replace any mock classify call with A's real `classify()` hitting the deployed proxy.
- Confirm the edited config from B's step editor is what the engine actually executes.

**Acceptance (integration):** judge-typed sentence → real classification with visible reasoning → the **user-edited** procedure for that tier runs with live timers → major path reaches shown 911 state. End-to-end, no mocks.

## Phase 3 — Together (final, demo polish)

- Pre-load 3 demo scenarios (one per tier) as one-click buttons (input still editable).
- Tune timeouts so the demo reads well on stage (short enough to watch, long enough to narrate).
- Visual polish, empty/error states, the 911 intent styling.
- C runs full end-to-end QA across all three scenarios; A and B fix what breaks.
- Rehearse the 2-minute demo + pitch. Lock a known-good config.

**Acceptance (demo-ready):** a cold run of all three scenarios works back-to-back; the severity contrast is visually obvious; nothing on screen can trigger a real phone call.

---

# Part 4 — File / Module Ownership Map

Designed so A, B, and C rarely touch the same file.

| Path | Owner | Notes |
|------|-------|-------|
| `src/types/escalation.ts` | **Shared (Phase 0)** | Frozen after Phase 0. Changes require all three to agree. |
| `src/types/classifier.ts` | **Shared (Phase 0)** | Classifier output shape + mock result. |
| `src/mocks/index.ts` | **C** | First task after Phase 0. Unblocks B. |
| `api/classify.ts` | A | Vercel serverless proxy. |
| `src/lib/classify.ts` | A | Client wrapper around the proxy. |
| `src/engine/escalationMachine.ts` | A | State machine. Pure, no React. |
| `src/engine/*.test.ts` | A | Engine harness/tests. |
| `src/App.tsx`, `src/main.tsx` | B | Shell. A only edits to wire imports at integration. |
| `src/components/Hero*` | B | Spline hero + fallback. |
| `src/components/Dashboard*` | B | Caregiver dashboard. |
| `src/components/StepEditor*` | B | Step-list editor. |
| `src/components/EscalationView*` | **C** | Live visualization. C builds against mocks; wires to engine at Phase 2. |
| `tailwind.config.js`, `index.css` | B | Theme. |
| `CLAUDE.md`, `.claude/skills/**` | A | Repo conventions + skills. |
| `docs/demo-scenarios.md` | C | Demo scenario strings + pitch script. |

**Integration seam:** the only file all three touch is the thin container component where the dashboard hands config to the engine and renders `EscalationView` events — B owns it; A and C pair during Phase 2.

---

# Part 5 — Claude Code First Tasks by Person

## Person A — first tasks
1. Read `CLAUDE.md` and `.claude/skills/classifier/SKILL.md`. Build `api/classify.ts` against the classifier skill spec.
2. Build `src/lib/classify.ts` — typed client wrapper.
3. Build `src/engine/escalationMachine.ts` — pure state machine against the types. Drive it with a console harness against `mockConfig`.

## Person B — first tasks
1. Read `CLAUDE.md` and `src/types/escalation.ts`. Build the app shell + Tailwind theme.
2. Spline hero behind `React.lazy` with a static gradient fallback.
3. Caregiver dashboard layout (Figma reference → Claude Code).
4. Step-list editor against `mockConfig` — add/remove/reorder/edit steps per tier.

> Wait ~15 min after Phase 0 for C to ship `src/mocks/index.ts` before starting the dashboard — it's a fast task and unblocks everything.

## Person C — first tasks
1. **Immediately after Phase 0:** write `src/mocks/index.ts`. Export `mockConfig`, `mockClassifierResult`, and `mockRuntimeSequence`. This is the first thing that ships and unblocks B.
2. Build `EscalationView` component: vertical step timeline, active-step highlight, countdown timer, shown "calling 911" state. Build entirely against `mockRuntimeSequence`.
3. Write 6–8 demo scenario input strings (see `docs/demo-scenarios.md`), one-click buttons for minor/medium/major.
4. Write all UI copy: button labels, tier badge labels, status messages, empty/error states, "calling 911" label.

---

# Acceptance Criteria Summary

| Milestone | Done when… |
|-----------|------------|
| Phase 0 — Schema | Types compile; mocks exported; all three can import cleanly. |
| Track A | Proxy returns valid `{tier,reasoning}`; engine emits correct ordered transitions on `mockConfig`. |
| Track B | Dashboard edits `mockConfig`; step editor works across all three tiers. |
| Track C | `EscalationView` animates full stubbed escalation incl. shown 911; mocks importable immediately after Phase 0. |
| Integration | Typed sentence → real classification + reasoning → user-edited procedure runs with timers → major reaches shown 911. End-to-end, no mocks. |
| Demo-ready | All 3 scenarios run back-to-back cold; severity contrast obvious; no path can dial a real phone. |
