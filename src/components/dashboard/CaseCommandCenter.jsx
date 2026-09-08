import React, { useState } from 'react';
import { 
  FolderKanban, Clock, Users, FileText, ShieldAlert, Award, 
  ExternalLink, ChevronRight, Bookmark, ArrowRight, CheckCircle2,
  Calendar, MapPin, Eye, AlertTriangle, Filter, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SemanticSearchBar from '../ai/SemanticSearchBar';
import AICaseSummaryPanel from '../ai/AICaseSummaryPanel';
import MissingDocAlerts from '../ai/MissingDocAlerts';
import FingerprintCard from '../integrity/FingerprintCard';

const STAGES = [
  "FIR Registered",
  "Active Investigation",
  "Forensic Analysis",
  "Charge Sheet Drafted",
  "Court Order & Trial",
  "Archived / Closed"
];

export default function CaseCommandCenter() {
  const { 
    cases, 
    selectedCaseId, 
    setSelectedCaseId, 
    currentCase, 
    setSelectedDocId, 
    setActiveTab, 
    activeSavedFilter, 
    setActiveSavedFilter,
    t 
  } = useApp();

  const [docCategoryFilter, setDocCategoryFilter] = useState('ALL');

  if (!currentCase) return null;

  // Filter documents by active filter or category
  const filteredDocs = currentCase.documents?.filter(doc => {
    if (activeSavedFilter === 'flagged-review') {
      return doc.isTampered;
    }
    if (docCategoryFilter === 'EVIDENCE') {
      return doc.type === 'EXHIBIT' || doc.name.toLowerCase().includes('exhibit') || doc.name.toLowerCase().includes('wallet');
    }
    if (docCategoryFilter === 'FORENSIC') {
      return doc.type === 'FORENSIC' || doc.name.toLowerCase().includes('sfsl') || doc.name.toLowerCase().includes('ballistics');
    }
    if (docCategoryFilter === 'LEGAL') {
      return doc.type === 'CHARGE_SHEET' || doc.name.toLowerCase().includes('fir') || doc.name.toLowerCase().includes('charge');
    }
    return true;
  }) || [];

  return (
    <div className="space-y-5">
      
      {/* Top: Sovereign Case Dossier Hero Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 backdrop-blur-md transition-colors">
        
        {/* Top Line: Meta Badges + Countdown */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/80">
                {currentCase.id}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                currentCase.priority === 'CRITICAL'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {currentCase.priority} PRIORITY
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {currentCase.status}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentCase.title}
            </h2>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2.5 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {currentCase.station}
              </span>
              <span>•</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentCase.firNumber}</span>
              <span>•</span>
              <span>IO: {currentCase.assignedIO?.name} ({currentCase.assignedIO?.badge})</span>
            </div>
          </div>

          {/* Statutory Bail Window Gauge */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 min-w-[230px] shadow-xs">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Statutory Custody
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                {currentCase.statutoryDaysRemaining}d / {currentCase.totalStatutoryDays}d
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all"
                style={{ width: `${(currentCase.statutoryDaysRemaining / currentCase.totalStatutoryDays) * 100}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1.5 flex justify-between">
              <span>Sec. 167 CrPC</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">Bail Countdown</span>
            </div>
          </div>
        </div>

        {/* 6-Stage Procedural Progression Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono mb-2">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Statutory Case Progression:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              Stage {currentCase.currentStageIndex + 1} of 6: {STAGES[currentCase.currentStageIndex]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {STAGES.map((stageName, idx) => {
              const isPast = idx < currentCase.currentStageIndex;
              const isCurrent = idx === currentCase.currentStageIndex;

              return (
                <div key={idx} className="flex flex-col space-y-1">
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/40 ring-2 ring-indigo-400/30'
                      : isPast
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}></div>
                  <span className={`text-[10px] font-mono truncate ${
                    isCurrent 
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                      : isPast 
                      ? 'text-slate-700 dark:text-slate-300 font-medium' 
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {idx + 1}. {stageName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Semantic NLP Search Bar */}
      <SemanticSearchBar />

      {/* Main 2-Column Split: Document Catalog (7 Cols) vs Case Intelligence & People (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Evidentiary Documents Vault (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Vault Header & Category Tabs */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3 backdrop-blur-md transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Case Evidence & Document Vault
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {filteredDocs.length} Files
                </span>
              </div>

              <button
                onClick={() => setActiveTab('viewer')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Open Unified Split Viewer <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Document Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              {[
                { id: 'ALL', label: 'All Documents' },
                { id: 'EVIDENCE', label: 'Seized Exhibits' },
                { id: 'FORENSIC', label: 'SFSL Lab Reports' },
                { id: 'LEGAL', label: 'FIR & Chargesheet' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDocCategoryFilter(tab.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    docCategoryFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards List */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                No documents match the active filter criteria.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <FingerprintCard key={doc.id} document={doc} defaultExpanded={false} />
              ))
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Intelligence & Stakeholders Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Statutory Alerts */}
          <MissingDocAlerts />

          {/* Autonomous AI Synthesis */}
          <AICaseSummaryPanel />

          {/* Key Stakeholders Involved */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 backdrop-blur-md transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Case Stakeholders & Officers
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {currentCase.people?.length || 0} Key Actors
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {currentCase.people?.map((person, idx) => (
                <div key={idx} className={`flex items-start gap-3 text-xs ${idx !== 0 ? 'pt-2.5 mt-2.5' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 shadow-xs">
                    {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{person.name}</div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{person.role}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{person.dept}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

