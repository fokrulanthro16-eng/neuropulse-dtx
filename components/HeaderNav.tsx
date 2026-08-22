'use client';

/**
 * NeuroPulse DTx - Luxury HealthTech Floating Navigation Bar (v3 Enterprise Suite)
 * Multi-module floating glass navigation with clinical status pill and instant EHR action.
 */

import React from 'react';
import { useNeuroPulseStore, NavTabType } from '@/lib/store';
import {
  Mic,
  Headphones,
  Eye,
  Compass,
  Brain,
  Heart,
  Flame,
  Volume2,
  Award,
  TrendingUp,
  Activity,
  FileText,
  Moon,
  Database
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    profile,
    assessments,
    isAmbientDimmed,
    setIsAmbientDimmed,
    setIsFhirModalOpen
  } = useNeuroPulseStore();

  const latestAssessment = assessments[0];
  const daysPost = Math.max(1, Math.floor((Date.now() - new Date(profile.injuryDate).getTime()) / (1000 * 60 * 60 * 24)));
  const urgency = latestAssessment ? latestAssessment.triage.urgency : 'STABLE_RECOVERY';

  const navItems: Array<{ id: NavTabType; label: string; icon: React.FC<any> }> = [
    { id: 'logger', label: 'Voice Logger', icon: Mic },
    { id: 'pacing', label: 'Audio Pacing', icon: Headphones },
    { id: 'voms', label: 'VOMS Vision', icon: Eye },
    { id: 'bess', label: 'BESS Balance', icon: Compass },
    { id: 'nback', label: 'N-Back Dual-Task', icon: Brain },
    { id: 'hrv', label: 'Bluetooth HRV', icon: Heart },
    { id: 'kelvin', label: 'Kelvin Shield', icon: Flame },
    { id: 'coach', label: 'Voice Coach', icon: Volume2 },
    { id: 'passport', label: 'Clearance Passport', icon: Award },
    { id: 'trajectory', label: 'Trajectory', icon: TrendingUp },
    { id: 'matrix', label: '22-Vector Matrix', icon: Activity },
    { id: 'report', label: 'Clinical Dossier', icon: FileText },
  ];

  const getUrgencyBadge = () => {
    switch (urgency) {
      case 'EMERGENCY_RED_FLAG':
        return { text: 'Emergency Red Flag', dot: 'bg-rose-500 animate-ping', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300' };
      case 'HIGH_RISK':
        return { text: 'High Symptom Load', dot: 'bg-amber-400 animate-pulse', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300' };
      case 'SUB_SYMPTOM_ELEVATION':
        return { text: 'Sub-Symptom Active', dot: 'bg-sky-400 animate-pulse', bg: 'bg-sky-500/10 border-sky-500/30 text-sky-300' };
      default:
        return { text: 'Stable Recovery', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' };
    }
  };

  const badge = getUrgencyBadge();

  return (
    <header className="no-print sticky top-0 z-40 w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto glass-panel-elevated rounded-3xl p-2.5 sm:p-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Clinical ID */}
          <div className="flex items-center gap-3 pl-2">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.18)]">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-[0_0_12px_#F59E0B] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                  NeuroPulse
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-[#F59E0B] font-semibold tracking-wide">
                  v3 SaMD
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 block font-mono">
                {profile.fullName} • Day {daysPost}
              </span>
            </div>
          </div>

          {/* Center Navigation Pill Strip (Desktop Scrollable) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-zinc-950/60 border border-white/5 shadow-inner overflow-x-auto max-w-2xl no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3 pr-1">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${badge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              <span className="font-mono text-[11px]">{badge.text}</span>
            </div>

            <button
              onClick={() => setIsFhirModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-amber-400 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Open HL7 / FHIR R4 EHR Gateway"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-semibold">FHIR R4</span>
            </button>

            <button
              onClick={() => setIsAmbientDimmed(!isAmbientDimmed)}
              className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Toggle Sub-50 Lux Screen Dimmer (10% Brightness)"
              aria-label="Toggle Screen Dimmer"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center gap-1 pt-2.5 mt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
