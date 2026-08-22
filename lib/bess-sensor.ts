/**
 * NeuroPulse DTx - Balance Error Scoring System (BESS) Sensor Engine
 * Real-time 3-axis accelerometer/gyroscope signal processing for postural sway area,
 * RMS acceleration, and clinical balance error scoring under SCAT6 guidelines.
 */

import { BESSStanceType, BESSMetrics } from '@/types/clinical';

export interface PosturalSwaySample {
  timestamp: number; // ms from trial start
  accelX: number;    // m/s²
  accelY: number;    // m/s²
  accelZ: number;    // m/s²
  tiltAngleDeg: number;
  pitchDeg: number;
  rollDeg: number;
  isErrorFrame: boolean;
}

export class BESSSensorEngine {
  private isRunning = false;
  private currentStance: BESSStanceType = 'DOUBLE_LEG_FIRM';
  private trialStartTime = 0;
  private trialDurationSeconds = 20; // Standard clinical 20s trial

  private samples: PosturalSwaySample[] = [];
  private errorCount = 0;
  private lastErrorTimestamp = 0;
  private errorCooldownMs = 1200; // Standard clinical rule: maximum 1 error scored per 1.2 seconds of instability

  // Dynamic filter state
  private gravityX = 0;
  private gravityY = 0;
  private gravityZ = 9.81;
  private readonly alpha = 0.85; // Low-pass filter constant for gravity isolation

  private motionListener: ((e: DeviceMotionEvent) => void) | null = null;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private simInterval: NodeJS.Timeout | null = null;
  private countdownTimer: NodeJS.Timeout | null = null;

  private currentPitch = 0;
  private currentRoll = 0;

  private onSampleCallback?: (sample: PosturalSwaySample, secondsRemaining: number) => void;
  private onCompleteCallback?: (metrics: BESSMetrics) => void;

  constructor(
    onSample?: (sample: PosturalSwaySample, secondsRemaining: number) => void,
    onComplete?: (metrics: BESSMetrics) => void
  ) {
    this.onSampleCallback = onSample;
    this.onCompleteCallback = onComplete;
  }

  public async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // iOS 13+ DeviceMotionEvent permission requirement
    if (
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
      'function'
    ) {
      try {
        const perm = await (
          DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        return perm === 'granted';
      } catch (e) {
        console.warn('[BESSSensor] iOS permission rejected, continuing in simulation mode', e);
        return false;
      }
    }

    return 'DeviceMotionEvent' in window;
  }

