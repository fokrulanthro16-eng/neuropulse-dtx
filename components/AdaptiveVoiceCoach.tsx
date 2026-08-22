'use client';

/**
 * NeuroPulse DTx - Adaptive Cadence Clinical Voice Coach UI
 * Speech synthesis pipeline adapting spoken speed (0.70x - 1.0x) and pitch
 * based on the patient's live cognitive pause ratio and fatigue score.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { AdaptiveVoiceCoachEngine } from '@/lib/adaptive-cadence';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Square,
  ShieldCheck,
  Zap,
  Gauge
} from 'lucide-react';

export const AdaptiveVoiceCoach: React.FC = () => {
  const { latestVocalMetrics } = useNeuroPulseStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const engineRef = useRef<AdaptiveVoiceCoachEngine | null>(null);

  useEffect(() => {
    engineRef.current = new AdaptiveVoiceCoachEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const fatigue = latestVocalMetrics?.cognitiveFatigueScore ?? 35;
  const pause = latestVocalMetrics?.speechPauseRatio ?? 0.22;

  const coachEngine = engineRef.current || new AdaptiveVoiceCoachEngine();
  const cadenceParams = coachEngine.calculateCadenceParams(fatigue, pause);

  const guidanceScripts = [
    {
      title: 'Sub-Threshold Cognitive Reassurance',
      text: 'Take a calm, slow breath. Your vocal cadence indicates healthy sub-threshold cognitive recovery. Rest your eyes for a moment.',
    },
    {
      title: 'Box-Breathing Audio Grounding',
      text: 'Let us begin four-second box breathing. Inhale gently for four, hold for four, exhale smoothly, and rest.',
    },
    {
      title: 'Photophobia Screen Rest Reminder',
      text: 'You have been viewing the screen for ten minutes. Let us darken the display and allow your ocular pathways to recover.',
    },
    {
      title: 'Return-to-Activity Encouragement',
      text: 'Your cognitive hesitation index is improving steadily. Continue adhering to your prescribed Buffalo exertion limits.',
    },
  ];

  const handleSpeak = (scriptText: string) => {
    if (!engineRef.current) return;
    setActiveMessage(scriptText);
    setIsSpeaking(true);
    engineRef.current.speak(scriptText, fatigue, pause, () => {
      setIsSpeaking(false);
      setActiveMessage(null);
    });
  };

  const handleStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsSpeaking(false);
    setActiveMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Adaptive Cadence Neurological Voice Coach</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Calibrated Spoken Clinical Coach
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Dynamically scales speech rate (0.72x to 0.95x) and vocal pitch to provide calm, screen-free reassurance without inducing cognitive sensory overload.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 text-right font-mono">
            <span className="text-[10px] uppercase text-zinc-400 block">Current Vocal Cadence</span>
            <span className="text-sm font-bold text-amber-400">{cadenceParams.description}</span>
          </div>
        </div>

        {/* Live Cadence Engine HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Speech Synthesis Tempo</span>
              <Gauge className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">{cadenceParams.rate}x</span>
              <span className="text-xs text-zinc-400 font-mono">Speed</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Calibrated to Fatigue ({fatigue}/100)
            </span>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Vocal Pitch Modulation</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-sky-400 tracking-tight">{cadenceParams.pitch}</span>
              <span className="text-xs text-zinc-400 font-mono">Pitch Scale</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Low-resonance soothing timbre
            </span>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white">Speech State</span>
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${isSpeaking ? 'text-amber-400' : 'text-zinc-400'}`}>
                {isSpeaking ? 'SPEAKING' : 'IDLE'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Web Speech API Synthesizer
            </span>
          </div>
        </div>

        {/* Spoken Guidance Scripts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Select Clinical Voice Guidance Routine</h3>
            {isSpeaking && (
              <button
                onClick={handleStop}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-900/60 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Speaking</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guidanceScripts.map((g, idx) => (
              <div
                key={idx}
                className="glass-card-interactive p-5 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{g.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-serif italic">
                    &quot;{g.text}&quot;
                  </p>
                </div>

                <button
                  onClick={() => handleSpeak(g.text)}
                  disabled={isSpeaking}
                  className="w-full py-2.5 rounded-xl bg-zinc-950/70 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/40 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen with Adaptive Cadence</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
