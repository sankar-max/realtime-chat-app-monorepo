import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users"

export const deviceTokens = pgTable("device_tokens", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'fcm', 'apns'
  deviceId: varchar("device_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

import { text } from "drizzle-orm/pg-core"
