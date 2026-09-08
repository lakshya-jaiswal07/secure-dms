export const mockCases = [
  {
    id: "CR-2026-0842",
    title: "State of Karnataka vs. Vikram Malhotra & Ors.",
    subtitle: "Cyber Financial Embezzlement & Homicide Conspiracy",
    priority: "CRITICAL",
    status: "Forensic Analysis",
    station: "Whitefield Sub-Division, Bengaluru",
    firNumber: "FIR-0842/2026",
    statutoryDaysRemaining: 48,
    totalStatutoryDays: 90,
    currentStageIndex: 2, // 0: FIR, 1: Investigation, 2: Forensic, 3: Charge Sheet, 4: Court Order, 5: Archived
    assignedIO: {
      name: "Insp. Rajesh Kulkarni",
      badge: "KA-BLR-4892",
      station: "Whitefield PS",
      avatar: "RK"
    },
    people: [
      { role: "Investigating Officer", name: "Insp. Rajesh Kulkarni", dept: "Bengaluru City Police" },
      { role: "Forensic Pathologist", name: "Dr. Ananya Sharma", dept: "SFSL Madiwala" },
      { role: "Special Prosecutor", name: "Adv. M. S. Rao", dept: "High Court of Karnataka" },
      { role: "Presiding Magistrate", name: "Hon. Justice P. Hegde", dept: "Court Hall 4, Sessions" },
      { role: "Prime Accused", name: "Vikram Malhotra", dept: "In Judicial Custody (Parappana Agrahara)" }
    ],
    summary: "FIR 0842/2026 initiated following discovery of deceased tech executive Anand Verma at ITPL Tech Park, Whitefield. Investigation recovered modified 9mm casing matching registered firearm of suspect Vikram Malhotra, alongside encrypted Coldcard hardware wallet storing 42 BTC linked to shell corporations in Dubai. Seizure verified under digital chain-of-custody. Awaiting final ballistics coefficient certification before filing comprehensive charge sheet under Section 302/420 IPC and Section 66 IT Act.",
    missingDocumentAlerts: [
      {
        id: "alert-1",
        level: "CRITICAL",
        title: "Missing Forensic Countersign",
        message: "Draft Charge Sheet has been generated under Sec. 302 IPC, but Ballistics Forensic Report SFSL-BLR-2026-904 lacks final legal countersignature.",
        requiredAction: "Requires Legal Officer or Forensic Lead Sign-off"
      },
      {
        id: "alert-2",
        level: "WARNING",
        title: "Statutory Bail Countdown",
        message: "48 days elapsed of 90-day statutory custody window. Medical Examiner Toxicology Annexure B is still pending lab submission.",
        requiredAction: "Expedite SFSL Toxicology Lab clearance"
      }
    ],
    documents: [
      {
        id: "DOC-FIR-0842",
        name: "First Information Report (FIR-0842/2026)",
        category: "FIR",
        stage: "FIR Registered",
        version: "v2.0",
        uploadedAt: "2026-08-10 08:45 IST",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        originalHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        isTampered: false,
        size: "2.4 MB",
        pages: 4,
        author: "Sub-Insp. S. Murthy",
        status: "Verified Original",
        sparkline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        ocrConfidence: 98.4,
        ocrText: `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C. / Sec 173 BNSS)
District: BENGALURU CITY | Police Station: WHITEFIELD SUB-DIVISION
FIR No: 0842/2026 | Date & Hour of Occurrence: 09/08/2026 at 23:15 IST
Acts & Sections: Section 302, 420, 120B IPC r/w Sec 66C Information Technology Act 2000

1. Complainant / Informant:
   Name: Security Officer Dinesh Nair | Whitefield Tech Park Tower 3
2. Details of Known / Suspected / Unknown Accused with Full Particulars:
   Accused 1: Vikram Malhotra, Director, Aethelgard FinTech Pvt Ltd
   Accused 2: Unknown associate operating remote proxy IP 185.220.101.4
3. Place of Occurrence:
   Basement Level B2, Executive Parking Suite, ITPL Main Rd, Whitefield
4. Narrative & Initial Brief:
   At 23:25 hrs on 09/08/2026, security personnel discovered deceased male identified as Anand Verma inside vehicle KA-03-MN-4410. Two spent 9mm cartridge casings recovered near driver door. High-capacity encrypted storage drive seized from victim's laptop bag.

Signed & Verified:
Inspector Rajesh Kulkarni, Investigating Officer`,
        versions: [
          {
            version: "v1.0",
            date: "2026-08-10 08:45 IST",
            author: "Sub-Insp. S. Murthy",
            note: "Initial station entry",
            diff: {
              added: [],
              removed: [],
              summary: "Original document ingestion at station desk"
            }
          },
          {
            version: "v1.1",
            date: "2026-08-12 14:20 IST",
            author: "Insp. Rajesh Kulkarni",
            note: "Added Section 66C IT Act & Second Accused Proxy IP",
            diff: {
              added: ["r/w Sec 66C Information Technology Act 2000", "Accused 2: Unknown associate operating remote proxy IP 185.220.101.4"],
              removed: [],
              summary: "Invoked cyber offenses following preliminary triage of seized hard drive"
            }
          },
          {
            version: "v2.0",
            date: "2026-08-16 19:10 IST",
            author: "Adv. M. S. Rao (Prosecution)",
            note: "Judicial verification & high court registrar endorsement",
            diff: {
              added: ["Judicial Seal: Registrar High Court Evidence Depository - Verified Authenticity"],
              removed: [],
              summary: "Formal judicial deposition stamping"
            }
          }
        ],
        signatures: [
          {
            signerName: "Insp. Rajesh Kulkarni",
            role: "Investigating Officer",
            badge: "KA-BLR-4892",
            timestamp: "2026-08-10T09:30:00Z",
            waxSealType: "crimson-police",
            hashSignature: "sig_rsa_4096_7a9f4c3b2e"
          }
        ],
        annotations: [
          {
            id: "anno-1",
            author: "Adv. M. S. Rao",
            role: "Legal Officer",
            page: 1,
            x: 62,
            y: 28,
            text: "Ensure ballistics cartridge batch match is verified against suspect's license armory ledger.",
            timestamp: "2026-08-14 11:30",
            resolved: false
          }
        ]
      },
      {
        id: "DOC-SFSL-904",
        name: "Forensic Ballistics & Digital Hardware Report",
        category: "Forensic",
        stage: "Forensic Analysis",
        version: "v1.0",
        uploadedAt: "2026-08-20 16:30 IST",
        hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        originalHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        isTampered: false,
        size: "5.8 MB",
        pages: 12,
        author: "Dr. Ananya Sharma (Lead Ballistics)",
        status: "Pending Legal Sign-off",
        sparkline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        ocrConfidence: 99.2,
        ocrText: `STATE FORENSIC SCIENCE LABORATORY (SFSL)
GOVERNMENT OF KARNATAKA | MADIWALA, BENGALURU
Lab Case Ref: SFSL/BLR/BAL-CYB/2026/0904
Forwarding Authority: Superintendent of Police / IO Insp. Rajesh Kulkarni

EXHIBIT ANALYSIS REPORT
Exhibit 1: One 9x19mm Parabellum spent cartridge casing marked 'Ex-A1'
Exhibit 2: One Coldcard Mk4 Hardware Bitcoin Storage Device marked 'Ex-B1'

1. BALLISTICS EXAMINATION:
Microscopic comparison of firing pin indentations on Exhibit Ex-A1 against test firings from Glock 19 (Serial #G19-IND-88402) seized from accused Vikram Malhotra yielded matching micro-striae in 14 continuous lands and grooves. Firing pin impression match certainty exceeds 99.7%.

2. HARDWARE MEMORY EXTRACTION:
Coldcard secure element pin locked. Side-channel physical memory dump performed in clean-room chamber. Recovered transaction records detailing transfer of 42.500 BTC to Seychelles escrow on 09/08/2026 at 22:48 IST (27 minutes prior to homicide).

Certification under Sec 65B Indian Evidence Act / Sec 63 Bharatiya Sakshya Adhiniyam:
Dr. Ananya Sharma, Senior Scientific Officer (Forensics)`,
        versions: [
          {
            version: "v1.0",
            date: "2026-08-20 16:30 IST",
            author: "Dr. Ananya Sharma",
            note: "Initial SFSL laboratory findings",
            diff: { added: [], removed: [], summary: "Complete laboratory physical & digital extraction" }
          }
        ],
        signatures: [
          {
            signerName: "Dr. Ananya Sharma",
            role: "Forensic Analyst",
            badge: "SFSL-BAL-88",
            timestamp: "2026-08-20T17:00:00Z",
            waxSealType: "emerald-forensic",
            hashSignature: "sig_ecdsa_p384_90382d"
          }
        ],
        annotations: []
      },
      {
        id: "DOC-CHG-104",
        name: "Final Police Investigation Charge Sheet",
        category: "Charge Sheet",
        stage: "Charge Sheet Drafted",
        version: "v1.0-draft",
        uploadedAt: "2026-08-29 11:15 IST",
        hash: "3b9a7c8812e345f09abce4567890123456789abcdef0123456789abcdef01234",
        originalHash: "3b9a7c8812e345f09abce4567890123456789abcdef0123456789abcdef01234",
        isTampered: false,
        size: "8.1 MB",
        pages: 38,
        author: "Adv. M. S. Rao & Insp. Rajesh Kulkarni",
        status: "Under Scrutiny",
        sparkline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        ocrConfidence: 97.9,
        ocrText: `IN THE COURT OF THE PRINCIPAL SESSIONS JUDGE, BENGALURU
CHARGE SHEET UNDER SECTION 173 Cr.P.C. / SEC 193 BNSS
Police Station: Whitefield Sub-Division | Crime No: 842/2026

STATE OF KARNATAKA (Through Inspector of Police, Whitefield)
VERSUS
VIKRAM MALHOTRA, S/O K. L. Malhotra, Age 41 yrs, R/o Sadashivanagar, Bengaluru

CHARGE SUMMARY:
The accused stands charged with offenses punishable under:
1. Section 302 IPC (Murder)
2. Section 420 IPC (Cheating & Dishonestly Inducing Delivery of Property)
3. Section 120B IPC (Criminal Conspiracy)
4. Section 66C & 66D IT Act 2000 (Identity Theft & Computer Fraud)

Evidentiary Attachments:
- Annexure A: SFSL Ballistics Casing Micro-Spectroscopy Match
- Annexure B: Coldcard Blockchain Forensic Ledger Dump
- Annexure C: CCTV Surveillance Corridor 4 B2 ITPL Footage MD5/SHA256 Logs`,
        versions: [
          {
            version: "v1.0-draft",
            date: "2026-08-29 11:15 IST",
            author: "Insp. Rajesh Kulkarni",
            note: "Initial scrutiny draft submitted to Prosecution Office",
            diff: { added: [], removed: [], summary: "Initial drafting of statutory charge parameters" }
          }
        ],
        signatures: [],
        annotations: []
      }
    ]
  },
  {
    id: "CR-2026-0719",
    title: "Indira Nagar Commercial Vault Cyber Penetration",
    subtitle: "Hardware Keylogger & Unauthorized Core Banking Wire",
    priority: "HIGH",
    status: "Charge Sheet Drafted",
    station: "Indira Nagar Sub-Division, Bengaluru",
    firNumber: "FIR-0719/2026",
    statutoryDaysRemaining: 18,
    totalStatutoryDays: 90,
    currentStageIndex: 3,
    assignedIO: {
      name: "Insp. Shweta Rao",
      badge: "KA-BLR-3109",
      station: "Cyber Crime Cell",
      avatar: "SR"
    },
    people: [
      { role: "Investigating Officer", name: "Insp. Shweta Rao", dept: "Cyber Crime Police Station" },
      { role: "Lead Prosecutor", name: "Adv. K. Parthasarathy", dept: "Sessions Court" }
    ],
    summary: "Commercial bank vault physical sensor bypass orchestrated using custom FPGA bus injector. 14.8 Crores INR intercepted in escrow. Suspect detained at Kempegowda Airport.",
    missingDocumentAlerts: [],
    documents: []
  },
  {
    id: "CR-2026-0901",
    title: "Electronic City Semiconductor Patent Exfiltration",
    subtitle: "Industrial Espionage via Covert Satellite Uplink",
    priority: "MEDIUM",
    status: "Active Investigation",
    station: "Electronic City PS, Bengaluru",
    firNumber: "FIR-0901/2026",
    statutoryDaysRemaining: 74,
    totalStatutoryDays: 90,
    currentStageIndex: 1,
    assignedIO: {
      name: "Sub-Insp. N. Chetan",
      badge: "KA-BLR-7721",
      station: "Electronic City PS",
      avatar: "NC"
    },
    people: [
      { role: "Investigating Officer", name: "Sub-Insp. N. Chetan", dept: "Electronic City PS" }
    ],
    summary: "Seizure of illicit transceiver nodes mounted on HVAC vents. Forensic memory dumps in progress.",
    missingDocumentAlerts: [],
    documents: []
  }
];

