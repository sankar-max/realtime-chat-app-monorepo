# 🔥 Hono.js — The Complete Senior-Level Guide

> Everything you need to build production-grade, scalable backends with Hono.js

---

## Table of Contents

1. [What is Hono?](#1-what-is-hono)
2. [Installation & Setup](#2-installation--setup)
3. [Core Concepts & Architecture](#3-core-concepts--architecture)
4. [Routing — Deep Dive](#4-routing--deep-dive)
5. [Middleware — The Heart of Hono](#5-middleware--the-heart-of-hono)
6. [Context Object (c)](#6-context-object-c)
7. [Request & Response Handling](#7-request--response-handling)
8. [CORS — Full Configuration](#8-cors--full-configuration)
9. [Authentication — JWT Deep Dive](#9-authentication--jwt-deep-dive)
10. [Access Tokens & Refresh Tokens](#10-access-tokens--refresh-tokens)
11. [Authorization & Role-Based Access Control](#11-authorization--role-based-access-control)
12. [Validation — Zod + Hono Validator](#12-validation--zod--hono-validator)
13. [Error Handling](#13-error-handling)
14. [Environment Variables & Configuration](#14-environment-variables--configuration)
15. [Database Integration](#15-database-integration)
16. [File Uploads](#16-file-uploads)
17. [Rate Limiting](#17-rate-limiting)
18. [Logging & Monitoring](#18-logging--monitoring)
19. [Project Architecture — Senior Level](#19-project-architecture--senior-level)
20. [Scalable Folder Structure](#20-scalable-folder-structure)
21. [Testing with Hono](#21-testing-with-hono)
22. [Deployment Targets](#22-deployment-targets)
23. [Security Best Practices](#23-security-best-practices)
24. [Performance Optimization](#24-performance-optimization)
25. [Advanced Patterns](#25-advanced-patterns)
26. [WebSockets with Hono](#26-websockets-with-hono)
27. [Streaming Responses](#27-streaming-responses)
28. [Full Production Example](#28-full-production-example)

---

## 1. What is Hono?

**Hono** (炎, meaning "flame" in Japanese) is an ultrafast, lightweight, multi-runtime web framework built on Web Standards.

### Why Hono over Express?

| Feature             | Hono                              | Express              |
| ------------------- | --------------------------------- | -------------------- |
| Speed               | ~5-10x faster                     | Baseline             |
| Bundle size         | ~14KB                             | ~200KB+              |
| Runtime             | Node, Deno, Bun, Edge, CF Workers | Node only            |
| Web Standards       | Yes (Request/Response)            | No (req/res objects) |
| TypeScript          | First-class                       | Bolted on            |
| Middleware          | Composable, typed                 | Untyped              |
| Built-in Validators | Yes                               | No                   |

### Hono runs everywhere:

- **Cloudflare Workers** (original target)
- **Node.js** (via `@hono/node-server`)
- **Bun** (native support)
- **Deno**
- **AWS Lambda**
- **Vercel Edge Functions**
- **Netlify Edge**
- **Fastly Compute**

---

## 2. Installation & Setup

### Node.js

```bash
# Create project
mkdir my-api && cd my-api
npm init -y

# Install Hono + Node adapter
npm install hono @hono/node-server

# TypeScript (recommended)
npm install -D typescript tsx @types/node
npx tsc --init
```

```typescript
// src/index.ts
import { Hono } from "hono"
import { serve } from "@hono/node-server"

// Initialize a new Hono application instance. This 'app' object is used to register all routes and middleware.
const app = new Hono()

// Define a GET route at the root path ("/").
// The '(c)' represents the Context object, which holds request and response data.
// c.json() automatically sets the Content-Type to application/json and returns a JSON response.
app.get("/", (c) => c.json({ message: "Hello Hono!" }))

// Use the '@hono/node-server' package's serve function to run the app.
// It takes the Hono 'app.fetch' handler and binds it to port 3000.
// The callback function logs a message when the server successfully starts.
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  },
)
```

```bash
npx tsx src/index.ts
```

### Bun

```bash
bun create hono my-app
cd my-app
bun run dev
```

```typescript
// src/index.ts
import { Hono } from "hono"

// Create the Hono instance
const app = new Hono()

// Define a GET route at the root path.
// This time, we use 'c.text()' to return a plain text response instead of JSON.
app.get("/", (c) => c.text("Hello Bun!"))

// In Bun, you don't need a separate server package like '@hono/node-server'.
// You simply export the Hono app as the default export. Bun's built-in HTTP server knows how to handle it.
export default app
```

### Cloudflare Workers

```bash
npm create cloudflare@2 my-app -- --template=hello-world
cd my-app
npm install hono
```

```typescript
// src/index.ts
import { Hono } from "hono"

// Create the Hono instance
const app = new Hono()

// Define a GET route at the root path, responding with a simple JSON object
app.get("/", (c) => c.json({ runtime: "CF Workers" }))

// Similar to Bun, Cloudflare Workers natively understand standard Web Fetch API syntax.
// Exporting the app exposes its 'fetch' handler to Cloudflare's runtime.
export default app
```

### package.json scripts (Node.js)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  }
}
```

---

## 3. Core Concepts & Architecture

### How Hono Works Internally

Hono uses a **Trie router** (RadixRouter) internally, making route matching O(k) where k = path length, not O(n) based on number of routes. This is why it's extremely fast.

```
Request → App.fetch() → Router.match() → Middleware Chain → Handler → Response
```

### The Hono Class

```typescript
import { Hono } from "hono"

// Basic usage: creates an untyped Hono application instance
const app = new Hono()

// With type bindings (Advanced - Typically used for Cloudflare Workers)
// This interface defines environment variables or secrets injected by the runtime environment.
type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

// Creating a Hono instance and providing the Bindings type.
// This gives you strict autocomplete and type safety when accessing `c.env.DATABASE_URL` later in routes.
const app = new Hono<{ Bindings: Bindings }>()

// With Variables (typed context variables)
// Variables define the shape of custom data you attach to the request during middleware (e.g., getting a user ID from a token).
type Variables = {
  userId: string
  userRole: string
}

// Creating a Hono instance with the Variables type.
// Now, `c.get('userId')` will be strictly typed as a string instead of 'any' or 'unknown'.
const app = new Hono<{ Variables: Variables }>()
```

### Application Lifecycle

```typescript
// 1. Route registration happens synchronously at startup
app.get("/users", handler)
app.post("/users", handler)

// 2. Each request goes through:
//    - Route matching
//    - Middleware execution (in order)
//    - Handler execution
//    - Response returned

// 3. fetch() is the entry point - it's a standard Web API
export default app // CF Workers
serve({ fetch: app.fetch }) // Node.js
```

---

## 4. Routing — Deep Dive

### Basic Methods

```typescript
// Listen for GET requests (fetching data) at '/route'
app.get("/route", handler)

// Listen for POST requests (creating data) at '/route'
app.post("/route", handler)

// Listen for PUT requests (replacing data entirely) at '/route'
app.put("/route", handler)

// Listen for PATCH requests (updating data partially) at '/route'
app.patch("/route", handler)

// Listen for DELETE requests (removing data) at '/route'
app.delete("/route", handler)

// Listen for OPTIONS requests (used for CORS pre-flight checks)
app.options("/route", handler)

// Listen for HEAD requests (returns headers only, no body)
app.head("/route", handler)

// Listen for ALL HTTP methods at this route.
// Useful for fallback handlers or generic middleware.
app.all("/route", handler)

// Listen for a custom or non-standard HTTP method (like PURGE, used in caching)
app.on("PURGE", "/cache", handler)

// Listen for multiple specific methods at the same route
// Here, both GET and POST requests matching '/route' will run the same 'handler'
app.on(["GET", "POST"], "/route", handler)
```

### Route Parameters

```typescript
// Named parameters (starts with a colon ':')
// Any value in the URL after '/users/' is captured as the 'id' parameter.
app.get("/users/:id", (c) => {
  const id = c.req.param("id") // Extract the dynamic path portion
  return c.json({ id }) // e.g. GET /users/123 returns { "id": "123" }
})

// Multiple params
// Extracts multiple dynamic path segments
app.get("/users/:userId/posts/:postId", (c) => {
  const { userId, postId } = c.req.param() // Extract all params as an object
  return c.json({ userId, postId })
})

// Optional parameter (Adding a question mark '?' makes it optional)
// IMPORTANT: Hono technically doesn't support the '?' for optional params natively in the path string like Express.
// Instead, in Hono, it's widely recommended to define separate routes (e.g., app.get('/users') and app.get('/users/:id')) or use regex paths.
// But some routers mimic this behavior by capturing paths. If supported by router version, it means:
app.get("/users/:id?", (c) => {
  const id = c.req.param("id") // undefined if requested path was just '/users'
  return c.json({ id: id ?? "all" })
})

// Wildcard (captures everything after the asterisk '*')
app.get("/files/*", (c) => {
  // Useful for static file serving or deeply nested path handling
  const path = c.req.param("*") // e.g., GET /files/images/logo.png -> path = "images/logo.png"
  return c.text(`File: ${path}`)
})

// Regex constraint
// Only matches if 'id' consists of 1 or more digits [0-9]+
// If you send GET /users/abc, it will return a 404 Not Found instead of hitting this handler
app.get("/users/:id{[0-9]+}", (c) => {
  return c.json({ id: c.req.param("id") })
})
```

### Query Parameters

```typescript
app.get("/search", (c) => {
  // Single value extraction
  // Converts ?q=hono into q = "hono"
  const q = c.req.query("q")

  // All query params as an object
  // Converts ?search=api&limit=10 into { search: 'api', limit: '10' }
  const allParams = c.req.query()

  // Multiple values for the exact same key (?tag=js&tag=ts)
  // c.req.query('tag') would only return the first one ('js').
  // c.req.queries('tag') returns an array: ['js', 'ts']
  const tags = c.req.queries("tag") // Evaluates to string[]

  return c.json({ q, tags, allParams })
})
```

### Route Groups with Hono Router

```typescript
// Method 1: Using app.route()
// Create a separate standalone Hono instance just for user routes
const userRoutes = new Hono()
userRoutes.get("/", getAllUsers) // Handles GET /
userRoutes.get("/:id", getUserById) // Handles GET /:id
userRoutes.post("/", createUser) // Handles POST /

// "Mount" the userRoutes instance onto the main app under the "/users" prefix
app.route("/users", userRoutes)
// The final matched routes become:
// → GET /users
// → GET /users/:id
// → POST /users

// Method 2: Using basePath
// Creates a Hono instance where EVERY route automatically starts with "/api/v1"
const api = new Hono().basePath("/api/v1")
api.get("/health", (c) => c.json({ status: "ok" })) // Actually registers as GET /api/v1/health
```

### Route Chaining

```typescript
// Instead of writing 'app' repeatedly, you can chain method calls.
// This is structurally identical but visually cleaner.
app
  .get("/users", getAllUsers)
  .post("/users", createUser)
  .get("/users/:id", getUserById)
  .put("/users/:id", updateUser)
  .delete("/users/:id", deleteUser)
```

---

## 5. Middleware — The Heart of Hono

Middleware in Hono follows the **Onion Model**: each middleware can run code before AND after the next middleware/handler.

```
Request →  MW1 before  →  MW2 before  →  Handler  →  MW2 after  →  MW1 after  → Response
```

### Writing Middleware

```typescript
import { Hono } from "hono"
import type { MiddlewareHandler } from "hono"

// Inline middleware definition
// app.use("*", ...) means this runs on EVERY single route.
app.use("*", async (c, next) => {
  console.log("Before handler") // Code here runs BEFORE the actual route handler is called

  await next() // 'next()' pauses this function, passing control to the next middleware or the actual route handler.

  // This code below only runs AFTER the route handler has completely finished and generated a response.
  console.log("After handler")
})

// Named middleware (reusable)
// Explicitly typing it as MiddlewareHandler ensures strict TypeScript checks
const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now() // Track when request started

  await next() // Wait for the rest of the app to process the request

  const duration = Date.now() - start // Calculate how long it took
  console.log(`${c.req.method} ${c.req.path} - ${duration}ms`) // Log the execution time
}

// Apply the reusable middleware to all routes
app.use("*", loggerMiddleware)
```

### Middleware Scope

```typescript
// Global - applies to ALL routes across the entire app
app.use("*", middleware)

// Path-specific - implies it only runs for routes starting with /api/
app.use("/api/*", middleware)

// Method + path specific
// Normally app.use() applies to ALL HTTP methods (GET, POST, etc).
// You can't restrict 'use' by method directly, so to restrict, you usually apply it per-route, or use grouped routers.

// Per-route middleware (inline)
// Before 'handler' runs, 'authMiddleware' executes. If 'authMiddleware' doesn't call next(), 'handler' is never reached.
app.get("/protected", authMiddleware, handler)

// You can chain as many middlewares as you want in a single route definition
app.post("/data", validateBody, rateLimiter, handler)
```

### Built-in Middleware

```typescript
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { prettyJSON } from "hono/pretty-json"
import { compress } from "hono/compress"
import { etag } from "hono/etag"
import { secureHeaders } from "hono/secure-headers"
import { timing } from "hono/timing"
import { cache } from "hono/cache"
import { bearerAuth } from "hono/bearer-auth"
import { basicAuth } from "hono/basic-auth"

// Apply all
app.use("*", logger())
app.use("*", cors())
app.use("*", compress())
app.use("*", secureHeaders())
app.use("*", timing())
```

### Creating a Factory Middleware (parameterized)

```typescript
// A middleware factory is a function that *returns* a middleware function.
// This allows you to pass custom configuration logic (like checking for a specific 'role')
function requireRole(role: string) {
  // Returns the actual standard Hono middleware signature (c, next)
  return async (c: Context, next: Next) => {
    // Attempt to grab the 'userRole' from the Context (presumably set by an earlier auth middleware)
    const userRole = c.get("userRole")

    // If the roles don't match, instantly reject the request with a 403 Forbidden status
    if (userRole !== role) {
      return c.json({ error: "Forbidden" }, 403)
    }

    // Role matches, allow the request to continue to the handler
    await next()
  }
}

// Usage: Injecting different roles dynamically into the middleware factory
app.delete("/users/:id", requireRole("admin"), deleteUser) // Only "admin" can delete
app.get("/reports", requireRole("manager"), getReports) // Only "manager" can read reports
```

### Composing Middleware

```typescript
import { every, some } from "hono/combine"

// every = AND - all must pass
app.use("/admin/*", every(isAuthenticated, isAdmin))

// some = OR - at least one must pass
app.use("/content/*", some(isPublic, isAuthenticated))
```

---

## 6. Context Object (c)

The `c` (Context) object is the core of every handler. It contains everything about the current request and tools to build the response.

```typescript
app.get("/example", async (c) => {
  // ===== REQUEST =====
  // 'c.req' is a wrapper around the standard Web Request API but with Hono helpers
  c.req // HonoRequest - the incoming request
  c.req.method // Get the HTTP method e.g. 'GET', 'POST', etc.
  c.req.path // Get just the path e.g. '/example'
  c.req.url // Get the Full URL string e.g. 'https://api.com/example'
  c.req.header("content-type") // Get a specific header securely (case-insensitive)
  c.req.headers // Get all headers as a standard 'Headers' object
  c.req.param("id") // Extract a URL parameter like /users/:id
  c.req.query("search") // Extract a Query string value like ?search=term
  c.req.body // The raw body as a standard Web ReadableStream

  // Body parsing (Hono methods to easily parse different content types)
  const json = await c.req.json() // Parse JSON body securely
  const text = await c.req.text() // Parse body as plain text
  const form = await c.req.formData() // Parse multipart form data (e.g. file uploads)
  const raw = await c.req.arrayBuffer() // Parse raw bytes (for images/binary data)

  // ===== VARIABLES =====
  // Context variables are used to pass data between middleware and the final route handler
  c.set("userId", "123") // Store a value in context
  const userId = c.get("userId") // Retrieve the value later in the same request lifecycle

  // ===== ENVIRONMENT =====
  // Access environment variables securely. In Cloudflare Workers, this accesses your bound secrets/databases
  c.env // CF Workers bindings / Node env

  // ===== RESPONSES =====
  // Hono provides standard helpers to return data. It automatically sets the correct Content-Type.
  return c.json({ data: "ok" }) // Sends a 200 OK JSON response
  return c.json({ data: "ok" }, 201) // Sends JSON with a specific status code (201 Created)
  return c.text("Hello") // Sends a plain text response
  return c.html("<h1>Hi</h1>") // Sends HTML (useful for server-side rendering or HTMX)
  return c.body(stream) // Stream a response back to the client continuously
  return c.redirect("/new-path") // Redirect the user (default 302 Temporary)
  return c.redirect("/new-path", 301) // Permanent redirect (tells browsers to cache the redirect)
  return c.notFound() // Explicitly return a 404 response

  // Custom response using the standard Web Response object
  // Hono is built on top of Web Standards, so you can always drop back to native objects
  return new Response("Custom", {
    status: 200,
    headers: { "X-Custom": "value" },
  })
})
```

### Setting Response Headers

```typescript
app.get("/data", (c) => {
  // Set headers individually
  c.header("X-Request-Id", crypto.randomUUID()) // Add a custom tracking header
  c.header("Cache-Control", "no-cache") // Tell browser not to cache this response

  // Set the status code explicitly
  c.status(200)

  // Return the data; the headers and status configured above will automatically be attached
  return c.json({ data: "value" })
})
```

### Context Variables — Typed

```typescript
// Define your variable types for strict safety.
// This prevents typos like setting 'userID' but trying to read 'userId'.
type Variables = {
  userId: string
  user: {
    id: string
    email: string
    role: "admin" | "user"
  }
  requestId: string
}

// Pass the Variables type to the Hono constructor
const app = new Hono<{ Variables: Variables }>()

// Set variable in middleware
app.use("*", async (c, next) => {
  c.set("requestId", crypto.randomUUID()) // Validates against the 'Variables' type
  await next()
})

// Read variable in handler - fully typed!
app.get("/me", (c) => {
  // Because we defined 'Variables', TypeScript knows exactly what 'user' looks like
  const user = c.get("user")
  return c.json(user)
})
```

---

## 7. Request & Response Handling

### Request Body Parsing

```typescript
// JSON
app.post("/users", async (c) => {
  const body = await c.req.json<{ name: string; email: string }>()
  return c.json({ created: body })
})

// Form Data
app.post("/form", async (c) => {
  const form = await c.req.formData()
  const name = form.get("name") as string
  const file = form.get("avatar") as File
  return c.json({ name, filename: file.name })
})

// Raw text
app.post("/webhook", async (c) => {
  const payload = await c.req.text()
  const signature = c.req.header("x-signature")
  // verify signature...
  return c.json({ received: true })
})

// ArrayBuffer (binary)
app.post("/binary", async (c) => {
  const buffer = await c.req.arrayBuffer()
  return c.json({ size: buffer.byteLength })
})
```

### Content Negotiation

```typescript
app.get("/data", (c) => {
  const accept = c.req.header("Accept") || ""

  const data = { id: 1, name: "Alice" }

  if (accept.includes("application/xml")) {
    return c.body(`<user><id>1</id><name>Alice</name></user>`, 200, {
      "Content-Type": "application/xml",
    })
  }

  return c.json(data)
})
```

### Response Helpers

```typescript
// JSON helpers: Send JSON with status code 200 and setting specific headers all at once
return c.json(data, 200, {
  "X-Total-Count": "100", // Useful for pagination
  "Cache-Control": "public, max-age=60", // Cache for 60 seconds
})

// Stream a large response (e.g., massive JSON objects or file downloads)
// Streaming prevents backend memory crashes by sending data piece-by-piece rather than loading everything into memory.
return c.stream(async (stream) => {
  for (const chunk of largeDataArray) {
    await stream.write(JSON.stringify(chunk) + "\n")
  }
})

// Server-Sent Events (SSE)
// Used when you want to stream continuous live updates to the frontend (like a chat or live ticker)
return c.streamText(async (stream) => {
  for (let i = 0; i < 10; i++) {
    await stream.writeln(`data: Event ${i}\n`) // Standard SSE format requires 'data: ...'
    await stream.sleep(1000) // Pause stream for 1 second
  }
})
```

---

## 8. CORS — Full Configuration

Cross-Origin Resource Sharing must be configured carefully. Wrong CORS kills your app's frontend integration.

### Basic CORS

```typescript
import { cors } from "hono/cors"

// Allow all origins (dev only — NEVER in production)
// This wildcard means any website on the internet can make requests to your API
app.use("*", cors())

// Production CORS (Highly Recommended)
app.use(
  "*",
  cors({
    origin: "https://yourdomain.com", // Only allow requests coming from this exact domain
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Restrict the HTTP methods allowed
    allowHeaders: ["Content-Type", "Authorization"], // Only allow these specific headers to be sent by the browser
    exposeHeaders: ["Content-Length", "X-Request-Id"], // Allow the frontend JS to read these headers from the response
    maxAge: 86400, // Tell the browser to cache the CORS check (preflight) for 24 hours to save network requests
    credentials: true, // Crucial: Allows the browser to send cookies or Authorization headers with the request
  }),
)
```

### Multiple Origins

```typescript
const allowedOrigins = [
  "https://app.yourdomain.com",
  "https://admin.yourdomain.com",
  "https://yourdomain.com",
]

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return null // Same-origin requests
      if (allowedOrigins.includes(origin)) return origin
      return null // Block unknown origins
    },
    credentials: true,
  }),
)
```

### Dynamic CORS by Environment

```typescript
function getCorsConfig() {
  const isDev = process.env.NODE_ENV === "development"

  return cors({
    origin: isDev
      ? ["http://localhost:3000", "http://localhost:5173"]
      : ["https://app.yourdomain.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposeHeaders: ["X-Request-Id", "X-RateLimit-Remaining"],
    credentials: true,
    maxAge: isDev ? 0 : 86400,
  })
}

app.use("*", getCorsConfig())
```

### CORS for Specific Routes

```typescript
// Public API — open CORS
app.use("/api/public/*", cors({ origin: "*" }))

// Private API — strict CORS
app.use(
  "/api/private/*",
  cors({
    origin: "https://dashboard.yourdomain.com",
    credentials: true,
  }),
)

// Webhook endpoint — no CORS needed (server-to-server)
app.post("/webhook/*", webhookHandler)
```

### Pre-flight Handling

```typescript
// OPTIONS requests are handled automatically by the cors middleware
// But you can manually handle them too:
app.options("*", (c) => {
  return c.text("", 204)
})
```

---

## 9. Authentication — JWT Deep Dive

### Understanding JWT Structure

A JWT has 3 parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header (base64)
.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImFAYi5jb20iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0=   ← Payload (base64)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature (HMAC)
```

**Payload (claims):**

- `sub` — subject (user ID)
- `iat` — issued at
- `exp` — expiry timestamp
- `iss` — issuer
- `aud` — audience
- Custom claims: `role`, `email`, etc.

### JWT Setup

```bash
npm install hono
# hono/jwt is built-in, no extra package needed
```

### JWT Signing & Verification

```typescript
import { sign, verify, decode } from "hono/jwt"

// ===== SIGN (Create a Token) =====
const payload = {
  sub: "123", // 'Subject' - usually the user ID
  email: "user@example.com", // Custom claim
  role: "admin", // Custom claim
  iat: Math.floor(Date.now() / 1000), // 'Issued At' timestamp in seconds
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 'Expires' timestamp (Current time + 1 hour)
}

// Generate the token using the payload and your secret key
const token = await sign(payload, process.env.JWT_SECRET!)

// ===== VERIFY (Check a Token is valid) =====
try {
  // Throws an error if the token was tampered with, signed by a different secret, or is expired
  const decoded = await verify(token, process.env.JWT_SECRET!)
  // decoded = { sub: '123', email: '...', role: '...', iat: ..., exp: ... }
} catch (err) {
  // Token is invalid or expired
}

// ===== DECODE (Read a Token WITHOUT verifying) =====
const { header, payload: p } = decode(token)
// Useful if you just want to read the expiration date on the frontend without needing the secret key
// IMPORTANT: NEVER trust decoded data for authorization without verifying it first!
```

### JWT Middleware (Built-in)

```typescript
import { jwt } from "hono/jwt"

// Protect all /api/* routes automatically
// If the request doesn't have a valid 'Authorization: Bearer <token>', it instantly returns a 401 Unauthorized
app.use("/api/*", jwt({ secret: process.env.JWT_SECRET! }))

// In handlers, access the verified payload using the default 'jwtPayload' key:
app.get("/api/me", (c) => {
  const payload = c.get("jwtPayload")
  return c.json({ userId: payload.sub, email: payload.email })
})
```

### Custom JWT Middleware (More Control)

```typescript
import { verify } from "hono/jwt"
import type { MiddlewareHandler } from "hono"

export const authenticate: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401)
  }

  const token = authHeader.slice(7) // Remove "Bearer "

  try {
    const payload = await verify(
      token,
      c.env.JWT_SECRET || process.env.JWT_SECRET!,
    )

    // Attach to context for downstream handlers
    c.set("userId", payload.sub as string)
    c.set("userRole", payload.role as string)
    c.set("jwtPayload", payload)

    await next()
  } catch (err: any) {
    if (err.message?.includes("expired")) {
      return c.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, 401)
    }
    return c.json({ error: "Invalid token" }, 401)
  }
}

// Usage
app.use("/api/*", authenticate)
```

### Login Endpoint

```typescript
import { sign } from "hono/jwt"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

// Define the expected shape of the login request body using Zod
const loginSchema = z.object({
  email: z.string().email(), // Must be a valid email string
  password: z.string().min(8), // Must be a string at least 8 chars long
})

// The 'zValidator' middleware runs first. If the body doesn't match 'loginSchema', it automatically returns a 400 error.
app.post("/auth/login", zValidator("json", loginSchema), async (c) => {
  // Since validation passed, 'c.req.valid("json")' gives us strictly typed data
  const { email, password } = c.req.valid("json")

  // 1. Find user in Database
  const user = await db.user.findUnique({ where: { email } })

  // Always use a generic "Invalid credentials" message so attackers can't guess if an email exists
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  // 2. Verify password (use a library like 'bcrypt' or 'argon2' in production)
  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  // 3. Generate tokens
  const now = Math.floor(Date.now() / 1000)

  // Create the short-lived access token
  const accessToken = await sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + 60 * 15, // Expires in exactly 15 minutes
    },
    process.env.JWT_SECRET!,
  )

  // Create the long-lived refresh token
  const refreshToken = await sign(
    {
      sub: user.id,
      type: "refresh", // Custom claim to ensure this token can't be used as an access token
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // Expires in 7 days
    },
    process.env.JWT_REFRESH_SECRET!,
  )
  // 4. Save refresh token hash to DB
  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // 5. Return tokens
  return c.json(
    {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
    200,
  )
})
```

---

## 10. Access Tokens & Refresh Tokens

This is one of the most important patterns for production auth. Understanding it deeply separates senior devs.

### Why Two Tokens?

```
Access Token:
  - Short-lived (15 mins - 1 hour)
  - Stateless (no DB lookup on each request)
  - If stolen, expires quickly
  - Stored: memory / localStorage (not HttpOnly cookie)

Refresh Token:
  - Long-lived (7-30 days)
  - Stateful (stored in DB so we can revoke it)
  - If stolen, we can detect and revoke
  - Stored: HttpOnly cookie (more secure) or secure storage
```

### Token Pair Architecture

```
[Client]                          [Server]
   |                                  |
   |--- POST /auth/login ------------>|
   |                                  |-- Verify credentials
   |                                  |-- Sign accessToken (15min)
   |                                  |-- Sign refreshToken (7days)
   |                                  |-- Store refreshToken hash in DB
   |<-- { accessToken, refreshToken }--|
   |                                  |
   |--- GET /api/me                   |
   |    Authorization: Bearer <AT>  ->|-- Verify accessToken (stateless)
   |<-- { user data } ----------------|
   |                                  |
   |--- (15 mins later) ------------->|
   |--- GET /api/me                   |
   |    Authorization: Bearer <AT>  ->|-- accessToken EXPIRED!
   |<-- 401 TOKEN_EXPIRED ------------|
   |                                  |
   |--- POST /auth/refresh            |
   |    { refreshToken } ------------>|-- Find token hash in DB
   |                                  |-- Verify not expired/revoked
   |                                  |-- Issue new accessToken
   |                                  |-- Issue new refreshToken (rotation)
   |                                  |-- Invalidate old refreshToken
   |<-- { newAccessToken, newRefreshToken }
```

### Refresh Token Endpoint

```typescript
app.post("/auth/refresh", async (c) => {
  const body = await c.req.json<{ refreshToken: string }>()
  const { refreshToken } = body

  if (!refreshToken) {
    return c.json({ error: "Refresh token required" }, 400)
  }

  // 1. Verify refresh token signature & expiry
  let payload: any
  try {
    payload = await verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
  } catch (err) {
    return c.json({ error: "Invalid or expired refresh token" }, 401)
  }

  // 2. Check it's a refresh token
  if (payload.type !== "refresh") {
    return c.json({ error: "Invalid token type" }, 401)
  }

  // 3. Find stored token(s) for this user
  const storedTokens = await db.refreshToken.findMany({
    where: {
      userId: payload.sub,
      expiresAt: { gt: new Date() }, // not expired
      revokedAt: null, // not revoked
    },
  })

  // 4. Check if provided token matches any stored hash
  let tokenRecord = null
  for (const record of storedTokens) {
    const matches = await bcrypt.compare(refreshToken, record.tokenHash)
    if (matches) {
      tokenRecord = record
      break
    }
  }

  if (!tokenRecord) {
    // Token not found = possible token reuse attack!
    // Revoke ALL tokens for this user (security measure)
    await db.refreshToken.updateMany({
      where: { userId: payload.sub },
      data: { revokedAt: new Date() },
    })
    return c.json({ error: "Token reuse detected. Please log in again." }, 401)
  }

  // 5. Revoke the old refresh token
  await db.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  })

  // 6. Get user
  const user = await db.user.findUnique({ where: { id: payload.sub } })
  if (!user) {
    return c.json({ error: "User not found" }, 401)
  }

  // 7. Issue new token pair (Refresh Token Rotation)
  const now = Math.floor(Date.now() / 1000)

  const newAccessToken = await sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + 60 * 15,
    },
    process.env.JWT_SECRET!,
  )

  const newRefreshToken = await sign(
    {
      sub: user.id,
      type: "refresh",
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    },
    process.env.JWT_REFRESH_SECRET!,
  )

  // 8. Store new refresh token hash
  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(newRefreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return c.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 900,
  })
})
```

### Logout (Revoke Tokens)

```typescript
app.post("/auth/logout", authenticate, async (c) => {
  const userId = c.get("userId")
  const body = await c.req.json<{ refreshToken?: string }>().catch(() => ({}))

  if (body.refreshToken) {
    // Revoke specific refresh token
    const stored = await db.refreshToken.findMany({
      where: { userId, revokedAt: null },
    })

    for (const record of stored) {
      const matches = await bcrypt.compare(body.refreshToken, record.tokenHash)
      if (matches) {
        await db.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        })
        break
      }
    }
  } else {
    // Logout everywhere — revoke all tokens
    await db.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    })
  }

  return c.json({ message: "Logged out successfully" })
})
```

### HttpOnly Cookie Approach (More Secure)

```typescript
// Set refresh token as HttpOnly cookie during Login
app.post("/auth/login", async (c) => {
  // ... verify credentials ...

  const accessToken = await sign({ sub: user.id, exp: now + 900 }, secret)
  const refreshToken = await sign(
    { sub: user.id, type: "refresh", exp: now + 604800 },
    refreshSecret,
  )

  // The setCookie helper securely attaches it to the HTTP response
  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true, // Crucial: Prevents JavaScript (like XSS attacks) from reading the cookie
    secure: process.env.NODE_ENV === "production", // Crucial: Only send over HTTPS in production
    sameSite: "Strict", // Crucial: Prevents CSRF attacks by ensuring the cookie is only sent for same-site requests
    maxAge: 60 * 60 * 24 * 7, // Expires in 7 days
    path: "/auth/refresh", // Security: The browser will ONLY send this cookie to the /auth/refresh endpoint, nowhere else
  })

  // We return the access token in the JSON body so the frontend JS can store it in memory.
  // The refresh token is NOT in the body, it is handled automatically by the browser via the cookie.
  return c.json({ accessToken, expiresIn: 900 })
})

// Read the cookie back during Refresh
app.post("/auth/refresh", async (c) => {
  const { getCookie } = await import("hono/cookie")

  // Extract the token directly from the incoming cookies
  const refreshToken = getCookie(c, "refreshToken")

  if (!refreshToken) {
    return c.json({ error: "No refresh token cookie found" }, 401)
  }
  // ... rest of refresh logic (verify, issue new tokens)
})
```

---

## 11. Authorization & Role-Based Access Control

### RBAC Middleware

```typescript
// Define all possible roles in the system
type Role = "user" | "moderator" | "admin" | "superadmin"

// Create a hierarchy (higher number = more privileges)
const roleHierarchy: Record<Role, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
}

// Middleware: Check if user has AT LEAST this role or higher
export function requireRole(minRole: Role) {
  return async (c: Context, next: Next) => {
    // We assume an authentication middleware ran before this and set 'userRole'
    const userRole = c.get("userRole") as Role

    // If there's no role, they aren't logged in
    if (!userRole) {
      return c.json({ error: "Not authenticated" }, 401)
    }

    // Compare their current role against the minimum required role
    if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
      return c.json(
        {
          error: "Insufficient permissions",
          required: minRole,
          current: userRole,
        },
        403, // 403 Forbidden means "I know who you are, but you can't do this"
      )
    }

    // Role is high enough, continue to the next middleware/handler
    await next()
  }
}

// Middleware: Check if user has EXACTLY one of the provided roles
export function requireAnyRole(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole") as Role

    // Simple array .includes() check
    if (!roles.includes(userRole)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    await next()
  }
}
```

### Permission-Based Access Control (PBAC)

```typescript
type Permission =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "posts:read"
  | "posts:write"
  | "posts:delete"
  | "admin:access"

const rolePermissions: Record<Role, Permission[]> = {
  user: ["posts:read", "posts:write", "users:read"],
  moderator: ["posts:read", "posts:write", "posts:delete", "users:read"],
  admin: [
    "users:read",
    "users:write",
    "posts:read",
    "posts:write",
    "posts:delete",
  ],
  superadmin: [
    "users:read",
    "users:write",
    "users:delete",
    "posts:read",
    "posts:write",
    "posts:delete",
    "admin:access",
  ],
}

export function requirePermission(permission: Permission) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole") as Role
    const permissions = rolePermissions[userRole] || []

    if (!permissions.includes(permission)) {
      return c.json({ error: `Missing permission: ${permission}` }, 403)
    }

    await next()
  }
}

// Usage
app.delete(
  "/users/:id",
  authenticate,
  requirePermission("users:delete"),
  deleteUser,
)
```

### Resource Ownership Check

```typescript
// Can only access your own resources (unless admin)
export const requireOwnerOrAdmin: MiddlewareHandler = async (c, next) => {
  const userId = c.get("userId")
  const userRole = c.get("userRole")
  const resourceUserId = c.req.param("userId")

  if (userRole === "admin" || userRole === "superadmin") {
    return next() // Admins can access anything
  }

  if (userId !== resourceUserId) {
    return c.json({ error: "Access denied: not your resource" }, 403)
  }

  await next()
}

app.get(
  "/users/:userId/settings",
  authenticate,
  requireOwnerOrAdmin,
  getSettings,
)
```

---

## 12. Validation — Zod + Hono Validator

### Setup

```bash
npm install zod @hono/zod-validator
```

### Request Validation

```typescript
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

// JSON body validation schema
// This strictly defines what the incoming request body *must* look like
const createUserSchema = z.object({
  name: z.string().min(2).max(100), // Enforces length constraints
  email: z.string().email(), // Enforces standard email format
  password: z
    .string()
    .min(8)
    .regex(
      // Enforces a strong password policy via Regex
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/,
      "Password must contain uppercase, number, and special char",
    ),
  role: z.enum(["user", "admin"]).default("user"), // Must be one of these exact strings. Defaults to 'user' if omitted.
  age: z.number().int().min(13).max(120).optional(), // Number must be an integer and is entirely optional
})

// Query params automatically come in as strings. Zod can transform them to numbers for us!
const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"), // Takes "1", converts to number 1, ensures it's >= 1
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default("10"), // Takes "10", converts to number, restricts between 1 and 100
  sortBy: z.enum(["createdAt", "name", "email"]).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
})

// Applying the validator to the 'query' string of a GET request
app.get("/users", zValidator("query", paginationSchema), async (c) => {
  // If the query was invalid, Zod automatically blocks the request and returns a 400 Bad Request
  // If we reach this line, 'c.req.valid' gives us the fully typed, safely transformed object
  const { page, limit, sortBy, order } = c.req.valid("query")
  // TypeScript knows 'page' is a number, not a string!
  return c.json({ page, limit })
})

// Applying the validator to the 'json' body of a POST request
app.post("/users", zValidator("json", createUserSchema), async (c) => {
  const body = c.req.valid("json") // Fully typed!
  // body.email is guaranteed to be a valid email string, body.role is 'user' | 'admin', etc.
  return c.json({ created: body }, 201)
})
```

### Custom Validation Error Response

```typescript
app.post(
  "/users",
  zValidator("json", createUserSchema, (result, c) => {
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return c.json(
        {
          error: "Validation failed",
          fields: errors,
        },
        422,
      )
    }
  }),
  createUserHandler,
)
```

### URL Params Validation

```typescript
const paramsSchema = z.object({
  id: z.string().uuid("Must be a valid UUID"),
})

app.get("/users/:id", zValidator("param", paramsSchema), async (c) => {
  const { id } = c.req.valid("param")
  return c.json({ id })
})
```

### Header Validation

```typescript
const headersSchema = z.object({
  "x-api-key": z.string().min(32),
  "content-type": z.literal("application/json"),
})

app.post("/api/webhook", zValidator("header", headersSchema), webhookHandler)
```

---

## 13. Error Handling

### Global Error Handler

```typescript
import { HTTPException } from "hono/http-exception"

// Create a Custom Error class tailored for our application
// Extends the built-in JS Error so it captures stack traces natively
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500, // HTTP status to send back
    public code?: string, // Custom app-specific error code (e.g. 'USER_NOT_FOUND')
    public details?: unknown, // Any extra debugging data
  ) {
    super(message)
    this.name = "AppError"
  }
}

// Register global error handler. This catches ANY error thrown anywhere in the app
app.onError((err, c) => {
  console.error("Unhandled error:", err) // Always log the raw error for the server console

  // 1. Is it a built-in Hono HTTPException? (e.g., thrown manually via `throw new HTTPException(...)`)
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status,
    )
  }

  // 2. Is it our custom AppError?
  if (err instanceof AppError) {
    return c.json(
      {
        error: err.message,
        code: err.code,
        details: err.details,
      },
      err.statusCode as any,
    )
  }

  // 3. Is it a Zod Validation Error? (Usually handled by zValidator, but just in case)
  if (err.name === "ZodError") {
    return c.json(
      {
        error: "Validation failed",
        details: JSON.parse(err.message),
      },
      422, // 422 Unprocessable Entity
    )
  }

  // 4. Is it a JWT parsing error?
  if (err.name === "JwtTokenExpired") {
    return c.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, 401)
  }

  // 5. Fallback: Unknown errors (e.g., Database went down, null pointer exception)
  const isDev = process.env.NODE_ENV === "development"
  return c.json(
    {
      // NEVER leak raw error messages to the client in production! They can contain SQL queries or secrets.
      error: isDev ? err.message : "Internal server error",
      ...(isDev && { stack: err.stack }), // Only include stack trace if locally developing
    },
    500,
  )
})

// 404 handler for routes that don't exist
app.notFound((c) => {
  return c.json(
    {
      error: `Route ${c.req.method} ${c.req.path} not found`,
      status: 404,
    },
    404, // Must explicitly return the 404 status code number here too
  )
})
```

### Using HTTPException

```typescript
import { HTTPException } from "hono/http-exception"

app.get("/users/:id", async (c) => {
  const user = await db.user.findUnique({
    where: { id: c.req.param("id") },
  })

  if (!user) {
    // Unlike c.json(..., 404), this instantly stops execution and jumps to `app.onError`
    // This is useful deeply nested inside Service classes where you don't have access to the 'c' object.
    throw new HTTPException(404, { message: "User not found" })
  }

  return c.json(user)
})
```

### Async Error Wrapper

```typescript
// Wrap async handlers to catch errors
function asyncHandler(fn: (c: Context) => Promise<Response>) {
  return async (c: Context) => {
    try {
      return await fn(c)
    } catch (err) {
      throw err // Let global handler deal with it
    }
  }
}

// Or just use try/catch in handlers
app.get("/risky", async (c) => {
  try {
    const data = await riskyOperation()
    return c.json(data)
  } catch (err) {
    return c.json({ error: "Something went wrong" }, 500)
  }
})
```

---

## 14. Environment Variables & Configuration

### Type-Safe Env Configuration

```typescript
// src/config/env.ts
import { z } from "zod"

// Define the exact shape and requirements of your .env file
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"), // Parse string to Number

  // Database
  DATABASE_URL: z.string().url(), // Strictly checks if it's a valid URL format

  // JWT
  JWT_SECRET: z.string().min(32), // Forces you to use a secret of at least 32 characters for security
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // CORS
  CORS_ORIGINS: z.string().transform((s) => s.split(",")), // Allows parsing "http://localhost:3000,https://app.com" into an array

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),

  // Optional External Services
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
})

// Extract the inferred TypeScript type from the Zod Schema
type Env = z.infer<typeof envSchema>

// Function to strictly parse and return the environment variables
function validateEnv(): Env {
  // safeParse doesn't throw automatically on failure
  const result = envSchema.safeParse(process.env)

  // If validation fails
  if (!result.success) {
    console.error("❌ Invalid environment variables:")
    console.error(result.error.flatten().fieldErrors)
    // Crash the application IMMEDIATELY.
    // It's better to crash at startup than run with missing database URLs or weak secrets!
    process.exit(1)
  }

  // Returns the safely parsed, correctly typed variables
  return result.data
}

// Export the singleton instance. We run this exactly once at boot up.
export const env = validateEnv()
```

```typescript
// src/index.ts
import { env } from "./config/env"

// Use like this everywhere
const secret = env.JWT_SECRET // Typed, validated
```

### Cloudflare Workers Bindings

```typescript
// wrangler.toml
// [vars]
// NODE_ENV = "production"

type Bindings = {
  JWT_SECRET: string
  DATABASE_URL: string
  KV_NAMESPACE: KVNamespace
  R2_BUCKET: R2Bucket
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get("/", (c) => {
  const secret = c.env.JWT_SECRET // Typed CF binding
  return c.text("ok")
})
```

---

## 15. Database Integration

### Prisma + Hono

```bash
npm install prisma @prisma/client
npx prisma init
```

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client"

// Global declaration is needed to prevent hot-reloading in dev from creating too many DB connections
declare global {
  var __db: PrismaClient | undefined
}

// Prevent multiple connections in development
// If __db exists (because it was set in a previous hot-reload), use it. Otherwise, create a new connection.
export const db =
  globalThis.__db ??
  new PrismaClient({
    // Only log SQL queries in development mode for easier debugging
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

// In development, save the connection to the global object so it survives hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db
}
```

### Drizzle ORM + Hono (Edge-Compatible)

```bash
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit
```

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client)

// schema.ts
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
})
```

### Repository Pattern

```typescript
// The Repository Pattern separates Database logic from HTTP logic (Controllers) and Business logic (Services).
// This makes the code much easier to test, and if you ever swap Prisma for Drizzle, you only change code here.

// src/repositories/user.repository.ts
import { db } from "../lib/db"
import { users } from "../lib/schema"
import { eq, like, and, desc } from "drizzle-orm"

// Data Transfer Objects (DTOs) define exactly what data is needed to perform an action
export interface CreateUserDTO {
  email: string
  passwordHash: string
  role?: "user" | "admin"
}

export interface FindUsersOptions {
  page: number
  limit: number
  search?: string
  role?: string
}

export class UserRepository {
  // Encapsulates the specific ORM syntax to find a user by ID
  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return result[0] ?? null
  }

  // Find by Email
  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return result[0] ?? null
  }

  // Complex querying (Pagination, Filtering, Sorting) grouped in one clean method
  async findMany({ page, limit, search, role }: FindUsersOptions) {
    const conditions = [] // Build dynamic WHERE clauses

    // If a search term is provided, use the SQL 'LIKE' operator on the email
    if (search) conditions.push(like(users.email, `%${search}%`))
    // If a role filter is provided, enforce exact match
    if (role) conditions.push(eq(users.role, role as any))

    const offset = (page - 1) * limit // Calculate starting point for pagination

    return db
      .select()
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt)) // Newest first
      .limit(limit)
      .offset(offset)
  }

  async create(data: CreateUserDTO) {
    const id = crypto.randomUUID() // Generate a unique ID (UUIDv4)
    await db.insert(users).values({ id, ...data }) // Insert into DB
    return this.findById(id) // Return the newly created record
  }

  async update(id: string, data: Partial<CreateUserDTO>) {
    await db.update(users).set(data).where(eq(users.id, id))
    return this.findById(id)
  }

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id))
  }
}

// Export a single, reusable instance
export const userRepository = new UserRepository()
```

---

## 16. File Uploads

```typescript
import { Hono } from "hono"

app.post("/upload", async (c) => {
  // c.req.formData() parses multipart/form-data requests out of the box
  const form = await c.req.formData()
  const file = form.get("file") as File

  if (!file) {
    return c.json({ error: "No file provided" }, 400)
  }

  // 1. Validate file type (Don't let users upload scripts or executables!)
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]
  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { error: "Invalid file type. Only JPG, PNG, WEBP, and PDF allowed." },
      415,
    )
  }

  // 2. Validate file size (e.g., max 5MB) to prevent denial of service by uploading massive files
  if (file.size > 5 * 1024 * 1024) {
    // 5 Megabytes
    return c.json({ error: "File too large (max 5MB)" }, 413) // 413 Payload Too Large
  }

  // 3. Process the file data into a raw buffer
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // 4. Generate a unique, safe filename. Replacing spaces with dashes prevents URL issues.
  const filename = `uploads/${Date.now()}-${file.name.replace(/\s/g, "-")}`

  // 5. Upload to S3 / AWS / Cloudflare R2
  // e.g. await s3.upload(filename, bytes)

  // 6. Return success response with a public URL
  return c.json(
    {
      filename,
      size: file.size,
      type: file.type,
      url: `https://cdn.yourdomain.com/${filename}`,
    },
    201,
  )
})

// Multiple files
app.post("/upload/multiple", async (c) => {
  const form = await c.req.formData()
  const files = form.getAll("files") as File[]

  const results = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer()
      // process each file
      return { name: file.name, size: file.size }
    }),
  )

  return c.json({ uploaded: results })
})
```

---

## 17. Rate Limiting

### Custom Rate Limiter (In-Memory)

```typescript
// src/middleware/rateLimiter.ts
interface RateRecord {
  count: number // How many requests they've made
  resetAt: number // Timestamp when their limit resets
}

// In-memory store mapping IPs (or user IDs) to their record.
// Note: This resets if the server restarts.
const store = new Map<string, RateRecord>()

interface RateLimiterOptions {
  windowMs: number // Time window in ms
  max: number // Max requests per window
  keyGenerator?: (c: Context) => string // Function to define who is making the request (e.g. by IP or Header)
  message?: string // Custom error message
}

export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs = 60_000, // Default 1 minute
    max = 60, // Default 60 requests per minute
    // 'x-forwarded-for' is usually set by reverse proxies (like Nginx/Cloudflare) passing the real user IP
    keyGenerator = (c) => c.req.header("x-forwarded-for") ?? "unknown",
    message = "Too many requests, please try again later.",
  } = options

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c) // E.g., "192.168.1.1"
    const now = Date.now()

    const record = store.get(key)

    // Scenario 1: First time visitor OR their old limit expired
    if (!record || now > record.resetAt) {
      // Create a fresh record
      store.set(key, { count: 1, resetAt: now + windowMs })

      // Standard Rate Limit Headers (Good practice)
      c.header("X-RateLimit-Limit", String(max))
      c.header("X-RateLimit-Remaining", String(max - 1)) // 1 used, 59 left
      c.header("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)))

      return next() // Allow request
    }

    // Scenario 2: Visitor exists, but has exceeded the limit 'max'
    if (record.count >= max) {
      // Send headers indicating they are out of requests
      c.header("X-RateLimit-Limit", String(max))
      c.header("X-RateLimit-Remaining", "0")
      c.header("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)))
      // 'Retry-After' is standard HTTP telling the client how many seconds to wait
      c.header("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)))

      return c.json({ error: message }, 429) // 429 Too Many Requests
    }

    // Scenario 3: Visitor exists, and is still under the limit
    record.count++
    c.header("X-RateLimit-Limit", String(max))
    c.header("X-RateLimit-Remaining", String(max - record.count))

    return next() // Allow request
  }
}

// Usage
// Strict: 5 requests per 15 minutes for auth endpoints (prevents brute forcing)
app.use("/api/auth/*", rateLimiter({ windowMs: 15 * 60_000, max: 5 }))
// Lenient: 60 requests per minute for general API usage
app.use("/api/*", rateLimiter({ windowMs: 60_000, max: 60 }))
```

### Redis-Based Rate Limiter (Production)

```typescript
import { createClient } from "redis"

// Connect to Redis instance
// Redis is an external database, meaning the rate limit applies across multiple servers!
const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

export function redisRateLimiter(windowMs: number, max: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") ?? "unknown"
    // Create a time-bucketed Redis Key.
    // E.g. "rl:192.168.1.1:2839483" (changes every 'windowMs' milliseconds)
    const key = `rl:${ip}:${Math.floor(Date.now() / windowMs)}`

    // Atomically increment the key in Redis
    const count = await redis.incr(key)

    // First time we hit this key, give it an expiration time so Redis auto-cleans it up
    if (count === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000))
    }

    if (count > max) {
      return c.json({ error: "Rate limit exceeded" }, 429)
    }

    c.header("X-RateLimit-Remaining", String(max - count))
    await next()
  }
}
```

---

## 18. Logging & Monitoring

### Structured Logger

```typescript
// src/lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  method?: string
  path?: string
  status?: number
  duration?: number
  error?: string
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV !== "production"

  private log(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {},
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }

    if (this.isDev) {
      const colors = {
        debug: "\x1b[37m",
        info: "\x1b[36m",
        warn: "\x1b[33m",
        error: "\x1b[31m",
      }
      console.log(
        `${colors[level]}[${level.toUpperCase()}]\x1b[0m ${message}`,
        meta,
      )
    } else {
      console.log(JSON.stringify(entry))
    }
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.log("debug", msg, meta)
  }
  info(msg: string, meta?: Record<string, unknown>) {
    this.log("info", msg, meta)
  }
  warn(msg: string, meta?: Record<string, unknown>) {
    this.log("warn", msg, meta)
  }
  error(msg: string, meta?: Record<string, unknown>) {
    this.log("error", msg, meta)
  }
}

export const logger = new Logger()
```

### Request Logger Middleware

```typescript
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  c.set("requestId", requestId)
  c.header("X-Request-Id", requestId)

  logger.info("Incoming request", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    ip: c.req.header("x-forwarded-for"),
    userAgent: c.req.header("user-agent"),
  })

  await next()

  const duration = Date.now() - start

  logger.info("Request completed", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  })
}

app.use("*", requestLogger)
```

---

## 19. Project Architecture — Senior Level

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│               Routes / Controllers           │  ← HTTP layer, thin handlers
├─────────────────────────────────────────────┤
│               Services / Use Cases           │  ← Business logic
├─────────────────────────────────────────────┤
│               Repositories                  │  ← Data access, DB queries
├─────────────────────────────────────────────┤
│               Database / External APIs       │  ← Infrastructure
└─────────────────────────────────────────────┘
```

**Rules:**

- Routes know nothing about databases
- Services know nothing about HTTP
- Repositories know nothing about business rules
- Each layer communicates only with the layer directly below it

### Service Pattern

```typescript
// src/services/user.service.ts
import { userRepository } from "../repositories/user.repository"
import { hashPassword, comparePassword } from "../lib/password"
import { AppError } from "../lib/errors"

// The Service layer encapsulates the "What" your app does (business rules).
// Notice it doesn't take the Hono `c` (Context) object directly. It just takes raw data.
export class UserService {
  async register(email: string, password: string) {
    // 1. Business rule: check for duplicate email
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new AppError("Email already in use", 409, "EMAIL_TAKEN")
    }

    // 2. Business rule: hash password for security
    const passwordHash = await hashPassword(password)

    // 3. Delegate database insertion to Repository
    return userRepository.create({ email, passwordHash })
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND")
    }

    // Business rule: Remove sensitive fields before returning the user profile
    const { passwordHash, ...profile } = user
    return profile
  }

  async updateProfile(userId: string, data: { name?: string }) {
    const user = await userRepository.findById(userId)
    if (!user) throw new AppError("User not found", 404)

    return userRepository.update(userId, data)
  }
}

export const userService = new UserService()
```

### Controller Pattern (Thin Handlers)

```typescript
// src/controllers/user.controller.ts
import { Context } from "hono"
import { userService } from "../services/user.service"

// Controllers are "HTTP glue". They extract data from requests, give it to the Service, and return responses.
export const userController = {
  async getMe(c: Context) {
    // 1. Extract data (userId set by middleware)
    const userId = c.get("userId")
    // 2. Call service layer
    const profile = await userService.getProfile(userId)
    // 3. Send response
    return c.json(profile)
  },

  async updateMe(c: Context) {
    const userId = c.get("userId")
    // c.req.valid handles extracting the safely validated JSON
    const body = c.req.valid("json" as any)
    const updated = await userService.updateProfile(userId, body)
    return c.json(updated)
  },

  async deleteAccount(c: Context) {
    const userId = c.get("userId")
    await userService.deleteUser(userId) // (Assuming deleteUser exists in service)
    return c.json({ message: "Account deleted" })
  },
}
```

---

## 20. Scalable Folder Structure

```
my-api/
├── src/
│   ├── index.ts                  ← Entry point
│   ├── app.ts                    ← App factory (no server.listen here)
│   │
│   ├── config/
│   │   ├── env.ts                ← Validated env vars
│   │   ├── cors.ts               ← CORS configuration
│   │   └── constants.ts          ← App-wide constants
│   │
│   ├── routes/
│   │   ├── index.ts              ← Route aggregator
│   │   ├── auth.routes.ts        ← /auth/*
│   │   ├── user.routes.ts        ← /users/*
│   │   ├── post.routes.ts        ← /posts/*
│   │   └── admin.routes.ts       ← /admin/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── post.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── post.service.ts
│   │   └── email.service.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── post.repository.ts
│   │   └── token.repository.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts       ← JWT verification
│   │   ├── authorize.ts          ← Role/permission checks
│   │   ├── rateLimiter.ts
│   │   ├── requestLogger.ts
│   │   └── validate.ts           ← Validation helpers
│   │
│   ├── lib/
│   │   ├── db.ts                 ← Database client
│   │   ├── redis.ts              ← Redis client
│   │   ├── password.ts           ← bcrypt helpers
│   │   ├── jwt.ts                ← JWT sign/verify helpers
│   │   ├── errors.ts             ← Custom error classes
│   │   └── logger.ts             ← Logger instance
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts        ← Zod schemas for auth
│   │   ├── user.schema.ts        ← Zod schemas for users
│   │   └── post.schema.ts
│   │
│   └── types/
│       ├── index.ts              ← Global types
│       ├── hono.d.ts             ← Hono type augmentation
│       └── db.ts                 ← DB entity types
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── prisma/  (or drizzle/)
│   ├── schema.prisma
│   └── migrations/
│
├── .env
├── .env.example
├── .env.test
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### App Factory Pattern

```typescript
// src/app.ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { compress } from "hono/compress"
import { getCorsConfig } from "./config/cors"
import { registerRoutes } from "./routes"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler"
import { requestLogger } from "./middleware/requestLogger"

export function createApp() {
  const app = new Hono()

  // Global middleware (order matters!)
  app.use("*", logger())
  app.use("*", requestLogger)
  app.use("*", secureHeaders())
  app.use("*", cors(getCorsConfig()))
  app.use("*", compress())

  // Register all routes
  registerRoutes(app)

  // Error handlers (must be LAST)
  app.onError(errorHandler)
  app.notFound(notFoundHandler)

  return app
}

// src/index.ts
import { serve } from "@hono/node-server"
import { createApp } from "./app"
import { env } from "./config/env"
import { logger } from "./lib/logger"

const app = createApp()

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`🔥 Server running on http://localhost:${info.port}`, {
      env: env.NODE_ENV,
      port: info.port,
    })
  },
)
```

### Route Registration

```typescript
// src/routes/index.ts
import type { Hono } from "hono"
import { authRoutes } from "./auth.routes"
import { userRoutes } from "./user.routes"
import { postRoutes } from "./post.routes"
import { adminRoutes } from "./admin.routes"

export function registerRoutes(app: Hono) {
  // Health check (no auth)
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  )

  // API routes
  app.route("/auth", authRoutes)
  app.route("/users", userRoutes)
  app.route("/posts", postRoutes)
  app.route("/admin", adminRoutes)
}

// src/routes/user.routes.ts
import { Hono } from "hono"
import { authenticate } from "../middleware/authenticate"
import { requireRole } from "../middleware/authorize"
import { zValidator } from "@hono/zod-validator"
import { updateUserSchema } from "../schemas/user.schema"
import { userController } from "../controllers/user.controller"

const router = new Hono()

// Apply auth to all user routes
router.use("*", authenticate)

router.get("/me", userController.getMe)
router.patch(
  "/me",
  zValidator("json", updateUserSchema),
  userController.updateMe,
)
router.delete("/me", userController.deleteAccount)

// Admin only
router.get("/", requireRole("admin"), userController.getAll)
router.delete("/:id", requireRole("admin"), userController.deleteById)

export { router as userRoutes }
```

---

## 21. Testing with Hono

### Setup

```bash
npm install -D vitest @vitest/coverage-v8 supertest
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
})
```

### Unit Testing Handlers

```typescript
// tests/unit/user.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createApp } from "../../src/app"
import { userService } from "../../src/services/user.service"

// 1. Mock the entire Service layer
// This is a Unit test for the Controller/Route. We don't want to actually hit the database!
vi.mock("../../src/services/user.service")

describe("User Routes", () => {
  // Create an instance of the Hono app for testing
  const app = createApp()

  beforeEach(() => {
    // Reset all mock counters between tests to avoid memory leaks or cross-contamination
    vi.clearAllMocks()
  })

  it("GET /users/me returns user profile", async () => {
    const mockUser = { id: "123", email: "test@test.com", role: "user" }

    // 2. Tell the mocked service exactly what to return when it is called
    vi.mocked(userService.getProfile).mockResolvedValue(mockUser)

    // 3. Make a fake HTTP request directly to the Hono app instance
    // Hono is incredibly testable because `app.request` simulates a real Request without needing a server to listen on a port!
    const res = await app.request("/users/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer valid-token-here",
      },
    })

    // 4. Assert the expectations
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(mockUser) // Ensure the controller correctly returned the mocked user data
  })

  it("GET /users/me returns 401 without token", async () => {
    // Send request without the Authorization header
    const res = await app.request("/users/me", { method: "GET" })

    // Middleware should block it
    expect(res.status).toBe(401)
  })
})
```

### Integration Testing with Real DB

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createApp } from "../../src/app"
import { db } from "../../src/lib/db"

const app = createApp()

describe("Auth Flow Integration", () => {
  let accessToken: string
  let refreshToken: string
  const testEmail = `test-${Date.now()}@example.com`

  afterAll(async () => {
    // Cleanup test data
    await db.user.deleteMany({ where: { email: testEmail } })
  })

  it("registers a new user", async () => {
    const res = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "SecurePass1!" }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.user.email).toBe(testEmail)
  })

  it("logs in with correct credentials", async () => {
    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "SecurePass1!" }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()

    accessToken = body.accessToken
    refreshToken = body.refreshToken
  })

  it("accesses protected route with access token", async () => {
    const res = await app.request("/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.status).toBe(200)
  })

  it("refreshes tokens", async () => {
    const res = await app.request("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.accessToken).not.toBe(accessToken) // New token
  })
})
```

