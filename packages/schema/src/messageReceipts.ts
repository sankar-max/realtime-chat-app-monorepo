import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core"
import { messages } from "./messages"
import { users } from "./users"

export const messageReceipts = pgTable(
  "message_receipts",
  {
    messageId: varchar("message_id", { length: 255 })
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull(), // delivered, read
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.messageId, t.userId] }),
  }),
)

export const messageDeletions = pgTable(
  "message_deletions",
  {
    messageId: varchar("message_id", { length: 255 })
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.messageId, t.userId] }),
  }),
)
