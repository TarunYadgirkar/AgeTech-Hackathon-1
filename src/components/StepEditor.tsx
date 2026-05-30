import { useState, useEffect } from 'react'
import {
  SEVERITY_TIERS,
  makeStepId,
  type EscalationConfig,
  type EscalationStep,
  type OnNoResponse,
  type SeverityTier,
  type StepType,
  type TierProcedure,
} from '../types/escalation'

const TIER_LABELS: Record<SeverityTier, string> = { minor: 'Minor', medium: 'Medium', major: 'Major' }

const TIER_TAB: Record<SeverityTier, { active: string; inactive: string; count: string }> = {
  minor: {
    active: 'border-emerald-500 text-emerald-300 bg-emerald-500/10',
    inactive: 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600',
    count: 'bg-emerald-500/20 text-emerald-400',
  },
  medium: {
    active: 'border-amber-500 text-amber-300 bg-amber-500/10',
    inactive: 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600',
    count: 'bg-amber-500/20 text-amber-400',
  },
  major: {
    active: 'border-red-500 text-red-300 bg-red-500/10',
    inactive: 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600',
    count: 'bg-red-500/20 text-red-400',
  },
}

const STEP_TYPE_LABELS: Record<StepType, string> = {
  voice_call: 'AI Voice Call',
  contact: 'Notify Contact',
  call_911: 'Call 911 (Intent)',
}

const DEFAULT_TARGETS: Record<StepType, string> = {
  voice_call: 'Margaret',
  contact: 'Emergency Contact',
  call_911: '911',
}

interface Props {
  config: EscalationConfig
  setConfig: (c: EscalationConfig) => void
  focusTier: SeverityTier | null
}

export default function StepEditor({ config, setConfig, focusTier }: Props) {
  const [activeTier, setActiveTier] = useState<SeverityTier>('major')

  useEffect(() => {
    if (focusTier) setActiveTier(focusTier)
  }, [focusTier])

  const procedure = config[activeTier]

  function updateProcedure(updated: TierProcedure) {
    setConfig({ ...config, [activeTier]: updated })
  }

  function addStep() {
    const step: EscalationStep = {
      id: makeStepId(),
      type: 'contact',
      target: 'Emergency Contact',
      timeoutSeconds: 30,
      onNoResponse: 'next_step',
    }
    updateProcedure({ ...procedure, steps: [...procedure.steps, step] })
  }

  function removeStep(id: string) {
    updateProcedure({ ...procedure, steps: procedure.steps.filter(s => s.id !== id) })
  }

  function moveStep(id: string, dir: -1 | 1) {
    const steps = [...procedure.steps]
    const idx = steps.findIndex(s => s.id === id)
    const next = idx + dir
    if (next < 0 || next >= steps.length) return
    ;[steps[idx], steps[next]] = [steps[next], steps[idx]]
    updateProcedure({ ...procedure, steps })
  }

  function updateStep(id: string, patch: Partial<EscalationStep>) {
    updateProcedure({
      ...procedure,
      steps: procedure.steps.map(s => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Escalation Procedure</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure the ordered steps for each severity tier. The engine runs them in sequence.</p>
      </div>

      {/* Tier tabs */}
      <div className="flex border-b border-slate-700">
        {SEVERITY_TIERS.map(tier => {
          const s = TIER_TAB[tier]
          const isActive = tier === activeTier
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${isActive ? s.active : s.inactive}`}
            >
              {TIER_LABELS[tier]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? s.count : 'bg-slate-700/60 text-slate-500'}`}>
                {config[tier].steps.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Step list */}
      <div className="space-y-2 min-h-16">
        {procedure.steps.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8 border border-dashed border-slate-700 rounded-xl">
            No steps yet — add one below.
          </p>
        )}
        {procedure.steps.map((step, idx) => (
          <StepRow
            key={step.id}
            step={step}
            index={idx}
            total={procedure.steps.length}
            onRemove={() => removeStep(step.id)}
            onMoveUp={() => moveStep(step.id, -1)}
            onMoveDown={() => moveStep(step.id, 1)}
            onUpdate={patch => updateStep(step.id, patch)}
          />
        ))}
      </div>

      {/* Add step button */}
      <button
        onClick={addStep}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-sm rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Step
      </button>
    </section>
  )
}

interface RowProps {
  step: EscalationStep
  index: number
  total: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onUpdate: (patch: Partial<EscalationStep>) => void
}

function StepRow({ step, index, total, onRemove, onMoveUp, onMoveDown, onUpdate }: RowProps) {
  const is911 = step.type === 'call_911'

  return (
    <div className={`bg-slate-800 border rounded-xl p-3 space-y-2.5 ${is911 ? 'border-red-800/60' : 'border-slate-700'}`}>
      {/* Top row: index + type selector + reorder + remove */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center flex-shrink-0 font-semibold">
          {index + 1}
        </span>

        <select
          value={step.type}
          onChange={e => {
            const type = e.target.value as StepType
            onUpdate({ type, target: DEFAULT_TARGETS[type] })
          }}
          className="flex-1 text-sm bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
        >
          {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map(t => (
            <option key={t} value={t}>{STEP_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* Reorder + delete */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
            className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            title="Remove step"
            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom row: target + timeout + onNoResponse */}
      <div className="flex items-center gap-2 pl-8">
        <input
          value={step.target}
          onChange={e => onUpdate({ target: e.target.value })}
          placeholder="Contact name"
          className="flex-1 text-sm bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-w-0"
        />

        {is911 ? (
          <span className="text-xs text-red-400/80 font-medium whitespace-nowrap">intent only — never dials</span>
        ) : (
          <>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                min={5}
                max={3600}
                value={step.timeoutSeconds}
                onChange={e => onUpdate({ timeoutSeconds: Math.max(5, Number(e.target.value)) })}
                className="w-16 text-sm bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-center"
              />
              <span className="text-xs text-slate-500">s</span>
            </div>
            <select
              value={step.onNoResponse}
              onChange={e => onUpdate({ onNoResponse: e.target.value as OnNoResponse })}
              className="text-xs bg-slate-700 border border-slate-600 text-slate-400 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer flex-shrink-0"
            >
              <option value="next_step">→ Next</option>
              <option value="stop">■ Stop</option>
            </select>
          </>
        )}
      </div>
    </div>
  )
}