---

## 22. Deployment Targets

### Node.js with PM2

```bash
npm install pm2 -g
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-api",
      script: "dist/index.js",
      instances: "max", // Use all CPU cores
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
}
```

```bash
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Cloudflare Workers

```bash
npm install wrangler -g
wrangler deploy
```

```toml
# wrangler.toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

[[kv_namespaces]]
binding = "SESSIONS"
id = "abc123"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "abc123"
```

### Bun

```typescript
// index.ts
import { Hono } from "hono"

const app = new Hono()
app.get("/", (c) => c.text("Hello Bun!"))

export default {
  port: 3000,
  fetch: app.fetch,
}
```

```bash
bun run index.ts
# Or production:
bun build index.ts --target=bun --outdir=dist
bun run dist/index.js
```

---

## 23. Security Best Practices

### Security Headers

```typescript
import { secureHeaders } from "hono/secure-headers"

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
)
```

### Input Sanitization

```typescript
// Never trust user input. If you display it back to other users, they could inject malicious `<script>` tags (XSS Attack)
function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, "") // Very basic XSS protection: Remove HTML tags (Better to use DOMPurify)
    .trim() // Remove accidental whitespace
    .slice(0, 1000) // Limit length to prevent memory exhaustion attacks
}

// SQL INJECTION PROTECTION:
// Always use parameterized queries. Thankfully, ORMs handle this automatically.

