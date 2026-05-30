/**
 * SHARED SCHEMA — the seam between Track A (logic) and Track B (UI).
 *
 * Built FIRST (Phase 0) and FROZEN afterward. Both the config UI and the
 * escalation state machine import these types. Do not redefine the step or
 * config shape anywhere else. Changes require both owners to agree.
 *
 * Mock fixtures at the bottom let Track B build the entire UI against fake
 * data, with zero dependency on the real engine or the Claude proxy.
 */

/* ------------------------------------------------------------------ */
/* Severity tiers                                                      */
/* ------------------------------------------------------------------ */

/** Severity tiers. Order matches the project spec: Minor / Medium / Major. */
export type SeverityTier = "minor" | "medium" | "major";

export const SEVERITY_TIERS: readonly SeverityTier[] = [
  "minor",
  "medium",
  "major",
] as const;

/* ------------------------------------------------------------------ */
/* Escalation steps                                                    */
/* ------------------------------------------------------------------ */

/** What kind of action a step performs. */
export type StepType = "voice_call" | "contact" | "call_911";

/** What to do when a step gets no response within its timeout. */
export type OnNoResponse = "next_step" | "stop";

/**
 * A single escalation action.
 *
 * - `voice_call`  — (simulated on day one) AI voice agent calls `target`.
 * - `contact`     — notify a named contact (e.g. "Emergency Contact 1").
 * - `call_911`    — SHOWN as intent only. Never dials a real number.
 *
 * `target`         — human-readable label of who is reached
 *                    (e.g. "Margaret", "Daughter — Sarah", "911").
 * `timeoutSeconds` — how long to wait at this step before applying onNoResponse.
 * `onNoResponse`   — `next_step` advances to the following step; `stop` halts.
 */
export interface EscalationStep {
  /** Stable id for React keys, reordering, and engine event correlation. */
  id: string;
  type: StepType;
  target: string;
  timeoutSeconds: number;
  onNoResponse: OnNoResponse;
}

/* ------------------------------------------------------------------ */
/* Per-tier procedure + full config                                    */
/* ------------------------------------------------------------------ */

/**
 * The ordered procedure for one severity tier.
 * The engine walks `steps` in array order — order IS the sequence.
 */
export interface TierProcedure {
  tier: SeverityTier;
  /** Ordered list. Index 0 runs first. Never hardcode this in the engine. */
  steps: EscalationStep[];
}

/**
 * The complete user-editable configuration: one procedure per tier.
 * Produced/edited by the caregiver dashboard; consumed by the engine.
 */
export interface EscalationConfig {
  minor: TierProcedure;
  medium: TierProcedure;
  major: TierProcedure;
}

/* ------------------------------------------------------------------ */
/* Engine runtime events (Track A emits, Track B renders)              */
/* ------------------------------------------------------------------ */

/** Lifecycle status of a single step while the engine runs. */
export type StepStatus =
  | "pending" // not reached yet
  | "active" // currently running, timer counting down
  | "responded" // a response came in (simulated) — incident handled here
  | "timed_out" // no response within timeoutSeconds
  | "skipped"; // not reached because an earlier step stopped/ended

/** Snapshot of one step for the live visualization. */
export interface StepRuntimeState {
  stepId: string;
  status: StepStatus;
  /** Seconds left on the active step's countdown; null when not active. */
  remainingSeconds: number | null;
}

/** Whole-run status. `at_911_intent` is the shown-but-not-dialed top state. */
export type RunStatus =
  | "idle"
  | "running"
  | "at_911_intent"
  | "stopped"
  | "completed";

/**
 * Event the engine emits on every tick/transition. Track B's visualization
 * renders purely from this — stub it during Phase 1, wire the real one in Phase 2.
 */
export interface EscalationRuntimeEvent {
  tier: SeverityTier;
  runStatus: RunStatus;
  /** Index of the active step in the tier's `steps` array, or null. */
  activeStepIndex: number | null;
  steps: StepRuntimeState[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let _id = 0;
/** Simple unique-id generator for new steps created in the editor. */
export function makeStepId(): string {
  _id += 1;
  return `step_${Date.now().toString(36)}_${_id}`;
}

/** An empty procedure for a tier (used when the user starts from scratch). */
export function emptyProcedure(tier: SeverityTier): TierProcedure {
  return { tier, steps: [] };
}

/* ------------------------------------------------------------------ */
/* MOCK FIXTURES — for Track B to build against independently          */
/* ------------------------------------------------------------------ */

/**
 * A realistic default config. Track B can render and edit this with no engine.
 * Timeouts are demo-friendly (short) — Phase 3 tunes them for the stage.
 */
export const mockConfig: EscalationConfig = {
  minor: {
    tier: "minor",
    steps: [
      {
        id: "minor_1",
        type: "voice_call",
        target: "Margaret",
        timeoutSeconds: 30,
        onNoResponse: "next_step",
      },
      {
        id: "minor_2",
        type: "contact",
        target: "Daughter — Sarah",
        timeoutSeconds: 45,
        onNoResponse: "stop",
      },
    ],
  },
  medium: {
    tier: "medium",
    steps: [
      {
        id: "medium_1",
        type: "voice_call",
        target: "Margaret",
        timeoutSeconds: 20,
        onNoResponse: "next_step",
      },
      {
        id: "medium_2",
        type: "contact",
        target: "Daughter — Sarah",
        timeoutSeconds: 30,
        onNoResponse: "next_step",
      },
      {
        id: "medium_3",
        type: "contact",
        target: "Neighbor — Tom",
        timeoutSeconds: 30,
        onNoResponse: "stop",
      },
    ],
  },
  major: {
    tier: "major",
    steps: [
      {
        id: "major_1",
        type: "contact",
        target: "Daughter — Sarah",
        timeoutSeconds: 15,
        onNoResponse: "next_step",
      },
      {
        id: "major_2",
        type: "voice_call",
        target: "Margaret",
        timeoutSeconds: 15,
        onNoResponse: "next_step",
      },
      {
        id: "major_3",
        type: "call_911",
        target: "911",
        timeoutSeconds: 0,
        onNoResponse: "stop",
      },
    ],
  },
};

/** Stub runtime event sequence so Track B can animate before A's engine exists. */
export const mockRuntimeSequence: EscalationRuntimeEvent[] = [
  {
    tier: "major",
    runStatus: "running",
    activeStepIndex: 0,
    steps: [
      { stepId: "major_1", status: "active", remainingSeconds: 15 },
      { stepId: "major_2", status: "pending", remainingSeconds: null },
      { stepId: "major_3", status: "pending", remainingSeconds: null },
    ],
  },
  {
    tier: "major",
    runStatus: "running",
    activeStepIndex: 1,
    steps: [
      { stepId: "major_1", status: "timed_out", remainingSeconds: null },
      { stepId: "major_2", status: "active", remainingSeconds: 15 },
      { stepId: "major_3", status: "pending", remainingSeconds: null },
    ],
  },
  {
    tier: "major",
    runStatus: "at_911_intent",
    activeStepIndex: 2,
    steps: [
      { stepId: "major_1", status: "timed_out", remainingSeconds: null },
      { stepId: "major_2", status: "timed_out", remainingSeconds: null },
      { stepId: "major_3", status: "active", remainingSeconds: null },
    ],
  },
];
