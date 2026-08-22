'use client';

/**
 * NeuroPulse DTx - Auditory Dual-Task N-Back Cognitive Engine UI
 * Buffalo Concussion Protocol dual-task cognitive exertion test with
 * synthesized Web Audio tones (440Hz vs 880Hz) and reaction time benchmarking.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { AuditoryNBackEngine, AuditoryStimulusEvent } from '@/lib/auditory-dual-task';
import { NBackLevel, NBackTrialResult } from '@/types/clinical';
import {
  Brain,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  Timer,
  Zap,
  Sparkles,
  Keyboard,
  ShieldCheck
} from 'lucide-react';

export const AuditoryNBackTask: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<NBackLevel>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(16);
  const [lastToneEvent, setLastToneEvent] = useState<AuditoryStimulusEvent | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ isMatch: boolean; rt: number } | null>(null);
  const [completedResult, setCompletedResult] = useState<NBackTrialResult | null>(null);

  const engineRef = useRef<AuditoryNBackEngine | null>(null);

  useEffect(() => {
    // Listen for Spacebar trigger during trial
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRunning && engineRef.current) {
        e.preventDefault();
        triggerUserResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [isRunning]);

  const startTrial = async () => {
    setCompletedResult(null);
    setFeedbackToast(null);

    const engine = new AuditoryNBackEngine(
      (event, step, total) => {
        setLastToneEvent(event);
        setCurrentStep(step);
        setTotalSteps(total);
      },
      (result) => {
        setIsRunning(false);
        setCompletedResult(result);
      }
    );

    engineRef.current = engine;
    setIsRunning(true);
    await engine.startTrial(selectedLevel, 16);
  };

  const triggerUserResponse = () => {
    if (!engineRef.current || !isRunning) return;
    const res = engineRef.current.recordResponse();
    setFeedbackToast({ isMatch: res.isCorrect, rt: res.reactionTimeMs });
    setTimeout(() => setFeedbackToast(null), 800);
  };

  const stopTrial = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Brain className="w-3.5 h-3.5" />
              <span>Buffalo Cognitive Protocol • Stage 3 Dual-Task</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Auditory N-Back Cognitive Memory
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Listen to tone sequences with your eyes closed. Tap or press [Spacebar] whenever the current tone matches the tone played {selectedLevel} step{selectedLevel > 1 ? 's' : ''} prior.
            </p>
          </div>

          {/* Level Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950/70 border border-white/5">
            <button
              onClick={() => { if (!isRunning) setSelectedLevel(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedLevel === 1
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1-Back (Standard)
            </button>
            <button
              onClick={() => { if (!isRunning) setSelectedLevel(2); }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedLevel === 2
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              2-Back (Advanced)
            </button>
          </div>
        </div>

        {/* Central Audio Testing Arena */}
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-6">
          {/* Animated Audio Orb */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center border-4 border-white/5 bg-zinc-950/80 overflow-hidden shadow-2xl">
            {/* Tone Pulse Aura */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                lastToneEvent
                  ? lastToneEvent.tone === 'HIGH_880HZ'
                    ? 'bg-amber-500/25 scale-100'
                    : 'bg-sky-500/20 scale-95'
                  : 'bg-transparent scale-75'
              }`}
            />

            <div className="relative z-10 text-center space-y-2">
              <Volume2 className={`w-10 h-10 mx-auto transition-transform ${isRunning ? 'text-amber-400 scale-110' : 'text-zinc-500'}`} />
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 block font-semibold">
                {isRunning ? (lastToneEvent ? (lastToneEvent.tone === 'HIGH_880HZ' ? 'High Pitch (880Hz)' : 'Low Pitch (440Hz)') : 'Listening...') : 'Eyes-Closed Trial'}
              </span>
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white block">
                {isRunning ? `${currentStep} / ${totalSteps}` : `${selectedLevel}-Back`}
              </span>
            </div>
          </div>

          {/* Spacebar Tap Target Trigger */}
          {isRunning && (
            <div className="space-y-3 w-full max-w-sm text-center animate-in fade-in">
              <button
                onClick={triggerUserResponse}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <Keyboard className="w-5 h-5" />
                <span>MATCH TARGET (Spacebar / Tap)</span>
              </button>

              {feedbackToast && (
                <div
                  className={`p-2 rounded-xl text-xs font-mono font-bold animate-in fade-in ${
                    feedbackToast.isMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {feedbackToast.isMatch ? `✓ HIT! Reaction Time: ${feedbackToast.rt}ms` : '✗ False Alarm (Non-match)'}
                </div>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={startTrial}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start {selectedLevel}-Back Auditory Trial</span>
              </button>
            ) : (
              <button
                onClick={stopTrial}
                className="px-6 py-2.5 rounded-2xl bg-zinc-950 border border-rose-500/60 text-rose-400 font-semibold text-xs flex items-center gap-2 hover:bg-rose-950/40 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Halt Trial Early</span>
              </button>
            )}
          </div>
        </div>

        {/* Completed Trial Results Summary */}
        {completedResult && (
          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-800/50 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Auditory Dual-Task Complete ({completedResult.nBackLevel}-Back)</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Cognitive Index: {completedResult.executiveCognitiveIndex} / 100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Overall Accuracy</span>
                <span className="text-base font-bold text-emerald-400">{completedResult.accuracyPercentage}%</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Norm: ≥ 85%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Mean Reaction Time</span>
                <span className="text-base font-bold text-amber-400">{completedResult.averageReactionTimeMs} ms</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Norm: &lt; 550ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Correct Hits</span>
                <span className="text-base font-bold text-white">
                  {completedResult.correctHits} / {completedResult.targetCount}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Target Matches</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Omissions / Comm.</span>
                <span className="text-base font-bold text-rose-400">
                  {completedResult.omissionErrors} / {completedResult.commissionErrors}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Error tally</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