// ❌ NEVER DO THIS: (String interpolation allows SQL Injection)
// If id was "1' OR '1'='1", this query returns ALL users!
const user = await db.query(`SELECT * FROM users WHERE id = '${id}'`)

// ✅ ALWAYS DO THIS: (Variables are sent separately from the SQL string to the database engine)
const user = await db.user.findUnique({ where: { id } }) // Prisma (Safe)
// or
const user = await db.select().from(users).where(eq(users.id, id)) // Drizzle (Safe)
```

### Password Hashing

```typescript
// src/lib/password.ts
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12 // Higher = more secure but slower

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Prevent Timing Attacks

```typescript
// Timing Attacks: If you check passwords character by character, an attacker can
// measure the microscopic time difference it takes to fail "P@ssword" vs "Hacker"
// and slowly guess your secrets one letter at a time.

import { timingSafeEqual } from "crypto"

// Always use constant-time comparison for secrets (like Webhook Signatures or API Keys)
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)

  if (bufA.length !== bufB.length) {
    // EVEN IF lengths mismatch (meaning they definitely aren't equal),
    // we still do the comparison against a blank buffer to ensure the CPU math takes the exact same amount of time.
    timingSafeEqual(bufA, Buffer.alloc(bufA.length))
    return false
  }

  // This operation takes the exact same amount of milliseconds regardless of how many letters match
  return timingSafeEqual(bufA, bufB)
}
```

