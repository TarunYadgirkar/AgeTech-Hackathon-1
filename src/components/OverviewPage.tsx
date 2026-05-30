const STATS = [
  {
    num: '28M',
    label: 'Older adults living alone',
    detail: 'In the US alone — with no immediate person to check on them when something goes wrong.',
  },
  {
    num: '3+ hrs',
    label: 'Delayed escalation',
    detail: 'The average time for emergency help to reach an isolated senior after a fall, when no automated alert exists.',
  },
  {
    num: '1 in 3',
    label: 'Caregiver uncertainty',
    detail: 'Seniors who fall do not call for help, leaving caregivers unaware until the situation becomes critical.',
  },
]

const PROBLEM_CARDS = [
  {
    title: 'Sensors see it. No one acts.',
    body: 'Smart home devices and wearables have become remarkably good at detecting falls, irregular patterns, and inactivity. But detection alone does not make anyone safe. The gap between a sensor firing and a human confirming a person is okay has remained largely unaddressed.',
  },
  {
    title: 'Emergencies are rarely clear-cut.',
    body: 'When an older adult says they feel dizzy, haven\'t gotten up yet, or their curtains haven\'t opened — that information is ambiguous. Caregivers can\'t always assess severity from a text notification, and response is inconsistent as a result.',
  },
  {
    title: 'Manual coordination fails under pressure.',
    body: 'When something happens at 2 AM, a family member scrambling to call through a contacts list is not a reliable response plan. Without a structured escalation procedure, critical time is lost — and the people who need to respond are often the last to know.',
  },
]

const DEMO_STEPS = [
  {
    num: 1,
    label: 'AI Voice Check',
    sub: 'Retell calls Mary directly',
    outcome: 'No answer',
    ring: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    num: 2,
    label: 'Daughter — Sarah',
    sub: 'Family notified by Twilio',
    outcome: 'No answer',
    ring: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
  },
  {
    num: 3,
    label: 'Neighbor — Tom',
    sub: 'Backup contact activated',
    outcome: 'No answer',
    ring: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    num: 4,
    label: '911 Intent',
    sub: 'Shown only — not dialed',
    outcome: 'Intent state',
    ring: 'border-red-200 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
]

const LOAD_SCENARIOS = [
  {
    label: 'Routine Deviation',
    tier: 'Minor',
    tierColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: "Margaret's curtains haven't opened. It's 11 AM — she opens them by 7 every morning.",
    text: "Smart sensor: Margaret's curtains haven't opened. It's 11am — she opens them by 7 every morning without exception. Bedroom motion sensor also shows no activity since midnight.",
  },
  {
    label: 'Prolonged Inactivity',
    tier: 'Medium',
    tierColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description: 'Motion sensors show no activity anywhere in the apartment for over 4 hours.',
    text: "Motion sensors: no movement detected anywhere in the apartment for over 4 hours. Margaret typically moves between rooms every 45–60 minutes. Last detected motion was at 6:12 AM.",
  },
  {
    label: 'Fall Detected',
    tier: 'Major',
    tierColor: 'text-red-700 bg-red-50 border-red-200',
    description: 'Wearable fall detector triggered in the hallway. No movement for 6 minutes.',
    text: "Wearable fall detection alert: Margaret's device detected a hard fall in the hallway 6 minutes ago. She has not stood up and is not responding to automated check-in calls from the device.",
  },
]

interface Props {
  onScenarioSelect: (text: string) => void
}

export default function OverviewPage({ onScenarioSelect }: Props) {
  return (
    <>
      {/* ── Problem ── */}
      <section id="problem" className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 space-y-14">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">The Problem</p>
            <h2 className="text-3xl font-bold text-slate-900 leading-snug">
              Existing systems detect events.<br />
              They rarely ensure anyone responds.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {PROBLEM_CARDS.map(({ title, body }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-slate-900 rounded-2xl p-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">By the numbers</p>
            <div className="grid grid-cols-3 gap-8 divide-x divide-slate-700/50">
              {STATS.map(({ num, label, detail }) => (
                <div key={num} className="space-y-2 first:pl-0 pl-8">
                  <p className="text-4xl font-bold text-white tabular-nums">{num}</p>
                  <p className="text-sm font-semibold text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Scenario demo ── */}
      <section id="scenario" className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">How it works</p>
            <h2 className="text-3xl font-bold text-slate-900">From alert to response — automatically</h2>
            <p className="text-slate-500 text-base">A real scenario, showing how GuardianAlert classifies and escalates a care event without any manual coordination.</p>
          </div>

          {/* Incident card */}
          <div className="bg-slate-900 rounded-2xl p-7 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Incident · 2:14 AM</p>
                <p className="text-lg font-medium text-white leading-snug max-w-2xl">
                  "Mary's wearable detected a hard fall in the hallway. She has not stood up and is not responding to automated device check-ins."
                </p>
              </div>
              <div className="shrink-0 px-4 py-2 bg-red-500 rounded-xl text-center">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Severity</p>
                <p className="text-xl font-bold text-white mt-0.5">MAJOR</p>
                <p className="text-xs text-red-200 mt-0.5">AI Classification</p>
              </div>
            </div>
          </div>

          {/* Escalation path */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Escalation path — automated</p>
            <div className="flex items-stretch gap-0">
              {DEMO_STEPS.map((step, i) => (
                <div key={step.num} className="flex items-stretch flex-1">
                  <div className={`flex-1 border ${step.ring} rounded-2xl p-5 space-y-3`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step.badge}`}>
                        {step.num}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${step.dot}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sub}</p>
                    </div>
                    <div>
                      <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500 font-medium">
                        {step.outcome}
                      </span>
                    </div>
                  </div>
                  {i < DEMO_STEPS.length - 1 && (
                    <div className="flex items-center px-2 shrink-0 text-slate-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              * 911 is shown as intent only. No real emergency call is placed in this system.
            </p>
          </div>

          {/* Load scenarios */}
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Try a scenario on the dashboard</h3>
              <p className="text-sm text-slate-400">Click to load the incident text — then classify with AI to see the full escalation procedure run.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {LOAD_SCENARIOS.map(({ label, tier, tierColor, description, text }) => (
                <button
                  key={label}
                  onClick={() => onScenarioSelect(text)}
                  className="text-left bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-5 space-y-3 shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tierColor}`}>
                      {tier}
                    </span>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                  </div>
                  <p className="text-xs font-medium text-blue-600 group-hover:text-blue-700">Load scenario →</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
