import React, { useState } from 'react';
import { Search, Sparkles, X, Filter, Tag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SemanticSearchBar() {
  const { searchQuery, setSearchQuery, searchChips, setSearchChips, setSelectedDocId, currentCase } = useApp();
  const [inputValue, setInputValue] = useState('');

  // Natural Language Semantic Parser
  const parseNaturalLanguage = (text) => {
    const chips = [];
    const lower = text.toLowerCase();

    // Check Document Type
    if (lower.includes('forensic') || lower.includes('ballistics') || lower.includes('lab')) {
      chips.push({ key: 'type', label: 'Type: Forensic Report', val: 'Forensic' });
    } else if (lower.includes('fir') || lower.includes('first information')) {
      chips.push({ key: 'type', label: 'Type: First Information Report', val: 'FIR' });
    } else if (lower.includes('charge sheet') || lower.includes('chargesheet')) {
      chips.push({ key: 'type', label: 'Type: Charge Sheet', val: 'Charge Sheet' });
    }

    // Check Police Station / Location
    if (lower.includes('whitefield')) {
      chips.push({ key: 'station', label: 'Station: Whitefield', val: 'Whitefield' });
    } else if (lower.includes('indira nagar')) {
      chips.push({ key: 'station', label: 'Station: Indira Nagar', val: 'Indira Nagar' });
    } else if (lower.includes('electronic city')) {
      chips.push({ key: 'station', label: 'Station: Electronic City', val: 'Electronic City' });
    }

    // Check Time Range
    if (lower.includes('last month') || lower.includes('30 days') || lower.includes('recent')) {
      chips.push({ key: 'date', label: 'Date: Last 30 Days', val: '30d' });
    } else if (lower.includes('yesterday') || lower.includes('24 hours')) {
      chips.push({ key: 'date', label: 'Date: Last 24 Hours', val: '24h' });
    }

    // Check Penal Sections
    if (lower.includes('302') || lower.includes('murder') || lower.includes('homicide')) {
      chips.push({ key: 'section', label: 'Sec. 302 IPC (Homicide)', val: '302' });
    } else if (lower.includes('420') || lower.includes('fraud') || lower.includes('cheating')) {
      chips.push({ key: 'section', label: 'Sec. 420 IPC (Fraud)', val: '420' });
    }

    return chips;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const detectedChips = parseNaturalLanguage(inputValue);
      if (detectedChips.length > 0) {
        setSearchChips(detectedChips);
      } else {
        setSearchChips([{ key: 'query', label: `Search: "${inputValue}"`, val: inputValue }]);
      }
      setSearchQuery(inputValue);
      setInputValue('');
    }
  };

  const removeChip = (indexToRemove) => {
    setSearchChips(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const applyPresetQuery = (queryText) => {
    setInputValue(queryText);
    const chips = parseNaturalLanguage(queryText);
    setSearchChips(chips);
    setSearchQuery(queryText);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Semantic Legal Query Engine</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            NLP
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Auto-parses natural language to structured legal filters
        </span>
      </div>

      {/* Main Search Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Try: 'forensic reports from Whitefield station' or 'homicide exhibits under sec 302'..."
          className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all font-sans"
        />
        <button
          onClick={() => {
            if (inputValue.trim()) {
              const detected = parseNaturalLanguage(inputValue);
              setSearchChips(detected.length > 0 ? detected : [{ key: 'query', label: inputValue, val: inputValue }]);
              setSearchQuery(inputValue);
              setInputValue('');
            }
          }}
          className="absolute right-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
        >
          Parse <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Filter Chips Bar */}
      {searchChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-500" /> Active Filters:
          </span>
          {searchChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-lg text-xs font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs animate-fade-in"
            >
              <Tag className="w-3 h-3 text-indigo-500" />
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(idx)}
                className="hover:text-rose-500 ml-0.5 rounded-full p-0.5 transition-colors"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => { setSearchChips([]); setSearchQuery(''); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Suggested Quick Natural Language Presets */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 overflow-x-auto pt-0.5">
        <span className="text-slate-400 dark:text-slate-500 shrink-0 font-medium">Suggestions:</span>
        <button
          onClick={() => applyPresetQuery("forensic reports from Whitefield station last month")}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
        >
          "forensic reports from Whitefield"
        </button>
        <button
          onClick={() => applyPresetQuery("homicide charge sheets under section 302")}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
        >
          "homicide under section 302"
        </button>
      </div>
    </div>
  );
}

