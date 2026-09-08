import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/common/Header';
import RoleAdaptiveDashboards from './components/dashboard/RoleAdaptiveDashboards';
import CaseCommandCenter from './components/dashboard/CaseCommandCenter';
import CaseLifecyclePipeline from './components/pipeline/CaseLifecyclePipeline';
import UnifiedDocumentViewer from './components/viewer/UnifiedDocumentViewer';
import ChainOfCustodyGraph from './components/custody/ChainOfCustodyGraph';
import BlockchainLedgerExplorer from './components/integrity/BlockchainLedgerExplorer';
import AuditConsoleFeed from './components/custody/AuditConsoleFeed';
import Biometric2FAModal from './components/security/Biometric2FAModal';
import SecureShareModal from './components/collaboration/SecureShareModal';
import OfflineMobileCapture from './components/capture/OfflineMobileCapture';

export default function App() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200 font-sans">
      
      {/* Top Main Navigation & Telemetry Header */}
      <Header />

      {/* Main Command Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-5">
        
        {/* Role Adaptive Tactical Desk (Collapsible) */}
        <RoleAdaptiveDashboards />

        {/* Dynamic Screen View */}
        <div className="animate-fade-in">
          {activeTab === 'command' && <CaseCommandCenter />}
          {activeTab === 'pipeline' && <CaseLifecyclePipeline />}
          {activeTab === 'viewer' && <UnifiedDocumentViewer />}
          {activeTab === 'custody' && <ChainOfCustodyGraph />}
          {activeTab === 'ledger' && <BlockchainLedgerExplorer />}
          {activeTab === 'audit' && <AuditConsoleFeed />}
        </div>

      </main>

      {/* Global Modals & Overlays */}
      <Biometric2FAModal />
      <SecureShareModal />
      <OfflineMobileCapture />

      {/* Footer Status Line */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 px-6 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Consensus Node #1 Synced
          </span>
          <span>•</span>
          <span>Kyber-768 Lattice Cryptography</span>
          <span>•</span>
          <span>Sec. 65B Indian Evidence Act / Sec. 63 BNSS Compliant</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500">
          SENTINEL C3 COMMAND CONSOLE • RESTRICTED ACCESS
        </div>
      </footer>

    </div>
  );
}