### CSRF Protection

```typescript
import { csrf } from "hono/csrf"

// Only needed if you're using cookies for auth
app.use(
  "/api/*",
  csrf({
    origin: "https://yourdomain.com",
  }),
)
```

---

## 24. Performance Optimization

### Response Caching

```typescript
import { cache } from "hono/cache"

// Cache public routes
app.get(
  "/api/posts",
  cache({
    cacheName: "posts-cache",
    cacheControl: "public, max-age=300", // 5 min
  }),
  getPosts,
)

// ETag support for conditional requests
import { etag } from "hono/etag"
app.use("*", etag())
```

### Connection Pooling

```typescript
// PgBouncer or built-in pooling
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
})
```

### Pagination Best Practices

```typescript
// ❌ OFFSET pagination (slow for large datasets)
SELECT * FROM posts ORDER BY id LIMIT 10 OFFSET 10000

// ✅ CURSOR pagination (consistent performance)
app.get('/posts', async (c) => {
  const cursor = c.req.query('cursor')  // Last item's ID
  const limit = 20

  const posts = await db.post.findMany({
    take: limit + 1,        // Fetch one extra to check if more
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = posts.length > limit
  if (hasMore) posts.pop()  // Remove the extra item

  return c.json({
    data: posts,
    nextCursor: hasMore ? posts[posts.length - 1].id : null,
    hasMore,
  })
})
```

