// 1. MUST BE FIRST IMPORT - This runs the dotenv config BEFORE anything else
import "./env-setup"

// 2. Now we can safely import env because process.env has already been populated
import { env } from "@chat/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "../../packages/schema/src/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
