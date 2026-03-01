import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core"
import { users } from "./users"

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
