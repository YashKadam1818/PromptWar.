'use client';

import React from 'react';
import { ValidatedEnvironmentalData, RiskAssessment, RiskLevel } from '@/types/environmental';
import { Wind, AlertTriangle, CheckCircle, Info, Clock, Layers } from 'lucide-react';

interface CurrentIndicatorsProps {
  data: ValidatedEnvironmentalData;
  risk?: RiskAssessment;
}

export function getRiskBadgeStyle(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  barColor: string;
} {
  switch (level) {
    case 'Good':
      return { bg: 'bg-[#EBF1ED]', text: 'text-[#2D503C]', border: 'border-[#8FA89B]', barColor: '#6B8E7B' };
    case 'Moderate':
      return { bg: 'bg-[#FFF8E7]', text: 'text-[#8A5A00]', border: 'border-[#E6C687]', barColor: '#D48B38' };
    case 'Unhealthy for Sensitive Groups':
      return { bg: 'bg-[#FFF0E6]', text: 'text-[#B84E1A]', border: 'border-[#E8A882]', barColor: '#E07A5F' };
    case 'Unhealthy':
      return { bg: 'bg-[#FBEBE8]', text: 'text-[#962A14]', border: 'border-[#D98270]', barColor: '#C85A32' };
    case 'Very Unhealthy':
      return { bg: 'bg-[#F3E8F5]', text: 'text-[#6B2175]', border: 'border-[#B887C2]', barColor: '#8E2A9B' };
    case 'Hazardous':
    default:
      return { bg: 'bg-[#FBE8E8]', text: 'text-[#8A1818]', border: 'border-[#D47979]', barColor: '#BC4749' };
  }
}

export function CurrentIndicators({ data, risk }: CurrentIndicatorsProps) {
  const current = data.current;
  const overallRisk = risk?.overallRiskLevel || (current.usAqi > 150 ? 'Unhealthy' : (current.usAqi > 100 ? 'Unhealthy for Sensitive Groups' : (current.usAqi > 50 ? 'Moderate' : 'Good')));
  const badgeStyle = getRiskBadgeStyle(overallRisk);

  return (
    <section aria-labelledby="indicators-title" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 id="indicators-title" className="font-editorial text-2xl font-bold text-[#1F2421]">
          Atmospheric Indicators
        </h2>
        <div className="flex items-center gap-2 text-xs text-[#595E5B]">
          <Clock className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
          <span>Model Ingested: {new Date(data.dataTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-xl border border-[#E8DFD8] p-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Main AQI dial */}
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#E8DFD8] pb-6 md:pb-0 md:pr-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#595E5B] block mb-1">
              US Air Quality Index
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-editorial text-5xl sm:text-6xl font-extrabold text-[#1F2421]">
                {Math.round(current.usAqi)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {overallRisk}
              </span>
            </div>

            {/* Scale meter indicator */}
            <div className="mt-4">
              <div className="h-2 w-full bg-[#E8DFD8] rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.min(100, (current.usAqi / 300) * 100)}%`, backgroundColor: badgeStyle.barColor }} className="h-full transition-all duration-500 rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-[#595E5B] mt-1 font-mono">
                <span>0 Good</span>
                <span>100 Mod</span>
                <span>200 Unhealthy</span>
                <span>300+ Haz</span>
              </div>
            </div>
          </div>

          {/* Primary pollutant & WHO exceedance */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#595E5B]">
                  Dominant Atmospheric Driver:
                </span>
                <span className="font-bold text-sm bg-[#FAF7F2] border border-[#E8DFD8] px-2.5 py-0.5 rounded text-[#C85A32]">
                  {risk?.dominantPollutant || 'PM2.5'} ({risk?.dominantPollutantValue ?? current.pm25} {risk?.dominantPollutantUnit ?? current.units.pm25})
                </span>
              </div>
              <span className="text-xs text-[#595E5B] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#6B8E7B]" aria-hidden="true" />
                <span>European AQI: <strong>{Math.round(current.europeanAqi)}</strong></span>
              </span>
            </div>

            {/* WHO Guideline Exceedance Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg p-3">
                <span className="text-[11px] font-medium text-[#595E5B] block">PM2.5 WHO Ratio</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#1F2421]">
                    {risk ? `${risk.whoExceedanceFactor.pm25}x` : `${(current.pm25 / 15).toFixed(1)}x`}
                  </span>
                  <span className="text-[10px] text-[#595E5B]">vs 15 µg/m³</span>
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg p-3">
                <span className="text-[11px] font-medium text-[#595E5B] block">PM10 WHO Ratio</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#1F2421]">
                    {risk ? `${risk.whoExceedanceFactor.pm10}x` : `${(current.pm10 / 45).toFixed(1)}x`}
                  </span>
                  <span className="text-[10px] text-[#595E5B]">vs 45 µg/m³</span>
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg p-3">
                <span className="text-[11px] font-medium text-[#595E5B] block">NO2 WHO Ratio</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-[#1F2421]">
                    {risk ? `${risk.whoExceedanceFactor.no2}x` : `${(current.no2 / 25).toFixed(1)}x`}
                  </span>
                  <span className="text-[10px] text-[#595E5B]">vs 25 µg/m³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Pollutant Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* PM2.5 */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            PM2.5 Fine
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.pm25.toFixed(1)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.pm25}</span>
        </div>

        {/* PM10 */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            PM10 Coarse
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.pm10.toFixed(1)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.pm10}</span>
        </div>

        {/* NO2 */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            Nitrogen Dioxide
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.no2.toFixed(1)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.no2}</span>
        </div>

        {/* Ozone */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            Ozone (O₃)
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.ozone.toFixed(1)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.ozone}</span>
        </div>

        {/* SO2 */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            Sulphur Dioxide
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.so2.toFixed(1)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.so2}</span>
        </div>

        {/* CO */}
        <div className="bg-white rounded-xl border border-[#E8DFD8] p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#595E5B] uppercase tracking-wider block">
            Carbon Monoxide
          </span>
          <p className="font-editorial text-2xl font-bold text-[#1F2421] mt-1">
            {current.co.toFixed(0)}
          </p>
          <span className="text-[11px] text-[#595E5B] font-mono">{current.units.co}</span>
        </div>
      </div>
    </section>
  );
}
