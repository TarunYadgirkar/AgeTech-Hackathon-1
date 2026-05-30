/**
 * SHARED — classifier output shape. Part of the Phase 0 seam, frozen with
 * escalation.ts. Track A's proxy returns this; Track B renders the reasoning.
 */
import type { SeverityTier } from "./escalation";

/** What `/api/classify` returns and what `classify()` resolves to. */
export interface ClassifierResult {
  tier: SeverityTier;
  /** Plain-language explanation of WHY this tier was chosen. Must render in UI. */
  reasoning: string;
}

/** Mock result so the UI can show the reasoning panel before the proxy exists. */
export const mockClassifierResult: ClassifierResult = {
  tier: "major",
  reasoning:
    "The description states the person is on the floor and not responding. " +
    "Being on the floor plus unresponsiveness indicates a possible fall or " +
    "medical event with no self-recovery, which calls for the fastest, most " +
    "intensive response tier rather than a gentle check-in.",
};
