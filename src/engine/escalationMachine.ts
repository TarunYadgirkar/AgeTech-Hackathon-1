import type {
  EscalationConfig,
  EscalationRuntimeEvent,
  RunStatus,
  SeverityTier,
  StepRuntimeState,
} from '../types/escalation';

export interface MachineHandle {
  stop(): void;
  respond(): void;
}

export function runEscalation(
  config: EscalationConfig,
  tier: SeverityTier,
  onEvent: (event: EscalationRuntimeEvent) => void,
): MachineHandle {
  const steps = config[tier].steps;

  let dead = false;
  let activeIndex = 0;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let stepTimer: ReturnType<typeof setTimeout> | null = null;

  const states: StepRuntimeState[] = steps.map((s) => ({
    stepId: s.id,
    status: 'pending',
    remainingSeconds: null,
  }));

  function clearTimers() {
    if (tickTimer !== null) clearInterval(tickTimer);
    if (stepTimer !== null) clearTimeout(stepTimer);
    tickTimer = null;
    stepTimer = null;
  }

  function emit(runStatus: RunStatus, index: number | null) {
    if (dead) return;
    onEvent({ tier, runStatus, activeStepIndex: index, steps: states.map((s) => ({ ...s })) });
  }

  function skipFrom(fromIndex: number) {
    for (let i = fromIndex; i < steps.length; i++) {
      states[i].status = 'skipped';
      states[i].remainingSeconds = null;
    }
  }

  function advance(index: number) {
    if (dead) return;
    if (index >= steps.length) {
      emit('completed', null);
      dead = true;
      return;
    }

    activeIndex = index;
    const step = steps[index];

    if (step.type === 'call_911') {
      states[index].status = 'active';
      states[index].remainingSeconds = null;
      emit('at_911_intent', index);
      dead = true;
      return;
    }

    let remaining = step.timeoutSeconds;
    states[index].status = 'active';
    states[index].remainingSeconds = remaining;
    emit('running', index);

    tickTimer = setInterval(() => {
      if (dead) return;
      remaining -= 1;
      states[index].remainingSeconds = remaining;
      emit('running', index);
    }, 1000);

    stepTimer = setTimeout(() => {
      clearInterval(tickTimer!);
      tickTimer = null;
      if (dead) return;

      states[index].status = 'timed_out';
      states[index].remainingSeconds = null;

      if (step.onNoResponse === 'next_step') {
        advance(index + 1);
      } else {
        emit('stopped', null);
        dead = true;
      }
    }, step.timeoutSeconds * 1000);
  }

  advance(0);

  return {
    stop() {
      if (dead) return;
      clearTimers();
      states[activeIndex].status = 'timed_out';
      states[activeIndex].remainingSeconds = null;
      skipFrom(activeIndex + 1);
      emit('stopped', null);
      dead = true;
    },
    respond() {
      if (dead) return;
      clearTimers();
      states[activeIndex].status = 'responded';
      states[activeIndex].remainingSeconds = null;
      skipFrom(activeIndex + 1);
      emit('completed', null);
      dead = true;
    },
  };
}