export const mockChainOfCustody = [
  {
    id: "COC-01",
    title: "Evidence Seizure & Station Ingestion",
    actor: "Insp. Rajesh Kulkarni",
    role: "Investigating Officer",
    badge: "KA-BLR-4892",
    facility: "Crime Scene / Whitefield PS Locker Room",
    timestamp: "2026-08-10 09:30 IST",
    action: "PHYSICAL_SEIZURE",
    status: "Verified",
    hashAtTransfer: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sealNumber: "KA-POL-SEAL-8849-RED",
    notes: "Cartridge casings placed in tamper-evident sealed container. Barcode #8849 affixed with biometric thumbprint.",
    verifiedBy: "Sub-Insp. S. Murthy (Station Duty Officer)"
  },
  {
    id: "COC-02",
    title: "Station Evidence Vault Deposit",
    actor: "ASI Anand Deshmukh",
    role: "Malkhana / Evidence Custodian",
    badge: "KA-BLR-1204",
    facility: "Whitefield Sub-Division Vault 2A",
    timestamp: "2026-08-11 14:15 IST",
    action: "SECURE_VAULT_DEPOSIT",
    status: "Verified",
    hashAtTransfer: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sealNumber: "KA-POL-SEAL-8849-RED",
    notes: "Verified seal intact under dual-custody log book entry #412. Vault biometric lock engaged.",
    verifiedBy: "Insp. Rajesh Kulkarni"
  },
  {
    id: "COC-03",
    title: "Forensic Laboratory Intake & Custody",
    actor: "Dr. Ananya Sharma",
    role: "Senior Scientific Officer",
    badge: "SFSL-BAL-88",
    facility: "State Forensic Science Lab (SFSL), Madiwala",
    timestamp: "2026-08-15 11:00 IST",
    action: "LAB_TESTING_INGESTION",
    status: "Verified",
    hashAtTransfer: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sealNumber: "SFSL-INTAKE-2026-1094",
    notes: "Seal #8849 inspected with zero micro-fractures. Ingested into ballistic comparator chamber #3.",
    verifiedBy: "Scientific Assistant V. Gowda"
  },
  {
    id: "COC-04",
    title: "Legal Scrutiny & Evidentiary Review",
    actor: "Adv. M. S. Rao",
    role: "Special Public Prosecutor",
    badge: "KBC-PROS-2011-54",
    facility: "Office of Director of Prosecutions, High Court Complex",
    timestamp: "2026-08-28 16:45 IST",
    action: "LEGAL_SCRUTINY_TRANSFER",
    status: "Verified",
    hashAtTransfer: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sealNumber: "JUD-PROS-SEAL-771",
    notes: "Certified digital hash matches state ledger. Approved for inclusion in Formal Charge Sheet Annexure.",
    verifiedBy: "Prosecution Registrar K. Narayan"
  },
  {
    id: "COC-05",
    title: "Judicial Deposit & Evidence Vault Hall 4",
    actor: "Registrar P. S. Bhat",
    role: "Judicial Evidence Registrar",
    badge: "HC-REG-993",
    facility: "Principal Sessions Court Vault, Mayo Hall",
    timestamp: "2026-09-02 10:20 IST",
    action: "JUDICIAL_DEPOSIT",
    status: "Active Custody",
    hashAtTransfer: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sealNumber: "HC-EVID-VAULT-2026-993",
    notes: "Formally admitted as Judicial Exhibit P-1. Immutably logged onto Karnataka Judiciary Consortium Ledger.",
    verifiedBy: "Hon. Magistrate Justice P. Hegde"
  }
];