---

## 25. Advanced Patterns

### Dependency Injection

```typescript
// src/lib/container.ts
import { UserRepository } from "../repositories/user.repository"
import { UserService } from "../services/user.service"
import { AuthService } from "../services/auth.service"

// Simple container
export function buildContainer() {
  const userRepo = new UserRepository()
  const userService = new UserService(userRepo)
  const authService = new AuthService(userRepo)

  return { userRepo, userService, authService }
}

export const container = buildContainer()
```

### Request Scoped Context (for tracing)

```typescript
// Attach trace ID to everything
app.use("*", async (c, next) => {
  const traceId = c.req.header("x-trace-id") ?? crypto.randomUUID()
  c.set("traceId", traceId)
  c.header("x-trace-id", traceId)
  await next()
})
```

### Versioned APIs

```typescript
// v1 and v2 running side by side
const v1 = new Hono()
const v2 = new Hono()

v1.get("/users", v1GetUsers)
v2.get("/users", v2GetUsers) // New shape/features

app.route("/api/v1", v1)
app.route("/api/v2", v2)
```

### Pagination Helpers

```typescript
// src/lib/pagination.ts
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function paginate<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
) {
  return {
    data,
    meta: buildPaginationMeta(page, limit, total),
  }
}
```

---

## 26. WebSockets with Hono

