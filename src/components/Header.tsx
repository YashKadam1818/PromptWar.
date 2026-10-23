'use client';

import React from 'react';
import { ShieldCheck, Cpu, MapPin, Sparkles } from 'lucide-react';

interface HeaderProps {
  isAgentRunning?: boolean;
  agentModel?: string;
}

export function Header({ isAgentRunning = false, agentModel = 'Gemini 3.8 Flash' }: HeaderProps) {
  return (
    <header className="border-b border-[#E8DFD8] bg-[#FAF7F2]/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C85A32] flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-0.5">
              <span className="font-editorial text-2xl font-bold tracking-tight">E</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F2421] tracking-tight">
                  EcoPulse <span className="text-[#C85A32]">AI</span>
                </h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase bg-[#E8DFD8] text-[#4A4E4D] px-2 py-0.5 rounded">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#595E5B] mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
                <span>Bounded Environmental Intelligence for <strong>Pune & Pimpri-Chinchwad</strong></span>
              </p>
            </div>
          </div>

          {/* System Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8DFD8] text-[#1F2421] shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isAgentRunning ? 'bg-[#C85A32] animate-ping' : 'bg-[#6B8E7B]'}`} aria-hidden="true" />
              <span className="font-medium text-[#595E5B]">Agent:</span>
              <span className="font-semibold">{isAgentRunning ? 'Analyzing...' : 'Ready'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF1ED] border border-[#8FA89B]/40 text-[#2D503C]">
              <Cpu className="w-3.5 h-3.5 text-[#6B8E7B]" aria-hidden="true" />
              <span>{agentModel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4EFEA] border border-[#E8DFD8] text-[#595E5B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
              <span>7-Stage Bounded Verifier</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
