import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core"
import { rooms } from "./rooms"
import { users } from "./users"

// Junction table for Room Memberships
export const roomMembers = pgTable("room_members", {
  id: varchar("id", { length: 255 }).primaryKey(),
  roomId: varchar("room_id", { length: 255 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  lastReadMessageId: varchar("last_read_message_id", { length: 255 }),
  lastDeliveredMessageId: varchar("last_delivered_message_id", {
    length: 255,
  }),
  isMuted: boolean("is_muted").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})
