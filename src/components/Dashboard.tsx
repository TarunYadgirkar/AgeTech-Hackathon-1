import type { ClassifierResult } from '../types/classifier'
import type { SeverityTier } from '../types/escalation'

const TIER_CONFIG: Record<SeverityTier, { label: string; dot: string; badge: string; card: string; heading: string }> = {
  minor: {
    label: 'Minor',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    card: 'border-emerald-200 bg-emerald-50/30',
    heading: 'text-emerald-800',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    card: 'border-amber-200 bg-amber-50/30',
    heading: 'text-amber-800',
  },
  major: {
    label: 'Major',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    card: 'border-red-200 bg-red-50/30',
    heading: 'text-red-800',
  },
}

interface Props {
  eventText: string
  setEventText: (v: string) => void
  onClassify: () => void
  classifying: boolean
  classifyError: string | null
  result: ClassifierResult | null
  isRunning: boolean
}

export default function Dashboard({
  eventText, setEventText, onClassify, classifying, classifyError, result, isRunning,
}: Props) {
  const t = result ? TIER_CONFIG[result.tier] : null

  return (
    <div className="space-y-4">
      {/* Incident input */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Incident Description</h2>
            <p className="text-xs text-slate-400 mt-0.5">Describe the observation — AI assigns severity and initiates escalation</p>
          </div>
          <span className="text-xs text-slate-400 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <textarea
          value={eventText}
          onChange={e => setEventText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onClassify() }}
          placeholder="e.g. Motion sensors show no activity in the bedroom for 6 hours..."
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={onClassify}
            disabled={classifying || !eventText.trim() || isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
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
          {isRunning && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Escalation running
            </span>
          )}
        </div>

        {classifyError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <span className="font-medium">Error: </span>{classifyError}
          </div>
        )}
      </div>

      {/* Classification result */}
      {result && t && (
        <div className={`bg-white border rounded-2xl shadow-sm p-5 ${t.card}`}>
          <div className="flex items-start gap-3">
            <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${t.dot}`} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-widest ${t.heading}`}>{t.label} Severity</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.badge}`}>AI Classification</span>
                {isRunning && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
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
