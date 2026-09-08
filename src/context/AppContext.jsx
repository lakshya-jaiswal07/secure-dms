import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCases, mockChainOfCustody, mockBlockchainLedger, mockAuditLogs, mockGeoAccessPoints } from '../data/mockData';
import { translations } from '../i18n/translations';
import { computeSHA256 } from '../utils/crypto';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cases, setCases] = useState(mockCases);
  const [selectedCaseId, setSelectedCaseId] = useState("CR-2026-0842");
  const [activeTab, setActiveTab] = useState("command"); // command, pipeline, viewer, custody, ledger, audit, capture
  const [role, setRole] = useState("police"); // police, forensic, legal, auditor
  const [lang, setLang] = useState("en"); // en, hi, kn
  const [theme, setTheme] = useState("dark"); // dark (War Room), light (Institutional)
  
  // Selected document inside the unified viewer
  const [selectedDocId, setSelectedDocId] = useState("DOC-FIR-0842");

  // Audit Logs & Blockchain
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [chainOfCustody, setChainOfCustody] = useState(mockChainOfCustody);
  const [blockchainLedger, setBlockchainLedger] = useState(mockBlockchainLedger);

  // Modals & Drawers
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isSecurityDrawerOpen, setIsSecurityDrawerOpen] = useState(false);

  // Search & Semantic Filter Chips
  const [searchQuery, setSearchQuery] = useState("");
  const [searchChips, setSearchChips] = useState([]);
  const [activeSavedFilter, setActiveSavedFilter] = useState(null);

  // Active Case Helper
  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const currentDoc = currentCase?.documents?.find(d => d.id === selectedDocId) || currentCase?.documents?.[0];

  const t = translations[lang] || translations.en;

  // Toggle Dark/Light Theme on documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Log an audit action
  const logAudit = (action, details, severity = "INFO", docId = selectedDocId) => {
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString() + " IST",
      user: role === 'police' ? 'Insp. Rajesh Kulkarni' : role === 'forensic' ? 'Dr. Ananya Sharma' : role === 'legal' ? 'Adv. M. S. Rao' : 'Auditor General',
      role: t.roles[role] || role,
      action,
      severity,
      color: severity === 'CRITICAL' ? 'red' : severity === 'SUCCESS' ? 'amber' : 'gray',
      documentId: docId,
      caseId: selectedCaseId,
      ip: '10.24.8.91 (Local Host)',
      location: 'Bengaluru, India',
      device: 'macOS M3 • Sentinel Client',
      status: 'AUTHORIZED',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Tamper Simulation Toggle for a document
  const toggleTamperDocument = (docId) => {
    setCases(prevCases => {
      return prevCases.map(c => {
        if (c.id !== selectedCaseId) return c;
        const updatedDocs = c.documents.map(d => {
          if (d.id !== docId) return d;
          const willTamper = !d.isTampered;
          return {
            ...d,
            isTampered: willTamper,
            hash: willTamper 
              ? "d41d8cd98f00b204e9800998ecf8427e00000000000000000000000000000000" // corrupted hash
              : d.originalHash,
            status: willTamper ? "TAMPERED / INTEGRITY BREACH" : "Verified Original",
            sparkline: willTamper 
              ? [...d.sparkline.slice(0, -1), 22] 
              : [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
          };
        });
        return { ...c, documents: updatedDocs };
      });
    });

    const isNowTampered = !currentDoc?.isTampered;
    if (isNowTampered) {
      logAudit("TAMPER_INJECTION", `Simulated cryptographic corruption detected in byte segment 0x4F of ${docId}`, "CRITICAL", docId);
    } else {
      logAudit("INTEGRITY_RESTORED", `Document integrity restored to genesis hash for ${docId}`, "SUCCESS", docId);
    }
  };

  // Add a wax seal signature to document
  const addWaxSealSignature = (docId, signatureData) => {
    setCases(prevCases => {
      return prevCases.map(c => {
        if (c.id !== selectedCaseId) return c;
        const updatedDocs = c.documents.map(d => {
          if (d.id !== docId) return d;
          return {
            ...d,
            signatures: [...(d.signatures || []), signatureData],
            status: "Verified & Countersigned"
          };
        });
        return { ...c, documents: updatedDocs };
      });
    });

    // Record on blockchain ledger
    const newBlock = {
      blockNumber: blockchainLedger[0].blockNumber + 1,
      timestamp: new Date().toISOString(),
      docId,
      caseId: selectedCaseId,
      eventType: "DIGITAL_WAX_SEAL_STAMP",
      blockHash: "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      previousHash: blockchainLedger[0].blockHash,
      merkleRoot: "0x" + Math.random().toString(16).slice(2),
      docHash: currentDoc?.hash || "e3b0c442...",
      validatorNodes: ["State Police Cyber Node #2", "High Court Node #1"],
      gasUsed: "0.0035 ETH (Private Consortium PoA)"
    };
    setBlockchainLedger(prev => [newBlock, ...prev]);

    logAudit("WAX_SEAL_SIGNATURE", `Affixed digital wax seal [${signatureData.waxSealType}] by ${signatureData.signerName}`, "SUCCESS", docId);
  };

  // Add document annotation
  const addAnnotation = (docId, annotation) => {
    setCases(prevCases => {
      return prevCases.map(c => {
        if (c.id !== selectedCaseId) return c;
        const updatedDocs = c.documents.map(d => {
          if (d.id !== docId) return d;
          return {
            ...d,
            annotations: [...(d.annotations || []), annotation]
          };
        });
        return { ...c, documents: updatedDocs };
      });
    });
    logAudit("INLINE_ANNOTATION_ADDED", `Annotated page ${annotation.page}: "${annotation.text.slice(0, 30)}..."`, "INFO", docId);
  };

  // Update Case Stage (Kanban Drag)
  const updateCaseStage = (caseId, newStageIndex) => {
    const stageNames = [
      "FIR Registered",
      "Active Investigation",
      "Forensic Analysis",
      "Charge Sheet Drafted",
      "Court Order & Trial",
      "Archived / Closed"
    ];
    setCases(prevCases => {
      return prevCases.map(c => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          currentStageIndex: newStageIndex,
          status: stageNames[newStageIndex]
        };
      });
    });
    logAudit("CASE_STAGE_TRANSITION", `Moved Case ${caseId} to stage [${stageNames[newStageIndex]}]`, "SUCCESS");
  };

  return (
    <AppContext.Provider
      value={{
        cases,
        setCases,
        selectedCaseId,
        setSelectedCaseId,
        currentCase,
        selectedDocId,
        setSelectedDocId,
        currentDoc,
        activeTab,
        setActiveTab,
        role,
        setRole,
        lang,
        setLang,
        theme,
        setTheme,
        auditLogs,
        logAudit,
        chainOfCustody,
        blockchainLedger,
        isBioModalOpen,
        setIsBioModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isCaptureModalOpen,
        setIsCaptureModalOpen,
        isSecurityDrawerOpen,
        setIsSecurityDrawerOpen,
        searchQuery,
        setSearchQuery,
        searchChips,
        setSearchChips,
        activeSavedFilter,
        setActiveSavedFilter,
        toggleTamperDocument,
        addWaxSealSignature,
        addAnnotation,
        updateCaseStage,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
