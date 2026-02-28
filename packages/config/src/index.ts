import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    JWT_SECRET: z.string().min(1).default("secret"),
    // DATABASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

// Export typed & validated config
export const config = {
  port: env.PORT,
  isDev: env.NODE_ENV === "development",
  nodeEnv: env.NODE_ENV,
  jwtSecret: env.JWT_SECRET,
  // Later add more
} as const
