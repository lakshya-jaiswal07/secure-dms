import React, { useState } from 'react';
import { 
  Shield, Microscope, Scale, Activity, ChevronDown, ChevronUp,
  Sparkles, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RoleAdaptiveDashboards() {
  const { role, setActiveTab, setSelectedDocId, setIsCaptureModalOpen, t } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all overflow-hidden backdrop-blur-md">
      {/* Role Banner Strip */}
      <div className="flex flex-wrap items-center justify-between p-3.5 sm:px-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            {role === 'police' && <Shield className="w-4 h-4" />}
            {role === 'forensic' && <Microscope className="w-4 h-4" />}
            {role === 'legal' && <Scale className="w-4 h-4" />}
            {role === 'auditor' && <Activity className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                Tactical Desk: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{t.roles[role]}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Role-customized operational queue & statutory checkpoints
            </p>
          </div>
        </div>

        {/* Action button & Expand/Collapse Toggle */}
        <div className="flex items-center gap-2">
          {role === 'police' && (
            <button
              onClick={() => setIsCaptureModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              Field Evidence Capture
            </button>
          )}
          {role === 'forensic' && (
            <button
              onClick={() => { setActiveTab('viewer'); setSelectedDocId('DOC-SFSL-904'); }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              Analyze Ballistics Exhibit
            </button>
          )}
          {role === 'legal' && (
            <button
              onClick={() => { setActiveTab('viewer'); setSelectedDocId('DOC-CHG-104'); }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              Scrutinize Charge Sheet
            </button>
          )}
          {role === 'auditor' && (
            <button
              onClick={() => setActiveTab('ledger')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              Audit Blockchain Nodes
            </button>
          )}

          {/* Toggle Metrics Drawer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 text-xs transition-colors"
            title={isExpanded ? "Collapse Role Telemetry" : "Expand Role Telemetry"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Collapsible Role Metrics Cards */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
          <div className="mt-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
            {role === 'police' && (
              <>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Active Cases</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">3 Cases Assigned</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Statutory Window</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">48 Days to Bail</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Vault Exhibits</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">4 Evidence Seals</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Pending Ingest</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1 SFSL Ballistics</span>
                </div>
              </>
            )}

            {role === 'forensic' && (
              <>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Analysis Requests</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">2 Exhibits</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Ballistic Match</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">99.7% Certainty</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Hardware Extraction</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Coldcard 42.50 BTC</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Sec 65B Certificate</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Pending Signature</span>
                </div>
              </>
            )}

            {role === 'legal' && (
              <>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Scrutiny Queue</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">1 Charge Sheet</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Court Hall</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Hall 4 Sessions</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Sec 302 IPC Evidence</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Corroborated</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Redaction Safety</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Verified Baked</span>
                </div>
              </>
            )}

            {role === 'auditor' && (
              <>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Consortium Height</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">#1048 Blocks</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Merkle Score</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100.0% Pristine</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Security Flags</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">1 Tor Relay</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-sans font-semibold uppercase">Consensus Nodes</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3/3 Synced</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

