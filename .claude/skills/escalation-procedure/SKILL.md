---
name: escalation-procedure
description: How escalation procedures are modeled, stored, and executed in this project. Read before writing any code that touches steps, config, or the state machine.
---

# Escalation Procedure Model

## What an escalation procedure is

A procedure is an **ordered list of steps** for one severity tier. The engine walks steps in array order — index 0 runs first. Order IS the sequence; there is no branching or conditions within a tier.

The full user-editable config holds one procedure per tier:
```
EscalationConfig = { minor: TierProcedure, medium: TierProcedure, major: TierProcedure }
```

## Step schema (`EscalationStep`)

All types live in `src/types/escalation.ts` — never redefine them locally.

| Field | Type | Meaning |
|-------|------|---------|
| `id` | `string` | Stable ID for React keys and engine event correlation. Use `makeStepId()` from types. |
| `type` | `"voice_call" \| "contact" \| "call_911"` | What action the step performs. |
| `target` | `string` | Human-readable label of who is reached (e.g. `"Daughter — Sarah"`, `"911"`). |
| `timeoutSeconds` | `number` | How long to wait before applying `onNoResponse`. |
| `onNoResponse` | `"next_step" \| "stop"` | What the engine does when the timer expires. |

## Step types

- **`voice_call`** — simulated on day one; no real telephony. Treat it as a normal timed step.
- **`contact`** — notify a named person (human-readable label only; no phone number stored).
- **`call_911`** — rendered as an intent state only. **Never dials a real number.** Engine transitions to `runStatus: "at_911_intent"` and halts.

## How the engine executes

`runEscalation(config, tier, onEvent)` in `src/engine/escalationMachine.ts`:

1. Gets `config[tier].steps`
2. Walks steps in array order
3. For each step:
   - Sets step status to `"active"`, starts countdown from `timeoutSeconds`
   - Emits `EscalationRuntimeEvent` every tick (1s) with `remainingSeconds` decrementing
   - If `call_911`: immediately transitions to `runStatus: "at_911_intent"`, halts
   - On timeout: marks step `"timed_out"`; if `onNoResponse === "next_step"`, advances; if `"stop"`, emits `runStatus: "stopped"` and halts
4. If all steps exhaust: emits `runStatus: "completed"`

External signals:
- `handle.stop()` — halts immediately, current step → `"timed_out"`, remaining → `"skipped"`, emits `"stopped"`
- `handle.respond()` — simulates a human responding; current step → `"responded"`, remaining → `"skipped"`, emits `"completed"`

## Runtime event shape (`EscalationRuntimeEvent`)

Emitted on every tick and every transition. Track B/C render purely from this.

```ts
{
  tier: SeverityTier;
  runStatus: "idle" | "running" | "at_911_intent" | "stopped" | "completed";
  activeStepIndex: number | null;
  steps: Array<{
    stepId: string;
    status: "pending" | "active" | "responded" | "timed_out" | "skipped";
    remainingSeconds: number | null;
  }>;
}
```

`remainingSeconds` is only non-null on the currently `"active"` step. All other steps have `null`.

## Invariants

- **No hardcoded flows.** The engine reads step arrays from config; it never branches on target names or step count.
- **`call_911` never dials.** It only changes `runStatus` to `"at_911_intent"`.
- **`voice_call` is a normal timed step.** No special telephony logic on day one.
- **Step order is array order.** The editor can reorder steps; the engine always walks `steps[0..n]`.

## Mock fixtures (for building against before engine is wired)

```ts
import { mockConfig, mockRuntimeSequence } from '../mocks';
```

`mockConfig` — realistic 3-tier config with demo-friendly timeouts.
`mockRuntimeSequence` — 3 snapshot events showing a major escalation through to `at_911_intent`. Replay these on a timer to stub the live visualization.
