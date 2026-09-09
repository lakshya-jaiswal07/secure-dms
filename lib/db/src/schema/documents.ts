import { integer, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { casesTable } from "./cases";
import { usersTable } from "./auth";

export const documentsSchema = pgSchema("documents");

// Master document entry (metadata reference only)
export const documentsTable = documentsSchema.table("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").notNull().references(() => casesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Charge sheet', 'Evidence Log', 'FIR Copy', 'Forensic Report'
  classificationLevel: text("classification_level").notNull().default("Restricted"), // 'Public' | 'Restricted' | 'Confidential' | 'Sealed'
  status: text("status").notNull().default("Verified"), // 'Verified' | 'Review required' | 'Sealed'
  currentVersion: integer("current_version").notNull().default(1),
  currentHash: text("current_hash").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Immutable Document Versions (No UPDATE/DELETE allowed)
export const documentVersionsTable = documentsSchema.table("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documentsTable.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  storageKey: text("storage_key").notNull(), // Object storage key (S3/MinIO bucket path)
  fileHash: text("file_hash").notNull(),     // SHA-256 integrity hash
  fileSize: integer("file_size").notNull(),   // File size in bytes
  mimeType: text("mime_type").notNull().default("application/pdf"),
  uploadedBy: uuid("uploaded_by").references(() => usersTable.id),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Digital PKI Signatures
export const signaturesTable = documentsSchema.table("signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentVersionId: uuid("document_version_id").notNull().references(() => documentVersionsTable.id, { onDelete: "cascade" }),
  signerId: uuid("signer_id").references(() => usersTable.id),
  signerRole: text("signer_role").notNull(),
  signerName: text("signer_name").notNull(),
  signatureHash: text("signature_hash").notNull(),
  algorithm: text("algorithm").notNull().default("RSA-SHA256"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export type DocumentRecord = typeof documentsTable.$inferSelect;
export type InsertDocumentRecord = typeof documentsTable.$inferInsert;
export type DocumentVersionRecord = typeof documentVersionsTable.$inferSelect;
export type InsertDocumentVersionRecord = typeof documentVersionsTable.$inferInsert;
export type SignatureRecord = typeof signaturesTable.$inferSelect;
