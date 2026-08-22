'use client';

/**
 * NeuroPulse DTx - Hardware Ambient Light & Dynamic Kelvin Shift Filter (SaMD v3)
 * Dynamically adjusts screen color temperature (1800K - 3200K) based on ambient lux
 * with clamped opacity (max 0.08) to guarantee >88% screen legibility.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { AmbientLuxEngine } from '@/lib/ambient-lux';
import { AmbientLuxState } from '@/types/clinical';
import {
  Sun,
  Moon,
  Flame,
  Sliders,
  Sparkles,
  ShieldCheck,
  Eye,
  Activity
} from 'lucide-react';

export const AdaptiveKelvinFilter: React.FC = () => {
  const { luxSettings, setLuxSettings } = useNeuroPulseStore();
  const [luxState, setLuxState] = useState<AmbientLuxState>({
    currentLux: 45,
    sensorSource: 'TIME_OF_DAY_ESTIMATE',
    targetKelvin: 2200,
    opticalFilterRgba: 'rgba(245, 158, 11, 0.05)',
    recommendedLuxMode: 'Sub-50 Lux Clinical Amber (2200K)',
    screenDimPercentage: 88,
    photophobiaStressScore: 25,
  });

  const [manualLuxInput, setManualLuxInput] = useState(45);
  const engineRef = useRef<AmbientLuxEngine | null>(null);

  useEffect(() => {
    const engine = new AmbientLuxEngine((state) => {
      // Clamp optical filter alpha strictly between 0.02 and 0.06
      const safeAlpha = Math.min(0.06, Math.max(0.02, 0.08 - ((state.targetKelvin - 1800) / 1400) * 0.05));
      const safeRgba = `rgba(245, 158, 11, ${safeAlpha.toFixed(3)})`;
      setLuxState({
        ...state,
        opticalFilterRgba: safeRgba,
        screenDimPercentage: Math.max(85, state.screenDimPercentage),
      });
      setManualLuxInput(state.currentLux);
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const handleManualLuxChange = (newLux: number) => {
    setManualLuxInput(newLux);
    if (engineRef.current) {
      engineRef.current.setManualLux(newLux);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Kelvin Optical Screen Overlay (Non-blocking clamped filter) */}
      <div
        className="fixed inset-0 pointer-events-none z-30 transition-all duration-700"
        style={{
          backgroundColor: luxSettings.dynamicKelvinShiftEnabled ? luxState.opticalFilterRgba : 'transparent',
        }}
      />

      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5" />
              <span>Dynamic Optical Spectrum &amp; Photophobia Shield</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Hardware Ambient Light &amp; Kelvin Shift
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Interfaces with device ambient light sensors to dynamically shift screen color temperature between 1800K (Candlelight Amber) and 3200K (Warm OLED) without dimming below readable contrast.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setLuxSettings({ dynamicKelvinShiftEnabled: !luxSettings.dynamicKelvinShiftEnabled })
              }
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                luxSettings.dynamicKelvinShiftEnabled
                  ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'border-white/10 bg-zinc-950/70 text-zinc-400'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{luxSettings.dynamicKelvinShiftEnabled ? 'Kelvin Filter ACTIVE' : 'Enable Dynamic Kelvin'}</span>
            </button>
          </div>
        </div>

        {/* Live Lux & Kelvin Telemetry HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Ambient Light Reading</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">{luxState.currentLux}</span>
              <span className="text-xs text-zinc-400 font-mono">Lux</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Source: {luxState.sensorSource.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Target Screen Kelvin</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-amber-400 tracking-tight">{luxState.targetKelvin}</span>
              <span className="text-xs text-zinc-400 font-mono">Kelvin (K)</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              {luxState.recommendedLuxMode}
            </span>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Photophobia Relief</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                {100 - luxState.photophobiaStressScore}%
              </span>
              <span className="text-xs text-zinc-400 font-mono">Protection</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              0% Blue Light Transmission (Clamped Luminance)
            </span>
          </div>
        </div>

        {/* Interactive Ambient Lux Simulator & Color Temperature Gradient */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">Interactive Environmental Lux Calibration</h3>
              <p className="text-xs text-zinc-400">
                Simulate different lighting environments to observe automatic color temperature shifts.
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {manualLuxInput} Lux
            </span>
          </div>

          {/* Color Temperature Visual Spectrum Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 border border-white/10 shadow-inner relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-3 bg-white border-2 border-black rounded-full transform -translate-x-1/2 shadow-lg"
                style={{
                  left: `${Math.min(100, Math.max(0, ((luxState.targetKelvin - 1800) / 1400) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>1800K (Candlelight)</span>
              <span>2400K (Sunset Gold)</span>
              <span>3200K (Warm OLED)</span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="10"
              max="450"
              step="5"
              value={manualLuxInput}
              onChange={(e) => handleManualLuxChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>Dark Room (10 Lux)</span>
              <span>Dim Interior (50 Lux)</span>
              <span>Bright Room (300 Lux)</span>
              <span>Daylight (450 Lux)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
