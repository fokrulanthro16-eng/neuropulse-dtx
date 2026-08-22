import { PCSSSymptomDefinition, RedFlagAlert } from '@/types/clinical';

/**
 * Standardized 22-Vector Post-Concussion Symptom Scale (PCSS) Definitions
 * Aligned with SCAT6 (Sport Concussion Assessment Tool 6).
 */
export const PCSS_SYMPTOM_DEFINITIONS: PCSSSymptomDefinition[] = [
  // --- Somatic Cluster ---
  {
    id: 'headache',
    name: 'Headache',
    cluster: 'somatic',
    description: 'Cranial pressure, throbbing, or persistent localized/diffuse head pain.',
    clinicalSignificance: 'Most prevalent post-concussion symptom. Monitored for escalation.'
  },
  {
    id: 'pressure_in_head',
    name: 'Pressure in Head',
    cluster: 'somatic',
    description: 'Sensation of tightness, fullness, or band-like constriction around the skull.',
    clinicalSignificance: 'Indicator of intracranial sensation/autonomic dysregulation.'
  },
  {
    id: 'neck_pain',
    name: 'Neck Pain / Stiffness',
    cluster: 'somatic',
    description: 'Cervical spine discomfort, rigidity, or reduced range of motion.',
    clinicalSignificance: 'Differentiates cervicogenic trauma from vestibular/central pathology.'
  },
  {
    id: 'nausea_vomiting',
    name: 'Nausea or Vomiting',
    cluster: 'somatic',
    description: 'Gastrointestinal upset, motion sensitivity, or emesis.',
    clinicalSignificance: 'Repeated vomiting is a primary SCAT6 red flag requiring emergency triage.'
  },
  {
    id: 'dizziness',
    name: 'Dizziness',
    cluster: 'somatic',
    description: 'Lightheadedness, unsteadiness, or sensation of spinning/spatial disorientation.',
    clinicalSignificance: 'Key marker for vestibular-ocular motor screening (VOMS).'
  },
  {
    id: 'blurred_vision',
    name: 'Blurred Vision',
    cluster: 'somatic',
    description: 'Inability to focus clearly, binocular disparity, or visual fuzziness.',
    clinicalSignificance: 'Signals convergence insufficiency or accommodation deficit.'
  },
  {
    id: 'balance_problems',
    name: 'Balance Problems',
    cluster: 'somatic',
    description: 'Postural instability, gait ataxia, or tendency to sway.',
    clinicalSignificance: 'Evaluated alongside Modified BESS (Balance Error Scoring System).'
  },
  {
    id: 'sensitivity_to_light',
    name: 'Sensitivity to Light (Photophobia)',
    cluster: 'somatic',
    description: 'Discomfort, squinting, or cranial pain induced by ambient lighting or digital screens.',
    clinicalSignificance: 'Triggers requirement for 590nm optical filtering and sub-50 lux UX.'
  },
  {
    id: 'sensitivity_to_noise',
    name: 'Sensitivity to Noise (Phonophobia)',
    cluster: 'somatic',
    description: 'Auditory hyperacusis, irritation, or worsening symptoms from sound exposure.',
    clinicalSignificance: 'Guides auditory pacing and pink-noise binaural masking volume.'
  },

  // --- Cognitive Cluster ---
  {
    id: 'feeling_slowed_down',
    name: 'Feeling Slowed Down',
    cluster: 'cognitive',
    description: 'Sluggish mental processing speed, delayed responses to stimuli.',
    clinicalSignificance: 'Directly correlates with acoustic hesitation biomarkers and voice latency.'
  },
  {
    id: 'feeling_in_a_fog',
    name: 'Feeling Mentally "In a Fog"',
    cluster: 'cognitive',
    description: 'Cognitive haze, depersonalization, reduced mental clarity and acuity.',
    clinicalSignificance: 'Primary cognitive complaint in subacute concussion phase.'
  },
  {
    id: 'dont_feel_right',
    name: 'Does Not "Feel Right"',
    cluster: 'cognitive',
    description: 'Global qualitative sense that baseline cognitive state is compromised.',
    clinicalSignificance: 'Important subjective self-report marker in SCAT6.'
  },
  {
    id: 'difficulty_concentrating',
    name: 'Difficulty Concentrating',
    cluster: 'cognitive',
    description: 'Inability to sustain attention during tasks, reading, or conversations.',
    clinicalSignificance: 'Defines Buffalo cognitive pacing load limits.'
  },
  {
    id: 'difficulty_remembering',
    name: 'Difficulty Remembering',
    cluster: 'cognitive',
    description: 'Short-term memory deficits, immediate recall failure, delayed word finding.',
    clinicalSignificance: 'Monitored via dual-task auditory memory pacing.'
  },

  // --- Emotional / Affective Cluster ---
  {
    id: 'fatigue_low_energy',
    name: 'Fatigue / Low Energy',
    cluster: 'emotional',
    description: 'Physical or neuro-cognitive exhaustion disproportionate to exertion.',
    clinicalSignificance: 'Essential metric for determining micro-break pacing intervals.'
  },
  {
    id: 'confusion',
    name: 'Confusion',
    cluster: 'cognitive',
    description: 'Disorientation to time, date, location, or sequence of recent events.',
    clinicalSignificance: 'Progressive confusion is an urgent clinical triage flag.'
  },
  {
    id: 'more_emotional',
    name: 'More Emotional than Usual',
    cluster: 'emotional',
    description: 'Heightened emotional reactivity, labile mood, unexpected tearfulness.',
    clinicalSignificance: 'Frontal-subcortical disinhibition indicator.'
  },
  {
    id: 'irritability',
    name: 'Irritability',
    cluster: 'emotional',
    description: 'Short temper, low frustration tolerance, agitation.',
    clinicalSignificance: 'Affective cluster indicator in autonomic recovery.'
  },
  {
    id: 'sadness',
    name: 'Sadness / Depressed Mood',
    cluster: 'emotional',
    description: 'Persistent downcast feelings, loss of interest in recovery activities.',
    clinicalSignificance: 'Monitored to differentiate primary mTBI from post-injury depression.'
  },
  {
    id: 'nervous_anxious',
    name: 'Nervousness / Anxiety',
    cluster: 'emotional',
    description: 'Autonomic hyperarousal, apprehension regarding recovery prognosis.',
    clinicalSignificance: 'Responds strongly to 6Hz Theta & 10Hz Alpha binaural grounding.'
  },

  // --- Sleep / Energy Cluster ---
  {
    id: 'drowsiness',
    name: 'Drowsiness / Daytime Somnolence',
    cluster: 'sleep',
    description: 'Excessive daytime sleep drive and difficulty maintaining wakefulness.',
    clinicalSignificance: 'Circadian disruption marker.'
  },
  {
    id: 'trouble_falling_asleep',
    name: 'Trouble Falling Asleep (Insomnia)',
    cluster: 'sleep',
    description: 'Delayed sleep onset, nocturnal rumination, or restless sleep initiation.',
    clinicalSignificance: 'Sleep architecture integrity is vital for glymphatic clearance.'
  }
];

