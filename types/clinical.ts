/**
 * NeuroPulse DTx - Clinical Data Types & Contracts (v3 SaMD Enterprise Suite)
 * Aligned with SCAT6 (Sport Concussion Assessment Tool 6),
 * PCSS (Post-Concussion Symptom Scale - 22 multi-axial vectors),
 * VOMS (Vestibular/Ocular Motor Screening),
 * BESS (Balance Error Scoring System),
 * Dynamic Kelvin Photophobia Filtration,
 * Auditory N-Back Dual-Task Cognitive Pacing,
 * Web Bluetooth GATT HRV (Heart Rate Variability) Autonomic Sentinel,
 * Adaptive Cadence Voice Coach,
 * and Cryptographically Signed Return-to-Play/Work Passports (ECDSA WebCrypto).
 */

export type PCSSCluster = 'somatic' | 'cognitive' | 'emotional' | 'sleep';

export interface PCSSSymptomDefinition {
  id: string;
  name: string;
  cluster: PCSSCluster;
  description: string;
  clinicalSignificance: string;
}

export type PCSSSymptomSeverity = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PCSSVectorAssessment {
  symptomId: string;
  symptomName: string;
  cluster: PCSSCluster;
  severity: PCSSSymptomSeverity;
  reportedAt: string;
  notes?: string;
}

export interface PCSSClusterSummary {
  cluster: PCSSCluster;
  totalScore: number;
  maxScore: number;
  symptomCount: number;
  averageSeverity: number;
}

export interface VocalBiomarkerMetrics {
  timestamp: string;
  durationMs: number;
  speechPauseRatio: number;
  speechHesitationIndex: number;
  vocalTremorProxy: number;
  volumeStabilityRms: number;
  speakingRateProxy: number;
  cognitiveFatigueScore: number;
  baselineDeviationDelta?: number;
}

// --- VOMS Types ---
export type VOMSTestType =
  | 'SMOOTH_PURSUIT_HORIZONTAL'
  | 'SMOOTH_PURSUIT_VERTICAL'
  | 'SACCADES_HORIZONTAL'
  | 'SACCADES_VERTICAL'
  | 'CONVERGENCE_NPC'
  | 'VOR_HORIZONTAL'
  | 'VOR_VERTICAL';

export interface VOMSMetrics {
  timestamp: string;
  testType: VOMSTestType;
  saccadicLatencyMs: number;
  gazeFixationStability: number;
  smoothPursuitPhaseLagMs: number;
  nearPointConvergenceCm?: number;
  blinkRatePerMinute: number;
  symptomProvocationScore: number;
  headMovementCompensation: number;
  testHaltedFatigue: boolean;
}

export interface VOMSSessionResult {
  id: string;
  performedAt: string;
  overallScore: number;
  tests: Record<VOMSTestType, VOMSMetrics>;
  clinicalInterpretation: string;
  vomsPositiveFlag: boolean;
}

// --- BESS Types ---
export type BESSStanceType =
  | 'DOUBLE_LEG_FIRM'
  | 'SINGLE_LEG_FIRM'
  | 'TANDEM_FIRM'
  | 'DOUBLE_LEG_FOAM'
  | 'SINGLE_LEG_FOAM'
  | 'TANDEM_FOAM';

export interface BESSMetrics {
  timestamp: string;
  stanceType: BESSStanceType;
  posturalSwayAreaMm2: number;
  accelerationRms: number;
  maxTiltAngleDeg: number;
  balanceErrorsCount: number;
  trialDurationSeconds: number;
  stabilityIndex: number;
  excessiveSwayDetected: boolean;
}

export interface BESSSessionResult {
  id: string;
  performedAt: string;
  totalBessErrorScore: number;
  testedStances: Record<string, BESSMetrics>;
  clinicalInterpretation: string;
}

