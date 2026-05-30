import { lazy, Suspense } from 'react'

const SplineLazy = lazy(() => import('@splinetool/react-spline'))
const SPLINE_URL = (import.meta.env.VITE_SPLINE_URL as string | undefined) ?? ''

function NetworkFallback() {
  return (
    <div className="w-full h-full rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-white/40 to-indigo-50/50 border border-slate-200/60 shadow-xl">
      {/* Background glow blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-36 h-36 bg-indigo-400/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-red-400/8 rounded-full blur-xl pointer-events-none" />

      {/* Animated ping rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute rounded-full border border-blue-300/50 animate-ping"
          style={{ width: 116, height: 116, animationDuration: '2s' }}
        />
        <div
          className="absolute rounded-full border border-amber-300/35 animate-ping"
          style={{ width: 188, height: 188, animationDuration: '3s' }}
        />
        <div
          className="absolute rounded-full border border-red-300/25 animate-ping"
          style={{ width: 268, height: 268, animationDuration: '4.2s' }}
        />
      </div>

      {/* SVG network diagram */}
      <svg viewBox="0 0 360 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ga-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>{`
            @keyframes ga-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
            @keyframes ga-dash{to{stroke-dashoffset:-20}}
            @keyframes ga-pulse{0%,100%{opacity:.6}50%{opacity:1}}
            .ga-n1{animation:ga-float 3.1s ease-in-out infinite}
            .ga-n2{animation:ga-float 3.8s ease-in-out infinite .7s}
            .ga-n3{animation:ga-float 3.4s ease-in-out infinite 1.3s}
            .ga-n4{animation:ga-float 4s ease-in-out infinite 1.9s}
            .ga-dl{animation:ga-dash 2s linear infinite}
            .ga-dp{animation:ga-pulse 2.2s ease-in-out infinite}
          `}</style>
        </defs>

        {/* Static severity rings */}
        <circle cx="180" cy="180" r="58" fill="none" stroke="#bfdbfe" strokeWidth="1" opacity="0.55" />
        <circle cx="180" cy="180" r="92" fill="none" stroke="#fde68a" strokeWidth="0.75" opacity="0.45" />
        <circle cx="180" cy="180" r="128" fill="none" stroke="#fecaca" strokeWidth="0.75" opacity="0.38" />

        {/* Animated dashed connection lines */}
        <line x1="180" y1="180" x2="70" y2="70" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="5 5" className="ga-dl" />
        <line x1="180" y1="180" x2="290" y2="70" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="5 5" className="ga-dl" style={{ animationDelay: '0.6s' }} />
        <line x1="180" y1="180" x2="70" y2="290" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="5 5" className="ga-dl" style={{ animationDelay: '1.3s' }} />
        <line x1="180" y1="180" x2="314" y2="183" stroke="#fca5a5" strokeWidth="1.2" strokeDasharray="5 5" className="ga-dl" style={{ animationDelay: '0.3s' }} />

        {/* Center home node with glow */}
        <g filter="url(#ga-glow)">
          <circle cx="180" cy="180" r="40" fill="#dbeafe" opacity="0.45" />
          <circle cx="180" cy="180" r="29" fill="#2563eb" className="ga-dp" />
        </g>
        {/* House icon */}
        <polygon points="180,162 199,179 161,179" fill="white" opacity="0.96" />
        <rect x="164" y="179" width="32" height="19" rx="1" fill="white" opacity="0.96" />
        <rect x="173" y="188" width="14" height="10" rx="1" fill="#1d4ed8" opacity="0.4" />

        {/* Satellite: Caregiver — top-left */}
        <g className="ga-n1" filter="url(#ga-glow)">
          <circle cx="70" cy="70" r="24" fill="white" opacity="0.88" />
          <circle cx="70" cy="70" r="24" fill="none" stroke="#d1fae5" strokeWidth="1.5" />
          <circle cx="70" cy="70" r="12" fill="#10b981" className="ga-dp" />
          <text x="70" y="103" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="ui-sans-serif,system-ui,sans-serif">Caregiver</text>
        </g>

        {/* Satellite: Family — top-right */}
        <g className="ga-n2" filter="url(#ga-glow)">
          <circle cx="290" cy="70" r="24" fill="white" opacity="0.88" />
          <circle cx="290" cy="70" r="24" fill="none" stroke="#dbeafe" strokeWidth="1.5" />
          <circle cx="290" cy="70" r="12" fill="#3b82f6" className="ga-dp" />
          <text x="290" y="103" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="ui-sans-serif,system-ui,sans-serif">Family</text>
        </g>

        {/* Satellite: Neighbor — bottom-left */}
        <g className="ga-n3" filter="url(#ga-glow)">
          <circle cx="70" cy="290" r="24" fill="white" opacity="0.88" />
          <circle cx="70" cy="290" r="24" fill="none" stroke="#fef3c7" strokeWidth="1.5" />
          <circle cx="70" cy="290" r="12" fill="#f59e0b" className="ga-dp" />
          <text x="70" y="323" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="ui-sans-serif,system-ui,sans-serif">Neighbor</text>
        </g>

        {/* Satellite: Emergency — right */}
        <g className="ga-n4" filter="url(#ga-glow)">
          <circle cx="314" cy="183" r="24" fill="white" opacity="0.88" />
          <circle cx="314" cy="183" r="24" fill="none" stroke="#fee2e2" strokeWidth="1.5" />
          <circle cx="314" cy="183" r="12" fill="#ef4444" className="ga-dp" />
          <text x="314" y="216" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="ui-sans-serif,system-ui,sans-serif">Emergency</text>
        </g>

        {/* Ring severity labels */}
        <text x="226" y="124" fontSize="8" fill="#93c5fd" fontWeight="700" letterSpacing="1.5" fontFamily="ui-sans-serif,system-ui,sans-serif">MINOR</text>
        <text x="250" y="89" fontSize="8" fill="#fcd34d" fontWeight="700" letterSpacing="1.5" fontFamily="ui-sans-serif,system-ui,sans-serif">MEDIUM</text>
        <text x="265" y="52" fontSize="8" fill="#fca5a5" fontWeight="700" letterSpacing="1.5" fontFamily="ui-sans-serif,system-ui,sans-serif">MAJOR</text>
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
    <section id="hero" className="w-full min-h-screen flex items-center pt-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 gap-16 items-center">

          {/* Left — headline + CTAs */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">
                Elder-care escalation intelligence
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-[3.25rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
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
                onClick={onGoToScenario}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Try an example
              </button>
              <button
                onClick={onGoToDashboard}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                Try a custom scenario
              </button>
            </div>

            {/* Stat strip */}
            <div className="flex items-center gap-8 pt-2 border-t border-slate-100">
              {[
                { num: '28M', label: 'older adults living alone' },
                { num: '3h+', label: 'avg. response delay' },
                { num: '60%', label: 'fall victims wait alone' },
              ].map(({ num, label }) => (
                <div key={num}>
                  <p className="text-xl font-bold text-slate-900">{num}</p>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Spline or animated SVG card */}
          <div className="h-[500px]">
            {SPLINE_URL ? (
              <Suspense fallback={<NetworkFallback />}>
                <SplineLazy scene={SPLINE_URL} className="w-full h-full rounded-3xl" />
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
