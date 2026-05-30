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

const RECOMMENDED: Record<SeverityTier, StepType[]> = {
  minor:  ['voice_call', 'contact'],
  medium: ['voice_call', 'contact', 'contact'],
  major:  ['voice_call', 'contact', 'call_911'],
}

const RECOMMENDED_LABEL: Record<SeverityTier, string> = {
  minor:  'AI Voice Call → Notify Contact',
  medium: 'AI Voice Call → Notify Contact → Notify Contact',
  major:  'AI Voice Call → Notify Contact → Call 911',
}

function matchesRecommended(steps: EscalationStep[], tier: SeverityTier): boolean {
  const rec = RECOMMENDED[tier]
  if (steps.length !== rec.length) return false
  return steps.every((s, i) => s.type === rec[i])
}

function has911BeforeContact(steps: EscalationStep[]): boolean {
  const i911 = steps.findIndex(s => s.type === 'call_911')
  if (i911 < 0) return false
  const hasContactBefore = steps.slice(0, i911).some(s => s.type === 'contact' || s.type === 'voice_call')
  return !hasContactBefore && i911 < steps.length - 1
}

const TIER_LABELS: Record<SeverityTier, string> = { minor: 'Minor', medium: 'Medium', major: 'Major' }

const TIER_TAB: Record<SeverityTier, { active: string; inactive: string; count: string }> = {
  minor: {
    active: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    inactive: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
    count: 'bg-emerald-100 text-emerald-700',
  },
  medium: {
    active: 'border-amber-500 text-amber-700 bg-amber-50',
    inactive: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
    count: 'bg-amber-100 text-amber-700',
  },
  major: {
    active: 'border-red-500 text-red-700 bg-red-50',
    inactive: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
    count: 'bg-red-100 text-red-700',
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
    const hasVoiceCall = procedure.steps.some(s => s.type === 'voice_call')
    const step: EscalationStep = {
      id: makeStepId(),
      type: hasVoiceCall ? 'contact' : 'voice_call',
      target: hasVoiceCall ? 'Emergency Contact' : 'Margaret',
      timeoutSeconds: 8,
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

  const deviates = procedure.steps.length > 0 && !matchesRecommended(procedure.steps, activeTier)
  const earlyNineOneOne = has911BeforeContact(procedure.steps)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Escalation Procedure</h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure the ordered steps for each severity tier. Add a phone number to each step and the system will place real calls.</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium shrink-0 whitespace-nowrap">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          Works with real phone numbers
        </div>
      </div>

      {/* Tier tabs */}
      <div className="flex border-b border-slate-200 px-2 pt-1">
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? s.count : 'bg-slate-100 text-slate-400'}`}>
                {config[tier].steps.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p-6 space-y-3">
        {/* Step list */}
        <div className="space-y-2">
          {procedure.steps.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No steps yet. Add one below.
            </div>
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

        {/* Order deviation warning */}
        {deviates && !earlyNineOneOne && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-amber-800">Different from recommended order</p>
              <p className="text-xs text-amber-700">
                Recommended for <span className="font-medium capitalize">{activeTier}</span>: {RECOMMENDED_LABEL[activeTier]}.
                Unnecessary contacts may cause alert fatigue.
              </p>
            </div>
          </div>
        )}

        {/* Early 911 warning */}
        {earlyNineOneOne && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-red-800">911 placed before human contacts</p>
              <p className="text-xs text-red-700">
                Attempt at least one voice call or contact before escalating to 911. Premature 911 calls may dispatch emergency services unnecessarily.
              </p>
            </div>
          </div>
        )}

        {/* Add step */}
        <button
          onClick={addStep}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 text-sm rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Step
        </button>
      </div>
    </div>
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
    <div className={`bg-white border rounded-xl p-3 space-y-2 ${is911 ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0 font-semibold">
          {index + 1}
        </span>

        <select
          value={step.type}
          onChange={e => {
            const type = e.target.value as StepType
            onUpdate({ type, target: DEFAULT_TARGETS[type] })
          }}
          className="flex-1 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer"
        >
          {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map(t => (
            <option key={t} value={t}>{STEP_TYPE_LABELS[t]}</option>
          ))}
        </select>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-8">
        <input
          value={step.target}
          onChange={e => onUpdate({ target: e.target.value })}
          placeholder="Contact name"
          className="flex-1 text-sm bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 min-w-0"
        />

        {is911 ? (
          <span className="text-xs text-red-500 font-medium whitespace-nowrap">intent only</span>
        ) : (
          <>
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={5}
                max={3600}
                value={step.timeoutSeconds}
                onChange={e => onUpdate({ timeoutSeconds: Math.max(5, Number(e.target.value)) })}
                className="w-16 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 text-center"
              />
              <span className="text-xs text-slate-400">s</span>
            </div>
            <select
              value={step.onNoResponse}
              onChange={e => onUpdate({ onNoResponse: e.target.value as OnNoResponse })}
              className="text-xs bg-white border border-slate-200 text-slate-500 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="next_step">→ Next</option>
              <option value="stop">■ Stop</option>
            </select>
          </>
        )}
      </div>

      {!is911 && (
        <div className="flex items-center gap-2 pl-8">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <input
            value={step.phoneNumber ?? ''}
            onChange={e => onUpdate({ phoneNumber: e.target.value || undefined })}
            placeholder="+14155551234, leave blank to skip"
            className="flex-1 text-xs bg-white border border-slate-200 text-slate-600 placeholder-slate-400 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 min-w-0"
          />
        </div>
      )}
    </div>
  )
}
