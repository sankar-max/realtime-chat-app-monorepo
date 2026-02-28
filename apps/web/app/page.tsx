"use client"
import { userSchema, z } from "@chat/schema"

function Page() {
  const newSchema = z.object({
    phoneNumber: z.number().min(10).max(15),
  })
  // Let's test the schema!
  const testData = { name: "A", email: "not-an-email" }
  const sankarNumber = { phoneNumber: 11 }
  const validationResult = userSchema.safeParse(testData)
  const validationResult2 = newSchema.safeParse(sankarNumber)
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Web Frontend</h1>
      <p>
        Testing Shared Zod Schema from <code>@chat/schema</code>
      </p>

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#f1f1f1",
          borderRadius: "8px",
        }}
      >
        <h3>Validation Result Component</h3>
        <p>
          <strong>Input:</strong> {JSON.stringify(testData)}
        </p>
        <p>
          <strong>Is Valid:</strong>{" "}
          {validationResult.success ? "Yes! ✅" : "No! ❌"}
        </p>
        {/* 
        {!validationResult.success && (
          <pre style={{ color: "red" }}>
            {JSON.stringify(validationResult.error.format(), null, 2)}
          </pre>
        )} */}
        <p style={{ color: "red" }}>
          {JSON.stringify(validationResult2, null, 2)}
        </p>
      </div>
    </div>
  )
}

export default Page
