import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { env } from "@chat/config"
import * as schema from "@chat/schema"

const sql = neon(env.DATABASE_URL)

export const db = drizzle({ client: sql, schema })
