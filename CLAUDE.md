# CLAUDE.md

## Pitch
An intelligent, **user-configurable escalation layer** on top of elder-care detection systems. A free-text "something's off" event is classified by Claude into a severity tier (minor / medium / major) with **visible reasoning**, then a **user-edited** escalation procedure runs step by step with live timers until a human takes ownership. We close the gap inside the gap: detection without follow-through. Demo: a judge types a scenario, watches it get graded and routed. 911 is shown, never dialed.

## Stack
- Vite + React + TypeScript + Tailwind, single-page app.
- One Vercel serverless function (`api/classify.ts`) proxies the Claude API.
- Spline for a lazy-loaded hero only; the app must look good without it.
- Models (verified 2026-05-30, use full versioned strings):
  - Classifier: `claude-sonnet-4-6`
  - Fallback: `claude-haiku-4-5-20251001`

## Commands
- `npm install` — install deps
- `npm run dev` — local dev (Vite)
- `npm run build` — production build
- `npm run preview` — preview the build
- `vercel dev` — run with the serverless function locally
- `vercel` / `vercel --prod` — deploy

## Demo-critical invariants (HARD RULES — never violate)
1. **911 is shown, never dialed.** `call_911` only renders an intent state. No real number is ever called.
2. **The API key never reaches the client.** It lives only in a Vercel env var, read inside `api/classify.ts`. Never import it, log it, or inline it in `src/`.
3. **No hardcoded escalation flows.** The engine executes whatever `EscalationConfig` the user built. Step order/targets/timeouts come only from config.
4. **Classifier reasoning must render on screen.** Every classification returns `{ tier, reasoning }`; the UI shows the reasoning, not just the label.
5. **`voice_call` is simulated on day one.** No telephony. Treat it as a normal timed step.
6. **The shared schema is frozen after Phase 0.** Don't change `src/types/*` without both owners agreeing — both tracks build against it.
7. **Use full versioned model strings.** Never bare aliases like `claude-sonnet`.

## Cost guardrail
- **Do NOT spawn parallel subagents unless explicitly asked.** Single-threaded work only; this is billed against a personal $50 Anthropic balance.
- Prefer Haiku for cheap/iterative checks; reserve Sonnet for the actual classifier behavior.
- Keep classifier prompts tight; cap `max_tokens` modestly.

## File map
```
api/
  classify.ts            # A — Vercel proxy; reads key from env; Sonnet + Haiku fallback
src/
  types/
    escalation.ts        # SHARED — tiers, steps, config (frozen after Phase 0)
    classifier.ts        # SHARED — classifier output shape
  mocks/                 # SHARED — mockConfig, mockClassifierResult, stubbed events
  lib/
    classify.ts          # A — client wrapper around /api/classify
  engine/
    escalationMachine.ts # A — client-side state machine (pure, no React)
  components/
    Hero*                # B — Spline hero + fallback
    Dashboard*           # B — caregiver dashboard
    StepEditor*          # B — per-tier ordered step editor
    EscalationView*      # B — live step visualization w/ timers
  App.tsx, main.tsx      # B — shell
.claude/skills/
  classifier/SKILL.md           # how to classify + output schema
  escalation-procedure/SKILL.md # how procedures are modeled + executed
```

## Conventions
- TypeScript strict. Share types via `src/types/*` — never redefine the step/config shape locally.
- Build UI against `src/mocks/*` until the Phase 2 integration point.
- Keep `escalationMachine.ts` framework-free and unit-testable.
- One thin container component owns the dashboard→engine seam; keep wiring there.
- Read `src/types/escalation.ts` before writing any code that touches steps or config.
