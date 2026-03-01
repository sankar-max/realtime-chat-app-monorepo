import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // We'll use nanoid/uuid
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  status: varchar("status", { length: 50 }).default("offline").notNull(),
  lastSeenAt: timestamp("last_seen_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
