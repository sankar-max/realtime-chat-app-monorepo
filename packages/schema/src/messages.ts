import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core"
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
