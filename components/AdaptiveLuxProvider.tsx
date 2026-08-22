'use client';

/**
 * NeuroPulse DTx - Luxury Adaptive Lux Provider & Photophobia Shield
 * Floating glassmorphism quick control panel and 10% sub-50 lux dimming shield.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { Sun, Moon, Eye, Contrast, Type, X } from 'lucide-react';

interface AdaptiveLuxContextType {
  isDimmed: boolean;
  toggleDimming: () => void;
  filterMode: string;
  setFilterMode: (mode: 'DEEP_AMBER_590NM' | 'LOW_LUX_MONOCHROME' | 'TRUE_OLED_BLACK') => void;
}

const AdaptiveLuxContext = createContext<AdaptiveLuxContextType | null>(null);

export const useAdaptiveLux = () => {
  const context = useContext(AdaptiveLuxContext);
  if (!context) {
    throw new Error('useAdaptiveLux must be used within an AdaptiveLuxProvider');
  }
  return context;
};

export const AdaptiveLuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { luxSettings, setLuxSettings, isAmbientDimmed, setIsAmbientDimmed } = useNeuroPulseStore();
  const [showLuxPanel, setShowLuxPanel] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('filter-amber-590nm', 'filter-low-lux', 'filter-true-oled', 'high-contrast', 'large-typography');

    if (luxSettings.photophobiaFilter === 'DEEP_AMBER_590NM') {
      root.classList.add('filter-amber-590nm');
    } else if (luxSettings.photophobiaFilter === 'LOW_LUX_MONOCHROME') {
      root.classList.add('filter-low-lux');
    } else if (luxSettings.photophobiaFilter === 'TRUE_OLED_BLACK') {
      root.classList.add('filter-true-oled');
    }

    if (luxSettings.highContrastMode) {
      root.classList.add('high-contrast');
    }

    if (luxSettings.largeTypography) {
      root.classList.add('large-typography');
    }

    if (isAmbientDimmed) {
      body.classList.add('ambient-dimmed');
    } else {
      body.classList.remove('ambient-dimmed');
    }
  }, [luxSettings, isAmbientDimmed]);

  const toggleDimming = () => {
    setIsAmbientDimmed(!isAmbientDimmed);
  };

  return (
    <AdaptiveLuxContext.Provider
      value={{
        isDimmed: isAmbientDimmed,
        toggleDimming,
        filterMode: luxSettings.photophobiaFilter,
        setFilterMode: (mode) => setLuxSettings({ photophobiaFilter: mode }),
      }}
    >
      <div className="relative min-h-screen bg-[#090A0F] text-[#F4F4F5]">
        {/* Fullscreen Dimming Overlay */}
        {isAmbientDimmed && (
          <div
            onClick={() => setIsAmbientDimmed(false)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 cursor-pointer p-6 backdrop-blur-md transition-all"
            role="button"
            tabIndex={0}
            aria-label="Screen dimmed for photophobia protection. Tap anywhere to wake screen."
          >
            <div className="text-center space-y-4 max-w-md">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/30 animate-pulse text-amber-400">
                <Moon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-amber-300 tracking-wide">
                Ambient Photophobia Shield Active
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Display attenuated to 10% sub-50 lux to prevent ocular fatigue and cranial pressure flares. Voice biomarkers and audio pacing continue in the background.
              </p>
              <div className="pt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-950/40 text-xs text-amber-400 font-mono">
                  Tap or click anywhere to wake display
                </span>
              </div>
            </div>
          </div>
        )}

        {children}

        {/* Floating Quick Lux Control Button & Popup */}
        <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-3">
          {showLuxPanel && (
            <div className="w-80 rounded-3xl glass-panel-elevated p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Sun className="w-4 h-4" />
                  <span>Adaptive Photophobia Shield</span>
                </div>
                <button
                  onClick={() => setShowLuxPanel(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  aria-label="Close Lux Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Optical Filter Spectrum */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Optical Filter Spectrum</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setLuxSettings({ photophobiaFilter: 'DEEP_AMBER_590NM' })}
                    className={`px-2.5 py-2 text-xs rounded-xl border font-medium text-center transition-all ${
                      luxSettings.photophobiaFilter === 'DEEP_AMBER_590NM'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-white/5 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    590nm Amber
                  </button>
                  <button
                    onClick={() => setLuxSettings({ photophobiaFilter: 'LOW_LUX_MONOCHROME' })}
                    className={`px-2.5 py-2 text-xs rounded-xl border font-medium text-center transition-all ${
                      luxSettings.photophobiaFilter === 'LOW_LUX_MONOCHROME'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-white/5 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Low-Lux
                  </button>
                  <button
                    onClick={() => setLuxSettings({ photophobiaFilter: 'TRUE_OLED_BLACK' })}
                    className={`px-2.5 py-2 text-xs rounded-xl border font-medium text-center transition-all ${
                      luxSettings.photophobiaFilter === 'TRUE_OLED_BLACK'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-white/5 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    OLED Pure
                  </button>
                </div>
              </div>

              {/* Accessibility Toggles */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-zinc-300 flex items-center gap-2">
                    <Contrast className="w-3.5 h-3.5 text-amber-400" />
                    WCAG AAA High Contrast
                  </span>
                  <input
                    type="checkbox"
                    checked={luxSettings.highContrastMode}
                    onChange={(e) => setLuxSettings({ highContrastMode: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-zinc-300 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    Large Accessibility Text
                  </span>
                  <input
                    type="checkbox"
                    checked={luxSettings.largeTypography}
                    onChange={(e) => setLuxSettings({ largeTypography: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-zinc-300 flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    Auto-Dim Voice Sessions
                  </span>
                  <input
                    type="checkbox"
                    checked={luxSettings.autoDimmingEnabled}
                    onChange={(e) => setLuxSettings({ autoDimmingEnabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Instant 10% Dimmer Button */}
              <button
                onClick={() => setIsAmbientDimmed(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Moon className="w-4 h-4" />
                <span>Dim Screen Now (10% Sub-50 Lux)</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAmbientDimmed(true)}
              className="px-3.5 py-2.5 rounded-full glass-panel-elevated hover:bg-zinc-800 text-xs font-medium text-amber-400 flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Instant Screen Dimmer"
            >
              <Moon className="w-4 h-4" />
              <span>Dim 10%</span>
            </button>

            <button
              onClick={() => setShowLuxPanel(!showLuxPanel)}
              className="p-3 rounded-full glass-panel-elevated hover:bg-zinc-800 text-amber-400 border border-amber-500/40 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Open Lux Shield Settings"
              title="Photophobia Shield &amp; Lux Settings"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AdaptiveLuxContext.Provider>
  );
};