/**
 * Standard SCAT6 Red Flag Clinical Checklist
 */
export const SCAT6_RED_FLAGS = [
  {
    code: 'UNEQUAL_PUPILS',
    description: 'Unequal, asymmetrical, or unreactive pupil diameter (anisocoria).',
    action: 'IMMEDIATE EMERGENCY: Call 911 / EMS. Potential uncal herniation or intracranial hemorrhage.'
  },
  {
    code: 'REPEATED_EMESIS',
    description: 'Repeated or projectile vomiting (> 1 episode post-injury).',
    action: 'IMMEDIATE EMERGENCY: Transport to Emergency Department for urgent neuroimaging (CT/MRI).'
  },
  {
    code: 'PROGRESSIVE_FOCAL_DEFICIT',
    description: 'Progressive limb weakness, numbness, unilateral motor deficit, or facial droop.',
    action: 'IMMEDIATE EMERGENCY: Acute neurological evaluation for focal lesion/ischemia.'
  },
  {
    code: 'ESCALATING_HEADACHE',
    description: 'Severe, rapidly worsening, or "thunderclap" headache unresponsive to rest.',
    action: 'IMMEDIATE EMERGENCY: Urgent hospital triage for increasing intracranial pressure.'
  },
  {
    code: 'SEIZURE_CONVULSIONS',
    description: 'Tonic-clonic activity, involuntary posturing, or post-traumatic seizures.',
    action: 'IMMEDIATE EMERGENCY: Activate emergency medical services immediately.'
  },
  {
    code: 'LOSS_OF_CONSCIOUSNESS',
    description: 'Prolonged or deteriorating level of consciousness / inability to awaken.',
    action: 'IMMEDIATE EMERGENCY: Ensure airway protection, call EMS.'
  },
  {
    code: 'SEVERE_NECK_PAIN',
    description: 'Severe neck pain, cervical spine midline tenderness, or burning radicular paresthesias.',
    action: 'IMMEDIATE EMERGENCY: Cervical spine immobilization required. Call 911.'
  },
  {
    code: 'SLURRED_SPEECH',
    description: 'Dysarthria, garbled articulation, or acute aphasia.',
    action: 'IMMEDIATE EMERGENCY: Emergency stroke/vascular and neurotrauma protocol.'
  }
];

/**
 * Buffalo Concussion Protocol - Cognitive Pacing Threshold Matrix
 */
export function calculateBuffaloPacingRecommendations(totalPcssScore: number, fatigueScore: number): {
  exertionCapPercent: number;
  maxContinuousMinutes: number;
  suggestedRestMinutes: number;
  binauralBand: 'DELTA_3HZ' | 'THETA_6HZ' | 'ALPHA_10HZ';
} {
  if (totalPcssScore >= 60 || fatigueScore >= 75) {
    // High acute symptom burden - strictly sub-symptom rest & deep restorative pacing
    return {
      exertionCapPercent: 20,
      maxContinuousMinutes: 10,
      suggestedRestMinutes: 30,
      binauralBand: 'DELTA_3HZ'
    };
  } else if (totalPcssScore >= 30 || fatigueScore >= 50) {
    // Moderate burden - light cognitive pacing
    return {
      exertionCapPercent: 45,
      maxContinuousMinutes: 20,
      suggestedRestMinutes: 20,
      binauralBand: 'THETA_6HZ'
    };
  } else if (totalPcssScore >= 15 || fatigueScore >= 30) {
    // Mild-to-moderate burden - progressive active rehabilitation
    return {
      exertionCapPercent: 70,
      maxContinuousMinutes: 35,
      suggestedRestMinutes: 15,
      binauralBand: 'ALPHA_10HZ'
    };
  } else {
    // Sub-threshold / near-asymptomatic recovery maintenance
    return {
      exertionCapPercent: 90,
      maxContinuousMinutes: 50,
      suggestedRestMinutes: 10,
      binauralBand: 'ALPHA_10HZ'
    };
  }
}
