import { useState, useEffect, useRef } from 'react';
import EscalationView from './EscalationView';
import { mockConfig } from '../mocks';
import type {
  EscalationRuntimeEvent,
  StepRuntimeState,
  SeverityTier,
  TierProcedure,
} from '../types/escalation';

const TIERS: SeverityTier[] = ['minor', 'medium', 'major'];

function idleEvent(tier: SeverityTier): EscalationRuntimeEvent {
  return {
    tier,
    runStatus: 'idle',
    activeStepIndex: null,
    steps: mockConfig[tier].steps.map((s) => ({
      stepId: s.id,
      status: 'pending',
      remainingSeconds: null,
    })),
  };
}

// Builds a sequence of EscalationRuntimeEvent frames for any TierProcedure.
// Each step gets 3 frames: active-full → active-half → timed_out → advance.
// Respects onNoResponse (stop halts, next_step continues), call_911 → at_911_intent.
function buildSequence(procedure: TierProcedure): EscalationRuntimeEvent[] {
  const { tier, steps } = procedure;
  const frames: EscalationRuntimeEvent[] = [];

  const states: StepRuntimeState[] = steps.map((s) => ({
    stepId: s.id,
    status: 'pending',
    remainingSeconds: null,
  }));

  const snapshot = () => states.map((s) => ({ ...s }));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === 'call_911') {
      states[i] = { stepId: step.id, status: 'active', remainingSeconds: null };
      frames.push({ tier, runStatus: 'at_911_intent', activeStepIndex: i, steps: snapshot() });
      return frames;
    }

    const full = step.timeoutSeconds;
    const half = Math.ceil(full / 2);

    states[i] = { stepId: step.id, status: 'active', remainingSeconds: full };
    frames.push({ tier, runStatus: 'running', activeStepIndex: i, steps: snapshot() });

    states[i] = { stepId: step.id, status: 'active', remainingSeconds: half };
    frames.push({ tier, runStatus: 'running', activeStepIndex: i, steps: snapshot() });

    states[i] = { stepId: step.id, status: 'timed_out', remainingSeconds: null };

    if (step.onNoResponse === 'stop') {
      for (let j = i + 1; j < steps.length; j++) {
        states[j] = { stepId: steps[j].id, status: 'skipped', remainingSeconds: null };
      }
      frames.push({ tier, runStatus: 'stopped', activeStepIndex: null, steps: snapshot() });
      return frames;
    }

    // timed_out frame before advancing
    frames.push({ tier, runStatus: 'running', activeStepIndex: i + 1, steps: snapshot() });
  }

  frames.push({ tier, runStatus: 'completed', activeStepIndex: null, steps: snapshot() });
  return frames;
}

const FRAME_MS = 1800;

export function EscalationViewDemo() {
  const [tier, setTier] = useState<SeverityTier>('major');
  const [event, setEvent] = useState<EscalationRuntimeEvent>(() => idleEvent('major'));
  const [running, setRunning] = useState(false);

  const sequenceRef = useRef<EscalationRuntimeEvent[]>([]);
  const frameRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function reset() {
    clearTimer();
    setRunning(false);
    frameRef.current = 0;
    setEvent(idleEvent(tier));
  }

  // Reset when tier changes
  useEffect(() => { reset(); }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  function advance() {
    const seq = sequenceRef.current;
    if (frameRef.current >= seq.length) { setRunning(false); return; }
    setEvent(seq[frameRef.current]);
    frameRef.current += 1;
    timerRef.current = setTimeout(advance, FRAME_MS);
  }

  function start() {
    clearTimer();
    sequenceRef.current = buildSequence(mockConfig[tier]);
    frameRef.current = 0;
    setEvent(idleEvent(tier));
    setRunning(true);
    timerRef.current = setTimeout(advance, 400); // short delay before first frame
  }

  // Cleanup on unmount
  useEffect(() => clearTimer, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">EscalationView — dev demo</h1>
        <p className="text-sm text-gray-500 mb-6">
          Animates a synthetic sequence for any tier. Wire to real engine events at Phase 2.
        </p>

        {/* tier selector */}
        <div className="flex gap-2 mb-6">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tier === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <EscalationView event={event} config={mockConfig} onRespond={() => reset()} onStop={() => reset()} />

        {/* controls */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={start}
            disabled={running}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Run escalation
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
