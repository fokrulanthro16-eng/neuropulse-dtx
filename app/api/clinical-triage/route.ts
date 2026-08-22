/**
 * NeuroPulse DTx - Clinical AI Triage & PCSS Vector Extraction Endpoint (SaMD v3)
 * Strict SCAT6 Emergency Safety Engine with Negation Protection & Clinical Specificity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PCSSCluster, PCSSSymptomSeverity, RedFlagAlert, TriageEvaluation, VocalBiomarkerMetrics } from '@/types/clinical';
import { PCSS_SYMPTOM_DEFINITIONS, calculateBuffaloPacingRecommendations } from '@/lib/scat6-constants';

const ClinicalTriageRequestSchema = z.object({
  narrativeText: z.string().min(1, 'Clinical transcript or patient narrative is required'),
  vocalMetrics: z.object({
    timestamp: z.string(),
    durationMs: z.number(),
    speechPauseRatio: z.number(),
    speechHesitationIndex: z.number(),
    vocalTremorProxy: z.number(),
    volumeStabilityRms: z.number(),
    speakingRateProxy: z.number(),
    cognitiveFatigueScore: z.number(),
    baselineDeviationDelta: z.number().optional(),
  }).optional(),
  manualSymptomRatings: z.record(z.string(), z.number().min(0).max(6)).optional(),
});

/**
 * Checks if a phrase is negated in clinical context (e.g., "no emesis", "denies vomiting", "without seizures")
 */
function isNegated(text: string, phrase: string): boolean {
  const lower = text.toLowerCase();
  const phraseIdx = lower.indexOf(phrase.toLowerCase());
  if (phraseIdx === -1) return false;

  // Inspect up to 35 characters prior to phrase for negation operators
  const prefix = lower.slice(Math.max(0, phraseIdx - 35), phraseIdx);
  const negationTerms = ['no ', 'not ', 'denies ', 'without ', 'never ', 'zero ', 'negative for ', 'free of '];

  return negationTerms.some((term) => prefix.includes(term));
}

/**
 * Calls Google Gemini API for structured clinical analysis if API key is active
 */
