import type { RunStatus, StepStatus, StepType, SeverityTier } from '../types/escalation';

// ── Tier labels & descriptions ───────────────────────────────────────────────

export const TIER_LABEL: Record<SeverityTier, string> = {
  minor:  'Minor',
  medium: 'Medium',
  major:  'Major',
};

export const TIER_DESCRIPTION: Record<SeverityTier, string> = {
  minor:  'Slightly off routine, just checking in',
  medium: 'Something concerning, reaching out to contacts',
  major:  'Potential emergency, responding right away',
};

// ── Step type labels ─────────────────────────────────────────────────────────

export const STEP_TYPE_LABEL: Record<StepType, string> = {
  voice_call: 'Voice call',
  contact:    'Notify contact',
  call_911:   'Call 911',
};

export const STEP_TYPE_DESCRIPTION: Record<StepType, string> = {
  voice_call: 'AI voice agent calls the person (simulated)',
  contact:    'Send an alert to a named emergency contact',
  call_911:   'Shows 911 intent. Emergency services are displayed, never dialed.',
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
  running:       'Response in progress',
  at_911_intent: '911 - Emergency services notified',
  stopped:       'Response stopped',
  completed:     'Incident resolved',
};

// ── On-no-response labels ────────────────────────────────────────────────────

export const ON_NO_RESPONSE_LABEL: Record<string, string> = {
  next_step: 'Continue to next step',
  stop:      'Stop here',
};

// ── 911 intent ───────────────────────────────────────────────────────────────

export const CALL_911_LABEL = 'Calling 911';
export const CALL_911_SUBLABEL = 'Emergency services have been notified';
export const CALL_911_DISCLAIMER = 'Shown only. No real call is placed.';

// ── Classifier panel ────────────────────────────────────────────────────────

export const CLASSIFIER_PANEL = {
  placeholder: 'Describe what\'s happening. For example: "Margaret hasn\'t gotten out of bed and it\'s 1pm."',
  submitLabel: 'Classify and escalate',
  loadingLabel: 'Classifying...',
  reasoningHeading: 'Why this tier?',
  errorLabel: 'Classification failed. Try again.',
};

// ── Dashboard / step editor ──────────────────────────────────────────────────

export const EDITOR = {
  addStepLabel:       '+ Add step',
  removeStepLabel:    'Remove',
  moveUpLabel:        'Move up',
  moveDownLabel:      'Move down',
  noStepsEmpty:       'No steps yet. Add one to build out the response.',
  targetPlaceholder:  'Contact name, e.g. Sarah',
  timeoutLabel:       'Timeout (seconds)',
  onNoResponseLabel:  'If no response',
  saveLabel:          'Save',
  savedLabel:         'Saved',
};

// ── Demo scenario presets (one-click buttons) ────────────────────────────────

export interface ScenarioPreset {
  label: string;
  tier: SeverityTier;
  text: string;
}

export const DEMO_SCENARIOS: ScenarioPreset[] = [
  {
    label: 'Unopened curtains',
    tier:  'minor',
    text:  "Margaret hasn't opened her curtains and it's already 11am. She always opens them by 7.",
  },
  {
    label: 'Skipped coffee',
    tier:  'minor',
    text:  "Dad skipped his morning coffee again. Second day in a row. He's been seeming a bit off.",
  },
  {
    label: 'Stayed in bed past noon',
    tier:  'medium',
    text:  "Margaret hasn't gotten out of bed and it's 1pm. She went to sleep at her normal time last night.",
  },
  {
    label: 'Missed medication',
    tier:  'medium',
    text:  "My father didn't take his blood pressure medication this morning. He never skips it.",
  },
  {
    label: 'No movement after fall',
    tier:  'medium',
    text:  "Eleanor fell last week and the motion sensor shows she hasn't moved from the living room chair in over 4 hours.",
  },
  {
    label: 'On the floor',
    tier:  'major',
    text:  "Margaret is on the hallway floor and isn't responding when I call her name through the door.",
  },
  {
    label: 'Panic button, no answer',
    tier:  'major',
    text:  "Dad pressed his emergency button and when I called back there was no answer. He's 84 and lives alone.",
  },
  {
    label: 'Smoke alarm, unreachable',
    tier:  'major',
    text:  "The smoke detector in my grandmother's apartment went off and she isn't picking up her phone. A neighbor says they can smell something.",
  },
];