export const mockBlockchainLedger = [
  {
    blockNumber: 1048,
    timestamp: "2026-09-02T10:20:14Z",
    docId: "DOC-FIR-0842",
    caseId: "CR-2026-0842",
    eventType: "JUDICIAL_EXHIBIT_ADMISSION",
    blockHash: "0x89ab12cd34ef567890123456789abcdef0123456789abcdef0123456789abcde",
    previousHash: "0x789012abcdef34567890123456789abcdef0123456789abcdef0123456789abcd",
    merkleRoot: "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    docHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    validatorNodes: ["High Court Node #1", "SFSL Bangalore Node #3", "State Police Cyber Node #2"],
    gasUsed: "0.0042 ETH (Private Consortium PoA)"
  },
  {
    blockNumber: 1047,
    timestamp: "2026-08-29T11:15:30Z",
    docId: "DOC-CHG-104",
    caseId: "CR-2026-0842",
    eventType: "CHARGE_SHEET_DRAFT_LOCK",
    blockHash: "0x789012abcdef34567890123456789abcdef0123456789abcdef0123456789abcd",
    previousHash: "0x678901abcdef234567890123456789abcdef0123456789abcdef0123456789abcd",
    merkleRoot: "0x3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
    docHash: "3b9a7c8812e345f09abce4567890123456789abcdef0123456789abcdef01234",
    validatorNodes: ["High Court Node #1", "State Police Cyber Node #2"],
    gasUsed: "0.0038 ETH (Private Consortium PoA)"
  },
  {
    blockNumber: 1046,
    timestamp: "2026-08-20T16:30:22Z",
    docId: "DOC-SFSL-904",
    caseId: "CR-2026-0842",
    eventType: "FORENSIC_CERTIFICATE_INGESTION",
    blockHash: "0x678901abcdef234567890123456789abcdef0123456789abcdef0123456789abcd",
    previousHash: "0x567890abcdef1234567890123456789abcdef0123456789abcdef0123456789abcd",
    merkleRoot: "0x23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
    docHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    validatorNodes: ["SFSL Bangalore Node #3", "State Police Cyber Node #2"],
    gasUsed: "0.0041 ETH (Private Consortium PoA)"
  },
  {
    blockNumber: 1045,
    timestamp: "2026-08-16T19:10:05Z",
    docId: "DOC-FIR-0842",
    caseId: "CR-2026-0842",
    eventType: "VERSION_V2_SEAL_UPDATE",
    blockHash: "0x567890abcdef1234567890123456789abcdef0123456789abcdef0123456789abcd",
    previousHash: "0x456789abcdef01234567890123456789abcdef0123456789abcdef0123456789abcd",
    merkleRoot: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    docHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    validatorNodes: ["High Court Node #1", "State Police Cyber Node #2"],
    gasUsed: "0.0039 ETH (Private Consortium PoA)"
  },
  {
    blockNumber: 1044,
    timestamp: "2026-08-10T08:45:00Z",
    docId: "DOC-FIR-0842",
    caseId: "CR-2026-0842",
    eventType: "GENESIS_FIR_REGISTRATION",
    blockHash: "0x456789abcdef01234567890123456789abcdef0123456789abcdef0123456789abcd",
    previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    merkleRoot: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    docHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    validatorNodes: ["State Police Cyber Node #2"],
    gasUsed: "0.0050 ETH (Private Consortium PoA)"
  }
];

