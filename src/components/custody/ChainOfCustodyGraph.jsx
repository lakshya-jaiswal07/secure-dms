import React, { useState } from 'react';
import { 
  GitFork, ShieldCheck, UserCheck, Clock, MapPin, FileText, 
  ChevronRight, ArrowRight, Shield, Award, CheckCircle2, QrCode, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ChainOfCustodyGraph() {
  const { chainOfCustody, currentDoc } = useApp();
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cryptographic Chain of Custody
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                SEC-65B BNSS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unbroken digital ledger tracing physical evidence and digital forensics from crime scene to judicial deposit.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 shadow-xs">
          Target Evidence: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentDoc?.name || "FIR & Ballistics Exhibit Ex-A1"}</span>
        </div>
      </div>

      {/* Interactive Directed Node-and-Edge Graph */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm overflow-x-auto backdrop-blur-md transition-colors">
        <div className="min-w-[850px] relative py-8 px-4">
          
          {/* Directed Conduit Line */}
          <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-full opacity-60"></div>

          {/* Node Sequence */}
          <div className="relative flex justify-between items-center">
            {chainOfCustody.map((node, index) => {
              const isLast = index === chainOfCustody.length - 1;

              return (
                <div key={node.id} className="flex flex-col items-center group relative z-10">
                  
                  {/* Node Circle Button */}
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-sm cursor-pointer ${
                      isLast
                        ? 'bg-emerald-600 text-white border-2 border-emerald-400 ring-4 ring-emerald-500/20 scale-105 animate-pulse'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:scale-105'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold opacity-75">#{index + 1}</span>
                    <ShieldCheck className={`w-5 h-5 mt-0.5 ${isLast ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  </button>

                  {/* Stage Label Under Node */}
                  <div className="mt-3 text-center max-w-[130px]">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {node.title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                      {node.actor}
                    </div>
                    <div className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 font-semibold">
                      {node.timestamp.split(' ')[0]}
                    </div>
                  </div>

                  {/* Quick Detail Pill on Hover */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                      View Manifest
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Verified Transfer Point
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Judicial Custody
            </span>
          </div>
          <div>All transfer events signed with biometric tokens & cryptographic seals</div>
        </div>
      </div>

      {/* Clicked Node Detail Manifest Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-start pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedNode.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">Transfer Manifest #{selectedNode.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Custody Officer:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedNode.actor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Designation / Role:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedNode.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Badge ID:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{selectedNode.badge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Facility / Vault:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedNode.facility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transfer Time:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{selectedNode.timestamp}</span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Physical Evidence Seal:</div>
                <div className="font-mono text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-amber-200 dark:border-slate-800 font-bold">
                  {selectedNode.sealNumber}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] pt-1 leading-relaxed">
                  <strong>Notes:</strong> {selectedNode.notes}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                <div className="text-slate-500 dark:text-slate-400">Cryptographic Hash:</div>
                <div className="text-indigo-600 dark:text-indigo-300 break-all">{selectedNode.hashAtTransfer}</div>
                <div className="text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  Dual Signer: {selectedNode.verifiedBy}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Manifest
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