// --- Dynamic Ambient Lux & Kelvin Filter Types ---
export interface AmbientLuxState {
  currentLux: number;
  sensorSource: 'HARDWARE_API' | 'TIME_OF_DAY_ESTIMATE' | 'MANUAL_OVERRIDE';
  targetKelvin: number;          // 1800K (Deep Candle Amber) to 3200K (Warm OLED)
  opticalFilterRgba: string;
  recommendedLuxMode: string;
  screenDimPercentage: number;   // 10% to 100%
  photophobiaStressScore: number; // 0 - 100
}

// --- Auditory Dual-Task N-Back Types ---
export type NBackLevel = 1 | 2;

export interface NBackTrialResult {
  timestamp: string;
  nBackLevel: NBackLevel;
  totalStimuli: number;
  targetCount: number;
  correctHits: number;
  omissionErrors: number;
  commissionErrors: number;
  averageReactionTimeMs: number;
  accuracyPercentage: number;
  executiveCognitiveIndex: number; // 0 - 100 score
  symptomExacerbationFlag: boolean;
}

// --- Web Bluetooth GATT HRV Types ---
export interface BluetoothHRVMetrics {
  timestamp: string;
  isConnected: boolean;
  deviceName?: string;
  currentBpm: number;
  rrIntervalsMs: number[];
  rmssdMs: number;               // Root Mean Square of Successive Differences (Parasympathetic index)
  sdnnMs: number;                // Standard deviation of NN intervals (Global autonomic resilience)
  sympathovagalRatio: number;    // LF/HF proxy ratio
  autonomicStressIndex: number;  // 0 - 100 (high = sympathetic overload)
  sympatheticSpikeDetected: boolean;
}

// --- Cryptographically Signed Return-to-Play/Work Passport Types ---
export type ClearanceStage =
  | 'STAGE_1_SYMPTOM_LIMITED_REST'
  | 'STAGE_2_LIGHT_COGNITIVE_ACTIVITY'
  | 'STAGE_3_SPORT_SPECIFIC_DRILLS'
  | 'STAGE_4_NON_CONTACT_TRAINING'
  | 'STAGE_5_FULL_CONTACT_PRACTICE'
  | 'STAGE_6_FULL_UNRESTRICTED_CLEARANCE';

export interface SignedClearancePassport {
  passportId: string;
  patientId: string;
  patientName: string;
  injuryDate: string;
  clearanceDate: string;
  stage: ClearanceStage;
  isFullyCleared: boolean;
  verifyingClinicianName: string;
  verifyingClinicName: string;
  clinicianNPI?: string;
  metricsSnapshot: {
    pcssTotalScore: number;
    vocalHesitationSec: number;
    vomsSaccadicLatencyMs: number;
    bessBalanceErrorsTotal: number;
    nBackAccuracyPercent: number;
    restingRmssdMs: number;
  };
  cryptographicSignature: {
    algorithm: 'ECDSA_P256_SHA256';
    publicKeyPem: string;
    signatureHex: string;
    payloadHash: string;
    verifiedLocally: boolean;
  };
  qrVerificationPayload: string;
}

export type TriageUrgency = 'EMERGENCY_RED_FLAG' | 'HIGH_RISK' | 'SUB_SYMPTOM_ELEVATION' | 'STABLE_RECOVERY';

export interface RedFlagAlert {
  type: 
    | 'UNEQUAL_PUPILS'
    | 'REPEATED_EMESIS'
    | 'PROGRESSIVE_FOCAL_DEFICIT'
    | 'ESCALATING_HEADACHE'
    | 'SEIZURE_CONVULSIONS'
    | 'LOSS_OF_CONSCIOUSNESS'
    | 'SEVERE_NECK_PAIN'
    | 'SLURRED_SPEECH'
    | 'CONFUSION_DISORIENTATION';
  severity: 'CRITICAL_EMERGENCY' | 'URGENT_PROVIDER_REVIEW';
  clinicalDescription: string;
  immediateAction: string;
  detectedAt: string;
}

