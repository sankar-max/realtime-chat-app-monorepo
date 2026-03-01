import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core"
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
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})