async function callGeminiClinicalEngine(
  apiKey: string,
  narrativeText: string,
  vocalMetrics?: VocalBiomarkerMetrics
): Promise<{
  extractedSymptoms?: Record<string, number>;
  narrativeSummary?: string;
  interventions?: string[];
} | null> {
  try {
    const prompt = `You are a clinical-grade medical AI specialized in concussion and traumatic brain injury (mTBI) evaluation under SCAT6 (Sport Concussion Assessment Tool 6) and PCSS (Post-Concussion Symptom Scale - 22 standardized vectors).

Analyze this patient check-in transcript:
"${narrativeText}"

Vocal Biomarker Context (if available):
- Speech Pause Ratio: ${vocalMetrics?.speechPauseRatio ?? 'N/A'}
- Speech Hesitation Index: ${vocalMetrics?.speechHesitationIndex ?? 'N/A'}s
- Cognitive Fatigue Score: ${vocalMetrics?.cognitiveFatigueScore ?? 'N/A'}/100

Extract symptoms with severity scores from 0 (none) to 6 (severe) for any relevant PCSS vectors:
headache, pressure_in_head, neck_pain, nausea_vomiting, dizziness, blurred_vision, balance_problems, sensitivity_to_light, sensitivity_to_noise, feeling_slowed_down, feeling_in_a_fog, dont_feel_right, difficulty_concentrating, difficulty_remembering, fatigue_low_energy, confusion, more_emotional, irritability, sadness, nervous_anxious, drowsiness, trouble_falling_asleep.

IMPORTANT: If patient denies a symptom (e.g. "no vomiting", "no neck pain"), score it 0.

Return strict JSON:
{
  "extractedSymptoms": { [symptom_id]: number (0-6) },
  "narrativeSummary": "Concise medical assessment summary",
  "interventions": ["Specific pacing or photophobia recommendation 1", "Recommendation 2"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      console.warn('[Gemini API] Remote call status:', response.status);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return JSON.parse(rawText);
  } catch (err) {
    console.warn('[Gemini API] Failed to complete remote AI call, using deterministic fallback', err);
    return null;
  }
}

function evaluateClinicalNarrative(
  text: string,
  vocalMetrics?: VocalBiomarkerMetrics,
  manualRatings?: Record<string, number>,
  geminiOutput?: {
    extractedSymptoms?: Record<string, number>;
    narrativeSummary?: string;
    interventions?: string[];
  } | null
): TriageEvaluation {
  const lower = text.toLowerCase();
  const detectedRedFlags: RedFlagAlert[] = [];
  const symptomsScoreMap: Record<string, PCSSSymptomSeverity> = {};

  // Initialize all 22 PCSS symptoms to 0
  PCSS_SYMPTOM_DEFINITIONS.forEach((s) => {
    symptomsScoreMap[s.id] = 0;
  });

  // Apply Gemini AI extractions if available
  if (geminiOutput?.extractedSymptoms) {
    Object.entries(geminiOutput.extractedSymptoms).forEach(([key, val]) => {
      if (symptomsScoreMap.hasOwnProperty(key)) {
        symptomsScoreMap[key] = Math.max(0, Math.min(6, Math.round(val))) as PCSSSymptomSeverity;
      }
    });
  }

  // Apply manual overrides if provided
  if (manualRatings) {
    Object.entries(manualRatings).forEach(([key, val]) => {
      if (symptomsScoreMap.hasOwnProperty(key)) {
        symptomsScoreMap[key] = Math.max(0, Math.min(6, Math.round(val))) as PCSSSymptomSeverity;
      }
    });
  }

  // 1. Strict SCAT6 Emergency Red-Flag Auditing with Negation Protection
  // A. Unequal pupils (asymmetry / blown pupil)
  if (
    (lower.includes('unequal pupil') || lower.includes('one pupil is bigger') || lower.includes('one pupil bigger') || lower.includes('blown pupil') || lower.includes('pupils are different size')) &&
    !isNegated(lower, 'unequal pupil') && !isNegated(lower, 'one pupil') && !isNegated(lower, 'blown pupil')
  ) {
    detectedRedFlags.push({
      type: 'UNEQUAL_PUPILS',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Confirmed asymmetrical/unequal pupil diameter.',
      immediateAction: 'EMERGENCY: Immediate emergency medical activation (Call 911 / EMS). Potential uncal herniation / intracranial mass effect.',
      detectedAt: new Date().toISOString(),
    });
  }

  // B. Repeated emesis (Must be explicit repeated / multiple vomiting, NOT just single nausea)
  const isRepeatedEmesis =
    (lower.includes('repeated vomiting') ||
     lower.includes('threw up twice') ||
     lower.includes('threw up multiple') ||
     lower.includes('vomited multiple times') ||
     lower.includes('vomited twice') ||
     lower.includes('vomited 2 times') ||
     lower.includes('vomited 3 times') ||
     lower.includes('keep throwing up') ||
     lower.includes('repeated emesis') ||
     lower.includes('uncontrollable vomiting')) &&
    !isNegated(lower, 'vomiting') && !isNegated(lower, 'emesis') && !isNegated(lower, 'threw up');

  if (isRepeatedEmesis) {
    detectedRedFlags.push({
      type: 'REPEATED_EMESIS',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Repeated post-injury emesis episodes confirmed (>1 episode).',
      immediateAction: 'EMERGENCY: Immediate emergency department transfer for urgent non-contrast head CT/neuroimaging.',
      detectedAt: new Date().toISOString(),
    });
    symptomsScoreMap['nausea_vomiting'] = 6;
  }

  // C. Progressive focal deficit (Must be acute motor weakness / paralysis, NOT general tiredness)
  if (
    (lower.includes('cannot move arm') ||
     lower.includes('cannot move my arm') ||
     lower.includes('cannot move leg') ||
     lower.includes('cannot move my leg') ||
     lower.includes('face is drooping') ||
     lower.includes('face drooping') ||
     lower.includes('paralyzed') ||
     lower.includes('paralysis')) &&
    !isNegated(lower, 'cannot move') && !isNegated(lower, 'paralysis') && !isNegated(lower, 'face drooping')
  ) {
    detectedRedFlags.push({
      type: 'PROGRESSIVE_FOCAL_DEFICIT',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Focal neurological deficit (limb paralysis or cranial nerve deficit).',
      immediateAction: 'EMERGENCY: Immediate trauma emergency department evaluation for intracranial lesion.',
      detectedAt: new Date().toISOString(),
    });
  }

  // D. Thunderclap / Rapidly escalating severe headache
  if (
    (lower.includes('thunderclap headache') ||
     lower.includes('worst headache of my life') ||
     lower.includes('exploding headache')) &&
    !isNegated(lower, 'thunderclap') && !isNegated(lower, 'worst headache')
  ) {
    detectedRedFlags.push({
      type: 'ESCALATING_HEADACHE',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Sudden onset severe thunderclap cephalalgia.',
      immediateAction: 'EMERGENCY: Rule out subarachnoid hemorrhage or acute intracranial pressure spike.',
      detectedAt: new Date().toISOString(),
    });
    symptomsScoreMap['headache'] = 6;
  }

  // E. Seizures / Convulsions
  if (
    (lower.includes('had a seizure') ||
     lower.includes('active convulsion') ||
     lower.includes('seizure after') ||
     lower.includes('convulsions') ||
     lower.includes('shaking uncontrollably in a fit')) &&
    !isNegated(lower, 'seizure') && !isNegated(lower, 'convulsion')
  ) {
    detectedRedFlags.push({
      type: 'SEIZURE_CONVULSIONS',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Post-traumatic seizure or motor convulsion.',
      immediateAction: 'EMERGENCY: 911 dispatch and cervical spine stabilization.',
      detectedAt: new Date().toISOString(),
    });
  }

  // F. Slurred speech / Dysarthria
  if (
    (lower.includes('speech is slurred') ||
     lower.includes('slurring words heavily') ||
     lower.includes('unable to speak words')) &&
    !isNegated(lower, 'slurred') && !isNegated(lower, 'slurring')
  ) {
    detectedRedFlags.push({
      type: 'SLURRED_SPEECH',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Acute dysarthria or speech production deficit.',
      immediateAction: 'EMERGENCY: Acute neurological assessment for vascular/stroke-like deficit.',
      detectedAt: new Date().toISOString(),
    });
  }

  // G. Severe cervical spine tenderness
  if (
    (lower.includes('severe cervical spine tenderness') ||
     lower.includes('intense neck spine pain') ||
     lower.includes('burning pain down spine')) &&
    !isNegated(lower, 'spine') && !isNegated(lower, 'neck')
  ) {
    detectedRedFlags.push({
      type: 'SEVERE_NECK_PAIN',
      severity: 'CRITICAL_EMERGENCY',
      clinicalDescription: 'Severe midline cervical spine tenderness.',
      immediateAction: 'EMERGENCY: Cervical spine precaution and EMS immobilization.',
      detectedAt: new Date().toISOString(),
    });
    symptomsScoreMap['neck_pain'] = 5;
  }

  // 2. Standard Heuristic Extraction for Common mTBI Symptoms (with Negation Protection)
  const matchSymptom = (keywords: string[], symptomId: string, defaultSeverity: PCSSSymptomSeverity = 2) => {
    if (symptomsScoreMap[symptomId] > 0) return;

    for (const kw of keywords) {
      if (lower.includes(kw)) {
        if (isNegated(lower, kw)) {
          symptomsScoreMap[symptomId] = 0;
          return;
        }

        let severity = defaultSeverity;
        if (lower.includes(`severe ${kw}`) || lower.includes(`terrible ${kw}`) || lower.includes(`awful ${kw}`) || lower.includes(`extreme ${kw}`)) {
          severity = 5;
        } else if (lower.includes(`moderate ${kw}`) || lower.includes(`bad ${kw}`) || lower.includes(`3/6`) || lower.includes(`4/6`)) {
          severity = 3;
        } else if (lower.includes(`mild ${kw}`) || lower.includes(`slight ${kw}`) || lower.includes(`1/6`) || lower.includes(`2/6`)) {
          severity = 2;
        }
        symptomsScoreMap[symptomId] = severity;
        break;
      }
    }
  };

  matchSymptom(['headache', 'head hurts', 'throbbing head', 'pain in head'], 'headache', 2);
  matchSymptom(['pressure in head', 'head feels full', 'tightness in head', 'band around head'], 'pressure_in_head', 2);
  matchSymptom(['neck pain', 'sore neck', 'stiff neck'], 'neck_pain', 2);
  matchSymptom(['nausea', 'nauseous', 'sick to stomach', 'queasy'], 'nausea_vomiting', 2);
  matchSymptom(['dizzy', 'dizziness', 'lightheaded', 'spinning', 'vertigo'], 'dizziness', 2);
  matchSymptom(['blurry vision', 'blurred vision', 'fuzzy eyes', 'double vision'], 'blurred_vision', 2);
  matchSymptom(['balance problem', 'unsteady', 'wobbly', 'off balance'], 'balance_problems', 2);
  matchSymptom(['light sensitivity', 'sensitive to light', 'lights hurt', 'screen hurts', 'photophobia'], 'sensitivity_to_light', 3);
  matchSymptom(['noise sensitivity', 'sensitive to sound', 'sensitive to noise', 'phonophobia'], 'sensitivity_to_noise', 2);
  matchSymptom(['slowed down', 'thinking slow', 'sluggish'], 'feeling_slowed_down', 3);
  matchSymptom(['in a fog', 'brain fog', 'foggy', 'hazy'], 'feeling_in_a_fog', 3);
  matchSymptom(["don't feel right", "feel off", "not myself"], 'dont_feel_right', 2);
  matchSymptom(['concentrating', 'focus', 'cannot focus', 'hard to concentrate'], 'difficulty_concentrating', 2);
  matchSymptom(['remembering', 'memory', 'forgetting', 'forgetful'], 'difficulty_remembering', 2);
  matchSymptom(['fatigue', 'exhausted', 'tired', 'drained', 'low energy'], 'fatigue_low_energy', 3);
  matchSymptom(['confused', 'disoriented', 'lost track'], 'confusion', 2);
  matchSymptom(['emotional', 'crying easily', 'moody'], 'more_emotional', 2);
  matchSymptom(['irritable', 'annoyed easily', 'short temper'], 'irritability', 2);
  matchSymptom(['sad', 'depressed', 'down'], 'sadness', 1);
  matchSymptom(['anxious', 'anxiety', 'nervous', 'worried'], 'nervous_anxious', 2);
  matchSymptom(['drowsy', 'sleepy', 'drowsiness'], 'drowsiness', 2);
  matchSymptom(['trouble sleeping', 'insomnia', 'cannot fall asleep'], 'trouble_falling_asleep', 2);

  // 3. Multi-Axial Cluster Computation
  let totalPcssScore = 0;
  let symptomCount = 0;

  const clusterTotals: Record<PCSSCluster, { total: number; max: number; count: number; items: number }> = {
    somatic: { total: 0, max: 54, count: 0, items: 9 },
    cognitive: { total: 0, max: 36, count: 0, items: 6 },
    emotional: { total: 0, max: 24, count: 0, items: 4 },
    sleep: { total: 0, max: 18, count: 0, items: 3 },
  };

  PCSS_SYMPTOM_DEFINITIONS.forEach((s) => {
    const sev = symptomsScoreMap[s.id] || 0;
    totalPcssScore += sev;
    if (sev > 0) {
      symptomCount++;
      clusterTotals[s.cluster].count++;
    }
    clusterTotals[s.cluster].total += sev;
  });

  const clusterSummaries: Record<PCSSCluster, any> = {
    somatic: {
      cluster: 'somatic',
      totalScore: clusterTotals.somatic.total,
      maxScore: clusterTotals.somatic.max,
      symptomCount: clusterTotals.somatic.count,
      averageSeverity: clusterTotals.somatic.count > 0 ? Number((clusterTotals.somatic.total / clusterTotals.somatic.count).toFixed(2)) : 0,
    },
    cognitive: {
      cluster: 'cognitive',
      totalScore: clusterTotals.cognitive.total,
      maxScore: clusterTotals.cognitive.max,
      symptomCount: clusterTotals.cognitive.count,
      averageSeverity: clusterTotals.cognitive.count > 0 ? Number((clusterTotals.cognitive.total / clusterTotals.cognitive.count).toFixed(2)) : 0,
    },
    emotional: {
      cluster: 'emotional',
      totalScore: clusterTotals.emotional.total,
      maxScore: clusterTotals.emotional.max,
      symptomCount: clusterTotals.emotional.count,
      averageSeverity: clusterTotals.emotional.count > 0 ? Number((clusterTotals.emotional.total / clusterTotals.emotional.count).toFixed(2)) : 0,
    },
    sleep: {
      cluster: 'sleep',
      totalScore: clusterTotals.sleep.total,
      maxScore: clusterTotals.sleep.max,
      symptomCount: clusterTotals.sleep.count,
      averageSeverity: clusterTotals.sleep.count > 0 ? Number((clusterTotals.sleep.total / clusterTotals.sleep.count).toFixed(2)) : 0,
    },
  };

  // 4. Urgency & Buffalo Pacing
  let urgency: 'EMERGENCY_RED_FLAG' | 'HIGH_RISK' | 'SUB_SYMPTOM_ELEVATION' | 'STABLE_RECOVERY';
  if (detectedRedFlags.length > 0) {
    urgency = 'EMERGENCY_RED_FLAG';
  } else if (totalPcssScore >= 50 || (vocalMetrics && vocalMetrics.cognitiveFatigueScore >= 70)) {
    urgency = 'HIGH_RISK';
  } else if (totalPcssScore >= 15 || (vocalMetrics && vocalMetrics.cognitiveFatigueScore >= 35)) {
    urgency = 'SUB_SYMPTOM_ELEVATION';
  } else {
    urgency = 'STABLE_RECOVERY';
  }

  const fatigueScore = vocalMetrics?.cognitiveFatigueScore ?? (totalPcssScore / 132) * 100;
  const pacing = calculateBuffaloPacingRecommendations(totalPcssScore, fatigueScore);

  const interventions: string[] = geminiOutput?.interventions && geminiOutput.interventions.length > 0
    ? geminiOutput.interventions
    : [];

  if (symptomsScoreMap['sensitivity_to_light'] >= 2 && !interventions.some(i => i.toLowerCase().includes('amber') || i.toLowerCase().includes('lux'))) {
    interventions.push('Enforce 590nm Deep Amber Sub-50 Lux visual profile');
  }
  if (symptomsScoreMap['sensitivity_to_noise'] >= 2 && !interventions.some(i => i.toLowerCase().includes('noise'))) {
    interventions.push('Enable pink-noise auditory masking during pacing');
  }
  if ((symptomsScoreMap['headache'] >= 2 || symptomsScoreMap['feeling_in_a_fog'] >= 2) && !interventions.some(i => i.toLowerCase().includes('binaural'))) {
    interventions.push(`Prescribe ${pacing.binauralBand.replace('_', ' ')} Binaural Beat Therapy for ${pacing.maxContinuousMinutes} mins`);
  }
  interventions.push(`Cap continuous cognitive screen exposure at ${pacing.maxContinuousMinutes} minutes with ${pacing.suggestedRestMinutes} minutes restorative rest`);

  const narrative = detectedRedFlags.length > 0
    ? `CRITICAL TRIAGE: ${detectedRedFlags.length} SCAT6 emergency red flags identified. Immediate medical evaluation mandatory.`
    : geminiOutput?.narrativeSummary ||
      `Standard SCAT6 / PCSS Assessment: Total Symptom Score ${totalPcssScore}/132 across ${symptomCount} active vectors. Primary symptom burden localized in ${clusterTotals.somatic.total >= clusterTotals.cognitive.total ? 'Somatic' : 'Cognitive'} domain. Recommended cognitive exertion threshold: ${pacing.exertionCapPercent}%.`;

  return {
    urgency,
    hasRedFlags: detectedRedFlags.length > 0,
    redFlags: detectedRedFlags,
    pcssTotalScore: totalPcssScore,
    pcssSymptomCount: symptomCount,
    clusterSummaries,
    vocalBiomarkers: vocalMetrics,
    buffaloPacingExertionCap: pacing.exertionCapPercent,
    recommendedRestMinutes: pacing.suggestedRestMinutes,
    clinicalNarrativeSummary: narrative,
    suggestedInterventions: interventions,
    evaluatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = ClinicalTriageRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid clinical request payload',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { narrativeText, vocalMetrics, manualSymptomRatings } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY;

    let geminiOutput = null;
    if (apiKey && apiKey.trim().length > 10) {
      geminiOutput = await callGeminiClinicalEngine(apiKey, narrativeText, vocalMetrics);
    }

    const evaluation = evaluateClinicalNarrative(narrativeText, vocalMetrics, manualSymptomRatings, geminiOutput);

    return NextResponse.json({
      success: true,
      aiEngine: geminiOutput ? 'Gemini-1.5-Flash (Live)' : 'SCAT6-Deterministic-Safety-Engine',
      evaluation,
      rawExtractedSymptoms: manualSymptomRatings || {},
    });
  } catch (err: any) {
    console.error('[API /clinical-triage] Unexpected error:', err);
    return NextResponse.json(
      {
        error: 'Clinical triage evaluation failed',
        message: err.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
