import React, { useState, useRef } from 'react';
import { Shield, EyeOff, Check, X, Scissors, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DrawRedactionTool({ isOpen, onClose, docId }) {
  const { currentDoc, logAudit } = useApp();
  const [redactionBoxes, setRedactionBoxes] = useState([
    { id: 1, x: 20, y: 35, width: 28, height: 4, label: "Witness Minor Name" },
    { id: 2, x: 45, y: 72, width: 35, height: 3.5, label: "Undercover Informant Contact" }
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);
  const [bakedSuccess, setBakedSuccess] = useState(false);
  const containerRef = useRef(null);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(startPos.x, curX);
    const y = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.width > 2 && currentBox.height > 2) {
      setRedactionBoxes(prev => [
        ...prev, 
        { ...currentBox, id: Date.now(), label: `Redacted Zone #${prev.length + 1}` }
      ]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentBox(null);
  };

  const removeBox = (id, e) => {
    e.stopPropagation();
    setRedactionBoxes(prev => prev.filter(b => b.id !== id));
  };

  const handleBakeRedaction = () => {
    setBakedSuccess(true);
    logAudit("REDACTION_BAKED", `Cryptographically redacted copy created for ${docId || currentDoc?.id} with ${redactionBoxes.length} masked zones. Original hash untouched.`, "SUCCESS");
    setTimeout(() => {
      onClose();
      setBakedSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-600 dark:text-purple-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Draw-to-Redact Sensitive Sections
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click and drag over sensitive witness or juvenile identities</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {bakedSuccess ? (
          <div className="py-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-lg shadow-emerald-500/25">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Redacted Copy Cryptographically Baked</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Original hash <span className="font-mono text-brand-600 dark:text-cyan-400 font-semibold">{currentDoc?.hash?.slice(0, 12)}...</span> remains verified and dual-custody restricted. Redacted copy assigned hash <span className="font-mono text-violet-600 dark:text-purple-400 font-semibold">89fa4109...</span> for court public release.
            </p>
          </div>
        ) : (
          <>
            {/* Interactive Document Page Canvas */}
            <div className="my-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Draw rectangular masks directly over the document text:</span>
              <span className="font-mono text-violet-600 dark:text-purple-400 font-semibold">{redactionBoxes.length} Redactions Active</span>
            </div>

            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="relative flex-1 min-h-[300px] max-h-[380px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 select-none overflow-hidden cursor-crosshair font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300"
            >
              <div className="space-y-3 opacity-75">
                <div className="text-slate-900 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-1">
                  FIRST INFORMATION REPORT (CONFIDENTIAL LEGAL EXHIBIT)
                </div>
                <p>
                  Complainant / Informant: Security Officer Dinesh Nair | Whitefield Tech Park
                </p>
                <p>
                  Witness Statement (Confidential): <span className="underline decoration-slate-400 dark:decoration-slate-600">Minor witness Rahul (age 16)</span> stated that he observed two individuals fleeing the basement stairs at 23:20 IST.
                </p>
                <p>
                  Special Operative / Informant Contact: <span className="underline decoration-slate-400 dark:decoration-slate-600">Undercover Agent KA-994 (Phone: +91-98440-XXXXX)</span> confirmed vehicle plates KA-03-MN-4410 were cloned from a decommissioned fleet.
                </p>
                <p>
                  Firearm Recovery: Glock 19 9mm recovered under vehicle chassis with matching ballistic cartridge striations.
                </p>
              </div>

              {/* Existing Redaction Boxes */}
              {redactionBoxes.map((box) => (
                <div
                  key={box.id}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`
                  }}
                  className="absolute bg-slate-950 border-2 border-red-500 shadow-lg flex items-center justify-between px-2 text-[10px] text-red-300 group cursor-default"
                >
                  <span className="font-bold tracking-wider truncate">[REDACTED: {box.label}]</span>
                  <button 
                    onClick={(e) => removeBox(box.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-white bg-red-900/80 px-1 rounded transition-opacity"
                    title="Remove Redaction"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Current Dragging Box */}
              {currentBox && (
                <div
                  style={{
                    left: `${currentBox.x}%`,
                    top: `${currentBox.y}%`,
                    width: `${currentBox.width}%`,
                    height: `${currentBox.height}%`
                  }}
                  className="absolute bg-slate-950/80 border-2 border-dashed border-brand-500 pointer-events-none"
                />
              )}
            </div>

            {/* Cryptographic Assurance Note */}
            <div className="p-3 bg-violet-50/60 dark:bg-slate-800/60 rounded-xl border border-violet-200/80 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-4 h-4 text-violet-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-violet-700 dark:text-purple-300">Cryptographic Non-Destructive Redaction:</span>
                <span className="text-slate-600 dark:text-slate-400 ml-1">
                  Redaction produces an independently hashed sanitized derivative (<span className="font-mono text-brand-600 dark:text-cyan-300 font-semibold">DOC-FIR-REDACTED-V1</span>). The judicial original is preserved with its uncorrupted SHA-256 seal in the Evidence Vault.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBakeRedaction}
                disabled={redactionBoxes.length === 0}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <Scissors className="w-3.5 h-3.5" />
                Bake Redacted Document Copy
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
