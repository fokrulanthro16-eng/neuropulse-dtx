'use client';

/**
 * NeuroPulse DTx - Luxury Recovery Trajectory & Longitudinal Analytics
 * Behance Digital Health aesthetic with anti-glare gradient charts,
 * multi-axial domain progress bars, and Buffalo cognitive load index.
 */

import React, { useState } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import {
  TrendingDown,
  Activity,
  Brain,
  Moon,
  Heart,
  ShieldCheck,
  BarChart3,
  Flame,
  Sparkles
} from 'lucide-react';

export const RecoveryTrajectory: React.FC = () => {
  const { assessments, profile } = useNeuroPulseStore();
  const [selectedAsmtId, setSelectedAsmtId] = useState<string | null>(
    assessments.length > 0 ? assessments[0].id : null
  );

  const selectedAssessment =
    assessments.find((a) => a.id === selectedAsmtId) || (assessments.length > 0 ? assessments[0] : null);

  const sortedChronological = [...assessments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const latestScore = assessments.length > 0 ? assessments[0].triage.pcssTotalScore : 0;
  const initialScore = sortedChronological.length > 0 ? sortedChronological[0].triage.pcssTotalScore : 0;
  const scoreImprovementPercent =
    initialScore > 0 ? Math.round(((initialScore - latestScore) / initialScore) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Luxury Metric Snapshot Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: PCSS Total */}
        <div className="glass-card-interactive p-6 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-mono tracking-wider font-semibold">Latest PCSS Burden</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-white tracking-tight">{latestScore}</span>
            <span className="text-xs text-zinc-400 font-mono">/ 132 Max</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{scoreImprovementPercent}% reduction from Day 1</span>
          </div>
        </div>

        {/* Metric 2: Cognitive Tolerance */}
        <div className="glass-card-interactive p-6 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-mono tracking-wider font-semibold">Cognitive Tolerance</span>
            <Brain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-sky-400 tracking-tight">
              {selectedAssessment ? selectedAssessment.cognitiveToleranceIndex : 70}%
            </span>
            <span className="text-xs text-zinc-400 font-mono">Tolerance</span>
          </div>
          <div className="text-xs text-zinc-400">
            Sub-symptom cap: {selectedAssessment?.triage.buffaloPacingExertionCap || 70}%
          </div>
        </div>

        {/* Metric 3: Acoustic Cadence */}
        <div className="glass-card-interactive p-6 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-mono tracking-wider font-semibold">Acoustic Cadence</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-amber-400 tracking-tight">
              {selectedAssessment ? selectedAssessment.vocalMetrics.speechHesitationIndex : 0.24}s
            </span>
            <span className="text-xs text-zinc-400 font-mono">Hesitation</span>
          </div>
          <div className="text-xs text-zinc-400">
            Baseline: {profile.baseline.vocalHesitationBaseline}s ({((selectedAssessment?.vocalMetrics.speechPauseRatio || 0.2) * 100).toFixed(0)}% pause)
          </div>
        </div>

        {/* Metric 4: Pacing Adherence */}
        <div className="glass-card-interactive p-6 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-mono tracking-wider font-semibold">Pacing Adherence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-emerald-400 tracking-tight">
              {selectedAssessment ? selectedAssessment.pacingComplianceScore : 95}%
            </span>
            <span className="text-xs text-zinc-400 font-mono">Compliance</span>
          </div>
          <div className="text-xs text-zinc-400">
            {sortedChronological.length} logged clinical sessions
          </div>
        </div>
      </div>

      {/* Longitudinal Graph: Symptom Burden vs. Cognitive Tolerance */}
      <div className="glass-panel-elevated p-6 sm:p-8 md:p-10 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>SCAT6 Longitudinal Trajectory &amp; Load Curve</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-axial symptom burden mapped alongside Buffalo Protocol cognitive tolerance expansion over time.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-amber-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              PCSS Score (0-132)
            </span>
            <span className="flex items-center gap-2 text-sky-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
              Cognitive Tolerance (0-100%)
            </span>
          </div>
        </div>

        {/* SVG Longitudinal Trendline Chart */}
        <div className="h-64 w-full relative">
          {sortedChronological.length < 2 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400">
              Log at least 2 clinical check-ins to render longitudinal slope lines.
            </div>
          ) : (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="800" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />

              {/* Symptom Score Path (Amber Area + Stroke) */}
              {(() => {
                const points = sortedChronological.map((item, idx) => {
                  const x = (idx / (sortedChronological.length - 1)) * 760 + 20;
                  const y = 200 - (item.triage.pcssTotalScore / 132) * 180;
                  return { x, y, raw: item };
                });

                const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                const areaD = `M ${points[0].x},200 L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},200 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#amberGradient)" />
                    <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                    {points.map((pt) => (
                      <g
                        key={`sym-${pt.raw.id}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedAsmtId(pt.raw.id)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={pt.raw.id === selectedAssessment?.id ? 8 : 5}
                          fill="#F59E0B"
                          stroke="#090A0F"
                          strokeWidth="2.5"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          fill="#F59E0B"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pt.raw.triage.pcssTotalScore}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}

              {/* Cognitive Tolerance Path (Sky Blue Dash) */}
              {(() => {
                const points = sortedChronological.map((item, idx) => {
                  const x = (idx / (sortedChronological.length - 1)) * 760 + 20;
                  const y = 200 - (item.cognitiveToleranceIndex / 100) * 180;
                  return `${x},${y}`;
                });
                return (
                  <path
                    d={`M ${points.join(' L ')}`}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                );
              })()}
            </svg>
          )}
        </div>

        {/* Timeline Day Markers */}
        <div className="flex justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-white/5">
          {sortedChronological.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAsmtId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all ${
                item.id === selectedAssessment?.id
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Day {item.daysPostInjury} ({new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Assessment Multi-Axial Domain Breakdown */}
      {selectedAssessment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Multi-Axial PCSS Domain Breakdown (Day {selectedAssessment.daysPostInjury})
                </h3>
                <p className="text-xs text-zinc-400">
                  Standardized 4-cluster clinical distribution (Somatic, Cognitive, Emotional, Sleep).
                </p>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                Score: {selectedAssessment.triage.pcssTotalScore} / 132
              </span>
            </div>

            <div className="space-y-4">
              {/* Somatic */}
              <div className="glass-card-interactive p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-amber-400">
                    <Flame className="w-4 h-4" />
                    Somatic Domain (Headache, Dizziness, Photophobia)
                  </span>
                  <span className="font-mono text-white">
                    {selectedAssessment.triage.clusterSummaries?.somatic?.totalScore || 0} / 54
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{
                      width: `${((selectedAssessment.triage.clusterSummaries?.somatic?.totalScore || 0) / 54) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Cognitive */}
              <div className="glass-card-interactive p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-sky-400">
                    <Brain className="w-4 h-4" />
                    Cognitive Domain (Brain Fog, Concentration, Latency)
                  </span>
                  <span className="font-mono text-white">
                    {selectedAssessment.triage.clusterSummaries?.cognitive?.totalScore || 0} / 36
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                    style={{
                      width: `${((selectedAssessment.triage.clusterSummaries?.cognitive?.totalScore || 0) / 36) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Emotional */}
              <div className="glass-card-interactive p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-purple-400">
                    <Heart className="w-4 h-4" />
                    Emotional Domain (Irritability, Anxiety, Lability)
                  </span>
                  <span className="font-mono text-white">
                    {selectedAssessment.triage.clusterSummaries?.emotional?.totalScore || 0} / 24
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                    style={{
                      width: `${((selectedAssessment.triage.clusterSummaries?.emotional?.totalScore || 0) / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Sleep */}
              <div className="glass-card-interactive p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <Moon className="w-4 h-4" />
                    Sleep / Energy Domain (Drowsiness, Sleep Onset Latency)
                  </span>
                  <span className="font-mono text-white">
                    {selectedAssessment.triage.clusterSummaries?.sleep?.totalScore || 0} / 18
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    style={{
                      width: `${((selectedAssessment.triage.clusterSummaries?.sleep?.totalScore || 0) / 18) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buffalo Guidance Widget */}
          <div className="glass-panel-elevated p-6 rounded-3xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Buffalo Pacing Prescription</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2 text-xs">
                <span className="text-zinc-400 uppercase font-mono tracking-wider block">Cognitive Cap</span>
                <span className="text-3xl font-bold font-mono text-amber-400">
                  {selectedAssessment.triage.buffaloPacingExertionCap}% Load
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Recommended rest interval: {selectedAssessment.triage.recommendedRestMinutes} mins after each task block.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300">Prescribed Interventions:</span>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {selectedAssessment.triage.suggestedInterventions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 text-[11px] text-zinc-400 italic">
              Provider Note: &quot;{selectedAssessment.providerNotes || 'Sub-symptom recovery trajectory progressing consistently.'}&quot;
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
