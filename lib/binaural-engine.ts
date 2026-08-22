/**
 * NeuroPulse DTx - Synthesized Binaural Beat & Auditory Grounding Engine
 * Native Web Audio API dual-channel oscillator synthesis for cognitive pacing,
 * autonomic nervous system regulation (Alpha 10Hz, Theta 6Hz, Delta 3Hz),
 * and phonophobia-safe pink noise masking.
 */

import { BinauralFrequencyBand } from '@/types/clinical';

export interface BinauralPreset {
  band: BinauralFrequencyBand;
  name: string;
  carrierHz: number;
  beatHz: number;
  description: string;
  clinicalPurpose: string;
}

export const BINAURAL_PRESETS: Record<BinauralFrequencyBand, BinauralPreset> = {
  DELTA_3HZ: {
    band: 'DELTA_3HZ',
    name: '3 Hz Delta Grounding',
    carrierHz: 160,
    beatHz: 3.0,
    description: 'Deep restorative neural deceleration & somatic pain relief',
    clinicalPurpose: 'Severe post-concussion fatigue, sleep onset induction, acute sensory overstimulation'
  },
  THETA_6HZ: {
    band: 'THETA_6HZ',
    name: '6 Hz Theta Reset',
    carrierHz: 200,
    beatHz: 6.0,
    description: 'Sub-threshold autonomic calming & neuro-emotional grounding',
    clinicalPurpose: 'Moderate cognitive strain, anxiety reduction, parasympathetic nervous system reactivation'
  },
  ALPHA_10HZ: {
    band: 'ALPHA_10HZ',
    name: '10 Hz Alpha Focus',
    carrierHz: 240,
    beatHz: 10.0,
    description: 'Cognitive pacing & gentle attentional stabilization',
    clinicalPurpose: 'Light cognitive micro-pacing, working memory recovery, reading tolerance building'
  },
  BETA_15HZ: {
    band: 'BETA_15HZ',
    name: '15 Hz SMR / Beta Alertness',
    carrierHz: 280,
    beatHz: 15.0,
    description: 'Sensorimotor rhythm activation for late-stage rehabilitation',
    clinicalPurpose: 'Late subacute return-to-learn and sustained attention training'
  }
};

export class BinauralAudioEngine {
  private ctx: AudioContext | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isPlaying = false;
  private currentPreset: BinauralPreset = BINAURAL_PRESETS.ALPHA_10HZ;
  private volume = 0.35; // Default safe non-startling volume
  private pinkNoiseVolume = 0.12;

  public async start(band: BinauralFrequencyBand = 'ALPHA_10HZ'): Promise<boolean> {
    try {
      this.currentPreset = BINAURAL_PRESETS[band] || BINAURAL_PRESETS.ALPHA_10HZ;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Master Gain for smooth ramp-up
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(this.volume, now + 2.0); // 2s gentle ramp
      this.masterGain.connect(this.ctx.destination);

      // Stereo Channel Splitter and Merger for true binaural isolation
      const merger = this.ctx.createChannelMerger(2);
      merger.connect(this.masterGain);

      // Left Channel (Carrier Frequency)
      this.leftOsc = this.ctx.createOscillator();
      this.leftOsc.type = 'sine';
      this.leftOsc.frequency.setValueAtTime(this.currentPreset.carrierHz, now);
      
      const leftGain = this.ctx.createGain();
      leftGain.gain.setValueAtTime(0.7, now);
      this.leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0); // Connect to Left output channel (index 0)

      // Right Channel (Carrier + Beat Frequency)
      this.rightOsc = this.ctx.createOscillator();
      this.rightOsc.type = 'sine';
      this.rightOsc.frequency.setValueAtTime(this.currentPreset.carrierHz + this.currentPreset.beatHz, now);

      const rightGain = this.ctx.createGain();
      rightGain.gain.setValueAtTime(0.7, now);
      this.rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1); // Connect to Right output channel (index 1)

      // Start Oscillators
      this.leftOsc.start(now);
      this.rightOsc.start(now);

      // Add gentle Pink Noise background for sensory comfort
      this.startPinkNoiseMasking();

      this.isPlaying = true;
      return true;
    } catch (err) {
      console.error('[BinauralAudioEngine] Audio context initialisation error:', err);
      return false;
    }
  }

  private startPinkNoiseMasking(): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds loop
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink noise algorithm (Paul Kellet's filter)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Low-pass filter to keep noise warm and soothing (amber audio tone < 450Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(this.pinkNoiseVolume, this.ctx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      this.noiseNode.start();
    } catch (e) {
      console.warn('[BinauralAudioEngine] Pink noise initialization skipped:', e);
    }
  }

  public setFrequencyBand(band: BinauralFrequencyBand): void {
    const preset = BINAURAL_PRESETS[band];
    if (!preset || !this.ctx || !this.isPlaying) return;

    this.currentPreset = preset;
    const now = this.ctx.currentTime;

    if (this.leftOsc) {
      this.leftOsc.frequency.setTargetAtTime(preset.carrierHz, now, 0.8);
    }
    if (this.rightOsc) {
      this.rightOsc.frequency.setTargetAtTime(preset.carrierHz + preset.beatHz, now, 0.8);
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Plays a gentle, warm harmonic chime for box breathing phase transitions (4-4-4-4)
   */
  public playBreathingCue(type: 'inhale' | 'hold' | 'exhale' | 'rest'): void {
    if (!this.ctx || this.ctx.state === 'closed') return;

    try {
      const now = this.ctx.currentTime;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';

      // Pitch cues: Inhale = rising warm 440Hz, Hold = steady 528Hz (solfeggio restorative), Exhale = descending 352Hz
      let freq = 440;
      if (type === 'inhale') freq = 440;
      else if (type === 'hold') freq = 528;
      else if (type === 'exhale') freq = 352;
      else if (type === 'rest') freq = 330;

      chimeOsc.frequency.setValueAtTime(freq, now);
      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start(now);
      chimeOsc.stop(now + 2.0);
    } catch {
      // Ignore if audio is currently inactive
    }
  }

  public stop(): void {
    if (!this.isPlaying || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        // Smooth 1s fade-out to prevent abrupt sound cut
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      }

      setTimeout(() => {
        if (this.leftOsc) {
          try { this.leftOsc.stop(); } catch {}
          this.leftOsc.disconnect();
          this.leftOsc = null;
        }
        if (this.rightOsc) {
          try { this.rightOsc.stop(); } catch {}
          this.rightOsc.disconnect();
          this.rightOsc = null;
        }
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch {}
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close();
          this.ctx = null;
        }
        this.isPlaying = false;
      }, 1100);
    } catch (e) {
      console.warn('[BinauralAudioEngine] Stop cleanup:', e);
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentPreset(): BinauralPreset {
    return this.currentPreset;
  }
}
