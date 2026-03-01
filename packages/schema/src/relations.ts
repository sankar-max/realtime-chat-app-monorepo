import { relations } from "drizzle-orm"
import { users } from "./users"
import { rooms } from "./rooms"
import { roomMembers } from "./roomMembers"
import { messages } from "./messages"
import { sessions } from "./sessions"
import { deviceTokens } from "./deviceTokens"
import { attachments } from "./attachments"
import { calls, callParticipants } from "./calls"
import { messageReceipts, messageDeletions } from "./messageReceipts"

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
  sessions: many(sessions),
  deviceTokens: many(deviceTokens),
}))

export const roomsRelations = relations(rooms, ({ many }) => ({
  memberships: many(roomMembers),
  messages: many(messages),
  calls: many(calls),
}))

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, { fields: [roomMembers.roomId], references: [rooms.id] }),
  user: one(users, { fields: [roomMembers.userId], references: [users.id] }),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  room: one(rooms, { fields: [messages.roomId], references: [rooms.id] }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: "replies",
  }),
  replies: many(messages, { relationName: "replies" }),
  attachments: many(attachments),
  receipts: many(messageReceipts),
  deletions: many(messageDeletions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(users, { fields: [deviceTokens.userId], references: [users.id] }),
}))

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}))

export const callsRelations = relations(calls, ({ one, many }) => ({
  room: one(rooms, { fields: [calls.roomId], references: [rooms.id] }),
  caller: one(users, { fields: [calls.callerId], references: [users.id] }),
  participants: many(callParticipants),
}))

export const callParticipantsRelations = relations(
  callParticipants,
  ({ one }) => ({
    call: one(calls, {
      fields: [callParticipants.callId],
      references: [calls.id],
    }),
    user: one(users, {
      fields: [callParticipants.userId],
      references: [users.id],
    }),
  }),
)

export const messageReceiptsRelations = relations(
  messageReceipts,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageReceipts.messageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [messageReceipts.userId],
      references: [users.id],
    }),
  }),
)

export const messageDeletionsRelations = relations(
  messageDeletions,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageDeletions.messageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [messageDeletions.userId],
      references: [users.id],
    }),
  }),
)
