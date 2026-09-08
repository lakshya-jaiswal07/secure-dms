import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Globe, Smartphone, Cpu, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SecurityPostureWidget() {
  const { isSecurityDrawerOpen, setIsSecurityDrawerOpen, currentDoc, t } = useApp();
  const isDocumentCompromised = currentDoc?.isTampered;

  return (
    <>
      {/* Top Bar Persistent Badge */}
      <button
        onClick={() => setIsSecurityDrawerOpen(!isSecurityDrawerOpen)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 ${
          isDocumentCompromised
            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 shadow-sm animate-pulse'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
        }`}
        title="Click to view Security Posture & Telemetry"
      >
        <div className="relative flex items-center justify-center">
          <span className={`w-2 h-2 rounded-full ${isDocumentCompromised ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <span className={`absolute w-2 h-2 rounded-full ${isDocumentCompromised ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {isDocumentCompromised ? (
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="font-semibold tracking-wide font-sans text-[11px]">
            {isDocumentCompromised ? "INTEGRITY ALERT" : "ZERO-TRUST SECURE"}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        <span className="hidden lg:inline text-slate-500 dark:text-slate-400 text-[11px]">
          TLS 1.3 / Kyber-768
        </span>

        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>

        <span className={`hidden sm:inline font-medium text-[11px] ${isDocumentCompromised ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
          {isDocumentCompromised ? "⚠ 1 Discrepancy" : "✓ 0 Anomalies"}
        </span>
      </button>

      {/* Slide-out Security Telemetry Drawer */}
      {isSecurityDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setIsSecurityDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-xl text-brand-600 dark:text-cyan-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide">
                      Live Security Posture Telemetry
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time cryptographic audit consensus</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSecurityDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alert Banner */}
              <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                isDocumentCompromised 
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-200' 
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-200'
              }`}>
                {isDocumentCompromised ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-sm">
                    {isDocumentCompromised ? "Integrity Discrepancy Active!" : "Cryptographic Perimeter Nominal"}
                  </div>
                  {isDocumentCompromised ? (
                    <p className="mt-1 text-red-700 dark:text-red-300">
                      Document <span className="font-mono font-semibold">{currentDoc?.id}</span> hash differs from the blockchain ledger genesis entry. Live re-verification flag raised.
                    </p>
                  ) : (
                    <p className="mt-1 text-emerald-700 dark:text-emerald-300/90">
                      All case files match cryptographic Merkle leaf hashes. Session connection encrypted with post-quantum lattice scheme.
                    </p>
                  )}
                </div>
              </div>

              {/* Telemetry Details */}
              <div className="mt-5 space-y-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Lock className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                    <span>In-Transit Encryption</span>
                  </div>
                  <span className="font-mono text-brand-700 dark:text-cyan-300 font-semibold text-[11px]">TLS 1.3 / Kyber-768 PQ</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Cpu className="w-4 h-4 text-violet-600 dark:text-purple-400" />
                    <span>Hardware Token</span>
                  </div>
                  <span className="font-mono text-violet-700 dark:text-purple-300 font-semibold text-[11px]">FIPS 140-3 L3 (YubiKey)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Access Geo-Origin</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium text-[11px]">Bengaluru, KA (12.9716°N)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Station Client</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium text-[11px]">macOS M3 • Sentinel App v3.4</span>
                </div>
              </div>

              {/* Security Event Feed */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  Recent Perimeter Flags (Last 24h)
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-red-800 dark:text-red-300 flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5 font-bold">⚠</span>
                    <div>
                      <div className="font-bold">Frankfurt Relay Blocked</div>
                      <div className="text-[11px] text-red-600 dark:text-red-400/80 font-sans">Token hijack attempt on Ballistics Report • 185.220.101.44</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl text-slate-800 dark:text-slate-300 flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                    <div>
                      <div className="font-bold">Merkle Tree Audit Passed</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">1,480 case objects synchronized with High Court Consensus</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => setIsSecurityDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Telemetry Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
