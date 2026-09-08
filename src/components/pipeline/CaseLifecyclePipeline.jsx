import React, { useState } from 'react';
import { 
  Kanban, AlertCircle, Clock, ShieldCheck, User, FileText, 
  ChevronRight, Lock, CheckCircle2, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STAGES = [
  { id: 0, name: "FIR Registered", code: "STAGE_FIR", minRole: "police" },
  { id: 1, name: "Active Investigation", code: "STAGE_INVESTIGATION", minRole: "police" },
  { id: 2, name: "Forensic Analysis", code: "STAGE_FORENSIC", minRole: "forensic" },
  { id: 3, name: "Charge Sheet Drafted", code: "STAGE_CHARGE_SHEET", minRole: "legal" },
  { id: 4, name: "Court Order & Trial", code: "STAGE_COURT", minRole: "legal" },
  { id: 5, name: "Archived / Closed", code: "STAGE_ARCHIVED", minRole: "auditor" }
];

export default function CaseLifecyclePipeline() {
  const { cases, setSelectedCaseId, setActiveTab, updateCaseStage, role, t } = useApp();
  const [draggedCaseId, setDraggedCaseId] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  const handleDragStart = (e, caseId) => {
    e.dataTransfer.setData("text/plain", caseId);
    setDraggedCaseId(caseId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageIndex) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("text/plain") || draggedCaseId;
    if (!caseId) return;

    const targetStage = STAGES[targetStageIndex];

    // Check Role Authorization
    const roleHierarchy = { police: 1, forensic: 2, legal: 3, auditor: 4 };
    const requiredLevel = { police: 1, forensic: 2, legal: 3, auditor: 4 }[targetStage.minRole] || 1;
    const userLevel = roleHierarchy[role] || 1;

    if (userLevel < requiredLevel) {
      setPermissionError({
        targetStage: targetStage.name,
        requiredRole: targetStage.minRole.toUpperCase(),
        currentRole: role.toUpperCase()
      });
      return;
    }

    updateCaseStage(caseId, targetStageIndex);
    setDraggedCaseId(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statutory Case Lifecycle Pipeline
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                DRAG & DROP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict statutory stage progression. Role clearance enforced at judicial scrutiny & forensic gates.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          Clearance Level: <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{role}</span>
        </div>
      </div>

      {/* Permission Lock Alert Modal */}
      {permissionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/50 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-rose-700 dark:text-rose-300">Procedural Access Denied:</span>
              <span className="text-slate-700 dark:text-slate-300 ml-1.5">
                Moving cases into <strong className="text-slate-900 dark:text-white">"{permissionError.targetStage}"</strong> requires <strong className="text-amber-700 dark:text-amber-300">{permissionError.requiredRole}</strong> clearance or above. (Current: {permissionError.currentRole})
              </span>
            </div>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-mono ml-3 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCases = cases.filter(c => c.currentStageIndex === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[520px] transition-all hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide truncate max-w-[130px]" title={stage.name}>
                    {stage.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700">
                  {stageCases.length}
                </span>
              </div>

              {/* Case Cards */}
              <div className="space-y-2.5 flex-1">
                {stageCases.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setActiveTab('command');
                    }}
                    className="p-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-xl shadow-xs cursor-grab active:cursor-grabbing transition-all group select-none"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{c.id}</span>
                      <span className={`px-2 py-0.2 rounded-full font-bold ${
                        c.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.priority}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {c.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {c.subtitle}
                    </p>

                    {/* Statutory Countdown Pill */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {c.statutoryDaysRemaining}d left
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 truncate max-w-[80px]">{c.station.split(',')[0]}</span>
                    </div>

                    {/* Assigned IO Badge */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-mono truncate">
                        <User className="w-3 h-3 text-indigo-500" />
                        {c.assignedIO?.name}
                      </span>
                      <span className="text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                ))}

                {stageCases.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 font-mono text-center p-2">
                    Drop authorized case card
                  </div>
                )}
              </div>

              {/* Stage Authorization Gate Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Access Gate:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{stage.minRole.toUpperCase()}+</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

