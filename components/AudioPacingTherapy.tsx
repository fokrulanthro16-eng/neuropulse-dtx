'use client';

/**
 * NeuroPulse DTx - Luxury Audio Pacing & Cognitive Micro-Pacing Therapy
 * Behance-inspired mindfulness & neuromodulation aesthetic with synthesized
 * binaural beats, box breathing aura, and sub-threshold cognitive pacing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { BinauralAudioEngine, BINAURAL_PRESETS } from '@/lib/binaural-engine';
import { BinauralFrequencyBand } from '@/types/clinical';
import {
  Headphones,
  Play,
  Square,
  Volume2,
  VolumeX,
  Moon,
  Wind,
  Brain,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AudioPacingTherapy: React.FC = () => {
  const {
    activePacingSession,
    setActivePacingSession,
    updatePacingSession,
    setIsAmbientDimmed
  } = useNeuroPulseStore();

  const [selectedBand, setSelectedBand] = useState<BinauralFrequencyBand>('ALPHA_10HZ');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(5);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [volume, setVolume] = useState(0.35);
  const [dualTaskActive, setDualTaskActive] = useState(false);
  const [dualTaskPrompt, setDualTaskPrompt] = useState<string | null>(null);

  const engineRef = useRef<BinauralAudioEngine | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, []);

  const startPacingSession = async () => {
    if (!engineRef.current) {
      engineRef.current = new BinauralAudioEngine();
    }

    const success = await engineRef.current.start(selectedBand);
    if (success) {
      setIsPlaying(true);
      setSessionDurationSec(0);
      engineRef.current.setVolume(volume);

      setActivePacingSession({
        id: `pace-${Date.now()}`,
        startedAt: new Date().toISOString(),
        targetBand: selectedBand,
        carrierFrequencyHz: BINAURAL_PRESETS[selectedBand].carrierHz,
        targetBeatHz: BINAURAL_PRESETS[selectedBand].beatHz,
        durationMinutes: targetMinutes,
        completedMinutes: 0,
        boxBreathingCycleSeconds: 16,
        fatigueSurgeDetected: false,
        startingFatigueScore: 35,
        sessionState: 'running'
      });

      startBoxBreathingCycle();

      sessionTimerRef.current = setInterval(() => {
        setSessionDurationSec((prev) => {
          const next = prev + 1;
          if (next >= targetMinutes * 60) {
            stopPacingSession();
          }
          return next;
        });
      }, 1000);
    }
  };

  const startBoxBreathingCycle = () => {
    const phases: Array<'Inhale' | 'Hold' | 'Exhale' | 'Rest'> = ['Inhale', 'Hold', 'Exhale', 'Rest'];
    let phaseIndex = 0;
    let secondsInPhase = 4;

    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    if (engineRef.current) engineRef.current.playBreathingCue('inhale');

    breathingTimerRef.current = setInterval(() => {
      secondsInPhase--;
      if (secondsInPhase <= 0) {
        phaseIndex = (phaseIndex + 1) % 4;
        const currentP = phases[phaseIndex];
        setBreathingPhase(currentP);
        secondsInPhase = 4;

        if (engineRef.current) {
          if (currentP === 'Inhale') engineRef.current.playBreathingCue('inhale');
          else if (currentP === 'Hold') engineRef.current.playBreathingCue('hold');
          else if (currentP === 'Exhale') engineRef.current.playBreathingCue('exhale');
          else if (currentP === 'Rest') engineRef.current.playBreathingCue('rest');
        }
      }
      setBreathingCount(secondsInPhase);
    }, 1000);
  };

  const stopPacingSession = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (breathingTimerRef.current) {
      clearInterval(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsAmbientDimmed(false);

    if (activePacingSession) {
      updatePacingSession({
        sessionState: 'completed',
        completedMinutes: Number((sessionDurationSec / 60).toFixed(1)),
        endedAt: new Date().toISOString()
      });
    }
  };

  const handleBandChange = (band: BinauralFrequencyBand) => {
    setSelectedBand(band);
    if (engineRef.current && isPlaying) {
      engineRef.current.setFrequencyBand(band);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (engineRef.current) {
      engineRef.current.setVolume(newVol);
    }
  };

  const triggerDualTask = () => {
    const memoryPrompts = [
      'Auditory Recall Task: Memorize these 3 words: [RIVER, AMBER, COMPASS]. Recall them after the session.',
      'Reverse Digit Span: In your mind, reverse these 4 digits: [7 - 3 - 9 - 1].',
      'Phonemic Fluency: Mentally name 4 words starting with the letter "C" while keeping the 4-4 breathing rhythm.'
    ];
    const chosen = memoryPrompts[Math.floor(Math.random() * memoryPrompts.length)];
    setDualTaskPrompt(chosen);
    setDualTaskActive(true);
  };

  const currentPreset = BINAURAL_PRESETS[selectedBand];
  const progressPercent = Math.min(100, (sessionDurationSec / (targetMinutes * 60)) * 100);

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Headphones className="w-3.5 h-3.5" />
              <span>Buffalo Cognitive Pacing Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Binaural Neural Pacing &amp; Breathing
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              100% voice/audio-guided sub-threshold therapy. Synchronize parasympathetic respiration with synthesized dual-channel binaural frequencies.
            </p>
          </div>

          <button
            onClick={() => setIsAmbientDimmed(true)}
            className="px-4 py-2.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-amber-500/30 text-xs font-semibold text-amber-400 flex items-center gap-2 transition-all self-start sm:self-auto hover:scale-105 active:scale-95 shadow-sm"
          >
            <Moon className="w-4 h-4" />
            <span>Blackout Screen (Rest Eyes)</span>
          </button>
        </div>

        {/* Frequency Preset Selection Cards */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-400">Target Neural Frequency Band</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(BINAURAL_PRESETS) as BinauralFrequencyBand[]).filter(b => b !== 'BETA_15HZ').map((bandKey) => {
              const p = BINAURAL_PRESETS[bandKey];
              const isSelected = selectedBand === bandKey;
              return (
                <button
                  key={bandKey}
                  onClick={() => handleBandChange(bandKey)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500/80 bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                      : 'border-white/5 bg-zinc-950/50 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {p.name}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 font-bold">{p.beatHz} Hz</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Box Breathing & Controller Stage */}
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Animated 16s Box Breathing Circle */}
          <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center border-4 border-white/5 bg-zinc-950/80 overflow-hidden shadow-2xl">
            {/* Glowing Breathing Aura */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 transition-all duration-1000 ${
                isPlaying
                  ? breathingPhase === 'Inhale'
                    ? 'scale-100 opacity-90'
                    : breathingPhase === 'Hold'
                    ? 'scale-100 opacity-80'
                    : breathingPhase === 'Exhale'
                    ? 'scale-75 opacity-30'
                    : 'scale-75 opacity-20'
                  : 'scale-75 opacity-10'
              }`}
            />

            <div className="relative z-10 text-center space-y-1.5">
              <Wind className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 block font-semibold">
                {isPlaying ? breathingPhase : 'Box Breathing'}
              </span>
              <span className="text-4xl sm:text-5xl font-bold font-mono text-white block tracking-tight">
                {isPlaying ? `${breathingCount}s` : `${targetMinutes}m`}
              </span>
              <span className="text-[11px] text-zinc-400 block font-mono">
                {isPlaying ? '4s-4s-4s-4s Cadence' : 'Stereo Audio Pacing'}
              </span>
            </div>
          </div>

          {/* Session Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Elapsed: {Math.floor(sessionDurationSec / 60)}:{(sessionDurationSec % 60).toString().padStart(2, '0')}</span>
              <span>Target: {targetMinutes}:00</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Action Trigger & Duration Selector */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={isPlaying ? stopPacingSession : startPacingSession}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl transition-all active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-zinc-950 border-2 border-rose-500 text-rose-400 hover:bg-rose-950/40'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>End Pacing Session</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start {currentPreset.name}</span>
                </>
              )}
            </button>

            {!isPlaying && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-950/70 border border-white/5">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTargetMinutes(mins)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                      targetMinutes === mins
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Volume & Pink Noise Master Slider */}
        <div className="glass-card-interactive p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            {volume > 0 ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            <span className="font-medium">Therapeutic Binaural Level &amp; Pink Noise Soothing</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-zinc-400 w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Dual-Task Working Memory Card */}
        <div className="p-5 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
              <Brain className="w-4 h-4" />
              <span>Dual-Task Cognitive Memory Pacing (Stage 3 Buffalo Protocol)</span>
            </div>
            <button
              onClick={triggerDualTask}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/40 transition-all shadow-sm"
            >
              Generate Auditory Task
            </button>
          </div>

          {dualTaskActive && dualTaskPrompt ? (
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-sky-500/30 space-y-2">
              <p className="text-xs text-sky-200 leading-relaxed font-mono">
                {dualTaskPrompt}
              </p>
              <span className="text-[11px] text-sky-400/80 block">
                Do not write this down. Hold in working memory while listening to the binaural rhythm.
              </span>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              Test working memory capacity under acoustic grounding without inducing symptom flares.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
