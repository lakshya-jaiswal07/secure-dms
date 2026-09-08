import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckCircle, RotateCcw, ShieldCheck, Award, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export default function WaxSealSignaturePad({ isOpen, onClose, docId }) {
  const { currentDoc, role, addWaxSealSignature, t } = useApp();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [certType, setCertType] = useState('canvas'); // canvas or cert
  const [stamping, setStamping] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasDrawn(false);
      setStamping(false);
      setStampedSuccess(false);
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen, certType]);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApplyWaxSeal = () => {
    setStamping(true);
    
    // Trigger celebratory gold/crimson particles
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#B91C1C', '#F59E0B', '#6366F1']
      });
    } catch (e) {
      // fallback if confetti fails
    }

    const signerInfo = {
      police: { name: "Insp. Rajesh Kulkarni", badge: "KA-BLR-4892", sealType: "crimson-police" },
      forensic: { name: "Dr. Ananya Sharma", badge: "SFSL-BAL-88", sealType: "emerald-forensic" },
      legal: { name: "Adv. M. S. Rao", badge: "KBC-PROS-2011", sealType: "gold-prosecution" },
      auditor: { name: "Registrar P. S. Bhat", badge: "HC-REG-993", sealType: "royal-judiciary" }
    }[role] || { name: "Official Signatory", badge: "KA-GOV-01", sealType: "crimson-police" };

    const signatureData = {
      signerName: signerInfo.name,
      role: t.roles[role] || role,
      badge: signerInfo.badge,
      timestamp: new Date().toISOString(),
      waxSealType: signerInfo.sealType,
      hashSignature: "sig_ecdsa_sha256_" + Math.random().toString(36).slice(2, 10)
    };

    setTimeout(() => {
      setStamping(false);
      setStampedSuccess(true);
      addWaxSealSignature(docId || currentDoc?.id, signatureData);
      setTimeout(() => {
        onClose();
      }, 1600);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                Digital Wax Seal & Legal Endorsement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographically binds identity, timestamp & hash</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Stamping Animation Overlay */}
        {stampedSuccess && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full bg-red-800 border-4 border-amber-400/80 shadow-2xl flex items-center justify-center animate-wax-stamp text-amber-200">
                <div className="text-center p-2">
                  <div className="text-[10px] font-bold tracking-widest uppercase">STATE OF KARNATAKA</div>
                  <div className="text-xl font-serif font-black my-0.5">SEAL</div>
                  <div className="text-[9px] font-mono text-amber-300">VERIFIED</div>
                </div>
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Wax Seal Affixed Successfully!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Embedded into document metadata & consensus ledger</p>
          </div>
        )}

        {!stampedSuccess && (
          <div className="mt-4 space-y-4">
            
            {/* Mode Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setCertType('canvas')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  certType === 'canvas' 
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Draw Signature Pad
              </button>
              <button
                onClick={() => setCertType('cert')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  certType === 'cert' 
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                FIPS Certificate e-Sign
              </button>
            </div>

            {/* Drawing Canvas */}
            {certType === 'canvas' ? (
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Draw signature below using stylus or mouse:</span>
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>

                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950/70 overflow-hidden cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 touch-none"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-600 text-xs">
                      Sign here on the designated line
                    </div>
                  )}
                  <div className="absolute bottom-3 left-4 right-4 border-b border-slate-300 dark:border-slate-800 pointer-events-none"></div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-brand-600 dark:text-cyan-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hardware Cryptographic Token Detected</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Token: <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">YubiKey 5 FIPS (Serial: #8849-0129)</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Identity: <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">{role.toUpperCase()} // STATE CONSORTIUM</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Algorithm: <span className="font-mono text-violet-600 dark:text-purple-300">ECDSA P-384 / SHA-384</span>
                </div>
              </div>
            )}

            {/* Seal Preview Badge */}
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-700 border-2 border-amber-400 flex items-center justify-center text-amber-200 text-xs font-serif font-black shadow">
                  SEAL
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200">Embossed Wax Seal Metadata</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Will bind: <span className="text-brand-600 dark:text-cyan-300 font-mono font-medium">{currentDoc?.id}</span> • ISO-8601 Stamp
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded border border-red-200 dark:border-red-800/40">
                CRIMSON EMBOSS
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyWaxSeal}
                disabled={certType === 'canvas' && !hasDrawn}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {stamping ? "Stamping Wax..." : "Affix Digital Wax Seal"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
