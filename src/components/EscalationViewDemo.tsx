import { useState, useEffect, useRef } from 'react';
import { EscalationView } from './EscalationView';
import { mockConfig, mockRuntimeSequence } from '../mocks';
import type { EscalationRuntimeEvent, SeverityTier } from '../types/escalation';

const TIERS: SeverityTier[] = ['minor', 'medium', 'major'];

const IDLE_EVENT = (tier: SeverityTier): EscalationRuntimeEvent => ({
  tier,
  runStatus: 'idle',
  activeStepIndex: null,
  steps: mockConfig[tier].steps.map((s) => ({
    stepId: s.id,
    status: 'pending',
    remainingSeconds: null,
  })),
});

// Step through mockRuntimeSequence, one frame per second.
export function EscalationViewDemo() {
  const [tier, setTier] = useState<SeverityTier>('major');
  const [event, setEvent] = useState<EscalationRuntimeEvent>(() => IDLE_EVENT('major'));
  const [running, setRunning] = useState(false);
  const frameRef = useRef(0);

  function reset() {
    setRunning(false);
    frameRef.current = 0;
    setEvent(IDLE_EVENT(tier));
  }

  useEffect(() => { reset(); }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    // For tiers other than major we don't have a full mock sequence —
    // synthesize a single-step sequence from idle to show the view working.
    const sequence = tier === 'major' ? mockRuntimeSequence : [];
    if (sequence.length === 0) { setRunning(false); return; }

    if (frameRef.current >= sequence.length) {
      setRunning(false);
      return;
    }

    const frame = sequence[frameRef.current];
    setEvent(frame);
    frameRef.current += 1;

    const t = setTimeout(() => {
      setRunning((r) => r); // trigger re-render to advance
    }, 2000);
    return () => clearTimeout(t);
  }, [running, event, tier]);

  function start() {
    frameRef.current = 0;
    setEvent(IDLE_EVENT(tier));
    setRunning(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">EscalationView — dev demo</h1>
        <p className="text-sm text-gray-500 mb-6">Animates through mockRuntimeSequence. Replace with real engine events at Phase 2.</p>

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

        <EscalationView procedure={mockConfig[tier]} event={event} />

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
