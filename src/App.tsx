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
import Dashboard from './components/Dashboard'
import StepEditor from './components/StepEditor'
import EscalationView from './components/EscalationView'

export default function App() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        <Dashboard
          eventText={eventText}
          setEventText={setEventText}
          onClassify={handleClassify}
          onScenarioSelect={(text) => { setEventText(text); stopMachine(); setResult(null) }}
          classifying={classifying}
          classifyError={classifyError}
          result={result}
          isRunning={isRunning}
        />
        <StepEditor
          config={config}
          setConfig={setConfig}
          focusTier={result?.tier ?? null}
        />
        {runtimeEvent && (
          <EscalationView
            event={runtimeEvent}
            config={config}
            onRespond={() => machineRef.current?.respond()}
            onStop={stopMachine}
          />
        )}
      </main>
    </div>
  )
}
