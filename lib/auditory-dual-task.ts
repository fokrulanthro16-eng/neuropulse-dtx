/**
 * NeuroPulse DTx - Auditory Dual-Task N-Back Cognitive Engine
 * Native Web Audio tone synthesis (440Hz vs 880Hz) implementing the
 * Buffalo Concussion Dual-Task working memory & reaction time latency protocol.
 */

import { NBackLevel, NBackTrialResult } from '@/types/clinical';

export type AuditoryToneType = 'LOW_440HZ' | 'HIGH_880HZ';

export interface AuditoryStimulusEvent {
  index: number;
  tone: AuditoryToneType;
  frequencyHz: number;
  timestampMs: number;
  isTargetMatch: boolean;
  userResponded: boolean;
  reactionTimeMs?: number;
}

export class AuditoryNBackEngine {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private nBackLevel: NBackLevel = 1;
  private totalStimuli = 16;
  private currentStimulusIndex = 0;
  private stimulusSequence: AuditoryStimulusEvent[] = [];
  private trialStartTime = 0;
  private toneTimer: NodeJS.Timeout | null = null;

  private onTonePlayCallback?: (event: AuditoryStimulusEvent, currentStep: number, total: number) => void;
  private onTrialCompleteCallback?: (result: NBackTrialResult) => void;

  constructor(
    onTonePlay?: (event: AuditoryStimulusEvent, currentStep: number, total: number) => void,
    onComplete?: (result: NBackTrialResult) => void
  ) {
    this.onTonePlayCallback = onTonePlay;
    this.onTrialCompleteCallback = onComplete;
  }

  public async startTrial(level: NBackLevel = 1, totalTrials = 16): Promise<boolean> {
    try {
      this.nBackLevel = level;
      this.totalStimuli = totalTrials;
      this.currentStimulusIndex = 0;
      this.stimulusSequence = [];

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isRunning = true;
      this.trialStartTime = performance.now();

      // Pre-generate pseudorandom sequence with ~35% target match probability
      const tones: AuditoryToneType[] = [];
      for (let i = 0; i < this.totalStimuli; i++) {
        if (i >= this.nBackLevel && Math.random() < 0.38) {
          // Force match target
          tones.push(tones[i - this.nBackLevel]);
        } else {
          tones.push(Math.random() > 0.5 ? 'HIGH_880HZ' : 'LOW_440HZ');
        }
      }

      // Schedule tones every 2.0 seconds
      this.scheduleNextTone(tones, 0);
      return true;
    } catch (err) {
      console.error('[AuditoryNBackEngine] Failed to initialize Web Audio:', err);
      return false;
    }
  }

  private scheduleNextTone(tones: AuditoryToneType[], index: number): void {
    if (!this.isRunning || index >= tones.length) {
      this.completeTrial();
      return;
    }

    const toneType = tones[index];
    const freq = toneType === 'HIGH_880HZ' ? 880 : 440;
    const isMatch = index >= this.nBackLevel && tones[index] === tones[index - this.nBackLevel];

    const event: AuditoryStimulusEvent = {
      index,
      tone: toneType,
      frequencyHz: freq,
      timestampMs: performance.now() - this.trialStartTime,
      isTargetMatch: isMatch,
      userResponded: false,
    };

    this.stimulusSequence.push(event);
    this.currentStimulusIndex = index;

    // Play synthesis tone (250ms duration with smooth envelope)
    this.playTone(freq);

    if (this.onTonePlayCallback) {
      this.onTonePlayCallback(event, index + 1, this.totalStimuli);
    }

    this.toneTimer = setTimeout(() => {
      this.scheduleNextTone(tones, index + 1);
    }, 2000); // 2.0s Inter-Stimulus Interval (ISI)
  }

  private playTone(frequency: number): void {
    if (!this.ctx || this.ctx.state === 'closed') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      // Smooth envelope (25ms attack, 200ms sustain, 50ms release)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.025);
      gain.gain.setValueAtTime(0.25, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('[AuditoryNBackEngine] Tone synthesis error:', e);
    }
  }

  /**
   * Records user response trigger (Spacebar, button tap, or voice cue)
   */
  public recordResponse(): { isCorrect: boolean; reactionTimeMs: number } {
    if (!this.isRunning || this.stimulusSequence.length === 0) {
      return { isCorrect: false, reactionTimeMs: 0 };
    }

    const currentEvent = this.stimulusSequence[this.stimulusSequence.length - 1];
    if (currentEvent.userResponded) {
      return { isCorrect: false, reactionTimeMs: 0 }; // Already answered this tone
    }

    const now = performance.now() - this.trialStartTime;
    const reactionTime = Math.round(now - currentEvent.timestampMs);

    currentEvent.userResponded = true;
    currentEvent.reactionTimeMs = reactionTime;

    const isCorrect = currentEvent.isTargetMatch;
    return { isCorrect, reactionTimeMs: reactionTime };
  }

  private completeTrial(): void {
    this.isRunning = false;
    if (this.toneTimer) {
      clearTimeout(this.toneTimer);
      this.toneTimer = null;
    }

    let hits = 0;
    let omissions = 0;
    let commissions = 0;
    let targetCount = 0;
    const reactionTimes: number[] = [];

    this.stimulusSequence.forEach((ev) => {
      if (ev.isTargetMatch) {
        targetCount++;
        if (ev.userResponded) {
          hits++;
          if (ev.reactionTimeMs) reactionTimes.push(ev.reactionTimeMs);
        } else {
          omissions++;
        }
      } else {
        if (ev.userResponded) {
          commissions++;
        }
      }
    });

    const avgReactionTime = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 520;

    const totalOpportunities = Math.max(1, this.stimulusSequence.length);
    const correctNonTargets = totalOpportunities - targetCount - commissions;
    const accuracy = Math.round(((hits + correctNonTargets) / totalOpportunities) * 100);

    // Executive cognitive score (0-100) penalized by reaction latency > 600ms
    const latencyPenalty = Math.max(0, (avgReactionTime - 450) / 10);
    const executiveIndex = Math.max(10, Math.min(100, Math.round(accuracy - latencyPenalty)));

    const result: NBackTrialResult = {
      timestamp: new Date().toISOString(),
      nBackLevel: this.nBackLevel,
      totalStimuli: this.stimulusSequence.length,
      targetCount,
      correctHits: hits,
      omissionErrors: omissions,
      commissionErrors: commissions,
      averageReactionTimeMs: avgReactionTime,
      accuracyPercentage: accuracy,
      executiveCognitiveIndex: executiveIndex,
      symptomExacerbationFlag: accuracy < 60 || avgReactionTime > 750,
    };

    if (this.onTrialCompleteCallback) {
      this.onTrialCompleteCallback(result);
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.toneTimer) {
      clearTimeout(this.toneTimer);
      this.toneTimer = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
