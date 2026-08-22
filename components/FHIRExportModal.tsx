'use client';

/**
 * NeuroPulse DTx - Luxury HL7 / FHIR R4 Interoperability Modal
 * Glassmorphic dark modal with tabbed JSON/HL7 viewports and one-click actions.
 */

import React, { useState } from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { FHIRR4Generator } from '@/lib/fhir-generator';
import {
  Download,
  Copy,
  Check,
  X,
  Database
} from 'lucide-react';

interface FHIRExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FHIRExportModal: React.FC<FHIRExportModalProps> = ({ isOpen, onClose }) => {
  const { assessments, profile } = useNeuroPulseStore();
  const latestAssessment = assessments[0];

  const [activeTab, setActiveTab] = useState<'fhir' | 'hl7v2'>('fhir');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !latestAssessment) return null;

  const fhirBundle = FHIRR4Generator.generateBundle(latestAssessment, profile);
  const fhirJsonString = JSON.stringify(fhirBundle, null, 2);
  const hl7v2String = FHIRR4Generator.generateHL7v2Message(latestAssessment, profile);

  const handleCopy = () => {
    const textToCopy = activeTab === 'fhir' ? fhirJsonString : hl7v2String;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const text = activeTab === 'fhir' ? fhirJsonString : hl7v2String;
    const extension = activeTab === 'fhir' ? 'json' : 'hl7';
    const mimeType = activeTab === 'fhir' ? 'application/json' : 'text/plain';

    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeuroPulse_DTx_${activeTab.toUpperCase()}_${profile.id}_${new Date().toISOString().split('T')[0]}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel-elevated p-6 sm:p-8 space-y-6 text-white max-h-[90vh] flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>HL7 / FHIR R4 Interoperability Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              EHR Clinical Data Export (Epic &amp; Cerner Ready)
            </h2>
            <p className="text-xs text-zinc-400">
              Validated FHIR R4 Document Bundle incorporating PCSS, Acoustic Voice Biomarkers, VOMS Oculomotor, and BESS Balance.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white"
            aria-label="Close Export Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-950/70 border border-white/5">
            <button
              onClick={() => setActiveTab('fhir')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeTab === 'fhir'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              FHIR R4 JSON Bundle
            </button>
            <button
              onClick={() => setActiveTab('hl7v2')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeTab === 'hl7v2'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              HL7 v2.5 (ORU^R01)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeTab.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="flex-1 overflow-auto rounded-2xl bg-zinc-950/90 border border-white/5 p-4 text-xs font-mono text-zinc-300 max-h-96 shadow-inner">
          <pre className="whitespace-pre">
            {activeTab === 'fhir' ? fhirJsonString : hl7v2String}
          </pre>
        </div>

        {/* Standardized LOINC Registry Mapping */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
          <div><strong className="text-white">LOINC 89243-0:</strong> PCSS 22-Vector Score</div>
          <div><strong className="text-amber-400">LOINC 8277-6:</strong> Vocal Latency</div>
          <div><strong className="text-sky-400">LOINC 72106-8:</strong> VOMS Oculomotor Panel</div>
          <div><strong className="text-emerald-400">LOINC 72107-6:</strong> BESS Balance Sway</div>
        </div>
      </div>
    </div>
  );
};
