import React from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TamperSparkline({ sparkline = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100], isTampered = false, docId }) {
  const { setActiveTab } = useApp();

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Hash Integrity Sparkline:</span>
        </div>
        <span className={`text-[10px] font-mono ${isTampered ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
          {isTampered ? "⚠ Discrepancy Spike at T-0" : "100% Flatline Untouched"}
        </span>
      </div>

      {/* SVG Sparkline Graph */}
      <div className="relative h-8 w-28 bg-slate-900/80 rounded-md overflow-hidden border border-slate-800 px-1 py-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
          {/* Baseline guide line */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Sparkline path */}
          {isTampered ? (
            <polyline
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              points="0,20 15,20 30,20 45,20 60,20 75,20 85,28 90,5 95,28 100,5"
            />
          ) : (
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              points="0,20 10,20 20,20 30,20 40,20 50,20 60,20 70,20 80,20 90,20 100,20"
            />
          )}
        </svg>
      </div>

      {isTampered && (
        <button
          onClick={() => setActiveTab('audit')}
          className="text-[10px] font-mono text-red-400 hover:text-red-300 underline font-semibold flex items-center gap-1"
          title="Jump to Audit Event"
        >
          View Audit Log →
        </button>
      )}
    </div>
  );
}
