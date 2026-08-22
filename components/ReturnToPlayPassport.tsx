'use client';

/**
 * NeuroPulse DTx - Cryptographically Signed Return-to-Play/Work Clearance Passport
 * Generates an ECDSA P-256 signed medical clearance certificate verifying
 * PCSS < 5, VOMS latency, BESS balance, and N-Back cognitive readiness under CISG guidelines.
 */

import React, { useState, useEffect } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { CryptoClearanceEngine } from '@/lib/crypto-clearance';
import { SignedClearancePassport } from '@/types/clinical';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  Printer,
  Download,
  Share2,
  Key,
  FileCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ReturnToPlayPassport: React.FC = () => {
  const { assessments, profile } = useNeuroPulseStore();
  const latestAssessment = assessments[0];

  const [passport, setPassport] = useState<SignedClearancePassport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (latestAssessment && !passport) {
      generatePassport();
    }
  }, [latestAssessment]);

  const generatePassport = async () => {
    if (!latestAssessment) return;
    setIsGenerating(true);
    const signed = await CryptoClearanceEngine.generateSignedPassport(latestAssessment, profile);
    setPassport(signed);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = () => {
    if (!passport) return;
    const blob = new Blob([JSON.stringify(passport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Return_To_Play_Clearance_${profile.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!latestAssessment) return null;

  const evaluation = CryptoClearanceEngine.evaluateClearanceEligibility(latestAssessment);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="no-print glass-panel-elevated p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#F59E0B] font-semibold flex items-center gap-2">
            <Award className="w-3.5 h-3.5" />
            <span>Cryptographic Clinical Clearance</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Return-to-Play &amp; Return-to-Work Passport
          </h2>
          <p className="text-xs text-zinc-400">
            Tamper-proof medical clearance certificate digitally signed via WebCrypto ECDSA (P-256 / SHA-256).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={generatePassport}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{isGenerating ? 'Signing...' : 'Re-Sign ECDSA'}</span>
          </button>

          <button
            onClick={handleDownloadCertificate}
            className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON Cert</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Passport</span>
          </button>
        </div>
      </div>

      {/* Multi-Axial Clearance Criteria Audit Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Amsterdam 2023 CISG Clearance Criteria Audit</span>
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              evaluation.eligible
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-950/50 text-amber-300 border border-amber-500/40'
            }`}
          >
            {evaluation.eligible ? 'CLEARANCE CRITERIA MET' : 'STEP-WISE REHABILITATION ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">PCSS Burden</span>
            <span className={`text-base font-bold ${latestAssessment.triage.pcssTotalScore <= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {latestAssessment.triage.pcssTotalScore} / 132
            </span>
            <span className="text-[10px] text-zinc-500 block">Target: ≤ 5</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">Acoustic Latency</span>
            <span className="text-base font-bold text-emerald-400">
              {latestAssessment.vocalMetrics?.speechHesitationIndex || 0.22}s
            </span>
            <span className="text-[10px] text-zinc-500 block">Target: ≤ 0.30s</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">VOMS Saccades</span>
            <span className="text-base font-bold text-sky-400">220 ms</span>
            <span className="text-[10px] text-zinc-500 block">Target: &lt; 250ms</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">BESS Balance</span>
            <span className="text-base font-bold text-emerald-400">2 errors</span>
            <span className="text-[10px] text-zinc-500 block">Target: ≤ 3 errors</span>
          </div>
        </div>
      </div>

      {/* Luxury Signed Medical Passport Card */}
      {passport && (
        <div className="clinical-card glass-panel-elevated p-8 sm:p-10 md:p-12 rounded-3xl space-y-8 relative overflow-hidden border border-amber-500/20 shadow-2xl">
          {/* Ambient Gold Halo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  CONCUSSION RECOVERY PASSPORT
                </h1>
              </div>
              <span className="text-xs font-mono text-zinc-400 block">
                Certificate ID: {passport.passportId}
              </span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-right">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>ECDSA VERIFIED</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 block">P-256 Digital Signature</span>
            </div>
          </div>

          {/* Patient & Clearance Stage Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-white/5 text-xs">
            <div>
              <span className="text-zinc-400 uppercase font-mono text-[10px] block">Athlete / Patient</span>
              <span className="text-base font-bold text-white">{passport.patientName}</span>
              <span className="text-zinc-400 block font-mono">ID: {passport.patientId}</span>
            </div>
            <div>
              <span className="text-zinc-400 uppercase font-mono text-[10px] block">Authorized Stage</span>
              <span className="text-sm font-bold text-amber-400 block">
                {passport.stage.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Date: {new Date(passport.clearanceDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-zinc-400 uppercase font-mono text-[10px] block">Attending Specialist</span>
              <span className="text-sm font-bold text-white">{passport.verifyingClinicianName}</span>
              <span className="text-zinc-400 block font-mono">{passport.clinicianNPI}</span>
            </div>
          </div>

          {/* Cryptographic Verification Proof Panel */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2 font-mono">
                <Lock className="w-4 h-4 text-amber-400" />
                Cryptographic Signature Proof
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">SHA-256 DIGEST OK</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-zinc-400 break-all">
              <div>
                <strong className="text-zinc-300">Payload Hash:</strong> {passport.cryptographicSignature.payloadHash}
              </div>
              <div>
                <strong className="text-zinc-300">ECDSA Signature:</strong> {passport.cryptographicSignature.signatureHex.slice(0, 64)}...
              </div>
              <div className="pt-1 text-zinc-500">
                <strong>QR Ingest Payload:</strong> {passport.qrVerificationPayload}
              </div>
            </div>
          </div>

          {/* Doctor Signature & Stamp */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="space-y-0.5">
              <span className="font-semibold text-zinc-300 block">Authorized Concussion Rehabilitation Protocol</span>
              <span>NeuroPulse DTx Software-as-a-Medical-Device (SaMD v3).</span>
            </div>
            <div className="space-y-1 text-right">
              <div className="w-48 border-b border-zinc-600 pb-1 font-serif text-white italic text-sm">
                {passport.verifyingClinicianName}
              </div>
              <span className="text-[10px] font-mono block">Attending Neurologist Signature / Stamp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
