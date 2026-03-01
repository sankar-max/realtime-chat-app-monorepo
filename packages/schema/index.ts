import { z } from "zod"

// Example shared schema
export const userSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Export our Drizzle database schemas
export * from "./src"

// 🌟 THE MAGIC: Re-export EVERYTHING from Zod 🌟
export * from "zod"
