import { jsonb, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const casesSchema = pgSchema("cases");

export const casesTable = casesSchema.table("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(), // e.g., 'CRL.A. 0817 / 2024'
  title: text("title").notNull(),            // e.g., 'State v. Arvind Mehta'
  type: text("type").notNull(),              // e.g., 'Criminal appeal', 'Civil suit'
  court: text("court").notNull(),            // e.g., 'High Court of Delhi'
  location: text("location").notNull(),      // e.g., 'New Delhi'
  status: text("status").notNull(),          // e.g., 'Under review', 'Hearing scheduled'
  statusTone: text("status_tone").notNull().default("amber"), // 'amber' | 'teal' | 'slate'
  nextReview: timestamp("next_review"),
  description: text("description"),
  parties: jsonb("parties").$type<string[]>().default([]),
  investigatorId: uuid("investigator_id"),
  leadProsecutor: text("lead_prosecutor"),
  defenseCounsel: text("defense_counsel"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hearingsTable = casesSchema.table("case_hearings", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").notNull().references(() => casesTable.id, { onDelete: "cascade" }),
  hearingDate: timestamp("hearing_date").notNull(),
  judgeName: text("judge_name").notNull(),
  courtroom: text("courtroom"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CaseRecord = typeof casesTable.$inferSelect;
export type InsertCaseRecord = typeof casesTable.$inferInsert;