```typescript
// Node.js WebSocket with Hono
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { createNodeWebSocket } from "@hono/node-ws"

const app = new Hono()

// Hono doesn't have WebSockets built into the core API because every platform (Node, Deno, Bun, Cloudflare)
// handles WebSockets completely differently. We use adapters like `@hono/node-ws` to bridge the gap.
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

// WebSocket endpoint definition
app.get(
  "/ws",
  // `upgradeWebSocket` intercepts the standard HTTP GET request and upgrades it to a WS channel
  upgradeWebSocket((c) => {
    const userId = c.req.query("userId")

    // Returns a WebSocket lifecycle object
    return {
      // Triggered the exact moment a client successfully connects
      onOpen(event, ws) {
        console.log(`User ${userId} connected`)
        // Send a welcome message back to the client
        ws.send(JSON.stringify({ type: "connected", userId }))
      },

      // Triggered every time the client sends a message to the server
      onMessage(event, ws) {
        // Parse the incoming string into a JSON object
        const data = JSON.parse(event.data.toString())

        // Basic ping/pong heartbeat to keep the connection alive
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }))
        }

        // Broadcast or echo data
        ws.send(JSON.stringify({ type: "echo", data }))
      },

      // Triggered when the client disconnects or the network drops
      onClose(event, ws) {
        console.log(`User ${userId} disconnected`)
      },

      // Triggered on connection errors
      onError(event, ws) {
        console.error("WebSocket error:", event)
      },
    }
  }),
)

// Standard REST endpoints still work alongside WebSockets on the same port!
app.get("/health", (c) => c.json({ status: "ok" }))

const server = serve({ fetch: app.fetch, port: 3000 })

// IMPORTANT: You must inject the WebSocket capabilities into the running Node.js server instance
injectWebSocket(server)
```

