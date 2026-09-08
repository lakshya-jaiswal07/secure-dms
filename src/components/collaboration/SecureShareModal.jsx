import React, { useState, useEffect } from 'react';
import { Share2, Clock, Copy, Check, ShieldCheck, Lock, AlertCircle, X, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SecureShareModal() {
  const { isShareModalOpen, setIsShareModalOpen, currentDoc, currentCase, logAudit } = useApp();
  const [durationHours, setDurationHours] = useState(2);
  const [passcode, setPasscode] = useState('SENTINEL-9942');
  const [watermark, setWatermark] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Ticking countdown state
  const [remainingSeconds, setRemainingSeconds] = useState(7200); // 2 hours

  useEffect(() => {
    if (isShareModalOpen) {
      const generated = `https://sentinel.karnataka.gov.in/portal/guest-access?token=jwt_sec_${Math.random().toString(36).slice(2, 12)}&exp=${Date.now() + durationHours * 3600000}`;
      setShareLink(generated);
      setRemainingSeconds(durationHours * 3600);
      logAudit("TIME_BOXED_SHARE_LINK_GENERATED", `Created ${durationHours}h time-boxed link for ${currentDoc?.id} with forensic watermark`, "INFO");
    }
  }, [isShareModalOpen, durationHours]);

  useEffect(() => {
    let interval;
    if (isShareModalOpen && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(s => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isShareModalOpen, remainingSeconds]);

  if (!isShareModalOpen) return null;

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${shareLink} (PIN: ${passcode})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-xl text-brand-600 dark:text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Time-Boxed Secure Share Link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expirable, watermarked guest access for external agencies</p>
            </div>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-4 text-xs">
          {/* Target Document */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Target Document:</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{currentDoc?.name}</div>
            <div className="text-[11px] font-mono text-brand-600 dark:text-cyan-400 mt-0.5">SHA-256: {currentDoc?.hash?.slice(0, 24)}...</div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold mb-1.5 block">Access Validity Window:</label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 24, 168].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setDurationHours(hours)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    durationHours === hours
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-cyan-200 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {hours === 168 ? "7 Days" : `${hours} Hours`}
                </button>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Dynamic PIN Access:</span>
              <span className="font-mono text-amber-600 dark:text-amber-300 font-bold text-sm">{passcode}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-semibold block text-[11px]">Forensic Watermark</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Stamps recipient IP & time</span>
              </div>
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 accent-brand-600"
              />
            </div>
          </div>

          {/* Live Expiry Countdown */}
          <div className="p-3.5 bg-brand-50/50 dark:bg-blue-950/30 border border-brand-200 dark:border-blue-800/50 rounded-xl flex items-center justify-between text-brand-900 dark:text-blue-200 font-mono">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-cyan-400 animate-spin" />
              <span className="text-xs font-semibold">Active Countdown:</span>
            </div>
            <span className="text-sm font-bold text-brand-700 dark:text-cyan-300">
              {formatCountdown(remainingSeconds)}
            </span>
          </div>

          {/* Generated Link Input */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold mb-1 block">One-Time Guest Link:</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-[11px] text-brand-700 dark:text-cyan-300 outline-none select-all"
              />
              <button
                onClick={copyLink}
                className="px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
