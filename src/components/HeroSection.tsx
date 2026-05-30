import { lazy, Suspense } from 'react'

const SplineLazy = lazy(() => import('@splinetool/react-spline'))
const SPLINE_URL = (import.meta.env.VITE_SPLINE_URL as string | undefined) ?? ''

function NetworkFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Animated ping rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border border-blue-300 animate-ping"
          style={{ width: 140, height: 140, animationDuration: '2s', opacity: 0.25 }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border border-amber-300 animate-ping"
          style={{ width: 210, height: 210, animationDuration: '3s', opacity: 0.18 }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border border-red-300 animate-ping"
          style={{ width: 290, height: 290, animationDuration: '4s', opacity: 0.12 }}
        />
      </div>

      {/* Static SVG diagram */}
      <svg viewBox="0 0 360 360" className="w-full h-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        {/* Static severity rings */}
        <circle cx="180" cy="180" r="65" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" opacity="0.6" />
        <circle cx="180" cy="180" r="100" fill="none" stroke="#fde68a" strokeWidth="0.75" opacity="0.5" />
        <circle cx="180" cy="180" r="138" fill="none" stroke="#fecaca" strokeWidth="0.75" opacity="0.45" />

        {/* Connection lines */}
        <line x1="180" y1="180" x2="70" y2="70" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 4" />
        <line x1="180" y1="180" x2="290" y2="70" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 4" />
        <line x1="180" y1="180" x2="70" y2="290" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 4" />
        <line x1="180" y1="180" x2="316" y2="180" stroke="#fca5a5" strokeWidth="1" strokeDasharray="5 4" />

        {/* Center home node */}
        <circle cx="180" cy="180" r="32" fill="#2563eb" />
        {/* House: roof */}
        <polygon points="180,160 200,178 160,178" fill="white" opacity="0.92" />
        {/* House: walls */}
        <rect x="164" y="178" width="32" height="19" rx="1" fill="white" opacity="0.92" />
        {/* House: door */}
        <rect x="175" y="186" width="10" height="11" rx="1" fill="#1d4ed8" opacity="0.55" />

        {/* Caregiver — top left */}
        <circle cx="70" cy="70" r="22" fill="white" stroke="#d1fae5" strokeWidth="2" />
        <circle cx="70" cy="70" r="11" fill="#10b981" />
        <text x="70" y="101" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="ui-sans-serif,system-ui,sans-serif">Caregiver</text>

        {/* Family — top right */}
        <circle cx="290" cy="70" r="22" fill="white" stroke="#dbeafe" strokeWidth="2" />
        <circle cx="290" cy="70" r="11" fill="#3b82f6" />
        <text x="290" y="101" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="ui-sans-serif,system-ui,sans-serif">Family</text>

        {/* Neighbor — bottom left */}
        <circle cx="70" cy="290" r="22" fill="white" stroke="#fef3c7" strokeWidth="2" />
        <circle cx="70" cy="290" r="11" fill="#f59e0b" />
        <text x="70" y="321" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="ui-sans-serif,system-ui,sans-serif">Neighbor</text>

        {/* Emergency — right */}
        <circle cx="316" cy="180" r="22" fill="white" stroke="#fee2e2" strokeWidth="2" />
        <circle cx="316" cy="180" r="11" fill="#ef4444" />
        <text x="316" y="211" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="ui-sans-serif,system-ui,sans-serif">Emergency</text>

        {/* Ring labels */}
        <text x="222" y="124" fontSize="8" fill="#93c5fd" fontFamily="ui-sans-serif,system-ui,sans-serif" fontWeight="700" letterSpacing="1">MINOR</text>
        <text x="248" y="90" fontSize="8" fill="#fcd34d" fontFamily="ui-sans-serif,system-ui,sans-serif" fontWeight="700" letterSpacing="1">MEDIUM</text>
        <text x="265" y="52" fontSize="8" fill="#fca5a5" fontFamily="ui-sans-serif,system-ui,sans-serif" fontWeight="700" letterSpacing="1">MAJOR</text>
      </svg>
    </div>
  )
}

interface Props {
  onGoToDashboard: () => void
  onGoToScenario: () => void
}

export default function HeroSection({ onGoToDashboard, onGoToScenario }: Props) {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-8 w-full py-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Elder-care escalation intelligence</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-[3.5rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
                Detection without
                <br />
                <span className="text-blue-600">response</span>{' '}
                <span className="text-slate-400 font-normal">isn't</span>
                <br />
                <span className="text-slate-400 font-normal">safety.</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                GuardianAlert closes the gap between a sensor flagging an event and a human confirming someone is safe — automatically, with verified escalation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoToDashboard}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Open Dashboard
              </button>
              <button
                onClick={onGoToScenario}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                See it in action →
              </button>
            </div>

            {/* Mini stat strip */}
            <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
              {[
                { num: '28M', label: 'older adults living alone' },
                { num: '3h+', label: 'avg. delay without automation' },
                { num: '60%', label: 'fall victims wait alone' },
              ].map(({ num, label }) => (
                <div key={num}>
                  <p className="text-lg font-bold text-slate-900">{num}</p>
                  <p className="text-xs text-slate-400 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Spline or fallback */}
          <div className="h-[480px] relative">
            {SPLINE_URL ? (
              <Suspense fallback={<NetworkFallback />}>
                <SplineLazy scene={SPLINE_URL} className="w-full h-full" />
              </Suspense>
            ) : (
              <NetworkFallback />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
