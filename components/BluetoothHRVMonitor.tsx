'use client';

/**
 * NeuroPulse DTx - Web Bluetooth Real-Time HRV & Autonomic Sentinel
 * Interfaces with Bluetooth GATT Heart Rate Service (0x180D) to compute
 * RMSSD / SDNN metrics and prevent sympathetic overload in concussion recovery.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { WebBluetoothHRVEngine } from '@/lib/web-bluetooth-hrv';
import { BluetoothHRVMetrics } from '@/types/clinical';
import {
  Heart,
  Bluetooth,
  Activity,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react';

export const BluetoothHRVMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<BluetoothHRVMetrics>({
    timestamp: new Date().toISOString(),
    isConnected: false,
    deviceName: 'BLE Heart Rate Sensor',
    currentBpm: 68,
    rrIntervalsMs: [860, 890, 875, 910, 865, 880, 895, 870],
    rmssdMs: 44,
    sdnnMs: 52,
    sympathovagalRatio: 1.18,
    autonomicStressIndex: 28,
    sympatheticSpikeDetected: false,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [sympatheticWarning, setSympatheticWarning] = useState<number | null>(null);
  const engineRef = useRef<WebBluetoothHRVEngine | null>(null);

  useEffect(() => {
    const engine = new WebBluetoothHRVEngine(
      (m) => setMetrics(m),
      (dropPercent) => {
        setSympatheticWarning(dropPercent);
        setTimeout(() => setSympatheticWarning(null), 6000);
      }
    );
    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.disconnect();
      }
    };
  }, []);

  const connectDevice = async () => {
    if (!engineRef.current) return;
    setIsConnecting(true);
    await engineRef.current.connect();
    setIsConnecting(false);
  };

  const disconnectDevice = () => {
    if (engineRef.current) {
      engineRef.current.disconnect();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Autonomic Nervous System Sentinel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Web Bluetooth HRV &amp; Vagal Tone
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Streams continuous RR-intervals from standard Bluetooth GATT Heart Rate straps (Polar, Garmin, Oura) to monitor RMSSD and halt tasks if sympathetic stress spikes.
            </p>
          </div>

          <button
            onClick={metrics.isConnected ? disconnectDevice : connectDevice}
            disabled={isConnecting}
            className={`px-5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              metrics.isConnected
                ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'border-white/10 bg-zinc-950/70 text-zinc-300 hover:text-white'
            }`}
          >
            <Bluetooth className="w-4 h-4 text-amber-400" />
            <span>
              {isConnecting
                ? 'Pairing BLE...'
                : metrics.isConnected
                ? `Connected (${metrics.deviceName})`
                : 'Connect BLE Heart Sensor'}
            </span>
          </button>
        </div>

        {/* Live HRV Telemetry Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* BPM Card */}
          <div className="glass-card-interactive p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="uppercase font-mono font-semibold">Live Heart Rate</span>
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-white tracking-tight">{metrics.currentBpm}</span>
              <span className="text-xs text-zinc-400 font-mono">BPM</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Resting Autonomic Rhythm
            </span>
          </div>

          {/* RMSSD Card */}
          <div className="glass-card-interactive p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="uppercase font-mono font-semibold">RMSSD (Vagal Tone)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-emerald-400 tracking-tight">{metrics.rmssdMs}</span>
              <span className="text-xs text-zinc-400 font-mono">ms</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Parasympathetic resilience
            </span>
          </div>

          {/* SDNN Card */}
          <div className="glass-card-interactive p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="uppercase font-mono font-semibold">SDNN (Global HRV)</span>
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-sky-400 tracking-tight">{metrics.sdnnMs}</span>
              <span className="text-xs text-zinc-400 font-mono">ms</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              Neuro-cardiac variability
            </span>
          </div>

          {/* Autonomic Stress Card */}
          <div className="glass-card-interactive p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="uppercase font-mono font-semibold">Autonomic Stress</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-amber-400 tracking-tight">
                {metrics.autonomicStressIndex}%
              </span>
              <span className="text-xs text-zinc-400 font-mono">Stress</span>
            </div>
            <span className="text-[11px] text-zinc-400 block font-mono">
              LF/HF Ratio: {metrics.sympathovagalRatio}
            </span>
          </div>
        </div>

        {/* Real-Time RR-Interval Tachogram SVG Plot */}
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">Live Beat-to-Beat RR-Interval Tachogram</h3>
              <p className="text-xs text-zinc-400">
                Continuous inter-beat millisecond intervals mapped in real time.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Latest RR: {metrics.rrIntervalsMs[metrics.rrIntervalsMs.length - 1] || 880} ms
            </span>
          </div>

          <div className="h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="700" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />

              {(() => {
                const arr = metrics.rrIntervalsMs.slice(-30);
                if (arr.length < 2) return null;
                const min = Math.min(...arr, 700);
                const max = Math.max(...arr, 1100);
                const points = arr.map((rr, idx) => {
                  const x = (idx / (arr.length - 1)) * 680 + 10;
                  const y = 140 - ((rr - min) / Math.max(1, max - min)) * 110;
                  return `${x},${y}`;
                });

                return (
                  <>
                    <path
                      d={`M ${points.join(' L ')}`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {arr.map((rr, idx) => {
                      const x = (idx / (arr.length - 1)) * 680 + 10;
                      const y = 140 - ((rr - min) / Math.max(1, max - min)) * 110;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="#10B981"
                          stroke="#090A0F"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Sympathetic Spike Alert Toast */}
        {sympatheticWarning && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <span className="font-bold block">Sympathetic Overload Detected ({sympatheticWarning}% RMSSD drop)</span>
              <span>Cognitive testing automatically paused. Rest eyes and perform 2 minutes of 6Hz Theta pacing.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
