import type { ClassifierResult } from '../types/classifier'
import type { SeverityTier } from '../types/escalation'

const TIER_STYLES: Record<SeverityTier, {
  bg: string; border: string; text: string; badge: string; dot: string; label: string
}> = {
  minor: {
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700',
    text: 'text-emerald-200',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-600',
    dot: 'bg-emerald-400',
    label: 'Minor',
  },
  medium: {
    bg: 'bg-amber-950/60',
    border: 'border-amber-700',
    text: 'text-amber-200',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-600',
    dot: 'bg-amber-400',
    label: 'Medium',
  },
  major: {
    bg: 'bg-red-950/60',
    border: 'border-red-700',
    text: 'text-red-200',
    badge: 'bg-red-500/20 text-red-300 border-red-600',
    dot: 'bg-red-500',
    label: 'Major',
  },
}

const DEMO_SCENARIOS = [
  { label: 'Minor', text: "Margaret's morning coffee hasn't been made yet and it's 9:30am — she's usually done by 8." },
  { label: 'Medium', text: "The motion sensor shows no activity in the living room for 4 hours. She was home when her daughter last called." },
  { label: 'Major', text: "Margaret is on the floor and not responding to her name. Her daughter can hear her breathing over the phone." },
]

interface Props {
  eventText: string
  setEventText: (v: string) => void
  onClassify: () => void
  classifying: boolean
  classifyError: string | null
  result: ClassifierResult | null
  onStartEscalation: () => void
  isRunning: boolean
}

export default function Dashboard({
  eventText, setEventText, onClassify, classifying,
  classifyError, result, onStartEscalation, isRunning,
}: Props) {
  const s = result ? TIER_STYLES[result.tier] : null

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Incident Report</h2>
        <p className="text-xs text-slate-500 mt-0.5">Describe what you're observing — Claude will classify the severity and reasoning.</p>
      </div>

      {/* Demo scenario quick-fill buttons */}
      <div className="flex flex-wrap gap-2">
        {DEMO_SCENARIOS.map(({ label, text }) => (
          <button
            key={label}
            onClick={() => setEventText(text)}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            Try: {label} scenario
          </button>
        ))}
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

      {/* Error state */}
      {classifyError && (
        <div className="bg-red-950/60 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
          <span className="font-medium">Error: </span>{classifyError}
          <p className="text-xs text-red-400/70 mt-1">Make sure <code className="font-mono">vercel dev</code> is running to proxy the Claude API.</p>
        </div>
      )}

      {/* Classifier result */}
      {result && s && (
        <div className={`${s.bg} border ${s.border} rounded-xl p-4 space-y-3`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot} flex-shrink-0`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${s.badge.split(' ').find(c => c.startsWith('text-'))}`}>
              {s.label} Severity
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${s.text}`}>
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
