'use client';

import React, { useState } from 'react';
import { GeminiAdvisoryRecommendation, RiskAssessment } from '@/types/environmental';
import { 
  Sparkles, 
  GraduationCap, 
  HeartPulse, 
  HardHat, 
  Building2, 
  Quote, 
  CheckSquare, 
  Cpu, 
  ShieldAlert 
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: GeminiAdvisoryRecommendation;
  risk?: RiskAssessment;
}

export function RecommendationsView({ recommendations, risk }: RecommendationsViewProps) {
  const [activeTab, setActiveTab] = useState<'schools' | 'health' | 'workers' | 'civic'>('schools');

  const cohorts = recommendations.cohortActions;

  return (
    <section aria-labelledby="recommendations-title" className="bg-white rounded-xl border border-[#E8DFD8] p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header and Model Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="recommendations-title" className="font-editorial text-2xl font-bold text-[#1F2421]">
              Contextual Intelligence &amp; Advisories
            </h2>
          </div>
          <p className="text-xs text-[#595E5B] mt-1">
            Grounded atmospheric action directives tailored for Pune &amp; Pimpri-Chinchwad municipal geography.
          </p>
        </div>

        {/* AI Model Tag */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            recommendations.isAIGenerated 
              ? 'bg-[#EBF1ED] text-[#2D503C] border-[#8FA89B]' 
              : 'bg-[#FFF8E7] text-[#8A5A00] border-[#E6C687]'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
            <span>{recommendations.modelIdentifier}</span>
          </div>
        </div>
      </div>

      {/* Executive Synthesis */}
      <div className="bg-[#FAF7F2] border-l-4 border-[#C85A32] p-4 sm:p-5 rounded-r-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32] mb-1.5">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Executive Intelligence Synthesis</span>
        </div>
        <p className="text-sm text-[#1F2421] leading-relaxed">
          {recommendations.summary}
        </p>
        <span className="text-[11px] text-[#595E5B] mt-2 block italic">
          Attribution: {recommendations.sourceAttribution}
        </span>
      </div>

      {/* Vulnerable Demographic Cohort Directives (Tabs) */}
      <div>
        <h3 className="font-editorial text-lg font-bold text-[#1F2421] mb-3">
          Demographic &amp; Sectoral Action Directives
        </h3>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-[#E8DFD8] pb-2 mb-4" role="tablist" aria-label="Demographic Cohorts">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'schools'}
            aria-controls="tab-panel-schools"
            onClick={() => setActiveTab('schools')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'schools'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#595E5B] hover:text-[#1F2421]'
            }`}
          >
            <GraduationCap className="w-4 h-4" aria-hidden="true" />
            <span>Schools &amp; Children</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'health'}
            aria-controls="tab-panel-health"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'health'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#595E5B] hover:text-[#1F2421]'
            }`}
          >
            <HeartPulse className="w-4 h-4" aria-hidden="true" />
            <span>Asthmatics &amp; Elderly</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'workers'}
            aria-controls="tab-panel-workers"
            onClick={() => setActiveTab('workers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'workers'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#595E5B] hover:text-[#1F2421]'
            }`}
          >
            <HardHat className="w-4 h-4" aria-hidden="true" />
            <span>Outdoor &amp; Transit Workers</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'civic'}
            aria-controls="tab-panel-civic"
            onClick={() => setActiveTab('civic')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'civic'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#595E5B] hover:text-[#1F2421]'
            }`}
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>PMC / PCMC Civic Administration</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-xl p-4 sm:p-5">
          {activeTab === 'schools' && (
            <div id="tab-panel-schools" role="tabpanel" className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>Protocol for Educational Institutions &amp; Playgrounds:</span>
              </h4>
              <ul className="space-y-2">
                {cohorts.schoolsAndChildren.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1F2421]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'health' && (
            <div id="tab-panel-health" role="tabpanel" className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" aria-hidden="true" />
                <span>Clinical &amp; Preventative Protective Directives:</span>
              </h4>
              <ul className="space-y-2">
                {cohorts.respiratoryAndElderly.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1F2421]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'workers' && (
            <div id="tab-panel-workers" role="tabpanel" className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] flex items-center gap-1.5">
                <HardHat className="w-4 h-4" aria-hidden="true" />
                <span>Occupational Safety for Traffic Police &amp; Field Staff:</span>
              </h4>
              <ul className="space-y-2">
                {cohorts.outdoorWorkers.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1F2421]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'civic' && (
            <div id="tab-panel-civic" role="tabpanel" className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>Directives for Municipal Corporations (PMC / PCMC):</span>
              </h4>
              <ul className="space-y-2">
                {cohorts.civicAuthorities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1F2421]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Municipal Mitigations & Citations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Municipal Mitigations */}
        <div className="bg-white border border-[#E8DFD8] rounded-xl p-5">
          <h4 className="font-editorial text-base font-bold text-[#1F2421] mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#C85A32]" aria-hidden="true" />
            <span>Targeted Municipal Dust &amp; Emission Controls</span>
          </h4>
          <ul className="space-y-2">
            {recommendations.municipalMitigations.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#595E5B]">
                <span className="text-[#6B8E7B] font-bold">✓</span>
                <span className="text-[#1F2421]">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence Grounding Citations */}
        <div className="bg-white border border-[#E8DFD8] rounded-xl p-5">
          <h4 className="font-editorial text-base font-bold text-[#1F2421] mb-3 flex items-center gap-2">
            <Quote className="w-4 h-4 text-[#C85A32]" aria-hidden="true" />
            <span>Data Grounding Verification Citations</span>
          </h4>
          <ul className="space-y-1.5 font-mono text-[11px] text-[#595E5B]">
            {recommendations.evidenceGroundedCitations.map((citation, idx) => (
              <li key={idx} className="bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#E8DFD8] truncate" title={citation}>
                {citation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
