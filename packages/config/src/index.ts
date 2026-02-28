import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Later: JWT_SECRET: z.string().min(32),
  // DATABASE_URL: z.string().url(),
})

// Parse & validate env
const env = envSchema.parse(process.env)

// Export typed & validated env
export const config = {
  port: env.PORT,
  isDev: env.NODE_ENV === "development",
  nodeEnv: env.NODE_ENV,
  // Later add more
} as const
