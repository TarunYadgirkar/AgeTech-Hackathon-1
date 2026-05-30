import type { ClassifierResult } from '../types/classifier'
import type { SeverityTier } from '../types/escalation'
import { DEMO_SCENARIOS } from '../lib/copy'

const TIER_CONFIG: Record<SeverityTier, { label: string; dot: string; badge: string; card: string; heading: string }> = {
  minor: {
    label: 'Minor',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    card: 'border-emerald-200 bg-emerald-50/40',
    heading: 'text-emerald-800',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    card: 'border-amber-200 bg-amber-50/40',
    heading: 'text-amber-800',
  },
  major: {
    label: 'Major',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    card: 'border-red-200 bg-red-50/40',
    heading: 'text-red-800',
  },
}

interface Props {
  eventText: string
  setEventText: (v: string) => void
  onClassify: () => void
  onScenarioSelect: (text: string) => void
  classifying: boolean
  classifyError: string | null
  result: ClassifierResult | null
  isRunning: boolean
}

export default function Dashboard({
  eventText, setEventText, onClassify, onScenarioSelect, classifying,
  classifyError, result, isRunning,
}: Props) {
  const t = result ? TIER_CONFIG[result.tier] : null

  return (
    <div className="space-y-5">
      {/* Incident input card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">New Incident Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">Describe the observation — AI classifies severity and initiates escalation</p>
          </div>
          <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Scenario presets */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quick scenarios</p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_SCENARIOS.map(({ label, text }) => (
              <button
                key={label}
                onClick={() => onScenarioSelect(text)}
                disabled={classifying || isRunning}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="space-y-3">
          <textarea
            value={eventText}
            onChange={e => setEventText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onClassify() }}
            placeholder="e.g. Motion sensors show no activity in the bedroom for 6 hours..."
            rows={3}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={onClassify}
              disabled={classifying || !eventText.trim() || isRunning}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              {classifying ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Classifying…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Classify with AI
                </>
              )}
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">⌘↵ to submit</span>
          </div>
        </div>

        {/* Error */}
        {classifyError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <span className="font-medium">Classification error: </span>{classifyError}
          </div>
        )}
      </div>

      {/* Classification result */}
      {result && t && (
        <div className={`bg-white border rounded-2xl shadow-sm p-6 ${t.card}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${t.heading}`}>{t.label} Severity</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.badge}`}>
                  AI Classification
                </span>
                {isRunning && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Escalating
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-medium text-slate-900">Reasoning: </span>
                {result.reasoning}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
