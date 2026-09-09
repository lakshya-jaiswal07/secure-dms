import { boolean, jsonb, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { casesTable } from "./cases";
import { documentsTable } from "./documents";

export const custodySchema = pgSchema("documents");

// Append-Only Tamper-Evident Hash Chained Audit Log (Chain of Custody)
export const chainOfCustodyTable = custodySchema.table("chain_of_custody", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => casesTable.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documentsTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'capture' | 'upload' | 'verify' | 'view' | 'share' | 'seal' | 'download'
  icon: text("icon").notNull().default("capture"),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(), // 'Investigating Officer' | 'Defense Counsel' | 'Presiding Judge' | 'Prosecutor'
  detail: text("detail").notNull(),
  previousHash: text("previous_hash").notNull(), // SHA-256 hash of previous log entry
  entryHash: text("entry_hash").notNull(),       // SHA-256 (previousHash + action + actorName + timestamp + detail)
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  verified: boolean("verified").notNull().default(true),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ChainOfCustodyRecord = typeof chainOfCustodyTable.$inferSelect;
export type InsertChainOfCustodyRecord = typeof chainOfCustodyTable.$inferInsert;
