type View = 'overview' | 'dashboard'

const SCENARIOS = [
  {
    label: 'Routine Deviation',
    tier: 'Minor',
    tierColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: "Margaret's curtains haven't opened. It's 11am — she opens them every morning by 7. Sensor has logged no movement in the bedroom.",
    text: "Smart sensor: Margaret's curtains haven't opened. It's 11am — she opens them by 7 every morning without exception.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    label: 'Prolonged Inactivity',
    tier: 'Medium',
    tierColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description: "Motion sensors show no activity anywhere in the apartment for over 4 hours. Eleanor typically moves between rooms every 45 minutes.",
    text: "Motion sensors: no movement detected anywhere in the apartment for over 4 hours. Margaret typically moves between rooms every 45–60 minutes.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Fall Detected',
    tier: 'Major',
    tierColor: 'text-red-700 bg-red-50 border-red-200',
    description: "Wearable fall detector triggered in the hallway. No movement for 6 minutes. Not responding to automated check-in calls.",
    text: "Wearable fall detection alert: Margaret's device detected a hard fall in the hallway 6 minutes ago. She has not stood up and is not responding to automated check-in calls.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
]

const HOW_STEPS = [
  {
    num: '01',
    title: 'Sensor flags an anomaly',
    body: 'A smart home device, wearable, or caregiver inputs a free-text description of what was detected.',
  },
  {
    num: '02',
    title: 'AI classifies severity',
    body: 'The system reads the description and assigns a tier — minor, medium, or major — with a plain-language explanation.',
  },
  {
    num: '03',
    title: 'Escalation procedure runs',
    body: 'Configured contacts are called in order. Each step waits for a response. If no answer, the next contact is tried.',
  },
  {
    num: '04',
    title: 'Response confirmed',
    body: 'When someone picks up the call, the system marks the incident resolved. If the chain completes without response, 911 is shown as a final intent.',
  },
]

interface Props {
  onScenarioSelect: (text: string) => void
  onNavigate: (view: View) => void
}

export default function OverviewPage({ onScenarioSelect, onNavigate }: Props) {
  return (
    <div className="px-8 py-10 space-y-12">

      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Elder-Care Escalation</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Detection is only half the problem.<br />
          <span className="text-slate-500 font-normal">The other half is making sure a human responds.</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-xl">
          GuardianAlert is a check-in system that automatically alerts the right people — family, neighbors, emergency services — when something is wrong with an older adult living alone.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            Open Dashboard
          </button>
          <button
            onClick={() => document.getElementById('scenarios')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            See it in action
          </button>
        </div>
      </div>

      {/* Problem callout */}
      <div className="bg-slate-900 rounded-2xl p-7 space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">The Problem</p>
        <p className="text-xl font-semibold text-white leading-snug">
          Existing systems detect events.<br />They rarely ensure anyone responds.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { stat: '23%', label: 'of elder falls go undiscovered for over an hour' },
            { stat: '4.5h', label: 'average delay between detection and human response' },
            { stat: '1 in 3', label: 'older adults live alone with no immediate contact' },
          ].map(({ stat, label }) => (
            <div key={stat} className="space-y-1">
              <p className="text-2xl font-bold text-white">{stat}</p>
              <p className="text-xs text-slate-400 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">How it works</p>
          <h2 className="text-xl font-semibold text-slate-900">From alert to response — automatically</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {HOW_STEPS.map(({ num, title, body }) => (
            <div key={num} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-blue-600 font-mono">{num}</span>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario demo */}
      <div id="scenarios" className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Try it</p>
          <h2 className="text-xl font-semibold text-slate-900">Select an incident scenario</h2>
          <p className="text-sm text-slate-500 mt-1">Click a scenario to load it, then classify with AI on the dashboard.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SCENARIOS.map(({ label, tier, tierColor, description, text, icon }) => (
            <button
              key={label}
              onClick={() => { onScenarioSelect(text); onNavigate('dashboard') }}
              className="text-left bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors shrink-0">
                  {icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tierColor} shrink-0`}>
                  {tier}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700">
                Load scenario
                <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
