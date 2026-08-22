/**
 * NeuroPulse DTx - Global Zustand Store (v3 Enterprise SaMD Suite)
 * Manages patient state, longitudinal SCAT6 assessments, VOMS, BESS, N-Back dual-task,
 * Bluetooth HRV, Adaptive Kelvin Filter, and Signed Clearance Passports.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  PatientProfile,
  SCAT6Assessment,
  VocalBiomarkerMetrics,
  CognitivePacingSession,
  LuxDisplaySettings,
  RedFlagAlert,
} from '@/types/clinical';

export type NavTabType =
  | 'logger'
  | 'pacing'
  | 'voms'
  | 'bess'
  | 'nback'
  | 'hrv'
  | 'kelvin'
  | 'coach'
  | 'passport'
  | 'trajectory'
  | 'matrix'
  | 'report';

interface NeuroPulseState {
  // Patient Profile
  profile: PatientProfile;
  setProfile: (profile: Partial<PatientProfile>) => void;

  // Assessments History
  assessments: SCAT6Assessment[];
  addAssessment: (assessment: SCAT6Assessment) => void;
  clearHistory: () => void;

  // Active Biomarker & Recording State
  latestVocalMetrics: VocalBiomarkerMetrics | null;
  setLatestVocalMetrics: (metrics: VocalBiomarkerMetrics | null) => void;

  // Active Pacing Session State
  activePacingSession: CognitivePacingSession | null;
  setActivePacingSession: (session: CognitivePacingSession | null) => void;
  updatePacingSession: (updates: Partial<CognitivePacingSession>) => void;

  // Emergency Red Flag Alert State
  activeRedFlagAlert: RedFlagAlert | null;
  setActiveRedFlagAlert: (alert: RedFlagAlert | null) => void;

  // Display & Lux Settings
  luxSettings: LuxDisplaySettings;
  setLuxSettings: (settings: Partial<LuxDisplaySettings>) => void;
  isAmbientDimmed: boolean;
  setIsAmbientDimmed: (dimmed: boolean) => void;

  // Navigation tab
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;

  // FHIR Export Modal
  isFhirModalOpen: boolean;
  setIsFhirModalOpen: (open: boolean) => void;
}

const INITIAL_PROFILE: PatientProfile = {
  id: 'NP-DTX-8829',
  fullName: 'Alex Vance',
  dateOfBirth: '1996-04-12',
  injuryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  mechanismOfInjury: 'SPORTS',
  priorConcussionsCount: 1,
  treatingProviderName: 'Dr. Sarah Lin, MD, FAAN (Neurotrauma)',
  treatingClinicName: 'Comprehensive Concussion & Brain Recovery Institute',
  emergencyContact: {
    name: 'Morgan Vance',
    relationship: 'Spouse',
    phone: '+1 (555) 234-5678',
  },
  baseline: {
    vocalHesitationBaseline: 0.18,
    vocalTremorBaseline: 0.012,
    speechPauseBaseline: 0.22,
    pcssBaselineTotalScore: 4,
    vomsBaselineNPCcm: 4.0,
    bessBaselineErrors: 4,
    baselineRmssdMs: 46,
    establishedDate: '2026-08-14',
  },
};

const INITIAL_ASSESSMENTS: SCAT6Assessment[] = [
  {
    id: 'asmt-001',
    patientId: 'NP-DTX-8829',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    daysPostInjury: 1,
    symptoms: {
      headache: 5,
      pressure_in_head: 5,
      neck_pain: 3,
      nausea_vomiting: 4,
      dizziness: 5,
      blurred_vision: 4,
      balance_problems: 4,
      sensitivity_to_light: 6,
      sensitivity_to_noise: 5,
      feeling_slowed_down: 5,
      feeling_in_a_fog: 5,
      dont_feel_right: 5,
      difficulty_concentrating: 5,
      difficulty_remembering: 4,
      fatigue_low_energy: 5,
      confusion: 3,
      drowsiness: 4,
      trouble_falling_asleep: 4,
    },
    vocalMetrics: {
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      durationMs: 45000,
      speechPauseRatio: 0.48,
      speechHesitationIndex: 0.62,
      vocalTremorProxy: 0.048,
      volumeStabilityRms: 0.032,
      speakingRateProxy: 72,
      cognitiveFatigueScore: 78,
      baselineDeviationDelta: 65,
    },
    cognitiveToleranceIndex: 25,
    pacingComplianceScore: 85,
    providerNotes: 'Acute Day 1 post-impact. Severe photophobia and somatic headache burden. Initiated strict sub-symptom rest and 590nm amber display filter.',
    triage: {
      urgency: 'HIGH_RISK',
      hasRedFlags: false,
      redFlags: [],
      pcssTotalScore: 76,
      pcssSymptomCount: 18,
      clusterSummaries: {
        somatic: { cluster: 'somatic', totalScore: 37, maxScore: 54, symptomCount: 9, averageSeverity: 4.1 },
        cognitive: { cluster: 'cognitive', totalScore: 22, maxScore: 36, symptomCount: 5, averageSeverity: 4.4 },
        emotional: { cluster: 'emotional', totalScore: 5, maxScore: 24, symptomCount: 1, averageSeverity: 1.2 },
        sleep: { cluster: 'sleep', totalScore: 12, maxScore: 18, symptomCount: 3, averageSeverity: 4.0 },
      },
      buffaloPacingExertionCap: 20,
      recommendedRestMinutes: 30,
      clinicalNarrativeSummary: 'Acute phase high somatic burden. Strict sub-50 lux visual pacing enforced.',
      suggestedInterventions: ['Sub-50 lux display only', '3Hz Delta Grounding 3x daily', 'Zero screen reading >10 mins'],
      evaluatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'asmt-002',
    patientId: 'NP-DTX-8829',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    daysPostInjury: 3,
    symptoms: {
      headache: 4,
      pressure_in_head: 3,
      neck_pain: 2,
      dizziness: 3,
      blurred_vision: 2,
      balance_problems: 2,
      sensitivity_to_light: 4,
      sensitivity_to_noise: 3,
      feeling_slowed_down: 4,
      feeling_in_a_fog: 3,
      dont_feel_right: 3,
      difficulty_concentrating: 3,
      fatigue_low_energy: 4,
      drowsiness: 3,
    },
    vocalMetrics: {
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      durationMs: 40000,
      speechPauseRatio: 0.38,
      speechHesitationIndex: 0.44,
      vocalTremorProxy: 0.031,
      volumeStabilityRms: 0.041,
      speakingRateProxy: 94,
      cognitiveFatigueScore: 54,
      baselineDeviationDelta: 38,
    },
    cognitiveToleranceIndex: 48,
    pacingComplianceScore: 92,
    providerNotes: 'Day 3 check-in. Nausea resolved. Photophobia improved from 6/6 to 4/6. Speech hesitation dropping.',
    triage: {
      urgency: 'SUB_SYMPTOM_ELEVATION',
      hasRedFlags: false,
      redFlags: [],
      pcssTotalScore: 38,
      pcssSymptomCount: 14,
      clusterSummaries: {
        somatic: { cluster: 'somatic', totalScore: 18, maxScore: 54, symptomCount: 7, averageSeverity: 2.6 },
        cognitive: { cluster: 'cognitive', totalScore: 13, maxScore: 36, symptomCount: 4, averageSeverity: 3.25 },
        emotional: { cluster: 'emotional', totalScore: 4, maxScore: 24, symptomCount: 1, averageSeverity: 1.0 },
        sleep: { cluster: 'sleep', totalScore: 3, maxScore: 18, symptomCount: 1, averageSeverity: 3.0 },
      },
      buffaloPacingExertionCap: 45,
      recommendedRestMinutes: 20,
      clinicalNarrativeSummary: 'Sub-acute improvement noted. Cognitive pause latency reduced.',
      suggestedInterventions: ['6Hz Theta Pacing 2x daily', '15 min gentle walking with breaks'],
      evaluatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'asmt-003',
    patientId: 'NP-DTX-8829',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysPostInjury: 6,
    symptoms: {
      headache: 2,
      pressure_in_head: 1,
      sensitivity_to_light: 2,
      sensitivity_to_noise: 2,
      feeling_slowed_down: 2,
      feeling_in_a_fog: 1,
      difficulty_concentrating: 2,
      fatigue_low_energy: 2,
    },
    vocalMetrics: {
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      durationMs: 38000,
      speechPauseRatio: 0.26,
      speechHesitationIndex: 0.24,
      vocalTremorProxy: 0.019,
      volumeStabilityRms: 0.048,
      speakingRateProxy: 118,
      cognitiveFatigueScore: 31,
      baselineDeviationDelta: 12,
    },
    cognitiveToleranceIndex: 74,
    pacingComplianceScore: 96,
    providerNotes: 'Day 6 post-injury. Symptom burden dropping steadily. Working memory dual-task tolerance improved.',
    triage: {
      urgency: 'STABLE_RECOVERY',
      hasRedFlags: false,
      redFlags: [],
      pcssTotalScore: 12,
      pcssSymptomCount: 8,
      clusterSummaries: {
        somatic: { cluster: 'somatic', totalScore: 5, maxScore: 54, symptomCount: 4, averageSeverity: 1.25 },
        cognitive: { cluster: 'cognitive', totalScore: 5, maxScore: 36, symptomCount: 3, averageSeverity: 1.66 },
        emotional: { cluster: 'emotional', totalScore: 2, maxScore: 24, symptomCount: 1, averageSeverity: 2.0 },
        sleep: { cluster: 'sleep', totalScore: 0, maxScore: 18, symptomCount: 0, averageSeverity: 0 },
      },
      buffaloPacingExertionCap: 70,
      recommendedRestMinutes: 15,
      clinicalNarrativeSummary: 'Favorable recovery trajectory. Acoustic cadence approaching pre-injury baseline.',
      suggestedInterventions: ['10Hz Alpha Focus Pacing', 'Gradual cognitive load return (Stage 3 Buffalo Protocol)'],
      evaluatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

export const useNeuroPulseStore = create<NeuroPulseState>()(
  persist(
    (set) => ({
      profile: INITIAL_PROFILE,
      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      assessments: INITIAL_ASSESSMENTS,
      addAssessment: (assessment) =>
        set((state) => ({
          assessments: [assessment, ...state.assessments],
          latestVocalMetrics: assessment.vocalMetrics,
        })),
      clearHistory: () => set({ assessments: [] }),

      latestVocalMetrics: INITIAL_ASSESSMENTS[INITIAL_ASSESSMENTS.length - 1].vocalMetrics,
      setLatestVocalMetrics: (metrics) => set({ latestVocalMetrics: metrics }),

      activePacingSession: null,
      setActivePacingSession: (session) => set({ activePacingSession: session }),
      updatePacingSession: (updates) =>
        set((state) => ({
          activePacingSession: state.activePacingSession
            ? { ...state.activePacingSession, ...updates }
            : null,
        })),

      activeRedFlagAlert: null,
      setActiveRedFlagAlert: (alert) => set({ activeRedFlagAlert: alert }),

      luxSettings: {
        photophobiaFilter: 'DEEP_AMBER_590NM',
        autoDimmingEnabled: true,
        dynamicKelvinShiftEnabled: true,
        targetKelvin: 2200,
        dimmingTargetPercentage: 10,
        highContrastMode: true,
        largeTypography: false,
        reducedMotion: false,
      },
      setLuxSettings: (updates) =>
        set((state) => ({
          luxSettings: { ...state.luxSettings, ...updates },
        })),

      isAmbientDimmed: false,
      setIsAmbientDimmed: (dimmed) => set({ isAmbientDimmed: dimmed }),

      activeTab: 'logger',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isFhirModalOpen: false,
      setIsFhirModalOpen: (open) => set({ isFhirModalOpen: open }),
    }),
    {
      name: 'neuropulse_dtx_store_v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
