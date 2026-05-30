import type {
  EscalationRuntimeEvent,
  TierProcedure,
  EscalationStep,
  StepRuntimeState,
  RunStatus,
  StepStatus,
} from '../types/escalation';

interface EscalationViewProps {
  procedure: TierProcedure;
  event: EscalationRuntimeEvent;
}

const TIER_LABEL: Record<string, string> = {
  minor: 'Minor',
  medium: 'Medium',
  major: 'Major',
};

const TIER_COLOR: Record<string, string> = {
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  medium: 'bg-orange-100 text-orange-800 border-orange-300',
  major: 'bg-red-100 text-red-800 border-red-300',
};

const RUN_STATUS_BANNER: Record<RunStatus, { label: string; classes: string }> = {
  idle:          { label: 'Ready',                              classes: 'bg-gray-100 text-gray-600' },
  running:       { label: 'Escalation in progress',            classes: 'bg-blue-50 text-blue-700' },
  at_911_intent: { label: '911 — Emergency services notified', classes: 'bg-red-600 text-white animate-pulse' },
  stopped:       { label: 'Escalation stopped',                classes: 'bg-orange-100 text-orange-700' },
  completed:     { label: 'Incident resolved',                 classes: 'bg-green-100 text-green-700' },
};

function StepIcon({ type }: { type: EscalationStep['type'] }) {
  if (type === 'call_911') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
      </svg>
    );
  }
  if (type === 'voice_call') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function stepStatusStyle(status: StepStatus): string {
  switch (status) {
    case 'active':     return 'bg-blue-500 text-white ring-4 ring-blue-200';
    case 'responded':  return 'bg-green-500 text-white';
    case 'timed_out':  return 'bg-orange-400 text-white';
    case 'skipped':    return 'bg-gray-200 text-gray-400';
    case 'pending':
    default:           return 'bg-gray-100 text-gray-400 border border-gray-300';
  }
}

function stepCardStyle(status: StepStatus, is911: boolean): string {
  if (is911 && status === 'active') {
    return 'border-2 border-red-500 bg-red-50 shadow-lg shadow-red-100';
  }
  switch (status) {
    case 'active':    return 'border-2 border-blue-400 bg-blue-50 shadow-md';
    case 'responded': return 'border border-green-300 bg-green-50 opacity-80';
    case 'timed_out': return 'border border-orange-300 bg-orange-50 opacity-80';
    case 'skipped':   return 'border border-gray-200 bg-gray-50 opacity-40';
    case 'pending':
    default:          return 'border border-gray-200 bg-white';
  }
}

function StatusBadge({ status }: { status: StepStatus }) {
  const configs: Record<StepStatus, { label: string; classes: string }> = {
    pending:    { label: 'Waiting',    classes: 'bg-gray-100 text-gray-500' },
    active:     { label: 'Active',     classes: 'bg-blue-100 text-blue-700' },
    responded:  { label: 'Responded',  classes: 'bg-green-100 text-green-700' },
    timed_out:  { label: 'No response',classes: 'bg-orange-100 text-orange-700' },
    skipped:    { label: 'Skipped',    classes: 'bg-gray-100 text-gray-400' },
  };
  const { label, classes } = configs[status];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes}`}>
      {label}
    </span>
  );
}

function Countdown({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const display = m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
  return (
    <span className="font-mono text-2xl font-bold text-blue-600 tabular-nums">
      {display}
    </span>
  );
}

function StepCard({
  step,
  runtime,
  index,
}: {
  step: EscalationStep;
  runtime: StepRuntimeState;
  index: number;
}) {
  const is911 = step.type === 'call_911';
  const isActive = runtime.status === 'active';

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${stepCardStyle(runtime.status, is911)}`}>
      <div className="flex items-center gap-3">
        {/* circle index */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${stepStatusStyle(runtime.status)}`}>
          {runtime.status === 'responded' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          ) : runtime.status === 'timed_out' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 5h-2v6h2V7zm0 8h-2v2h2v-2z" />
            </svg>
          ) : (
            index + 1
          )}
        </div>

        {/* step info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1 text-sm font-medium ${is911 ? 'text-red-700' : 'text-gray-800'}`}>
              <StepIcon type={step.type} />
              {step.type === 'call_911' ? 'Call 911' : step.type === 'voice_call' ? 'Voice call' : 'Notify contact'}
            </span>
            <StatusBadge status={runtime.status} />
          </div>
          <p className={`text-sm mt-0.5 ${is911 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {step.target}
          </p>
        </div>

        {/* countdown or timeout label */}
        <div className="flex-shrink-0 text-right">
          {isActive && runtime.remainingSeconds !== null && (
            <Countdown seconds={runtime.remainingSeconds} />
          )}
          {!isActive && runtime.status === 'pending' && (
            <span className="text-xs text-gray-400">{step.timeoutSeconds}s timeout</span>
          )}
        </div>
      </div>

      {/* 911 intent callout */}
      {is911 && isActive && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-100 border border-red-300 px-3 py-2">
          <span className="text-red-600 text-sm font-semibold">
            Emergency services intent displayed — no real call is made
          </span>
        </div>
      )}
    </div>
  );
}

export function EscalationView({ procedure, event }: EscalationViewProps) {
  const banner = RUN_STATUS_BANNER[event.runStatus];

  const runtimeById = Object.fromEntries(
    event.steps.map((s) => [s.stepId, s])
  );

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      {/* tier badge + run status banner */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${TIER_COLOR[event.tier]}`}>
          {TIER_LABEL[event.tier]} severity
        </span>
        <span className={`flex-1 text-sm font-medium px-3 py-1 rounded-full ${banner.classes}`}>
          {banner.label}
        </span>
      </div>

      {/* step timeline */}
      <div className="relative flex flex-col gap-2">
        {/* connecting line */}
        <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gray-200 -z-10" />

        {procedure.steps.map((step, i) => {
          const runtime = runtimeById[step.id] ?? {
            stepId: step.id,
            status: 'pending' as const,
            remainingSeconds: null,
          };
          return (
            <StepCard key={step.id} step={step} runtime={runtime} index={i} />
          );
        })}
      </div>

      {/* empty state */}
      {procedure.steps.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          No steps configured for this tier.
        </p>
      )}
    </div>
  );
}
