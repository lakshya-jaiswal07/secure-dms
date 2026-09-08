import React, { useState } from 'react';
import { MapPin, Globe, ShieldAlert, Radio, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { mockGeoAccessPoints } from '../../data/mockData';

export default function GeoAccessMap() {
  const [selectedPin, setSelectedPin] = useState(mockGeoAccessPoints[4]); // default to the flagged one

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-xl text-brand-600 dark:text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Geo & Device Origin Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitors jurisdiction compliance and flags out-of-boundary access attempts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 4 Authorized Stations
          </span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> 1 Flagged External Relay
          </span>
        </div>
      </div>

      {/* Tactical Radar Grid / Map Area */}
      <div className="relative h-64 w-full bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-inner">
        
        {/* Radar concentric circles and grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-48 h-48 rounded-full border border-cyan-500"></div>
          <div className="w-80 h-80 rounded-full border border-cyan-500 absolute"></div>
          <div className="w-full h-px bg-cyan-500/50 absolute"></div>
          <div className="h-full w-px bg-cyan-500/50 absolute"></div>
        </div>

        {/* Rotating Radar Sweep Line */}
        <div className="absolute w-72 h-72 rounded-full pointer-events-none radar-sweep opacity-30 bg-gradient-to-tr from-cyan-500/30 to-transparent"></div>

        {/* Map Coordinates Points Overlay */}
        <div className="relative w-full h-full">
          
          {/* Station 1: Bengaluru Police HQ */}
          <div 
            onClick={() => setSelectedPin(mockGeoAccessPoints[0])}
            className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 ring-4 ring-emerald-500/30 group-hover:scale-125 transition-transform"></div>
            <span className="absolute left-5 top-0 text-[10px] font-mono text-slate-200 font-bold whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow-md">
              Police HQ (428 pings)
            </span>
          </div>

          {/* Station 2: SFSL Madiwala */}
          <div 
            onClick={() => setSelectedPin(mockGeoAccessPoints[1])}
            className="absolute top-2/3 left-2/5 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-950 ring-4 ring-cyan-500/30 group-hover:scale-125 transition-transform"></div>
            <span className="absolute left-5 top-0 text-[10px] font-mono text-slate-200 font-bold whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow-md">
              SFSL Madiwala (194 pings)
            </span>
          </div>

          {/* Station 3: Whitefield PS */}
          <div 
            onClick={() => setSelectedPin(mockGeoAccessPoints[2])}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-brand-500 border-2 border-slate-950 ring-4 ring-brand-500/30 group-hover:scale-125 transition-transform"></div>
            <span className="absolute left-5 top-0 text-[10px] font-mono text-slate-200 font-bold whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow-md">
              Whitefield Sub-Div (312 pings)
            </span>
          </div>

          {/* Station 4: High Court */}
          <div 
            onClick={() => setSelectedPin(mockGeoAccessPoints[3])}
            className="absolute top-2/5 left-1/4 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-violet-500 border-2 border-slate-950 ring-4 ring-violet-500/30 group-hover:scale-125 transition-transform"></div>
            <span className="absolute left-5 top-0 text-[10px] font-mono text-slate-200 font-bold whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow-md">
              High Court (88 pings)
            </span>
          </div>

          {/* Station 5: Frankfurt Anomaly (SUSPICIOUS OUT OF JURISDICTION) */}
          <div 
            onClick={() => setSelectedPin(mockGeoAccessPoints[4])}
            className="absolute top-1/4 right-1/6 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-6 h-6 rounded-full bg-red-500 animate-ping absolute opacity-75"></span>
              <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white ring-4 ring-red-500/40 group-hover:scale-125 transition-transform flex items-center justify-center text-white text-[9px] font-bold">
                !
              </div>
            </div>
            <span className="absolute right-7 top-0 text-[10px] font-mono text-red-300 font-bold whitespace-nowrap bg-red-950/90 px-2.5 py-0.5 rounded border border-red-700/80 shadow-lg animate-pulse">
              ⚠ FLAG: Frankfurt Relay (BLOCKED)
            </span>
          </div>

        </div>
      </div>

      {/* Selected Node Telemetry Detail Banner */}
      {selectedPin && (
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-all ${
          selectedPin.status === 'BLOCKED'
            ? 'bg-red-500/10 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-200'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            {selectedPin.status === 'BLOCKED' ? (
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <div>
              <span className="font-bold font-sans text-slate-900 dark:text-slate-100">{selectedPin.name}</span>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Location: {selectedPin.city} • Coords: {selectedPin.lat}°N, {selectedPin.lng}°E • Facility: {selectedPin.type}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              selectedPin.status === 'BLOCKED' 
                ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' 
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
            }`}>
              {selectedPin.status === 'BLOCKED' ? "ACCESS REJECTED" : "AUTHORIZED JURISDICTION"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
