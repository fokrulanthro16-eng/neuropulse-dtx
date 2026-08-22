'use client';

/**
 * NeuroPulse DTx - Luxury BESS Postural Sway & Balance Engine
 * Standard Balance Error Scoring System (BESS) using 3-axis accelerometer
 * telemetry with glowing 3D tilt radar and stance stability metrics.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { BESSSensorEngine } from '@/lib/bess-sensor';
import { BESSStanceType, BESSMetrics } from '@/types/clinical';
import {
  Compass,
  Play,
  Square,
  Activity,
  CheckCircle2,
  Footprints,
  Timer,
  Sparkles
} from 'lucide-react';

export const BESSBalanceTracker: React.FC = () => {
  const [selectedStance, setSelectedStance] = useState<BESSStanceType>('DOUBLE_LEG_FIRM');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [liveTilt, setLiveTilt] = useState({ pitch: 0, roll: 0, total: 0 });
  const [liveErrors, setLiveErrors] = useState(0);
  const [completedMetrics, setCompletedMetrics] = useState<BESSMetrics | null>(null);

  const [stanceResults, setStanceResults] = useState<Record<string, BESSMetrics>>({});

  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BESSSensorEngine | null>(null);
  const swayHistoryRef = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const startTrial = async () => {
    setCompletedMetrics(null);
    swayHistoryRef.current = [];

    const engine = new BESSSensorEngine(
      (sample, secLeft) => {
        setLiveTilt({ pitch: sample.pitchDeg, roll: sample.rollDeg, total: sample.tiltAngleDeg });
        setSecondsRemaining(secLeft);
        if (sample.isErrorFrame) {
          setLiveErrors((prev) => prev + 1);
        }

        swayHistoryRef.current.push({ x: sample.accelX, y: sample.accelY });
        if (swayHistoryRef.current.length > 200) swayHistoryRef.current.shift();

        drawRadarCanvas(sample.pitchDeg, sample.rollDeg, sample.tiltAngleDeg);
      },
      (metrics) => {
        setIsRunning(false);
        setCompletedMetrics(metrics);
        setStanceResults((prev) => ({
          ...prev,
          [metrics.stanceType]: metrics,
        }));
      }
    );

    engineRef.current = engine;
    await engine.requestPermissions();
    setLiveErrors(0);
    setIsRunning(true);
    engine.startTrial(selectedStance);
  };

  const stopTrial = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsRunning(false);
  };

  const drawRadarCanvas = (pitch: number, roll: number, totalTilt: number) => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.min(w, h) * 0.42;

    ctx.fillStyle = '#08090D';
    ctx.fillRect(0, 0, w, h);

    const ring5 = (5 / 20) * maxRadius;
    const ring10 = (10 / 20) * maxRadius;
    const ring15 = (15 / 20) * maxRadius;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ring5, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, ring10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#F59E0B';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ring15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
    ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
    ctx.stroke();

    if (swayHistoryRef.current.length > 1) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      swayHistoryRef.current.forEach((pt, i) => {
        const px = centerX + (pt.x / 2.5) * maxRadius;
        const py = centerY + (pt.y / 2.5) * maxRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    const posX = centerX + (roll / 20) * maxRadius;
    const posY = centerY + (pitch / 20) * maxRadius;
    const isExceeding = totalTilt > 15.0;

    ctx.save();
    ctx.shadowColor = isExceeding ? '#F43F5E' : '#F59E0B';
    ctx.shadowBlur = 18;
    ctx.fillStyle = isExceeding ? '#F43F5E' : '#F59E0B';
    ctx.beginPath();
    ctx.arc(posX, posY, isExceeding ? 12 : 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(posX, posY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const stances: Array<{ id: BESSStanceType; name: string; surface: string; desc: string }> = [
    {
      id: 'DOUBLE_LEG_FIRM',
      name: 'Double Leg Stance',
      surface: 'Firm Surface',
      desc: 'Feet together, hands on iliac crests, eyes closed.',
    },
    {
      id: 'SINGLE_LEG_FIRM',
      name: 'Single Leg Stance',
      surface: 'Firm Surface',
      desc: 'Stand on non-dominant foot with dominant leg flexed ~30° at hip.',
    },
    {
      id: 'TANDEM_FIRM',
      name: 'Tandem Stance',
      surface: 'Firm Surface',
      desc: 'Heel-to-toe with non-dominant foot in the rear.',
    },
    {
      id: 'DOUBLE_LEG_FOAM',
      name: 'Double Leg Foam',
      surface: 'Foam Surface',
      desc: 'Medium-density foam pad testing vestibular integration.',
    },
    {
      id: 'SINGLE_LEG_FOAM',
      name: 'Single Leg Foam',
      surface: 'Foam Surface',
      desc: 'Single leg stance on foam pad.',
    },
    {
      id: 'TANDEM_FOAM',
      name: 'Tandem Foam',
      surface: 'Foam Surface',
      desc: 'Heel-to-toe stance on foam pad.',
    },
  ];

  const totalErrors = Object.values(stanceResults).reduce((sum, res) => sum + res.balanceErrorsCount, 0);

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>SCAT6 Balance Error Scoring System (BESS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Postural Sway &amp; Accelerometer Tracker
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Measures tri-axial accelerometer sway area ($mm^2/s$) and auto-scores balance errors exceeding the 15° stability threshold across standard 20s trials.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Protocol Errors</span>
            <span className="text-sm font-mono text-amber-400 font-bold">
              {totalErrors} / 60 ({Object.keys(stanceResults).length}/6 Stances)
            </span>
          </div>
        </div>

        {/* Stance Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stances.map((st) => {
            const isSelected = selectedStance === st.id;
            const completed = stanceResults[st.id];
            return (
              <button
                key={st.id}
                onClick={() => {
                  if (!isRunning) setSelectedStance(st.id);
                }}
                disabled={isRunning}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-amber-500/80 bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                    : 'border-white/5 bg-zinc-950/50 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-amber-400" />
                    <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {st.name}
                    </span>
                  </div>
                  {completed ? (
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {completed.balanceErrorsCount} errors
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono text-zinc-400">{st.surface}</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{st.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 3D Radar Stage & Bio-Telemetry HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Main 3D Radar Stage (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-zinc-950/90 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner">
              <canvas
                ref={radarCanvasRef}
                width={500}
                height={380}
                className="w-full h-full object-contain"
              />

              {!isRunning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Compass className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ready for {selectedStance.replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1">
                      Hold device flat against your chest or waist. Stand still with hands on hips and eyes closed.
                    </p>
                  </div>
                  <button
                    onClick={startTrial}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start 20s BESS Trial</span>
                  </button>
                </div>
              )}

              {/* 20s Countdown HUD */}
              {isRunning && (
                <div className="absolute top-4 right-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950/90 border border-white/10 font-mono text-sm text-amber-400 shadow-md">
                  <Timer className="w-4 h-4 animate-spin" />
                  <span>{secondsRemaining}s remaining</span>
                </div>
              )}
            </div>

            {isRunning && (
              <div className="flex justify-center">
                <button
                  onClick={stopTrial}
                  className="px-6 py-2.5 rounded-2xl bg-zinc-950 border border-rose-500/60 text-rose-400 font-semibold text-xs flex items-center gap-2 hover:bg-rose-950/40 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Halt Balance Trial</span>
                </button>
              </div>
            )}
          </div>

          {/* Telemetry Panel (1 Col) */}
          <div className="space-y-4">
            <div className="glass-card-interactive p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-white">Live Tri-Axial Telemetry</span>
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Total Tilt Angle</span>
                  <span className={`text-base font-bold ${liveTilt.total > 15 ? 'text-rose-400' : 'text-white'}`}>
                    {liveTilt.total.toFixed(1)}°
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Limit: 15°</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Trial Error Count</span>
                  <span className="text-base font-bold text-amber-400">
                    {completedMetrics ? completedMetrics.balanceErrorsCount : liveErrors}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Max: 10 / trial</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Pitch (Front/Back)</span>
                  <span className="text-white">{liveTilt.pitch.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Roll (Left/Right)</span>
                  <span className="text-white">{liveTilt.roll.toFixed(1)}°</span>
                </div>
              </div>
            </div>

            {/* Completed Trial Outcome Banner */}
            {completedMetrics && (
              <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-800/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Trial Complete: {completedMetrics.stanceType.replace(/_/g, ' ')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Sway Area</span>
                    <span className="text-sm font-bold text-white">{completedMetrics.posturalSwayAreaMm2} mm²/s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">RMS Accel</span>
                    <span className="text-sm font-bold text-amber-400">{completedMetrics.accelerationRms} m/s²</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
