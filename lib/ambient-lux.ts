/**
 * NeuroPulse DTx - Hardware Ambient Light & Dynamic Kelvin Shift Engine
 * Interfaces with native AmbientLightSensor API with time-of-day lux estimation
 * and calculates dynamic Kelvin color temperature shifts (1800K - 3200K)
 * to prevent photophobic cranial pressure spikes.
 */

import { AmbientLuxState } from '@/types/clinical';

export class AmbientLuxEngine {
  private sensor: any = null;
  private currentLux = 45; // Sub-50 lux baseline
  private sensorSource: 'HARDWARE_API' | 'TIME_OF_DAY_ESTIMATE' | 'MANUAL_OVERRIDE' = 'TIME_OF_DAY_ESTIMATE';
  private onLuxChangeCallback?: (state: AmbientLuxState) => void;
  private isListening = false;
  private timeCheckInterval: NodeJS.Timeout | null = null;

  constructor(onLuxChange?: (state: AmbientLuxState) => void) {
    this.onLuxChangeCallback = onLuxChange;
  }

  public async start(): Promise<boolean> {
    if (this.isListening) return true;

    let hardwareAvailable = false;

    // 1. Try Hardware AmbientLightSensor API (W3C Generic Sensor Standard)
    if (typeof window !== 'undefined' && 'AmbientLightSensor' in window) {
      try {
        // @ts-ignore - AmbientLightSensor generic sensor
        this.sensor = new window.AmbientLightSensor({ frequency: 2 });
        this.sensor.addEventListener('reading', () => {
          this.currentLux = Math.round(this.sensor.illuminance || 50);
          this.sensorSource = 'HARDWARE_API';
          this.emitState();
        });
        this.sensor.addEventListener('error', (event: any) => {
          console.warn('[AmbientLuxEngine] Hardware sensor error, falling back to time estimate', event.error);
          this.activateTimeOfDayFallback();
        });
        this.sensor.start();
        hardwareAvailable = true;
      } catch (err) {
        console.warn('[AmbientLuxEngine] AmbientLightSensor initialization failed:', err);
      }
    }

    if (!hardwareAvailable) {
      this.activateTimeOfDayFallback();
    }

    this.isListening = true;
    this.emitState();
    return true;
  }

  private activateTimeOfDayFallback(): void {
    this.sensorSource = 'TIME_OF_DAY_ESTIMATE';
    this.updateTimeOfDayLux();

    if (this.timeCheckInterval) clearInterval(this.timeCheckInterval);
    this.timeCheckInterval = setInterval(() => {
      this.updateTimeOfDayLux();
    }, 60000); // Check every minute
  }

  private updateTimeOfDayLux(): void {
    const hour = new Date().getHours();
    // Circadian Ambient Lux Curve: Night (sub-30 lux) -> Morning (150 lux) -> Midday (400 lux) -> Evening (50 lux)
    if (hour >= 22 || hour < 6) {
      this.currentLux = 18; // Night environment
    } else if (hour >= 6 && hour < 9) {
      this.currentLux = 120; // Early morning
    } else if (hour >= 9 && hour < 17) {
      this.currentLux = 320; // Daytime ambient
    } else if (hour >= 17 && hour < 20) {
      this.currentLux = 110; // Sunset / twilight
    } else {
      this.currentLux = 42; // Evening sub-50 lux
    }
    this.emitState();
  }

  public setManualLux(lux: number): void {
    this.currentLux = Math.max(5, Math.min(1000, lux));
    this.sensorSource = 'MANUAL_OVERRIDE';
    this.emitState();
  }

  /**
   * Calculates optimal screen Kelvin (1800K candle amber to 3200K warm OLED)
   */
  public calculateKelvinState(): AmbientLuxState {
    const lux = this.currentLux;

    // Linear Kelvin mapping: Lux ≤ 30 -> 1800K, Lux ≥ 400 -> 3200K
    const kelvin = Math.round(1800 + Math.min(1.0, Math.max(0, (lux - 20) / 380)) * 1400);

    // Calculate subtle non-darkening overlay (alpha 0.02 to 0.05)
    const alpha = Number((0.05 - ((kelvin - 1800) / 1400) * 0.03).toFixed(3));
    const overlayRgba = `rgba(245, 158, 11, ${alpha})`;

    // Recommended lux mode & screen dim percentage (clamped to >= 88% brightness)
    let recommendedLuxMode = '590nm Deep Amber';
    let screenDim = 92;
    let photophobiaStress = 15;

    if (lux < 40) {
      recommendedLuxMode = 'Sub-30 Lux Candle Shield (1800K)';
      screenDim = 88;
      photophobiaStress = 10;
    } else if (lux < 100) {
      recommendedLuxMode = 'Sub-50 Lux Clinical Amber (2200K)';
      screenDim = 90;
      photophobiaStress = 25;
    } else if (lux < 300) {
      recommendedLuxMode = 'Warm Golden OLED (2700K)';
      screenDim = 95;
      photophobiaStress = 55;
    } else {
      recommendedLuxMode = 'Bright Ambient Filtration (3200K)';
      screenDim = 98;
      photophobiaStress = 80;
    }

    return {
      currentLux: lux,
      sensorSource: this.sensorSource,
      targetKelvin: kelvin,
      opticalFilterRgba: overlayRgba,
      recommendedLuxMode,
      screenDimPercentage: screenDim,
      photophobiaStressScore: photophobiaStress,
    };
  }

  private emitState(): void {
    if (this.onLuxChangeCallback) {
      this.onLuxChangeCallback(this.calculateKelvinState());
    }
  }

  public stop(): void {
    this.isListening = false;
    if (this.sensor) {
      try {
        this.sensor.stop();
      } catch {}
      this.sensor = null;
    }
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }
  }
}
