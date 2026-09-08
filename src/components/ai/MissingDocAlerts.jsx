import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MissingDocAlerts() {
  const { currentCase, setActiveTab, setSelectedDocId } = useApp();
  const alerts = currentCase?.missingDocumentAlerts || [];

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <span>Procedural & Statutory Alerts</span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
          {alerts.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {alerts.map((alert) => {
          const isCritical = alert.level === 'CRITICAL';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 shadow-xs ${
                isCritical
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    isCritical ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs">
                    {alert.title}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                  isCritical 
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  {alert.level}
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {alert.message}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Req: {alert.requiredAction}
                </span>
                <button
                  onClick={() => {
                    setActiveTab('viewer');
                    setSelectedDocId('DOC-SFSL-904');
                  }}
                  className={`font-semibold flex items-center gap-1 hover:underline text-xs ${
                    isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  Resolve <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

