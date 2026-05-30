import type {
  EscalationConfig,
  EscalationRuntimeEvent,
  SeverityTier,
  StepStatus,
} from '../types/escalation'

const TIER_LABEL: Record<SeverityTier, string> = { minor: 'Minor', medium: 'Medium', major: 'Major' }

const TIER_BADGE: Record<SeverityTier, string> = {
  minor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  major: 'bg-red-50 text-red-700 border border-red-200',
}

const STATUS_CONFIG: Record<StepStatus, {
  row: string; num: string; text: string; sub: string; badge: string; label: string
}> = {
  pending: {
    row: 'border-slate-200 bg-white',
    num: 'bg-slate-100 text-slate-400',
    text: 'text-slate-400',
    sub: 'text-slate-400',
    badge: 'bg-slate-100 text-slate-500',
    label: 'Waiting',
  },
  active: {
    row: 'border-blue-200 bg-blue-50',
    num: 'bg-blue-100 text-blue-700',
    text: 'text-slate-900',
    sub: 'text-slate-500',
    badge: 'bg-blue-600 text-white',
    label: 'Active',
  },
  responded: {
    row: 'border-emerald-200 bg-emerald-50',
    num: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-800',
    sub: 'text-emerald-600',
    badge: 'bg-emerald-600 text-white',
    label: 'Responded',
  },
  timed_out: {
    row: 'border-slate-200 bg-slate-50',
    num: 'bg-slate-100 text-slate-400',
    text: 'text-slate-400',
    sub: 'text-slate-400',
    badge: 'bg-slate-200 text-slate-500',
    label: 'No Response',
  },
  skipped: {
    row: 'border-slate-100 bg-slate-50',
    num: 'bg-slate-50 text-slate-300',
    text: 'text-slate-300',
    sub: 'text-slate-300',
    badge: 'bg-slate-100 text-slate-300',
    label: 'Skipped',
  },
}

const STEP_TYPE_LABEL: Record<string, string> = {
  voice_call: 'AI Voice Call',
  contact: 'Notify Contact',
  call_911: 'Emergency Services',
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            runStatus === 'running' ? 'bg-blue-500 animate-pulse'
            : is911 ? 'bg-red-500 animate-pulse'
            : runStatus === 'completed' ? 'bg-emerald-500'
            : 'bg-slate-300'
          }`} />
          <h2 className="text-base font-semibold text-slate-900">Active Escalation</h2>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_BADGE[tier]}`}>
            {TIER_LABEL[tier]}
          </span>
        </div>
        {!isDone && (
          <button
            onClick={onStop}
            className="text-xs text-slate-400 hover:text-red-600 transition-colors px-3 py-1.5 border border-transparent hover:border-red-200 hover:bg-red-50 rounded-lg"
          >
            Abort
          </button>
        )}
      </div>

      {/* 911 Intent */}
      {is911 && (
        <div className="mx-6 mt-5 bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <p className="text-red-700 text-sm font-bold tracking-wide">EMERGENCY SERVICES — 911</p>
          </div>
          <p className="text-red-500 text-xs">Intent state only — no real call is placed in this demo</p>
        </div>
      )}

      {/* Step timeline */}
      <div className="p-6 space-y-2">
        {steps.map((runtimeStep, idx) => {
          const def = procedure.steps.find(s => s.id === runtimeStep.stepId)
          if (!def) return null
          const c = STATUS_CONFIG[runtimeStep.status]
          const isActiveStep = idx === activeStepIndex && runStatus === 'running'

          return (
            <div
              key={runtimeStep.stepId}
              className={`border ${c.row} rounded-xl px-4 py-3 flex items-center gap-3`}
            >
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center shrink-0 font-semibold ${c.num}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${c.text}`}>{def.target}</p>
                <p className={`text-xs ${c.sub}`}>{STEP_TYPE_LABEL[def.type] ?? def.type}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {isActiveStep && runtimeStep.remainingSeconds !== null && (
                  <span className="text-blue-700 font-mono font-semibold text-sm tabular-nums bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
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
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onRespond}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Mark as Responded
          </button>
          <button
            onClick={onStop}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {/* Terminal states */}
      {runStatus === 'completed' && (
        <div className="mx-6 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-emerald-700 text-sm font-medium">Incident resolved — escalation complete</p>
        </div>
      )}
      {runStatus === 'stopped' && (
        <div className="mx-6 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-slate-500 text-sm">Escalation stopped manually</p>
        </div>
      )}
    </div>
  )
}
