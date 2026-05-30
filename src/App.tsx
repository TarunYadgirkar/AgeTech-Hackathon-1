import { useState, useRef } from 'react'
import './App.css'
import { mockConfig } from './mocks'
import { classify } from './lib/classify'
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

  const isRunning =
    runtimeEvent !== null &&
    (runtimeEvent.runStatus === 'running' || runtimeEvent.runStatus === 'at_911_intent')

  function stopMachine() {
    if (machineRef.current) {
      machineRef.current.stop()
      machineRef.current = null
    }
    setRuntimeEvent(null)
  }

  async function handleClassify() {
    if (!eventText.trim() || classifying) return
    setClassifying(true)
    setClassifyError(null)
    setResult(null)
    stopMachine()
    try {
      setResult(await classify(eventText))
    } catch (e) {
      setClassifyError(e instanceof Error ? e.message : 'Classification failed')
    } finally {
      setClassifying(false)
    }
  }

  function handleStartEscalation() {
    if (!result) return
    stopMachine()
    machineRef.current = runEscalation(config, result.tier, (ev) => setRuntimeEvent(ev))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        <Dashboard
          eventText={eventText}
          setEventText={setEventText}
          onClassify={handleClassify}
          classifying={classifying}
          classifyError={classifyError}
          result={result}
          onStartEscalation={handleStartEscalation}
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
