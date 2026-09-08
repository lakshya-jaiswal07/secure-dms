import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, QrCode, RefreshCw, Copy, Check, 
  Binary, FileCode, CheckCircle2, AlertOctagon, Terminal, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { generateQRMatrix, formatHash } from '../../utils/crypto';
import { useApp } from '../../context/AppContext';
import TamperSparkline from './TamperSparkline';

export default function FingerprintCard({ document, defaultExpanded = false }) {
  const { toggleTamperDocument, logAudit, setSelectedDocId, setActiveTab } = useApp();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [reverifying, setReverifying] = useState(false);
  const [reverifyProgress, setReverifyProgress] = useState(0);

  if (!document) return null;

  const qrMatrix = generateQRMatrix(document.hash || "sentinel");

  const copyHash = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(document.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReverifyLive = (e) => {
    e?.stopPropagation();
    setReverifying(true);
    setReverifyProgress(10);
    
    const interval = setInterval(() => {
      setReverifyProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setReverifying(false);
            setReverifyProgress(0);
            logAudit(
              "LIVE_HASH_REVERIFICATION",
              `Recomputed SHA-256 byte digest for ${document.id}. Status: ${document.isTampered ? 'INTEGRITY_MISMATCH' : 'MATCHES_ORIGINAL'}`,
              document.isTampered ? "CRITICAL" : "SUCCESS",
              document.id
            );
          }, 400);
          return 100;
        }
        return p + 30;
      });
    }, 150);
  };

  return (
    <div className={`rounded-2xl transition-all duration-200 border shadow-xs ${
      document.isTampered
        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/50 shadow-rose-500/10'
        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-300 dark:hover:border-slate-700'
    }`}>
      {/* Card Header & High-Level Summary */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border mt-0.5 ${
              document.isTampered 
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}>
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                  {document.id}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {document.size} • {document.pages} Pages
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base mt-0.5">
                {document.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Hash: <span className="text-slate-700 dark:text-slate-300 font-medium">{formatHash(document.hash)}</span>
              </p>
            </div>
          </div>

          {/* Right Status Badge & Primary Action */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
              document.isTampered
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
            }`}>
              {document.isTampered ? (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                  <span>TAMPER DETECTED</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>VERIFIED ORIGINAL</span>
                </>
              )}
            </span>

            <button
              onClick={() => {
                setSelectedDocId(document.id);
                setActiveTab('viewer');
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>
        </div>

        {/* Quick Footer Controls */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <TamperSparkline
            sparkline={document.sparkline}
            isTampered={document.isTampered}
            docId={document.id}
          />

          <div className="flex items-center gap-2">
            {/* 1-Byte Tamper Simulator Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTamperDocument(document.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                document.isTampered
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              }`}
              title="Test real-time tamper alert"
            >
              <Terminal className="w-3 h-3" />
              <span>{document.isTampered ? "Restore Genesis" : "Simulate Tamper"}</span>
            </button>

            {/* Expand / Collapse Cryptography Details */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{isExpanded ? "Hide Proof" : "Cryptographic Proof"}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Cryptographic Details & QR Code Drawer */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-b-2xl animate-fade-in">
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* SVG QR Code */}
            <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="p-1 bg-white rounded-lg">
                <svg className="w-20 h-20" viewBox="0 0 15 15">
                  {qrMatrix.map((row, r) =>
                    row.map((val, c) => (
                      <rect
                        key={`${r}-${c}`}
                        x={c}
                        y={r}
                        width={1}
                        height={1}
                        fill={val ? (document.isTampered ? '#E11D48' : '#0F172A') : '#FFFFFF'}
                      />
                    ))
                  )}
                </svg>
              </div>
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">
                Consensus Root #12
              </span>
            </div>

            {/* Hash & Merkle Details */}
            <div className="md:col-span-9 space-y-2.5 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">
                  <span>Active SHA-256 Checksum:</span>
                  <button
                    onClick={copyHash}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy Full Hex"}</span>
                  </button>
                </div>
                
                <div className={`p-2.5 rounded-xl font-mono text-xs break-all border select-all ${
                  document.isTampered
                    ? 'bg-rose-100/50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60'
                    : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-indigo-300 border-slate-200 dark:border-slate-800'
                }`}>
                  {document.hash}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500 block uppercase text-[8px]">Merkle Tree</span>
                  Leaf #4 of Block #1048
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500 block uppercase text-[8px]">Encryption</span>
                  ECDSA P-384 / SHA-256
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 dark:text-slate-500 block uppercase text-[8px]">Validator</span>
                  SFSL Karnataka Node #3
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleReverifyLive}
                  disabled={reverifying}
                  className="px-3 py-1 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${reverifying ? 'animate-spin text-indigo-500' : ''}`} />
                  <span>{reverifying ? `Hashing Bytes (${reverifyProgress}%)...` : "Re-verify Checksum Now"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

