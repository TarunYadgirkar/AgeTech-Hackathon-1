import { lazy, Suspense } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Set this to a real Spline scene URL to enable the 3D hero
const SPLINE_SCENE = ''

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800">
      {SPLINE_SCENE && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <Spline scene={SPLINE_SCENE} />
          </div>
        </Suspense>
      )}

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">GuardianAlert</h1>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-700/80 text-slate-300 rounded-full border border-slate-600 hidden sm:inline">
            AgeTech SF 2026
          </span>
        </div>
        <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
          Intelligent, <span className="text-white font-medium">user-configurable escalation</span> for elder-care events —
          AI classifies the severity, then runs your procedure step by step until a human takes ownership.
        </p>
        <div className="flex flex-wrap gap-4 mt-5">
          <Pill color="emerald" label="Minor" desc="Gentle check-in" />
          <Pill color="amber" label="Medium" desc="Contact escalation" />
          <Pill color="red" label="Major" desc="Emergency response" />
        </div>
      </div>
    </div>
  )
}

function Pill({ color, label, desc }: { color: 'emerald' | 'amber' | 'red'; label: string; desc: string }) {
  const styles = {
    emerald: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
    amber: 'bg-amber-950/60 border-amber-800 text-amber-300',
    red: 'bg-red-950/60 border-red-800 text-red-300',
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${styles[color]}`}>
      <span className="font-semibold">{label}</span>
      <span className="opacity-70">·</span>
      <span className="opacity-70">{desc}</span>
    </div>
  )
}