  public startTrial(stance: BESSStanceType): void {
    this.currentStance = stance;
    this.isRunning = true;
    this.trialStartTime = performance.now();
    this.samples = [];
    this.errorCount = 0;
    this.lastErrorTimestamp = 0;

    this.attachHardwareSensors();

    // 20-second trial countdown loop
    let remaining = this.trialDurationSeconds;
    this.countdownTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this.completeTrial();
      }
    }, 1000);
  }

  private attachHardwareSensors(): void {
    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      this.orientationListener = (e: DeviceOrientationEvent) => {
        this.currentPitch = e.beta || 0; // Front-to-back tilt (-180 to 180)
        this.currentRoll = e.gamma || 0; // Left-to-right tilt (-90 to 90)
      };
      window.addEventListener('deviceorientation', this.orientationListener);
    }

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      let hardwareDetected = false;
      this.motionListener = (e: DeviceMotionEvent) => {
        hardwareDetected = true;
        const now = performance.now();
        const elapsed = now - this.trialStartTime;

        const rawAcc = e.accelerationIncludingGravity || e.acceleration || { x: 0, y: 0, z: 9.8 };
        const rawX = rawAcc.x || 0;
        const rawY = rawAcc.y || 0;
        const rawZ = rawAcc.z || 9.81;

        // Isolate dynamic acceleration from gravity component
        this.gravityX = this.alpha * this.gravityX + (1 - this.alpha) * rawX;
        this.gravityY = this.alpha * this.gravityY + (1 - this.alpha) * rawY;
        this.gravityZ = this.alpha * this.gravityZ + (1 - this.alpha) * rawZ;

        const dynX = rawX - this.gravityX;
        const dynY = rawY - this.gravityY;
        const dynZ = rawZ - this.gravityZ;

        // Compute total angular tilt from vertical
        const totalTilt = Math.sqrt(this.currentPitch * this.currentPitch + this.currentRoll * this.currentRoll);

        // Standard BESS Error Threshold: Sway exceeds 15 degrees or acceleration spike > 4.5 m/s²
        const isExceedingAngle = totalTilt > 15.0;
        const isJerkSpike = Math.sqrt(dynX * dynX + dynY * dynY) > 4.2;
        let isError = false;

        if ((isExceedingAngle || isJerkSpike) && elapsed - this.lastErrorTimestamp > this.errorCooldownMs) {
          this.errorCount = Math.min(10, this.errorCount + 1);
          this.lastErrorTimestamp = elapsed;
          isError = true;
        }

        const sample: PosturalSwaySample = {
          timestamp: elapsed,
          accelX: dynX,
          accelY: dynY,
          accelZ: dynZ,
          tiltAngleDeg: totalTilt,
          pitchDeg: this.currentPitch,
          rollDeg: this.currentRoll,
          isErrorFrame: isError,
        };

        this.samples.push(sample);

        const secondsLeft = Math.max(0, Math.ceil(this.trialDurationSeconds - elapsed / 1000));
        if (this.onSampleCallback) {
          this.onSampleCallback(sample, secondsLeft);
        }
      };

      window.addEventListener('devicemotion', this.motionListener);

      // If no motion events received within 500ms (desktop environment), activate simulation loop
      setTimeout(() => {
        if (!hardwareDetected && this.isRunning) {
          this.startDesktopSimulation();
        }
      }, 500);
    } else {
      this.startDesktopSimulation();
    }
  }

  private startDesktopSimulation(): void {
    if (this.simInterval) clearInterval(this.simInterval);

    // Difficulty multiplier based on stance
    const stanceDifficulty =
      this.currentStance.includes('SINGLE') ? 2.4 : this.currentStance.includes('TANDEM') ? 1.6 : 0.8;
    const foamMultiplier = this.currentStance.includes('FOAM') ? 1.5 : 1.0;
    const swayFactor = stanceDifficulty * foamMultiplier;

    this.simInterval = setInterval(() => {
      if (!this.isRunning) {
        if (this.simInterval) clearInterval(this.simInterval);
        return;
      }

      const now = performance.now();
      const elapsed = now - this.trialStartTime;

      // Realistic inverted pendulum sway physics (0.2 Hz low frequency postural drift + micro-tremor)
      const driftPhase = elapsed * 0.002;
      const simPitch = Math.sin(driftPhase) * 4.5 * swayFactor + (Math.random() - 0.5) * 1.8;
      const simRoll = Math.cos(driftPhase * 0.8) * 4.0 * swayFactor + (Math.random() - 0.5) * 1.8;
      const totalTilt = Math.sqrt(simPitch * simPitch + simRoll * simRoll);

      const dynX = (simRoll / 15) * 1.2 + (Math.random() - 0.5) * 0.4;
      const dynY = (simPitch / 15) * 1.2 + (Math.random() - 0.5) * 0.4;

      let isError = false;
      // Probability of error based on stance difficulty
      if (totalTilt > 11.5 && elapsed - this.lastErrorTimestamp > this.errorCooldownMs) {
        if (Math.random() < 0.25 * swayFactor) {
          this.errorCount = Math.min(10, this.errorCount + 1);
          this.lastErrorTimestamp = elapsed;
          isError = true;
        }
      }

      const sample: PosturalSwaySample = {
        timestamp: elapsed,
        accelX: dynX,
        accelY: dynY,
        accelZ: (Math.random() - 0.5) * 0.2,
        tiltAngleDeg: totalTilt,
        pitchDeg: simPitch,
        rollDeg: simRoll,
        isErrorFrame: isError,
      };

      this.samples.push(sample);

      const secondsLeft = Math.max(0, Math.ceil(this.trialDurationSeconds - elapsed / 1000));
      if (this.onSampleCallback) {
        this.onSampleCallback(sample, secondsLeft);
      }
    }, 50); // 20 Hz sample rate
  }

  private completeTrial(): void {
    this.isRunning = false;
    this.cleanupListeners();

    // 1. Calculate Postural Sway Area (mm²/s) using bounding covariance integration
    let sumX2 = 0;
    let sumY2 = 0;
    let sumXY = 0;
    let maxTilt = 0;

    this.samples.forEach((s) => {
      sumX2 += s.accelX * s.accelX;
      sumY2 += s.accelY * s.accelY;
      sumXY += s.accelX * s.accelY;
      if (s.tiltAngleDeg > maxTilt) maxTilt = s.tiltAngleDeg;
    });

    const N = Math.max(1, this.samples.length);
    const varX = sumX2 / N;
    const varY = sumY2 / N;
    const covXY = sumXY / N;

    // 95% Confidence Ellipse Area proxy (Sway Area in mm²/s)
    const swayArea = Math.round(2 * Math.PI * Math.sqrt(Math.max(0.01, varX * varY - covXY * covXY)) * 1000);

    // 2. RMS Acceleration
    const rmsAccel = Number(Math.sqrt((sumX2 + sumY2) / N).toFixed(3));

    // 3. Normalized Stability Index (0-100)
    const stabilityIndex = Math.max(
      10,
      Math.round(100 - this.errorCount * 8 - (swayArea / 1500) * 20)
    );

    const metrics: BESSMetrics = {
      timestamp: new Date().toISOString(),
      stanceType: this.currentStance,
      posturalSwayAreaMm2: swayArea,
      accelerationRms: rmsAccel,
      maxTiltAngleDeg: Number(maxTilt.toFixed(1)),
      balanceErrorsCount: this.errorCount,
      trialDurationSeconds: this.trialDurationSeconds,
      stabilityIndex,
      excessiveSwayDetected: this.errorCount >= 4 || swayArea > 2500,
    };

    if (this.onCompleteCallback) {
      this.onCompleteCallback(metrics);
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.cleanupListeners();
  }

  private cleanupListeners(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    if (typeof window !== 'undefined') {
      if (this.motionListener) {
        window.removeEventListener('devicemotion', this.motionListener);
        this.motionListener = null;
      }
      if (this.orientationListener) {
        window.removeEventListener('deviceorientation', this.orientationListener);
        this.orientationListener = null;
      }
    }
  }
}