---

## 27. Streaming Responses

```typescript
// Stream large data
// Instead of building a massive array in RAM and returning it all at once,
// we stream it piece-by-piece to keep server memory usage near zero.
app.get("/stream/data", (c) => {
  return c.stream(async (stream) => {
    const items = await getLargeDataset() // Assuming this returns a cursor/iterator

    for (const item of items) {
      await stream.write(JSON.stringify(item) + "\n")
      // Flush each item immediately to the client so they start seeing data instantly
    }
  })
})

// Server-Sent Events (SSE) — for unidirectional real-time updates (Server -> Client)
// Lighter than WebSockets. Great for notifications, live sports scores, or AI typing indicators.
app.get("/events", (c) => {
  return c.stream(async (stream) => {
    const encoder = new TextEncoder()

    // Required SSE headers to keep the HTTP connection open infinitely
    c.header("Content-Type", "text/event-stream")
    c.header("Cache-Control", "no-cache")
    c.header("Connection", "keep-alive")

    let counter = 0
    // Send an event every 1 second
    const interval = setInterval(async () => {
      // SSE format dictates that data must start with 'data: ' and end with '\n\n'
      const event = `data: ${JSON.stringify({ count: counter++, time: Date.now() })}\n\n`
      await stream.write(encoder.encode(event))

      if (counter >= 10) {
        clearInterval(interval)
        stream.close() // Close the connection after 10 seconds
      }
    }, 1000)
  })
})

// Streaming AI responses (e.g., Anthropic/OpenAI) using `streamText`
app.post("/ai/chat", authenticate, async (c) => {
  const { message } = await c.req.json()

  // c.streamText automatically handles text encoding and streaming headers
  return c.streamText(async (stream) => {
    const aiStream = await getAIStream(message) // e.g. OpenAI completion stream

    // Loop over the stream chunks as they arrive from the AI provider
    for await (const chunk of aiStream) {
      await stream.write(chunk) // Instantly forward the text chunk to the frontend
    }
  })
})
```

