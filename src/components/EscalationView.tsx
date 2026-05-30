import type {
  EscalationConfig,
  EscalationRuntimeEvent,
  SeverityTier,
  StepStatus,
} from '../types/escalation'

const TIER_LABEL: Record<SeverityTier, string> = { minor: 'Minor', medium: 'Medium', major: 'Major' }

const TIER_COLOR: Record<SeverityTier, string> = {
  minor: 'text-emerald-400',
  medium: 'text-amber-400',
  major: 'text-red-400',
}

const STATUS_CONFIG: Record<StepStatus, { border: string; bg: string; text: string; badge: string; label: string }> = {
  pending: {
    border: 'border-slate-700',
    bg: 'bg-slate-800/50',
    text: 'text-slate-500',
    badge: 'bg-slate-700 text-slate-400',
    label: 'Pending',
  },
  active: {
    border: 'border-blue-500',
    bg: 'bg-blue-950/50',
    text: 'text-blue-100',
    badge: 'bg-blue-600 text-white',
    label: 'Active',
  },
  responded: {
    border: 'border-emerald-700',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-200',
    badge: 'bg-emerald-700 text-white',
    label: 'Responded',
  },
  timed_out: {
    border: 'border-slate-600',
    bg: 'bg-slate-800/30',
    text: 'text-slate-400',
    badge: 'bg-slate-600 text-slate-300',
    label: 'No Response',
  },
  skipped: {
    border: 'border-slate-700/50',
    bg: 'bg-slate-800/20',
    text: 'text-slate-600',
    badge: 'bg-slate-800 text-slate-600',
    label: 'Skipped',
  },
}

const STEP_TYPE_SHORT: Record<string, string> = {
  voice_call: 'Voice Call',
  contact: 'Contact',
  call_911: '911',
}

interface Props {
  event: EscalationRuntimeEvent
  config: EscalationConfig
  onRespond: () => void
  onStop: () => void
}

export default function EscalationView({ event, config, onRespond, onStop }: Props) {
  const { tier, runStatus, activeStepIndex, steps } = event
  const procedure = config[tier]
  const is911 = runStatus === 'at_911_intent'
  const isDone = is911 || runStatus === 'completed' || runStatus === 'stopped'

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              runStatus === 'running'
                ? 'bg-blue-400 animate-pulse'
                : is911
                ? 'bg-red-500 animate-pulse'
                : runStatus === 'completed'
                ? 'bg-emerald-500'
                : 'bg-slate-500'
            }`}
          />
          <h2 className="text-lg font-semibold text-slate-100">
            Live Escalation
            <span className={`ml-2 text-sm font-medium ${TIER_COLOR[tier]}`}>
              — {TIER_LABEL[tier]}
            </span>
          </h2>
        </div>
        {!isDone && (
          <button
            onClick={onStop}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 hover:bg-red-950/40 rounded-lg"
          >
            Abort
          </button>
        )}
      </div>

      {/* 911 Intent Banner */}
      {is911 && (
        <div className="bg-red-950 border-2 border-red-500 rounded-xl p-5 text-center space-y-1">
          <p className="text-red-200 text-2xl font-black tracking-widest animate-pulse">
            ⚠ CALLING 911 ⚠
          </p>
          <p className="text-red-400 text-sm">Intent state only — no real call is ever placed</p>
        </div>
      )}

      {/* Step timeline */}
      <div className="space-y-2">
        {steps.map((runtimeStep, idx) => {
          const def = procedure.steps.find(s => s.id === runtimeStep.stepId)
          if (!def) return null
          const c = STATUS_CONFIG[runtimeStep.status]
          const isActiveStep = idx === activeStepIndex && runStatus === 'running'

          return (
            <div
              key={runtimeStep.stepId}
              className={`border ${c.border} ${c.bg} rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-300`}
            >
              <span className={`w-6 h-6 rounded-full bg-slate-700/60 text-xs flex items-center justify-center flex-shrink-0 font-semibold ${c.text}`}>
                {idx + 1}
              </span>
              <div className={`flex-1 min-w-0 ${c.text}`}>
                <span className="text-sm font-medium truncate block">{def.target}</span>
                <span className="text-xs opacity-60">{STEP_TYPE_SHORT[def.type] ?? def.type}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isActiveStep && runtimeStep.remainingSeconds !== null && (
                  <span className="text-blue-300 font-mono font-bold text-base tabular-nums min-w-8 text-right">
                    {runtimeStep.remainingSeconds}s
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                  {c.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      {!isDone && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={onRespond}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Mark as Responded
          </button>
          <button
            onClick={onStop}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {runStatus === 'completed' && (
        <div className="bg-emerald-950/60 border border-emerald-700 rounded-xl p-3 text-center">
          <p className="text-emerald-300 text-sm font-medium">Incident resolved — escalation complete.</p>
        </div>
      )}
      {runStatus === 'stopped' && (
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-center">
          <p className="text-slate-400 text-sm">Escalation stopped manually.</p>
        </div>
      )}
    </section>
  )
}
