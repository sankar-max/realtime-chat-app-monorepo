import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core"

export const rooms = pgTable("rooms", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(), // 'direct' or 'group'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
