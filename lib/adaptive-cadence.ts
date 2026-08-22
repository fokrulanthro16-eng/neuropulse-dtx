/**
 * NeuroPulse DTx - Adaptive Cadence Clinical Voice Coach
 * Speech synthesis pipeline dynamically calculating speech rate (0.70x to 1.0x)
 * and pitch based on live Cognitive Pause Ratio and Fatigue Score to prevent auditory overstimulation.
 */

export class AdaptiveVoiceCoachEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer natural, warm English voices (e.g., Google US English, Samantha, Daniel)
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha'))
    );
    this.selectedVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  /**
   * Calculates speech rate and pitch based on patient cognitive load
   */
  public calculateCadenceParams(fatigueScore: number, pauseRatio: number): {
    rate: number;
    pitch: number;
    description: string;
  } {
    if (fatigueScore >= 60 || pauseRatio >= 0.4) {
      // High cognitive fatigue: Slow, soothing tempo to prevent auditory processing fatigue
      return {
        rate: 0.72,
        pitch: 0.90,
        description: 'Soothing Sub-Threshold Pace (0.72x)',
      };
    } else if (fatigueScore >= 35 || pauseRatio >= 0.25) {
      // Moderate fatigue: Gentle pacing tempo
      return {
        rate: 0.84,
        pitch: 0.95,
        description: 'Gentle Pacing Cadence (0.84x)',
      };
    } else {
      // Mild / Stable: Natural conversational tempo
      return {
        rate: 0.95,
        pitch: 1.0,
        description: 'Conversational Cadence (0.95x)',
      };
    }
  }

  /**
   * Speaks clinical guidance with dynamic cadence
   */
  public speak(
    message: string,
    fatigueScore = 30,
    pauseRatio = 0.2,
    onEnd?: () => void
  ): boolean {
    if (!this.synth) {
      console.warn('[AdaptiveVoiceCoach] SpeechSynthesis not available.');
      return false;
    }

    try {
      this.synth.cancel(); // Stop any pending utterance

      const params = this.calculateCadenceParams(fatigueScore, pauseRatio);
      const utterance = new SpeechSynthesisUtterance(message);

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.rate = params.rate;
      utterance.pitch = params.pitch;
      utterance.volume = 0.85;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[AdaptiveVoiceCoach] Speech error:', e);
        this.isSpeaking = false;
      };

      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.error('[AdaptiveVoiceCoach] Speak failure:', e);
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
