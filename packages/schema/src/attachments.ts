import { pgTable, varchar, timestamp, text, integer } from "drizzle-orm/pg-core"
import { messages } from "./messages"

export const attachments = pgTable("attachments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  messageId: varchar("message_id", { length: 255 })
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // image, video, file
  name: text("name").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
