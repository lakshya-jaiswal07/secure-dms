import React, { useState } from 'react';
import { UploadCloud, FileCheck, Loader2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { computeSHA256 } from '../../utils/crypto';
import { useApp } from '../../context/AppContext';

export default function DragDropClassifier({ onDocumentAdded }) {
  const { selectedCaseId, logAudit, setCases } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [classificationState, setClassificationState] = useState(null); // analyzing, classified, ready
  const [detectedData, setDetectedData] = useState(null);

  const simulateUploadAndClassify = (fileName = "Seized_Digital_Storage_Log.pdf") => {
    setClassificationState("analyzing");
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setClassificationState("classified");
          
          // Simulated ML Classification prediction
          setDetectedData({
            fileName,
            predictedCategory: "Forensic Digital Evidence Log",
            confidence: 96.4,
            suggestedTitle: "Seized Hardware & Forensic Bitstream Log",
            extractedEntities: ["Ext-Drive-4TB", "MD5 Consensus", "Sec 65B Certificate"],
            fileSize: "4.2 MB",
            pages: 6
          });
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleConfirmIngestion = async () => {
    if (!detectedData) return;
    const computedHash = await computeSHA256(detectedData.fileName + Date.now());
    
    const newDoc = {
      id: `DOC-EVID-${Date.now().toString().slice(-4)}`,
      name: detectedData.suggestedTitle,
      category: "Forensic",
      stage: "Forensic Analysis",
      version: "v1.0",
      uploadedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + " IST",
      hash: computedHash,
      originalHash: computedHash,
      isTampered: false,
      size: detectedData.fileSize,
      pages: detectedData.pages,
      author: "Officer Ingestion Pipeline",
      status: "Verified Original",
      sparkline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      ocrConfidence: detectedData.confidence,
      ocrText: `EVIDENTIARY SEIZURE & HARDWARE BITSTREAM HASH LOG
Document Reference: ${detectedData.suggestedTitle}
Date of Ingestion: ${new Date().toISOString()}
AI Pre-Classification Confidence: ${detectedData.confidence}% (Forensic Evidence Log)
Identified Artifacts: ${detectedData.extractedEntities.join(', ')}

1. VERIFICATION SUMMARY:
Physical storage exhibit imaged under write-blocker hardware. Zero sectors corrupted.
SHA-256 Digest calculated: ${computedHash}`,
      versions: [
        {
          version: "v1.0",
          date: new Date().toLocaleDateString() + " IST",
          author: "Field Officer",
          note: "Live classification ingestion",
          diff: { added: ["Genesis ingestion"], removed: [], summary: "Initial upload" }
        }
      ],
      signatures: [],
      annotations: []
    };

    setCases(prevCases => {
      return prevCases.map(c => {
        if (c.id !== selectedCaseId) return c;
        return {
          ...c,
          documents: [newDoc, ...c.documents]
        };
      });
    });

    logAudit("DOC_INGESTED_AI_CLASSIFIED", `Ingested ${newDoc.name} via AI classifier (${detectedData.confidence}% confidence)`, "SUCCESS", newDoc.id);

    setClassificationState(null);
    setUploadProgress(0);
    setDetectedData(null);
    if (onDocumentAdded) onDocumentAdded(newDoc.id);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            AI Ingestion & Classification Dropzone
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Auto-identifies FIR, Forensic, Bail Memos & Charge Sheets
        </span>
      </div>

      {classificationState === null ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            simulateUploadAndClassify(file ? file.name : "Forensic_Seizure_Record.pdf");
          }}
          onClick={() => simulateUploadAndClassify("SFSL_Ballistics_Annexure.pdf")}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' 
              : 'border-slate-200 hover:border-brand-500/60 dark:border-slate-700 dark:hover:border-cyan-500/60 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-850/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-cyan-400 mb-2.5 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Drag & drop evidentiary PDF or image here, or <span className="text-brand-600 dark:text-cyan-400 underline">click to simulate drop</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Real-time optical layout inspection & automated category prediction
          </p>
        </div>
      ) : classificationState === "analyzing" ? (
        <div className="p-6 text-center">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-200 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * uploadProgress) / 100}
                className="text-brand-600 dark:text-cyan-400 transition-all duration-300"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-brand-700 dark:text-cyan-300">
              {uploadProgress}%
            </span>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600 dark:text-cyan-400" />
            Analyzing Document Geometry, Watermarks & Typography...
          </p>
        </div>
      ) : (
        /* Morph into Predicted Label Preview */
        <div className="p-4 bg-brand-50/50 dark:bg-cyan-950/20 border border-brand-200 dark:border-cyan-500/40 rounded-xl animate-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-500/15 text-brand-600 dark:text-cyan-400 rounded-xl border border-brand-500/25">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-700 dark:text-cyan-300 font-semibold border border-brand-500/25">
                    Looks like: {detectedData?.predictedCategory}
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {detectedData?.confidence}% confidence
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {detectedData?.suggestedTitle}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Extracted key entities: {detectedData?.extractedEntities.join(" • ")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
            <button
              onClick={() => { setClassificationState(null); setDetectedData(null); }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmIngestion}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm & Ingest into Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
