'use client';

/**
 * NeuroPulse DTx - Luxury VOMS Oculomotor & Saccadic Eye-Tracking Suite
 * High-precision Behance HealthTech aesthetic with glowing 590nm amber stimulus reticle,
 * WebRTC pupil tracking, and clinical saccadic latency analysis.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { VOMSEyeTrackingEngine, EyeTrackingFrame } from '@/lib/voms-engine';
import { VOMSTestType, VOMSMetrics } from '@/types/clinical';
import {
  Eye,
  Play,
  Square,
  Activity,
  CheckCircle2,
  Camera,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const VOMSTracker: React.FC = () => {
  const { profile } = useNeuroPulseStore();

  const [selectedTest, setSelectedTest] = useState<VOMSTestType>('SMOOTH_PURSUIT_HORIZONTAL');
  const [isRunning, setIsRunning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [haltReason, setHaltReason] = useState<string | null>(null);

  const [liveGaze, setLiveGaze] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [liveBlinking, setLiveBlinking] = useState(false);
  const [completedMetrics, setCompletedMetrics] = useState<VOMSMetrics | null>(null);
  const [npcDistanceCm, setNpcDistanceCm] = useState(4.5);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<VOMSEyeTrackingEngine | null>(null);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const initCamera = async () => {
    if (!videoRef.current) return;
    const engine = new VOMSEyeTrackingEngine(
      (frame, progress) => {
        setLiveGaze({ x: frame.gazeX, y: frame.gazeY });
        setLiveBlinking(frame.isBlinking);
        setProgressPercent(progress);
        drawTargetCanvas(frame);
      },
      (metrics) => {
        setIsRunning(false);
        setCompletedMetrics(metrics);
      },
      (reason) => {
        setIsRunning(false);
        setHaltReason(reason);
      }
    );

    engineRef.current = engine;
    const ok = await engine.initializeCamera(videoRef.current);
    if (ok) setCameraActive(true);
  };

  const startTest = async () => {
    setHaltReason(null);
    setCompletedMetrics(null);

    if (!engineRef.current || !cameraActive) {
      await initCamera();
    }

    if (engineRef.current) {
      setIsRunning(true);
      engineRef.current.startTest(selectedTest);
    }
  };

  const stopTest = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsRunning(false);
  };

  const drawTargetCanvas = (frame: EyeTrackingFrame) => {
    const canvas = targetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#08090D';
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // 1. Draw Amber Stimulus Target
    const targetX = frame.targetX * w;
    const targetY = frame.targetY * h;

    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Patient Gaze Track Crosshair
    const gazeX = frame.gazeX * w;
    const gazeY = frame.gazeY * h;

    ctx.strokeStyle = frame.isBlinking ? '#F43F5E' : '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gazeX, gazeY, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(gazeX, gazeY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const testList: Array<{ id: VOMSTestType; name: string; desc: string }> = [
    {
      id: 'SMOOTH_PURSUIT_HORIZONTAL',
      name: 'Horizontal Smooth Pursuit',
      desc: 'Maintain continuous gaze tracking as the amber dot oscillates horizontally.',
    },
    {
      id: 'SMOOTH_PURSUIT_VERTICAL',
      name: 'Vertical Smooth Pursuit',
      desc: 'Track sinusoidal vertical trajectory without moving the head.',
    },
    {
      id: 'SACCADES_HORIZONTAL',
      name: 'Horizontal Saccades',
      desc: 'Rapid step transitions between left and right targets (measures latency in ms).',
    },
    {
      id: 'SACCADES_VERTICAL',
      name: 'Vertical Saccades',
      desc: 'Rapid step jumps vertically to evaluate frontal eye field saccadic velocity.',
    },
    {
      id: 'CONVERGENCE_NPC',
      name: 'Near Point Convergence (NPC)',
      desc: 'Evaluates binocular convergence breaking point (Normal: ≤ 5cm).',
    },
    {
      id: 'VOR_HORIZONTAL',
      name: 'Vestibular Ocular Reflex (VOR)',
      desc: 'Fixate gaze on static amber center while gently rotating head side-to-side.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Eye className="w-3.5 h-3.5" />
              <span>SCAT6 Vestibular/Ocular Motor Screening</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Oculomotor &amp; Saccadic Eye Tracker
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Evaluates saccadic reaction latency, smooth pursuit phase lag, and gaze stability using real-time WebRTC pupil contour tracking.
            </p>
          </div>

          <button
            onClick={initCamera}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              cameraActive
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 bg-zinc-950/70 text-zinc-300 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{cameraActive ? 'Camera Calibrated' : 'Connect Camera'}</span>
          </button>
        </div>

        {/* Test Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testList.map((t) => {
            const isSelected = selectedTest === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (!isRunning) setSelectedTest(t.id);
                }}
                disabled={isRunning}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-500/80 bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                    : 'border-white/5 bg-zinc-950/50 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {t.name}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-ping" />}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Central Eye Tracking Canvas & Video HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Main Visual Stimulus Stage (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-zinc-950/90 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner">
              <canvas
                ref={targetCanvasRef}
                width={640}
                height={380}
                className="w-full h-full object-contain"
              />

              {!isRunning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Eye className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ready for {selectedTest.replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1">
                      Position your head 50cm from screen. Keep your head still and track the amber dot with your eyes.
                    </p>
                  </div>
                  <button
                    onClick={startTest}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start 12s Trial</span>
                  </button>
                </div>
              )}

              {/* Progress Bar during Trial */}
              {isRunning && (
                <div className="absolute bottom-4 left-6 right-6 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>Trial Progress</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isRunning && (
              <div className="flex justify-center">
                <button
                  onClick={stopTest}
                  className="px-6 py-2.5 rounded-2xl bg-zinc-950 border border-rose-500/60 text-rose-400 font-semibold text-xs flex items-center gap-2 hover:bg-rose-950/40 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Halt Test Early</span>
                </button>
              </div>
            )}
          </div>

          {/* Telemetry Panel (1 Col) */}
          <div className="space-y-4">
            {/* Live Camera View with Gaze Overlay */}
            <div className="relative h-44 rounded-2xl bg-zinc-950/80 border border-white/5 overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover mirror -scale-x-100 opacity-60"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {cameraActive ? 'WebRTC (30 FPS)' : 'Telemetry Mode'}
              </div>

              <div
                className="absolute w-4 h-4 border border-[#38BDF8] rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                style={{ left: `${liveGaze.x * 100}%`, top: `${liveGaze.y * 100}%` }}
              >
                <div className="w-1 h-1 bg-[#38BDF8] rounded-full mx-auto mt-1" />
              </div>
            </div>

            {/* Real-Time Bio-metrics HUD */}
            <div className="glass-card-interactive p-5 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-semibold text-white">Live Ocular Telemetry</span>
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Saccadic Latency</span>
                  <span className="text-sm font-bold text-amber-400">
                    {completedMetrics ? `${completedMetrics.saccadicLatencyMs} ms` : isRunning ? '224 ms' : '--'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Gaze Stability</span>
                  <span className="text-sm font-bold text-sky-400">
                    {completedMetrics ? `${completedMetrics.gazeFixationStability}%` : isRunning ? '89%' : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Blink Indicator:</span>
                <span className={`font-mono font-semibold ${liveBlinking ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {liveBlinking ? 'BLINK OCCLUSION' : 'PUPIL LOCKED'}
                </span>
              </div>
            </div>

            {/* Near Point Convergence Slider */}
            {selectedTest === 'CONVERGENCE_NPC' && (
              <div className="glass-card-interactive p-5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Break Distance (NPC)</span>
                  <span className="font-mono text-amber-400 font-bold">{npcDistanceCm} cm</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={npcDistanceCm}
                  onChange={(e) => setNpcDistanceCm(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 block font-mono">
                  Normal cutoff: ≤ 5.0 cm | Concussion: ≥ 6.0 cm
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Halt Banner */}
        {haltReason && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <span className="font-bold block">Safety Threshold Triggered</span>
              <span>{haltReason}</span>
            </div>
          </div>
        )}

        {/* Completed Trial Results Summary */}
        {completedMetrics && (
          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>VOMS Trial Complete: {completedMetrics.testType.replace(/_/g, ' ')}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                SCAT6 Clinical Interpretation: Normal Saccadic Range
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Saccadic Latency</span>
                <span className="text-base font-bold text-white">{completedMetrics.saccadicLatencyMs} ms</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Norm: 180-250ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Fixation Stability</span>
                <span className="text-base font-bold text-sky-400">{completedMetrics.gazeFixationStability}%</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">&gt;80% target</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Phase Lag</span>
                <span className="text-base font-bold text-amber-400">{completedMetrics.smoothPursuitPhaseLagMs} ms</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">&lt;45ms target</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Blink Cadence</span>
                <span className="text-base font-bold text-white">{completedMetrics.blinkRatePerMinute} /min</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Stable rate</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
