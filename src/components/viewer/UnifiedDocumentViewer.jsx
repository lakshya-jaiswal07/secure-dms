import React, { useState } from 'react';
import { 
  FileText, ZoomIn, ZoomOut, Maximize2, Search, Award, Scissors, 
  Share2, ShieldCheck, AlertTriangle, Eye, MessageSquare, Plus, Check, RefreshCw,
  ExternalLink, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import VersionTimelineSlider from './VersionTimelineSlider';
import DrawRedactionTool from './DrawRedactionTool';
import DragDropClassifier from './DragDropClassifier';
import WaxSealSignaturePad from '../security/WaxSealSignaturePad';
import ContextualPermissionTooltip from '../security/ContextualPermissionTooltip';

export default function UnifiedDocumentViewer() {
  const { 
    currentCase, 
    currentDoc, 
    selectedDocId, 
    setSelectedDocId, 
    addAnnotation, 
    role, 
    setIsShareModalOpen, 
    toggleTamperDocument,
    t 
  } = useApp();

  const [activePaneTab, setActivePaneTab] = useState('ocr'); // ocr, meta, annotations
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(currentDoc?.version || 'v2.0');
  
  // Modals
  const [isRedactOpen, setIsRedactOpen] = useState(false);
  const [isSignOpen, setIsSignOpen] = useState(false);
  
  // Sticky note placing state
  const [isAddingSticky, setIsAddingSticky] = useState(false);
  const [newStickyText, setNewStickyText] = useState('');

  if (!currentDoc) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        No document selected. Select a document from the case files.
      </div>
    );
  }

  // Handle placing sticky note
  const handlePageClick = (e) => {
    if (!isAddingSticky || !newStickyText.trim()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newAnno = {
      id: `anno-${Date.now()}`,
      author: role === 'police' ? 'Insp. Rajesh Kulkarni' : role === 'forensic' ? 'Dr. Ananya Sharma' : 'Adv. M. S. Rao',
      role: t.roles[role] || role,
      page: 1,
      x,
      y,
      text: newStickyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false
    };

    addAnnotation(currentDoc.id, newAnno);
    setNewStickyText('');
    setIsAddingSticky(false);
  };

  // Search highlighting helper
  const highlightSearch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-400 text-slate-900 font-bold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Document Header & Action Toolbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 backdrop-blur-md transition-colors">
        
        {/* Left: Document Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                {currentCase?.documents?.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.version})
                  </option>
                ))}
              </select>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                currentDoc.isTampered 
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
              }`}>
                {currentDoc.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              Doc ID: {currentDoc.id} • {currentDoc.size} • {currentDoc.pages} Pages • Ingested: {currentDoc.uploadedAt}
            </div>
          </div>
        </div>

        {/* Right Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Term Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Highlight text in viewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Sticky Annotation Toggle */}
          <button
            onClick={() => setIsAddingSticky(!isAddingSticky)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
              isAddingSticky
                ? 'bg-amber-500 text-white border-amber-500 font-bold'
                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Click to drop a sticky note on the page"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAddingSticky ? "Click Page to Pin" : "Add Note"}</span>
          </button>

          {/* Redaction Tool Trigger */}
          <button
            onClick={() => setIsRedactOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-500" />
            <span>Redact</span>
          </button>

          {/* Wax Seal Digital Signer (Role Protected) */}
          <ContextualPermissionTooltip
            allowedRoles={['police', 'forensic', 'legal']}
            actionName="Digital Wax Seal Stamping"
            requiredRoleName="Authorized Officer or Expert"
            onAction={() => setIsSignOpen(true)}
          >
            <button className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all">
              <Award className="w-3.5 h-3.5" />
              <span>Wax Seal</span>
            </button>
          </ContextualPermissionTooltip>

          {/* Time-Boxed Share Trigger */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Sticky Note Creation Prompt Banner */}
      {isAddingSticky && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">Sticky Note Comment:</span>
            <input
              type="text"
              placeholder="Type your comment before clicking the page..."
              value={newStickyText}
              onChange={(e) => setNewStickyText(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1 text-slate-900 dark:text-slate-100 text-xs w-72 focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 hidden sm:inline font-medium">
            Click anywhere on the document facsimile to place this annotation pin
          </span>
        </div>
      )}

      {/* SPLIT PANE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT PANE: High-Fidelity Rendered Document Facsimile (7 Cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col overflow-hidden backdrop-blur-md transition-colors">
          
          {/* Facsimile Top Controls */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">FACSIMILE DOSSIER</span>
              <span>• Page 1 of {currentDoc.pages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setZoomLevel(z => Math.max(70, z - 10))}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-semibold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(z => Math.min(140, z + 10))}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Page Canvas View */}
          <div 
            onClick={handlePageClick}
            className={`p-6 bg-slate-100/70 dark:bg-slate-950 overflow-auto max-h-[640px] relative transition-all ${
              isAddingSticky ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="relative mx-auto max-w-xl bg-white dark:bg-[#0c1220] border-2 border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl transition-transform duration-150 min-h-[560px] text-slate-900 dark:text-slate-100 font-serif select-none"
            >
              {/* Document Official Watermark / Header */}
              <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 mb-5 text-center">
                <div className="text-[10px] tracking-widest text-slate-500 font-sans font-bold uppercase">
                  GOVERNMENT OF KARNATAKA • STATE POLICE DEPARTMENT
                </div>
                <div className="text-base font-bold tracking-wide text-slate-900 dark:text-white mt-1 uppercase font-sans">
                  {currentDoc.name}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 font-semibold">
                  CRIME NO: 842/2026 • POLICE STATION: WHITEFIELD
                </div>
              </div>

              {/* Rendered Body Text with Search Term Highlight */}
              <div className="text-xs leading-relaxed space-y-3 font-mono text-slate-700 dark:text-slate-300">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                  <strong>1. ACTS & SECTIONS:</strong> {highlightSearch("Sections 302, 420, 120B IPC r/w Section 66C IT Act 2000", searchTerm)}
                </div>
                <div>
                  <strong>2. COMPLAINANT:</strong> {highlightSearch("Chief Security Officer Dinesh Nair, ITPL Tower 3", searchTerm)}
                </div>
                <div>
                  <strong>3. PRIME ACCUSED:</strong> {highlightSearch("Vikram Malhotra (Director, Aethelgard FinTech)", searchTerm)}
                </div>
                <div className="pt-1">
                  <strong>4. EVIDENTIARY NARRATIVE:</strong>
                  <p className="mt-1 pl-2.5 border-l-2 border-indigo-300 dark:border-indigo-600 text-[11px] leading-relaxed">
                    {highlightSearch(
                      "Two spent 9x19mm Parabellum casings recovered adjacent to vehicle door. Micro-striae match registered Glock 19. Hardware wallet seized with 42.50 BTC unconfirmed escrow transaction timestamped 27 minutes prior to homicide event.",
                      searchTerm
                    )}
                  </p>
                </div>
              </div>

              {/* Version Diff Visual Indicator */}
              {selectedVersion === 'v1.1' && (
                <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-xl text-[11px] font-mono text-emerald-800 dark:text-emerald-300 animate-pulse">
                  <span className="font-bold">[DIFF ADDITION v1.1]:</span> Added cyber jurisdiction invoking Sec 66C IT Act following hardware extraction.
                </div>
              )}

              {/* Rendered Sticky Note Pins on Page */}
              {currentDoc.annotations?.map((anno) => (
                <div
                  key={anno.id}
                  style={{ left: `${anno.x}%`, top: `${anno.y}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg cursor-pointer transform hover:scale-125 transition-transform">
                    !
                  </div>

                  {/* Sticky Note Popover Card */}
                  <div className="absolute left-7 top-0 w-60 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700/80 p-2.5 rounded-xl shadow-2xl text-[11px] pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity z-30 font-sans text-slate-900 dark:text-slate-100">
                    <div className="flex justify-between items-center font-bold border-b border-amber-200 dark:border-amber-800 pb-1 mb-1 text-[10px]">
                      <span>{anno.author} ({anno.role})</span>
                      <span className="text-slate-500 dark:text-slate-400">{anno.timestamp}</span>
                    </div>
                    <p className="leading-snug">{anno.text}</p>
                  </div>
                </div>
              ))}

              {/* Rendered Wax Seals dynamically affixed on Document */}
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <div>SHA-256: {currentDoc.hash?.slice(0, 20)}...</div>
                  <div>LEAF VERIFIED: CONSENSUS NODE #1</div>
                </div>

                {/* Wax Seals Stack */}
                <div className="flex items-center gap-3">
                  {currentDoc.signatures?.map((sig, idx) => (
                    <div 
                      key={idx}
                      className="relative w-16 h-16 rounded-full bg-rose-800 border-2 border-amber-400 flex items-center justify-center text-amber-200 text-center shadow-lg transform rotate-[-4deg] animate-wax-stamp"
                      title={`Signed by ${sig.signerName} (${sig.role}) at ${sig.timestamp}`}
                    >
                      <div className="text-[8px] font-serif font-black leading-tight">
                        STATE<br />SEAL<br />
                        <span className="text-[6px] font-mono">{sig.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANE: Extracted OCR Text + Metadata + Annotations (5 Cols) */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col overflow-hidden backdrop-blur-md transition-colors">
          
          {/* Pane Navigation Tabs */}
          <div className="px-4 pt-3 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-3 text-xs">
            <button
              onClick={() => setActivePaneTab('ocr')}
              className={`pb-2.5 font-bold transition-all border-b-2 ${
                activePaneTab === 'ocr'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              OCR Text ({currentDoc.ocrConfidence}%)
            </button>
            <button
              onClick={() => setActivePaneTab('meta')}
              className={`pb-2.5 font-bold transition-all border-b-2 ${
                activePaneTab === 'meta'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Legal Entities
            </button>
            <button
              onClick={() => setActivePaneTab('annotations')}
              className={`pb-2.5 font-bold transition-all border-b-2 ${
                activePaneTab === 'annotations'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Notes ({currentDoc.annotations?.length || 0})
            </button>
          </div>

          {/* Pane Tab 1: OCR Text Stream with Real-time Highlighting */}
          {activePaneTab === 'ocr' && (
            <div className="p-4 flex-1 overflow-y-auto max-h-[580px] space-y-3 font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">OCR Engine: Neural Tesseract 5.4</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {currentDoc.ocrConfidence}% Match
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text leading-relaxed">
                {highlightSearch(currentDoc.ocrText, searchTerm)}
              </div>
            </div>
          )}

          {/* Pane Tab 2: Structured Entities & Document Metadata */}
          {activePaneTab === 'meta' && (
            <div className="p-4 flex-1 overflow-y-auto max-h-[580px] space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                  Extracted Legal Entities (NLP)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono">
                    Sec. 302 IPC (Homicide)
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono">
                    Sec. 420 IPC (Cheating)
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono">
                    Sec. 66C IT Act (Cyber)
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg font-mono">
                    Exhibit: Glock 19 (9mm)
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg font-mono">
                    Coldcard Hardware Wallet
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <h4 className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Cryptographic Provenance
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5">
                  <div className="text-slate-400">SHA-256 Digest:</div>
                  <div className="text-indigo-600 dark:text-indigo-300 break-all">{currentDoc.hash}</div>
                  <div className="pt-2 text-slate-400">Signatures Affixed:</div>
                  <div className="text-slate-800 dark:text-slate-200 font-sans font-semibold">
                    {currentDoc.signatures?.length ? `${currentDoc.signatures.length} Cryptographic Wax Seal(s)` : "None"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pane Tab 3: Reviewer Sticky Annotations List */}
          {activePaneTab === 'annotations' && (
            <div className="p-4 flex-1 overflow-y-auto max-h-[580px] space-y-3 text-xs">
              {currentDoc.annotations?.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No annotations yet. Click "Add Note" above and click anywhere on the document to add one.
                </p>
              ) : (
                currentDoc.annotations?.map((anno) => (
                  <div key={anno.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-bold text-amber-700 dark:text-amber-300">{anno.author} ({anno.role})</span>
                      <span className="text-[10px] font-mono">{anno.timestamp}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-snug">{anno.text}</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Pinned at Page {anno.page} (X: {anno.x}%, Y: {anno.y}%)
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* Version Timeline Slider beneath document */}
      <VersionTimelineSlider
        versions={currentDoc.versions || []}
        selectedVersion={selectedVersion}
        onSelectVersion={(v) => setSelectedVersion(v)}
      />

      {/* Drag and Drop Live Classification Zone */}
      <DragDropClassifier onDocumentAdded={(newId) => setSelectedDocId(newId)} />

      {/* Modals */}
      <DrawRedactionTool
        isOpen={isRedactOpen}
        onClose={() => setIsRedactOpen(false)}
        docId={currentDoc.id}
      />

      <WaxSealSignaturePad
        isOpen={isSignOpen}
        onClose={() => setIsSignOpen(false)}
        docId={currentDoc.id}
      />
    </div>
  );
}

