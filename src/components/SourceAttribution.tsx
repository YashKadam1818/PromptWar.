'use client';

import React from 'react';
import { ValidatedEnvironmentalData } from '@/types/environmental';
import { Database, ShieldAlert, ExternalLink, Globe } from 'lucide-react';

interface SourceAttributionProps {
  data: ValidatedEnvironmentalData;
}

export function SourceAttribution({ data }: SourceAttributionProps) {
  return (
    <footer aria-label="Environmental Data Provenance and Model Attribution" className="bg-white rounded-xl border border-[#E8DFD8] p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD8] pb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#C85A32]" aria-hidden="true" />
          <h3 className="font-editorial text-base font-bold text-[#1F2421]">
            Atmospheric Model Provenance &amp; Attribution
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#595E5B]">Classification:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD8] text-[#C85A32] font-semibold">
            {data.dataSource.classification}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Model and Provider */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#1F2421]">
            <Globe className="w-3.5 h-3.5 text-[#6B8E7B]" aria-hidden="true" />
            <span>Primary Atmospheric Ingestion Service:</span>
          </div>
          <p className="text-[#595E5B]">
            <strong>{data.dataSource.provider}</strong> — Integrating Copernicus Atmosphere Monitoring Service (CAMS) &amp; ECMWF atmospheric chemistry model ensembles.
          </p>
          <div className="font-mono text-[11px] text-[#595E5B] pt-1">
            Observation Point: {data.location.name} ({data.location.latitude.toFixed(4)}°N, {data.location.longitude.toFixed(4)}°E)
          </div>
        </div>

        {/* Forecast Disclaimer */}
        <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-lg border border-[#E8DFD8]">
          <div className="flex items-center gap-1.5 font-semibold text-[#C85A32]">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Scientific Modelling Classification Notice:</span>
          </div>
          <p className="text-[11px] text-[#595E5B] leading-relaxed">
            {data.dataSource.disclaimer}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DFD8] text-[11px] text-[#595E5B]">
        <span>Retrieved At: {new Date(data.retrievedAt).toLocaleString()}</span>
        <div className="flex items-center gap-3">
          <a
            href="https://open-meteo.com/en/docs/air-quality-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C85A32] inline-flex items-center gap-1 underline underline-offset-2"
          >
            <span>Open-Meteo Documentation</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <span>•</span>
          <a
            href="https://atmosphere.copernicus.eu/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C85A32] inline-flex items-center gap-1 underline underline-offset-2"
          >
            <span>Copernicus CAMS</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
