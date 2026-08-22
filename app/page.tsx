'use client';

/**
 * NeuroPulse DTx - Main Application Dashboard View (v3 Enterprise SaMD Suite)
 * Integrates Voice Biomarker DSP, Buffalo Pacing, VOMS Oculomotor, BESS Balance,
 * Auditory N-Back Dual-Task, Bluetooth HRV, Adaptive Kelvin Filter, Voice Coach,
 * Return-to-Play ECDSA Passport, Longitudinal Trajectory, PCSS 22-Vector Matrix,
 * and HL7 / FHIR R4 Interoperability.
 */

import React from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { HeaderNav } from '@/components/HeaderNav';
import { VoiceClinicalLogger } from '@/components/VoiceClinicalLogger';
import { AudioPacingTherapy } from '@/components/AudioPacingTherapy';
import { VOMSTracker } from '@/components/VOMSTracker';
import { BESSBalanceTracker } from '@/components/BESSBalanceTracker';
import { AuditoryNBackTask } from '@/components/AuditoryNBackTask';
import { BluetoothHRVMonitor } from '@/components/BluetoothHRVMonitor';
import { AdaptiveKelvinFilter } from '@/components/AdaptiveKelvinFilter';
import { AdaptiveVoiceCoach } from '@/components/AdaptiveVoiceCoach';
import { ReturnToPlayPassport } from '@/components/ReturnToPlayPassport';
import { RecoveryTrajectory } from '@/components/RecoveryTrajectory';
import { PCSSMatrixView } from '@/components/PCSSMatrixView';
import { ClinicalReportExport } from '@/components/ClinicalReportExport';
import { FHIRExportModal } from '@/components/FHIRExportModal';
import {
  ShieldCheck,
  Brain,
  Eye,
  Compass,
  Heart,
  Flame,
  Award,
  Volume2
} from 'lucide-react';

export default function SaMDDashboardPage() {
  const { activeTab, assessments, isFhirModalOpen, setIsFhirModalOpen } = useNeuroPulseStore();
  const latestAssessment = assessments[0];
  const totalScore = latestAssessment ? latestAssessment.triage.pcssTotalScore : 0;
  const urgency = latestAssessment ? latestAssessment.triage.urgency : 'STABLE_RECOVERY';
  const pacingCap = latestAssessment ? latestAssessment.triage.buffaloPacingExertionCap : 70;

  return (
    <div className="min-h-screen bg-[#090A0F] bg-radial-mesh flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-300">
      <div>
        <HeaderNav />

        {/* SaMD Clinical Status Ribbon */}
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
          <div className="glass-panel rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-zinc-300 font-medium">
                Clinical Status: <strong className="text-white uppercase font-mono">{urgency.replace(/_/g, ' ')}</strong>
              </span>
              <span className="hidden md:inline text-zinc-600">|</span>
              <span className="hidden md:inline text-zinc-400">
                PCSS Burden: <strong className="text-amber-400 font-mono">{totalScore}/132</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Brain className="w-3.5 h-3.5" />
                Buffalo: {pacingCap}%
              </span>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Heart className="w-3.5 h-3.5" />
                HRV Sentinel
              </span>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <span className="flex items-center gap-1 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                SCAT6 / CISG v3
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Stage */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'logger' && <VoiceClinicalLogger />}
          {activeTab === 'pacing' && <AudioPacingTherapy />}
          {activeTab === 'voms' && <VOMSTracker />}
          {activeTab === 'bess' && <BESSBalanceTracker />}
          {activeTab === 'nback' && <AuditoryNBackTask />}
          {activeTab === 'hrv' && <BluetoothHRVMonitor />}
          {activeTab === 'kelvin' && <AdaptiveKelvinFilter />}
          {activeTab === 'coach' && <AdaptiveVoiceCoach />}
          {activeTab === 'passport' && <ReturnToPlayPassport />}
          {activeTab === 'trajectory' && <RecoveryTrajectory />}
          {activeTab === 'matrix' && <PCSSMatrixView />}
          {activeTab === 'report' && <ClinicalReportExport />}
        </main>
      </div>

      {/* Global HL7 / FHIR R4 Interoperability Modal */}
      <FHIRExportModal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
      />

      {/* Footer / Regulatory & Cryptographic Assurance */}
      <footer className="no-print max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 text-xs text-zinc-500">
        <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-semibold text-zinc-300 block">NeuroPulse DTx v3 — Enterprise Clinical SaMD Suite</span>
            <span>Aligned with SCAT6, CISG Amsterdam Consensus, VOMS, BESS, Web Bluetooth HRV, and WebCrypto ECDSA.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>ECDSA P-256</span>
            <span>•</span>
            <span>FHIR R4 / HL7</span>
            <span>•</span>
            <span>Web Bluetooth</span>
            <span>•</span>
            <span className="text-amber-400">590nm Dynamic Kelvin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
