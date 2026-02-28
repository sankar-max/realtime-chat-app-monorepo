import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { compress } from "hono/compress"
import { prettyJSON } from "hono/pretty-json"
import { config } from "@chat/config"

console.log(
  `Starting Moreno Backend in ${config.nodeEnv} mode on port ${config.port}`,
)

const app = new Hono()

// 1. Logger - logs every request (method, path, status, time)
app.use("*", logger())

// 5. CORS - allow frontend origins (update later with real domains)
app.use(
  "*",
  cors({
    origin: config.isDev
      ? ["http://localhost:3000", "http://127.0.0.1:3000"] // Next.js dev
      : ["https://your-production-domain.com"], // change in prod
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 600, // cache preflight 10 min
    credentials: true, // allow cookies/auth headers if needed later
  }),
)
// 2. Secure headers - basic security (anti-clickjacking, MIME sniffing protection, etc.)
app.use("*", secureHeaders())

// 3. Compression - gzip/brotli responses automatically
app.use("*", compress())

// 4. Pretty JSON in dev (add ?pretty=1 to see formatted JSON)
if (config.isDev) {
  app.use("*", prettyJSON({ space: 2 }))
}

// Global error handler (catches thrown errors in handlers)
app.onError((err, c) => {
  console.error("Server error:", err)
  return c.json(
    {
      success: false,
      error: config.isDev ? err.message : "Internal Server Error",
    },
    500,
  )
})

// Not Found handler (404)
app.notFound((c) => {
  return c.json({ success: false, error: "Not Found" }, 404)
})

// Routes
app.get("/", (c) => {
  return c.text(`Hello from Moreno Backend! (${config.nodeEnv} mode)`)
})

app.get("/health", (c) => {
  return c.json({
    success: true,
    status: "ok",
    environment: config.nodeEnv,
    port: config.port,
    uptimeSeconds: Math.floor(process.uptime()),
  })
})

// Example future protected route (we'll add JWT later)
// app.get('/protected', (c) => { ... })

export default {
  port: config.port,
  fetch: app.fetch,
}
