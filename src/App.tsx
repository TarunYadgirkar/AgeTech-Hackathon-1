import { useState, useRef } from 'react'
import './App.css'
import { mockConfig } from './types/escalation'
import { classify } from './lib/classify'
import { checkIn, notifyCall, pollCallResponse } from './lib/notify'
import { runEscalation } from './engine/escalationMachine'
import type { MachineHandle } from './engine/escalationMachine'
import type { EscalationConfig, EscalationRuntimeEvent } from './types/escalation'
import type { ClassifierResult } from './types/classifier'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import OverviewPage from './components/OverviewPage'
import Dashboard from './components/Dashboard'
import StepEditor from './components/StepEditor'
import EscalationView from './components/EscalationView'

type Page = 'landing' | 'dashboard'

const CONFIG_KEY = 'ga_config_v1'

function loadConfig(): EscalationConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return JSON.parse(raw) as EscalationConfig
  } catch {}
  return mockConfig
}

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [config, setConfig] = useState<EscalationConfig>(loadConfig)
  const [eventText, setEventText] = useState('')
  const [result, setResult] = useState<ClassifierResult | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [classifyError, setClassifyError] = useState<string | null>(null)
  const [runtimeEvent, setRuntimeEvent] = useState<EscalationRuntimeEvent | null>(null)
  const [callNotice, setCallNotice] = useState<{ ok: boolean; msg: string } | null>(null)
  const machineRef = useRef<MachineHandle | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)

  const isRunning =
    runtimeEvent !== null &&
    (runtimeEvent.runStatus === 'running' || runtimeEvent.runStatus === 'at_911_intent')

  function updateConfig(c: EscalationConfig) {
    setConfig(c)
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)) } catch {}
  }

  function stopMachine() {
    pollAbortRef.current?.abort()
    pollAbortRef.current = null
    if (machineRef.current) {
      machineRef.current.stop()
      machineRef.current = null
    }
    setRuntimeEvent(null)
    setCallNotice(null)
  }

  function handleScenarioSelect(text: string) {
    setEventText(text)
    stopMachine()
    setResult(null)
    setPage('dashboard')
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
    // Snapshot config at escalation start so phone numbers are locked in
    const snapshot = config
    let lastFiredIndex: number | null = null

    machineRef.current = runEscalation(snapshot, tier, (ev) => {
      setRuntimeEvent(ev)
      if (ev.activeStepIndex !== null && ev.activeStepIndex !== lastFiredIndex) {
        lastFiredIndex = ev.activeStepIndex
        // Abort any previous call poll when advancing to a new step
        pollAbortRef.current?.abort()
        pollAbortRef.current = null

        const step = snapshot[tier].steps[ev.activeStepIndex]

        if (step?.phoneNumber && step.type === 'voice_call') {
          const ac = new AbortController()
          pollAbortRef.current = ac
          setCallNotice(null)
          checkIn(step.phoneNumber, step.target, incidentText)
            .then(call_id => {
              if (ac.signal.aborted) return
              if (!call_id) {
                setCallNotice({ ok: false, msg: 'Retell call failed — check RETELL_API_KEY, RETELL_AGENT_ID, RETELL_FROM_NUMBER on Vercel' })
                return
              }
              setCallNotice({ ok: true, msg: `Calling ${step.target} (${step.phoneNumber}) via Retell…` })
              pollCallResponse(
                call_id,
                () => { if (!ac.signal.aborted) machineRef.current?.respond() },
                () => { if (!ac.signal.aborted) machineRef.current?.advanceStep() },
                ac.signal,
              ).catch(console.error)
            })
            .catch(err => {
              if (!ac.signal.aborted)
                setCallNotice({ ok: false, msg: `Retell error: ${err instanceof Error ? err.message : String(err)}` })
            })

        } else if (step?.phoneNumber && step.type === 'contact') {
          setCallNotice({ ok: true, msg: `Notifying ${step.target} (${step.phoneNumber}) via Twilio…` })
          notifyCall(step.phoneNumber, step.target, incidentText)
            .catch(err => setCallNotice({ ok: false, msg: `Twilio error: ${err instanceof Error ? err.message : String(err)}` }))

        } else if (step && !step.phoneNumber && step.type !== 'call_911') {
          setCallNotice({ ok: false, msg: `No phone number set for "${step.target}" — add one in the Escalation Procedure below` })
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        isRunning={isRunning}
        runStatus={runtimeEvent?.runStatus ?? null}
        page={page}
        onNavigate={setPage}
      />

      {page === 'landing' ? (
        <>
          <HeroSection
            onGoToDashboard={() => setPage('dashboard')}
            onGoToScenario={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <OverviewPage onScenarioSelect={handleScenarioSelect} />
        </>
      ) : (
        <section className="pt-24 pb-16 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-8 space-y-6">
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Caregiver Dashboard</p>
                <h2 className="text-2xl font-bold text-slate-900">Incident Response</h2>
                <p className="text-sm text-slate-400 mt-1">AI-assisted severity triage and escalation</p>
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
                callNotice={callNotice}
              />
            )}

            <StepEditor
              config={config}
              setConfig={updateConfig}
              focusTier={result?.tier ?? null}
            />
          </div>
        </section>
      )}
    </div>
  )
}