export const mockAuditLogs = [
  {
    id: "AUD-991",
    timestamp: "2026-09-08 17:42:10 IST",
    user: "Insp. Rajesh Kulkarni",
    role: "Investigating Officer",
    action: "VIEW_DOCUMENT",
    severity: "INFO",
    color: "gray",
    documentId: "DOC-FIR-0842",
    caseId: "CR-2026-0842",
    ip: "10.24.8.91 (Intranet)",
    location: "Bengaluru, India",
    device: "macOS M3 • Chrome 128",
    status: "AUTHORIZED",
    details: "Viewed split-pane OCR inspection panel for FIR-0842"
  },
  {
    id: "AUD-990",
    timestamp: "2026-09-08 16:15:02 IST",
    user: "Unknown Foreign Actor",
    role: "Unauthenticated Guest",
    action: "UNAUTHORIZED_DOWNLOAD_ATTEMPT",
    severity: "CRITICAL",
    color: "red",
    documentId: "DOC-SFSL-904",
    caseId: "CR-2026-0842",
    ip: "185.220.101.44 (Tor Exit Relay)",
    location: "Frankfurt, Germany",
    device: "Linux x86_64 • Headless Chrome",
    status: "BLOCKED_FIREWALL",
    details: "Zero-Trust Perimeter blocked unauthorized token bypass attempt on ballistics report"
  },
  {
    id: "AUD-989",
    timestamp: "2026-09-07 11:20:44 IST",
    user: "Dr. Ananya Sharma",
    role: "Forensic Analyst",
    action: "CERTIFICATE_SIGNATURE",
    severity: "SUCCESS",
    color: "amber",
    documentId: "DOC-SFSL-904",
    caseId: "CR-2026-0842",
    ip: "10.18.2.14 (SFSL LAN)",
    location: "Madiwala, Bengaluru",
    device: "Windows 11 Enterprise • SFSL Workstation 4",
    status: "AUTHORIZED",
    details: "Affixed cryptographic Wax Seal & ECDSA digital signature to Ballistics Report"
  },
  {
    id: "AUD-988",
    timestamp: "2026-09-06 14:05:12 IST",
    user: "Adv. M. S. Rao",
    role: "Legal Officer",
    action: "TIME_BOXED_SHARE_CREATED",
    severity: "INFO",
    color: "blue",
    documentId: "DOC-FIR-0842",
    caseId: "CR-2026-0842",
    ip: "10.32.1.80 (High Court LAN)",
    location: "High Court, Bengaluru",
    device: "iPad Pro • Safari 18.1",
    status: "AUTHORIZED",
    details: "Generated 2-hour encrypted guest link for Directorate of Forensic Science Services"
  },
  {
    id: "AUD-987",
    timestamp: "2026-09-05 09:12:33 IST",
    user: "System Daemon (Integrity Watch)",
    role: "Automated Auditor",
    action: "MERKLE_TREE_VERIFICATION",
    severity: "INFO",
    color: "emerald",
    documentId: "ALL_DOCUMENTS",
    caseId: "CR-2026-0842",
    ip: "127.0.0.1 (Local Sentinel Daemon)",
    location: "State Police Server Hall",
    device: "Sentinel Core v3.4 Engine",
    status: "VERIFIED_OK",
    details: "Periodic batch SHA-256 integrity verification: All 1,480 hashes matched consensus root"
  },
  {
    id: "AUD-986",
    timestamp: "2026-09-04 22:40:19 IST",
    user: "SecOps Threat Engine",
    role: "AI Security Daemon",
    action: "GEO_ANOMALY_FLAG",
    severity: "WARNING",
    color: "red",
    documentId: "DOC-CHG-104",
    caseId: "CR-2026-0842",
    ip: "82.165.197.1 (Commercial VPN)",
    location: "London, UK",
    device: "Android 14 • Chrome Mobile",
    status: "FLAGGED_INVESTIGATION",
    details: "Out-of-jurisdiction credential ping using retired officer token KA-BLR-0941"
  }
];

