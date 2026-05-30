import type { RunStatus, StepStatus, StepType, SeverityTier } from '../types/escalation';

// ── Tier labels & descriptions ───────────────────────────────────────────────

export const TIER_LABEL: Record<SeverityTier, string> = {
  minor:  'Minor',
  medium: 'Medium',
  major:  'Major',
};

export const TIER_DESCRIPTION: Record<SeverityTier, string> = {
  minor:  'Routine deviation — gentle check-in',
  medium: 'Concerning — multiple contacts notified',
  major:  'Potential emergency — immediate escalation',
};

// ── Step type labels ─────────────────────────────────────────────────────────

export const STEP_TYPE_LABEL: Record<StepType, string> = {
  voice_call: 'Voice call',
  contact:    'Notify contact',
  call_911:   'Call 911',
};

export const STEP_TYPE_DESCRIPTION: Record<StepType, string> = {
  voice_call: 'AI voice agent calls the target (simulated)',
  contact:    'Send an alert to a named emergency contact',
  call_911:   'Display 911 intent — emergency services shown, not dialed',
};

// ── Step runtime status labels ───────────────────────────────────────────────

export const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  pending:   'Waiting',
  active:    'Active',
  responded: 'Responded',
  timed_out: 'No response',
  skipped:   'Skipped',
};

// ── Run status labels ────────────────────────────────────────────────────────

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  idle:          'Ready',
  running:       'Escalation in progress',
  at_911_intent: '911 — Emergency services notified',
  stopped:       'Escalation stopped',
  completed:     'Incident resolved',
};

// ── On-no-response labels ────────────────────────────────────────────────────

export const ON_NO_RESPONSE_LABEL: Record<string, string> = {
  next_step: 'Continue to next step',
  stop:      'Stop escalation',
};

// ── 911 intent ───────────────────────────────────────────────────────────────

export const CALL_911_LABEL = 'Calling 911';
export const CALL_911_SUBLABEL = 'Emergency services have been notified';
export const CALL_911_DISCLAIMER = 'Intent displayed — no real call is made';

// ── Classifier panel ────────────────────────────────────────────────────────

export const CLASSIFIER_PANEL = {
  placeholder: 'Describe what\'s happening — e.g. "Margaret hasn\'t gotten out of bed and it\'s 1pm."',
  submitLabel: 'Classify & escalate',
  loadingLabel: 'Classifying…',
  reasoningHeading: 'Why this tier?',
  errorLabel: 'Classification failed. Try again.',
};

// ── Dashboard / step editor ──────────────────────────────────────────────────

export const EDITOR = {
  addStepLabel:       '+ Add step',
  removeStepLabel:    'Remove',
  moveUpLabel:        'Move up',
  moveDownLabel:      'Move down',
  noStepsEmpty:       'No steps yet. Add a step to build the escalation procedure.',
  targetPlaceholder:  'Contact name — e.g. "Daughter — Sarah"',
  timeoutLabel:       'Timeout (seconds)',
  onNoResponseLabel:  'If no response',
  saveLabel:          'Save procedure',
  savedLabel:         'Saved',
};

// ── Demo scenario presets (one-click buttons) ────────────────────────────────

export interface ScenarioPreset {
  label: string;
  text: string;
}

export const DEMO_SCENARIOS: ScenarioPreset[] = [
  {
    label: 'Curtains still closed',
    text:  "Smart sensor: Margaret's curtains haven't opened. It's 11am — she opens them by 7 every morning without exception.",
  },
  {
    label: 'Coffee maker untouched',
    text:  "Smart appliance alert: Dad's coffee maker shows zero activity this morning. He makes coffee every day by 8am. This is the second consecutive missed morning.",
  },
  {
    label: 'No bedroom exit by 1pm',
    text:  "Motion sensors show Margaret has not left her bedroom. It's 1pm — her routine normally has her in the kitchen by 8:30.",
  },
  {
    label: 'Medication not taken',
    text:  "Smart pill dispenser alert: my father's morning blood pressure medication was not dispensed or taken. He has never missed a dose.",
  },
  {
    label: 'No movement for 4 hours',
    text:  "Motion sensors: no movement detected anywhere in the apartment for over 4 hours. Margaret typically moves between rooms every 45–60 minutes.",
  },
  {
    label: 'Fall detector triggered',
    text:  "Wearable fall detection alert: Margaret's device detected a hard fall in the hallway 6 minutes ago. She has not stood up and is not responding to automated check-in calls.",
  },
  {
    label: 'Panic button, no callback',
    text:  "Dad pressed his emergency alert button 10 minutes ago. Automated callback system has called three times with no answer. He is 84 and lives alone.",
  },
  {
    label: 'Smoke alarm, no response',
    text:  "Smoke detector triggered in grandmother's apartment 4 minutes ago. Automated calls are going unanswered and the alarm is still active.",
  },
];
