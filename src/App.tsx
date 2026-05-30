import { useState, useRef } from 'react'
import './App.css'
import { mockConfig } from './mocks'
import { classify } from './lib/classify'
import { notifyCall, pollCallResponse } from './lib/notify'
import { runEscalation } from './engine/escalationMachine'
import type { MachineHandle } from './engine/escalationMachine'
import type { EscalationConfig, EscalationRuntimeEvent } from './types/escalation'
import type { ClassifierResult } from './types/classifier'
import HeroSection from './components/HeroSection'
import OverviewPage from './components/OverviewPage'
import Dashboard from './components/Dashboard'
import StepEditor from './components/StepEditor'
import EscalationView from './components/EscalationView'

type View = 'overview' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('overview')
  const [config, setConfig] = useState<EscalationConfig>(mockConfig)
  const [eventText, setEventText] = useState('')
  const [result, setResult] = useState<ClassifierResult | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [classifyError, setClassifyError] = useState<string | null>(null)
  const [runtimeEvent, setRuntimeEvent] = useState<EscalationRuntimeEvent | null>(null)
  const machineRef = useRef<MachineHandle | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)

  const isRunning =
    runtimeEvent !== null &&
    (runtimeEvent.runStatus === 'running' || runtimeEvent.runStatus === 'at_911_intent')

  function stopMachine() {
    pollAbortRef.current?.abort()
    pollAbortRef.current = null
    if (machineRef.current) {
      machineRef.current.stop()
      machineRef.current = null
    }
    setRuntimeEvent(null)
  }

  function handleScenarioSelect(text: string) {
    setEventText(text)
    stopMachine()
    setResult(null)
  }

  async function handleClassify() {
    const input = eventText.trim()
    if (!input || classifying) return
    setClassifying(true)
    setClassifyError(null)
    setResult(null)
    stopMachine()
    try {
      const r = await classify(input)
      setResult(r)
      startEscalation(r, input)
    } catch (e) {
      setClassifyError(e instanceof Error ? e.message : 'Classification failed')
    } finally {
      setClassifying(false)
    }
  }

  function startEscalation(r: ClassifierResult, incidentText: string) {
    stopMachine()
    const tier = r.tier
    let lastFiredIndex: number | null = null
    machineRef.current = runEscalation(config, tier, (ev) => {
      setRuntimeEvent(ev)
      if (ev.activeStepIndex !== null && ev.activeStepIndex !== lastFiredIndex) {
        lastFiredIndex = ev.activeStepIndex
        const step = config[tier].steps[ev.activeStepIndex]
        if (step?.phoneNumber && (step.type === 'voice_call' || step.type === 'contact')) {
          const msg = `Elder care alert. ${step.target} is being contacted. Incident: ${incidentText}. Please respond immediately.`
          const ac = new AbortController()
          pollAbortRef.current?.abort()
          pollAbortRef.current = ac
          notifyCall(step.phoneNumber, msg).then(sid => {
            if (sid && !ac.signal.aborted) {
              pollCallResponse(
                sid,
                () => { if (!ac.signal.aborted) machineRef.current?.respond() },
                () => { if (!ac.signal.aborted) machineRef.current?.advanceStep() },
                ac.signal,
              ).catch(console.error)
            }
          }).catch(console.error)
        }
      }
    })
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <HeroSection
        isRunning={isRunning}
        runStatus={runtimeEvent?.runStatus ?? null}
        currentView={view}
        onNavigate={setView}
      />

      <main className="flex-1 overflow-y-auto">
        {view === 'overview' ? (
          <OverviewPage
            onScenarioSelect={handleScenarioSelect}
            onNavigate={setView}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-8 py-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Incident Response</h1>
                <p className="text-sm text-slate-400 mt-0.5">AI-assisted severity triage and escalation</p>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-medium text-blue-700">Escalation in progress</span>
                </div>
              )}
            </div>

            <Dashboard
              eventText={eventText}
              setEventText={setEventText}
              onClassify={handleClassify}
              classifying={classifying}
              classifyError={classifyError}
              result={result}
              isRunning={isRunning}
            />

            {runtimeEvent && (
              <EscalationView
                event={runtimeEvent}
                config={config}
                onRespond={() => machineRef.current?.respond()}
                onStop={stopMachine}
              />
            )}

            <StepEditor
              config={config}
              setConfig={setConfig}
              focusTier={result?.tier ?? null}
            />
          </div>
        )}
      </main>
    </div>
  )
}
