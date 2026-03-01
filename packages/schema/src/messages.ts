import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core"
import { users } from "./users"
import { rooms } from "./rooms"

export const messages = pgTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roomId: varchar("room_id", { length: 255 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  replyToId: varchar("reply_to_id", { length: 255 }).references(
    (): any => messages.id,
    { onDelete: "set null" },
  ),
  type: varchar("type", { length: 50 }).default("text").notNull(),
  isDeletedForEveryone: boolean("is_deleted_for_everyone")
    .default(false)
    .notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
