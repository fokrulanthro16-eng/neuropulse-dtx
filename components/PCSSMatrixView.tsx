'use client';

/**
 * NeuroPulse DTx - Luxury SCAT6 / PCSS 22-Vector Standardized Clinical Matrix
 * Behance-inspired Health Matrix with domain filters and tactile 0-6 slider blocks.
 */

import React, { useState } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { PCSS_SYMPTOM_DEFINITIONS } from '@/lib/scat6-constants';
import { PCSSCluster, PCSSSymptomSeverity } from '@/types/clinical';
import {
  Activity,
  Flame,
  Brain,
  Heart,
  Moon,
  Save,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const PCSSMatrixView: React.FC = () => {
  const { assessments, addAssessment, profile } = useNeuroPulseStore();
  const latestAssessment = assessments[0];

  const [symptomScores, setSymptomScores] = useState<Record<string, PCSSSymptomSeverity>>(() => {
    const initial: Record<string, PCSSSymptomSeverity> = {};
    PCSS_SYMPTOM_DEFINITIONS.forEach((s) => {
      initial[s.id] = (latestAssessment?.symptoms?.[s.id] ?? 0) as PCSSSymptomSeverity;
    });
    return initial;
  });

  const [activeFilterCluster, setActiveFilterCluster] = useState<PCSSCluster | 'ALL'>('ALL');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (id: string, score: number) => {
    setSymptomScores((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(6, score)) as PCSSSymptomSeverity,
    }));
  };

  const calculateTotals = () => {
    let total = 0;
    let count = 0;
    Object.values(symptomScores).forEach((val) => {
      total += val;
      if (val > 0) count++;
    });
    return { total, count };
  };

  const { total, count } = calculateTotals();

  const handleSaveMatrix = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/clinical-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeText: `Manual 22-vector clinical matrix submitted with total PCSS score ${total}/132 across ${count} active vectors.`,
          manualSymptomRatings: symptomScores,
        }),
      });

      const data = await response.json();
      if (data.success && data.evaluation) {
        const daysPostInjury = Math.max(
          1,
          Math.floor((Date.now() - new Date(profile.injuryDate).getTime()) / (1000 * 60 * 60 * 24))
        );

        addAssessment({
          id: `asmt-${Date.now()}`,
          patientId: profile.id,
          timestamp: new Date().toISOString(),
          daysPostInjury,
          triage: data.evaluation,
          symptoms: symptomScores,
          vocalMetrics: {
            timestamp: new Date().toISOString(),
            durationMs: 0,
            speechPauseRatio: 0.22,
            speechHesitationIndex: 0.18,
            vocalTremorProxy: 0.015,
            volumeStabilityRms: 0.045,
            speakingRateProxy: 120,
            cognitiveFatigueScore: Math.round((total / 132) * 100),
          },
          cognitiveToleranceIndex: Math.max(10, 100 - total),
          pacingComplianceScore: 95,
          providerNotes: `Manual 22-vector SCAT6 matrix updated. Total PCSS Score: ${total}/132.`,
        });

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Save matrix error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSymptoms =
    activeFilterCluster === 'ALL'
      ? PCSS_SYMPTOM_DEFINITIONS
      : PCSS_SYMPTOM_DEFINITIONS.filter((s) => s.cluster === activeFilterCluster);

  const getClusterIcon = (cluster: PCSSCluster) => {
    switch (cluster) {
      case 'somatic':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'cognitive':
        return <Brain className="w-4 h-4 text-sky-400" />;
      case 'emotional':
        return <Heart className="w-4 h-4 text-purple-400" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getSeverityBadgeClass = (score: number) => {
    if (score === 0) return 'bg-zinc-900 text-zinc-400 border-white/5';
    if (score <= 2) return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30';
    if (score <= 4) return 'bg-amber-950/50 text-amber-300 border-amber-500/30';
    return 'bg-rose-950/50 text-rose-300 border-rose-500/40 font-bold';
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>Standardized PCSS Assessment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              22-Vector Symptom Rating Matrix
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Rate each symptom from 0 (None) to 6 (Severe). Multi-axial diagnostic scoring for traumatic brain injury.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-right">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Burden</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-amber-400">{total}</span>
                <span className="text-xs text-zinc-400 font-mono">/ 132</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-right">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Active Vectors</span>
              <span className="text-2xl font-bold font-mono text-white">{count} / 22</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Save Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" />
              Domain Filter:
            </span>
            {(['ALL', 'somatic', 'cognitive', 'emotional', 'sleep'] as const).map((cl) => (
              <button
                key={cl}
                onClick={() => setActiveFilterCluster(cl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  activeFilterCluster === cl
                    ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-sm'
                    : 'border-white/5 bg-zinc-950/50 text-zinc-400 hover:text-white'
                }`}
              >
                {cl === 'ALL' ? 'All 22 Vectors' : cl}
              </button>
            ))}
          </div>

          <button
            onClick={handleSaveMatrix}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Updated Matrix'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Matrix saved! Longitudinal recovery curve updated in clinical timeline.</span>
          </div>
        )}

        {/* 22 Symptom Vector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredSymptoms.map((sym) => {
            const score = symptomScores[sym.id] ?? 0;
            return (
              <div
                key={sym.id}
                className="glass-card-interactive p-5 rounded-2xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {getClusterIcon(sym.cluster)}
                      <h4 className="text-sm font-bold text-white">{sym.name}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{sym.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-mono border ${getSeverityBadgeClass(
                      score
                    )}`}
                  >
                    {score === 0 ? '0 - None' : `${score} - ${score <= 2 ? 'Mild' : score <= 4 ? 'Mod' : 'Severe'}`}
                  </span>
                </div>

                {/* 0-6 Slider Buttons */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleScoreChange(sym.id, level)}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        score === level
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                          : 'bg-zinc-950/60 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
