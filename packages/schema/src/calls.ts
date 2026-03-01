import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core"
import { rooms } from "./rooms"
import { users } from "./users"

export const calls = pgTable("calls", {
  id: varchar("id", { length: 255 }).primaryKey(),
  roomId: varchar("room_id", { length: 255 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  callerId: varchar("caller_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // voice, video
  status: varchar("status", { length: 50 }).notNull(), // ongoing, ended, missed
  recordingUrl: text("recording_url"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const callParticipants = pgTable("call_participants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  callId: varchar("call_id", { length: 255 })
    .notNull()
    .references(() => calls.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(), // joined, declined, missed
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
})
