import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const usersTable = authSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'police_officer' | 'lawyer' | 'judge' | 'prosecutor' | 'investigator' | 'clerk'
  department: text("department"),
  badgeNumber: text("badge_number"),
  avatarUrl: text("avatar_url"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rolesTable = authSchema.table("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array(), // e.g. ['read:cases', 'write:documents', 'seal:documents']
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