---

## 28. Full Production Example

Here's a complete mini-application putting everything together:

```typescript
// ============================================================
// src/app.ts — Full production app
// ============================================================
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { compress } from "hono/compress"
import { HTTPException } from "hono/http-exception"
import { sign, verify } from "hono/jwt"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

// ---- Types ----
type Variables = {
  userId: string
  userEmail: string
  userRole: string
}

const app = new Hono<{ Variables: Variables }>()

// ---- Global Middleware ----
app.use("*", logger())
app.use("*", compress())
app.use("*", secureHeaders())
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
)

// Request ID middleware
app.use("*", async (c, next) => {
  c.header("X-Request-Id", crypto.randomUUID())
  await next()
})

// ---- Middleware ----
const JWT_SECRET =
  process.env.JWT_SECRET || "supersecretdevkey-changeinproduction"

const authenticate = async (c: any, next: any) => {
  const auth = c.req.header("Authorization")
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Authentication required" }, 401)
  }

  try {
    const token = auth.slice(7)
    const payload = await verify(token, JWT_SECRET)
    c.set("userId", payload.sub)
    c.set("userEmail", payload.email)
    c.set("userRole", payload.role)
    await next()
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401)
  }
}

const requireAdmin = async (c: any, next: any) => {
  if (c.get("userRole") !== "admin") {
    return c.json({ error: "Admin access required" }, 403)
  }
  await next()
}

// ---- Schemas ----
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// ---- In-memory "DB" for this example ----
const users: any[] = []
const refreshTokens = new Set<string>()

// ---- Auth Routes ----
const auth = new Hono()

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password, name } = c.req.valid("json")

  if (users.find((u) => u.email === email)) {
    return c.json({ error: "Email already registered" }, 409)
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: password, // In production: bcrypt.hash(password, 12)
    role: "user",
    createdAt: new Date().toISOString(),
  }

  users.push(user)

  const { passwordHash, ...safeUser } = user
  return c.json({ user: safeUser }, 201)
})

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")

  const user = users.find((u) => u.email === email)

  // In production: bcrypt.compare(password, user.passwordHash)
  if (!user || user.passwordHash !== password) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  const now = Math.floor(Date.now() / 1000)

  const accessToken = await sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + 900, // 15 min
    },
    JWT_SECRET,
  )

  const refreshToken = await sign(
    {
      sub: user.id,
      type: "refresh",
      iat: now,
      exp: now + 604800, // 7 days
    },
    JWT_SECRET + "_refresh",
  )

  refreshTokens.add(refreshToken)

  return c.json({ accessToken, refreshToken, expiresIn: 900 })
})

auth.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json()

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return c.json({ error: "Invalid refresh token" }, 401)
  }

  try {
    const payload = await verify(refreshToken, JWT_SECRET + "_refresh")

    if (payload.type !== "refresh") throw new Error("Not a refresh token")

    const user = users.find((u) => u.id === payload.sub)
    if (!user) return c.json({ error: "User not found" }, 401)

    // Rotate: revoke old, issue new
    refreshTokens.delete(refreshToken)

    const now = Math.floor(Date.now() / 1000)

    const newAccessToken = await sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: now,
        exp: now + 900,
      },
      JWT_SECRET,
    )

    const newRefreshToken = await sign(
      {
        sub: user.id,
        type: "refresh",
        iat: now,
        exp: now + 604800,
      },
      JWT_SECRET + "_refresh",
    )

    refreshTokens.add(newRefreshToken)

    return c.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch {
    return c.json({ error: "Invalid or expired refresh token" }, 401)
  }
})

auth.post("/logout", authenticate, async (c) => {
  // In production: revoke from DB
  return c.json({ message: "Logged out" })
})

// ---- User Routes ----
const userRoutes = new Hono<{ Variables: Variables }>()

userRoutes.use("*", authenticate)

userRoutes.get("/me", (c) => {
  const user = users.find((u) => u.id === c.get("userId"))
  if (!user) return c.json({ error: "Not found" }, 404)

  const { passwordHash, ...safeUser } = user
  return c.json(safeUser)
})

userRoutes.patch(
  "/me",
  zValidator(
    "json",
    z.object({
      name: z.string().min(2).max(50).optional(),
    }),
  ),
  (c) => {
    const userId = c.get("userId")
    const updates = c.req.valid("json")

    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) return c.json({ error: "Not found" }, 404)

    users[index] = { ...users[index], ...updates }
    const { passwordHash, ...safeUser } = users[index]
    return c.json(safeUser)
  },
)

// ---- Admin Routes ----
const adminRoutes = new Hono<{ Variables: Variables }>()
adminRoutes.use("*", authenticate, requireAdmin)

adminRoutes.get("/users", (c) => {
  const { page = "1", limit = "10" } = c.req.query() as any
  const p = parseInt(page),
    l = parseInt(limit)
  const start = (p - 1) * l

  const safeUsers = users
    .slice(start, start + l)
    .map(({ passwordHash, ...u }) => u)

  return c.json({
    data: safeUsers,
    meta: {
      page: p,
      limit: l,
      total: users.length,
      totalPages: Math.ceil(users.length / l),
    },
  })
})

// ---- Register All Routes ----
app.get("/health", (c) =>
  c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
)

app.route("/auth", auth)
app.route("/users", userRoutes)
app.route("/admin", adminRoutes)

// ---- Error Handling ----
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  console.error("Unhandled error:", err)
  return c.json(
    {
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
    500,
  )
})

app.notFound((c) =>
  c.json(
    {
      error: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404,
  ),
)

export default app
```

---

## Quick Reference Card

### Common Patterns Cheatsheet

```typescript
// ===== HONO CHEATSHEET =====

// 1. Send responses
c.json(data) // { "key": "val" }
c.text("hello") // plain text
c.html("<h1>Hi</h1>") // HTML
c.redirect("/path") // 302 redirect
c.notFound() // 404

// 2. Read request
c.req.param("id") // URL param
c.req.query("page") // ?page=1
c.req.header("Authorization") // Header value
await c.req.json() // Parse JSON body
await c.req.formData() // Parse form

// 3. Context variables
c.set("key", value) // Set
c.get("key") // Get

// 4. Chain routes
const router = new Hono()
router.get("/", handler)
app.route("/prefix", router)

// 5. Auth pattern
const token = c.req.header("Authorization")?.slice(7)
const payload = await verify(token, SECRET)
c.set("userId", payload.sub)

// 6. Error throwing
throw new HTTPException(404, { message: "Not found" })

// 7. Typed app
const app = new Hono<{
  Variables: { userId: string }
  Bindings: { JWT_SECRET: string }
}>()

// 8. Validate input
app.post("/route", zValidator("json", schema), handler)
const data = c.req.valid("json") // Typed!

// 9. Multiple middleware
app.get("/route", mw1, mw2, mw3, handler)

// 10. Environment
c.env.MY_SECRET // CF Workers
process.env.MY_SECRET // Node.js
```

---

## Further Learning

- **Official Docs**: https://hono.dev
- **GitHub**: https://github.com/honojs/hono
- **Examples**: https://github.com/honojs/examples
- **Middleware**: https://github.com/honojs/middleware

### Key Concepts to Master After This Guide

1. Edge computing fundamentals (Cloudflare Workers model)
2. Web Streams API (for streaming responses)
3. OAuth2 / OpenID Connect (Google, GitHub auth)
4. Database migrations (Drizzle Kit / Prisma Migrate)
5. Message queues (BullMQ, Cloudflare Queues)
6. Microservices patterns (service mesh, circuit breaker)
7. OpenAPI spec generation with Hono (using `@hono/zod-openapi`)
8. gRPC with Hono (using Connect protocol)

---

_This guide was written for senior-level understanding. Every concept here is production-proven._
_Last updated: 2025_
