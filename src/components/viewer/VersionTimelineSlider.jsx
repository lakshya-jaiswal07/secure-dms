import React from 'react';
import { GitCommit, History, Plus, Minus, FileText, ChevronRight } from 'lucide-react';

export default function VersionTimelineSlider({ 
  versions = [], 
  selectedVersion, 
  onSelectVersion 
}) {
  if (!versions || versions.length === 0) return null;

  const currentIdx = versions.findIndex(v => v.version === selectedVersion);
  const activeVer = versions[currentIdx] || versions[0];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Version Timeline Scrubber & Visual Diff
          </span>
        </div>
        <span className="text-xs font-mono bg-brand-500/10 text-brand-700 dark:text-cyan-300 border border-brand-500/20 px-2.5 py-0.5 rounded-full font-semibold">
          Active: {selectedVersion}
        </span>
      </div>

      {/* Horizontal Scrubber Track */}
      <div className="relative flex items-center justify-between px-4 py-3">
        {/* Connecting track line */}
        <div className="absolute left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div 
          className="absolute left-8 h-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${(currentIdx / (versions.length - 1 || 1)) * 100}%` }}
        ></div>

        {versions.map((ver, idx) => {
          const isSelected = ver.version === selectedVersion;
          const isPast = idx <= currentIdx;

          return (
            <button
              key={ver.version}
              onClick={() => onSelectVersion(ver.version)}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110 shadow-md'
                    : isPast
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {ver.version.replace('v', '')}
              </div>

              <div className="mt-2 text-center">
                <div className={`text-xs font-mono font-medium ${isSelected ? 'text-brand-600 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {ver.version}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {ver.author}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Diff Details Panel for Selected Version */}
      {activeVer.diff && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
            <span className="font-semibold text-slate-900 dark:text-slate-200">Revision Summary: {activeVer.note}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{activeVer.date}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {activeVer.diff.added?.length > 0 && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  <Plus className="w-3.5 h-3.5" /> Added Clauses / Markups:
                </div>
                {activeVer.diff.added.map((item, i) => (
                  <div key={i} className="pl-3 border-l-2 border-emerald-500 my-1 font-mono text-[10px]">
                    + {item}
                  </div>
                ))}
              </div>
            )}

            {activeVer.diff.removed?.length > 0 && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-800 dark:text-red-300">
                <div className="flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-400 mb-1">
                  <Minus className="w-3.5 h-3.5" /> Struck / Removed Text:
                </div>
                {activeVer.diff.removed.map((item, i) => (
                  <div key={i} className="pl-3 border-l-2 border-red-500 my-1 font-mono text-[10px] line-through">
                    - {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
