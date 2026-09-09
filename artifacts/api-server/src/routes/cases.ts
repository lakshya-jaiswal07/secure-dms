import { Router, Request, Response } from "express";
import { db, casesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Sample in-memory fallbacks if DATABASE_URL is not set yet
let initialCases: any[] = [
  {
    id: "nv-2024-0817",
    number: "CRL.A. 0817 / 2024",
    title: "State v. Arvind Mehta",
    type: "Criminal appeal",
    court: "High Court of Delhi",
    location: "New Delhi",
    status: "Under review",
    statusTone: "amber",
    nextReview: "2024-06-18",
    updated: "2 hours ago",
    description: "Appeal challenging conviction under Section 302 IPC based on chain of custody gaps.",
    parties: ["State (Prosecution)", "Arvind Mehta (Appellant)"],
  },
  {
    id: "nv-2024-0412",
    number: "W.P.(C) 4120 / 2024",
    title: "Vanguard Tech v. Union of India",
    type: "Writ petition",
    court: "High Court of Delhi",
    location: "New Delhi",
    status: "Hearing scheduled",
    statusTone: "teal",
    nextReview: "2024-06-21",
    updated: "Yesterday",
    description: "Challenge to administrative tender cancellation and data residency compliance directives.",
    parties: ["Vanguard Tech Solutions", "Ministry of Electronics & IT"],
  },
  {
    id: "nv-2024-0109",
    number: "SPL.LEAVE 901 / 2024",
    title: "In re Forensic Audit (Cyber Cell)",
    type: "Special leave petition",
    court: "Supreme Court of India",
    location: "New Delhi",
    status: "Sealed vault",
    statusTone: "slate",
    nextReview: "2024-07-02",
    updated: "3 days ago",
    description: "Confidential financial fraud investigation with digital evidence hash signatures.",
    parties: ["Enforcement Directorate", "Apex Holdings Ltd."],
  },
];

// Helper to normalize Excel row keys into standard case fields
function mapExcelRowToCase(row: Record<string, any>) {
  const getField = (possibleKeys: string[]) => {
    for (const key of Object.keys(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const target of possibleKeys) {
        if (normalizedKey === target.toLowerCase().replace(/[^a-z0-9]/g, "")) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const number = getField(["number", "case_number", "casenumber", "case_no", "caseno", "id", "case_id"]) || `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const title = getField(["title", "case_title", "casetitle", "name", "case_name"]) || "Untitled Case";
  const type = getField(["type", "case_type", "casetype", "category"]) || "Civil Petition";
  const court = getField(["court", "court_name", "courtname", "jurisdiction"]) || "High Court of Delhi";
  const location = getField(["location", "city", "place", "state"]) || "New Delhi";
  const status = getField(["status", "case_status", "casestatus", "state"]) || "Under review";
  const description = getField(["description", "summary", "details", "notes"]) || "";
  const rawParties = getField(["parties", "parties_involved", "plaintiff_defendant", "litigants"]);

  let parties: string[] = [];
  if (Array.isArray(rawParties)) {
    parties = rawParties.map((p) => String(p));
  } else if (typeof rawParties === "string") {
    parties = rawParties.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
  }

  let statusTone: "amber" | "teal" | "slate" = "amber";
  const sLower = String(status).toLowerCase();
  if (sLower.includes("scheduled") || sLower.includes("active") || sLower.includes("open")) {
    statusTone = "teal";
  } else if (sLower.includes("sealed") || sLower.includes("closed") || sLower.includes("archived")) {
    statusTone = "slate";
  }

  return {
    number: String(number),
    title: String(title),
    type: String(type),
    court: String(court),
    location: String(location),
    status: String(status),
    statusTone,
    description: String(description),
    parties,
  };
}

// GET /api/cases - List cases
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (db) {
      const casesList = await db.select().from(casesTable);
      return res.json(casesList);
    }
    return res.json(initialCases);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// GET /api/cases/:id - Get case by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (db) {
      const found = await db.select().from(casesTable).where(eq(casesTable.id, id));
      if (found.length === 0) {
        return res.status(404).json({ error: "Case not found" });
      }
      return res.json(found[0]);
    }
    const foundLocal = initialCases.find((c) => c.id === id);
    if (!foundLocal) {
      return res.status(404).json({ error: "Case not found" });
    }
    return res.json(foundLocal);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch case detail" });
  }
});

// POST /api/cases - Create single case
router.post("/", async (req: Request, res: Response) => {
  try {
    const mapped = mapExcelRowToCase(req.body);
    if (db) {
      const inserted = await db.insert(casesTable).values(mapped).returning();
      return res.status(201).json(inserted[0]);
    }
    const newCase = {
      id: `nv-${Date.now()}`,
      ...mapped,
      nextReview: new Date().toISOString(),
      updated: "Just now",
    };
    initialCases.unshift(newCase);
    return res.status(201).json(newCase);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Invalid case data" });
  }
});

// POST /api/cases/bulk - Bulk import array of parsed case objects
router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Expected non-empty array of case objects" });
    }

    const mappedRecords = records.map((r) => mapExcelRowToCase(r));

    if (db) {
      const inserted = await db.insert(casesTable).values(mappedRecords).returning();
      return res.status(201).json({
        message: `Successfully imported ${inserted.length} case records into cloud database`,
        count: inserted.length,
        records: inserted,
      });
    }

    const createdLocal = mappedRecords.map((m, idx) => ({
      id: `nv-imported-${Date.now()}-${idx}`,
      ...m,
      nextReview: new Date().toISOString(),
      updated: "Imported via Excel",
    }));

    initialCases.unshift(...createdLocal);
    return res.status(201).json({
      message: `Successfully imported ${createdLocal.length} case records`,
      count: createdLocal.length,
      records: createdLocal,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to bulk import cases" });
  }
});

// POST /api/cases/upload-excel - Direct multipart file upload (.xlsx, .xls, .csv)
router.post("/upload-excel", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No Excel or CSV file provided in upload" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: "Uploaded workbook contains no sheets" });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

    if (rawRows.length === 0) {
      return res.status(400).json({ error: "Excel sheet contains no data rows" });
    }

    const mappedRecords = rawRows.map((row) => mapExcelRowToCase(row));

    if (db) {
      const inserted = await db.insert(casesTable).values(mappedRecords).returning();
      return res.status(201).json({
        message: `Successfully uploaded & imported ${inserted.length} case records into cloud PostgreSQL database`,
        count: inserted.length,
        records: inserted,
      });
    }

    const createdLocal = mappedRecords.map((m, idx) => ({
      id: `nv-excel-${Date.now()}-${idx}`,
      ...m,
      nextReview: new Date().toISOString(),
      updated: "Uploaded from Excel file",
    }));

    initialCases.unshift(...createdLocal);
    return res.status(201).json({
      message: `Successfully uploaded & imported ${createdLocal.length} case records from Excel file`,
      count: createdLocal.length,
      records: createdLocal,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to parse and import Excel file" });
  }
});

export default router;
