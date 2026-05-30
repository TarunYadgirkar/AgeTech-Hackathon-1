import type { ClassifierResult } from '../types/classifier'
import type { SeverityTier } from '../types/escalation'
import { DEMO_SCENARIOS } from '../lib/copy'

const TIER_STYLES: Record<SeverityTier, {
  bg: string; border: string; text: string; dot: string; label: string
}> = {
  minor: {
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700',
    text: 'text-emerald-200',
    dot: 'bg-emerald-400',
    label: 'Minor',
  },
  medium: {
    bg: 'bg-amber-950/60',
    border: 'border-amber-700',
    text: 'text-amber-200',
    dot: 'bg-amber-400',
    label: 'Medium',
  },
  major: {
    bg: 'bg-red-950/60',
    border: 'border-red-700',
    text: 'text-red-200',
    dot: 'bg-red-500',
    label: 'Major',
  },
}

const SCENARIO_PILL: Record<SeverityTier, string> = {
  minor:  'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 hover:border-emerald-600 hover:bg-emerald-950',
  medium: 'bg-amber-950/50  border-amber-800/60  text-amber-300  hover:border-amber-600  hover:bg-amber-950',
  major:  'bg-red-950/50    border-red-800/60    text-red-300    hover:border-red-600    hover:bg-red-950',
}

const TIER_DOT: Record<SeverityTier, string> = {
  minor: 'bg-emerald-400',
  medium: 'bg-amber-400',
  major: 'bg-red-400',
}

interface Props {
  eventText: string
  setEventText: (v: string) => void
  onClassify: () => void
  onScenarioSelect: (text: string) => void
  classifying: boolean
  classifyError: string | null
  result: ClassifierResult | null
  onStartEscalation: () => void
  isRunning: boolean
}

export default function Dashboard({
  eventText, setEventText, onClassify, onScenarioSelect, classifying,
  classifyError, result, onStartEscalation, isRunning,
}: Props) {
  const s = result ? TIER_STYLES[result.tier] : null

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Incident Report</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Describe what you're observing — Claude classifies the severity and shows its reasoning.
        </p>
      </div>

      {/* Demo scenario presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Try a scenario</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map(({ label, tier, text }) => (
            <button
              key={label}
              onClick={() => onScenarioSelect(text)}
              disabled={classifying}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full transition-all disabled:opacity-40 ${SCENARIO_PILL[tier]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TIER_DOT[tier]}`} />
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
          placeholder="e.g. 'Margaret hasn't gotten out of bed and it's 1pm'"
          rows={3}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={onClassify}
            disabled={classifying || !eventText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {classifying ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Classifying…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Classify with AI
              </>
            )}
          </button>
          <span className="text-xs text-slate-500 hidden sm:inline">⌘↵ to submit</span>
        </div>
      </div>

      {/* Error */}
      {classifyError && (
        <div className="bg-red-950/60 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
          <span className="font-medium">Error: </span>{classifyError}
          <p className="text-xs text-red-400/70 mt-1">
            Make sure <code className="font-mono">vercel dev</code> is running to proxy the Claude API.
          </p>
        </div>
      )}

      {/* Classifier result */}
      {result && s && (
        <div className={`${s.bg} border ${s.border} rounded-xl p-4 space-y-3`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${s.text}`}>
              {s.label} Severity
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            <span className="font-medium text-slate-300">AI Reasoning: </span>
            {result.reasoning}
          </p>
          <div className="pt-1 border-t border-white/10">
            <button
              onClick={onStartEscalation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 active:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isRunning ? (
                <>
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  Escalation Running…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Start Escalation
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
