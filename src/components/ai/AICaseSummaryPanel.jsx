import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, BrainCircuit } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AICaseSummaryPanel() {
  const { currentCase, logAudit } = useApp();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [briefText, setBriefText] = useState(currentCase?.summary || "");

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setBriefText("");
    
    const fullText = `PROACTIVE CASE BRIEF [Auto-Synthesized from 3 Exhibits]: Investigation under Crime No. 842/2026 (Whitefield Sub-Division) charges suspect Vikram Malhotra with offenses under Sec. 302, 420 IPC and Sec. 66C IT Act. Recovered 9mm cartridge casing matched suspect's registered Glock 19 with 99.7% ballistic certainty in SFSL micro-spectroscopy. Seized Coldcard hardware wallet evidenced an unconfirmed 42.50 BTC outbound transfer to Seychelles escrow 27 minutes prior to homicide. Charge sheet drafted; final forensic ballistic certificate countersignature pending legal endorsement. Statutory custody window safe at 48 days remaining.`;

    let i = 0;
    const interval = setInterval(() => {
      setBriefText(fullText.slice(0, i));
      i += 8;
      if (i > fullText.length) {
        clearInterval(interval);
        setBriefText(fullText);
        setIsRegenerating(false);
        logAudit("AI_BRIEF_REGENERATED", `Executive AI brief re-synthesized for ${currentCase.id}`, "INFO");
      }
    }, 25);
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
              Autonomous AI Case Synthesis
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                3 Exhibits
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cross-referenced from FIR, SFSL Ballistics & On-chain Seizure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyBrief}
            className="p-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition-colors border border-slate-200 dark:border-slate-700"
            title="Copy Brief"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRegenerating ? "Synthesizing..." : "Regenerate"}</span>
          </button>
        </div>
      </div>

      {/* Brief Content Box */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed min-h-[90px] select-text">
        {briefText}
        {isRegenerating && <span className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-1 animate-pulse"></span>}
      </div>

      {/* Extracted Key Legal Facts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-mono">
        <span className="text-slate-400 dark:text-slate-500 font-sans font-semibold uppercase text-[9px]">Anchors:</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          9mm Glock 19 (99.7% Casing Match)
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          42.50 BTC Escrow (27m Pre-Crime)
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Suspect in Custody
        </span>
      </div>
    </div>
  );
}

