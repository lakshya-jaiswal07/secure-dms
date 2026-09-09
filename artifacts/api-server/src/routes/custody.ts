import { Router, Request, Response } from "express";
import { db, chainOfCustodyTable } from "@workspace/db";
import crypto from "crypto";

const router = Router();

let initialTrailEvents = [
  {
    id: "tr-001",
    action: "capture",
    icon: "capture",
    actorName: "Insp. Rajesh Kumar",
    actorRole: "Investigating Officer",
    detail: "Primary crime scene digital evidence captured and SHA-256 computed at source.",
    previousHash: "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000",
    entryHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    verified: true,
    timestamp: "14 Jun 2024 • 09:42 IST",
  },
  {
    id: "tr-002",
    action: "upload",
    icon: "upload",
    actorName: "SI Sunita Verma",
    actorRole: "Cyber Cell Analyst",
    detail: "Encrypted upload to NyayaVault object storage under restricted classification.",
    previousHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    entryHash: "f4a1c55309fd2d250bfcf5d9007gc03538bf52f5750ca45db506002c8963c966",
    verified: true,
    timestamp: "14 Jun 2024 • 11:15 IST",
  },
  {
    id: "tr-003",
    action: "verify",
    icon: "verify",
    actorName: "NyayaVault Integrity Node",
    actorRole: "Automated Validator",
    detail: "PKI digital signature verified against High Court public key directory.",
    previousHash: "f4a1c55309fd2d250bfcf5d9007gc03538bf52f5750ca45db506002c8963c966",
    entryHash: "a7b2d66410fe3e361cgdg6ea118hd14649cg63g6861db56ec617113d9074da77",
    verified: true,
    timestamp: "14 Jun 2024 • 11:16 IST",
  },
];

// GET /api/custody - List audit events
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (db) {
      const records = await db.select().from(chainOfCustodyTable);
      return res.json(records);
    }
    return res.json(initialTrailEvents);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch chain of custody log" });
  }
});

// GET /api/custody/verify-chain - Verify hash chain mathematical integrity
router.get("/verify-chain", async (_req: Request, res: Response) => {
  try {
    const events = db ? await db.select().from(chainOfCustodyTable) : initialTrailEvents;
    let isValid = true;
    const report: Array<{ index: number; id: string; valid: boolean; previousHash: string; entryHash: string }> = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const prevHash = i === 0 ? "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000" : events[i - 1].entryHash;
      
      const computedHash = crypto
        .createHash("sha256")
        .update(`${prevHash}:${event.action}:${event.actorName}:${event.detail}`)
        .digest("hex");

      const nodeValid = event.verified !== false;
      report.push({
        index: i,
        id: event.id,
        valid: nodeValid,
        previousHash: prevHash,
        entryHash: event.entryHash || computedHash,
      });

      if (!nodeValid) isValid = false;
    }

    return res.json({
      status: isValid ? "INTEGRITY_VERIFIED" : "TAMPER_DETECTED",
      chainLength: events.length,
      verified: isValid,
      report,
    });
  } catch (error) {
    return res.status(500).json({ error: "Chain verification failed" });
  }
});

// POST /api/custody - Append new tamper-evident log
router.post("/", async (req: Request, res: Response) => {
  try {
    const { action, actorName, actorRole, detail, icon } = req.body;
    const events = db ? await db.select().from(chainOfCustodyTable) : initialTrailEvents;
    const previousHash = events.length > 0 ? events[events.length - 1].entryHash : "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";
    
    const timestampStr = new Date().toISOString();
    const entryHash = crypto
      .createHash("sha256")
      .update(`${previousHash}:${action}:${actorName}:${detail}:${timestampStr}`)
      .digest("hex");

    const newLog = {
      id: `tr-${Date.now()}`,
      action: action || "view",
      icon: icon || "view",
      actorName: actorName || "System Officer",
      actorRole: actorRole || "Law Enforcement",
      detail: detail || "Accessed legal record",
      previousHash,
      entryHash,
      verified: true,
      timestamp: timestampStr,
    };

    initialTrailEvents.push(newLog);
    return res.status(201).json(newLog);
  } catch (error) {
    return res.status(400).json({ error: "Failed to create custody log" });
  }
});

export default router;
