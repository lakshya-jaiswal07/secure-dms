import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env (workspace root is 2 levels up from lib/db)
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...val] = trimmed.split("=");
      if (key.trim() === "DATABASE_URL") {
        process.env.DATABASE_URL = val.join("=").trim();
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL not found. Check your .env file.");
  process.exit(1);
}

// Dynamically import pg and drizzle after env is set
const { default: pg } = await import("pg");
const { drizzle } = await import("drizzle-orm/node-postgres");
const { sql } = await import("drizzle-orm");

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

// Parse CSV helper
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] || "").trim(); });
    return row;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Map status tone
function getStatusTone(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("solved") && !s.includes("not")) return "teal";
  if (s.includes("not solved")) return "amber";
  return "slate";
}

async function main() {
  console.log("📂  Reading CSV file...");
  const csvPath = path.resolve(__dirname, "../../fake_case_records.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvText);
  console.log(`✅  Parsed ${rows.length} case records from CSV\n`);

  // Ensure the cases schema and table exist
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS cases`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cases.cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      court TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      status_tone TEXT NOT NULL DEFAULT 'amber',
      next_review TIMESTAMPTZ,
      description TEXT,
      parties JSONB DEFAULT '[]'::jsonb,
      investigator_id UUID,
      lead_prosecutor TEXT,
      defense_counsel TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);
  console.log("📋  Schema and table verified\n");

  let inserted = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    const caseNumber = row["Case Number"];
    const caseType   = row["Case Type"] || "General";
    const victim     = row["Victim"] || "Unknown";
    const suspect    = row["Suspect(s)"] || "Unknown";
    const witness    = row["Witness(es)"] || null;
    const officer    = row["Investigating Officer"] || "Unknown";
    const badge      = row["Badge Number"] || "";
    const location   = row["Location"] || "Unknown";
    const status     = row["Status"] || "Not Solved";
    const lawyer     = row["Lawyer"] || null;
    const dateStr    = row["Date"] || "";
    const timeStr    = row["Time"] || "";
    const wentToCourt = row["Went to Court"] === "Yes";

    // Build title from victim and suspect
    const title = `${victim} vs. ${suspect}`;

    // Parse date
    let nextReview = null;
    if (dateStr) {
      const parts = dateStr.split("-"); // DD-MM-YYYY
      if (parts.length === 3) {
        nextReview = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      }
    }

    // Parties array
    const parties = [
      `Victim: ${victim}`,
      `Suspect: ${suspect}`,
      ...(witness ? [`Witness: ${witness}`] : []),
      `Investigating Officer: ${officer} (${badge})`,
    ];

    // Court — derived from badge prefix
    const badgePrefix = badge.split("-")[0];
    const courtMap = {
      BPD: "High Court of Bombay",
      KPD: "Karnataka High Court",
      DPD: "Delhi High Court",
      SPD: "Supreme Court of India",
      MPD: "Madras High Court",
    };
    const court = courtMap[badgePrefix] || "High Court of Delhi";

    // Description
    const description = [
      `Case Type: ${caseType}.`,
      `Investigating Officer: ${officer} (Badge: ${badge}).`,
      wentToCourt ? `Went to court.` : `Did not proceed to court.`,
      lawyer ? `Defense counsel: ${lawyer}.` : "",
    ].filter(Boolean).join(" ");

    try {
      await db.execute(sql`
        INSERT INTO cases.cases (
          number, title, type, court, location, status, status_tone,
          next_review, description, parties, lead_prosecutor, defense_counsel
        ) VALUES (
          ${caseNumber},
          ${title},
          ${caseType},
          ${court},
          ${location},
          ${status},
          ${getStatusTone(status)},
          ${nextReview ? new Date(nextReview) : null},
          ${description},
          ${JSON.stringify(parties)}::jsonb,
          ${officer},
          ${lawyer || null}
        )
        ON CONFLICT (number) DO UPDATE SET
          status = EXCLUDED.status,
          status_tone = EXCLUDED.status_tone,
          description = EXCLUDED.description,
          updated_at = NOW()
      `);
      inserted++;
      process.stdout.write(`\r  ⚡ Importing... ${inserted}/${rows.length}`);
    } catch (err) {
      skipped++;
      errors.push({ case: caseNumber, error: err.message });
    }
  }

  console.log(`\n\n✅  Import complete!`);
  console.log(`   📥  Inserted/Updated : ${inserted}`);
  console.log(`   ⚠️   Skipped           : ${skipped}`);
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    errors.forEach(e => console.log(`   - ${e.case}: ${e.error}`));
  }

  // Quick analysis
  const result = await db.execute(sql`
    SELECT
      type,
      status,
      COUNT(*) as count
    FROM cases.cases
    GROUP BY type, status
    ORDER BY count DESC
    LIMIT 20
  `);

  console.log(`\n📊  Database Analysis — Top case types by status:`);
  console.log(`   ${"Case Type".padEnd(35)} ${"Status".padEnd(12)} Count`);
  console.log(`   ${"-".repeat(60)}`);
  for (const r of result.rows) {
    console.log(`   ${String(r.type).padEnd(35)} ${String(r.status).padEnd(12)} ${r.count}`);
  }

  await pool.end();
}

main().catch(err => {
  console.error("❌  Fatal error:", err.message);
  process.exit(1);
});
