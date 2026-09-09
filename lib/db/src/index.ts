import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let db: NodePgDatabase<typeof schema> | null = null;

if (!process.env.DATABASE_URL) {
  const possiblePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(__dirname, "../../../.env"),
    path.resolve(__dirname, "../.env"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...val] = trimmed.split("=");
          if (key.trim() === "DATABASE_URL") {
            process.env.DATABASE_URL = val.join("=").trim().replace(/^["']|["']$/g, "");
            break;
          }
        }
      }
      if (process.env.DATABASE_URL) break;
    }
  }
}

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });
  db = drizzle(pool, { schema });
  console.log("✅ Connected to Neon Cloud PostgreSQL Database");
} else {
  console.warn("⚠️  DATABASE_URL environment variable is not set. To connect to your hosted Neon database, add DATABASE_URL to your environment or .env file.");
}

export * from "./schema";
