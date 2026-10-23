'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LocationCoordinates, ValidatedEnvironmentalData, AgentWorkflowState } from '@/types/environmental';
import { DEFAULT_LOCATION } from '@/lib/pune-regions';
import { Header } from '@/components/Header';
import { LocationSelector } from '@/components/LocationSelector';
import { CurrentIndicators } from '@/components/CurrentIndicators';
import { ForecastChart } from '@/components/ForecastChart';
import { AgentWorkspace } from '@/components/AgentWorkspace';
import { RecommendationsView } from '@/components/RecommendationsView';
import { SourceAttribution } from '@/components/SourceAttribution';
import { AlertCircle, RefreshCw, Loader2, Sparkles } from 'lucide-react';

export default function EcoPulseDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(DEFAULT_LOCATION);
  const [environmentalData, setEnvironmentalData] = useState<ValidatedEnvironmentalData | null>(null);
  const [workflowState, setWorkflowState] = useState<AgentWorkflowState | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch real atmospheric data
  const loadEnvironmentalData = useCallback(async (loc: LocationCoordinates) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch(`/api/air-quality?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}`);
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Failed with HTTP ${res.status}`);
      }
      const data: ValidatedEnvironmentalData = await res.json();
      setEnvironmentalData(data);
    } catch (err: unknown) {
      console.error('Failed to load air quality data:', err);
      setDataError(err instanceof Error ? err.message : 'Failed to query environmental API.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Run bounded AI Agent
  const runAgentAnalysis = useCallback(async (loc?: LocationCoordinates) => {
    const target = loc || selectedLocation;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: target }),
      });

      const state: AgentWorkflowState = await res.json();
      setWorkflowState(state);

      if (state.validatedData) {
        setEnvironmentalData(state.validatedData);
      }
    } catch (err: unknown) {
      console.error('Agent execution error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedLocation]);

  // Initial load
  useEffect(() => {
    loadEnvironmentalData(selectedLocation);
    runAgentAnalysis(selectedLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle location selection
  const handleSelectLocation = (loc: LocationCoordinates) => {
    setSelectedLocation(loc);
    loadEnvironmentalData(loc);
    runAgentAnalysis(loc);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2421] flex flex-col">
      {/* Editorial Header */}
      <Header 
        isAgentRunning={isAnalyzing} 
        agentModel={workflowState?.recommendations?.modelIdentifier || 'Gemini 3.8 Flash'} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Location Selector & Trigger */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onRunAnalysis={() => runAgentAnalysis()}
          isAnalyzing={isAnalyzing}
        />

        {/* Error Notification & Honest Retry */}
        {dataError && (
          <div 
            role="alert" 
            className="bg-[#FBE8E8] border border-[#D47979] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#8A1818]"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">Environmental Data Retrieval Failed</p>
                <p className="text-xs text-[#8A1818]/90 mt-0.5">{dataError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadEnvironmentalData(selectedLocation)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#D47979] text-[#8A1818] font-semibold hover:bg-[#FBE8E8] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Query</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoadingData && !environmentalData && (
          <div className="bg-white rounded-xl border border-[#E8DFD8] p-12 text-center shadow-2xs space-y-3">
            <Loader2 className="w-8 h-8 text-[#C85A32] animate-spin mx-auto" aria-hidden="true" />
            <h3 className="font-editorial text-lg font-bold text-[#1F2421]">
              Retrieving Real Atmospheric Data from Open-Meteo...
            </h3>
            <p className="text-xs text-[#595E5B] max-w-sm mx-auto">
              Connecting to Copernicus Atmosphere Monitoring Service (CAMS) ensemble for {selectedLocation.name}.
            </p>
          </div>
        )}

        {/* Main Environmental Content */}
        {environmentalData && (
          <>
            {/* Real Atmospheric Indicators & Hero Risk Dial */}
            <CurrentIndicators 
              data={environmentalData} 
              risk={workflowState?.riskAssessment} 
            />

            {/* Accessible Hourly Forecast Chart */}
            <ForecastChart data={environmentalData} />

            {/* Bounded AI Agent Workspace (7 Stages) */}
            <AgentWorkspace 
              workflowState={workflowState} 
              isExecuting={isAnalyzing} 
            />

            {/* Gemini Contextual Advisories & Action Directives */}
            {workflowState?.recommendations && (
              <RecommendationsView 
                recommendations={workflowState.recommendations}
                risk={workflowState.riskAssessment}
              />
            )}

            {/* Transparent Provenance & Scientific Disclaimer */}
            <SourceAttribution data={environmentalData} />
          </>
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-[#E8DFD8] bg-[#FAF7F2] py-6 text-center text-xs text-[#595E5B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 EcoPulse AI. Autonomous Environmental Intelligence for Urban Resilience.</p>
          <p className="font-mono text-[11px]">Built with Next.js App Router, Tailwind CSS, Google Gemini 3.8 Flash &amp; Open-Meteo APIs.</p>
        </div>
      </footer>
    </div>
  );
}
