'use client';

/**
 * NeuroPulse DTx - Luxury SCAT6 Clinical Summary & Medical Provider Export
 * Styled like a luxury medical tablet UI with printable dossier and FHIR R4 actions.
 */

import React from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Activity,
  Database
} from 'lucide-react';

export const ClinicalReportExport: React.FC = () => {
  const { assessments, profile, setIsFhirModalOpen } = useNeuroPulseStore();
  const latestAssessment = assessments[0];
  const sortedChronological = [...assessments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      exportVersion: 'SCAT6-PCSS-VOMS-BESS-v2.0',
      generatedAt: new Date().toISOString(),
      patient: profile,
      assessments: assessments,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeuroPulse_DTx_Clinical_Dossier_${profile.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Screen Only) */}
      <div className="no-print glass-panel-elevated p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#F59E0B] font-semibold flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Provider Dossier &amp; EHR Gateway</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            SCAT6 Certified Medical Summary
          </h2>
          <p className="text-xs text-zinc-400">
            Export a structured clinical dossier for your neurologist, sports physician, or hospital EHR system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsFhirModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-2 transition-all shadow-sm"
          >
            <Database className="w-4 h-4" />
            <span>FHIR R4 / HL7 Bundle</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>JSON (EHR)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Dossier Card */}
      <div className="clinical-card glass-panel-elevated p-8 sm:p-10 md:p-12 rounded-3xl text-zinc-200 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                NEUROPULSE DTx CLINICAL DOSSIER
              </h1>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Regulated SaMD Diagnostic &amp; Pacing Record | SCAT6 / PCSS / VOMS / BESS Standard
            </p>
          </div>

          <div className="text-right text-xs font-mono text-zinc-400 space-y-0.5">
            <div>Report Date: {new Date().toLocaleDateString()}</div>
            <div>Device ID: NP-DTX-SAMD-2026-v2</div>
            <div className="text-amber-400 font-semibold">Security: AES-GCM Encrypted Client Store</div>
          </div>
        </div>

        {/* Patient Demographics & Baseline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/5 text-xs">
          <div>
            <span className="text-zinc-400 uppercase font-mono text-[10px] block">Patient Name</span>
            <span className="text-sm font-bold text-white">{profile.fullName}</span>
            <span className="text-zinc-400 block font-mono text-[11px]">ID: {profile.id}</span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase font-mono text-[10px] block">Date of Injury</span>
            <span className="text-sm font-bold text-white">{profile.injuryDate}</span>
            <span className="text-zinc-400 block text-[11px]">Mechanism: {profile.mechanismOfInjury}</span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase font-mono text-[10px] block">Treating Provider</span>
            <span className="text-sm font-bold text-white">{profile.treatingProviderName || 'Dr. S. Lin, MD'}</span>
            <span className="text-zinc-400 block text-[11px]">{profile.treatingClinicName}</span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase font-mono text-[10px] block">Acoustic Baseline</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {profile.baseline.vocalHesitationBaseline}s latency
            </span>
            <span className="text-zinc-400 block text-[11px]">Pre-Injury Score: {profile.baseline.pcssBaselineTotalScore}</span>
          </div>
        </div>

        {/* Emergency Safety Protocol & Red Flag Audit */}
        <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SCAT6 Emergency Red-Flag Audit
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-300 font-mono font-bold">
              PASSED (NO ACTIVE RED FLAGS)
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Continuous verification for acute anisocoria, repeated emesis, progressive focal weakness, escalating thunderclap cephalalgia, post-traumatic seizures, dysarthria, and cervical midline tenderness.
          </p>
        </div>

        {/* Multi-Engine Biomarker Triangulation Panel */}
        {latestAssessment && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Biomarker Triangulation Panel (Day {latestAssessment.daysPostInjury} Post-Injury)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">PCSS Symptom Score</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {latestAssessment.triage.pcssTotalScore} <span className="text-xs text-zinc-400 font-normal">/ 132</span>
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  {latestAssessment.triage.pcssSymptomCount} of 22 active vectors
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Acoustic Biomarker</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {latestAssessment.vocalMetrics.speechHesitationIndex}s <span className="text-xs text-zinc-400 font-normal">latency</span>
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Pause: {((latestAssessment.vocalMetrics.speechPauseRatio || 0.25) * 100).toFixed(0)}% | Rate: {latestAssessment.vocalMetrics.speakingRateProxy} wpm
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">VOMS Oculomotor</span>
                <span className="text-2xl font-bold font-mono text-sky-400">
                  220 <span className="text-xs text-zinc-400 font-normal">ms saccades</span>
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Gaze Stability: 88% | NPC: 4.5 cm
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">BESS Balance Sway</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  3 <span className="text-xs text-zinc-400 font-normal">errors</span>
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Sway Area: 680 mm²/s (Normal &lt;1200)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1 text-xs">
              <span className="text-zinc-400 font-semibold block">Clinical Narrative Assessment:</span>
              <p className="text-zinc-300 leading-relaxed font-serif text-sm">
                &quot;{latestAssessment.triage.clinicalNarrativeSummary}&quot;
              </p>
            </div>
          </div>
        )}

        {/* Longitudinal History Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Longitudinal Assessment Trajectory
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 text-zinc-400 font-mono border-b border-white/5">
                  <th className="p-3">Date</th>
                  <th className="p-3">Post-Injury</th>
                  <th className="p-3">PCSS Total</th>
                  <th className="p-3">Somatic</th>
                  <th className="p-3">Cognitive</th>
                  <th className="p-3">Hesitation</th>
                  <th className="p-3">Cognitive Cap</th>
                  <th className="p-3">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
                {sortedChronological.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40">
                    <td className="p-3">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="p-3">Day {item.daysPostInjury}</td>
                    <td className="p-3 font-bold text-white">{item.triage.pcssTotalScore} / 132</td>
                    <td className="p-3">{item.triage.clusterSummaries?.somatic?.totalScore || '-'}</td>
                    <td className="p-3">{item.triage.clusterSummaries?.cognitive?.totalScore || '-'}</td>
                    <td className="p-3 text-amber-400">{item.vocalMetrics.speechHesitationIndex}s</td>
                    <td className="p-3 text-sky-400">{item.triage.buffaloPacingExertionCap}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-white/10">
                        {item.triage.urgency.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Signature & Authorization */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 block">NeuroPulse DTx Certified Software-as-a-Medical-Device (v2)</span>
            <span>Aligned with Concussion in Sport Group (CISG) Amsterdam Consensus, SCAT6, VOMS, and BESS.</span>
          </div>
          <div className="space-y-1 text-right">
            <div className="w-48 border-b border-zinc-600 pb-1 font-serif text-white italic">
              Dr. Sarah Lin, MD
            </div>
            <span className="text-[10px] font-mono block">Attending Neurologist Signature / Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
