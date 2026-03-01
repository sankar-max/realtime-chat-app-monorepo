import { relations } from "drizzle-orm"
import { users } from "./users"
import { rooms } from "./rooms"
import { roomMembers } from "./roomMembers"
import { messages } from "./messages"

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
}))

export const roomsRelations = relations(rooms, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
}))

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, { fields: [roomMembers.roomId], references: [rooms.id] }),
  user: one(users, { fields: [roomMembers.userId], references: [users.id] }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  room: one(rooms, { fields: [messages.roomId], references: [rooms.id] }),
}))
