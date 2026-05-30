type Page = 'landing' | 'dashboard'

interface Props {
  isRunning: boolean
  runStatus: string | null
  page: Page
  onNavigate: (p: Page) => void
}

export default function Navbar({ isRunning, runStatus, page, onNavigate }: Props) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 h-16">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo — click goes home */}
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">GuardianAlert</span>
          {(isRunning || runStatus === 'at_911_intent') && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full ml-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${runStatus === 'at_911_intent' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <span className="text-xs font-medium text-blue-700">
                {runStatus === 'at_911_intent' ? '911 intent' : 'Escalation active'}
              </span>
            </div>
          )}
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {page === 'landing' ? (
            <>
              {[
                { label: 'Problem', id: 'problem' },
                { label: 'How it works', id: 'scenario' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Home
            </button>
          )}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`ml-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
              page === 'dashboard'
                ? 'bg-blue-700 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </nav>
  )
}
