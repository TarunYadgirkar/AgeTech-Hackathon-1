interface Props {
  isRunning: boolean
  runStatus: string | null
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    active: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Procedures',
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: 'Contacts',
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: 'Activity Log',
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
]

export default function HeroSection({ isRunning, runStatus }: Props) {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">GuardianAlert</span>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 ml-0.5">Elder-care escalation</p>
      </div>

      {/* Nav */}
      <nav className="p-2.5 space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ label, active, icon }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-default select-none transition-colors ${
              active
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {icon}
            {label}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            runStatus === 'at_911_intent'
              ? 'bg-red-500 animate-pulse'
              : isRunning
              ? 'bg-blue-500 animate-pulse'
              : 'bg-slate-300'
          }`} />
          <span className="text-xs text-slate-500 leading-tight">
            {runStatus === 'at_911_intent'
              ? '911 intent — escalated'
              : isRunning
              ? 'Escalation active'
              : 'No active incidents'}
          </span>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">System</p>
          <p className="text-xs text-slate-600 mt-0.5">AI Triage + Auto-Escalate</p>
        </div>
      </div>
    </aside>
  )
}
