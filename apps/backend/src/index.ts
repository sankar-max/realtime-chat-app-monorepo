import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Hello from Moreno API! 🚀")
})

// Health check - good for later monitoring
app.get("/health", (c) => {
  return c.json({ status: "ok", uptime: process.uptime() })
})

export default {
  port: 4000, // or process.env.PORT later
  fetch: app.fetch,
}
