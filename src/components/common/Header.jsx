import React, { useState } from 'react';
import { 
  Shield, LayoutDashboard, Kanban, FileText, GitFork, 
  Boxes, Terminal, Smartphone, Fingerprint, Sun, Moon,
  ChevronDown, FolderLock, Sparkles, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SecurityPostureWidget from '../security/SecurityPostureWidget';

export default function Header() {
  const { 
    cases,
    selectedCaseId,
    setSelectedCaseId,
    currentCase,
    activeTab, 
    setActiveTab, 
    role, 
    setRole, 
    lang, 
    setLang, 
    theme, 
    setTheme, 
    setIsBioModalOpen, 
    setIsCaptureModalOpen,
    t 
  } = useApp();

  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);

  const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard, badge: currentCase?.documents?.length },
    { id: 'pipeline', label: 'Lifecycle Pipeline', icon: Kanban, badge: '6 Stages' },
    { id: 'viewer', label: 'Evidence Viewer', icon: FileText },
    { id: 'custody', label: 'Chain of Custody', icon: GitFork },
    { id: 'ledger', label: 'Consortium Ledger', icon: Boxes },
    { id: 'audit', label: 'Security SOC', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 py-2.5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1600px] mx-auto">
        
        {/* Left: Brand Identity & Active Case Switcher */}
        <div className="flex items-center gap-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Shield className="w-5 h-5" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  SENTINEL<span className="text-indigo-500 dark:text-indigo-400"> C3</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  SEC-65B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Digital Evidence Command Console
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Prominent Active Case Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs transition-all text-left shadow-xs"
            >
              <FolderLock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="max-w-[170px] sm:max-w-[210px] truncate">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentCase?.id}
                </span>
                <span className="text-slate-400 dark:text-slate-500 mx-1">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
                  {currentCase?.title}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCaseMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Case Dropdown Menu */}
            {isCaseMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCaseMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-fade-in">
                  <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold">
                    Select Active Investigation File
                  </div>
                  {cases.map((c) => {
                    const isSelected = c.id === selectedCaseId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setIsCaseMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold border border-indigo-200 dark:border-indigo-800/60'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              c.priority === 'CRITICAL' 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {c.priority}
                            </span>
                          </div>
                          <div className="text-xs truncate font-medium text-slate-900 dark:text-slate-200">
                            {c.title}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {c.station}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 order-3 xl:order-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry & User Controls */}
        <div className="flex items-center gap-2 flex-wrap order-2 xl:order-3">
          
          {/* Security Posture Telemetry Widget */}
          <SecurityPostureWidget />

          {/* Quick Action: Biometric 2FA Trigger */}
          <button
            onClick={() => setIsBioModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Authenticate with Biometrics / 2FA"
          >
            <Fingerprint className="w-4 h-4" />
          </button>

          {/* Quick Action: Field Capture */}
          <button
            onClick={() => setIsCaptureModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Open Field Mobile Capture Simulator"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 cursor-pointer shadow-xs transition-colors"
            >
              <option value="police">👮 Police (IO)</option>
              <option value="forensic">🔬 Forensic (SFSL)</option>
              <option value="legal">⚖️ Legal Prosecutor</option>
              <option value="auditor">🛡️ Judicial Auditor</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-mono shadow-xs">
            {['en', 'hi', 'kn'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.8 rounded-lg uppercase transition-all font-semibold ${
                  lang === l
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title={`Toggle Theme (Current: ${theme === 'dark' ? 'Dark' : 'Light'})`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

        </div>

      </div>
    </header>
  );
}

