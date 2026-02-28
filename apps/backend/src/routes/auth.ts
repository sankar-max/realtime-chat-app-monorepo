import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { env, config } from "@chat/config"
import { loginSchema } from "@chat/schema"

const authRouter = new Hono()

authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")

  // Example: Use env validation for JWT secret (validated by t3-env)
  const secret = env.JWT_SECRET

  // TODO: actual DB verify and JWT sign here
  return c.json({
    success: true,
    message: "Login successful",
    token: "placeholder_token",
    debug: config.isDev ? { secretSet: !!secret } : undefined,
  })
})

export default authRouter
