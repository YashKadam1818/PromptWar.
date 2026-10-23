'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Loader2, Navigation } from 'lucide-react';
import { LocationCoordinates } from '@/types/environmental';
import { PUNE_METRO_PRESETS } from '@/lib/pune-regions';

interface LocationSelectorProps {
  selectedLocation: LocationCoordinates;
  onSelectLocation: (location: LocationCoordinates) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export function LocationSelector({
  selectedLocation,
  onSelectLocation,
  onRunAnalysis,
  isAnalyzing,
}: LocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationCoordinates[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: LocationCoordinates) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <section 
      aria-labelledby="location-selector-title"
      className="bg-white rounded-xl border border-[#E8DFD8] p-5 sm:p-6 shadow-2xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Search & Quick Presets */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="location-selector-title" className="font-editorial text-xl font-bold text-[#1F2421]">
              Target Observation Zone
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#595E5B] bg-[#F4EFEA] px-2.5 py-1 rounded-md">
              <Navigation className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
              <span>{selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E</span>
            </div>
          </div>

          {/* Search Input */}
          <div ref={wrapperRef} className="relative">
            <label htmlFor="location-search" className="sr-only">
              Search Pune or Pimpri-Chinchwad locality or neighborhood
            </label>
            <div className="relative">
              <Search 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595E5B]" 
                aria-hidden="true" 
              />
              <input
                id="location-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search neighborhood (e.g., Baner, Aundh, Nigdi, Hinjawadi)..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg text-[#1F2421] placeholder-[#595E5B] focus:bg-white focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-colors"
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C85A32] animate-spin" 
                  aria-hidden="true" 
                />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && searchResults.length > 0 && (
              <ul 
                role="listbox"
                className="absolute z-50 mt-1 w-full bg-white border border-[#E8DFD8] rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-[#F4EFEA]"
              >
                {searchResults.map((result, idx) => (
                  <li key={`${result.name}-${idx}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedLocation.name === result.name}
                      onClick={() => handleSelect(result)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FAF7F2] flex items-center justify-between text-[#1F2421] transition-colors"
                    >
                      <span className="font-medium">{result.name}</span>
                      <span className="text-xs text-[#595E5B]">
                        {result.admin1 || result.country}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Preset Chips */}
          <div>
            <span className="text-xs font-medium text-[#595E5B] uppercase tracking-wider block mb-2">
              Metro & Industrial Hubs:
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick Select Pune & PCMC Presets">
              {PUNE_METRO_PRESETS.map((preset) => {
                const isSelected = selectedLocation.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onSelectLocation(preset)}
                    aria-pressed={isSelected}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-[#C85A32] text-white border-[#C85A32] font-semibold shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#4A4E4D] border-[#E8DFD8] hover:border-[#C85A32]/60 hover:text-[#1F2421]'
                    }`}
                  >
                    {preset.name.split(',')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Analysis Trigger CTA */}
        <div className="lg:w-72 flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-[#E8DFD8] pt-4 lg:pt-0 lg:pl-6">
          <div className="text-left lg:text-right mb-3">
            <span className="text-xs font-semibold text-[#595E5B] uppercase tracking-wider block">
              Active Focus
            </span>
            <p className="font-editorial text-lg font-bold text-[#1F2421] line-clamp-1">
              {selectedLocation.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            aria-label="Run autonomous multi-step environmental intelligence agent"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-[#C85A32] text-white text-sm font-semibold hover:bg-[#B24E2A] active:bg-[#9B3D1B] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all focus:ring-2 focus:ring-[#C85A32] focus:ring-offset-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Running Agent...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F4EFEA]" aria-hidden="true" />
                <span>Run AI Analysis</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-[#595E5B] mt-2 block text-left lg:text-right">
            7-stage bounded execution with invariant verification
          </span>
        </div>
      </div>
    </section>
  );
}
