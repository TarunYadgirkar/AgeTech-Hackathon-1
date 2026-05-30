import { runEscalation } from './escalationMachine';
import type { EscalationConfig, EscalationRuntimeEvent, SeverityTier } from '../types/escalation';

const fastConfig: EscalationConfig = {
  minor: {
    tier: 'minor',
    steps: [
      { id: 'minor_1', type: 'voice_call', target: 'Margaret', timeoutSeconds: 2, onNoResponse: 'next_step' },
      { id: 'minor_2', type: 'contact', target: 'Daughter — Sarah', timeoutSeconds: 2, onNoResponse: 'stop' },
    ],
  },
  medium: {
    tier: 'medium',
    steps: [
      { id: 'medium_1', type: 'voice_call', target: 'Margaret', timeoutSeconds: 2, onNoResponse: 'next_step' },
      { id: 'medium_2', type: 'contact', target: 'Daughter — Sarah', timeoutSeconds: 2, onNoResponse: 'next_step' },
      { id: 'medium_3', type: 'contact', target: 'Neighbor — Tom', timeoutSeconds: 2, onNoResponse: 'stop' },
    ],
  },
  major: {
    tier: 'major',
    steps: [
      { id: 'major_1', type: 'contact', target: 'Daughter — Sarah', timeoutSeconds: 2, onNoResponse: 'next_step' },
      { id: 'major_2', type: 'voice_call', target: 'Margaret', timeoutSeconds: 2, onNoResponse: 'next_step' },
      { id: 'major_3', type: 'call_911', target: '911', timeoutSeconds: 0, onNoResponse: 'stop' },
    ],
  },
};

function runTier(tier: SeverityTier): Promise<void> {
  return new Promise((resolve) => {
    console.log(`\n=== TIER: ${tier.toUpperCase()} ===`);
    let prevStepStatuses: string[] = [];

    runEscalation(fastConfig, tier, (ev: EscalationRuntimeEvent) => {
      const currentStatuses = ev.steps.map((s) => s.status);
      const changed = currentStatuses.some((s, i) => s !== prevStepStatuses[i]);

      if (changed || ev.runStatus !== 'running') {
        const stepLine = ev.steps
          .map((s) => {
            const rem = s.remainingSeconds !== null ? ` (${s.remainingSeconds}s)` : '';
            return `  [${s.stepId}] ${s.status}${rem}`;
          })
          .join('\n');
        console.log(`runStatus=${ev.runStatus} activeIdx=${ev.activeStepIndex}\n${stepLine}`);
        prevStepStatuses = currentStatuses;
      }

      const done = ['completed', 'stopped', 'at_911_intent'].includes(ev.runStatus);
      if (done) resolve();
    });
  });
}

async function main() {
  await runTier('minor');
  await runTier('medium');
  await runTier('major');
  console.log('\n✓ all tiers complete');
}

main().catch(console.error);