export interface TriageEvaluation {
  urgency: TriageUrgency;
  hasRedFlags: boolean;
  redFlags: RedFlagAlert[];
  pcssTotalScore: number;
  pcssSymptomCount: number;
  clusterSummaries: Record<PCSSCluster, PCSSClusterSummary>;
  vocalBiomarkers?: VocalBiomarkerMetrics;
  vomsMetrics?: VOMSMetrics;
  bessMetrics?: BESSMetrics;
  hrvMetrics?: BluetoothHRVMetrics;
  nBackResult?: NBackTrialResult;
  buffaloPacingExertionCap: number;
  recommendedRestMinutes: number;
  clinicalNarrativeSummary: string;
  suggestedInterventions: string[];
  evaluatedAt: string;
}

export interface SCAT6Assessment {
  id: string;
  patientId: string;
  timestamp: string;
  daysPostInjury: number;
  triage: TriageEvaluation;
  symptoms: Record<string, PCSSSymptomSeverity>;
  vocalMetrics: VocalBiomarkerMetrics;
  vomsSession?: VOMSSessionResult;
  bessSession?: BESSSessionResult;
  nBackSession?: NBackTrialResult;
  hrvSession?: BluetoothHRVMetrics;
  clearancePassport?: SignedClearancePassport;
  cognitiveToleranceIndex: number;
  pacingComplianceScore: number;
  providerNotes?: string;
}

export type BinauralFrequencyBand = 'DELTA_3HZ' | 'THETA_6HZ' | 'ALPHA_10HZ' | 'BETA_15HZ';

export interface CognitivePacingSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  targetBand: BinauralFrequencyBand;
  carrierFrequencyHz: number;
  targetBeatHz: number;
  durationMinutes: number;
  completedMinutes: number;
  boxBreathingCycleSeconds: number;
  fatigueSurgeDetected: boolean;
  fatigueSurgeTimestamp?: string;
  startingFatigueScore: number;
  endingFatigueScore?: number;
  sessionState: 'idle' | 'running' | 'paused' | 'auto_stopped_fatigue' | 'completed';
}

export interface PatientBaseline {
  vocalHesitationBaseline: number;
  vocalTremorBaseline: number;
  speechPauseBaseline: number;
  pcssBaselineTotalScore: number;
  vomsBaselineNPCcm?: number;
  bessBaselineErrors?: number;
  baselineRmssdMs?: number;
  establishedDate: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  injuryDate: string;
  mechanismOfInjury: 'SPORTS' | 'MOTOR_VEHICLE' | 'FALL' | 'BLUNT_IMPACT' | 'OTHER';
  priorConcussionsCount: number;
  treatingProviderName?: string;
  treatingClinicName?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  baseline: PatientBaseline;
}

export interface LuxDisplaySettings {
  photophobiaFilter: 'DEEP_AMBER_590NM' | 'LOW_LUX_MONOCHROME' | 'TRUE_OLED_BLACK';
  autoDimmingEnabled: boolean;
  dynamicKelvinShiftEnabled: boolean;
  targetKelvin: number;
  dimmingTargetPercentage: number;
  highContrastMode: boolean;
  largeTypography: boolean;
  reducedMotion: boolean;
}

// --- FHIR R4 Models ---
export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    profile?: string[];
    lastUpdated?: string;
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    use: string;
    text: string;
    family: string;
    given: string[];
  }>;
  gender?: string;
  birthDate?: string;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'preliminary' | 'final' | 'amended';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  component?: Array<{
    code: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
      text: string;
    };
    valueQuantity?: {
      value: number;
      unit: string;
    };
    valueString?: string;
  }>;
}

export interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  status: 'final';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  effectiveDateTime: string;
  issued: string;
  performer: Array<{
    display: string;
  }>;
  result: Array<{
    reference: string;
    display: string;
  }>;
  conclusion: string;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type: 'collection' | 'document';
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: FHIRPatient | FHIRObservation | FHIRDiagnosticReport;
  }>;
}
