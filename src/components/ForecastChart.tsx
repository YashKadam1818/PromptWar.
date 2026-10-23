'use client';

import React, { useState } from 'react';
import { ValidatedEnvironmentalData } from '@/types/environmental';
import { TrendingUp, Table as TableIcon, Activity } from 'lucide-react';

interface ForecastChartProps {
  data: ValidatedEnvironmentalData;
}

export function ForecastChart({ data }: ForecastChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'pm25' | 'pm10' | 'usAqi'>('pm25');
  const [showTable, setShowTable] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const forecast = (data.hourlyForecast || []).slice(0, 36); // Next 36 hours
  if (forecast.length === 0) {
    return null;
  }

  // Values calculation
  const values = forecast.map((f) => f[selectedMetric]);
  const maxValue = Math.max(...values, selectedMetric === 'pm25' ? 30 : 60);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  // Chart dimensions
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Generate SVG path points
  const points = forecast.map((f, i) => {
    const x = paddingX + (i / (forecast.length - 1)) * innerWidth;
    const y = paddingY + innerHeight - ((f[selectedMetric] - minValue) / range) * innerHeight;
    return { x, y, val: f[selectedMetric], time: f.timestamp };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill gradient area
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + innerHeight} L ${points[0].x} ${paddingY + innerHeight} Z`;

  // Threshold line: WHO PM2.5 24h guideline is 15 µg/m³
  const whoThreshold = selectedMetric === 'pm25' ? 15 : (selectedMetric === 'pm10' ? 45 : 50);
  const whoThresholdY = paddingY + innerHeight - ((whoThreshold - minValue) / range) * innerHeight;

  const metricLabel = selectedMetric === 'pm25' 
    ? 'PM2.5 (µg/m³)' 
    : (selectedMetric === 'pm10' ? 'PM10 (µg/m³)' : 'US AQI');

  return (
    <section aria-labelledby="forecast-heading" className="bg-white rounded-xl border border-[#E8DFD8] p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="forecast-heading" className="font-editorial text-2xl font-bold text-[#1F2421]">
              Atmospheric Trajectory Forecast
            </h2>
            <span className="text-xs bg-[#FAF7F2] border border-[#E8DFD8] px-2 py-0.5 rounded text-[#595E5B]">
              Next 36 Hours
            </span>
          </div>
          <p className="text-xs text-[#595E5B] mt-1">
            Modelled dispersion and chemical composition forecast (CAMS / ECMWF Ensemble).
          </p>
        </div>

        {/* Controls: Metric switch + Accessible Table Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DFD8]" role="group" aria-label="Select Forecast Variable">
            <button
              type="button"
              onClick={() => setSelectedMetric('pm25')}
              aria-pressed={selectedMetric === 'pm25'}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'pm25'
                  ? 'bg-white text-[#C85A32] shadow-2xs'
                  : 'text-[#595E5B] hover:text-[#1F2421]'
              }`}
            >
              PM2.5
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('pm10')}
              aria-pressed={selectedMetric === 'pm10'}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'pm10'
                  ? 'bg-white text-[#C85A32] shadow-2xs'
                  : 'text-[#595E5B] hover:text-[#1F2421]'
              }`}
            >
              PM10
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('usAqi')}
              aria-pressed={selectedMetric === 'usAqi'}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'usAqi'
                  ? 'bg-white text-[#C85A32] shadow-2xs'
                  : 'text-[#595E5B] hover:text-[#1F2421]'
              }`}
            >
              US AQI
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            aria-expanded={showTable}
            aria-controls="forecast-accessible-table"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF7F2] border border-[#E8DFD8] text-[#1F2421] rounded-lg hover:bg-[#F4EFEA] transition-colors"
          >
            <TableIcon className="w-3.5 h-3.5 text-[#595E5B]" aria-hidden="true" />
            <span>{showTable ? 'Hide Data Table' : 'Accessible Table'}</span>
          </button>
        </div>
      </div>

      {/* Accessible visual representation disclaimer for screen-readers */}
      <div className="sr-only">
        Forecast trend chart for {metricLabel} over 36 hours. Maximum value is {Math.round(maxValue)}. 
        Use the data table toggle button to read hourly values row by row.
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[580px] overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C85A32" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C85A32" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#E8DFD8" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + innerHeight * 0.5} x2={chartWidth - paddingX} y2={paddingY + innerHeight * 0.5} stroke="#E8DFD8" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + innerHeight} x2={chartWidth - paddingX} y2={paddingY + innerHeight} stroke="#E8DFD8" />

          {/* WHO Guideline Threshold Line */}
          {whoThresholdY >= paddingY && whoThresholdY <= paddingY + innerHeight && (
            <g>
              <line
                x1={paddingX}
                y1={whoThresholdY}
                x2={chartWidth - paddingX}
                y2={whoThresholdY}
                stroke="#6B8E7B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - paddingX - 4}
                y={whoThresholdY - 6}
                textAnchor="end"
                className="text-[10px] font-mono fill-[#6B8E7B]"
              >
                WHO Guideline: {whoThreshold}
              </text>
            </g>
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Forecast trajectory line */}
          <path
            d={pathD}
            fill="none"
            stroke="#C85A32"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Hover targets */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isEvery4th = idx % 4 === 0;
            return (
              <g key={idx}>
                {/* Visual circle for checkpoints */}
                {(isEvery4th || isHovered) && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? '#C85A32' : '#FFFFFF'}
                    stroke="#C85A32"
                    strokeWidth="2"
                  />
                )}
                {/* Large transparent interactive hit target */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* X-axis time labels */}
          {points.map((p, idx) => {
            if (idx % 6 !== 0) return null;
            const date = new Date(p.time);
            const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            return (
              <text
                key={idx}
                x={p.x}
                y={chartHeight - 6}
                textAnchor="middle"
                className="text-[10px] font-mono fill-[#595E5B]"
              >
                {label}
              </text>
            );
          })}

          {/* Y-axis top value label */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="text-[10px] font-mono fill-[#595E5B]">
            {Math.round(maxValue)}
          </text>
          <text x={paddingX - 8} y={paddingY + innerHeight} textAnchor="end" className="text-[10px] font-mono fill-[#595E5B]">
            0
          </text>
        </svg>

        {/* Hover info pill */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-[#1F2421] text-white text-xs px-2.5 py-1.5 rounded shadow-md font-mono"
            style={{
              left: `${Math.min(80, Math.max(10, (points[hoveredIndex].x / chartWidth) * 100))}%`,
              top: '12px',
            }}
          >
            <div>Time: {new Date(points[hoveredIndex].time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div className="font-bold text-[#E07A5F]">{metricLabel}: {points[hoveredIndex].val.toFixed(1)}</div>
          </div>
        )}
      </div>

      {/* Accessible Data Table (Screen reader & alternative access) */}
      {showTable && (
        <div id="forecast-accessible-table" className="mt-6 border-t border-[#E8DFD8] pt-4">
          <h3 className="text-sm font-semibold text-[#1F2421] mb-2">
            Tabular Forecast Data ({metricLabel})
          </h3>
          <div className="max-h-60 overflow-y-auto border border-[#E8DFD8] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <caption className="sr-only">Hourly environmental forecast data</caption>
              <thead className="bg-[#FAF7F2] sticky top-0 border-b border-[#E8DFD8]">
                <tr>
                  <th scope="col" className="p-2.5 font-semibold text-[#1F2421]">Timestamp</th>
                  <th scope="col" className="p-2.5 font-semibold text-[#1F2421]">PM2.5 (µg/m³)</th>
                  <th scope="col" className="p-2.5 font-semibold text-[#1F2421]">PM10 (µg/m³)</th>
                  <th scope="col" className="p-2.5 font-semibold text-[#1F2421]">US AQI</th>
                  <th scope="col" className="p-2.5 font-semibold text-[#1F2421]">Ozone (µg/m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEA]">
                {forecast.map((f, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]">
                    <td className="p-2.5 font-mono text-[#595E5B]">{f.timestamp}</td>
                    <td className="p-2.5 font-medium">{f.pm25.toFixed(1)}</td>
                    <td className="p-2.5 font-medium">{f.pm10.toFixed(1)}</td>
                    <td className="p-2.5 font-medium">{Math.round(f.usAqi)}</td>
                    <td className="p-2.5 font-medium">{f.ozone.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
