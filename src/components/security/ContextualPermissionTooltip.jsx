import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ContextualPermissionTooltip({ 
  children, 
  allowedRoles = ['legal', 'auditor'], 
  actionName = "This action",
  requiredRoleName = "Legal Officer or above",
  onAction
}) {
  const { role, setRole } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);

  const isAllowed = allowedRoles.includes(role);

  if (isAllowed) {
    return (
      <div onClick={onAction}>
        {children}
      </div>
    );
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="opacity-60 cursor-not-allowed filter grayscale-50 select-none">
        {children}
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-amber-600 dark:text-amber-300">Action Locked</div>
              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                {actionName} requires <span className="font-semibold text-amber-700 dark:text-amber-200">{requiredRoleName}</span> privileges.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Role: <span className="font-mono text-brand-600 dark:text-cyan-400 font-semibold">{role}</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRole(allowedRoles[0]);
                    setShowTooltip(false);
                  }}
                  className="text-[10px] text-brand-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
                >
                  Switch Role <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
          {/* Tooltip caret */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
