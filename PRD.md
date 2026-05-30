# PRD — AgeTech SF Hackathon Project

**Event:** AgeTech SF Hackathon: Closing the Emergency Detection Gap
**Date:** Saturday, May 30, 2026, 9AM–6PM · Downtown San Francisco
**Team:** 2 people, one build day
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

# Part 3 — Build Sequence (Two Parallel Tracks)

## Phase 0 — Lock the seam (together, ~45 min)

**Both people, first thing.** Build and agree on `src/types/escalation.ts` (artifact #3) AND the classifier output shape. This is the contract. Nothing else starts until these types compile and both people have read them. The schema ships with **mock fixtures** so Person B can build the entire UI against fake data without waiting on the engine.

**Acceptance:** types compile; a `mockConfig` and `mockClassifierResult` are exported and importable; both people can `import` the types in a scratch file with no errors.

## Phase 1 — Parallel build (until midday integration)

### Track A — Logic (Person A: knows Claude Code)
- A1. Vercel serverless proxy `/api/classify`: reads key from env, calls Sonnet, returns `{ tier, reasoning }` JSON. Haiku fallback path on error/timeout.
- A2. Classifier client wrapper: typed `classify(text): Promise<ClassifierResult>`.
- A3. Escalation state machine: pure module that takes an `EscalationConfig` + a tier, walks the step array with timers, emits step-state events. No UI, no hardcoded flows.
- A4. Drive A3 from a test harness (console or a throwaway page) against `mockConfig`.

**Acceptance (A):** `curl`-ing the deployed function with a sample sentence returns valid `{tier,reasoning}`; the state machine, fed `mockConfig`, emits the correct ordered step transitions with timeouts in a console log.

### Track B — UI (Person B: newer to Claude Code)
- B1. App shell + Tailwind theme + Spline hero (lazy-loaded, with a static fallback).
- B2. Caregiver dashboard layout from the Figma screenshot.
- B3. Step-list editor: add/remove/reorder steps, edit `type / target / timeoutSeconds / onNoResponse`, per tier. Built entirely against `mockConfig`.
- B4. Live escalation visualization: renders the step sequence with active-step highlight and countdown timers, driven by **stubbed** step-state events shaped like A3's output.

**Acceptance (B):** dashboard renders and edits `mockConfig` in state; the visualization animates a stubbed escalation end-to-end including a shown "calling 911" state — all without the real engine.

## Phase 2 — INTEGRATION POINT (together, midday, ~60 min)

Wire the real pieces to the real UI:
- Replace B4's stubbed events with A3's real state-machine events.
- Replace any mock classify call with A2's real `classify()` hitting the deployed proxy.
- Confirm the edited config from B3 is what the engine actually executes.

**Acceptance (integration):** judge-typed sentence → real classification with visible reasoning → the **user-edited** procedure for that tier runs with live timers → major path reaches shown 911 state. End-to-end, no mocks.

## Phase 3 — Together (final, demo polish)

- Pre-load 3 demo scenarios (one per tier) as one-click buttons (input still editable).
- Tune timeouts so the demo reads well on stage (short enough to watch, long enough to narrate).
- Visual polish, empty/error states, the 911 intent styling.
- Rehearse the 2-minute demo + pitch. Lock a known-good config.

**Acceptance (demo-ready):** a cold run of all three scenarios works back-to-back; the severity contrast is visually obvious; nothing on screen can trigger a real phone call.

---

# Part 4 — File / Module Ownership Map

Designed so A and B rarely touch the same file.

| Path | Owner | Notes |
|------|-------|-------|
| `src/types/escalation.ts` | **Shared (Phase 0)** | Frozen after Phase 0. Changes require both to agree. |
| `src/types/classifier.ts` | **Shared (Phase 0)** | Classifier output shape + mock result. |
| `src/mocks/` | **Shared (Phase 0)** | `mockConfig`, `mockClassifierResult`, stubbed step events. |
| `api/classify.ts` | A | Vercel serverless proxy. |
| `src/lib/classify.ts` | A | Client wrapper around the proxy. |
| `src/engine/escalationMachine.ts` | A | State machine. Pure, no React. |
| `src/engine/*.test.ts` | A | Engine harness/tests. |
| `src/App.tsx`, `src/main.tsx` | B | Shell. A only edits to wire imports at integration. |
| `src/components/Hero*` | B | Spline hero + fallback. |
| `src/components/Dashboard*` | B | Caregiver dashboard. |
| `src/components/StepEditor*` | B | Step-list editor. |
| `src/components/EscalationView*` | B | Live visualization. |
| `tailwind.config.js`, `index.css` | B | Theme. |
| `CLAUDE.md`, `.claude/skills/**` | A | Repo conventions + skills. |

**Integration seam:** the only file both edit is wherever the dashboard hands its config to the engine and renders engine events — keep that to a single thin container component (B owns it; A pairs during Phase 2).

---

# Part 5 — Claude Code First Tasks for Person B

Self-contained, visual, against the agreed types — no dependency on Person A's code.

1. **App shell + theme.** Scaffold the Vite app, set up the Tailwind theme tokens from the Figma reference, and add a top-level layout (hero region + dashboard region). Ship a plain styled page first.
2. **Spline hero, lazy-loaded.** Drop the Spline scene into the hero region behind a `React.lazy` boundary with a static gradient/illustration fallback, so the page is never blank if the 3D asset is slow or fails.
3. **Step-list editor against `mockConfig`.** Build the per-tier editor: list the steps, allow add/remove/reorder, and edit each field (`type`, `target`, `timeoutSeconds`, `onNoResponse`). Read and write `mockConfig` in local state. No engine needed.
4. **Escalation visualization against stubbed events.** Render the active tier's steps as a vertical timeline; highlight the current step and show a countdown; advance through a hardcoded stub sequence (including the shown "calling 911" state). This becomes the real view once A's events are wired in Phase 2.

> Tell Claude Code to read `CLAUDE.md` and `src/types/escalation.ts` before starting any task. Keep each task in its own files per the ownership map.

---

# Acceptance Criteria Summary

| Milestone | Done when… |
|-----------|-----------|
| Phase 0 — Schema | Types compile; mocks exported; both can import cleanly. |
| Track A | Proxy returns valid `{tier,reasoning}`; engine emits correct ordered transitions on `mockConfig`. |
| Track B | Dashboard edits `mockConfig`; visualization animates a full stubbed escalation incl. shown 911. |
| Integration | Typed sentence → real classification + reasoning → user-edited procedure runs with timers → major reaches shown 911. End-to-end, no mocks. |
| Demo-ready | All 3 scenarios run back-to-back cold; severity contrast obvious; no path can dial a real phone. |
