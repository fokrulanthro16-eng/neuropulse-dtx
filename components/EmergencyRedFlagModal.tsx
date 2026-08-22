'use client';

/**
 * NeuroPulse DTx - Luxury SCAT6 Emergency Red-Flag Alert Modal
 * High-urgency accessible clinical dialog with instant emergency dispatch triggers.
 */

import React from 'react';
import { useNeuroPulseStore } from '@/lib/store';
import { AlertOctagon, PhoneCall, ShieldAlert, X } from 'lucide-react';

export const EmergencyRedFlagModal: React.FC = () => {
  const { activeRedFlagAlert, setActiveRedFlagAlert, profile } = useNeuroPulseStore();

  if (!activeRedFlagAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#140809] border-2 border-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.35)] p-6 md:p-8 space-y-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 animate-pulse text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-rose-400 font-bold">
                SCAT6 Acute Protocol Trigger
              </span>
              <h2 className="text-2xl font-bold text-rose-100">
                Neurological Red Flag Detected
              </h2>
            </div>
          </div>
          <button
            onClick={() => setActiveRedFlagAlert(null)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Dismiss Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Finding Box */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Finding: {activeRedFlagAlert.type.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {activeRedFlagAlert.clinicalDescription}
          </p>
          <p className="text-xs text-rose-300/90 font-mono pt-1">
            Standard Protocol: {activeRedFlagAlert.immediateAction}
          </p>
        </div>

        {/* High-Contrast Immediate Action Buttons */}
        <div className="space-y-3">
          <a
            href="tel:911"
            className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-rose-950 transition-all active:scale-95"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>Call 911 / Emergency Services Now</span>
          </a>

          {profile.emergencyContact && profile.emergencyContact.phone && (
            <a
              href={`tel:${profile.emergencyContact.phone}`}
              className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-sm flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Call Emergency Contact: {profile.emergencyContact.name}</span>
              </div>
              <span className="text-xs font-mono text-amber-400">{profile.emergencyContact.phone}</span>
            </a>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">While waiting for medical assistance:</span>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep the patient in a quiet, dark environment (sub-50 lux).</li>
            <li>Do not administer NSAIDs/Aspirin without physician consultation.</li>
            <li>Avoid sudden cervical or head movements.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
