# CLAUDE.md

One-day hackathon build. Optimize for a working, legible demo over completeness.

---

## Pitch

An intelligent, **user-configurable escalation layer** on top of elder-care detection systems. A free-text "something's off" event is classified by Claude into a severity tier (minor / medium / major) with **visible reasoning**, then a user-configured escalation procedure runs step by step with live timers until a human takes ownership. We close the gap inside the gap: detection without follow-through. Demo: a judge types a scenario, watches it get graded and routed. 911 is shown, never dialed.

---

## Stack

- **App:** Vite + React + TypeScript + Tailwind, single-page
- **Backend:** One Vercel serverless function (`api/classify.ts`) proxies the Claude API
- **3D (optional):** Spline for lazy-loaded hero only; app must look good without it
- **Models** (use full versioned strings — never bare aliases like `claude-sonnet`):
  - Classifier: `claude-sonnet-4-6`
  - Fallback: `claude-haiku-4-5-20251001`

## Commands

- `npm install` — install deps
- `npm run dev` — local dev (Vite)
- `npm run build` — production build
- `npm run preview` — preview the build
- `vercel dev` — run with the serverless function locally
- `vercel` / `vercel --prod` — deploy

---

## Hard rules (never violate)

1. **911 is shown, never dialed.** `call_911` only renders an intent state. No real number is ever called.
2. **API key never reaches the client.** Lives only in a Vercel env var, read inside `api/classify.ts`. Never import, log, or inline it in `src/`.
3. **No hardcoded escalation flows.** The engine executes whatever `EscalationConfig` the user built. Step order/targets/timeouts come only from config.
4. **Classifier reasoning must render on screen.** Every classification returns `{ tier, reasoning }`; the UI shows the reasoning, not just the label.
5. **`voice_call` is simulated on day one.** No telephony. Treat it as a normal timed step.
6. **Shared schema is frozen after Phase 0.** Don't change `src/types/*` without all owners agreeing — all tracks build against it.
7. **Use full versioned model strings.** Never bare aliases like `claude-sonnet`.
8. **No parallel subagents unless explicitly asked.** Single-threaded work only — billed against a personal $50 Anthropic balance.

---

## Cost guardrail

- Prefer Haiku for cheap/iterative checks; reserve Sonnet for actual classifier behavior.
- Keep classifier prompts tight; cap `max_tokens` modestly.

---

## File map

```
api/
  classify.ts              # A — Vercel proxy; reads key from env; Sonnet + Haiku fallback
src/
  types/
    escalation.ts          # SHARED — tiers, steps, config (frozen after Phase 0)
    classifier.ts          # SHARED — classifier output shape
  mocks/                   # C — mockConfig, mockClassifierResult, stubbed events
  lib/
    classify.ts            # A — client wrapper around /api/classify
  engine/
    escalationMachine.ts   # A — client-side state machine (pure, no React)
  components/
    Hero*                  # B — Spline hero + fallback
    Dashboard*             # B — caregiver dashboard
    StepEditor*            # B — per-tier ordered step editor
    EscalationView*        # C — live step visualization with timers
  App.tsx, main.tsx        # B — shell
.claude/skills/
  classifier/SKILL.md              # A — classifier contract + output schema
  escalation-procedure/SKILL.md   # A — procedure model + execution
```

---

## Team split

### Person A — Classifier + Engine
- `api/classify.ts` — Vercel proxy, API key handling, Sonnet + Haiku fallback
- `src/lib/classify.ts` — client wrapper around `/api/classify`
- `src/engine/escalationMachine.ts` — escalation state machine, pure logic, no React
- `.claude/skills/` — document classifier contract and procedure model
- **Phase 0:** co-owns type freeze with B

### Person B — UI + Dashboard
- `src/components/Hero*` — Spline hero + fallback
- `src/components/Dashboard*` — caregiver dashboard shell
- `src/components/StepEditor*` — per-tier step editor (contact order, timeouts, actions)
- `App.tsx`, `main.tsx` — app shell
- Container component wiring dashboard → engine at integration
- **Phase 0:** co-owns type freeze with A

### Person C — Mocks + EscalationView + QA
- `src/mocks/` — write `mockConfig`, `mockClassifierResult`, stubbed events for all three tiers (unblocks B's dashboard work — do this first)
- `src/components/EscalationView*` — live step visualization with timers; build entirely against mocks, consume engine state, don't touch the machine itself
- **Demo scenarios** — 6–8 judge-ready input strings covering all three tiers
- **UI copy** — button labels, status messages, "calling 911" state label, empty/error states
- **End-to-end QA** — run all scenarios once A and B integrate; log what breaks
- **Pitch/demo script** — spoken walkthrough and opening one-liner

---

## Handoffs

| When | What |
|------|------|
| First 30–45 min (Phase 0) | A + B freeze `src/types/*` together. C starts mocks immediately after. |
| Once mocks exist | All three tracks work in parallel. |
| Mid-day integration | A hands engine to B's container. C plugs EscalationView into live state. |
| Final 90 min | Feature freeze. All three rehearse. C runs scenarios; A and B fix what breaks. |

---

## Conventions

- TypeScript strict. Share types via `src/types/*` — never redefine step/config shape locally.
- Build UI against `src/mocks/*` until Phase 2 integration.
- Keep `escalationMachine.ts` framework-free and unit-testable.
- One thin container component owns the dashboard → engine seam; keep wiring there.
- Read `src/types/escalation.ts` before writing any code that touches steps or config.