export const mockGeoAccessPoints = [
  {
    name: "Bengaluru City Police HQ (Infantry Rd)",
    lat: 12.9716,
    lng: 77.5946,
    type: "SECURE_FACILITY",
    pings: 428,
    status: "NORMAL",
    city: "Bengaluru, Karnataka"
  },
  {
    name: "State Forensic Science Lab (SFSL Madiwala)",
    lat: 12.9226,
    lng: 77.6174,
    type: "FORENSIC_LAB",
    pings: 194,
    status: "NORMAL",
    city: "Bengaluru, Karnataka"
  },
  {
    name: "Whitefield Police Sub-Division",
    lat: 12.9698,
    lng: 77.7499,
    type: "STATION_DESK",
    pings: 312,
    status: "NORMAL",
    city: "Whitefield, Bengaluru"
  },
  {
    name: "High Court of Karnataka (Principal Bench)",
    lat: 12.9784,
    lng: 77.5913,
    type: "JUDICIAL_BENCH",
    pings: 88,
    status: "NORMAL",
    city: "Bengaluru, Karnataka"
  },
  {
    name: "Frankfurt Tor Gateway (Suspicious Origin)",
    lat: 50.1109,
    lng: 8.6821,
    type: "ANOMALOUS_EXTERNAL",
    pings: 2,
    status: "BLOCKED",
    city: "Frankfurt, Germany"
  }
];
