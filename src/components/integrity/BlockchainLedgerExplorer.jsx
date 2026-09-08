import React, { useState } from 'react';
import { 
  Boxes, Link, Hash, ShieldCheck, Search, Clock, Cpu, 
  ChevronRight, ArrowDown, Database, CheckCircle2, Lock, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatHash } from '../../utils/crypto';

export default function BlockchainLedgerExplorer() {
  const { blockchainLedger, selectedCaseId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedBlock, setInspectedBlock] = useState(null);

  const filteredBlocks = blockchainLedger.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.blockNumber.toString().includes(term) ||
      b.docId.toLowerCase().includes(term) ||
      b.eventType.toLowerCase().includes(term) ||
      b.blockHash.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Ledger Health & Consensus Stats */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-2xl text-brand-600 dark:text-brand-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Karnataka Judicial & Police Consortium Ledger
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  IMMUTABLE CONSENSUS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Append-only cryptographic chain securing evidence integrity across police, forensic labs, and judiciary.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Block #, Hash, or Doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Ledger Statistics Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-sans font-semibold">Current Block Height</span>
            <span className="text-base font-bold text-brand-600 dark:text-cyan-300">#{blockchainLedger[0]?.blockNumber}</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-sans font-semibold">Consensus Mechanism</span>
            <span className="text-base font-bold text-violet-600 dark:text-purple-300">Proof-of-Authority</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-sans font-semibold">Active Nodes</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">3 Synced</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase font-sans font-semibold">Integrity Rating</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">100.0% Tamper-Free</span>
          </div>
        </div>
      </div>

      {/* Sequential Blocks Chain View */}
      <div className="space-y-4">
        {filteredBlocks.map((block, idx) => (
          <div key={block.blockNumber} className="relative">
            
            {/* Block Card */}
            <div 
              onClick={() => setInspectedBlock(block)}
              className="bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50/80 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 dark:hover:border-brand-500/50 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500/15 dark:group-hover:bg-brand-500/20 border border-slate-200 dark:border-slate-700 group-hover:border-brand-500/40 flex items-center justify-center text-brand-600 dark:text-cyan-400 font-mono font-bold text-xs transition-colors">
                    #{block.blockNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{block.eventType}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 font-semibold">
                        {block.docId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(block.timestamp).toUTCString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-400 font-medium flex items-center gap-1 transition-colors">
                    Inspect JSON Payload <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Cryptographic Hashes Grid */}
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 font-semibold">
                    <Hash className="w-3 h-3 text-brand-500 dark:text-cyan-400" /> Block Hash
                  </div>
                  <div className="text-brand-700 dark:text-cyan-300 mt-1 truncate font-mono text-xs select-all" title={block.blockHash}>
                    {block.blockHash}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 font-semibold">
                    <Link className="w-3 h-3 text-violet-500 dark:text-purple-400" /> Previous Hash (Parent Link)
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 mt-1 truncate font-mono text-xs select-all" title={block.previousHash}>
                    {block.previousHash}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 font-semibold">
                    <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Merkle Root
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300 mt-1 truncate font-mono text-xs select-all" title={block.merkleRoot}>
                    {block.merkleRoot}
                  </div>
                </div>
              </div>

              {/* Validator Signatures */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Validator Signatures:</span>
                  {block.validatorNodes?.map((node, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-semibold">
                      ✓ {node}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  Consensus Cost: {block.gasUsed}
                </div>
              </div>
            </div>

            {/* Visual Blockchain Chain Link between blocks */}
            {idx < filteredBlocks.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-cyan-400 shadow-sm">
                  <ArrowDown className="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase">Cryptographic Parent Hash Link</span>
                  <ArrowDown className="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Block Inspector Modal */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-xl text-brand-600 dark:text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Block #{inspectedBlock.blockNumber} Raw Consensus Manifest</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Event: {inspectedBlock.eventType}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedBlock(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 dark:text-cyan-300 whitespace-pre">
              {JSON.stringify(inspectedBlock, null, 2)}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectedBlock(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
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
