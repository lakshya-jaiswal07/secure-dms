import React, { useState } from 'react';
import { 
  Camera, Wifi, WifiOff, RefreshCw, CheckCircle2, ShieldCheck, 
  Smartphone, Upload, ArrowRight, X, AlertCircle 
} from 'lucide-react';
import { computeSHA256 } from '../../utils/crypto';
import { useApp } from '../../context/AppContext';

export default function OfflineMobileCapture({ isOpen, onClose }) {
  const { isCaptureModalOpen, setIsCaptureModalOpen, logAudit } = useApp();
  const [isOnline, setIsOnline] = useState(false); // start in offline mode for demonstration!
  const [capturedQueue, setCapturedQueue] = useState([
    {
      id: "OFFLINE-CAP-001",
      docName: "Handwritten Seizure Mahazar (Rural Station)",
      timestamp: "2026-09-08 17:10 IST",
      localHash: "a81d4e9b81923049182390192381203918203918203918203918203918203918",
      status: "QUEUED_LOCALLY",
      fileSize: "3.1 MB"
    }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  if (!isOpen && !isCaptureModalOpen) return null;

  const handleSimulateFieldCapture = async () => {
    setIsTakingPhoto(true);
    setTimeout(async () => {
      const computed = await computeSHA256("FIELD_CAPTURE_" + Date.now());
      const newCaptured = {
        id: `OFFLINE-CAP-${Date.now().toString().slice(-4)}`,
        docName: `Field Evidence Snap #${capturedQueue.length + 1} (Spot Seizure)`,
        timestamp: new Date().toLocaleTimeString() + " IST",
        localHash: computed,
        status: isOnline ? "SYNCED" : "QUEUED_LOCALLY",
        fileSize: "2.8 MB"
      };
      setCapturedQueue(prev => [newCaptured, ...prev]);
      setIsTakingPhoto(false);
      logAudit(
        "OFFLINE_CAPTURE_EVENT",
        `On-device SHA-256 computed in field: ${computed.slice(0, 16)}... (Network: ${isOnline ? 'Online' : 'Offline'})`,
        "INFO"
      );
    }, 1200);
  };

  const handleSyncNow = () => {
    if (!isOnline) {
      alert("Network is currently toggled OFFLINE. Toggle connectivity to 5G first!");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setCapturedQueue(prev => prev.map(item => ({ ...item, status: "SYNCED" })));
      setIsSyncing(false);
      logAudit("OFFLINE_QUEUE_SYNCED", `Synchronized ${capturedQueue.length} field documents with Central Evidence Vault`, "SUCCESS");
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Offline-First Field Mobile Capture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">On-device edge hashing with background vault synchronization</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (onClose) onClose();
              setIsCaptureModalOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Toggle Simulator */}
        <div className="my-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              Field Net: <strong className={isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{isOnline ? "5G ONLINE (Connected)" : "REMOTE STATION (Offline)"}</strong>
            </span>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-colors border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
            }`}
          >
            Toggle {isOnline ? "Offline" : "Online"}
          </button>
        </div>

        {/* Shutter Camera Trigger */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
          <button
            onClick={handleSimulateFieldCapture}
            disabled={isTakingPhoto}
            className="w-20 h-20 rounded-full bg-brand-600 hover:bg-brand-500 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Camera className={`w-8 h-8 ${isTakingPhoto ? 'animate-ping' : ''}`} />
          </button>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 mt-3">
            {isTakingPhoto ? "Snapping & Hashing on Device..." : "Capture Physical Document (Camera)"}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generates SHA-256 hash immediately on-device before any network upload
          </p>
        </div>

        {/* Local IndexedDB Offline Queue */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Local Device Queue ({capturedQueue.length}):</span>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !isOnline || capturedQueue.every(q => q.status === "SYNCED")}
              className="text-brand-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync Queue Now"}
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {capturedQueue.map((item) => (
              <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-200">{item.docName}</div>
                  <div className="text-[10px] font-mono text-brand-600 dark:text-cyan-400 truncate max-w-xs">
                    Local SHA-256: {item.localHash.slice(0, 20)}...
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.status === 'SYNCED'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex justify-end">
          <button
            onClick={() => {
              if (onClose) onClose();
              setIsCaptureModalOpen(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
